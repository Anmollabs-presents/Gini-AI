/**
 * ═══════════════════════════════════════════════════════════
 *  GINI AI — modules/features/feature_greetings.js
 *  Greeting & Farewell Feature Module
 *  Creator: ANMOL | Lucknow, India
 * ═══════════════════════════════════════════════════════════
 */

const FeatureGreetings = (function () {

  const NAME = 'greetings';

  const PATTERNS = [
    /^(hi|hello|hey|namaste|namaskar|yo|sup|hii|helo|kya haal|kaise ho)\b/i,
    /\b(bye|goodbye|alvida|cya|see you|tata|ok bye|ok thanks|shukriya|dhanyawad|thank you|thanks)\b/i,
    /\b(good morning|good night|good evening|good afternoon|subah|raat|shaam)\b/i,
  ];

  function _getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    if (h < 21) return 'Good evening';
    return 'Good night';
  }

  function handle(input) {
    const lower = input.toLowerCase();
    const name = GiniMemory.getUserName();
    const nameStr = name ? `, ${name}` : '';

    // Farewell
    if (/\b(bye|goodbye|alvida|cya|see you|tata)\b/.test(lower)) {
      return `Goodbye${nameStr}! 👋 Come back anytime.`;
    }

    // Thank you
    if (/\b(thank you|thanks|shukriya|dhanyawad)\b/.test(lower)) {
      return `You're welcome${nameStr}! 😊 Anything else I can help with?`;
    }

    // Time-aware greeting
    if (/\b(good morning|subah)\b/.test(lower)) {
      return `Good morning${nameStr}! ☀️ Ready to get things done?`;
    }
    if (/\b(good night|raat)\b/.test(lower)) {
      return `Good night${nameStr}! 🌙 Rest well.`;
    }
    if (/\b(good evening|shaam|good afternoon)\b/.test(lower)) {
      return `${_getGreeting()}${nameStr}! 🌆 How can I assist you?`;
    }

    // How are you
    if (/\b(kya haal|kaise ho|how are you|how r u)\b/.test(lower)) {
      return `All systems nominal${nameStr}! ⚡ Processing at full capacity. How can I help?`;
    }

    // Generic hello
    if (/^(hi|hello|hey|namaste|namaskar|yo|sup|hii|helo)\b/.test(lower)) {
      return `${_getGreeting()}${nameStr}! I'm Gini AI. 🤖 How can I help you today?`;
    }

    return null;
  }

  function canHandle(input) {
    return PATTERNS.some(p => p.test(input));
  }

  function register() {
    GiniEngine.registerModule(NAME, {
      name: NAME,
      canHandle,
      handle,
      isLocal: true,
    });
  }

  return Object.freeze({ NAME, canHandle, handle, register });

})();

if (typeof GiniEngine !== 'undefined') FeatureGreetings.register();
if (typeof module !== 'undefined' && module.exports) module.exports = FeatureGreetings;
