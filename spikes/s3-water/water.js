// S3 live-water spike. A Gerstner ocean whose surface also carries a GPU wake
// height field. The wake is a damped wave equation on a ping-pong render target,
// excited by a moving hull footprint (the ship-position uniform, the OceanX method).
// Query: ?seg=256 mesh segments, ?sim=256 wake grid, ?dpr=1.5 pixel-ratio cap,
// ?hull=0 hides the proxy hull. window.__fps holds the measurement after warmup.
import * as THREE from "three";

const q = new URLSearchParams(location.search);
const SEG = Number(q.get("seg") || 256);
const SIM = Number(q.get("sim") || 256);
const DPR = Math.min(window.devicePixelRatio || 1, Number(q.get("dpr") || 1.5));
const SIM_SIZE = 80; // world metres covered by the wake grid, centred on origin

const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: "high-performance" });
renderer.setPixelRatio(DPR);
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

const NAVY = new THREE.Color("#0a2342");
const SUN = new THREE.Color("#f5b53d");
const COLD = new THREE.Color("#4f7db8");

const scene = new THREE.Scene();
scene.background = NAVY.clone();

// 50 mm lens on a full-frame sensor: vertical fov 2 * atan(12 / 50) = 27 degrees.
const camera = new THREE.PerspectiveCamera(27, innerWidth / innerHeight, 0.5, 2000);
function frameCamera() {
  const portrait = innerWidth / innerHeight < 1;
  camera.aspect = innerWidth / innerHeight;
  camera.fov = portrait ? 40 : 27; // mobile keeps the hull in frame at the same distance
  if (q.get("top")) { camera.fov = 60; camera.position.set(0, 75, 0.01); }
  else camera.position.set(-58, 19, 88);
  camera.lookAt(0, 0, 0);
  camera.updateProjectionMatrix();
}
frameCamera();

// ---------- wake simulation ----------
const rtOpts = {
  type: THREE.HalfFloatType, format: THREE.RGBAFormat,
  minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter,
  wrapS: THREE.ClampToEdgeWrapping, wrapT: THREE.ClampToEdgeWrapping,
  depthBuffer: false,
};
let rtA = new THREE.WebGLRenderTarget(SIM, SIM, rtOpts);
let rtB = new THREE.WebGLRenderTarget(SIM, SIM, rtOpts);
const simCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
const simMat = new THREE.ShaderMaterial({
  uniforms: {
    uPrev: { value: null },
    uTexel: { value: new THREE.Vector2(1 / SIM, 1 / SIM) },
    uShip: { value: new THREE.Vector4(0, 0, 1, 0) }, // x, z in sim uv, heading cos, sin
    uShipSize: { value: new THREE.Vector2(26 / SIM_SIZE, 4.5 / SIM_SIZE) }, // length, beam
    uSpeed: { value: 0 },
    uInject: { value: Number(q.get("inj") || 0.012) },
    uFoamGain: { value: Number(q.get("fg") || 22) },
    uC2: { value: Number(q.get("c2") || 0.003) },
  },
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }`,
  fragmentShader: `
    precision highp float;
    uniform sampler2D uPrev; uniform vec2 uTexel; uniform vec4 uShip; uniform vec2 uShipSize; uniform float uSpeed; uniform float uC2; uniform float uFoamGain; uniform float uInject;
    varying vec2 vUv;
    void main(){
      vec4 c = texture2D(uPrev, vUv);
      float h = c.r, hp = c.g;
      float n = texture2D(uPrev, vUv + vec2(uTexel.x, 0.)).r + texture2D(uPrev, vUv - vec2(uTexel.x, 0.)).r
              + texture2D(uPrev, vUv + vec2(0., uTexel.y)).r + texture2D(uPrev, vUv - vec2(0., uTexel.y)).r;
      // Wave equation with a slow wave speed (about 2 m/s) so the 6 m/s hull runs at
      // roughly Mach 3 through the field: that is what folds the ripples into a
      // Kelvin-like V of about 20 degrees instead of circular rings.
      float hn = (2. * h - hp + uC2 * (n - 4. * h)) * 0.996;
      // hull footprint in ship-local coordinates
      vec2 d = vUv - uShip.xy;
      vec2 l = vec2(dot(d, uShip.zw), dot(d, vec2(-uShip.w, uShip.z)));
      vec2 e = l / (uShipSize * 0.5);
      float inside = 1. - smoothstep(0.7, 1.0, length(e));
      float bow = smoothstep(0.2, 1.0, e.x);             // bow pushes water up, stern draws it down
      hn += inside * uSpeed * (0.9 * bow - 0.35 * (1. - bow)) * uInject;
      // foam memory in B: decays slowly, fed by slope and hull contact
      float slope = abs(n * 0.25 - h);
      float foam = max(c.b * 0.998, clamp(slope * uFoamGain + inside * uSpeed * 0.6, 0., 1.));
      // fade at the grid edge so the field never reflects back
      vec2 edge = smoothstep(0., 0.06, vUv) * smoothstep(0., 0.06, 1. - vUv);
      gl_FragColor = vec4(hn * edge.x * edge.y, h, foam * edge.x * edge.y, 1.);
    }`,
});
const simQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), simMat);
const simScene = new THREE.Scene();
simScene.add(simQuad);

// ---------- ocean surface ----------
const oceanMat = new THREE.ShaderMaterial({
  uniforms: {
    uTime: { value: 0 },
    uWake: { value: null },
    uSimSize: { value: SIM_SIZE },
    uNavy: { value: NAVY }, uSun: { value: SUN }, uCold: { value: COLD },
    uSunDir: { value: new THREE.Vector3(-0.55, 0.32, -0.77).normalize() }, // low sun, back left
    uCam: { value: camera.position },
    uTexel: { value: 1 / SIM },
  },
  vertexShader: `
    uniform float uTime, uSimSize, uTexel; uniform sampler2D uWake;
    varying vec3 vWorld; varying vec3 vNormal; varying float vFoam; varying vec2 vWakeGrad;
    // Gerstner: direction, steepness, wavelength
    vec3 gerstner(vec2 p, vec2 dir, float steep, float wl, inout vec3 t, inout vec3 b){
      float k = 6.2831853 / wl; float c = sqrt(9.8 / k); vec2 d = normalize(dir);
      float f = k * (dot(d, p) - c * uTime); float a = steep / k;
      t += vec3(-d.x*d.x*steep*sin(f), d.x*steep*cos(f), -d.x*d.y*steep*sin(f));
      b += vec3(-d.x*d.y*steep*sin(f), d.y*steep*cos(f), -d.y*d.y*steep*sin(f));
      return vec3(d.x*a*cos(f), a*sin(f), d.y*a*cos(f));
    }
    void main(){
      // grid density concentrates at the ship: u in [-1, 1] maps to sign(u) * |u|^2.4 * 450 m
      vec2 u = position.xy / 450.;
      vec2 m = sign(u) * pow(abs(u), vec2(2.4)) * 450.;
      vec3 p = vec3(m.x, 0., -m.y);
      vec3 t = vec3(1., 0., 0.), b = vec3(0., 0., 1.);
      vec3 g = p;
      g += gerstner(p.xz, vec2(1.0, 0.35), 0.10, 34., t, b);
      g += gerstner(p.xz, vec2(0.6, 1.0), 0.07, 19., t, b);
      g += gerstner(p.xz, vec2(-0.4, 0.9), 0.05, 9.5, t, b);
      g += gerstner(p.xz, vec2(0.9, -0.5), 0.04, 5.3, t, b);
      vec2 suv = p.xz / uSimSize + 0.5;
      float inSim = step(0., suv.x) * step(suv.x, 1.) * step(0., suv.y) * step(suv.y, 1.);
      vec4 w = texture2D(uWake, suv) * inSim;
      float hx = (texture2D(uWake, suv + vec2(uTexel, 0.)).r - texture2D(uWake, suv - vec2(uTexel, 0.)).r) * inSim;
      float hz = (texture2D(uWake, suv + vec2(0., uTexel)).r - texture2D(uWake, suv - vec2(0., uTexel)).r) * inSim;
      g.y += w.r * 0.45;
      vWakeGrad = vec2(hx, hz) * 0.45 / (2. * uSimSize * uTexel);
      vFoam = w.b;
      vNormal = normalize(cross(b, t));
      vWorld = g;
      gl_Position = projectionMatrix * viewMatrix * vec4(g, 1.);
    }`,
  fragmentShader: `
    precision highp float;
    uniform vec3 uNavy, uSun, uCold, uSunDir, uCam;
    varying vec3 vWorld; varying vec3 vNormal; varying float vFoam; varying vec2 vWakeGrad;
    float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    float vnoise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f);
      return mix(mix(hash(i), hash(i + vec2(1., 0.)), f.x), mix(hash(i + vec2(0., 1.)), hash(i + vec2(1., 1.)), f.x), f.y); }
    void main(){
      vec3 n = normalize(vNormal + vec3(-vWakeGrad.x, 0., -vWakeGrad.y));
      vec3 v = normalize(uCam - vWorld);
      float fres = pow(1. - max(dot(n, v), 0.), 5.) * 0.9 + 0.02;
      vec3 sky = mix(uNavy * 1.6, uCold * 0.55, 0.35);
      vec3 deep = uNavy * 0.55;
      vec3 col = mix(deep, sky, fres);
      vec3 h = normalize(uSunDir + v);
      float spec = pow(max(dot(n, h), 0.), 220.) * 1.6 + pow(max(dot(n, h), 0.), 30.) * 0.08;
      col += uSun * spec;
      col += uCold * pow(max(dot(n, -uSunDir), 0.), 4.) * 0.05; // cold edge fill
      // break the foam field into streaks: two octaves of value noise in world space
      vec2 fp = vWorld.xz * vec2(0.9, 2.2);
      float nz = vnoise(fp) * 0.65 + vnoise(fp * 2.7 + 13.1) * 0.35;
      float foam = smoothstep(0.2, 0.85, vFoam * (0.55 + nz * 0.9)) * smoothstep(0.05, 0.35, vFoam);
      col = mix(col, vec3(0.78, 0.84, 0.92), foam * 0.55);
      float dist = length(vWorld.xz - uCam.xz);
      col = mix(col, uNavy, smoothstep(140., 420., dist)); // horizon dissolves into the field
      gl_FragColor = vec4(col, 1.);
      #include <colorspace_fragment>
    }`,
});
const ocean = new THREE.Mesh(new THREE.PlaneGeometry(900, 900, SEG, SEG), oceanMat);
ocean.frustumCulled = false;
scene.add(ocean);

// placeholder hull so the wake source is visible; the real plate is a 2D canvas layer
const hull = new THREE.Mesh(new THREE.BoxGeometry(26, 6, 4.5), new THREE.MeshBasicMaterial({ color: 0x050d1a }));
hull.position.y = 1.6;
hull.visible = q.get("hull") !== "0";
scene.add(hull);

// ---------- loop and measurement ----------
const hud = document.getElementById("hud");
const clock = new THREE.Clock();
const frameTimes = [];
let last = performance.now();
const WARMUP = 3000, WINDOW = 10000, t0 = performance.now();
window.__fps = null;
window.__dbg = { renderer, get rt() { return rtA; }, SIM };

function step() {
  const now = performance.now();
  const dt = now - last; last = now;
  const t = clock.getElapsedTime();
  // ship sails along x at 6 m/s, ping-ponging across the sim so the field stays continuous
  const span = SIM_SIZE * 0.6, speed = 6;
  const phase = (t * speed) % (2 * span);
  const dir = phase < span ? 1 : -1;
  const x = phase < span ? -span / 2 + phase : span / 2 - (phase - span);
  hull.position.x = x; hull.rotation.y = dir > 0 ? 0 : Math.PI;
  simMat.uniforms.uShip.value.set(x / SIM_SIZE + 0.5, 0.5, dir, 0);
  simMat.uniforms.uSpeed.value = 1;
  // two sim substeps per frame keep the wave speed independent of mesh resolution
  for (let i = 0; i < 2; i++) {
    simMat.uniforms.uPrev.value = rtA.texture;
    renderer.setRenderTarget(rtB);
    renderer.render(simScene, simCam);
    [rtA, rtB] = [rtB, rtA];
  }
  renderer.setRenderTarget(null);
  oceanMat.uniforms.uWake.value = rtA.texture;
  oceanMat.uniforms.uTime.value = t;
  renderer.render(scene, camera);

  const since = now - t0;
  if (since > WARMUP && since < WARMUP + WINDOW) frameTimes.push(dt);
  if (since >= WARMUP + WINDOW && !window.__fps) {
    const sorted = [...frameTimes].sort((a, b) => a - b);
    const mean = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
    window.__fps = {
      fps: +(1000 / mean).toFixed(1),
      p95ms: +sorted[Math.floor(sorted.length * 0.95)].toFixed(1),
      frames: frameTimes.length, seg: SEG, sim: SIM, dpr: DPR,
      w: innerWidth, h: innerHeight,
    };
    hud.textContent = JSON.stringify(window.__fps);
  }
  requestAnimationFrame(step);
}
requestAnimationFrame(step);

addEventListener("resize", () => { renderer.setSize(innerWidth, innerHeight); frameCamera(); });
