import { initReducedMotion, initGSAP, getDeviceTier } from '../lib/gsap/presets.js';
import { AudioManager } from '../lib/audio/AudioManager.js';
import { P3Menu } from '../components/P3Menu/P3Menu.js';
import { DiscCarousel } from '../components/DiscCarousel/DiscCarousel.js';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

initReducedMotion();
initGSAP();

const audioManager = new AudioManager();
window.audioManager = audioManager;
await audioManager.init();

const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smooth: true,
  smoothTouch: false,
});

lenis.on('scroll', ScrollTrigger.refresh);
function raf(time: number) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);
window.lenis = lenis;

const deviceTier = getDeviceTier();
document.documentElement.dataset.deviceTier = deviceTier;

const p3MenuContainer = document.getElementById('p3-menu-container');
if (p3MenuContainer) {
  new P3Menu(p3MenuContainer, audioManager, gsap);
}

const discContainer = document.getElementById('disc-carousel');
const projectData = await (await fetch('/CXRLOSMP-LANDING/projects-data.json')).json();
if (discContainer && projectData.length > 0) {
  new DiscCarousel(discContainer, projectData, gsap);
}

gsap.utils.toArray('.section-title').forEach(title => {
  gsap.from(title, {
    scrollTrigger: {
      trigger: title,
      start: 'top 75%',
      toggleActions: 'play none none reverse',
    },
    opacity: 0,
    y: 50,
    duration: 0.8,
    ease: 'power3.out',
  });
});

gsap.utils.toArray('section[id]').forEach(section => {
  const elements = section.querySelectorAll('.card-p5, .skill-tag, .event-card, .cert-item, .social-link');
  if (elements.length) {
    gsap.from(elements, {
      scrollTrigger: {
        trigger: section,
        start: 'top 80%',
        toggleActions: 'play none none reverse',
      },
      opacity: 0,
      y: 50,
      duration: 0.6,
      ease: 'power3.out',
      stagger: 0.1,
    });
  }
});

const header = document.querySelector('header');
lenis.on('scroll', ({ scroll }: { scroll: number }) => {
  if (header) {
    if (scroll > 50) {
      header.classList.add('bg-fusion-bg/95', 'border-p5-red/30');
    } else {
      header.classList.remove('bg-fusion-bg/95', 'border-p5-red/30');
    }
  }
});

const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section[id]');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
      });
    }
  });
}, { rootMargin: '-20% 0px -60% 0px', threshold: 0.1 });

sections.forEach(section => observer.observe(section));

const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');
const navOverlay = document.querySelector('.nav-overlay');

if (navToggle && navMenu && navOverlay) {
  navToggle.addEventListener('click', () => {
    const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!isOpen));
    navMenu.classList.toggle('translate-x-full', isOpen);
    navOverlay.hidden = isOpen;
    if (!isOpen) {
      requestAnimationFrame(() => navOverlay.classList.toggle('visible', !isOpen));
    } else {
      navOverlay.classList.remove('visible');
    }
    document.body.classList.toggle('menu-open', !isOpen);
    
    if (!isOpen && (window as any).audioManager) {
      (window as any).audioManager.play('open');
    }
  });

  navOverlay.addEventListener('click', () => {
    navToggle.click();
  });

  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navToggle.click();
    });
  });
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(this: HTMLAnchorElement, e: MouseEvent) {
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;
    const target = document.querySelector(targetId);
    if (target) {
      e.preventDefault();
      if ((window as any).audioManager) (window as any).audioManager.play('click');
      lenis.scrollTo(target, { offset: -80 });
    }
  });
});

export { lenis };