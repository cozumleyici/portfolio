/**
 * HazeChat — Telegram Backend (Vercel Functions)
 * Ziyaretçi -> Web Chat -> Vercel Function -> Telegram (Sen)
 */

// Telegram Token ve Chat ID
const TG_TOKEN = '8643642855:AAGDm3OBpARCcCnMLKQ7R7IR2eKtCaIYxHc';
const TG_CHAT_ID = '6219303494';

// Session storage (Vercel KV kullanabilirsiniz, şimdilik memory)
const sessions = new Map();

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const action = req.query.action || '';

  // POST: Ziyaretçiden mesaj al -> Telegram'a gönder
  if (req.method === 'POST') {
    const { message, session } = req.body;
    
    if (!message || !session) {
      return res.status(400).json({ ok: false });
    }

    // Session verisi
    if (!sessions.has(session)) {
      sessions.set(session, { replies: [] });
    }

    // Telegram'a bildirim gönder
    const tgText = `💬 *HazeBox Yeni Mesaj*\nID: \`${session}\`\nZiyaretçi: ${message}\n\nCevap için bu mesajı yanıtla veya başına \`${session}:\` yaz.`;
    
    try {
      await sendTelegram(tgText);
      res.status(200).json({ ok: true });
    } catch (error) {
      res.status(500).json({ ok: false, error: error.message });
    }
    return;
  }

  // GET: Ziyaretçi için cevapları kontrol et (Polling)
  if (req.method === 'GET' && action === 'poll') {
    const { session, since } = req.query;
    const sessionData = sessions.get(session);
    
    if (!sessionData) {
      return res.status(200).json({ ok: true, replies: [] });
    }

    const sinceTime = parseInt(since) || 0;
    const replies = sessionData.replies.filter(r => r.time > sinceTime);
    
    res.status(200).json({ ok: true, replies });
    return;
  }

  // POST: Webhook (Telegram'dan cevap gelince)
  if (req.method === 'POST' && action === 'webhook') {
    const update = req.body;
    const msg = update.message;
    
    if (!msg) {
      res.status(200).end();
      return;
    }

    const text = msg.text || '';
    const replyTo = msg.reply_to_message?.text || '';

    let targetSession = '';
    let replyText = text;

    // Session ID'yi bul
    if (replyTo && replyTo.includes('ID:')) {
      const match = replyTo.match(/ID: `([a-zA-Z0-9]+)`/);
      if (match) targetSession = match[1];
    } else if (/^([a-zA-Z0-9]{5,}):(.+)$/s.test(text)) {
      const match = text.match(/^([a-zA-Z0-9]{5,}):(.+)$/s);
      if (match) {
        targetSession = match[1].trim();
        replyText = match[2].trim();
      }
    } else {
      // Son aktif session
      const lastSession = Array.from(sessions.keys()).pop();
      if (lastSession) targetSession = lastSession;
    }

    if (targetSession && sessions.has(targetSession)) {
      const sessionData = sessions.get(targetSession);
      sessionData.replies.push({
        text: replyText,
        time: Math.floor(Date.now() / 1000)
      });
    }

    res.status(200).json({ ok: true });
    return;
  }

  res.status(404).json({ ok: false });
}

async function sendTelegram(text) {
  const url = `https://api.telegram.org/bot${TG_TOKEN}/sendMessage`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: TG_CHAT_ID,
      text: text,
      parse_mode: 'Markdown'
    })
  });
  
  if (!response.ok) {
    throw new Error(`Telegram API error: ${response.status}`);
  }
}
