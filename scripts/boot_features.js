/**
 * ═══════════════════════════════════════════════════════════
 *  GINI AI — boot_features.js
 *  Lightweight Boot Script — features.html
 *  No engine or API — only theme, scroll reveal, animations
 *  Creator: ANMOL | Lucknow, India
 * ═══════════════════════════════════════════════════════════
 */

(function GiniFeaturesBoot() {

  'use strict';

  function boot() {

    /* ── Scroll progress ── */
    (function () {
      const bar = document.getElementById('scroll-progress');
      if (!bar) return;
      function update() {
        const h = document.documentElement.scrollHeight - window.innerHeight;
        if (h <= 0) return;
        bar.style.width = (window.scrollY / h * 100) + '%';
      }
      window.addEventListener('scroll', update, { passive: true });
    })();

    /* ── Scroll reveal via IntersectionObserver ── */
    (function () {
      function observe(selector, threshold) {
        const els = document.querySelectorAll(selector);
        if (!els.length) return;
        const io = new IntersectionObserver(entries => {
          entries.forEach(e => {
            if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
          });
        }, { threshold: threshold || 0.12 });
        els.forEach(el => io.observe(el));
      }

      observe('.feat-card');
      observe('.tech-card');
      observe('.rm-item');

      /* Stagger feat-cards */
      document.querySelectorAll('.feat-card').forEach((c, i) => {
        c.style.transition = `opacity .5s ${i * 0.07}s, transform .5s ${i * 0.07}s, background .22s, border-color .22s, box-shadow .22s`;
      });

      /* Stagger tech-cards */
      document.querySelectorAll('.tech-card').forEach((c, i) => {
        c.style.transition = `opacity .5s ${i * 0.05}s, transform .5s ${i * 0.05}s, background .2s, border-color .2s`;
      });

      /* Stagger f-tags */
      const tags = document.querySelectorAll('.f-tag');
      if (tags.length) {
        const tio = new IntersectionObserver(entries => {
          entries.forEach(e => {
            if (e.isIntersecting) {
              tags.forEach((t, i) => setTimeout(() => t.classList.add('in'), i * 55));
              tio.disconnect();
            }
          });
        }, { threshold: 0.1 });
        const container = document.querySelector('.future-tags');
        if (container) tio.observe(container);
      }
    })();

    /* ── Theme switcher ── */
    (function () {
      const html = document.documentElement;
      const btn = document.getElementById('themeBtn');
      const panel = document.getElementById('themePanel');
      const swatches = document.querySelectorAll('.t-sw');
      if (!btn || !panel) return;

      /* Apply saved theme */
      const saved = (typeof GiniMemory !== 'undefined')
        ? GiniMemory.getTheme()
        : (localStorage.getItem('gini_v2_theme') || 'dark');

      applyTheme(saved);

      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        const open = panel.classList.toggle('open');
        panel.setAttribute('aria-hidden', String(!open));
        btn.setAttribute('aria-expanded', String(open));
        btn.style.transform = open ? 'rotate(180deg)' : '';
      });

      document.addEventListener('click', function () {
        panel.classList.remove('open');
        panel.setAttribute('aria-hidden', 'true');
        btn.setAttribute('aria-expanded', 'false');
        btn.style.transform = '';
      });

      panel.addEventListener('click', function (e) { e.stopPropagation(); });

      swatches.forEach(function (s) {
        s.addEventListener('click', function () {
          applyTheme(s.dataset.theme);
          panel.classList.remove('open');
          btn.setAttribute('aria-expanded', 'false');
          btn.style.transform = '';
        });
      });

      function applyTheme(theme) {
        html.setAttribute('data-theme', theme);
        localStorage.setItem('gini_v2_theme', theme);
        swatches.forEach(function (s) {
          s.classList.toggle('on', s.dataset.theme === theme);
        });
      }
    })();

    /* ── Signal boot complete ── */
    document.dispatchEvent(new CustomEvent('gini:features:ready', {
      detail: { page: 'features', timestamp: Date.now() }
    }));
  }

  /* ── Boot on DOMContentLoaded ── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
