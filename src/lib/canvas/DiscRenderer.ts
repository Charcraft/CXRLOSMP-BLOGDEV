export interface DiscSpec {
  title: string;
  year: string;
  primaryHue: number;
  secondaryHue: number;
  pattern: 'circuit' | 'vinyl' | 'data' | 'neon';
}

interface PatternRenderer {
  (ctx: CanvasRenderingContext2D, cx: number, cy: number, outerR: number, innerR: number, spec: DiscSpec): void;
}

const patternRenderers: Record<string, PatternRenderer> = {
  circuit: (ctx, cx, cy, outerR, innerR, spec) => {
    ctx.strokeStyle = `hsla(${spec.secondaryHue}, 80%, 50%, 0.5)`;
    ctx.lineWidth = Math.max(1, outerR * 0.01);
    ctx.lineCap = 'round';

    const rings = 3;
    for (let ring = 0; ring < rings; ring++) {
      const ringR = innerR + (outerR - innerR) * (0.3 + ring * 0.2);
      const nodes = 8 + ring * 4;
      
      for (let i = 0; i < nodes; i++) {
        const angle = (i / nodes) * Math.PI * 2;
        const nextAngle = ((i + 1) / nodes) * Math.PI * 2;
        
        const x1 = cx + Math.cos(angle) * ringR;
        const y1 = cy + Math.sin(angle) * ringR;
        const x2 = cx + Math.cos(nextAngle) * ringR;
        const y2 = cy + Math.sin(nextAngle) * ringR;
        
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        
        // Radial connectors
        if (Math.random() < 0.5) {
          const innerX = cx + Math.cos(angle) * (ringR * 0.6);
          const innerY = cy + Math.sin(angle) * (ringR * 0.6);
          ctx.beginPath();
          ctx.moveTo(innerX, innerY);
          ctx.lineTo(cx + Math.cos(angle) * ringR, cy + Math.sin(angle) * ringR);
          ctx.stroke();
        }
      }
    }

    // Central chip
    ctx.fillStyle = `hsla(${spec.primaryHue}, 60%, 20%, 0.8)`;
    ctx.beginPath();
    ctx.arc(cx, cy, innerR * 0.5, 0, Math.PI * 2);
    ctx.fill();
    
    // Chip details
    ctx.strokeStyle = `hsla(${spec.secondaryHue}, 80%, 50%, 0.6)`;
    ctx.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const r = innerR * 0.35;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
      ctx.lineTo(cx + Math.cos(angle) * r * 1.5, cy + Math.sin(angle) * r * 1.5);
      ctx.stroke();
    }
  },

  vinyl: (ctx, cx, cy, outerR, innerR, spec) => {
    // Vinyl grooves
    const grooveCount = Math.floor((outerR - innerR) / 3);
    for (let i = 0; i < grooveCount; i++) {
      const r = outerR - i * 3;
      const opacity = 0.15 + (i / grooveCount) * 0.1;
      ctx.strokeStyle = `hsla(${spec.primaryHue}, 60%, 40%, ${opacity})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Label area
    const labelR = innerR + (outerR - innerR) * 0.3;
    ctx.fillStyle = `hsla(${spec.primaryHue}, 50%, 15%, 0.9)`;
    ctx.beginPath();
    ctx.arc(cx, cy, labelR, 0, Math.PI * 2);
    ctx.fill();

    // Spindle hole
    ctx.fillStyle = '#050505';
    ctx.beginPath();
    ctx.arc(cx, cy, innerR * 0.8, 0, Math.PI * 2);
    ctx.fill();

    // Center label text area
    ctx.fillStyle = `hsla(${spec.secondaryHue}, 80%, 50%, 0.3)`;
    ctx.beginPath();
    ctx.arc(cx, cy, innerR * 0.5, 0, Math.PI * 2);
    ctx.fill();
  },

  data: (ctx, cx, cy, outerR, innerR, spec) => {
    // Concentric data rings
    const ringCount = 5;
    for (let ring = 0; ring < ringCount; ring++) {
      const r = innerR + (outerR - innerR) * (0.2 + ring * 0.16);
      const segments = 12 + ring * 6;
      
      for (let i = 0; i < segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        const nextAngle = ((i + 1) / segments) * Math.PI * 2;
        const active = Math.random() < 0.6;
        
        if (active) {
          const opacity = 0.3 + Math.random() * 0.4;
          ctx.fillStyle = `hsla(${spec.secondaryHue}, 80%, 50%, ${opacity})`;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.arc(cx, cy, r, angle, nextAngle);
          ctx.closePath();
          ctx.fill();
        }
      }
    }

    // Radial data lines
    ctx.strokeStyle = `hsla(${spec.secondaryHue}, 80%, 50%, 0.4)`;
    ctx.lineWidth = 1;
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      const r1 = innerR + (outerR - innerR) * 0.1;
      const r2 = outerR * 0.9;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * r1, cy + Math.sin(angle) * r1);
      ctx.lineTo(cx + Math.cos(angle) * r2, cy + Math.sin(angle) * r2);
      ctx.stroke();
    }

    // Center core
    ctx.fillStyle = `hsla(${spec.primaryHue}, 60%, 20%, 0.9)`;
    ctx.beginPath();
    ctx.arc(cx, cy, innerR * 0.6, 0, Math.PI * 2);
    ctx.fill();
  },

  neon: (ctx, cx, cy, outerR, innerR, spec) => {
    // Neon rings with glow
    const ringCount = 4;
    for (let ring = 0; ring < ringCount; ring++) {
      const r = innerR + (outerR - innerR) * (0.15 + ring * 0.2);
      
      // Outer glow
      const gradient = ctx.createRadialGradient(cx, cy, r - 5, cx, cy, r + 10);
      gradient.addColorStop(0, `hsla(${spec.secondaryHue}, 90%, 60%, 0.6)`);
      gradient.addColorStop(0.5, `hsla(${spec.primaryHue}, 80%, 40%, 0.3)`);
      gradient.addColorStop(1, `hsla(${spec.primaryHue}, 60%, 20%, 0)`);
      
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 4;
      ctx.shadowColor = `hsla(${spec.secondaryHue}, 90%, 60%, 0.8)`;
      ctx.shadowBlur = 15;
      
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
      
      ctx.shadowBlur = 0;
    }

    // Pulsing center
    ctx.fillStyle = `hsla(${spec.secondaryHue}, 90%, 60%, 0.8)`;
    ctx.shadowColor = `hsla(${spec.secondaryHue}, 90%, 60%, 1)`;
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(cx, cy, innerR * 0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Particle ring
    ctx.strokeStyle = `hsla(${spec.secondaryHue}, 90%, 60%, 0.5)`;
    ctx.lineWidth = 1;
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2;
      const r = innerR + (outerR - innerR) * 0.5;
      const px = cx + Math.cos(angle) * r;
      const py = cy + Math.sin(angle) * r;
      const size = 2 + Math.random() * 3;
      ctx.beginPath();
      ctx.arc(px, py, size, 0, Math.PI * 2);
      ctx.fill();
    }
  },
};

export class DiscRenderer {
  private cache: Map<string, HTMLCanvasElement> = new Map();

  generateDisc(spec: DiscSpec, size: number): HTMLCanvasElement {
    const key = `${spec.title}-${size}-${spec.pattern}-${spec.primaryHue}-${spec.secondaryHue}`;
    
    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }

    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    const center = size / 2;
    const outerR = size * 0.45;
    const innerR = size * 0.08;

    // 1. Base disc gradient
    const baseGrad = ctx.createRadialGradient(center, center, innerR, center, center, outerR);
    baseGrad.addColorStop(0, `hsl(${spec.primaryHue}, 60%, 12%)`);
    baseGrad.addColorStop(0.3, `hsl(${spec.primaryHue}, 50%, 18%)`);
    baseGrad.addColorStop(0.7, `hsl(${spec.primaryHue}, 45%, 22%)`);
    baseGrad.addColorStop(1, `hsl(${spec.primaryHue}, 40%, 10%)`);
    
    ctx.fillStyle = baseGrad;
    this.drawRing(ctx, center, innerR, outerR);

    // 2. Pattern layer
    const patternRenderer = patternRenderers[spec.pattern];
    if (patternRenderer) {
      patternRenderer(ctx, center, center, outerR, innerR, spec);
    }

    // 3. Center hole
    ctx.fillStyle = '#050505';
    ctx.beginPath();
    ctx.arc(center, center, innerR, 0, Math.PI * 2);
    ctx.fill();

    // 4. Outer rim highlight
    ctx.strokeStyle = `hsla(${spec.secondaryHue}, 80%, 50%, 0.6)`;
    ctx.lineWidth = Math.max(1, size * 0.01);
    ctx.beginPath();
    ctx.arc(center, center, outerR, 0, Math.PI * 2);
    ctx.stroke();

    // 5. Inner rim
    ctx.strokeStyle = `hsla(${spec.primaryHue}, 60%, 30%, 0.4)`;
    ctx.lineWidth = Math.max(0.5, size * 0.005);
    ctx.beginPath();
    ctx.arc(center, center, innerR, 0, Math.PI * 2);
    ctx.stroke();

    this.cache.set(key, canvas);
    return canvas;
  }

  private drawRing(ctx: CanvasRenderingContext2D, cx: number, cy: number, innerR: number, outerR: number) {
    ctx.beginPath();
    ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
    ctx.arc(cx, cy, innerR, 0, Math.PI * 2, true);
    ctx.fill();
  }

  generatePlaceholder(spec: DiscSpec, size: number): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    const center = size / 2;
    const outerR = size * 0.45;
    const innerR = size * 0.08;

    // Simple gradient disc
    const grad = ctx.createRadialGradient(center, center, innerR, center, center, outerR);
    grad.addColorStop(0, `hsl(${spec.primaryHue}, 60%, 20%)`);
    grad.addColorStop(1, `hsl(${spec.primaryHue}, 40%, 10%)`);
    
    ctx.fillStyle = grad;
    this.drawRing(ctx, center, innerR, outerR);

    // Center hole
    ctx.fillStyle = '#050505';
    ctx.beginPath();
    ctx.arc(center, center, innerR, 0, Math.PI * 2);
    ctx.fill();

    // Title text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold ${size * 0.08}px "Noto Sans JP", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(spec.title.substring(0, 12), center, center - size * 0.05);
    
    ctx.font = `${size * 0.05}px "Noto Sans JP", sans-serif`;
    ctx.fillStyle = `hsl(${spec.secondaryHue}, 80%, 60%)`;
    ctx.fillText(spec.year, center, center + size * 0.08);

    return canvas;
  }

  clearCache() {
    this.cache.clear();
  }
}

// Helper function to determine pattern from tech stack
export function getDiscPatternFromTech(tech: string[]): { pattern: 'circuit' | 'vinyl' | 'data' | 'neon'; primaryHue: number; secondaryHue: number } {
  const techLower = tech.map(t => t.toLowerCase());
  
  const patterns: Record<string, { pattern: 'circuit' | 'vinyl' | 'data' | 'neon'; primaryHue: number; secondaryHue: number }> = {
    // Frontend
    'react': { pattern: 'circuit', primaryHue: 220, secondaryHue: 320 },
    'vue': { pattern: 'data', primaryHue: 150, secondaryHue: 60 },
    'svelte': { pattern: 'neon', primaryHue: 330, secondaryHue: 45 },
    'typescript': { pattern: 'circuit', primaryHue: 220, secondaryHue: 0 },
    'javascript': { pattern: 'vinyl', primaryHue: 45, secondaryHue: 220 },
    'next.js': { pattern: 'circuit', primaryHue: 0, secondaryHue: 180 },
    'astro': { pattern: 'neon', primaryHue: 330, secondaryHue: 60 },
    
    // Backend
    'node.js': { pattern: 'circuit', primaryHue: 120, secondaryHue: 300 },
    'python': { pattern: 'data', primaryHue: 30, secondaryHue: 220 },
    'java': { pattern: 'circuit', primaryHue: 15, secondaryHue: 280 },
    'c++': { pattern: 'circuit', primaryHue: 0, secondaryHue: 240 },
    'go': { pattern: 'data', primaryHue: 180, secondaryHue: 300 },
    'rust': { pattern: 'circuit', primaryHue: 25, secondaryHue: 30 },
    
    // Database
    'mysql': { pattern: 'vinyl', primaryHue: 200, secondaryHue: 340 },
    'postgresql': { pattern: 'data', primaryHue: 180, secondaryHue: 330 },
    'mongodb': { pattern: 'neon', primaryHue: 120, secondaryHue: 45 },
    'redis': { pattern: 'neon', primaryHue: 0, secondaryHue: 60 },
    
    // Tools
    'three.js': { pattern: 'neon', primaryHue: 320, secondaryHue: 180 },
    'gsap': { pattern: 'neon', primaryHue: 30, secondaryHue: 300 },
    'tailwind': { pattern: 'circuit', primaryHue: 180, secondaryHue: 320 },
    'astro': { pattern: 'neon', primaryHue: 330, secondaryHue: 60 },
    'docker': { pattern: 'circuit', primaryHue: 200, secondaryHue: 300 },
  };

  // Find first matching tech
  for (const t of techLower) {
    if (patterns[t]) return patterns[t];
  }

  // Default based on first tech
  return { pattern: 'vinyl', primaryHue: 280, secondaryHue: 45 };
}