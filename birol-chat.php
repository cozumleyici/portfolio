<?php
/**
 * BirolChat — Telegram Backend (Polling Only - No Webhook)
 * Ziyaretçi -> Web Chat -> PHP -> Telegram (Sen)
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit; }

// ─── AYARLAR ─────────────────────────────────────────────────────────────
define('TG_TOKEN',    '8643642855:AAGDm3OBpARCcCnMLKQ7R7IR2eKtCaIYxHc');
define('TG_CHAT_ID',  '6219303494');
define('DATA_DIR',    __DIR__ . '/sessions');
// ─────────────────────────────────────────────────────────────────────────

if (!is_dir(DATA_DIR)) mkdir(DATA_DIR, 0755, true);

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

// ─── POST: Ziyaretçiden mesaj al -> Telegram'a gönder ─────────────────────
if ($method === 'POST' && $action === 'send') {
    $body    = json_decode(file_get_contents('php://input'), true);
    $message = trim($body['message'] ?? '');
    $session = preg_replace('/[^a-zA-Z0-9]/', '', $body['session'] ?? '');

    if (!$message || !$session) {
        exit(json_encode(['ok' => false]));
    }

    $sessionFile = DATA_DIR . "/$session.json";
    $data = file_exists($sessionFile) ? json_decode(file_get_contents($sessionFile), true) : ['replies' => []];
    
    // Ziyaretçi mesajını kaydet
    $data['message'] = $message;
    $data['time'] = time();

    // Telegram'a bildirim gönder
    $tgText = "💬 *BirolChat Yeni Mesaj*\n";
    $tgText .= "ID: `{$session}`\n";
    $tgText .= "Ziyaretçi: {$message}\n\n";
    $tgText .= "Cevap için: https://birols.com/birol-chat/admin.html";

    sendTelegram($tgText);
    file_put_contents($sessionFile, json_encode($data));

    exit(json_encode(['ok' => true]));
}

// ─── GET: Ziyaretçi için cevapları kontrol et (Polling) ───────────────────
if ($method === 'GET' && $action === 'poll') {
    $session = preg_replace('/[^a-zA-Z0-9]/', '', $_GET['session'] ?? '');
    $since   = intval($_GET['since'] ?? 0);
    $sessionFile = DATA_DIR . "/$session.json";

    if (!file_exists($sessionFile)) {
        exit(json_encode(['ok' => true, 'replies' => []]));
    }

    $data = json_decode(file_get_contents($sessionFile), true);
    $replies = [];
    foreach ($data['replies'] ?? [] as $r) {
        if ($r['time'] > $since) {
            $replies[] = $r;
        }
    }

    exit(json_encode(['ok' => true, 'replies' => array_values($replies)]));
}

// ─── GET: Oturum listesi (Admin panel için) ───────────────────────────────
if ($method === 'GET' && $action === 'list_sessions') {
    $files = glob(DATA_DIR . '/*.json');
    $sessions = [];
    
    if ($files) {
        foreach ($files as $file) {
            $data = json_decode(file_get_contents($file), true);
            $sessionId = basename($file, '.json');
            $sessions[] = [
                'id' => $sessionId,
                'time' => filemtime($file),
                'message' => $data['message'] ?? 'Bilinmiyor',
                'replies' => $data['replies'] ?? []
            ];
        }
    }
    
    usort($sessions, function($a, $b) {
        return $b['time'] - $a['time'];
    });
    
    exit(json_encode(['ok' => true, 'sessions' => $sessions]));
}

// ─── POST: Admin cevabı (Manuel) ────────────────────────────────────────
if ($method === 'POST' && $action === 'reply') {
    $body    = json_decode(file_get_contents('php://input'), true);
    $session = preg_replace('/[^a-zA-Z0-9]/', '', $body['session'] ?? '');
    $message = trim($body['message'] ?? '');

    if (!$session || !$message) {
        exit(json_encode(['ok' => false]));
    }

    $sessionFile = DATA_DIR . "/$session.json";
    $data = file_exists($sessionFile) ? json_decode(file_get_contents($sessionFile), true) : ['replies' => []];
    $data['replies'][] = [
        'text' => $message,
        'time' => time()
    ];
    file_put_contents($sessionFile, json_encode($data));

    exit(json_encode(['ok' => true]));
}

// ─── POST: Oturum sil ────────────────────────────────────────────────────────
if ($method === 'POST' && $action === 'delete_session') {
    $body    = json_decode(file_get_contents('php://input'), true);
    $session = preg_replace('/[^a-zA-Z0-9]/', '', $body['session'] ?? '');

    if (!$session) {
        exit(json_encode(['ok' => false]));
    }

    $sessionFile = DATA_DIR . "/$session.json";
    if (file_exists($sessionFile)) {
        unlink($sessionFile);
    }

    exit(json_encode(['ok' => true]));
}

// ─── POST: Tüm oturumları temizle ────────────────────────────────────────────
if ($method === 'POST' && $action === 'clear_sessions') {
    $files = glob(DATA_DIR . '/*.json');
    foreach ($files as $file) {
        unlink($file);
    }

    exit(json_encode(['ok' => true]));
}

function sendTelegram($text) {
    $url = "https://api.telegram.org/bot" . TG_TOKEN . "/sendMessage";
    $postData = [
        'chat_id' => TG_CHAT_ID,
        'text' => $text,
        'parse_mode' => 'Markdown'
    ];
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_exec($ch);
    curl_close($ch);
}
