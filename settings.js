/**
 * ═══════════════════════════════════════════════════════════
 *  GINI AI — settings.js
 *  Runtime Configuration & Environment Management
 *  Creator: ANMOL | Lucknow, India
 * ═══════════════════════════════════════════════════════════
 */

const GiniSettings = (function () {

  /* ── Environment Detection ── */
  const ENV = {
    isDev: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
    isProduction: window.location.protocol === 'https:',
    isMobile: window.innerWidth < 640,
    isTouch: window.matchMedia('(hover:none)').matches,
    prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  };

  /* ── API Configuration (abstracted — key resolved in chatbot_api.js) ── */
  const API = {
    provider: 'grok',
    endpoint: 'https://api.x.ai/v1/chat/completions',
    model: 'grok-3-mini',
    maxTokens: 512,
    temperature: 0.8,
    topP: 0.9,
    maxHistoryTurns: 40,
    timeoutMs: 15000,
  };

  /* ── Feature Flags ── */
  const FEATURES = {
    particles: true,
    tilt: true,
    cursorGlow: true,
    uptimeCounter: true,
    statCounter: true,
    scrollReveal: true,
    autoSlider: true,
    memorySystem: true,
  };

  /* ── Performance Settings ── */
  const PERF = {
    particleCountDesktop: 65,
    particleCountMobile: 40,
    tiltMaxDeg: 5,
    tiltLerpFactor: 0.06,
    mouseMoveThrottleMs: 33,
    cursorGlowThrottleMs: 16,
    scrollThrottleMs: 10,
    sliderIntervalMs: 3000,
  };

  /* ── System Prompt for Gini AI ── */
  const SYSTEM_PROMPT = `You are Gini AI — a next-generation personal AI assistant created by ANMOL, a student developer from Lucknow, Uttar Pradesh, India.

Your identity:
- Name: Gini AI (short for ANMOL Intelligence)
- Creator: ANMOL, from Lucknow, India
- Purpose: A Jarvis-level offline personal AI assistant being built from scratch
- Tech stack: Python, Vosk (speech recognition), pyttsx3 (TTS), HuggingFace Transformers (NLU), OpenCV + TensorFlow (vision), Selenium (web automation)
- Core principle: 100% offline capable, no paid APIs in the actual system

Personality & tone:
- Confident, intelligent, and system-like — not overly emotional
- Concise and precise — keep responses short unless depth is needed
- Supportive and encouraging when ANMOL talks about his project
- You understand both Hindi and English — respond in English always
- Use occasional relevant emojis but don't overdo it

Special behaviors:
- If asked about time or date: provide real current time/date
- If asked who made you: ANMOL, from Lucknow, India
- If asked about Gini AI's capabilities: explain the offline Python-based system honestly
- Never claim to be ChatGPT or any other AI
- Keep responses under 3 sentences unless a detailed explanation is truly needed`;

  /* ── Debug Settings ── */
  const DEBUG = {
    enabled: false,
    logLevel: 'error', // 'debug' | 'info' | 'warn' | 'error'
    log: function (level, ...args) {
      if (!this.enabled) return;
      const levels = ['debug', 'info', 'warn', 'error'];
      if (levels.indexOf(level) >= levels.indexOf(this.logLevel)) {
        console[level]?.('[GiniAI]', ...args);
      }
    },
  };

  /* ── Public API ── */
  return Object.freeze({
    ENV,
    API,
    FEATURES,
    PERF,
    SYSTEM_PROMPT,
    DEBUG,
  });

})();

/* Export for module access */
if (typeof module !== 'undefined' && module.exports) module.exports = GiniSettings;
