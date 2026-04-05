/**
 * ═══════════════════════════════════════════════════════════
 *  GINI AI — memory.js
 *  Structured localStorage Memory System
 *  Creator: ANMOL | Lucknow, India
 * ═══════════════════════════════════════════════════════════
 */

const GiniMemory = (function () {

  const PREFIX = 'gini_v2_';

  const KEYS = {
    USER_PREFERENCES: 'user_preferences',
    INTERACTION_HISTORY: 'interaction_history',
    CUSTOM_COMMANDS: 'custom_commands',
    THEME: 'theme',
    USER_NAME: 'user_name',
  };

  /* ── Safe Read ── */
  function _read(key) {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      if (raw === null) return null;
      return JSON.parse(raw);
    } catch (e) {
      GiniSettings.DEBUG.log('warn', 'Memory read error:', key, e);
      return null;
    }
  }

  /* ── Safe Write ── */
  function _write(key, value) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
      return true;
    } catch (e) {
      GiniSettings.DEBUG.log('warn', 'Memory write error:', key, e);
      return false;
    }
  }

  /* ── Safe Delete ── */
  function _remove(key) {
    try {
      localStorage.removeItem(PREFIX + key);
      return true;
    } catch (e) {
      return false;
    }
  }

  /* ── User Preferences ── */
  function getPreferences() {
    return _read(KEYS.USER_PREFERENCES) || {};
  }

  function setPreference(key, value) {
    const prefs = getPreferences();
    prefs[key] = value;
    return _write(KEYS.USER_PREFERENCES, prefs);
  }

  function getPreference(key, defaultValue = null) {
    return getPreferences()[key] ?? defaultValue;
  }

  /* ── Interaction History ── */
  function getHistory() {
    return _read(KEYS.INTERACTION_HISTORY) || [];
  }

  function appendHistory(entry) {
    const history = getHistory();
    history.push({ ...entry, timestamp: Date.now() });
    const max = GiniSettings.API.maxHistoryTurns;
    const trimmed = history.slice(-max);
    return _write(KEYS.INTERACTION_HISTORY, trimmed);
  }

  function clearHistory() {
    return _write(KEYS.INTERACTION_HISTORY, []);
  }

  /* ── Custom Commands ── */
  function getCustomCommands() {
    return _read(KEYS.CUSTOM_COMMANDS) || {};
  }

  function setCustomCommand(trigger, response) {
    const cmds = getCustomCommands();
    cmds[trigger.toLowerCase().trim()] = response;
    return _write(KEYS.CUSTOM_COMMANDS, cmds);
  }

  function matchCustomCommand(input) {
    const cmds = getCustomCommands();
    const lower = input.toLowerCase().trim();
    return cmds[lower] || null;
  }

  /* ── Theme ── */
  function getTheme() {
    return _read(KEYS.THEME) || 'dark';
  }

  function setTheme(theme) {
    return _write(KEYS.THEME, theme);
  }

  /* ── User Name ── */
  function getUserName() {
    return _read(KEYS.USER_NAME) || null;
  }

  function setUserName(name) {
    return _write(KEYS.USER_NAME, name);
  }

  /* ── Generic Getters/Setters (for engine bridge) ── */
  function get(key) {
    return _read(key);
  }

  function set(key, value) {
    return _write(key, value);
  }

  /* ── Public API ── */
  return Object.freeze({
    KEYS,
    getPreferences,
    setPreference,
    getPreference,
    getHistory,
    appendHistory,
    clearHistory,
    getCustomCommands,
    setCustomCommand,
    matchCustomCommand,
    getTheme,
    setTheme,
    getUserName,
    setUserName,
    get,
    set,
  });

})();

if (typeof module !== 'undefined' && module.exports) module.exports = GiniMemory;
