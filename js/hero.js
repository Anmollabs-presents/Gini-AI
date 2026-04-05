/* Hero — animated grid canvas */
class HeroSection {
  constructor() {
    this.canvas = document.getElementById('grid-canvas');
    this.ctx = null;
    this.animId = null;
    this.mouse = { x: -9999, y: -9999 };
    this.dots = [];
  }

  init() {
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this._resize();
    this._buildDots();
    this._animate();

    window.addEventListener('resize', () => {
      this._resize();
      this._buildDots();
    }, { passive: true });

    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    }, { passive: true });

    window.addEventListener('mouseleave', () => {
      this.mouse.x = -9999;
      this.mouse.y = -9999;
    });
  }

  _resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width  = window.innerWidth  * dpr;
    this.canvas.height = window.innerHeight * dpr;
    this.canvas.style.width  = window.innerWidth  + 'px';
    this.canvas.style.height = window.innerHeight + 'px';
    this.ctx.scale(dpr, dpr);
    this.w = window.innerWidth;
    this.h = window.innerHeight;
  }

  _buildDots() {
    this.dots = [];
    const gap = 44;
    const cols = Math.ceil(this.w / gap) + 1;
    const rows = Math.ceil(this.h / gap) + 1;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        this.dots.push({
          x: c * gap,
          y: r * gap,
          baseOpacity: Math.random() * 0.25 + 0.04,
          r: Math.random() * 0.8 + 0.4,
          phase: Math.random() * Math.PI * 2,
          speed: Math.random() * 0.4 + 0.2,
        });
      }
    }
  }

  _animate() {
    const t = performance.now() / 1000;
    const ctx = this.ctx;

    ctx.clearRect(0, 0, this.w, this.h);

    for (const dot of this.dots) {
      const dx = dot.x - this.mouse.x;
      const dy = dot.y - this.mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const proximity = Math.max(0, 1 - dist / 180);

      const pulse = Math.sin(t * dot.speed + dot.phase) * 0.5 + 0.5;
      const opacity = dot.baseOpacity + pulse * 0.08 + proximity * 0.55;

      ctx.beginPath();
      ctx.arc(dot.x, dot.y, dot.r + proximity * 1.4, 0, Math.PI * 2);

      if (proximity > 0.02) {
        const r = Math.round(129 + proximity * 70);
        const g = Math.round(140 + proximity * 30);
        const b = Math.round(248);
        ctx.fillStyle = `rgba(${r},${g},${b},${Math.min(opacity, 1)})`;
      } else {
        ctx.fillStyle = `rgba(245,245,247,${Math.min(opacity, 0.38)})`;
      }

      ctx.fill();
    }

    this.animId = requestAnimationFrame(() => this._animate());
  }
}
