export type DeviceTier = 'low' | 'medium' | 'high';

export interface QualityConfig {
  particles: number;
  buildings: number;
  grain: number;
  scanlines: boolean;
  heroMode: 'webgl' | 'canvas2d';
}

export function getDeviceTier(): DeviceTier {
  const isMobile = /Mobi|Android/i.test(navigator.userAgent);
  const cores = navigator.hardwareConcurrency || 4;
  const memory = (navigator as any).deviceMemory || 4;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (prefersReduced) return 'low';
  if (isMobile || cores < 4 || memory < 4) return 'low';
  if (cores < 8) return 'medium';
  return 'high';
}

export const QUALITY_CONFIG: Record<DeviceTier, QualityConfig> = {
  high: { 
    particles: 3000, 
    buildings: 200, 
    grain: 0.15, 
    scanlines: true, 
    heroMode: 'webgl' 
  },
  medium: { 
    particles: 1500, 
    buildings: 100, 
    grain: 0.1, 
    scanlines: true, 
    heroMode: 'webgl' 
  },
  low: { 
    particles: 500, 
    buildings: 50, 
    grain: 0, 
    scanlines: false, 
    heroMode: 'canvas2d' 
  }
};

export function getQualityConfig(tier: DeviceTier = getDeviceTier()): QualityConfig {
  return QUALITY_CONFIG[tier];
}

export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function onReducedMotionChange(callback: (reduced: boolean) => void): () => void {
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const handler = (e: MediaQueryListEvent) => callback(e.matches);
  mediaQuery.addEventListener('change', handler);
  return () => mediaQuery.removeEventListener('change', handler);
}

export function applyReducedMotionStyles(reduced: boolean) {
  const html = document.documentElement;
  
  if (reduced) {
    html.classList.add('reduce-motion');
    html.style.setProperty('--animation-duration', '0.01ms');
    html.style.setProperty('--transition-duration', '0.01ms');
  } else {
    html.classList.remove('reduce-motion');
    html.style.removeProperty('--animation-duration');
    html.style.removeProperty('--transition-duration');
  }
}

export function initReducedMotion(): () => void {
  const reduced = prefersReducedMotion();
  applyReducedMotionStyles(reduced);
  
  return onReducedMotionChange((matches) => {
    applyReducedMotionStyles(matches);
    const event = new CustomEvent('reducedMotionChange', { 
      detail: { reduced: matches } 
    });
    document.dispatchEvent(event);
  });
}

export function getAnimationDuration(normal: string, reduced = '0.01ms'): string {
  return prefersReducedMotion() ? reduced : normal;
}

export function getTransitionDuration(normal: string, reduced = '0.01ms'): string {
  return prefersReducedMotion() ? reduced : normal;
}

export function shouldAnimate(): boolean {
  return !prefersReducedMotion();
}

export function respectReducedMotion<T>(animationFn: () => T, fallbackFn: () => T = () => undefined as any): T {
  if (prefersReducedMotion()) {
    return fallbackFn();
  }
  return animationFn();
}