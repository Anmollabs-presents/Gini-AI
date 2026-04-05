/* Animations — intersection observer + stat counters */
class AnimationController {
  constructor() {
    this._initFadeUp();
    this._initStatCounters();
    this._initMetricBars();
    this._initSmoothScroll();
  }

  /* ── Fade-up on scroll ─────────────────────────── */
  _initFadeUp() {
    const els = document.querySelectorAll('.fade-up');

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const delay = parseInt(el.dataset.delay || '0', 10);
        setTimeout(() => el.classList.add('visible'), delay);
        io.unobserve(el);
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -20px 0px' });

    els.forEach(el => {
      const inHero = el.closest('.hero');
      if (inHero) {
        // Hero elements animate in on page load
        const delay = parseInt(el.dataset.delay || '0', 10) + 120;
        setTimeout(() => el.classList.add('visible'), delay);
      } else {
        io.observe(el);
      }
    });
  }

  /* ── Metric bar fills ───────────────────────────── */
  _initMetricBars() {
    const cards = document.querySelectorAll('.metric-card');

    // Hero metric cards: animate immediately
    cards.forEach(card => {
      if (card.closest('.hero')) {
        setTimeout(() => card.classList.add('in-view'), 800);
        return;
      }
    });

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    cards.forEach(c => {
      if (!c.closest('.hero')) io.observe(c);
    });
  }

  /* ── Stat number counters ───────────────────────── */
  _initStatCounters() {
    const els = document.querySelectorAll('.stat-num[data-target]');
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        this._countUp(entry.target);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.3 });
    els.forEach(el => io.observe(el));
  }

  _countUp(el) {
    const target = parseFloat(el.dataset.target);
    const suffix = el.dataset.suffix || '';
    const scale = parseFloat(el.dataset.scale || '1');
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const duration = 1800;
    const start = performance.now();

    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const value = target * ease / scale;

      el.textContent = decimals > 0
        ? value.toFixed(decimals) + suffix
        : Math.floor(value) + suffix;

      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = (decimals > 0 ? (target / scale).toFixed(decimals) : Math.floor(target / scale)) + suffix;
    };

    requestAnimationFrame(tick);
  }

  /* ── Smooth scroll anchors ──────────────────────── */
  _initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const href = a.getAttribute('href');
        if (href === '#') return;
        const target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }
}
