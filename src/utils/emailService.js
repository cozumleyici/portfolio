// İletişim formu için EmailJS alternatifi
import { init } from '@emailjs/browser';

export const sendEmail = async (formData) => {
  try {
    // EmailJS konfigürasyonu
    init('YOUR_PUBLIC_KEY');
    
    const templateParams = {
      from_name: formData.name,
      from_email: formData.email,
      message: formData.message,
      to_name: 'Birol Sanlı',
    };

    const response = await emailjs.send(
      'YOUR_SERVICE_ID',
      'YOUR_TEMPLATE_ID',
      templateParams
    );

    return { success: true, message: 'Mesajınız başarıyla gönderildi!' };
  } catch (error) {
    console.error('Email gönderme hatası:', error);
    return { success: false, message: 'Mesaj gönderilemedi. Lütfen tekrar deneyin.' };
  }
};
