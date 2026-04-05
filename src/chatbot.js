/**
 * Tiến Thịnh JSC — AI Chatbot Widget v3
 * Features: debounce 3s, AI-generated follow-up suggestions, live DB context
 */

const CHATBOT_CONFIG = {
  functionUrl: 'https://hafiotcabigmdpoocddu.supabase.co/functions/v1/website-chatbot',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhZmlvdGNhYmlnbWRwb29jZGR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5MzU2NDEsImV4cCI6MjA5MDUxMTY0MX0.22BAFw0LXsomxY0PtD3V-5G5yGFa2F5gmCUNVr4tyrk',
  debounceMs: 3000, // 3 giây chờ sau tin nhắn cuối
  welcomeMessage: 'Dạ, em là trợ lý AI của Tiến Thịnh JSC 👋\nAnh/chị cần tư vấn về dịch vụ kết cấu thép, dự án hay tuyển dụng ạ?',
  initialSuggestions: [
    'Công ty có dịch vụ gì?',
    'Tư vấn khung thép PEB',
    'Thông tin tuyển dụng',
    'Liên hệ báo giá',
  ],
};

// ============================================================
// UTILS
// ============================================================
function getSessionId() {
  let sid = localStorage.getItem('tt_chat_session');
  if (!sid) {
    sid = 'ws_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
    localStorage.setItem('tt_chat_session', sid);
  }
  return sid;
}

function loadHistory() {
  try { return JSON.parse(localStorage.getItem('tt_chat_history') || '[]'); }
  catch { return []; }
}

function saveHistory(history) {
  try { localStorage.setItem('tt_chat_history', JSON.stringify(history.slice(-20))); } catch {}
}

function escapeHtml(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function formatMessage(text) {
  return escapeHtml(text)
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>');
}

// ============================================================
// HTML TEMPLATE
// ============================================================
function buildChatbotHTML() {
  return `
    <div id="tt-chatbot-btn" class="tt-chatbot-btn" aria-label="Mở chatbot tư vấn" title="Chat với AI tư vấn">
      <div class="tt-chatbot-btn__icon tt-chatbot-btn__icon--chat">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      </div>
      <div class="tt-chatbot-btn__icon tt-chatbot-btn__icon--close" style="display:none">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </div>
      <span class="tt-chatbot-btn__badge" style="display:none">1</span>
    </div>

    <div id="tt-chatbot-window" class="tt-chatbot-window" aria-hidden="true">
      <!-- Header -->
      <div class="tt-chatbot-header">
        <div class="tt-chatbot-header__avatar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
          </svg>
        </div>
        <div class="tt-chatbot-header__info">
          <div class="tt-chatbot-header__name">Trợ lý Tiến Thịnh</div>
          <div class="tt-chatbot-header__status">
            <span class="tt-chatbot-status-dot"></span>
            <span class="tt-chatbot-header__status-text">Đang hoạt động</span>
          </div>
        </div>
        <button class="tt-chatbot-header__close" id="tt-chatbot-close" aria-label="Đóng">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <!-- Messages -->
      <div class="tt-chatbot-messages" id="tt-chatbot-messages" role="log" aria-live="polite"></div>

      <!-- Suggestions -->
      <div class="tt-chatbot-suggestions" id="tt-chatbot-suggestions"></div>

      <!-- Input -->
      <div class="tt-chatbot-input-area">
        <div class="tt-chatbot-input-wrap">
          <textarea
            id="tt-chatbot-input"
            class="tt-chatbot-input"
            placeholder="Nhập câu hỏi của anh/chị..."
            rows="1"
            maxlength="500"
            aria-label="Nhập tin nhắn"
          ></textarea>
          <button id="tt-chatbot-send" class="tt-chatbot-send" aria-label="Gửi tin nhắn" disabled>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
        <!-- Debounce countdown bar -->
        <div class="tt-debounce-bar" id="tt-debounce-bar" style="display:none">
          <div class="tt-debounce-bar__track">
            <div class="tt-debounce-bar__fill" id="tt-debounce-fill"></div>
          </div>
          <span class="tt-debounce-bar__label" id="tt-debounce-label">Đang chuẩn bị gửi...</span>
        </div>
        <div class="tt-chatbot-footer">
          <span>Powered by <strong>Tiến Thịnh AI</strong> · <a href="tel:0969666840">0969666840</a></span>
        </div>
      </div>
    </div>
  `;
}

// ============================================================
// CSS
// ============================================================
function buildChatbotCSS() {
  return `
    :root {
      --chat-primary: #2d6a4f;
      --chat-primary-light: #40916c;
      --chat-primary-dark: #1b4332;
      --chat-bg: #ffffff;
      --chat-surface: #f8fafc;
      --chat-border: rgba(0,0,0,0.08);
      --chat-text: #1a202c;
      --chat-text-muted: #718096;
      --chat-user-bg: #2d6a4f;
      --chat-user-text: #ffffff;
      --chat-bot-bg: #f1f5f9;
      --chat-bot-text: #1a202c;
      --chat-shadow: 0 20px 60px rgba(0,0,0,0.15), 0 4px 20px rgba(0,0,0,0.1);
    }
    [data-theme="dark"] {
      --chat-bg: #1a1a2e;
      --chat-surface: #16213e;
      --chat-border: rgba(255,255,255,0.08);
      --chat-text: #e2e8f0;
      --chat-text-muted: #a0aec0;
      --chat-bot-bg: #0f3460;
      --chat-bot-text: #e2e8f0;
      --chat-shadow: 0 20px 60px rgba(0,0,0,0.4), 0 4px 20px rgba(0,0,0,0.3);
    }

    /* Floating Button */
    .tt-chatbot-btn {
      position: fixed;
      bottom: 28px; right: 28px;
      z-index: 9998;
      width: 60px; height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--chat-primary), var(--chat-primary-light));
      color: white;
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 24px rgba(45,106,79,0.5), 0 2px 8px rgba(0,0,0,0.2);
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      border: none; outline: none; user-select: none;
    }
    .tt-chatbot-btn:hover { transform: scale(1.1); box-shadow: 0 8px 32px rgba(45,106,79,0.6), 0 4px 12px rgba(0,0,0,0.25); }
    .tt-chatbot-btn:active { transform: scale(0.95); }
    .tt-chatbot-btn__icon { display: flex; align-items: center; justify-content: center; transition: all 0.3s ease; }
    .tt-chatbot-btn__icon svg { width: 26px; height: 26px; }
    .tt-chatbot-btn__badge {
      position: absolute; top: -4px; right: -4px;
      min-width: 20px; height: 20px;
      background: #e53e3e; color: white;
      border-radius: 10px; font-size: 11px; font-weight: 700;
      display: flex; align-items: center; justify-content: center;
      padding: 0 4px; border: 2px solid white;
      animation: tt-badge-pulse 2s infinite;
    }
    @keyframes tt-badge-pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.15); }
    }

    /* Window */
    .tt-chatbot-window {
      position: fixed;
      bottom: 100px; right: 28px;
      z-index: 9999;
      width: 380px;
      max-width: calc(100vw - 32px);
      height: 560px;
      max-height: calc(100vh - 120px);
      background: var(--chat-bg);
      border-radius: 20px;
      box-shadow: var(--chat-shadow);
      display: flex; flex-direction: column;
      overflow: hidden;
      transform: translateY(20px) scale(0.95);
      opacity: 0; pointer-events: none;
      transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
      border: 1px solid var(--chat-border);
    }
    .tt-chatbot-window.tt-open { transform: translateY(0) scale(1); opacity: 1; pointer-events: all; }

    /* Header */
    .tt-chatbot-header {
      display: flex; align-items: center; gap: 12px;
      padding: 16px 20px;
      background: linear-gradient(135deg, var(--chat-primary-dark), var(--chat-primary));
      color: white; flex-shrink: 0;
    }
    .tt-chatbot-header__avatar {
      width: 44px; height: 44px; border-radius: 50%;
      background: rgba(255,255,255,0.2);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; border: 2px solid rgba(255,255,255,0.3);
    }
    .tt-chatbot-header__avatar svg { width: 22px; height: 22px; }
    .tt-chatbot-header__info { flex: 1; min-width: 0; }
    .tt-chatbot-header__name { font-weight: 700; font-size: 15px; letter-spacing: 0.01em; }
    .tt-chatbot-header__status { display: flex; align-items: center; gap: 6px; margin-top: 2px; }
    .tt-chatbot-status-dot {
      width: 8px; height: 8px; border-radius: 50%;
      background: #68d391;
      animation: tt-status-pulse 2s infinite; flex-shrink: 0;
    }
    @keyframes tt-status-pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.6; transform: scale(0.8); }
    }
    .tt-chatbot-header__status-text { font-size: 12px; opacity: 0.85; }
    .tt-chatbot-header__close {
      background: rgba(255,255,255,0.15); border: none; color: white;
      width: 32px; height: 32px; border-radius: 8px;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; transition: background 0.2s;
    }
    .tt-chatbot-header__close:hover { background: rgba(255,255,255,0.3); }
    .tt-chatbot-header__close svg { width: 16px; height: 16px; }

    /* Messages */
    .tt-chatbot-messages {
      flex: 1; overflow-y: auto; padding: 16px;
      display: flex; flex-direction: column; gap: 12px;
      scroll-behavior: smooth;
    }
    .tt-chatbot-messages::-webkit-scrollbar { width: 4px; }
    .tt-chatbot-messages::-webkit-scrollbar-track { background: transparent; }
    .tt-chatbot-messages::-webkit-scrollbar-thumb { background: var(--chat-border); border-radius: 2px; }

    /* Message Bubbles */
    .tt-msg { display: flex; gap: 8px; animation: tt-msg-in 0.3s ease; }
    @keyframes tt-msg-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .tt-msg--user { flex-direction: row-reverse; }
    .tt-msg__avatar {
      width: 32px; height: 32px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; font-size: 14px; font-weight: 700; align-self: flex-end;
    }
    .tt-msg--bot .tt-msg__avatar { background: linear-gradient(135deg, var(--chat-primary-dark), var(--chat-primary)); color: white; }
    .tt-msg--user .tt-msg__avatar { background: #e2e8f0; color: var(--chat-text); }
    .tt-msg__bubble {
      max-width: 78%; padding: 10px 14px;
      border-radius: 16px; font-size: 14px; line-height: 1.55;
    }
    .tt-msg--bot .tt-msg__bubble { background: var(--chat-bot-bg); color: var(--chat-bot-text); border-bottom-left-radius: 4px; }
    .tt-msg--user .tt-msg__bubble { background: var(--chat-user-bg); color: var(--chat-user-text); border-bottom-right-radius: 4px; }
    .tt-msg__bubble code { background: rgba(0,0,0,0.08); padding: 1px 5px; border-radius: 3px; font-size: 12px; }
    .tt-msg--user .tt-msg__bubble code { background: rgba(255,255,255,0.2); }
    .tt-msg__time { font-size: 10px; color: var(--chat-text-muted); margin-top: 3px; text-align: right; }
    .tt-msg--bot .tt-msg__time { text-align: left; }

    /* Typing Indicator */
    .tt-typing {
      display: flex; align-items: center; gap: 5px;
      padding: 12px 14px;
      background: var(--chat-bot-bg);
      border-radius: 16px; border-bottom-left-radius: 4px;
      width: fit-content;
    }
    .tt-typing span {
      width: 7px; height: 7px;
      background: var(--chat-primary); border-radius: 50%;
      animation: tt-typing-bounce 1.2s infinite; opacity: 0.4;
    }
    .tt-typing span:nth-child(2) { animation-delay: 0.2s; }
    .tt-typing span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes tt-typing-bounce {
      0%, 100% { transform: translateY(0); opacity: 0.4; }
      50% { transform: translateY(-5px); opacity: 1; }
    }

    /* Suggestions */
    .tt-chatbot-suggestions {
      padding: 0 12px 8px;
      display: flex; flex-wrap: wrap; gap: 6px; flex-shrink: 0;
      min-height: 0;
      transition: all 0.3s ease;
    }
    .tt-suggestion-chip {
      padding: 6px 12px;
      background: var(--chat-surface);
      border: 1px solid var(--chat-border);
      border-radius: 20px; font-size: 12px;
      cursor: pointer; color: var(--chat-primary);
      font-weight: 500; transition: all 0.2s;
      white-space: nowrap;
      animation: tt-chip-in 0.25s ease both;
    }
    @keyframes tt-chip-in { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
    .tt-suggestion-chip:hover {
      background: var(--chat-primary); color: white;
      border-color: var(--chat-primary); transform: translateY(-1px);
    }
    .tt-suggestion-chip:nth-child(1) { animation-delay: 0.05s; }
    .tt-suggestion-chip:nth-child(2) { animation-delay: 0.1s; }
    .tt-suggestion-chip:nth-child(3) { animation-delay: 0.15s; }

    /* Input Area */
    .tt-chatbot-input-area {
      padding: 10px 16px 12px;
      border-top: 1px solid var(--chat-border);
      background: var(--chat-bg); flex-shrink: 0;
    }
    .tt-chatbot-input-wrap {
      display: flex; align-items: flex-end; gap: 8px;
      background: var(--chat-surface);
      border: 1.5px solid var(--chat-border);
      border-radius: 14px; padding: 8px 12px;
      transition: border-color 0.2s;
    }
    .tt-chatbot-input-wrap:focus-within { border-color: var(--chat-primary); }
    .tt-chatbot-input {
      flex: 1; background: transparent; border: none; outline: none;
      resize: none; font-size: 14px; color: var(--chat-text);
      line-height: 1.5; font-family: inherit;
      max-height: 100px; min-height: 20px;
    }
    .tt-chatbot-input::placeholder { color: var(--chat-text-muted); }
    .tt-chatbot-send {
      width: 34px; height: 34px; border-radius: 10px;
      background: var(--chat-primary); color: white;
      border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; transition: all 0.2s; margin-bottom: 1px;
    }
    .tt-chatbot-send:disabled { opacity: 0.4; cursor: not-allowed; }
    .tt-chatbot-send:not(:disabled):hover { background: var(--chat-primary-light); transform: scale(1.05); }
    .tt-chatbot-send svg { width: 16px; height: 16px; }

    /* Debounce countdown bar */
    .tt-debounce-bar {
      display: flex; align-items: center; gap: 8px;
      margin-top: 6px; padding: 0 2px;
    }
    .tt-debounce-bar__track {
      flex: 1; height: 3px;
      background: var(--chat-border);
      border-radius: 2px; overflow: hidden;
    }
    .tt-debounce-bar__fill {
      height: 100%;
      background: var(--chat-primary);
      border-radius: 2px;
      transition: width 0.1s linear;
    }
    .tt-debounce-bar__label {
      font-size: 10px; color: var(--chat-text-muted);
      white-space: nowrap; flex-shrink: 0;
    }

    .tt-chatbot-footer {
      margin-top: 8px; text-align: center;
      font-size: 11px; color: var(--chat-text-muted);
    }
    .tt-chatbot-footer a { color: var(--chat-primary); text-decoration: none; }
    .tt-chatbot-footer a:hover { text-decoration: underline; }

    /* Mobile */
    @media (max-width: 480px) {
      .tt-chatbot-window {
        bottom: 0 !important; right: 0 !important; left: 0 !important;
        width: 100% !important; max-width: 100% !important;
        border-radius: 20px 20px 0 0 !important;
        height: 75vh !important; max-height: 75vh !important;
      }
      .tt-chatbot-btn { bottom: 20px; right: 20px; }
    }
  `;
}

// ============================================================
// CHATBOT CONTROLLER
// ============================================================
class TienThinhChatbot {
  constructor() {
    this.isOpen = false;
    this.isLoading = false;
    this.history = loadHistory();
    this.sessionId = getSessionId();

    // Debounce state
    this.debounceTimer = null;
    this.debounceInterval = null;
    this.pendingMessages = []; // gộp nhiều tin nhắn ngắn

    this.init();
  }

  init() {
    const style = document.createElement('style');
    style.textContent = buildChatbotCSS();
    document.head.appendChild(style);

    const container = document.createElement('div');
    container.id = 'tt-chatbot-root';
    container.innerHTML = buildChatbotHTML();
    document.body.appendChild(container);

    // Refs
    this.btn = document.getElementById('tt-chatbot-btn');
    this.windowEl = document.getElementById('tt-chatbot-window');
    this.messagesEl = document.getElementById('tt-chatbot-messages');
    this.suggestionsEl = document.getElementById('tt-chatbot-suggestions');
    this.inputEl = document.getElementById('tt-chatbot-input');
    this.sendBtn = document.getElementById('tt-chatbot-send');
    this.closeBtn = document.getElementById('tt-chatbot-close');
    this.badge = this.btn.querySelector('.tt-chatbot-btn__badge');
    this.iconChat = this.btn.querySelector('.tt-chatbot-btn__icon--chat');
    this.iconClose = this.btn.querySelector('.tt-chatbot-btn__icon--close');
    this.debounceBar = document.getElementById('tt-debounce-bar');
    this.debounceFill = document.getElementById('tt-debounce-fill');
    this.debounceLabel = document.getElementById('tt-debounce-label');

    // Events
    this.btn.addEventListener('click', () => this.toggle());
    this.closeBtn.addEventListener('click', () => this.close());
    this.sendBtn.addEventListener('click', () => this.scheduleSend());
    this.inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this.scheduleSend(); }
    });
    this.inputEl.addEventListener('input', () => {
      this.sendBtn.disabled = !this.inputEl.value.trim();
      this.inputEl.style.height = 'auto';
      this.inputEl.style.height = Math.min(this.inputEl.scrollHeight, 100) + 'px';
    });

    // Render history or welcome
    if (this.history.length > 0) {
      this.history.forEach(msg => this.renderMessage(msg.role, msg.content, false));
    } else {
      this.renderMessage('bot', CHATBOT_CONFIG.welcomeMessage, false);
    }

    // Show initial suggestions if no history
    if (this.history.length === 0) {
      this.showSuggestions(CHATBOT_CONFIG.initialSuggestions);
    }

    // Show badge after 3s
    setTimeout(() => {
      if (!this.isOpen && this.history.length === 0) {
        this.badge.style.display = 'flex';
      }
    }, 3000);
  }

  toggle() { this.isOpen ? this.close() : this.open(); }

  open() {
    this.isOpen = true;
    this.windowEl.classList.add('tt-open');
    this.windowEl.setAttribute('aria-hidden', 'false');
    this.iconChat.style.display = 'none';
    this.iconClose.style.display = 'flex';
    this.badge.style.display = 'none';
    this.scrollToBottom();
    setTimeout(() => this.inputEl.focus(), 350);
  }

  close() {
    this.isOpen = false;
    this.windowEl.classList.remove('tt-open');
    this.windowEl.setAttribute('aria-hidden', 'true');
    this.iconChat.style.display = 'flex';
    this.iconClose.style.display = 'none';
  }

  // ============================================================
  // DEBOUNCE: gom tin nhắn ngắn, countdown 3s
  // ============================================================
  scheduleSend() {
    const text = this.inputEl.value.trim();
    if (!text || this.isLoading) return;

    // Thêm vào queue và hiện ngay bubble xám "đang gõ"
    this.pendingMessages.push(text);
    this.inputEl.value = '';
    this.inputEl.style.height = 'auto';
    this.sendBtn.disabled = true;
    this.suggestionsEl.innerHTML = '';

    // Vẽ bubble user ngay
    this.renderMessage('user', text);

    // Reset debounce timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      clearInterval(this.debounceInterval);
    }

    // Hiện countdown bar
    this.startCountdown(CHATBOT_CONFIG.debounceMs);

    // Sau debounceMs, gửi tất cả pending messages gộp lại
    this.debounceTimer = setTimeout(() => {
      this.stopCountdown();
      const combined = this.pendingMessages.join(' ');
      this.pendingMessages = [];
      this.dispatchToAI(combined);
    }, CHATBOT_CONFIG.debounceMs);
  }

  startCountdown(totalMs) {
    this.debounceBar.style.display = 'flex';
    const start = Date.now();
    this.debounceFill.style.width = '100%';

    this.debounceInterval = setInterval(() => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, totalMs - elapsed);
      const pct = (remaining / totalMs) * 100;
      this.debounceFill.style.width = pct + '%';
      const sec = (remaining / 1000).toFixed(1);
      this.debounceLabel.textContent = `Gửi sau ${sec}s...`;
      if (remaining <= 0) clearInterval(this.debounceInterval);
    }, 80);
  }

  stopCountdown() {
    clearInterval(this.debounceInterval);
    this.debounceBar.style.display = 'none';
    this.debounceFill.style.width = '100%';
  }

  // ============================================================
  // DISPATCH TO AI — gửi 1 request tổng hợp
  // ============================================================
  async dispatchToAI(question) {
    this.isLoading = true;

    // Lưu vào history TRƯỚC khi gửi
    this.history.push({ role: 'user', content: question });

    // Hiện typing
    this.showTyping();

    try {
      const resp = await fetch(CHATBOT_CONFIG.functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${CHATBOT_CONFIG.anonKey}`,
          'apikey': CHATBOT_CONFIG.anonKey,
        },
        body: JSON.stringify({
          question,
          sessionId: this.sessionId,
          history: this.history.slice(-10),
        }),
      });

      const data = await resp.json();
      this.hideTyping();

      if (data.error) {
        this.renderMessage('bot', data.error);
      } else {
        const answer = data.answer || 'Dạ, em xin lỗi, có lỗi xảy ra ạ.';
        this.renderMessage('bot', answer);
        this.history.push({ role: 'assistant', content: answer });
        saveHistory(this.history);

        // Hiện AI-generated suggestions
        if (data.suggestions && data.suggestions.length > 0) {
          this.showSuggestions(data.suggestions);
        }
      }

    } catch (err) {
      this.hideTyping();
      this.renderMessage('bot', 'Dạ, em xin lỗi, kết nối tạm thời gián đoạn. Anh/chị vui lòng thử lại hoặc liên hệ hotline **0969666840** ạ.');
    }

    this.isLoading = false;
    // Cho phép gõ lại
    this.sendBtn.disabled = !this.inputEl.value.trim();
  }

  // ============================================================
  // SUGGESTIONS — click chip gửi ngay không debounce
  // ============================================================
  showSuggestions(suggestions) {
    this.suggestionsEl.innerHTML = '';
    suggestions.forEach((text, i) => {
      const chip = document.createElement('button');
      chip.className = 'tt-suggestion-chip';
      chip.style.animationDelay = `${i * 0.05}s`;
      chip.textContent = text;
      chip.addEventListener('click', () => {
        if (this.isLoading) return;
        // Clear debounce nếu đang chờ
        if (this.debounceTimer) {
          clearTimeout(this.debounceTimer);
          clearInterval(this.debounceInterval);
          this.stopCountdown();
          this.pendingMessages = [];
        }
        this.suggestionsEl.innerHTML = '';
        this.history.push({ role: 'user', content: text });
        this.renderMessage('user', text);
        this.isLoading = true;
        this.showTyping();
        // Gửi ngay không debounce
        fetch(CHATBOT_CONFIG.functionUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${CHATBOT_CONFIG.anonKey}`, 'apikey': CHATBOT_CONFIG.anonKey },
          body: JSON.stringify({ question: text, sessionId: this.sessionId, history: this.history.slice(-10) }),
        })
          .then(r => r.json())
          .then(data => {
            this.hideTyping();
            const answer = data.error || data.answer || 'Dạ, em xin lỗi ạ.';
            this.renderMessage('bot', answer);
            if (!data.error) {
              this.history.push({ role: 'assistant', content: answer });
              saveHistory(this.history);
              if (data.suggestions?.length) this.showSuggestions(data.suggestions);
            }
          })
          .catch(() => {
            this.hideTyping();
            this.renderMessage('bot', 'Dạ, em xin lỗi, có lỗi xảy ra. Anh/chị thử lại hoặc gọi **0969666840** ạ.');
          })
          .finally(() => { this.isLoading = false; });
      });
      this.suggestionsEl.appendChild(chip);
    });
  }

  // ============================================================
  // RENDER
  // ============================================================
  renderMessage(role, content, animate = true) {
    const isUser = role === 'user';
    const timeStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    const msgEl = document.createElement('div');
    msgEl.className = `tt-msg tt-msg--${isUser ? 'user' : 'bot'}`;
    if (!animate) msgEl.style.animation = 'none';

    msgEl.innerHTML = `
      <div class="tt-msg__avatar">${isUser ? '👤' : '🤖'}</div>
      <div>
        <div class="tt-msg__bubble">${formatMessage(content)}</div>
        <div class="tt-msg__time">${timeStr}</div>
      </div>
    `;
    this.messagesEl.appendChild(msgEl);
    this.scrollToBottom();
    return msgEl;
  }

  showTyping() {
    const el = document.createElement('div');
    el.className = 'tt-msg tt-msg--bot';
    el.id = 'tt-typing-indicator';
    el.innerHTML = `
      <div class="tt-msg__avatar">🤖</div>
      <div class="tt-typing"><span></span><span></span><span></span></div>
    `;
    this.messagesEl.appendChild(el);
    this.scrollToBottom();
  }

  hideTyping() {
    document.getElementById('tt-typing-indicator')?.remove();
  }

  scrollToBottom() {
    this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
  }
}

// ============================================================
// INIT
// ============================================================
export function initChatbot() {
  if (document.getElementById('tt-chatbot-root')) return;
  window.ttChatbot = new TienThinhChatbot();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initChatbot);
} else {
  initChatbot();
}
