/**
 * HazeChat — Telegram Backend (Next.js App Router)
 * Ziyaretçi -> Web Chat -> Vercel Function -> Telegram (Sen)
 */

import { NextRequest, NextResponse } from 'next/server';

// Telegram Token ve Chat ID
const TG_TOKEN = '8643642855:AAGDm3OBpARCcCnMLKQ7R7IR2eKtCaIYxHc';
const TG_CHAT_ID = '6219303494';

// Session storage (Vercel KV kullanabilirsiniz, şimdilik memory)
const sessions = new Map();

export async function GET(request) {
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get('action');
  const session = searchParams.get('session');
  const since = searchParams.get('since');

  // CORS
  const response = NextResponse.json({ ok: true });
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');

  // Polling
  if (action === 'poll' && session) {
    const sessionData = sessions.get(session);
    
    if (!sessionData) {
      return NextResponse.json({ ok: true, replies: [] });
    }

    const sinceTime = parseInt(since || '0') || 0;
    const replies = sessionData.replies.filter(r => r.time > sinceTime);
    
    return NextResponse.json({ ok: true, replies });
  }

  return NextResponse.json({ ok: true });
}

export async function POST(request) {
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get('action');
  
  // CORS preflight
  const response = NextResponse.json({ ok: true });
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');

  try {
    const body = await request.json();
    const { message, session } = body;

    // Webhook (Telegram'dan cevap gelince)
    if (action === 'webhook') {
      const msg = body.message;
      
      if (!msg) {
        return NextResponse.json({ ok: true });
      }

      const text = msg.text || '';
      const replyTo = msg.reply_to_message?.text || '';

      let targetSession = '';
      let replyText = text;

      // Session ID'yi bul
      if (replyTo && replyTo.includes('ID:')) {
        const match = replyTo.match(/ID: `([a-zA-Z0-9]+)`/);
        if (match) targetSession = match[1];
      } else if (/^([a-zA-Z0-9]{5,}):/.test(text)) {
        const match = text.match(/^([a-zA-Z0-9]{5,}):(.+)$/);
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
        if (sessionData) {
          sessionData.replies.push({
            text: replyText,
            time: Math.floor(Date.now() / 1000)
          });
        }
      }

      return NextResponse.json({ ok: true });
    }

    // POST: Ziyaretçiden mesaj al -> Telegram'a gönder
    if (!message || !session) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    // Session verisi
    if (!sessions.has(session)) {
      sessions.set(session, { replies: [] });
    }

    // Telegram'a bildirim gönder
    const tgText = `💬 *HazeBox Yeni Mesaj*\nID: \`${session}\`\nZiyaretçi: ${message}\n\nCevap için bu mesajı yanıtla veya başına \`${session}:\` yaz.`;
    
    await sendTelegram(tgText);
    
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}

export async function OPTIONS() {
  const response = NextResponse.json({ ok: true });
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return response;
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
