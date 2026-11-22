// FramePlayer: draws a pre-rendered frame sequence on a 2D canvas, scrubbed by a 0..1 progress.
// Windowed loading as on unitedcarriers.com: only frames within RADIUS of the playhead are kept,
// at most CONCURRENCY requests in flight, nearest frames first. A missing frame draws the nearest
// decoded one, so a fast scrub never shows a blank canvas.
export class FramePlayer {
  constructor(canvas, { count, url, layers = [""], radius = 6, concurrency = 6, fit }) {
    this.cv = canvas; this.ctx = canvas.getContext("2d");
    this.count = count; this.url = url; this.layers = layers;
    this.radius = radius; this.concurrency = concurrency; this.fit = fit;
    this.cache = new Map(); // frame -> array of ImageBitmap per layer
    this.pending = new Set(); this.inflight = 0; this.head = -1; this.drawn = -1; // -1: first seek always pumps
    this.stats = { loaded: 0, bytes: 0, misses: 0 };
  }
  async loadFrame(i) {
    this.pending.add(i); this.inflight++;
    try {
      const bms = await Promise.all(this.layers.map(async (l) => {
        const r = await fetch(this.url(i, l));
        const b = await r.blob(); this.stats.bytes += b.size;
        return createImageBitmap(b);
      }));
      if (Math.abs(i - this.head) <= this.radius + 2) { this.cache.set(i, bms); this.stats.loaded++; }
      else bms.forEach((b) => b.close());
    } finally { this.pending.delete(i); this.inflight--; this.pump(); if (i === this.head) this.draw(true); }
  }
  pump() {
    for (const [i, bms] of this.cache) if (Math.abs(i - this.head) > this.radius) { bms.forEach((b) => b.close()); this.cache.delete(i); }
    for (let d = 0; d <= this.radius && this.inflight < this.concurrency; d++) {
      for (const i of d ? [this.head + d, this.head - d] : [this.head]) {
        if (i < 0 || i >= this.count || this.cache.has(i) || this.pending.has(i)) continue;
        if (this.inflight >= this.concurrency) return;
        this.loadFrame(i);
      }
    }
  }
  seek(p) {
    const i = Math.max(0, Math.min(this.count - 1, Math.round(p * (this.count - 1))));
    if (i !== this.head) { this.head = i; this.pump(); }
    return i;
  }
  draw(force) {
    let i = this.head;
    if (!this.cache.has(i)) {
      this.stats.misses++;
      let best = -1;
      for (const k of this.cache.keys()) if (best < 0 || Math.abs(k - this.head) < Math.abs(best - this.head)) best = k;
      if (best < 0) return -1; i = best;
    }
    if (i === this.drawn && !force) return i;
    const { width: w, height: h } = this.cv;
    this.ctx.clearRect(0, 0, w, h);
    for (const b of this.cache.get(i)) this.ctx.drawImage(b, 0, 0, w, h);
    this.drawn = i; return i;
  }
}
