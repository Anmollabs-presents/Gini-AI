/**
 * ═══════════════════════════════════════════════════════════
 *  GINI AI — modules/features/feature_identity.js
 *  Identity, Creator & Capability Feature Module
 *  Creator: ANMOL | Lucknow, India
 * ═══════════════════════════════════════════════════════════
 */

const FeatureIdentity = (function () {

  const NAME = 'identity';

  const PATTERNS = [
    /\b(who are you|what are you|your name|tumhara naam|aapka naam)\b/i,
    /\b(who made you|who built you|creator|developer|banaya|kisne|anmol)\b/i,
    /\b(what can you do|capabilities|features|help me|kya kar sakte)\b/i,
    /\b(are you (an )?ai|are you human|are you real|are you gini)\b/i,
  ];

  function handle(input) {
    const lower = input.toLowerCase();

    if (/\b(who made you|who built you|creator|developer|banaya|kisne)\b/.test(lower)) {
      return 'I was created by ANMOL — a student developer from Lucknow, Uttar Pradesh, India. 🇮🇳 He is building me as a Jarvis-level offline AI assistant from scratch.';
    }

    if (/\b(who are you|what are you|are you gini)\b/.test(lower)) {
      return "I'm Gini AI — a next-generation personal AI assistant created by ANMOL. I run on Grok for this web demo, but my actual system is 100% offline using Python, Vosk, pyttsx3, and Transformers. 🤖";
    }

    if (/\b(your name|tumhara naam|aapka naam)\b/.test(lower)) {
      return "My name is Gini AI — short for ANMOL Intelligence. 🌟";
    }

    if (/\b(are you (an )?ai|are you human|are you real)\b/.test(lower)) {
      return "Yes, I'm an AI — specifically Gini AI, built by ANMOL. Not human, but engineered to be genuinely useful. 🤖";
    }

    if (/\b(what can you do|capabilities|features|kya kar sakte)\b/.test(lower)) {
      return "I can answer questions, help with tasks, remember your name, tell time & date, and have intelligent conversations. My full offline system adds voice I/O, web automation, computer vision, and more. ⚙️";
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

if (typeof GiniEngine !== 'undefined') FeatureIdentity.register();
if (typeof module !== 'undefined' && module.exports) module.exports = FeatureIdentity;
