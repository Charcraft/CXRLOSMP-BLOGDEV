import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initGSAP() {
  gsap.config({
    nullTargetWarn: false,
    trialWarn: false,
  });

  ScrollTrigger.config({
    ignoreMobileResize: true,
    autoRefreshEvents: 'visibilitychange,DOMContentLoaded,load',
  });
}

export function initReducedMotion() {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  applyReducedMotionStyles(reduced);

  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  mediaQuery.addEventListener('change', (e) => {
    applyReducedMotionStyles(e.matches);
    
    const event = new CustomEvent('reducedMotionChange', { 
      detail: { reduced: e.matches } 
    });
    document.dispatchEvent(event);
  });
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

export function initLenis() {
  // Lenis is initialized in main script
}

export function createStaggerReveal(selector: string, options: any = {}) {
  const elements = gsap.utils.toArray(selector);
  
  return gsap.from(elements, {
    opacity: 0,
    y: 50,
    duration: 0.8,
    ease: 'power3.out',
    stagger: 0.1,
    scrollTrigger: {
      trigger: elements[0] || selector,
      start: 'top 80%',
      end: 'bottom 20%',
      toggleActions: 'play none none reverse',
      ...options.scrollTrigger,
    },
    ...options,
  });
}

export function createMagneticHover(element: string | Element, options: any = {}) {
  const defaults = {
    strength: 0.3,
    ease: 'power3.out',
    duration: 0.4,
    ...options,
  };

  const el = typeof element === 'string' ? document.querySelector(element) : element;
  if (!el) return;

  const handleMove = (e: MouseEvent) => {
    const rect = el.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    
    gsap.to(el, {
      x: mouseX * defaults.strength,
      y: mouseY * defaults.strength,
      duration: defaults.duration,
      ease: defaults.ease,
    });
  };

  const handleLeave = () => {
    gsap.to(el, {
      x: 0,
      y: 0,
      duration: defaults.duration * 1.5,
      ease: 'elastic.out(1, 0.5)',
    });
  };

  el.addEventListener('mousemove', handleMove);
  el.addEventListener('mouseleave', handleLeave);

  return () => {
    el.removeEventListener('mousemove', handleMove);
    el.removeEventListener('mouseleave', handleLeave);
  };
}

export function refreshScrollTrigger() {
  ScrollTrigger.refresh();
}

export function killAllScrollTriggers() {
  ScrollTrigger.getAll().forEach(st => st.kill());
}

export function createTextScramble(element: string | Element, text: string, options: any = {}) {
  const defaults = {
    duration: 1.5,
    chars: '!<>-_\\/[]{}—=+*^?#________',
    ease: 'none',
    ...options,
  };

  const el = typeof element === 'string' ? document.querySelector(element) : element;
  if (!el) return;

  const originalText = text;
  const originalLength = originalText.length;
  let frame = 0;
  const totalFrames = 60 * (defaults.duration / 1.5);

  const animate = () => {
    let displayText = '';
    
    for (let i = 0; i < originalLength; i++) {
      const progress = frame / totalFrames;
      const charProgress = progress - i * 0.03;
      
      if (charProgress > 1) {
        displayText += originalText[i];
      } else if (charProgress > 0) {
        const randomChar = defaults.chars[Math.floor(Math.random() * defaults.chars.length)];
        displayText += charProgress > 0.5 ? originalText[i] : randomChar;
      } else {
        displayText += defaults.chars[Math.floor(Math.random() * defaults.chars.length)];
      }
    }
    
    el.textContent = displayText;
    
    frame++;
    if (frame <= totalFrames) {
      requestAnimationFrame(animate);
    } else {
      el.textContent = originalText;
    }
  };

  animate();
}