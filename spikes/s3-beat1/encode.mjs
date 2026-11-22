// Encode a beat 1 render folder to AVIF for the spike: plate at the delivery size, shadow at half.
// node spikes/s3-beat1/encode.mjs <render_dir> <out_dir> <plate_w> <plate_h>
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";
const [src, out, W, H] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const files = fs.readdirSync(src).filter((f) => /^(plate|shadow)_\d{4}\.png$/.test(f)).sort();
const sizes = { plate: [], shadow: [] };
for (const f of files) {
  const kind = f.startsWith("plate") ? "plate" : "shadow";
  const w = kind === "plate" ? +W : Math.round(W / 2), h = kind === "plate" ? +H : Math.round(H / 2);
  const o = path.join(out, f.replace(".png", ".avif"));
  await sharp(path.join(src, f)).resize(w, h).avif({ quality: kind === "plate" ? 55 : 40, effort: 6, chromaSubsampling: "4:2:0" }).toFile(o);
  sizes[kind].push(fs.statSync(o).size);
}
const cam = JSON.parse(fs.readFileSync(path.join(src, "camera.json"), "utf8"));
fs.writeFileSync(path.join(out, "camera.json"), JSON.stringify(cam));
const kb = (a) => a.length ? +(a.reduce((x, y) => x + y, 0) / a.length / 1024).toFixed(1) : 0;
const sum = (a) => +(a.reduce((x, y) => x + y, 0) / 1048576).toFixed(2);
console.log(JSON.stringify({ frames: sizes.plate.length, plate_avg_kb: kb(sizes.plate), shadow_avg_kb: kb(sizes.shadow),
  plate_max_kb: +(Math.max(...sizes.plate) / 1024).toFixed(1), total_mb: sum([...sizes.plate, ...sizes.shadow]) }));
