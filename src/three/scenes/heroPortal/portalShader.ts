/**
 * Portal sphere shader: Earth-616 in black and white (continents and drifting
 * clouds from a packed texture, R = land/sea, G = clouds) with screen-space
 * halftone shading (the site's print texture), a red rim light, and a
 * violet/cyan portal swirl on the face that opens up as the user dives in.
 * Colours are written in display space (Canvas runs `linear flat`).
 */

const simplexNoise3D = /* glsl */ `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 10.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0))
          + i.y + vec4(0.0, i1.y, i2.y, 1.0))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.5 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 105.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

float fbm(vec3 p) {
  float sum = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 4; i++) {
    sum += amp * snoise(p);
    p *= 2.02;
    amp *= 0.5;
  }
  return sum;
}
`

export const portalVertexShader = /* glsl */ `
varying vec3 vNormalView;
varying vec3 vViewDir;
varying vec3 vPosObject;
varying vec2 vUv;

void main() {
  vPosObject = position;
  vUv = uv;
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  vNormalView = normalize(normalMatrix * normal);
  vViewDir = normalize(-mvPosition.xyz);
  gl_Position = projectionMatrix * mvPosition;
}
`

export const portalFragmentShader = /* glsl */ `
uniform float uTime;
uniform float uProgress;
uniform float uDpr;
uniform vec3 uRed;
uniform vec3 uViolet;
uniform vec3 uCyan;
uniform sampler2D uEarth;

varying vec3 vNormalView;
varying vec3 vViewDir;
varying vec3 vPosObject;
varying vec2 vUv;

${simplexNoise3D}

void main() {
  vec3 n = normalize(vNormalView);
  vec3 v = normalize(vViewDir);
  vec3 lightDir = normalize(vec3(-0.55, 0.65, 0.55));

  vec3 p = vPosObject;

  // Earth-616: land and sea from the texture; clouds drift a little faster
  // than the ground beneath them.
  float land = texture2D(uEarth, vUv).r;
  float clouds = texture2D(uEarth, vUv + vec2(uTime * 0.0035, 0.0)).g;
  float surface = mix(land, 1.0, smoothstep(0.45, 0.95, clouds) * 0.3);

  float diffuse = clamp(dot(n, lightDir), 0.0, 1.0);
  float tone = diffuse * 0.9 + 0.04;
  tone *= 0.18 + 0.82 * surface;

  vec3 halfVec = normalize(lightDir + v);
  float spec = pow(max(dot(n, halfVec), 0.0), 48.0) * 0.55;

  // Screen-space halftone: larger ink dots where the surface is darker.
  vec2 cell = gl_FragCoord.xy / (uDpr * 5.0);
  cell = mat2(0.7071, -0.7071, 0.7071, 0.7071) * cell;
  float dist = length(fract(cell) - 0.5);
  float radius = (1.0 - tone) * 0.55;
  float dots = 1.0 - smoothstep(radius - 0.06, radius + 0.06, dist);
  float gray = mix(tone, tone * 0.25, dots * 0.55) + spec;
  vec3 color = vec3(gray) * vec3(0.98, 0.96, 0.92);

  // Red rim light, strongest lower right.
  float fresnel = pow(1.0 - max(dot(n, v), 0.0), 2.6);
  float rimSide = clamp(dot(n, normalize(vec3(0.75, -0.55, 0.2))) * 0.8 + 0.35, 0.0, 1.0);
  color += uRed * fresnel * rimSide * 1.6;

  // Portal swirl on the face, opening as the dive progresses.
  float face = max(dot(n, v), 0.0);
  float angle = atan(n.y, n.x);
  float swirl = sin(angle * 6.0 + face * 14.0 - uTime * 1.6 + fbm(p * 3.0 + uTime * 0.2) * 3.0) * 0.5 + 0.5;
  float core = smoothstep(0.55, 1.0, face);
  float portalAmount = (0.06 + uProgress * 0.85) * core;
  vec3 portalColor = mix(uViolet, uCyan, swirl * swirl) * (0.35 + swirl * 0.6);
  color = mix(color, portalColor, clamp(portalAmount * swirl, 0.0, 0.75));

  // Deep in the dive the centre falls away into the void.
  color = mix(color, vec3(0.07, 0.063, 0.067), uProgress * uProgress * core * 0.8);

  gl_FragColor = vec4(color, 1.0);
}
`
