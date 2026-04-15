 /**
 * BirolChat Widget v2.0
 * ─────────────────────────────────────────────────────────────────────────────
 * 4 Mod desteği:
 *  "bot"       → Otomatik anahtar kelime bazlı yanıtlar (sunucu gerekmez)
 *  "whatsapp"  → Ziyaretçi yazar → senin WhatsApp'ına düşer → cevaplarsın → ziyaretçiye gider
 *  "telegram"  → Ziyaretçi yazar → senin Telegram'ına düşer → cevaplarsın → ziyaretçiye gider (ÜCRETSİZ!)
 *  "api"       → Özel REST API'ye bağlanır
 *
 * Kullanım:
 *   <script src="birol-chat.js"></script>
 *   <script>
 *     BirolChat.init({
 *       apiMode: "telegram",
 *       apiUrl:  "https://birols.com/birol-chat/birol-chat.php"
 *     });
 *   </script>
 */
(function (window, document) {
  "use strict";

  // ─── CSS ──────────────────────────────────────────────────────────────────
  const CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

    :root {
      --hc-bg0:    #0c0c0f;
      --hc-bg1:    #141419;
      --hc-bg2:    #1c1c24;
      --hc-border: rgba(255,255,255,0.08);
      --hc-org:    #ff6b00;
      --hc-org-g:  rgba(255,107,0,0.22);
      --hc-ind:    #6366f1;
      --hc-ind-g:  rgba(99,102,241,0.22);
      --hc-txt:    #f0f0f0;
      --hc-muted:  #8888aa;
      --hc-green:  #22c55e;
      --hc-r:      18px;
      --hc-shadow: 0 24px 80px rgba(0,0,0,0.72), 0 0 0 1px rgba(255,255,255,0.05);
    }

    /* FAB */
    #hc-fab {
      position:fixed; bottom:28px; right:28px;
      width:62px; height:62px; border-radius:50%;
      background:linear-gradient(135deg,var(--hc-org),#c95200);
      border:none; cursor:pointer;
      box-shadow:0 8px 32px var(--hc-org-g),0 2px 8px rgba(0,0,0,.4);
      display:flex; align-items:center; justify-content:center;
      z-index:9999;
      transition:transform .32s cubic-bezier(.34,1.56,.64,1), box-shadow .3s;
      font-family:'Inter',sans-serif;
    }
    #hc-fab:hover { transform:scale(1.12); box-shadow:0 14px 44px var(--hc-org-g); }
    #hc-fab svg   { transition:transform .28s ease, opacity .22s; position:absolute; }
    #hc-fab .ic-chat  { opacity:1; transform:scale(1) rotate(0deg); }
    #hc-fab .ic-close { opacity:0; transform:scale(.5) rotate(45deg); }
    #hc-fab.open .ic-chat  { opacity:0; transform:scale(.4) rotate(-30deg); }
    #hc-fab.open .ic-close { opacity:1; transform:scale(1) rotate(0deg); }

    /* Badge */
    #hc-badge {
      position:fixed; bottom:78px; right:26px;
      width:20px; height:20px; border-radius:50%;
      background:var(--hc-ind); color:#fff;
      font-family:'Inter',sans-serif; font-size:11px; font-weight:700;
      display:flex; align-items:center; justify-content:center;
      z-index:10000; box-shadow:0 2px 10px var(--hc-ind-g);
      transform:scale(0); opacity:0;
      transition:transform .3s cubic-bezier(.34,1.56,.64,1), opacity .2s;
      pointer-events:none;
    }
    #hc-badge.show { transform:scale(1); opacity:1; }

    /* Window */
    #hc-win {
      position:fixed; bottom:104px; right:28px;
      width:380px; height:560px;
      background:var(--hc-bg0); border:1px solid var(--hc-border);
      border-radius:var(--hc-r); box-shadow:var(--hc-shadow);
      display:flex; flex-direction:column; overflow:hidden;
      z-index:9998; font-family:'Inter',sans-serif;
      transform-origin:bottom right;
      transform:scale(.88) translateY(20px); opacity:0; pointer-events:none;
      transition:transform .35s cubic-bezier(.34,1.46,.64,1), opacity .24s;
    }
    #hc-win.show { transform:scale(1) translateY(0); opacity:1; pointer-events:all; }

    /* Header */
    #hc-header {
      display:flex; align-items:center; gap:12px;
      padding:15px 18px;
      background:linear-gradient(135deg,rgba(255,107,0,.14) 0%,rgba(99,102,241,.08) 100%);
      border-bottom:1px solid var(--hc-border); flex-shrink:0;
    }
    .hc-av {
      width:42px; height:42px; border-radius:50%;
      background:linear-gradient(135deg,var(--hc-org),var(--hc-ind));
      display:flex; align-items:center; justify-content:center;
      font-size:20px; flex-shrink:0; position:relative;
    }
    .hc-av::after {
      content:''; position:absolute; bottom:1px; right:1px;
      width:10px; height:10px; background:var(--hc-green);
      border:2px solid var(--hc-bg0); border-radius:50%;
    }
    .hc-av.offline::after { background:#ef4444; }
    .hc-info { flex:1; min-width:0; }
    .hc-info h3 {
      margin:0; font-size:15px; font-weight:700; color:var(--hc-txt);
      white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
    }
    .hc-info span { font-size:12px; color:var(--hc-green); font-weight:500; }
    .hc-info span.offline { color:#ef4444; }
    #hc-close {
      background:rgba(255,255,255,.06); border:none; cursor:pointer;
      color:var(--hc-muted); width:30px; height:30px; border-radius:8px;
      display:flex; align-items:center; justify-content:center;
      transition:background .2s, color .2s; flex-shrink:0;
    }
    #hc-close:hover { background:rgba(255,255,255,.12); color:var(--hc-txt); }

    /* WA indicator strip */
    #hc-wa-strip {
      display:none; align-items:center; gap:8px;
      padding:7px 16px;
      background:rgba(37,211,102,.08);
      border-bottom:1px solid rgba(37,211,102,.18);
      font-size:12px; font-weight:600; color:#25d366;
      flex-shrink:0;
    }
    #hc-wa-strip.visible { display:flex; }
    #hc-wa-strip svg { flex-shrink:0; }

    /* Quick replies */
    #hc-qr {
      display:flex; gap:8px; padding:10px 14px;
      overflow-x:auto; flex-shrink:0;
      border-bottom:1px solid var(--hc-border);
      scrollbar-width:none;
    }
    #hc-qr:empty { display:none; }
    #hc-qr::-webkit-scrollbar { display:none; }
    .hc-qr-btn {
      background:rgba(99,102,241,.1); border:1px solid rgba(99,102,241,.28);
      color:var(--hc-ind); font-family:'Inter',sans-serif;
      font-size:12px; font-weight:600; padding:6px 13px;
      border-radius:99px; cursor:pointer; white-space:nowrap;
      transition:background .18s, border-color .18s, transform .14s; flex-shrink:0;
    }
    .hc-qr-btn:hover { background:rgba(99,102,241,.2); border-color:var(--hc-ind); transform:translateY(-1px); }

    /* Messages */
    #hc-msgs {
      flex:1; overflow-y:auto; padding:14px;
      display:flex; flex-direction:column; gap:10px;
      scroll-behavior:smooth;
    }
    #hc-msgs::-webkit-scrollbar { width:4px; }
    #hc-msgs::-webkit-scrollbar-track { background:transparent; }
    #hc-msgs::-webkit-scrollbar-thumb { background:rgba(255,255,255,.1); border-radius:99px; }

    .hc-row { display:flex; align-items:flex-end; gap:8px; animation:hcUp .28s ease forwards; }
    .hc-row.u { flex-direction:row-reverse; }
    @keyframes hcUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }

    .hc-av-sm {
      width:28px; height:28px; border-radius:50%;
      background:linear-gradient(135deg,var(--hc-org),var(--hc-ind));
      display:flex; align-items:center; justify-content:center;
      font-size:13px; flex-shrink:0; align-self:flex-end;
    }
    .hc-row.u .hc-av-sm { background:linear-gradient(135deg,var(--hc-ind),#818cf8); }

    .hc-col { display:flex; flex-direction:column; gap:2px; max-width:76%; }
    .hc-bubble {
      padding:9px 13px; border-radius:15px;
      font-size:14px; line-height:1.55; color:var(--hc-txt); word-break:break-word;
    }
    .hc-row:not(.u) .hc-bubble {
      background:var(--hc-bg2); border:1px solid var(--hc-border);
      border-bottom-left-radius:4px;
    }
    .hc-row.u .hc-bubble {
      background:linear-gradient(135deg,var(--hc-org),#c95200);
      border-bottom-right-radius:4px;
      box-shadow:0 4px 14px var(--hc-org-g);
    }
    .hc-time { font-size:10px; color:var(--hc-muted); padding:0 3px; }
    .hc-row.u .hc-time { text-align:right; }

    /* System message */
    .hc-sys {
      text-align:center; font-size:11px; color:var(--hc-muted);
      background:rgba(255,255,255,.04); border-radius:99px;
      padding:5px 14px; align-self:center;
    }

    /* Typing */
    .hc-typing { display:flex; align-items:flex-end; gap:8px; }
    .hc-t-bub {
      background:var(--hc-bg2); border:1px solid var(--hc-border);
      border-radius:15px; border-bottom-left-radius:4px;
      padding:11px 15px; display:flex; gap:5px; align-items:center;
    }
    .hc-dot {
      width:7px; height:7px; background:var(--hc-muted); border-radius:50%;
      animation:hcBounce 1.2s infinite ease-in-out;
    }
    .hc-dot:nth-child(2){ animation-delay:.15s }
    .hc-dot:nth-child(3){ animation-delay:.3s  }
    @keyframes hcBounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-5px)} }

    /* Input area */
    #hc-input-area {
      display:flex; align-items:flex-end; gap:9px;
      padding:12px 14px;
      border-top:1px solid var(--hc-border);
      background:var(--hc-bg1); flex-shrink:0;
    }
    #hc-input {
      flex:1; background:var(--hc-bg2); border:1px solid var(--hc-border);
      border-radius:11px; color:var(--hc-txt); font-family:'Inter',sans-serif;
      font-size:14px; padding:9px 13px; resize:none;
      min-height:40px; max-height:110px; outline:none;
      transition:border-color .2s, box-shadow .2s; line-height:1.5;
    }
    #hc-input::placeholder { color:var(--hc-muted); }
    #hc-input:focus {
      border-color:rgba(255,107,0,.45);
      box-shadow:0 0 0 3px rgba(255,107,0,.07);
    }
    #hc-send {
      width:40px; height:40px;
      background:linear-gradient(135deg,var(--hc-org),#c95200);
      border:none; border-radius:11px; cursor:pointer;
      display:flex; align-items:center; justify-content:center;
      flex-shrink:0; box-shadow:0 4px 14px var(--hc-org-g);
      transition:transform .2s, box-shadow .2s;
    }
    #hc-send:hover  { transform:scale(1.08); }
    #hc-send:active { transform:scale(.94); }
    #hc-send:disabled { background:#252530; box-shadow:none; cursor:not-allowed; transform:none; }

    /* Footer */
    #hc-footer {
      text-align:center; padding:7px; font-size:11px; color:var(--hc-muted);
      background:var(--hc-bg1); flex-shrink:0; border-top:1px solid var(--hc-border);
    }
    #hc-footer a { color:var(--hc-ind); text-decoration:none; font-weight:500; }

    /* Mobile */
    @media (max-width:480px) {
      #hc-win { width:calc(100vw - 18px); height:calc(100dvh - 114px); right:9px; bottom:94px; }
    }
  `;

  // ─── DEFAULTS ─────────────────────────────────────────────────────────────
  const DEFAULTS = {
    botName:     "HazeBot",
    botAvatar:   "🎮",
    botStatus:   "Çevrimiçi",
    welcomeMsg:  "Merhaba! 👋 HazeBox'a hoş geldin. Sana nasıl yardımcı olabilirim?",
    placeholder: "Mesajını yaz...",
    apiMode:     "bot",       // "bot" | "whatsapp" | "telegram" | "api"
    apiUrl:      null,        // chat.php URL'si  (whatsapp, telegram & api modunda gerekli)
    pollInterval: 3000,       // Polling süresi (ms)
    closeOnOutsideClick: false,
    quickReplies: ["Nasıl bağlanırım?", "IP adresi nedir?", "Mağaza", "Destek", "Discord"],
    botReplies: {
      default:   "Anlıyorum! Daha iyi yardım için destek ekibimize veya Discord'a ulaşabilirsin. 🔥",
      "ip":      "Sunucu IP: **play.hazebox.fit** 🎮",
      "bağlan":  "Minecraft'ı aç → Çok Oyunculu → **play.hazebox.fit** ekle!",
      "mağaza":  "Mağaza: https://hazebox.fit/magaza 🛒",
      "destek":  "Discord veya hazebox.fit üzerinden ulaş. 💬",
      "discord": "Discord: https://discord.gg/hazebox 🎉",
      "merhaba": "Merhaba! 👋 HazeBox'a hoş geldin!",
      "nasıl":   "Java & Bedrock destekli. IP: play.hazebox.fit | Port: 25565 🎮",
    }
  };

  let config = {};
  let isOpen = false;
  let unreadCount = 0;
  let pollTimer = null;
  let lastPollTime = Math.floor(Date.now() / 1000);

  // ─── Helpers ──────────────────────────────────────────────────────────────
  function injectStyles() {
    if (document.getElementById("hc-styles")) return;
    const s = document.createElement("style");
    s.id = "hc-styles";
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  const nowTime = () =>
    new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });

  function escHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }

  function mdToHtml(text) {
    return escHtml(text)
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/(https?:\/\/[^\s<]+)/g,
        '<a href="$1" target="_blank" rel="noopener noreferrer" style="color:#6366f1;word-break:break-all;">$1</a>');
  }

  function sessionId() {
    if (!window._hcSess) window._hcSess = Math.random().toString(36).slice(2, 10);
    return window._hcSess;
  }

  // ─── DOM ──────────────────────────────────────────────────────────────────
  function buildDOM() {
    // FAB
    const fab = document.createElement("button");
    fab.id = "hc-fab";
    fab.setAttribute("aria-label", "Sohbeti aç/kapat");
    fab.innerHTML = `
      <svg class="ic-chat" width="26" height="26" viewBox="0 0 24 24" fill="none"
           stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
      <svg class="ic-close" width="22" height="22" viewBox="0 0 24 24" fill="none"
           stroke="#fff" stroke-width="2.5" stroke-linecap="round">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>`;

    // Badge
    const badge = document.createElement("div");
    badge.id = "hc-badge";

    // Window
    const isWA = config.apiMode === "whatsapp";
    const isTG = config.apiMode === "telegram";
    const win = document.createElement("div");
    win.id = "hc-win";
    win.setAttribute("role", "dialog");
    win.setAttribute("aria-label", "Canlı Destek");
    win.innerHTML = `
      <div id="hc-header">
        <div class="hc-av" id="hc-av-dot">${escHtml(config.botAvatar)}</div>
        <div class="hc-info">
          <h3>${escHtml(config.botName)}</h3>
          <span id="hc-status-txt">● ${escHtml(config.botStatus)}</span>
        </div>
        <button id="hc-close" aria-label="Kapat">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <div id="hc-wa-strip" ${(isWA || isTG) ? 'class="visible"' : ''}>
        ${isWA ? `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="#25d366">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15
                   -.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075
                   -.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059
                   -.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497
                   .099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207
                   -.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01
                   -.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479
                   0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487
                   .709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118
                   .571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413
                   -.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378
                   l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26
                   c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898
                   a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884"/>
        </svg>
        WhatsApp üzerinden canlı destek aktif` : `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="#0088cc">
          <path d="M12 2C6.48 2 2 6.48 2 12c0 1.54.36 2.98.97 4.29L2 22l5.71-.97A9.96 9.96 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
        </svg>
        Telegram üzerinden canlı destek aktif`}
      </div>

      <div id="hc-qr"></div>
      <div id="hc-msgs" role="log" aria-live="polite"></div>
      <div id="hc-input-area">
        <textarea id="hc-input" placeholder="${escHtml(config.placeholder)}"
                  rows="1" maxlength="1000"></textarea>
        <button id="hc-send" disabled aria-label="Gönder">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
               stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
      <div id="hc-footer">
        ${isWA
          ? '🟢 Canlı destek — WhatsApp ile güçlendirildi'
          : isTG
          ? '🟢 Canlı destek — Telegram ile güçlendirildi'
          : 'Powered by <a href="https://hazebox.fit" target="_blank">HazeBox</a>'}
      </div>`;

    document.body.appendChild(fab);
    document.body.appendChild(badge);
    document.body.appendChild(win);
  }

  function buildQuickReplies() {
    const c = document.getElementById("hc-qr");
    if (!c || !config.quickReplies?.length) return;
    config.quickReplies.forEach(label => {
      const btn = document.createElement("button");
      btn.className = "hc-qr-btn";
      btn.textContent = label;
      btn.onclick = () => doSend(label);
      c.appendChild(btn);
    });
  }

  // ─── Messages ─────────────────────────────────────────────────────────────
  function appendMsg(text, sender = "bot") {
    const box = document.getElementById("hc-msgs");
    const isUser = sender === "user";

    const row = document.createElement("div");
    row.className = "hc-row" + (isUser ? " u" : "");

    const av = document.createElement("div");
    av.className = "hc-av-sm";
    av.textContent = isUser ? "👤" : config.botAvatar;

    const col = document.createElement("div");
    col.className = "hc-col";

    const bub = document.createElement("div");
    bub.className = "hc-bubble";
    bub.innerHTML = mdToHtml(text);

    const t = document.createElement("div");
    t.className = "hc-time";
    t.textContent = nowTime();

    col.append(bub, t);
    isUser ? row.append(col, av) : row.append(av, col);
    box.appendChild(row);
    box.scrollTop = box.scrollHeight;

    if (!isOpen && !isUser) { unreadCount++; updateBadge(); }
    return row;
  }

  function appendSys(text) {
    const box = document.getElementById("hc-msgs");
    const d = document.createElement("div");
    d.className = "hc-sys";
    d.textContent = text;
    box.appendChild(d);
    box.scrollTop = box.scrollHeight;
  }

  function showTyping() {
    const box = document.getElementById("hc-msgs");
    const row = document.createElement("div");
    row.className = "hc-typing"; row.id = "hc-typing";
    const av = document.createElement("div");
    av.className = "hc-av-sm"; av.textContent = config.botAvatar;
    const bub = document.createElement("div");
    bub.className = "hc-t-bub";
    bub.innerHTML = `<div class="hc-dot"></div><div class="hc-dot"></div><div class="hc-dot"></div>`;
    row.append(av, bub);
    box.appendChild(row);
    box.scrollTop = box.scrollHeight;
  }

  function hideTyping() {
    document.getElementById("hc-typing")?.remove();
  }

  function updateBadge() {
    const b = document.getElementById("hc-badge");
    if (!b) return;
    if (unreadCount > 0 && !isOpen) {
      b.textContent = unreadCount > 9 ? "9+" : unreadCount;
      b.classList.add("show");
    } else {
      b.classList.remove("show");
    }
  }

  // ─── Bot engine ───────────────────────────────────────────────────────────
  function botReply(text) {
    const lower = text.toLowerCase()
      .replace(/[ığüşöç]/g, c => ({ ı:"i",ğ:"g",ü:"u",ş:"s",ö:"o",ç:"c" }[c] || c));
    for (const [k, v] of Object.entries(config.botReplies))
      if (k !== "default" && lower.includes(k)) return v;
    return config.botReplies.default;
  }

  // ─── WhatsApp live mode ───────────────────────────────────────────────────
  async function sendToBackend(text) {
    const res = await fetch(config.apiUrl + '?action=send', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text, session: sessionId() })
    });
    if (!res.ok) throw new Error("Backend error " + res.status);
    return res.json();
  }

  async function pollReplies() {
    if (!config.apiUrl) return;
    try {
      const url = `${config.apiUrl}?action=poll&session=${sessionId()}&since=${lastPollTime}`;
      const res = await fetch(url);
      if (!res.ok) return;
      const data = await res.json();
      if (data.replies?.length) {
        data.replies.forEach(r => {
          // Sadece göster, tekrar gönderme
          appendMsg(r.text, "bot");
          lastPollTime = Math.max(lastPollTime, r.time);
        });
      }
    } catch (_) { /* ağ hatası, sessize al */ }
  }

  function startPolling() {
    if (pollTimer) return;
    pollTimer = setInterval(pollReplies, config.pollInterval);
  }

  function stopPolling() {
    clearInterval(pollTimer);
    pollTimer = null;
  }

  // ─── Send ─────────────────────────────────────────────────────────────────
  async function doSend(text) {
    text = (text || "").trim();
    if (!text) return;

    const inputEl = document.getElementById("hc-input");
    const sendBtn = document.getElementById("hc-send");
    if (inputEl) { inputEl.value = ""; inputEl.style.height = ""; }
    if (sendBtn) sendBtn.disabled = true;

    appendMsg(text, "user");

    // — WhatsApp backend modu —
    if (config.apiMode === "whatsapp" && config.apiUrl) {
      showTyping();
      try {
        await sendToBackend(text);
        hideTyping();
        appendSys("✅ Mesajın iletildi — destek ekibi WhatsApp'tan yanıtlıyor...");
        startPolling();
      } catch (e) {
        hideTyping();
        appendMsg("❌ Sunucuya bağlanılamadı. Lütfen tekrar dene.", "bot");
      }
      return;
    }

    // — Telegram backend modu —
    if (config.apiMode === "telegram" && config.apiUrl) {
      showTyping();
      try {
        await sendToBackend(text);
        hideTyping();
        appendSys("✅ Mesajın iletildi — destek ekibi Telegram'dan yanıtlıyor...");
        startPolling();
      } catch (e) {
        hideTyping();
        appendMsg("❌ Sunucuya bağlanılamadı. Lütfen tekrar dene.", "bot");
      }
      return;
    }

    // — Genel API modu —
    if (config.apiMode === "api" && config.apiUrl) {
      showTyping();
      try {
        const res = await fetch(config.apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text, session: sessionId() })
        });
        const data = await res.json();
        hideTyping();
        appendMsg(data.reply || data.message || data.text || "...", "bot");
      } catch (_) {
        hideTyping();
        appendMsg("Bağlantı hatası. Lütfen tekrar dene. 🔄", "bot");
      }
      return;
    }

    // — Bot modu (varsayılan) —
    showTyping();
    await new Promise(r => setTimeout(r, 650 + Math.random() * 500));
    hideTyping();
    appendMsg(botReply(text), "bot");
  }

  // ─── Toggle ───────────────────────────────────────────────────────────────
  function toggle() {
    isOpen = !isOpen;
    document.getElementById("hc-fab").classList.toggle("open", isOpen);
    document.getElementById("hc-win").classList.toggle("show", isOpen);
    if (isOpen) {
      unreadCount = 0; updateBadge();
      setTimeout(() => document.getElementById("hc-input")?.focus(), 340);
    }
  }

  // ─── Events ───────────────────────────────────────────────────────────────
  function bindEvents() {
    document.getElementById("hc-fab").onclick = toggle;
    document.getElementById("hc-close").onclick = toggle;

    const inp = document.getElementById("hc-input");
    const btn = document.getElementById("hc-send");

    inp.addEventListener("input", function () {
      btn.disabled = !this.value.trim();
      this.style.height = "auto";
      this.style.height = Math.min(this.scrollHeight, 110) + "px";
    });

    inp.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (!btn.disabled) doSend(this.value);
      }
    });

    btn.onclick = () => doSend(inp.value);

    document.addEventListener("keydown", e => {
      if (e.key === "Escape" && isOpen) toggle();
    });

    document.addEventListener("click", e => {
      if (!config.closeOnOutsideClick) return;
      const win = document.getElementById("hc-win");
      const fab = document.getElementById("hc-fab");
      if (isOpen && !win.contains(e.target) && !fab.contains(e.target)) toggle();
    });
  }

  // ─── Mount ────────────────────────────────────────────────────────────────
  function mount() {
    injectStyles();
    buildDOM();
    buildQuickReplies();
    bindEvents();
    if (config.welcomeMsg)
      setTimeout(() => appendMsg(config.welcomeMsg, "bot"), 900);
  }

  // ─── Public API ───────────────────────────────────────────────────────────
  window.BirolChat = {
    /**
     * Widget'ı başlat.
     * @param {Object} opts
     */
    init(opts = {}) {
      config = {
        ...DEFAULTS,
        ...opts,
        botReplies: { ...DEFAULTS.botReplies, ...(opts.botReplies || {}) }
      };
      if (document.readyState === "loading")
        document.addEventListener("DOMContentLoaded", mount);
      else
        mount();
    },

    /** Programatik mesaj gönder */
    send: text => doSend(text),

    /** Pencereyi aç/kapat */
    toggle,

    /** Pencere açık mı? */
    get open() { return isOpen; },

    /** Anahtar kelime → bot yanıtı ekle */
    addReply: (k, v) => { config.botReplies && (config.botReplies[k] = v); },

    /** Hızlı yanıt butonu ekle */
    addQuickReply(label) {
      const c = document.getElementById("hc-qr");
      if (!c) return;
      const btn = document.createElement("button");
      btn.className = "hc-qr-btn";
      btn.textContent = label;
      btn.onclick = () => doSend(label);
      c.appendChild(btn);
    },

    /** Polling'i manuel durdur */
    stopPolling,
  };

})(window, document);
