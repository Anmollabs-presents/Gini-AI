/**
 * ═══════════════════════════════════════════════════════════
 *  GINI AI — engine.js
 *  Central Orchestrator — Finite State Machine
 *  Decision Router: Local ↔ Grok API
 *  Creator: ANMOL | Lucknow, India
 * ═══════════════════════════════════════════════════════════
 *
 *  STATE MACHINE:
 *  IDLE → LISTENING → PROCESSING → EXECUTING → RESPONDING → IDLE
 */

const GiniEngine = (function () {

  /* ══════════════════════════════════════
     FINITE STATE MACHINE
  ══════════════════════════════════════ */
  const STATES = Object.freeze({
    IDLE:       'IDLE',
    LISTENING:  'LISTENING',
    PROCESSING: 'PROCESSING',
    EXECUTING:  'EXECUTING',
    RESPONDING: 'RESPONDING',
  });

  let _currentState = STATES.IDLE;
  let _isBusy = false;
  const _listeners = {};

  /* ── State Transitions ── */
  function _setState(newState) {
    if (_currentState === newState) return;
    const prevState = _currentState;
    _currentState = newState;
    GiniSettings.DEBUG.log('info', `State: ${prevState} → ${newState}`);
    _emit('stateChange', { from: prevState, to: newState });
  }

  function getState() { return _currentState; }
  function isBusy()   { return _isBusy; }

  /* ══════════════════════════════════════
     EVENT BUS (no direct DOM manipulation)
  ══════════════════════════════════════ */
  function _emit(event, data) {
    const handlers = _listeners[event] || [];
    handlers.forEach(fn => {
      try { fn(data); } catch (e) {
        GiniSettings.DEBUG.log('error', 'Event handler error:', event, e);
      }
    });
  }

  function on(event, handler) {
    if (!_listeners[event]) _listeners[event] = [];
    _listeners[event].push(handler);
  }

  function off(event, handler) {
    if (!_listeners[event]) return;
    _listeners[event] = _listeners[event].filter(fn => fn !== handler);
  }

  /* ══════════════════════════════════════
     MODULE REGISTRY
  ══════════════════════════════════════ */
  const _modules = {};

  function registerModule(name, module) {
    if (_modules[name]) {
      GiniSettings.DEBUG.log('warn', `Module '${name}' already registered. Overwriting.`);
    }
    _modules[name] = module;
    GiniSettings.DEBUG.log('info', `Module registered: ${name}`);
  }

  function getModule(name) {
    return _modules[name] || null;
  }

  /* ══════════════════════════════════════
     CORE DECISION ROUTER
  ══════════════════════════════════════ */

  /**
   * Process user input through the FSM
   * @param {string} rawInput
   * @returns {Promise<void>}
   */
  async function process(rawInput) {
    if (_isBusy) return;
    if (!rawInput || !rawInput.trim()) return;

    const input = rawInput.trim();
    _isBusy = true;

    /* Transition: IDLE → LISTENING */
    _setState(STATES.LISTENING);
    _emit('userInput', { text: input });

    /* Transition: LISTENING → PROCESSING */
    _setState(STATES.PROCESSING);
    _emit('processingStart', {});

    /* ── Step 1: Check registered feature modules first ── */
    const featureModuleNames = Object.keys(_modules);
    let handledByFeature = false;

    for (const modName of featureModuleNames) {
      const mod = _modules[modName];
      if (mod && typeof mod.canHandle === 'function' && mod.canHandle(input)) {
        if (typeof mod.handle === 'function') {
          _setState(STATES.EXECUTING);
          const result = mod.handle(input);
          if (result) {
            _setState(STATES.RESPONDING);
            _emit('response', { text: result, source: 'feature:' + modName });
            _finalize();
            handledByFeature = true;
            break;
          }
        }
      }
    }

    if (handledByFeature) return;

    /* ── Step 2: NLU Classification (fallback) ── */
    const classified = GiniNLU.classify(input);
    GiniSettings.DEBUG.log('info', 'NLU result:', classified);

    /* Decision: Local or API? */
    if (classified.isLocal) {
      _setState(STATES.EXECUTING);
      await _executeLocal(classified);
    } else {
      _setState(STATES.EXECUTING);
      await _executeAPI(classified);
    }
  }

  /* ── Local Execution ── */
  async function _executeLocal(classified) {
    const response = GiniNLU.resolveLocal(classified.intent, classified.match);

    if (response) {
      _setState(STATES.RESPONDING);
      _emit('response', { text: response, source: 'local' });
    } else {
      // Fallback to API if local resolution fails
      GiniSettings.DEBUG.log('info', 'Local resolution failed, routing to API');
      await _executeAPI(classified);
      return;
    }

    _finalize();
  }

  /* ── API Execution ── */
  async function _executeAPI(classified) {
    _emit('typingStart', {});

    const result = await GiniAPI.send(classified.normalized || classified.raw);

    _emit('typingEnd', {});
    _setState(STATES.RESPONDING);

    if (result.success) {
      _emit('response', { text: result.reply, source: 'api' });
    } else {
      _emit('response', { text: result.error, source: 'error' });
    }

    _finalize();
  }

  /* ── Finalize ── */
  function _finalize() {
    _setState(STATES.IDLE);
    _isBusy = false;
    _emit('processingEnd', {});
  }

  /* ══════════════════════════════════════
     INITIALIZATION
  ══════════════════════════════════════ */
  function init() {
    GiniSettings.DEBUG.log('info', 'GiniEngine initialized. State:', _currentState);
    _emit('ready', { version: 'v2.0', state: _currentState });
  }

  /* ── Public API ── */
  return Object.freeze({
    STATES,
    init,
    process,
    getState,
    isBusy,
    on,
    off,
    registerModule,
    getModule,
  });

})();

if (typeof module !== 'undefined' && module.exports) module.exports = GiniEngine;
