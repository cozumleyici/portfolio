# BirolChat - Telegram Chat Widget

Birols.com için özel Telegram tabanlı canlı destek widget'ı.

## Özellikler

- ✅ **Telegram Entegrasyonu**: Ziyaretçi mesajları Telegram'a düşer
- ✅ **Admin Paneli**: Telegram'dan gelen link ile admin panelinden cevap verilebilir
- ✅ **Ücretsiz**: Telegram Bot API kullanır (tamamen ücretsiz)
- ✅ **Polling Tabanlı**: Webhook gerektirmez
- ✅ **Oturum Yönetimi**: Her ziyaretçi için ayrı oturum
- ✅ **Cevap Geçmişi**: Admin panelinde cevap geçmişi görünür

## Kurulum

### 1. Dosyaları Sunucuya Yükle

Bu klasördeki tüm dosyaları sunucunuza yükleyin:

```
birol-chat.js
birol-chat.php
admin.html
demo.html
sessions/ (klasör)
```

### 2. İzinleri Ayarla

`sessions/` klasörünün yazılabilir olduğundan emin olun:
- `chmod 755 sessions/` veya `chmod 777 sessions/`

### 3. Sitenize Entegre Edin

Sitenizin her sayfasına şu kodu ekleyin:

```html
<script src="/birol-chat/birol-chat.js"></script>
<script>
  BirolChat.init({
    apiMode:    "telegram",
    apiUrl:     "/birol-chat/birol-chat.php",
    botName:    "BirolBot",
    botAvatar:  "🎮",
    botStatus:  "Çevrimiçi",
    welcomeMsg: "Merhaba! 👋 BirolChat'a hoş geldin. Telegram üzerinden canlı destek aktif.",
    quickReplies: ["Nasıl bağlanırım?", "IP adresi nedir?", "Mağaza", "Destek", "Discord"]
  });
</script>
```

### 4. WordPress Kullanıyorsanız

`functions.php` dosyasına ekleyin:

```php
function add_birol_chat() {
    ?>
    <script src="/birol-chat/birol-chat.js"></script>
    <script>
      BirolChat.init({
        apiMode:    "telegram",
        apiUrl:     "/birol-chat/birol-chat.php",
        botName:    "BirolBot",
        botAvatar:  "🎮",
        botStatus:  "Çevrimiçi",
        welcomeMsg: "Merhaba! 👋 BirolChat'a hoş geldin. Telegram üzerinden canlı destek aktif.",
        quickReplies: ["Nasıl bağlanırım?", "IP adresi nedir?", "Mağaza", "Destek", "Discord"]
      });
    </script>
    <?php
}
add_action('wp_footer', 'add_birol_chat');
```

## Kullanım

### Ziyaretçi Mesajı

1. Ziyaretçi siteye mesaj yazar
2. Mesaj Telegram'a düşer
3. Telegram'da admin panel linki gelir

### Cevap Verme

1. Telegram'da gelen linke tıklayın
2. Admin paneli açılır
3. Cevap yazın
4. Cevap siteye düşer

### Admin Panel

Admin panel: `https://birols.com/birol-chat/admin.html`

**Özellikler:**
- 🔄 Oturumları görüntüleme
- 📤 Cevap gönderme
- 🗑️ Tekil oturum silme
- 🗑️ Tüm oturumları temizleme

## Test

Demo sayfası: `https://birols.com/birol-chat/demo.html`

## Telegram Ayarları

Bot Token: `8643642855:AAGDm3OBpARCcCnMLKQ7R7IR2eKtCaIYxHc`
Chat ID: `6219303494`
Bot: `@Haze77_bot`

**Not:** Webhook kullanılmaz, polling tabanlı çalışır.

## Teknik Detaylar

- **Backend:** PHP (birol-chat.php)
- **Frontend:** JavaScript (birol-chat.js)
- **Veri Depolama:** JSON dosyaları (sessions/)
- **API:** Telegram Bot API
- **Polling:** 3 saniyede bir

## Sorun Giderme

**Chatbox görünmüyor mu?**
- Console'da hata kontrol edin (F12)
- Script yolu doğru mu kontrol edin
- Cache temizleyin

**Mesaj Telegram'a düşmüyor mu?**
- birol-chat.php dosyası yüklenmiş mi kontrol edin
- Telegram bot token doğru mu kontrol edin
- PHP hataları için log kontrol edin

**Cevap siteye düşmüyor mu?**
- Admin paneli çalışıyor mu kontrol edin
- sessions/ klasörü yazılabilir mi kontrol edin
- Polling çalışıyor mu kontrol edin (Console)

## Lisans

MIT License - Ücretsiz kullanım
