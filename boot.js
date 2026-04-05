/**
 * ═══════════════════════════════════════════════════════════
 *  GINI AI — boot.js
 *  Master Boot Script — index.html
 *  Initializes full system in correct dependency order
 *  Creator: ANMOL | Lucknow, India
 * ═══════════════════════════════════════════════════════════
 */

(function GiniBoot() {

  'use strict';

  /* ── Verify all core modules are loaded ── */
  const REQUIRED_MODULES = [
    'GiniSettings',
    'GiniMemory',
    'GiniNLU',
    'GiniAPI',
    'GiniEngine',
    'GiniInterface',
    'GiniBridge',
  ];

  function verifyModules() {
    const missing = REQUIRED_MODULES.filter(name => typeof window[name] === 'undefined');
    if (missing.length > 0) {
      console.error('[GiniAI Boot] Missing modules:', missing.join(', '));
      return false;
    }
    return true;
  }

  /* ── Wire nav buttons to openChat ── */
  function wireNavButtons() {
    // Nav CTA button
    const navCta = document.getElementById('navCta');
    if (navCta) {
      navCta.addEventListener('click', function (e) {
        e.preventDefault();
        if (typeof window.openChat === 'function') window.openChat();
      });
    }

    // Mobile nav button
    const navMobileBtn = document.getElementById('navMobileBtn');
    if (navMobileBtn) {
      navMobileBtn.addEventListener('click', function () {
        if (typeof window.openChat === 'function') window.openChat();
      });
    }
  }

  /* ── Register feature modules with engine ── */
  function registerFeatures() {
    // Features register themselves on load, but we re-confirm here
    const featureModules = [
      { name: 'FeatureTime',        mod: window.FeatureTime },
      { name: 'FeatureIdentity',    mod: window.FeatureIdentity },
      { name: 'FeatureUserMemory',  mod: window.FeatureUserMemory },
      { name: 'FeatureGreetings',   mod: window.FeatureGreetings },
    ];

    featureModules.forEach(({ name, mod }) => {
      if (mod && typeof mod.register === 'function') {
        mod.register();
        GiniSettings.DEBUG.log('info', `Feature registered: ${name}`);
      }
    });
  }

  /* ── Upgrade engine.process to check feature modules first ── */
  function patchEngineWithFeatures() {
    // Monkey-patch is not allowed on frozen objects.
    // Instead, we hook into the engine event bus to intercept PROCESSING state
    // and route to feature modules before the default NLU pipeline.
    // This is handled inside engine.js via the module registry pattern.
    // Feature modules are already registered via GiniEngine.registerModule().

    // Override the engine's _executeLocal with feature module routing
    // (Engine checks registered modules in its process() flow)
    GiniSettings.DEBUG.log('info', 'Feature module routing active');
  }

  /* ── System capability log ── */
  function logCapabilities() {
    if (!GiniSettings.DEBUG.enabled) return;
    const caps = GiniCppBridge.getSystemCapabilities();
    GiniSettings.DEBUG.log('info', 'System capabilities:', caps);
    GiniSettings.DEBUG.log('info', 'Bridge status:', GiniBridge.getStatus());
    GiniSettings.DEBUG.log('info', 'API history length:', GiniAPI.getHistoryLength());
  }

  /* ══════════════════════════════════════
     MAIN BOOT SEQUENCE
  ══════════════════════════════════════ */
  function boot() {

    /* 1. Verify all modules loaded */
    if (!verifyModules()) return;

    /* 2. Initialize engine (FSM) */
    GiniEngine.init();

    /* 3. Register feature modules */
    registerFeatures();
    patchEngineWithFeatures();

    /* 4. Initialize UI (DOM-dependent — must be last) */
    GiniInterface.init();

    /* 5. Wire navigation buttons */
    wireNavButtons();

    /* 6. Log capabilities in debug mode */
    logCapabilities();

    /* 7. Signal boot complete */
    GiniSettings.DEBUG.log('info', '✅ Gini AI v2.0 — Boot complete');

    /* 8. Dispatch custom event for any external listeners */
    document.dispatchEvent(new CustomEvent('gini:ready', {
      detail: { version: '2.0', timestamp: Date.now() }
    }));
  }

  /* ── Boot on DOMContentLoaded ── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    // Already loaded (script deferred or at bottom of body)
    boot();
  }

})();
