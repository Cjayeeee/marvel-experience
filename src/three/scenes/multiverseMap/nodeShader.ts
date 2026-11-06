/**
 * Universe node: a dark core with a coloured rim (by medium) and slow
 * latitude bands, plus a soft additive halo shell. Display-space colours
 * (the Canvas runs `linear flat`).
 */

export const nodeVertexShader = /* glsl */ `
varying vec3 vNormalView;
varying vec3 vViewDir;
varying vec3 vPosObject;
void main() {
  vPosObject = position;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vNormalView = normalize(normalMatrix * normal);
  vViewDir = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}
`

export const nodeFragmentShader = /* glsl */ `
uniform vec3 uColor;
uniform float uGlow;
uniform float uTime;
varying vec3 vNormalView;
varying vec3 vViewDir;
varying vec3 vPosObject;
void main() {
  vec3 n = normalize(vNormalView);
  vec3 v = normalize(vViewDir);
  float facing = max(dot(n, v), 0.0);
  float rim = pow(1.0 - facing, 2.4);
  float bands = sin(vPosObject.y * 14.0 + uTime * 0.6) * 0.5 + 0.5;
  vec3 core = vec3(0.07, 0.063, 0.067) + uColor * (0.05 + bands * 0.05);
  vec3 color = core + uColor * rim * (0.9 + uGlow * 1.4);
  // A faint highlight from the upper left, so the sphere reads as round.
  color += vec3(0.9, 0.88, 0.84) * pow(max(dot(n, normalize(vec3(-0.5, 0.6, 0.6))), 0.0), 18.0) * 0.35;
  gl_FragColor = vec4(color, 1.0);
}
`

export const haloFragmentShader = /* glsl */ `
uniform vec3 uColor;
uniform float uGlow;
varying vec3 vNormalView;
varying vec3 vViewDir;
void main() {
  // Rendered on the back faces of a larger sphere: brightest at the silhouette.
  float facing = abs(dot(normalize(vNormalView), normalize(vViewDir)));
  float intensity = pow(facing, 3.0) * (0.35 + uGlow * 0.65);
  gl_FragColor = vec4(uColor * intensity, intensity);
}
`
