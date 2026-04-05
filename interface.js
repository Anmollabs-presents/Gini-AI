/**
 * ═══════════════════════════════════════════════════════════
 *  GINI AI — interface.js
 *  UI Rendering & DOM Control System
 *  Themes, Particles, 3D Tilt, Chat UI, Scroll Reveal
 *  Creator: ANMOL | Lucknow, India
 * ═══════════════════════════════════════════════════════════
 */

const GiniInterface = (function () {

  /* ══════════════════════════════════════
     VIEWPORT HEIGHT FIX
  ══════════════════════════════════════ */
  function _initVH() {
    function setVH() {
      document.documentElement.style.setProperty('--vh', window.innerHeight * 0.01 + 'px');
    }
    setVH();
    window.addEventListener('resize', setVH, { passive: true });
  }

  /* ══════════════════════════════════════
     CURSOR GLOW
  ══════════════════════════════════════ */
  function _initCursorGlow() {
    if (!GiniSettings.FEATURES.cursorGlow) return;
    const glow = document.getElementById('cursor-glow');
    if (!glow || GiniSettings.ENV.isTouch) {
      if (glow) glow.style.display = 'none';
      return;
    }
    let mx = 0, my = 0, cx = 0, cy = 0, raf = null;
    const lerp = (a, b, t) => a + (b - a) * t;
    function animate() {
      cx = lerp(cx, mx, 0.09); cy = lerp(cy, my, 0.09);
      glow.style.left = cx + 'px'; glow.style.top = cy + 'px';
      if (Math.abs(cx - mx) > 0.5 || Math.abs(cy - my) > 0.5) {
        raf = requestAnimationFrame(animate);
      } else raf = null;
    }
    let last = 0;
    window.addEventListener('mousemove', e => {
      const now = Date.now();
      if (now - last < GiniSettings.PERF.cursorGlowThrottleMs) return;
      last = now; mx = e.clientX; my = e.clientY;
      if (!raf) raf = requestAnimationFrame(animate);
    }, { passive: true });
  }

  /* ══════════════════════════════════════
     SCROLL PROGRESS BAR
  ══════════════════════════════════════ */
  function _initScrollProgress() {
    const bar = document.getElementById('scroll-progress');
    if (!bar) return;
    function update() {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      if (h <= 0) return;
      bar.style.width = (window.scrollY / h * 100) + '%';
    }
    window.addEventListener('scroll', update, { passive: true });
  }

  /* ══════════════════════════════════════
     PARTICLES CANVAS
  ══════════════════════════════════════ */
  function _initParticles() {
    if (!GiniSettings.FEATURES.particles) return;
    const cv = document.getElementById('particles');
    if (!cv) return;
    const ctx = cv.getContext('2d');
    let W, H, pts = [];
    const COUNT = GiniSettings.ENV.isMobile
      ? GiniSettings.PERF.particleCountMobile
      : GiniSettings.PERF.particleCountDesktop;

    function resize() { W = cv.width = cv.offsetWidth; H = cv.height = cv.offsetHeight; }
    function mkPt() {
      return {
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.2, vy: (Math.random() - 0.5) * 0.2,
        r: Math.random() * 1.1 + 0.3, a: Math.random() * 0.35 + 0.08,
      };
    }
    function init() { resize(); pts = Array.from({ length: COUNT }, mkPt); }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(170,155,255,${p.a * 0.32})`; ctx.fill();
      });
      requestAnimationFrame(draw);
    }
    let rt;
    window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(init, 200); }, { passive: true });
    init(); draw();
  }

  /* ══════════════════════════════════════
     3D TILT EFFECT
  ══════════════════════════════════════ */
  function _initTilt() {
    if (!GiniSettings.FEATURES.tilt) return;
    const title = document.getElementById('heroTitle');
    if (!title) return;
    const MAX = GiniSettings.PERF.tiltMaxDeg;
    const LERP = GiniSettings.PERF.tiltLerpFactor;
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
    const lerp = (a, b, t) => a + (b - a) * t;

    function applyTilt() {
      cx = lerp(cx, tx, LERP); cy = lerp(cy, ty, LERP);
      title.style.transform = `rotateX(${cy}deg) rotateY(${cx}deg)`;
      if (Math.abs(cx - tx) > 0.01 || Math.abs(cy - ty) > 0.01) {
        raf = requestAnimationFrame(applyTilt);
      } else { raf = null; title.style.transform = `rotateX(${ty}deg) rotateY(${tx}deg)`; }
    }
    function startRaf() { if (!raf) raf = requestAnimationFrame(applyTilt); }

    if (!GiniSettings.ENV.isTouch) {
      let last = 0;
      window.addEventListener('mousemove', e => {
        const now = Date.now();
        if (now - last < GiniSettings.PERF.mouseMoveThrottleMs) return;
        last = now;
        tx = ((e.clientX / window.innerWidth) - 0.5) * 2 * MAX;
        ty = -(((e.clientY / window.innerHeight) - 0.5) * 2 * MAX);
        startRaf();
      }, { passive: true });
      window.addEventListener('mouseleave', () => { tx = 0; ty = 0; startRaf(); });
    }
    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', e => {
        if (e.gamma == null || e.beta == null) return;
        tx = Math.max(-MAX, Math.min(MAX, e.gamma / 10 * MAX));
        ty = Math.max(-MAX, Math.min(MAX, (e.beta - 45) / 10 * MAX));
        startRaf();
      }, { passive: true });
    }
  }

  /* ══════════════════════════════════════
     SCROLL REVEAL ENGINE
  ══════════════════════════════════════ */
  function _initScrollReveal() {
    if (!GiniSettings.FEATURES.scrollReveal) return;
    const hdr = document.getElementById('header');
    const els = document.querySelectorAll('.reveal,.r-left,.r-right');
    let counted = false;

    function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
    function count(el, target, dur = 1500) {
      const s = performance.now();
      (function step(now) {
        const p = Math.min((now - s) / dur, 1);
        el.textContent = Math.round(easeOut(p) * target);
        if (p < 1) requestAnimationFrame(step); else el.textContent = target;
      })(performance.now());
    }

    function onScroll() {
      const sy = window.scrollY, vh = window.innerHeight;
      if (hdr) hdr.classList.toggle('show', sy > vh * 0.45);
      els.forEach(el => { if (el.getBoundingClientRect().top < vh - 60) el.classList.add('in'); });
      if (!counted && GiniSettings.FEATURES.statCounter) {
        const st = document.getElementById('stats');
        if (st && st.getBoundingClientRect().top < vh - 40) {
          counted = true;
          const c1 = document.getElementById('c1');
          const c2 = document.getElementById('c2');
          const c3 = document.getElementById('c3');
          const c4 = document.getElementById('c4');
          if (c1) count(c1, 87);
          if (c2) count(c2, 6);
          if (c3) count(c3, 100);
          if (c4) count(c4, 20);
        }
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('load', onScroll);
    onScroll();
  }

  /* ══════════════════════════════════════
     IMAGE SLIDER
  ══════════════════════════════════════ */
  function _initSlider() {
    const frame = document.querySelector('.slider-frame');
    const sl = document.getElementById('slides');
    const dotsEl = document.getElementById('sliderDots');
    if (!frame || !sl) return;
    const imgs = sl.querySelectorAll('img');
    let idx = 0, dots = [], timer = null;

    imgs.forEach((_, i) => {
      const d = document.createElement('div');
      d.className = 's-dot' + (i === 0 ? ' on' : '');
      d.setAttribute('role', 'tab');
      d.setAttribute('aria-label', 'View ' + (i + 1));
      d.onclick = () => go(i);
      if (dotsEl) dotsEl.appendChild(d);
      dots.push(d);
    });

    function go(i) {
      idx = ((i % imgs.length) + imgs.length) % imgs.length;
      sl.style.transform = `translateX(-${idx * frame.offsetWidth}px)`;
      dots.forEach((d, j) => d.classList.toggle('on', j === idx));
    }
    function start() { if (GiniSettings.FEATURES.autoSlider) timer = setInterval(() => go(idx + 1), GiniSettings.PERF.sliderIntervalMs); }
    function stop() { clearInterval(timer); }

    frame.addEventListener('mouseenter', stop);
    frame.addEventListener('mouseleave', start);

    let ts = 0;
    frame.addEventListener('touchstart', e => { ts = e.touches[0].clientX; }, { passive: true });
    frame.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - ts;
      if (Math.abs(dx) > 40) go(dx > 0 ? idx - 1 : idx + 1);
    });

    window.addEventListener('resize', () => {
      sl.style.transition = 'none';
      go(idx);
      requestAnimationFrame(() => { sl.style.transition = ''; });
    }, { passive: true });

    start();
  }

  /* ══════════════════════════════════════
     UPTIME COUNTER
  ══════════════════════════════════════ */
  function _initUptime() {
    if (!GiniSettings.FEATURES.uptimeCounter) return;
    const el = document.getElementById('uptime');
    if (!el) return;
    const start = Date.now();
    setInterval(() => {
      const s = Math.floor((Date.now() - start) / 1000);
      const m = Math.floor(s / 60), sec = s % 60;
      el.textContent = String(m).padStart(2, '0') + ':' + String(sec).padStart(2, '0');
    }, 1000);
  }

  /* ══════════════════════════════════════
     THEME SWITCHER (8 themes)
  ══════════════════════════════════════ */
  function _initTheme() {
    const html = document.documentElement;
    const btn = document.getElementById('themeBtn');
    const panel = document.getElementById('themePanel');
    const swatches = document.querySelectorAll('.t-sw');
    if (!btn || !panel) return;

    const saved = GiniMemory.getTheme();
    _applyTheme(saved, swatches);

    btn.addEventListener('click', e => {
      e.stopPropagation();
      const open = panel.classList.toggle('open');
      panel.setAttribute('aria-hidden', String(!open));
      btn.style.transform = open ? 'rotate(180deg)' : '';
    });

    document.addEventListener('click', () => {
      panel.classList.remove('open');
      panel.setAttribute('aria-hidden', 'true');
      btn.style.transform = '';
    });

    panel.addEventListener('click', e => e.stopPropagation());

    swatches.forEach(s => {
      s.addEventListener('click', () => {
        _applyTheme(s.dataset.theme, swatches);
        panel.classList.remove('open');
        btn.style.transform = '';
      });
    });
  }

  function _applyTheme(theme, swatches) {
    document.documentElement.setAttribute('data-theme', theme);
    GiniMemory.setTheme(theme);
    swatches?.forEach(s => s.classList.toggle('on', s.dataset.theme === theme));
  }

  /* ══════════════════════════════════════
     CHAT BOX UI SYSTEM
  ══════════════════════════════════════ */
  function _initChat() {
    const chatBubble = document.getElementById('chatBubble');
    const chatBox = document.getElementById('chatBox');
    const closeChat = document.getElementById('closeChat');
    const msgs = document.getElementById('msgs');
    const input = document.getElementById('userInput');
    const sendBtn = document.getElementById('sendBtn');
    const chatStateEl = document.getElementById('chatState');
    const sysStateEl = document.getElementById('sysState');
    const sysIndicator = document.getElementById('sysIndicator');

    if (!chatBubble || !chatBox) return;

    let lastSend = 0;
    const THROTTLE = 800;

    /* Open/Close */
    function openChat() {
      chatBox.classList.add('open');
      chatBox.setAttribute('aria-hidden', 'false');
      chatBubble.setAttribute('aria-expanded', 'true');
      if (msgs && msgs.children.length === 0) {
        const name = GiniMemory.getUserName();
        const greeting = name
          ? `Hello ${name}! I'm Gini AI. How can I help you today? 🤖`
          : "Hello! I'm Gini AI — created by ANMOL. Ask me anything! 🤖";
        setTimeout(() => typeMessage(msgs, greeting, () => {}), 200);
      }
      setTimeout(() => input?.focus(), 300);
    }

    function closeC() {
      chatBox.classList.remove('open');
      chatBox.setAttribute('aria-hidden', 'true');
      chatBubble.setAttribute('aria-expanded', 'false');
    }

    chatBubble.addEventListener('click', openChat);
    closeChat?.addEventListener('click', closeC);

    /* Keyboard - Enter to send */
    input?.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
    });
    sendBtn?.addEventListener('click', handleSend);

    /* Expose openChat globally for nav button */
    window.openChat = openChat;

    /* Wire Engine events to UI */
    GiniEngine.on('stateChange', ({ to }) => {
      const map = {
        PROCESSING: 'Processing...',
        RESPONDING: 'Responding...',
        IDLE: 'Ready',
        EXECUTING: 'Processing...',
      };
      if (chatStateEl) chatStateEl.textContent = map[to] || 'Ready';
      if (sysStateEl) {
        if (to === 'PROCESSING' || to === 'EXECUTING' || to === 'RESPONDING') {
          sysStateEl.textContent = to === 'RESPONDING' ? 'Responding' : 'Processing';
          if (sysIndicator) sysIndicator.className = 'status-indicator processing';
        } else {
          sysStateEl.textContent = 'Online';
          if (sysIndicator) sysIndicator.className = 'status-indicator';
        }
      }
    });

    GiniEngine.on('userInput', ({ text }) => {
      addUserMsg(msgs, text);
    });

    GiniEngine.on('typingStart', () => {
      showTyping(msgs);
    });

    GiniEngine.on('typingEnd', () => {
      removeTyping();
    });

    GiniEngine.on('response', ({ text }) => {
      removeTyping();
      typeMessage(msgs, text, () => {
        if (sendBtn) sendBtn.disabled = false;
      });
    });

    GiniEngine.on('processingEnd', () => {
      if (sendBtn) sendBtn.disabled = false;
    });

    /* Send handler */
    async function handleSend() {
      const now = Date.now();
      if (now - lastSend < THROTTLE) return;
      lastSend = now;
      const raw = input?.value?.trim();
      if (!raw || GiniEngine.isBusy()) return;

      if (input) input.value = '';
      if (sendBtn) sendBtn.disabled = true;

      await GiniEngine.process(raw);
    }
  }

  /* ══════════════════════════════════════
     CHAT MESSAGE RENDERERS
  ══════════════════════════════════════ */
  function addUserMsg(container, text) {
    if (!container) return;
    const d = document.createElement('div');
    d.className = 'm u';
    d.textContent = text;
    container.appendChild(d);
    _scrollDown(container);
  }

  function typeMessage(container, text, cb) {
    if (!container) { if (cb) cb(); return; }
    const d = document.createElement('div');
    d.className = 'm g';
    const cursor = document.createElement('span');
    cursor.className = 'cursor-blink';
    d.appendChild(cursor);
    container.appendChild(d);
    _scrollDown(container);

    let i = 0;
    const BASE = 18, PUNCT = 100;
    function next() {
      if (i >= text.length) { cursor.remove(); if (cb) cb(); return; }
      const ch = text[i];
      d.insertBefore(document.createTextNode(ch), cursor);
      i++; _scrollDown(container);
      const pause = /[.!?]/.test(ch) && i < text.length ? PUNCT : /[,;:]/.test(ch) ? 50 : BASE;
      setTimeout(next, pause);
    }
    next();
  }

  function showTyping(container) {
    if (!container) return;
    const t = document.createElement('div');
    t.className = 'typing-bubble'; t.id = 'typingBubble';
    for (let i = 0; i < 3; i++) {
      const d = document.createElement('div'); d.className = 'td'; t.appendChild(d);
    }
    container.appendChild(t);
    _scrollDown(container);
  }

  function removeTyping() {
    const t = document.getElementById('typingBubble');
    if (t) t.remove();
  }

  function _scrollDown(container) {
    if (container) container.scrollTop = container.scrollHeight;
  }

  /* ══════════════════════════════════════
     FEATURES PAGE: IntersectionObserver
  ══════════════════════════════════════ */
  function _initFeaturesObserver() {
    function observe(selector, threshold = 0.12) {
      const els = document.querySelectorAll(selector);
      if (!els.length) return;
      const io = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
        });
      }, { threshold });
      els.forEach(el => io.observe(el));
    }

    observe('.feat-card');
    observe('.tech-card');
    observe('.rm-item');

    // Staggered feature cards
    document.querySelectorAll('.feat-card').forEach((c, i) => {
      c.style.transition = `opacity .5s ${i * 0.07}s, transform .5s ${i * 0.07}s, background .22s, border-color .22s, box-shadow .22s`;
    });
    document.querySelectorAll('.tech-card').forEach((c, i) => {
      c.style.transition = `opacity .5s ${i * 0.05}s, transform .5s ${i * 0.05}s, background .2s, border-color .2s`;
    });

    // Staggered f-tags
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
  }

  /* ══════════════════════════════════════
     MASTER INIT
  ══════════════════════════════════════ */
  function init() {
    _initVH();
    _initCursorGlow();
    _initScrollProgress();
    _initParticles();
    _initTilt();
    _initScrollReveal();
    _initSlider();
    _initUptime();
    _initTheme();
    _initChat();
    _initFeaturesObserver();
    GiniSettings.DEBUG.log('info', 'GiniInterface initialized');
  }

  /* ── Public API ── */
  return Object.freeze({
    init,
    addUserMsg,
    typeMessage,
    showTyping,
    removeTyping,
  });

})();

if (typeof module !== 'undefined' && module.exports) module.exports = GiniInterface;
