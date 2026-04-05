/**
 * ═══════════════════════════════════════════════════════════
 *  GINI AI — modules/features/feature_time.js
 *  Time & Date Feature Module — Isolated & Reusable
 *  Creator: ANMOL | Lucknow, India
 * ═══════════════════════════════════════════════════════════
 */

const FeatureTime = (function () {

  const NAME = 'time';

  /* ── Intent patterns this feature handles ── */
  const PATTERNS = [
    /\b(time|current time|what time|kitna baja|time batao|samay)\b/i,
    /\b(date|today|what day|aaj|current date|aaj ka date|tarikh)\b/i,
    /\b(day|week|month|year|aaj kya din)\b/i,
  ];

  /* ── Handlers ── */
  function getTime() {
    return new Date().toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }

  function getDate() {
    return new Date().toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  function getDateTime() {
    return `${getDate()} at ${getTime()}`;
  }

  /**
   * Handle an input and return a response string or null
   * @param {string} input - normalized input
   * @returns {string|null}
   */
  function handle(input) {
    const lower = input.toLowerCase();

    if (/\b(time|kitna baja|time batao|samay)\b/.test(lower)) {
      return `Current time: ${getTime()} ⏰`;
    }

    if (/\b(date|aaj ka date|tarikh|today|what day|aaj)\b/.test(lower)) {
      return `Today is ${getDate()} 📅`;
    }

    if (/\b(day and time|date and time|full time|complete time)\b/.test(lower)) {
      return `${getDateTime()} 🕐`;
    }

    return null;
  }

  /**
   * Check if this feature can handle an input
   * @param {string} input
   * @returns {boolean}
   */
  function canHandle(input) {
    return PATTERNS.some(p => p.test(input));
  }

  /* ── Register with engine ── */
  function register() {
    GiniEngine.registerModule(NAME, {
      name: NAME,
      canHandle,
      handle,
      isLocal: true,
    });
  }

  return Object.freeze({ NAME, canHandle, handle, register, getTime, getDate });

})();

// Auto-register when engine is ready
if (typeof GiniEngine !== 'undefined') FeatureTime.register();

if (typeof module !== 'undefined' && module.exports) module.exports = FeatureTime;
