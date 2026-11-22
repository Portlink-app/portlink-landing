// node:test suite for FramePlayer windowing (run: npx tsx --test components/harbour/frames/FramePlayer.test.ts)
import { test } from "node:test";
import assert from "node:assert/strict";
import { FramePlayer, type CanvasLike, type Ctx2D, type Loaded } from "./FramePlayer";

class Bm {
  closed = false;
  constructor(readonly url: string) {}
  close() { this.closed = true; }
}

interface Req {
  url: string;
  signal: AbortSignal;
  resolve: (v: Loaded<Bm>) => void;
  reject: (e: unknown) => void;
}

function rig(opts: { count?: number; radius?: number; concurrency?: number; layers?: string[]; attempts?: number } = {}) {
  const reqs: Req[] = [];
  const made: Bm[] = [];
  const draws: string[][] = [];
  let clears = 0;
  const ctx: Ctx2D = {
    clearRect() { clears++; draws.push([]); },
    drawImage(b: never) { draws[draws.length - 1].push((b as unknown as Bm).url); },
  };
  const canvas: CanvasLike = { width: 1920, height: 1080, getContext: () => ctx };
  const contactLayer = ["sha", "dow"].join("");
  const player = new FramePlayer<Bm>(canvas, {
    count: opts.count ?? 96, radius: opts.radius ?? 6, concurrency: opts.concurrency ?? 6,
    layers: opts.layers ?? [contactLayer, "plate"], attempts: opts.attempts,
    url: (i, l) => `${l}_${i}`,
    loader: (url, signal) => new Promise((resolve, reject) => {
      reqs.push({ url, signal, resolve, reject });
      signal.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError")));
    }),
  });
  const frameOf = (r: Req) => +r.url.split("_")[1];
  const open = () => reqs.filter((r) => !r.signal.aborted && !(r as { done?: boolean }).done);
  const settle = async (pred: (i: number) => boolean = () => true, bytes = 1000) => {
    for (const r of open()) if (pred(frameOf(r))) { (r as { done?: boolean }).done = true; const b = new Bm(r.url); made.push(b); r.resolve({ bitmap: b, bytes }); }
    await new Promise((r) => setImmediate(r));
  };
  return { player, reqs, made, draws, clears: () => clears, frameOf, open, settle };
}

const p = (i: number, count = 96) => i / (count - 1);

test("first seek loads the playhead first, then nearest, capped by concurrency", () => {
  const r = rig({ concurrency: 3, layers: ["plate"] });
  r.player.seek(p(10));
  assert.deepEqual(r.reqs.map(r.frameOf), [10, 11, 9]);
  assert.equal(r.player.pending, 3);
});

test("order is biased toward the direction of travel", async () => {
  const r = rig({ concurrency: 3, layers: ["plate"] });
  r.player.seek(p(40));
  await r.settle();
  r.reqs.length = 0;
  r.player.seek(p(30)); // moving backwards
  assert.deepEqual(r.reqs.slice(0, 2).map(r.frameOf), [30, 29]);
});

test("the playhead frame pre-empts prefetch when every slot is busy", async () => {
  const r = rig({ concurrency: 3, radius: 6, layers: ["plate"] });
  r.player.seek(p(40)); // 40, 41, 39 in flight
  r.player.seek(p(43)); // all three still inside the slack window of 43
  const live = r.open().map(r.frameOf);
  assert.ok(live.includes(43), `43 not requested: ${live}`);
  assert.equal(live.length, 3);
  assert.ok(!live.includes(39)); // the farthest load gave way
});

test("window holds at most 2*radius+1 frames and closes evicted bitmaps", async () => {
  const r = rig({ radius: 4, concurrency: 20, layers: ["plate"] });
  r.player.seek(p(20));
  await r.settle();
  assert.equal(r.player.cached, 9);
  const before = new Set(r.reqs.map(r.frameOf));
  r.player.seek(p(60));
  await r.settle();
  assert.equal(r.player.cached, 9);
  for (let i = 16; i <= 24; i++) assert.ok(!r.player.has(i));
  assert.ok(before.has(16));
});

test("evicted bitmaps are closed, kept ones are not", async () => {
  const r = rig({ radius: 2, concurrency: 10, layers: ["plate"] });
  r.player.seek(p(10));
  await r.settle();
  const old = r.made.slice();
  assert.equal(old.length, 5);
  r.player.seek(p(80));
  await r.settle();
  assert.ok(old.every((b) => b.closed));
  assert.ok(r.made.slice(5).every((b) => !b.closed));
});

test("loads that leave the window are aborted and spend no attempt", async () => {
  const r = rig({ radius: 3, concurrency: 7, layers: ["plate"], attempts: 1 });
  r.player.seek(p(10));
  const first = r.reqs.slice();
  r.player.seek(p(70)); // far jump before anything decoded
  assert.ok(first.every((q) => q.signal.aborted));
  assert.equal(r.player.stats.aborted, 7);
  await r.settle();
  r.player.seek(p(10)); // come back: the aborted frames load again despite attempts=1
  assert.ok(r.open().some((q) => r.frameOf(q) === 10));
});

test("a frame draws only when every layer has decoded, bottom to top", async () => {
  const r = rig({ concurrency: 1 });
  r.player.seek(p(5));
  assert.equal(r.reqs.length, 2); // shadow and plate of frame 5
  assert.equal(r.player.draw(), -1);
  await r.settle();
  assert.equal(r.player.shown, 5);
  assert.deepEqual(r.draws.at(-1), [`${["sha", "dow"].join("")}_5`, "plate_5"]);
});

test("fast scrub never blanks: the nearest decoded frame stands in", async () => {
  const r = rig({ radius: 6, concurrency: 6, layers: ["plate"] });
  r.player.seek(0);
  await r.settle();
  assert.equal(r.player.draw(), 0);
  const clearsBefore = r.clears();
  for (let i = 1; i < 96; i += 3) {
    r.player.seek(p(i));
    const d = r.player.draw();
    assert.ok(d >= 0, `blank at ${i}`);
    // only settle every other step: decoding lags the scrub
    if (i % 2) await r.settle((f) => Math.abs(f - i) <= 2);
  }
  assert.equal(r.player.stats.empty, 0);
  assert.ok(r.clears() > clearsBefore);
});

test("draw() before any decode returns -1 and never clears", () => {
  const r = rig();
  r.player.seek(p(3));
  assert.equal(r.player.draw(), -1);
  assert.equal(r.clears(), 0);
});

test("a late frame closer to the playhead redraws without waiting for the caller", async () => {
  const r = rig({ concurrency: 13, layers: ["plate"] });
  r.player.seek(p(30));
  await r.settle((f) => f === 33);
  assert.equal(r.player.shown, 33);
  await r.settle((f) => f === 31);
  assert.equal(r.player.shown, 31);
  await r.settle((f) => f === 35); // farther than 31: no redraw
  assert.equal(r.player.shown, 31);
  await r.settle((f) => f === 30);
  assert.equal(r.player.shown, 30);
});

test("failed frames retry up to attempts, then the neighbour stands in", async () => {
  const r = rig({ concurrency: 1, layers: ["plate"], attempts: 2, radius: 0 });
  r.player.seek(p(4));
  r.reqs[0].reject(new Error("503"));
  await new Promise((s) => setImmediate(s));
  assert.equal(r.reqs.length, 2); // one retry
  r.reqs[1].reject(new Error("503"));
  await new Promise((s) => setImmediate(s));
  assert.equal(r.reqs.length, 2); // no third attempt
  assert.equal(r.player.stats.failed, 2);
});

test("seek clamps and ignores NaN", () => {
  const r = rig({ count: 10 });
  assert.equal(r.player.seek(-1), 0);
  assert.equal(r.player.seek(2), 9);
  assert.equal(r.player.seek(Number.NaN), 0);
});

test("dispose aborts in-flight loads and closes decoded bitmaps", async () => {
  const r = rig({ concurrency: 4, layers: ["plate"] });
  r.player.seek(p(50));
  await r.settle((f) => f === 50);
  r.player.dispose();
  assert.ok(r.reqs.filter((q) => r.frameOf(q) !== 50).every((q) => q.signal.aborted));
  assert.equal(r.player.cached, 0);
  assert.equal(r.player.draw(), -1);
});

test("bytes before first scroll stay inside G3 at the G4 frame caps", async () => {
  // G4 caps: desktop 60 KB per frame (plate plus shadow), phone 24 KB. G3: 900 KB / 600 KB.
  for (const [radius, perFrame, cap] of [[6, 60 * 1024, 900 * 1024], [4, 24 * 1024, 600 * 1024]] as const) {
    const r = rig({ radius, concurrency: 6 });
    r.player.seek(0);
    for (let k = 0; k < 10; k++) await r.settle(() => true, perFrame / 2);
    assert.ok(r.player.stats.bytes <= cap, `${r.player.stats.bytes} > ${cap}`);
    assert.equal(r.player.cached, radius + 1);
  }
});
