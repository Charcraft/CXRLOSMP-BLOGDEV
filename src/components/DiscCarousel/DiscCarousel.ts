import { DiscRenderer, getDiscPatternFromTech, type DiscSpec } from '../canvas/DiscRenderer.js';

interface ProjectData {
  title: string;
  description: string;
  tech: string[];
  year: string;
  pattern: 'circuit' | 'vinyl' | 'data' | 'neon';
  primaryHue: number;
  secondaryHue: number;
}

export class DiscCarousel {
  private container: HTMLElement;
  private discRenderer: DiscRenderer;
  private projects: ProjectData[];
  private currentIndex: number = 0;
  private discElements: HTMLElement[] = [];
  private infoElements: HTMLElement[] = [];
  private isAnimating: boolean = false;
  private rotation: number = 0;
  private targetRotation: number = 0;
  private animationId: number | null = null;
  private touchStartX: number = 0;
  private touchStartRotation: number = 0;
  private isDragging: boolean = false;
  private gsap: any;

  constructor(container: HTMLElement, projects: ProjectData[], gsap: any) {
    this.container = container;
    this.projects = projects;
    this.discRenderer = new DiscRenderer();
    this.gsap = gsap;
    this.init();
  }

  private init() {
    this.renderCarousel();
    this.bindEvents();
    this.animate();
    this.setupGSAP();
  }

  private renderCarousel() {
    const carouselHTML = `
      <div class="disc-carousel relative w-full max-w-5xl mx-auto" role="region" aria-label="Proyectos">
        <!-- Carousel Viewport -->
        <div class="carousel-viewport relative perspective-1000" style="height: 400px;">
          ${this.projects.map((project, index) => this.createDiscElement(project, index)).join('')}
        </div>

        <!-- Navigation -->
        <div class="carousel-nav flex justify-center gap-4 mt-8">
          <button class="nav-btn prev-btn p5-btn" aria-label="Proyecto anterior" disabled>
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div class="indicators flex items-center gap-2" role="tablist" aria-label="Proyectos">
            ${this.projects.map((_, i) => `
              <button class="indicator w-2.5 h-2.5 rounded-full transition-all duration-300 ${i === 0 ? 'bg-p5-gold w-8' : 'bg-p5-red-dim/50'}" 
                      role="tab" 
                      aria-selected="${i === 0}" 
                      aria-label="Ver proyecto ${this.projects[i].title}"
                      data-index="${i}"></button>
            `).join('')}
          </div>

          <button class="nav-btn next-btn p5-btn" aria-label="Siguiente proyecto">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <!-- Info Panel -->
        <div class="disc-info-panel mt-10 p-6 md:p-8 glass-p5 rounded-2xl overflow-hidden">
          <div class="info-content max-w-3xl mx-auto">
            ${this.projects.map((project, index) => `
              <div class="info-item ${index === 0 ? 'active' : ''}" data-index="${index}" style="display: ${index === 0 ? 'block' : 'none'};">
                <div class="flex items-center gap-3 mb-4">
                  <span class="badge-p5 text-sm">${project.year}</span>
                  <span class="font-display text-xs text-p3-pink uppercase">${project.pattern.toUpperCase()} PATTERN</span>
                </div>
                <h3 class="font-display text-2xl md:text-3xl text-fusion-text-primary mb-3">${project.title}</h3>
                <p class="text-fusion-text-muted mb-5 leading-relaxed">${project.description}</p>
                <div class="flex flex-wrap gap-2 mb-6" role="list" aria-label="Tecnologías">
                  ${project.tech.map((tech, ti) => `
                    <span class="badge-p5 text-xs" style="animation-delay: ${ti * 50}ms">${tech}</span>
                  `).join('')}
                </div>
                <div class="flex flex-wrap gap-3">
                  <a href="#" class="btn-p5" data-project="${project.title}"><span>Ver Detalle</span></a>
                  <a href="#" class="btn-p3" data-project="${project.title}"><span>GitHub</span></a>
                  <a href="#" class="btn-p3" data-project="${project.title}"><span>Demo</span></a>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    this.container.innerHTML = carouselHTML;
    this.cacheElements();
  }

  private createDiscElement(project: any, index: number): string {
    const isActive = index === 0;
    const zIndex = 10 - index;
    const translateX = (index - 1) * 320; // -320, 0, 320
    const scale = index === 1 ? 1 : 0.65;
    const opacity = index === 1 ? 1 : 0.5;
    const z = index === 1 ? 0 : -150;

    const spec = {
      title: project.title,
      year: project.year,
      primaryHue: project.primaryHue,
      secondaryHue: project.secondaryHue,
      pattern: project.pattern,
    };

    // Generate disc canvas
    const canvas = this.discRenderer.generateDisc({
      title: project.title,
      year: project.year,
      primaryHue: project.primaryHue,
      secondaryHue: project.secondaryHue,
      pattern: project.pattern,
    }, 280);

    const dataUrl = canvas.toDataURL('image/webp', 0.9);

    return `
      <div class="disc-card absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer preserve-3d transition-all duration-700 ease-out"
           style="
             z-index: ${zIndex};
             transform: translateX(${translateX}px) translateZ(${z}px) scale(${scale});
             opacity: ${opacity};
           "
           data-index="${index}"
           data-title="${project.title}"
           role="button"
           tabindex="0"
           aria-label="${project.title} - ${project.year}"
           aria-selected="${index === 1 ? 'true' : 'false'}">
        <div class="disc-inner relative w-[var(--disc-size,220px)] h-[var(--disc-size,220px)] preserve-3d">
          <img src="${dataUrl}" alt="${project.title} disc artwork" 
               class="absolute inset-0 w-full h-full object-cover pointer-events-none"
               loading="lazy" decoding="async">
          <div class="disc-glare absolute inset-0 bg-gradient-to-br from-p5-gold/20 via-transparent to-p3-blue/20 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
        </div>
        <div class="disc-label absolute bottom-[-40px] left-1/2 -translate-x-1/2 text-center pointer-events-none">
          <p class="font-display text-xs text-p5-gold uppercase tracking-wider">${project.title}</p>
          <p class="text-p5-grey-light text-xs">${project.year}</p>
        </div>
      </div>
    `;
  }

  private cacheElements() {
    this.discElements = Array.from(this.container.querySelectorAll('.disc-card'));
    this.infoElements = Array.from(this.container.querySelectorAll('.info-item'));
  }

  private bindEvents() {
    // Navigation buttons
    const prevBtn = this.container.querySelector('.prev-btn');
    const nextBtn = this.container.querySelector('.next-btn');
    
    prevBtn?.addEventListener('click', () => this.navigate(-1));
    nextBtn?.addEventListener('click', () => this.navigate(1));

    // Indicators
    this.container.querySelectorAll('.indicator').forEach((indicator, index) => {
      indicator.addEventListener('click', () => this.goTo(index));
    });

    // Disc click
    this.discElements.forEach((disc, index) => {
      disc.addEventListener('click', () => this.goTo(index));
      disc.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.goTo(index);
        }
      });
    });

    // Touch/Swipe
    const viewport = this.container.querySelector('.carousel-viewport');
    viewport?.addEventListener('pointerdown', this.onPointerDown.bind(this), { passive: true });
    viewport?.addEventListener('pointermove', this.onPointerMove.bind(this), { passive: false });
    viewport?.addEventListener('pointerup', this.onPointerUp.bind(this));
    viewport?.addEventListener('pointerleave', this.onPointerUp.bind(this));

    // Wheel
    viewport?.addEventListener('wheel', this.onWheel.bind(this), { passive: false });

    // Keyboard
    document.addEventListener('keydown', this.onKeyDown.bind(this));
  }

  private onPointerDown(e: PointerEvent) {
    this.isDragging = true;
    this.touchStartX = e.clientX;
    this.touchStartRotation = this.targetRotation;
    this.cancelAnimation();
  }

  private onPointerMove(e: PointerEvent) {
    if (!this.isDragging) return;
    e.preventDefault();
    const deltaX = e.clientX - this.touchStartX;
    this.targetRotation = this.touchStartRotation + deltaX * 0.003;
  }

  private onPointerUp() {
    this.isDragging = false;
    this.snapToNearest();
  }

  private onWheel(e: WheelEvent) {
    e.preventDefault();
    this.targetRotation += e.deltaY * 0.005;
    this.cancelAnimation();
  }

  private onKeyDown(e: KeyboardEvent) {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      this.navigate(-1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      this.navigate(1);
    } else if (e.key === 'Escape') {
      // Close any open detail
    }
  }

  private cancelAnimation() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  private snapToNearest() {
    const itemAngle = Math.PI * 2 / 3; // 3 items visible
    const snapped = Math.round(this.targetRotation / itemAngle) * itemAngle;
    this.targetRotation = snapped;
    this.startAnimation();
  }

  private startAnimation() {
    if (this.animationId) return;
    this.animate();
  }

  private animate() {
    if (!this.isDragging) {
      this.rotation += (this.targetRotation - this.rotation) * 0.08;
      this.updateDiscPositions();
    }
    this.animationId = requestAnimationFrame(() => this.animate());
  }

  private updateDiscPositions() {
    const visibleCount = Math.min(3, this.projects.length);
    const half = Math.floor(visibleCount / 2);
    
    this.discElements.forEach((disc, index) => {
      let relativeIndex = index - this.currentIndex;
      
      // Wrap around for circular carousel
      while (relativeIndex > half) relativeIndex -= this.projects.length;
      while (relativeIndex < -half) relativeIndex += this.projects.length;
      
      const targetPos = this.getPositionForIndex(relativeIndex);
      const currentTransform = disc.style.transform;
      
      // Smooth interpolation
      const currentX = this.extractTranslateX(currentTransform);
      const currentZ = this.extractTranslateZ(currentTransform);
      const currentScale = this.extractScale(currentTransform);
      
      const newX = currentX + (targetPos.x - currentX) * 0.15;
      const newZ = currentZ + (targetPos.z - currentZ) * 0.15;
      const newScale = currentScale + (targetPos.scale - currentScale) * 0.15;
      const newOpacity = currentTransform.includes('opacity') ? 
        parseFloat(currentTransform.match(/opacity:\s*([\d.]+)/)?.[1] || '1') + (targetPos.opacity - parseFloat(currentTransform.match(/opacity:\s*([\d.]+)/)?.[1] || '1')) * 0.15
        : targetPos.opacity;

      disc.style.transform = `translateX(${newX}px) translateZ(${newZ}px) scale(${newScale})`;
      disc.style.opacity = String(targetPos.opacity);
      disc.style.zIndex = String(targetPos.zIndex);
      disc.setAttribute('aria-selected', relativeIndex === 0 ? 'true' : 'false');
    });
  }

  private getPositionForIndex(relativeIndex: number): { x: number; z: number; scale: number; opacity: number; zIndex: number } {
    if (relativeIndex === 0) {
      return { x: 0, z: 0, scale: 1, opacity: 1, zIndex: 10 };
    } else if (relativeIndex === -1) {
      return { x: -320, z: -150, scale: 0.65, opacity: 0.5, zIndex: 9 };
    } else if (relativeIndex === 1) {
      return { x: 320, z: -150, scale: 0.65, opacity: 0.5, zIndex: 9 };
    }
    return { x: 0, z: -300, scale: 0.3, opacity: 0, zIndex: 1 };
  }

  private extractTranslateX(transform: string): number {
    const match = transform.match(/translateX\(([-\d.]+)px\)/);
    return match ? parseFloat(match[1]) : 0;
  }

  private extractTranslateZ(transform: string): number {
    const match = transform.match(/translateZ\(([-\d.]+)px\)/);
    return match ? parseFloat(match[1]) : 0;
  }

  private extractScale(transform: string): number {
    const match = transform.match(/scale\(([\d.]+)\)/);
    return match ? parseFloat(match[1]) : 1;
  }

  private navigate(direction: number) {
    const newIndex = (this.currentIndex + direction + this.projects.length) % this.projects.length;
    this.goTo(newIndex);
  }

  private goTo(index: number) {
    if (this.isAnimating || index === this.currentIndex) return;
    
    this.isAnimating = true;
    this.cancelAnimation();
    
    const direction = index > this.currentIndex ? 1 : -1;
    const distance = Math.abs(index - this.currentIndex);
    const shortest = Math.min(distance, this.projects.length - distance);
    const actualDirection = (index - this.currentIndex + this.projects.length) % this.projects.length <= this.projects.length / 2 ? 1 : -1;
    
    // Animate rotation
    this.gsap.to(this, {
      targetRotation: this.targetRotation + (actualDirection * Math.PI * 2 / 3) * shortest,
      duration: 0.8,
      ease: 'power3.out',
      onUpdate: () => this.updateDiscPositions(),
      onComplete: () => {
        this.currentIndex = index;
        this.updateActiveStates();
        this.isAnimating = false;
        this.startAnimation();
      }
    });

    // Update info panel
    this.gsap.to('.info-item.active', {
      opacity: 0,
      y: -20,
      duration: 0.3,
      ease: 'power2.in',
      onComplete: () => {
        document.querySelectorAll('.info-item').forEach(el => {
          el.classList.remove('active');
          (el as HTMLElement).style.display = 'none';
        });
        const newActive = this.container.querySelector(`.info-item[data-index="${index}"]`);
        if (newActive) {
          (newActive as HTMLElement).style.display = 'block';
          newActive.classList.add('active');
          this.gsap.from(newActive, {
            opacity: 0,
            y: 20,
            duration: 0.5,
            ease: 'power3.out'
          });
        }
      }
    });

    // Update indicators
    this.container.querySelectorAll('.indicator').forEach((ind, i) => {
      ind.classList.toggle('bg-p5-gold', i === index);
      ind.classList.toggle('w-8', i === index);
      ind.classList.toggle('bg-p5-red-dim/50', i !== index);
      ind.classList.toggle('w-2.5', i !== index);
      ind.setAttribute('aria-selected', i === index ? 'true' : 'false');
    });

    // Update nav buttons
    const prevBtn = this.container.querySelector('.prev-btn') as HTMLButtonElement;
    const nextBtn = this.container.querySelector('.next-btn') as HTMLButtonElement;
    if (prevBtn) prevBtn.disabled = this.projects.length <= 1;
    if (nextBtn) nextBtn.disabled = this.projects.length <= 1;
  }

  private updateActiveStates() {
    this.discElements.forEach((disc, index) => {
      disc.setAttribute('aria-selected', index === this.currentIndex ? 'true' : 'false');
    });
  }

  private setupGSAP() {
    // Initial entrance animation
    this.gsap.from('.disc-card', {
      opacity: 0,
      y: 50,
      rotationY: (i: number) => (i - 1) * 45,
      scale: 0.5,
      duration: 1.2,
      ease: 'power3.out',
      stagger: 0.15,
    });

    this.gsap.from('.disc-info-panel', {
      opacity: 0,
      y: 50,
      duration: 1,
      delay: 0.5,
      ease: 'power3.out',
    });

    this.gsap.from('.nav-btn', {
      opacity: 0,
      x: (i: number) => i === 0 ? -30 : 30,
      duration: 0.6,
      delay: 0.8,
      ease: 'power3.out',
      stagger: 0.1,
    });

    this.gsap.from('.indicator', {
      opacity: 0,
      scale: 0,
      duration: 0.5,
      delay: 0.8,
      ease: 'back.out(1.7)',
      stagger: 0.05,
    });
  }

  destroy() {
    this.cancelAnimation();
    window.removeEventListener('keydown', this.onKeyDown.bind(this));
    this.discRenderer.clearCache();
  }
}