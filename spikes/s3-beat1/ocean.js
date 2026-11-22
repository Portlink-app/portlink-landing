// Live water under the beat 1 plates. Same method as spikes/s3-water (Gerstner swell plus a
// wave-equation wake on half-float ping-pong targets), scaled to the real 180 m hull and run in
// the ship's frame: the hull footprint sits still in the sim while the water is advected aft, so
// the ship is always under way and scrubbing backwards never runs the wake in reverse. The
// scroll only moves the ship's world position (uShipPos), taken per frame from camera.json.
import * as THREE from "three";

export function createOcean(canvas, cam, { sim = 256, dpr = 1.5, seg = 256 } = {}) {
  const hull = cam.hull || null, moving = cam.frames > 1 ? 1 : 0;   // a one-frame clip is a moored ship: no bow wave, softer glint
  const SIM_SIZE = 640;          // metres covered by the wake grid; hull forward so the trail has room aft
  const SHIP = [0.78, 0.5];      // hull centre in sim uv (bow toward +x)
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: "high-performance" });
  renderer.setPixelRatio(dpr);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const NAVY = new THREE.Color("#0a2342"), SUN = new THREE.Color("#f5b53d"), COLD = new THREE.Color("#4f7db8");
  const scene = new THREE.Scene(); scene.background = NAVY.clone();

  // camera from the Blender rig: z-up (x, y, z) becomes y-up (x, z, -y)
  const b2t = (v) => new THREE.Vector3(v[0], v[2], -v[1]);
  const half = Math.atan(cam.sensor_mm / 2 / cam.lens_mm);
  const aspect = cam.width / cam.height;
  const vfov = cam.sensor_fit === "VERTICAL" ? 2 * half : 2 * Math.atan(Math.tan(half) / aspect);
  const camera = new THREE.PerspectiveCamera(THREE.MathUtils.radToDeg(vfov), aspect, 1, 6000);
  camera.position.copy(b2t(cam.position)); camera.lookAt(b2t(cam.target)); camera.updateProjectionMatrix();

  const rtOpts = { type: THREE.HalfFloatType, format: THREE.RGBAFormat, minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter, wrapS: THREE.ClampToEdgeWrapping, wrapT: THREE.ClampToEdgeWrapping, depthBuffer: false };
  let rtA = new THREE.WebGLRenderTarget(sim, sim, rtOpts), rtB = new THREE.WebGLRenderTarget(sim, sim, rtOpts);
  const simCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const simMat = new THREE.ShaderMaterial({
    uniforms: {
      uPrev: { value: null }, uTexel: { value: new THREE.Vector2(1 / sim, 1 / sim) },
      uShip: { value: new THREE.Vector2(...SHIP) },
      // footprint from the rig's hull block when present (expedition 150 m); 170x26 fits the 180 m cargo hull
      uShipSize: { value: new THREE.Vector2((hull ? hull.loa_m * 0.95 : 170) / SIM_SIZE, (hull ? hull.beam_m * 1.06 : 26) / SIM_SIZE) },
      uMove: { value: moving },
      uAdv: { value: 0.06 / sim },  // water moves aft 0.06 texel per substep (ship speed, Mach about 3 vs uC2)
      uC2: { value: 0.0004 }, uInject: { value: 0.05 }, uFoamGain: { value: 40 },
    },
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }`,
    fragmentShader: `
      precision highp float;
      uniform sampler2D uPrev; uniform vec2 uTexel, uShip, uShipSize; uniform float uAdv, uC2, uInject, uFoamGain, uMove;
      varying vec2 vUv;
      void main(){
        vec2 s = vUv + vec2(uAdv, 0.);                      // semi-Lagrangian advection: water flows to -x
        vec4 c = texture2D(uPrev, s);
        float h = c.r, hp = c.g;
        float n = texture2D(uPrev, s + vec2(uTexel.x, 0.)).r + texture2D(uPrev, s - vec2(uTexel.x, 0.)).r
                + texture2D(uPrev, s + vec2(0., uTexel.y)).r + texture2D(uPrev, s - vec2(0., uTexel.y)).r;
        float hn = (2. * h - hp + uC2 * (n - 4. * h)) * 0.995;
        vec2 e = (vUv - uShip) / (uShipSize * 0.5);
        e.y /= mix(1., 0.25, smoothstep(0.55, 1., e.x));      // fine bow entry
        float inside = 1. - smoothstep(0.75, 1.0, length(e));
        float bow = smoothstep(0.3, 1.0, e.x), stern = smoothstep(-0.6, -1.0, e.x);
        hn += inside * (0.9 * bow - 0.5 * stern) * uInject * uMove;
        float slope = abs(n * 0.25 - h);
        float foam = max(c.b * 0.9995, clamp(slope * uFoamGain + inside * (bow + stern) * 0.5 * uMove, 0., 1.));
        vec2 edge = smoothstep(0., 0.05, vUv) * smoothstep(0., 0.05, 1. - vUv);
        gl_FragColor = vec4(hn * edge.x * edge.y, h * edge.x * edge.y, foam * edge.x * edge.y, 1.);
      }`,
  });
  const simScene = new THREE.Scene(); simScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), simMat));

  const sunB = new THREE.Vector3(-1, 0.16, -1).normalize(); // the rig's rim sun, y-up
  const oceanMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 }, uWake: { value: null }, uSimSize: { value: SIM_SIZE }, uTexel: { value: 1 / sim },
      uShipPos: { value: new THREE.Vector2(0, 0) }, uShipUv: { value: new THREE.Vector2(...SHIP) },
      uNavy: { value: NAVY }, uSun: { value: moving ? SUN : new THREE.Color("#dfe6ec") }, uCold: { value: COLD }, uSunDir: { value: sunB }, uGlint: { value: moving ? 1 : 0.12 }, uCam: { value: camera.position },
    },
    vertexShader: `
      uniform float uTime, uSimSize, uTexel; uniform sampler2D uWake; uniform vec2 uShipPos, uShipUv;
      varying vec3 vWorld; varying vec3 vNormal; varying float vFoam; varying vec2 vWakeGrad;
      vec3 gerstner(vec2 p, vec2 dir, float steep, float wl, inout vec3 t, inout vec3 b){
        float k = 6.2831853 / wl; float c = sqrt(9.8 / k); vec2 d = normalize(dir);
        float f = k * (dot(d, p) - c * uTime); float a = steep / k;
        t += vec3(-d.x*d.x*steep*sin(f), d.x*steep*cos(f), -d.x*d.y*steep*sin(f));
        b += vec3(-d.x*d.y*steep*sin(f), d.y*steep*cos(f), -d.y*d.y*steep*sin(f));
        return vec3(d.x*a*cos(f), a*sin(f), d.y*a*cos(f));
      }
      void main(){
        vec2 u = position.xy / 1500.;
        vec2 m = sign(u) * pow(abs(u), vec2(2.2)) * 1500.;
        vec3 p = vec3(m.x + uShipPos.x, 0., -m.y);
        vec3 t = vec3(1., 0., 0.), b = vec3(0., 0., 1.), g = p;
        g += gerstner(p.xz, vec2(1.0, 0.35), 0.09, 70., t, b);
        g += gerstner(p.xz, vec2(0.6, 1.0), 0.07, 38., t, b);
        g += gerstner(p.xz, vec2(-0.4, 0.9), 0.05, 17., t, b);
        g += gerstner(p.xz, vec2(0.9, -0.5), 0.04, 8.5, t, b);
        vec2 suv = (p.xz - uShipPos) / uSimSize + uShipUv;
        float inSim = step(0., suv.x) * step(suv.x, 1.) * step(0., suv.y) * step(suv.y, 1.);
        vec4 w = texture2D(uWake, suv) * inSim;
        float hx = (texture2D(uWake, suv + vec2(uTexel, 0.)).r - texture2D(uWake, suv - vec2(uTexel, 0.)).r) * inSim;
        float hz = (texture2D(uWake, suv + vec2(0., uTexel)).r - texture2D(uWake, suv - vec2(0., uTexel)).r) * inSim;
        g.y += w.r * 1.2;
        vWakeGrad = vec2(hx, hz) * 1.2 / (2. * uSimSize * uTexel);
        vFoam = w.b; vNormal = normalize(cross(b, t)); vWorld = g;
        gl_Position = projectionMatrix * viewMatrix * vec4(g, 1.);
      }`,
    fragmentShader: `
      precision highp float;
      uniform vec3 uNavy, uSun, uCold, uSunDir, uCam; uniform float uGlint;
      varying vec3 vWorld; varying vec3 vNormal; varying float vFoam; varying vec2 vWakeGrad;
      float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float vnoise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f);
        return mix(mix(hash(i), hash(i + vec2(1., 0.)), f.x), mix(hash(i + vec2(0., 1.)), hash(i + vec2(1., 1.)), f.x), f.y); }
      void main(){
        vec3 n = normalize(vNormal + vec3(-vWakeGrad.x, 0., -vWakeGrad.y));
        vec3 v = normalize(uCam - vWorld);
        float fres = pow(1. - max(dot(n, v), 0.), 5.) * 0.9 + 0.02;
        vec3 col = mix(uNavy * 0.55, mix(uNavy * 1.6, uCold * 0.55, 0.35), fres);
        vec3 h = normalize(uSunDir + v);
        col += uSun * ((pow(max(dot(n, h), 0.), 400.) * 0.32 + pow(max(dot(n, h), 0.), 60.) * 0.025) * uGlint);
        col += uCold * pow(max(dot(n, -uSunDir), 0.), 4.) * 0.05;
        vec2 fp = vWorld.xz * vec2(0.35, 0.8);
        float nz = vnoise(fp) * 0.65 + vnoise(fp * 2.7 + 13.1) * 0.35;
        float foam = smoothstep(0.2, 0.85, vFoam * (0.55 + nz * 0.9)) * smoothstep(0.05, 0.35, vFoam);
        col = mix(col, vec3(0.78, 0.84, 0.92), foam * 0.6);
        col = mix(col, uNavy, smoothstep(500., 1600., length(vWorld.xz - uCam.xz)));
        gl_FragColor = vec4(col, 1.);
        #include <colorspace_fragment>
      }`,
  });
  const ocean = new THREE.Mesh(new THREE.PlaneGeometry(3000, 3000, seg, seg), oceanMat);
  ocean.frustumCulled = false; scene.add(ocean);

  const t0 = performance.now();
  return {
    renderer, camera,
    resize(w, h) { renderer.setSize(w, h, false); },
    step(shipX) {
      oceanMat.uniforms.uShipPos.value.set(shipX, 0);
      for (let i = 0; i < 3; i++) {
        simMat.uniforms.uPrev.value = rtA.texture;
        renderer.setRenderTarget(rtB); renderer.render(simScene, simCam); [rtA, rtB] = [rtB, rtA];
      }
      renderer.setRenderTarget(null);
      oceanMat.uniforms.uWake.value = rtA.texture;
      oceanMat.uniforms.uTime.value = (performance.now() - t0) / 1000;
      renderer.render(scene, camera);
    },
  };
}
