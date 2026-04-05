/**
 * ═══════════════════════════════════════════════════════════
 *  GINI AI — modules/features/feature_memory.js
 *  User Memory — Name Storage, Recall & Custom Commands
 *  Creator: ANMOL | Lucknow, India
 * ═══════════════════════════════════════════════════════════
 */

const FeatureUserMemory = (function () {

  const NAME = 'user_memory';

  const PATTERNS = [
    /(?:my name is|i(?:'m| am) called|call me|mera naam(?:\s+hai)?)\s+([a-z\u0900-\u097f]+)/i,
    /\b(what(?:'s| is) my name|do you know my name|remember my name|mera naam kya)\b/i,
    /\b(forget my name|clear my memory|reset memory)\b/i,
  ];

  function handle(input) {
    const lower = input.toLowerCase();

    // Name set
    const setMatch = lower.match(
      /(?:my name is|i(?:'m| am) called|call me|mera naam(?:\s+hai)?)\s+([a-z\u0900-\u097f]+)/i
    );
    if (setMatch) {
      const raw = setMatch[1];
      const name = raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
      GiniMemory.setUserName(name);
      return `Got it — I'll remember you as ${name}. 👋`;
    }

    // Name recall
    if (/\b(what(?:'s| is) my name|do you know my name|remember my name|mera naam kya)\b/.test(lower)) {
      const name = GiniMemory.getUserName();
      if (name) return `Your name is ${name}. I remember! 🙂`;
      return "I don't have your name stored yet. Tell me with 'My name is ...'.";
    }

    // Forget
    if (/\b(forget my name|clear my memory|reset memory)\b/.test(lower)) {
      GiniMemory.setUserName(null);
      GiniMemory.clearHistory();
      return 'Done — I\'ve cleared your stored name and conversation history. Fresh start! 🔄';
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

if (typeof GiniEngine !== 'undefined') FeatureUserMemory.register();
if (typeof module !== 'undefined' && module.exports) module.exports = FeatureUserMemory;
