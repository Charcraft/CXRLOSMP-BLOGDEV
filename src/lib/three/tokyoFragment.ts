// Tokyo Night Fragment Shader - Procedural Tokyo Night (P3/P5 Fusion)
export const tokyoFragment = `
uniform float uTime;
uniform vec2 uResolution;
uniform float uScrollProgress;
uniform float uDeviceTier; // 0=low, 1=medium, 2=high

varying vec2 vUv;
varying vec3 vWorldPosition;
varying vec3 vNormal;

#define PI 3.14159265359

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}

float fbm(vec2 p, int octaves) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;
  for (int i = 0; i < 5; i++) {
    if (i >= octaves) break;
    value += amplitude * noise(p * frequency);
    frequency *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}

// Window lighting pattern
float windows(vec2 uv, float floorOffset) {
  vec2 g = fract(uv) - 0.5;
  vec2 id = floor(uv);
  float lit = step(0.7, hash(id + floorOffset * 17.0 + vec2(123.4, 456.7)));
  float window = smoothstep(0.15, 0.0, length(g));
  return lit * window;
}

// Building silhouette
float buildings(vec2 uv, float scroll) {
  float b = 0.0;
  for (int i = 0; i < 6; i++) {
    float h = hash(vec2(float(i), 0.0)) * 0.7 + 0.3;
    float w = hash(vec2(float(i), 1.0)) * 0.3 + 0.15;
    float x = hash(vec2(float(i), 2.0)) * 2.0 - 1.0;
    float dist = abs(uv.x - x) / w;
    b += smoothstep(h - 0.02, h, uv.y - scroll * 0.5) * (1.0 - smoothstep(0.0, 0.05, dist));
  }
  return clamp(b, 0.0, 1.0);
}

// Neon lines
float neon(vec2 uv, float time) {
  float n = sin(uv.x * 60.0 + time * 4.0) * 0.5 + 0.5;
  n = pow(n, 8.0);
  return n * 0.02;
}

void main() {
  vec2 uv = vUv;
  float scroll = uScrollProgress * 1.5;
  int quality = int(uDeviceTier);
  
  // ===== SKY GRADIENT (P5/P3 Fusion) =====
  vec3 skyTop = vec3(0.02, 0.01, 0.05);      // P5 Deep black
  vec3 skyMid = vec3(0.05, 0.02, 0.08);      // P3 Dark blue-purple
  vec3 skyBottom = vec3(0.12, 0.05, 0.15);   // Horizon glow
  
  vec3 sky = mix(skyTop, skyMid, uv.y * 0.7);
  sky = mix(sky, skyBottom, smoothstep(0.7, 1.0, uv.y));
  
  // ===== BUILDINGS (only on high/medium quality) =====
  float buildingMask = 0.0;
  if (quality >= 1) {
    buildingMask = buildings(uv * vec2(1.5, 1.0), uScrollProgress);
  }
  
  // ===== WINDOWS (procedural) =====
  vec3 windowColor = vec3(0.0);
  if (quality >= 1) {
    float lit = windows(uv * vec2(40.0, 30.0) + vec2(0.0, uTime * 0.05), floor(uTime * 0.1));
    
    // Warm windows (P5) / Cool windows (P3) blend
    vec3 warmWindow = vec3(1.0, 0.85, 0.4);
    vec3 coolWindow = vec3(0.3, 0.6, 1.0);
    float blend = sin(uv.x * 10.0 + uTime * 2.0) * 0.5 + 0.5;
    windowColor = mix(warmWindow, coolWindow, blend) * lit * 0.6;
  }
  
  // ===== NEON ACCENTS (P3 Pink / P5 Red) =====
  float neonIntensity = 0.0;
  if (quality >= 1) {
    neonIntensity = neon(uv, uTime);
  }
  
  // Neon color: P3 Pink <-> P5 Red blend
  vec3 neonColor = mix(
    vec3(1.0, 0.2, 0.4),   // P3 Pink
    vec3(0.85, 0.1, 0.1),  // P5 Red
    sin(uTime * 0.5) * 0.5 + 0.5
  );
  
  // ===== COMPOSITION =====
  vec3 color = mix(sky, vec3(0.01, 0.005, 0.02), buildingMask);
  color += windowColor;
  color += neonColor * neonIntensity;
  
  // Subtle scanline distortion on scroll
  float scrollDistort = sin(uv.y * 20.0 + uScrollProgress * 10.0) * 0.005 * (1.0 - buildingMask);
  uv.x += scrollDistort;
  
  // ===== POST PROCESS =====
  // Vignette
  float vig = 1.0 - length(uv - 0.5) * 0.6;
  
  // Scanlines (subtle)
  float scanline = sin(uv.y * uResolution.y * 0.5) * 0.02;
  
  // Chromatic aberration on edges
  float chromatic = length(uv - 0.5) * 0.002;
  
  // Final color
  vec3 finalColor = (color - scanline) * vig;
  
  // Apply chromatic aberration on RGB channels
  float r = finalColor.r + chromatic;
  float g = finalColor.g;
  float b = finalColor.b - chromatic;
  
  gl_FragColor = vec4(r, g, b, 1.0);
}
`;