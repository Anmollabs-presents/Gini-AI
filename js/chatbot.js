/* Chatbot */
class Chatbot {
  constructor() {
    this.isOpen    = false;
    this.isWaiting = false;
    this.history   = []; // {role, content}
    this.API       = '/api/chat';
  }

  init() {
    this.$bubble   = document.getElementById('chat-bubble');
    this.$window   = document.getElementById('chat-window');
    this.$messages = document.getElementById('chat-messages');
    this.$input    = document.getElementById('chat-input');
    this.$send     = document.getElementById('send-btn');
    this.$close    = document.getElementById('close-chat');

    if (!this.$bubble) return;

    // Wire CTAs on page
    document.getElementById('open-chat-main')?.addEventListener('click', () => this.open());
    document.getElementById('open-chat-cta')?.addEventListener('click',  () => this.open());
    document.getElementById('cta-nav')?.addEventListener('click',         () => this.open());
    document.getElementById('cta-mobile')?.addEventListener('click',      () => this.open());

    this.$bubble.addEventListener('click', () => this.toggle());
    this.$close.addEventListener('click',  () => this.close());
    this.$send.addEventListener('click',   () => this._send());

    this.$input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this._send();
      }
      // Auto-grow textarea
      setTimeout(() => this._growInput(), 0);
    });

    this.$input.addEventListener('input', () => this._growInput());

    this._addMessage('ai', "Hi! I'm Gini — your AI assistant. Ask me anything.");
  }

  /* ── Public ──────────────────────────────────────── */
  open() {
    if (this.isOpen) return;
    this.isOpen = true;
    this.$window.classList.add('active');
    this.$window.removeAttribute('aria-hidden');
    this.$window.setAttribute('aria-modal', 'true');
    this.$bubble.classList.add('hidden');
    this.$bubble.setAttribute('aria-expanded', 'true');
    setTimeout(() => this.$input.focus(), 300);
  }

  close() {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.$window.classList.remove('active');
    this.$window.setAttribute('aria-hidden', 'true');
    this.$bubble.classList.remove('hidden');
    this.$bubble.setAttribute('aria-expanded', 'false');
  }

  toggle() { this.isOpen ? this.close() : this.open(); }

  /* ── Internals ──────────────────────────────────── */
  _growInput() {
    const el = this.$input;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 100) + 'px';
  }

  async _send() {
    const text = this.$input.value.trim();
    if (!text || this.isWaiting) return;

    this.$input.value = '';
    this.$input.style.height = 'auto';
    this._addMessage('user', text);

    this.history.push({ role: 'user', content: text });
    this._showTyping();

    try {
      const messages = [
        {
          role: 'system',
          content: 'You are Gini, a sharp, helpful, and concise AI assistant. Give precise answers. Keep replies focused — no fluff.'
        },
        ...this.history
      ];

      const res = await fetch(this.API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages })
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data   = await res.json();
      const reply  = data?.choices?.[0]?.message?.content?.trim()
                  || data?.message
                  || 'I encountered an issue. Please try again.';

      this._hideTyping();
      this._addMessage('ai', reply);
      this.history.push({ role: 'assistant', content: reply });

      // Keep history manageable
      if (this.history.length > 16) this.history = this.history.slice(-14);

    } catch (err) {
      console.error('[Gini chat]', err);
      this._hideTyping();
      this._addMessage('ai', 'Connection issue. Make sure the server is running and try again.');
    }
  }

  _addMessage(role, text) {
    const row = document.createElement('div');
    row.className = `chat-msg ${role}`;
    row.setAttribute('role', 'listitem');

    const bubble = document.createElement('div');
    bubble.className = 'msg-bubble';

    // Simple markdown: **bold**, `code`
    bubble.innerHTML = this._render(text);

    row.appendChild(bubble);
    this.$messages.appendChild(row);
    this._scrollBottom();
  }

  _render(text) {
    return text
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code style="font-family:monospace;font-size:0.88em;background:rgba(255,255,255,0.08);padding:1px 5px;border-radius:4px">$1</code>')
      .replace(/\n/g, '<br>');
  }

  _showTyping() {
    this.isWaiting = true;
    this.$send.disabled = true;

    const row = document.createElement('div');
    row.className = 'chat-msg ai';
    row.id = 'typing-row';

    const bubble = document.createElement('div');
    bubble.className = 'msg-bubble';

    const dots = document.createElement('div');
    dots.className = 'typing-dots';
    dots.innerHTML = '<span></span><span></span><span></span>';

    bubble.appendChild(dots);
    row.appendChild(bubble);
    this.$messages.appendChild(row);
    this._scrollBottom();
  }

  _hideTyping() {
    this.isWaiting = false;
    this.$send.disabled = false;
    document.getElementById('typing-row')?.remove();
  }

  _scrollBottom() {
    requestAnimationFrame(() => {
      this.$messages.scrollTop = this.$messages.scrollHeight;
    });
  }
}
