// FramePlayer: draws a pre-rendered frame sequence on a 2D canvas, scrubbed by a 0..1 progress.
// Production port of spikes/s3-beat1/frameplayer.js (DIRECTION 13, plan step 6, gate G3).
//
// Windowed loading as on unitedcarriers.com: only frames within `radius` of the playhead are
// kept, at most `concurrency` requests in flight, nearest first and biased in the direction of
// travel. Loads that fall out of the window are aborted, so a fast scrub spends no bytes on frames
// it has passed. A frame is drawable only when every layer has decoded; until the playhead's frame
// is ready the nearest decoded frame is drawn, and the canvas is never cleared without a
// replacement, so a fast scrub never shows a blank canvas.
//
// Over the spike: direction-biased order, aborts, bounded retries, dispose(), and an injected
// loader and canvas so the windowing logic is tested in node (FramePlayer.test.ts).

export interface Drawable {
  close(): void;
}

export interface Ctx2D {
  clearRect(x: number, y: number, w: number, h: number): void;
  drawImage(image: never, dx: number, dy: number, dw: number, dh: number): void;
}

export interface CanvasLike {
  width: number;
  height: number;
  getContext(type: "2d"): Ctx2D | null;
}

export interface Loaded<B extends Drawable> {
  bitmap: B;
  bytes: number;
}

export type FrameLoader<B extends Drawable> = (url: string, signal: AbortSignal) => Promise<Loaded<B>>;

export interface FramePlayerOptions<B extends Drawable> {
  count: number;
  /** URL of frame `i` (0-based) for one layer. */
  url: (i: number, layer: string) => string;
  /** Layers drawn bottom to top, e.g. ["shadow", "plate"]. */
  layers?: string[];
  radius?: number;
  concurrency?: number;
  /** Attempts per frame before it is skipped (the nearest decoded frame stands in). */
  attempts?: number;
  loader?: FrameLoader<B>;
}

export interface FramePlayerStats {
  loaded: number;
  bytes: number;
  /** draw() calls where the playhead's own frame was not decoded yet. */
  misses: number;
  /** draw() calls that had nothing at all to draw. Zero after the first decoded frame. */
  empty: number;
  aborted: number;
  failed: number;
}

/** Browser loader: fetch plus createImageBitmap, decoded off the main thread. */
export const fetchBitmap: FrameLoader<ImageBitmap> = async (url, signal) => {
  const r = await fetch(url, { signal });
  if (!r.ok) throw new Error(`frame ${url}: HTTP ${r.status}`);
  const blob = await r.blob();
  return { bitmap: await createImageBitmap(blob), bytes: blob.size };
};

interface Inflight {
  ctrl: AbortController;
}

export class FramePlayer<B extends Drawable = ImageBitmap> {
  readonly count: number;
  readonly stats: FramePlayerStats = { loaded: 0, bytes: 0, misses: 0, empty: 0, aborted: 0, failed: 0 };
  private readonly canvas: CanvasLike;
  private readonly ctx: Ctx2D;
  private readonly url: (i: number, layer: string) => string;
  private readonly layers: string[];
  private readonly radius: number;
  private readonly concurrency: number;
  private readonly attempts: number;
  private readonly loader: FrameLoader<B>;
  private readonly cache = new Map<number, B[]>();
  private readonly inflight = new Map<number, Inflight>();
  private readonly tries = new Map<number, number>();
  private head = -1; // -1: the first seek always pumps
  private dir = 1;
  private drawn = -1;
  private disposed = false;

  constructor(canvas: CanvasLike, opts: FramePlayerOptions<B>) {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("FramePlayer: no 2D context");
    if (!(opts.count > 0)) throw new Error("FramePlayer: count must be positive");
    this.canvas = canvas;
    this.ctx = ctx;
    this.count = opts.count;
    this.url = opts.url;
    this.layers = opts.layers ?? [""];
    this.radius = opts.radius ?? 6;
    this.concurrency = opts.concurrency ?? 6;
    this.attempts = opts.attempts ?? 2;
    this.loader = opts.loader ?? (fetchBitmap as unknown as FrameLoader<B>);
  }

  /** Frame index the playhead is on. */
  get index(): number {
    return this.head;
  }

  /** Frame index currently on the canvas, or -1. */
  get shown(): number {
    return this.drawn;
  }

  get cached(): number {
    return this.cache.size;
  }

  get pending(): number {
    return this.inflight.size;
  }

  has(i: number): boolean {
    return this.cache.has(i);
  }

  /** Move the playhead to progress p in [0, 1]; returns the frame index. */
  seek(p: number): number {
    const q = Number.isFinite(p) ? Math.min(1, Math.max(0, p)) : 0;
    const i = Math.round(q * (this.count - 1));
    if (i !== this.head) {
      if (this.head >= 0) this.dir = i > this.head ? 1 : -1;
      this.head = i;
      this.pump();
    }
    return i;
  }

  /**
   * Draw the playhead's frame, or the nearest decoded one. Returns the index drawn (or already
   * on the canvas), or -1 when nothing has decoded yet. Never clears without drawing.
   */
  draw(force = false): number {
    if (this.disposed || this.head < 0) return -1;
    let i = this.head;
    if (!this.cache.has(i)) {
      this.stats.misses++;
      i = this.nearest();
      if (i < 0) {
        if (this.drawn < 0) this.stats.empty++;
        return this.drawn;
      }
    }
    if (i === this.drawn && !force) return i;
    const { width: w, height: h } = this.canvas;
    this.ctx.clearRect(0, 0, w, h);
    for (const b of this.cache.get(i)!) this.ctx.drawImage(b as never, 0, 0, w, h);
    this.drawn = i;
    return i;
  }

  dispose(): void {
    this.disposed = true;
    for (const f of this.inflight.values()) f.ctrl.abort();
    this.inflight.clear();
    for (const bms of this.cache.values()) bms.forEach((b) => b.close());
    this.cache.clear();
  }

  private inWindow(i: number, slack = 0): boolean {
    return Math.abs(i - this.head) <= this.radius + slack;
  }

  private nearest(): number {
    let best = -1;
    for (const k of this.cache.keys()) {
      const d = Math.abs(k - this.head), bd = Math.abs(best - this.head);
      // ties go to the frame ahead in the direction of travel
      if (best < 0 || d < bd || (d === bd && (k - this.head) * this.dir > 0)) best = k;
    }
    return best;
  }

  private pump(): void {
    if (this.disposed) return;
    for (const [i, bms] of this.cache) {
      if (!this.inWindow(i)) {
        bms.forEach((b) => b.close());
        this.cache.delete(i);
      }
    }
    for (const i of [...this.inflight.keys()]) if (!this.inWindow(i, 2)) this.cancel(i);
    // the playhead's own frame never queues behind prefetch: pre-empt the farthest load
    const h = this.head;
    if (!this.cache.has(h) && !this.inflight.has(h) && this.inflight.size >= this.concurrency
        && (this.tries.get(h) ?? 0) < this.attempts) {
      let far = -1;
      for (const i of this.inflight.keys()) if (far < 0 || Math.abs(i - h) > Math.abs(far - h)) far = i;
      if (far >= 0) this.cancel(far);
    }
    for (let d = 0; d <= this.radius; d++) {
      for (const i of d ? [this.head + d * this.dir, this.head - d * this.dir] : [this.head]) {
        if (this.inflight.size >= this.concurrency) return;
        if (i < 0 || i >= this.count || this.cache.has(i) || this.inflight.has(i)) continue;
        if ((this.tries.get(i) ?? 0) >= this.attempts) continue;
        this.load(i);
      }
    }
  }

  private cancel(i: number): void {
    const f = this.inflight.get(i);
    if (!f) return;
    f.ctrl.abort();
    this.inflight.delete(i);
    this.tries.set(i, (this.tries.get(i) ?? 1) - 1); // an abort is not a failed attempt
    this.stats.aborted++;
  }

  private load(i: number): void {
    const ctrl = new AbortController();
    const entry: Inflight = { ctrl };
    this.inflight.set(i, entry);
    this.tries.set(i, (this.tries.get(i) ?? 0) + 1);
    const jobs = this.layers.map((l) => this.loader(this.url(i, l), ctrl.signal));
    Promise.allSettled(jobs).then((rs) => {
      const ok = rs.every((r) => r.status === "fulfilled");
      const bms = rs.flatMap((r) => (r.status === "fulfilled" ? [r.value.bitmap] : []));
      for (const r of rs) if (r.status === "fulfilled") this.stats.bytes += r.value.bytes;
      const current = this.inflight.get(i) === entry;
      if (current) this.inflight.delete(i);
      if (!ok || !current || this.disposed || !this.inWindow(i, 2)) {
        bms.forEach((b) => b.close());
        if (!ok && !ctrl.signal.aborted) this.stats.failed++;
      } else {
        this.cache.set(i, bms);
        this.tries.delete(i);
        this.stats.loaded++;
        // redraw when this frame is closer to the playhead than what is on screen
        if (this.drawn < 0 || Math.abs(i - this.head) < Math.abs(this.drawn - this.head)) this.draw();
      }
      this.pump();
    });
  }
}
