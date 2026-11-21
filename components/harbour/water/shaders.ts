// GLSL ES 3.00 for the live water, ported line for line from spikes/s3-beat1/ocean.js (three.js
// ShaderMaterial). Changes are mechanical only: texture2D to texture, varyings to in/out, an
// explicit linear-to-sRGB step where three.js injected <colorspace_fragment>.

export const SIM_VS = `#version 300 es
in vec2 aPos; out vec2 vUv;
void main(){ vUv = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0., 1.); }`

// Wave-equation wake in the ship's frame (r: height, g: previous height, b: foam).
export const SIM_FS = `#version 300 es
precision highp float;
uniform sampler2D uPrev; uniform vec2 uTexel, uShip, uShipSize; uniform float uAdv, uC2, uInject, uFoamGain, uMove;
in vec2 vUv; out vec4 o;
void main(){
  vec2 s = vUv + vec2(uAdv, 0.);
  vec4 c = texture(uPrev, s);
  float h = c.r, hp = c.g;
  float n = texture(uPrev, s + vec2(uTexel.x, 0.)).r + texture(uPrev, s - vec2(uTexel.x, 0.)).r
          + texture(uPrev, s + vec2(0., uTexel.y)).r + texture(uPrev, s - vec2(0., uTexel.y)).r;
  float hn = (2. * h - hp + uC2 * (n - 4. * h)) * 0.995;
  vec2 e = (vUv - uShip) / (uShipSize * 0.5);
  e.y /= mix(1., 0.25, smoothstep(0.55, 1., e.x));
  float inside = 1. - smoothstep(0.75, 1.0, length(e));
  float bow = smoothstep(0.3, 1.0, e.x), stern = smoothstep(-0.6, -1.0, e.x);
  hn += inside * (0.9 * bow - 0.5 * stern) * uInject * uMove;
  float slope = abs(n * 0.25 - h);
  float foam = max(c.b * 0.9995, clamp(slope * uFoamGain + inside * (bow + stern) * 0.5 * uMove, 0., 1.));
  vec2 edge = smoothstep(0., 0.05, vUv) * smoothstep(0., 0.05, 1. - vUv);
  o = vec4(hn * edge.x * edge.y, h * edge.x * edge.y, foam * edge.x * edge.y, 1.);
}`

// Gerstner swell on a 3 km grid packed toward the ship, plus the wake height and gradient.
export const OCEAN_VS = `#version 300 es
uniform mat4 uViewProj;
uniform float uTime, uSimSize, uTexel; uniform sampler2D uWake; uniform vec2 uShipPos, uShipUv;
in vec2 aPos;
out vec3 vWorld; out vec3 vNormal; out float vFoam; out vec2 vWakeGrad;
vec3 gerstner(vec2 p, vec2 dir, float steep, float wl, inout vec3 t, inout vec3 b){
  float k = 6.2831853 / wl; float c = sqrt(9.8 / k); vec2 d = normalize(dir);
  float f = k * (dot(d, p) - c * uTime); float a = steep / k;
  t += vec3(-d.x*d.x*steep*sin(f), d.x*steep*cos(f), -d.x*d.y*steep*sin(f));
  b += vec3(-d.x*d.y*steep*sin(f), d.y*steep*cos(f), -d.y*d.y*steep*sin(f));
  return vec3(d.x*a*cos(f), a*sin(f), d.y*a*cos(f));
}
void main(){
  vec2 u = aPos / 1500.;
  vec2 m = sign(u) * pow(abs(u), vec2(2.2)) * 1500.;
  vec3 p = vec3(m.x + uShipPos.x, 0., -m.y);
  vec3 t = vec3(1., 0., 0.), b = vec3(0., 0., 1.), g = p;
  g += gerstner(p.xz, vec2(1.0, 0.35), 0.09, 70., t, b);
  g += gerstner(p.xz, vec2(0.6, 1.0), 0.07, 38., t, b);
  g += gerstner(p.xz, vec2(-0.4, 0.9), 0.05, 17., t, b);
  g += gerstner(p.xz, vec2(0.9, -0.5), 0.04, 8.5, t, b);
  vec2 suv = (p.xz - uShipPos) / uSimSize + uShipUv;
  float inSim = step(0., suv.x) * step(suv.x, 1.) * step(0., suv.y) * step(suv.y, 1.);
  vec4 w = texture(uWake, suv) * inSim;
  float hx = (texture(uWake, suv + vec2(uTexel, 0.)).r - texture(uWake, suv - vec2(uTexel, 0.)).r) * inSim;
  float hz = (texture(uWake, suv + vec2(0., uTexel)).r - texture(uWake, suv - vec2(0., uTexel)).r) * inSim;
  g.y += w.r * 1.2;
  vWakeGrad = vec2(hx, hz) * 1.2 / (2. * uSimSize * uTexel);
  vFoam = w.b; vNormal = normalize(cross(b, t)); vWorld = g;
  gl_Position = uViewProj * vec4(g, 1.);
}`

export const OCEAN_FS = `#version 300 es
precision highp float;
uniform vec3 uNavy, uSun, uCold, uSunDir, uCam; uniform float uGlint;
in vec3 vWorld; in vec3 vNormal; in float vFoam; in vec2 vWakeGrad;
out vec4 o;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vnoise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f);
  return mix(mix(hash(i), hash(i + vec2(1., 0.)), f.x), mix(hash(i + vec2(0., 1.)), hash(i + vec2(1., 1.)), f.x), f.y); }
vec3 toSrgb(vec3 c){ return mix(c * 12.92, pow(c, vec3(0.41666)) * 1.055 - 0.055, step(0.0031308, c)); }
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
  o = vec4(toSrgb(col), 1.);
}`
