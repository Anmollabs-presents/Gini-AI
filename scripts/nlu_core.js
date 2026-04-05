/**
 * ═══════════════════════════════════════════════════════════
 *  GINI AI — nlu_core.js
 *  Natural Language Understanding Core
 *  Hindi + Hinglish Normalization & Intent Classification
 *  Creator: ANMOL | Lucknow, India
 * ═══════════════════════════════════════════════════════════
 */

const GiniNLU = (function () {

  /* ══════════════════════════════════════
     HINDI / HINGLISH NORMALIZATION MAP
  ══════════════════════════════════════ */
  const HINDI_MAP = {
    // Time/Date
    'kitna baja':        'what time is it',
    'time batao':        'what is the time',
    'aaj ka date':       'what is today\'s date',
    'aaj kya hai':       'what day is today',
    'aaj':               'today',
    'kal':               'tomorrow',
    'parso':             'day after tomorrow',
    // Greetings
    'namaste':           'hello',
    'namaskar':          'hello',
    'shukriya':          'thank you',
    'dhanyawad':         'thank you',
    'alvida':            'goodbye',
    'bye bye':           'goodbye',
    // Names
    'mera naam':         'my name is',
    'tumhara naam':      'your name',
    'aapka naam':        'your name',
    // Questions
    'kya hai':           'what is',
    'kaun hai':          'who is',
    'kahan hai':         'where is',
    'kaise hai':         'how is',
    'kyun':              'why',
    'kab':               'when',
    'kitna':             'how much',
    'kya tum':           'can you',
    'kya aap':           'can you',
    'batao':             'tell me',
    'bata':              'tell me',
    'dikhao':            'show me',
    'karo':              'do',
    'karte ho':          'do you',
    'samjhao':           'explain',
    'help karo':         'help me',
    'help chahiye':      'i need help',
    // States
    'theek hai':         'ok',
    'haan':              'yes',
    'nahi':              'no',
    'nahi pata':         'i don\'t know',
    'sahi hai':          'correct',
    'galat hai':         'wrong',
    // Misc
    'gini':              'gini',
    'anmol':             'anmol',
    'lucknow':           'lucknow',
    'india':             'india',
  };

  /* ══════════════════════════════════════
     INTENT PATTERNS
  ══════════════════════════════════════ */
  const INTENTS = [
    {
      name: 'time_query',
      patterns: [/\b(time|current time|what time|kitna baja|time batao)\b/i],
      local: true,
    },
    {
      name: 'date_query',
      patterns: [/\b(date|today|what day|aaj|current date|aaj ka date)\b/i],
      local: true,
    },
    {
      name: 'name_set',
      patterns: [/(?:my name is|i(?:'m| am) called|call me|mera naam)\s+([a-z\u0900-\u097f]+)/i],
      local: true,
    },
    {
      name: 'name_get',
      patterns: [/\b(what(?:'s| is) my name|remember my name|do you know my name)\b/i],
      local: true,
    },
    {
      name: 'greeting',
      patterns: [/^(hi|hello|hey|namaste|namaskar|yo|sup)\b/i],
      local: false, // Route to API for personalized greeting
    },
    {
      name: 'farewell',
      patterns: [/\b(bye|goodbye|alvida|cya|see you|tata)\b/i],
      local: true,
    },
    {
      name: 'creator_query',
      patterns: [/\b(who made you|who built you|creator|developer|banaya|kisne)\b/i],
      local: true,
    },
    {
      name: 'identity_query',
      patterns: [/\b(who are you|what are you|your name|tumhara naam|aapka naam)\b/i],
      local: true,
    },
    {
      name: 'capability_query',
      patterns: [/\b(what can you|capabilities|features|kya kar sakte|kya karte)\b/i],
      local: false,
    },
    {
      name: 'general',
      patterns: [],
      local: false, // Default: route to API
    },
  ];

  /* ══════════════════════════════════════
     LOCAL RESPONSE TEMPLATES
  ══════════════════════════════════════ */
  const LOCAL_RESPONSES = {
    time_query: () => {
      const tm = new Date().toLocaleTimeString('en-IN', {
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      });
      return `Current time: ${tm} ⏰`;
    },
    date_query: () => {
      const dt = new Date().toLocaleDateString('en-IN', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      });
      return `Today is ${dt} 📅`;
    },
    name_set: (match) => {
      if (match) {
        const name = match[1];
        const stored = name.charAt(0).toUpperCase() + name.slice(1);
        GiniMemory.setUserName(stored);
        return `Got it — I'll remember you as ${stored}. 👋`;
      }
      return null;
    },
    name_get: () => {
      const name = GiniMemory.getUserName();
      return name
        ? `Your name is ${name}. 🙂`
        : "I don't have your name stored yet. Tell me with 'My name is ...'";
    },
    farewell: () => {
      const name = GiniMemory.getUserName();
      return name ? `Goodbye, ${name}! 👋` : 'Goodbye! 👋';
    },
    creator_query: () => 'I was created by ANMOL — a student developer from Lucknow, Uttar Pradesh, India. 🇮🇳',
    identity_query: () => 'I am Gini AI — a next-generation personal AI assistant being built from scratch by ANMOL. 🤖',
  };

  /* ══════════════════════════════════════
     PUBLIC METHODS
  ══════════════════════════════════════ */

  /**
   * Normalize Hindi/Hinglish input to English
   * @param {string} text
   * @returns {string}
   */
  function normalize(text) {
    let result = text.trim();
    // Replace Hindi/Hinglish phrases (longest match first)
    const sorted = Object.keys(HINDI_MAP).sort((a, b) => b.length - a.length);
    for (const hindi of sorted) {
      const regex = new RegExp(`\\b${hindi}\\b`, 'gi');
      result = result.replace(regex, HINDI_MAP[hindi]);
    }
    return result;
  }

  /**
   * Classify intent from raw input
   * @param {string} rawText
   * @returns {{ intent: string, isLocal: boolean, match: RegExpMatchArray|null, normalized: string }}
   */
  function classify(rawText) {
    const normalized = normalize(rawText);
    const lower = normalized.toLowerCase();

    for (const intentDef of INTENTS) {
      for (const pattern of intentDef.patterns) {
        const match = lower.match(pattern);
        if (match) {
          return {
            intent: intentDef.name,
            isLocal: intentDef.local,
            match,
            normalized,
            raw: rawText,
          };
        }
      }
    }

    // Default: general (route to API)
    return {
      intent: 'general',
      isLocal: false,
      match: null,
      normalized,
      raw: rawText,
    };
  }

  /**
   * Resolve a local intent to a response string
   * @param {string} intent
   * @param {RegExpMatchArray|null} match
   * @returns {string|null}
   */
  function resolveLocal(intent, match) {
    const handler = LOCAL_RESPONSES[intent];
    if (typeof handler === 'function') {
      return handler(match);
    }
    return null;
  }

  /* ── Public API ── */
  return Object.freeze({
    normalize,
    classify,
    resolveLocal,
    INTENTS,
  });

})();

if (typeof module !== 'undefined' && module.exports) module.exports = GiniNLU;
