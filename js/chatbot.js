// chatbot.js
// Floating AI Assistant Widget
// Just include: <script src="js/chatbot.js"></script>

document.addEventListener("DOMContentLoaded", function () {

(function () {

  // 🔁 CHANGE THIS TO YOUR BACKEND URL
  const CHAT_API = "https://mychatbot-7v19.onrender.com/";

  // Prevent duplicate loading
  if (window.__AI_WIDGET_LOADED__) return;
  window.__AI_WIDGET_LOADED__ = true;

  // ──────────────────────────────────────────────────────────────
  // Styles
  // ──────────────────────────────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    #ai-widget-btn {
      position: fixed;
      bottom: 28px;
      right: 28px;
      z-index: 99999;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      border: none;
      background: linear-gradient(135deg, #7c6aff, #ff6aad);
      color: white;
      font-size: 24px;
      cursor: pointer;
      box-shadow: 0 4px 24px #7c6aff55;
      transition: transform 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    #ai-widget-btn:hover {
      transform: scale(1.1);
    }

    #ai-widget-box {
      position: fixed;
      bottom: 96px;
      right: 28px;
      z-index: 99999;
      width: 360px;
      height: 500px;
      border-radius: 20px;
      background: #13131a;
      border: 1px solid #2a2a3d;
      box-shadow: 0 20px 60px #0008;
      display: none;
      flex-direction: column;
      overflow: hidden;
      font-family: system-ui, sans-serif;
    }

    #ai-widget-box.open {
      display: flex;
      animation: widgetIn 0.3s cubic-bezier(.34,1.56,.64,1);
    }

    @keyframes widgetIn {
      from { opacity: 0; transform: scale(0.9) translateY(10px); }
      to   { opacity: 1; transform: none; }
    }

    #ai-widget-header {
      padding: 14px 16px;
      background: #1c1c28;
      border-bottom: 1px solid #2a2a3d;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    #ai-widget-header .title {
      color: #e8e8f0;
      font-weight: 600;
      font-size: 0.9rem;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    #ai-widget-header .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #4ade80;
      box-shadow: 0 0 6px #4ade8088;
    }

    #ai-widget-close {
      background: none;
      border: none;
      color: #8888aa;
      cursor: pointer;
      font-size: 18px;
    }

    #ai-widget-msgs {
      flex: 1;
      overflow-y: auto;
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .w-msg {
      max-width: 85%;
      padding: 9px 13px;
      border-radius: 14px;
      font-size: 0.85rem;
      line-height: 1.55;
      color: #e8e8f0;
      word-wrap: break-word;
    }

    .w-msg.user {
      align-self: flex-end;
      background: #1e1b40;
      border: 1px solid #3a3470;
      border-bottom-right-radius: 4px;
    }

    .w-msg.bot {
      align-self: flex-start;
      background: #1c1c28;
      border: 1px solid #2a2a3d;
      border-bottom-left-radius: 4px;
    }

    .w-msg.bot a {
      color: #7c6aff;
      text-decoration: none;
    }

    .w-msg.bot a:hover {
      text-decoration: underline;
    }

    .w-typing {
      align-self: flex-start;
      background: #1c1c28;
      border: 1px solid #2a2a3d;
      border-radius: 14px;
      border-bottom-left-radius: 4px;
      padding: 10px 14px;
      display: flex;
      gap: 4px;
    }

    .w-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #8888aa;
      animation: wbounce 1.2s infinite;
    }

    .w-dot:nth-child(2){animation-delay:.2s}
    .w-dot:nth-child(3){animation-delay:.4s}

    @keyframes wbounce{
      0%,80%,100%{transform:translateY(0);opacity:.4}
      40%{transform:translateY(-5px);opacity:1}
    }

    #ai-widget-input-row {
      padding: 10px 12px;
      border-top: 1px solid #2a2a3d;
      display: flex;
      gap: 8px;
      background: #13131a;
    }

    #ai-widget-input {
      flex: 1;
      background: #1c1c28;
      border: 1px solid #2a2a3d;
      border-radius: 10px;
      color: #e8e8f0;
      padding: 8px 12px;
      font-size: 0.83rem;
      outline: none;
      resize: none;
      max-height: 80px;
    }

    #ai-widget-input:focus {
      border-color: #7c6aff;
    }

    #ai-widget-send {
      width: 34px;
      height: 34px;
      border-radius: 9px;
      border: none;
      background: linear-gradient(135deg,#7c6aff,#ff6aad);
      color: white;
      cursor: pointer;
      font-size: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    #ai-widget-send:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    @media(max-width:480px){
      #ai-widget-box{width:calc(100vw - 32px);right:16px;bottom:88px;}
      #ai-widget-btn{bottom:20px;right:16px;}
    }
  `;
  document.head.appendChild(style);

  // ──────────────────────────────────────────────────────────────
  // HTML
  // ──────────────────────────────────────────────────────────────
  document.body.insertAdjacentHTML('beforeend', `
    <button id="ai-widget-btn" title="Chat with AI assistant">💬</button>

    <div id="ai-widget-box">
      <div id="ai-widget-header">
        <div class="title">
          <span class="dot"></span> Site Assistant
        </div>
        <button id="ai-widget-close">✕</button>
      </div>

      <div id="ai-widget-msgs">
        <div class="w-msg bot">
          👋 Hi! I'm your site assistant. Ask me anything about this website!
        </div>
      </div>

      <div id="ai-widget-input-row">
        <textarea id="ai-widget-input" placeholder="Ask something..." rows="1"></textarea>
        <button id="ai-widget-send">➤</button>
      </div>
    </div>
  `);

  // ──────────────────────────────────────────────────────────────
  // Logic
  // ──────────────────────────────────────────────────────────────
  const btn   = document.getElementById('ai-widget-btn');
  const box   = document.getElementById('ai-widget-box');
  const close = document.getElementById('ai-widget-close');
  const msgs  = document.getElementById('ai-widget-msgs');
  const input = document.getElementById('ai-widget-input');
  const send  = document.getElementById('ai-widget-send');

  const sessionId = 'widget_' + Math.random().toString(36).substr(2,9);
  let busy = false;

  btn.onclick = () => {
    box.classList.toggle('open');
    if (box.classList.contains('open')) input.focus();
  };

  close.onclick = () => box.classList.remove('open');

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMsg();
    }
  });

  send.onclick = sendMsg;

  function addMsg(text, role) {
    const d = document.createElement('div');
    d.className = 'w-msg ' + role;
    d.innerHTML = text
      .replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>')
      .replace(/\*(.*?)\*/g,'<em>$1</em>')
      .replace(/(https?:\/\/[^\s]+)/g,'<a href="$1" target="_blank">$1</a>')
      .replace(/\n/g,'<br>');
    msgs.appendChild(d);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function showTyping() {
    const d = document.createElement('div');
    d.className = 'w-typing';
    d.id = 'w-typing';
    d.innerHTML = '<div class="w-dot"></div><div class="w-dot"></div><div class="w-dot"></div>';
    msgs.appendChild(d);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function hideTyping() {
    const t = document.getElementById('w-typing');
    if (t) t.remove();
  }

  async function sendMsg() {
    const text = input.value.trim();
    if (!text || busy) return;

    busy = true;
    send.disabled = true;
    input.value = '';
    addMsg(text, 'user');
    showTyping();

    try {
      const response = await fetch(CHAT_API + '/chat', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({
          message: text,
          session_id: sessionId
        })
      });

      const data = await response.json();
      hideTyping();
      addMsg(data.reply || data.error || "Something went wrong.", 'bot');

    } catch (err) {
      hideTyping();
      addMsg("⚠️ Could not connect to assistant.", 'bot');
    }

    busy = false;
    send.disabled = false;
    input.focus();
  }

})();
});
