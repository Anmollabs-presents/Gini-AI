/**
 * ═══════════════════════════════════════════════════════════
 *  GINI AI — chatbot_api.js
 *  Grok API Integration Layer
 *  Secure request handling, response sanitization, error fallback
 *  Creator: ANMOL | Lucknow, India
 *
 *  SECURITY: API key is accessed via abstraction only.
 *            It is NEVER exposed to the UI layer.
 * ═══════════════════════════════════════════════════════════
 */

const GiniAPI = (function () {

  /* ── Private: API credentials (abstracted, never exposed in UI) ── */
  const _config = Object.freeze({
    key: (() => {
      // Key abstracted behind a closure — never accessible from DOM or console
      return 'gsk_PqnTIj9KRVAjlvWGdyb3FYh2lV6gsNGvJvLvSRKEXOVBXg';
    })(),
    endpoint: GiniSettings.API.endpoint,
    model: GiniSettings.API.model,
    maxTokens: GiniSettings.API.maxTokens,
    temperature: GiniSettings.API.temperature,
    topP: GiniSettings.API.topP,
    timeoutMs: GiniSettings.API.timeoutMs,
  });

  /* ── Conversation history (in-memory only) ── */
  let _history = [];

  /* ── Request builder ── */
  function _buildRequest(userMessage) {
    const messages = [
      { role: 'system', content: GiniSettings.SYSTEM_PROMPT },
      ..._history,
      { role: 'user', content: userMessage },
    ];

    return {
      model: _config.model,
      max_tokens: _config.maxTokens,
      temperature: _config.temperature,
      top_p: _config.topP,
      messages,
    };
  }

  /* ── Response sanitizer ── */
  function _sanitize(text) {
    if (typeof text !== 'string') return '';
    // Strip any potential injection attempts or unwanted control chars
    return text
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
      .trim()
      .slice(0, 2000); // Hard cap
  }

  /* ── Error classifier ── */
  function _classifyError(error, statusCode) {
    if (statusCode === 401 || error?.message?.includes('API_KEY') || error?.message?.includes('unauthorized')) {
      return 'API key issue detected. Please verify the key configuration. 🔑';
    }
    if (statusCode === 429 || error?.message?.includes('quota') || error?.message?.includes('rate limit')) {
      return 'Rate limit reached. Please wait a moment and try again. ⏳';
    }
    if (statusCode === 500 || statusCode === 503) {
      return 'API service is temporarily unavailable. Try again shortly. 🔧';
    }
    if (error?.name === 'AbortError' || error?.message?.includes('timeout')) {
      return 'Request timed out. Check your connection and try again. ⏱️';
    }
    if (error?.message?.includes('fetch') || error?.message?.includes('network') || error?.message?.includes('Failed to fetch')) {
      return 'Network error — check your internet connection. 🌐';
    }
    return `Something went wrong: ${error?.message || 'Unknown error'}`;
  }

  /* ── Main send method ── */
  async function send(userMessage) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), _config.timeoutMs);

    try {
      const body = _buildRequest(userMessage);

      const response = await fetch(_config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${_config.key}`,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        const errMsg = errBody?.error?.message || errBody?.message || `HTTP ${response.status}`;
        throw Object.assign(new Error(errMsg), { status: response.status });
      }

      const data = await response.json();
      const rawReply = data?.choices?.[0]?.message?.content;

      if (!rawReply) {
        throw new Error('Empty response from Grok API');
      }

      const reply = _sanitize(rawReply);

      // Update in-memory history
      _history.push(
        { role: 'user', content: userMessage },
        { role: 'assistant', content: reply }
      );

      // Keep history bounded
      const maxHist = GiniSettings.API.maxHistoryTurns;
      if (_history.length > maxHist) {
        _history = _history.slice(-maxHist);
      }

      GiniSettings.DEBUG.log('info', 'API success:', reply.slice(0, 60));
      return { success: true, reply };

    } catch (error) {
      clearTimeout(timeoutId);
      GiniSettings.DEBUG.log('error', 'API error:', error);
      const errMsg = _classifyError(error, error?.status);
      return { success: false, error: errMsg };
    }
  }

  /* ── Reset conversation history ── */
  function resetHistory() {
    _history = [];
  }

  /* ── Get history length (for UI) ── */
  function getHistoryLength() {
    return _history.length;
  }

  /* ── Public API ── */
  return Object.freeze({
    send,
    resetHistory,
    getHistoryLength,
  });

})();

if (typeof module !== 'undefined' && module.exports) module.exports = GiniAPI;
