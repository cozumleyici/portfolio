// EmailJS konfigürasyon dosyası
// Bu dosyayı kendi EmailJS bilgilerinizle güncelleyin

export const emailConfig = {
  // EmailJS dashboard'dan alın
  SERVICE_ID: 'service_bzrxtko',        // ✅ Mevcut Gmail service
  TEMPLATE_ID: 'template_pa59edn',       // ✅ Mevcut template
  PUBLIC_KEY: 'YOUR_PUBLIC_KEY',       // 🔑 EmailJS'den alın (pk_xxxxx)
  
  // Form verileri
  TO_EMAIL: 'birolsanli29@gmail.com',  // ✅ Gmail adresiniz
  TO_NAME: 'Birol Sanlı'
};

// EmailJS kurulum adımları:
// 1. https://www.emailjs.com/ adresine gidin
// 2. ✅ Hesap oluşturuldu ve Gmail bağlandı
// 3. ✅ Email Service oluşturuldu (service_bzrxtko)
// 4. ✅ Email Template oluşturuldu (template_pa59edn)
// 5. 🔑 Public key'i kopyalayın (Account > Public Key)
// 6. Yukarıdaki PUBLIC_KEY'i güncelleyin
