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
    /* ===============================
      FLOATING BUTTON CONTAINER
    ================================ */

    #ai-widget-btn {
      position: fixed;
      bottom: 28px;
      right: 28px;
      z-index: 99999;

      background: none;
      border: none;
      cursor: pointer;

      display: flex;
      flex-direction: column;
      align-items: center;

      transition: transform 0.3s ease;
    }

    #ai-widget-btn:hover {
      transform: scale(1.05);
    }

    /* ===============================
      AI CONTAINER
    ================================ */

    .ai-container {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    /* ===============================
      BOT IMAGE
    ================================ */

    .ai-bot {
      width: 85px;
      max-width: 100%;
      display: block;
      animation: floatBot 3s ease-in-out infinite;
    }

    @keyframes floatBot {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }

    /* ===============================
      SHADOW
    ================================ */

    .ai-shadow {
      width: 70px;
      height: 14px;
      background: radial-gradient(
        ellipse at center,
        rgba(0,0,0,0.4) 0%,
        rgba(0,0,0,0.1) 70%,
        transparent 100%
      );
      border-radius: 50%;
      margin-top: 4px;
      animation: shadowBounce 3s ease-in-out infinite;
    }

    @keyframes shadowBounce {
      0%,100% { transform: scale(1); opacity: 0.3; }
      50% { transform: scale(0.7); opacity: 0.15; }
    }

    /* ===============================
      HI BUBBLE
    ================================ */

    .hi-bubble {
      position: absolute;
      top: -8px;
      left: 65px;
      background: white;
      color: #1e3a8a;
      font-size: 12px;
      padding: 4px 8px;
      border-radius: 14px;
      font-weight: 600;
      opacity: 0;
      animation: popHi 4s infinite;
    }

    @keyframes popHi {
      0%,60%,100% { opacity: 0; transform: scale(0.8); }
      70%,90% { opacity: 1; transform: scale(1); }
    }

    /* ===============================
      LABEL TEXT
    ================================ */

    .ai-label {
      margin-top: 6px;
      font-size: 13px;
      font-weight: 600;
      color: #ffffff;
      text-shadow: 0 2px 6px rgba(0,0,0,0.4);
    }

    /* ===============================
      GLOW EFFECT
    ================================ */

    #ai-widget-btn {
      animation: glow 3s infinite;
    }

    @keyframes glow {
      0% { filter: drop-shadow(0 0 0px #7c6aff); }
      50% { filter: drop-shadow(0 0 10px #7c6aff); }
      100% { filter: drop-shadow(0 0 0px #7c6aff); }
    }

    /* ===============================
      CHATBOX UI (UNCHANGED CLEAN)
    ================================ */

    #ai-widget-box {
      position: fixed;
      bottom: 110px;
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

    /* ===============================
      MOBILE RESPONSIVE
    ================================ */

    @media(max-width:480px){

      #ai-widget-btn {
        bottom: 18px;
        right: 14px;
      }

      .ai-bot {
        width: 65px;
      }

      .ai-shadow {
        width: 55px;
      }

      .ai-label {
        font-size: 11px;
      }

      .hi-bubble {
        font-size: 10px;
        left: 50px;
      }

      #ai-widget-box {
        width: calc(100vw - 24px);
        right: 12px;
        bottom: 100px;
      }
    }

  `;
  document.head.appendChild(style);

  // ──────────────────────────────────────────────────────────────
  // HTML
  // ──────────────────────────────────────────────────────────────
  document.body.insertAdjacentHTML('beforeend', `
    <button id="ai-widget-btn">
      <div class="ai-container">
        <img src="images/chatbot1.png" class="ai-bot" />
        <div class="ai-shadow"></div>
        <div class="hi-bubble">Hi!</div>
      </div>
    </button>



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
