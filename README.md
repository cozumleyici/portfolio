# Birol Sanlı - Full Stack Developer Portfolyo

Modern, responsive ve etkileyici bir Full Stack Developer portfolyo sitesi.

## 🚀 Özellikler

- ✅ **Modern Tasarım**: Tailwind CSS ile şık ve minimalist arayüz
- ✅ **Responsive**: Mobil, tablet ve masaüstü cihazlarda mükemmel görünüm
- ✅ **Dark/Light Mod**: Göz yorgunluğunu azaltan tema değiştirme
- ✅ **Animasyonlar**: Framer Motion ile smooth geçişler ve mikro etkileşimler
- ✅ **SEO Optimize**: Meta tag'ler ve semantic HTML
- ✅ **Performans**: Next.js ile hızlı yükleme ve optimize edilmiş kod
- ✅ **İletişim Formu**: Çalışan API endpoint ile mesaj gönderme

## 🛠️ Teknoloji Yığını

### Frontend
- **Next.js 14** - React framework
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animasyon library
- **React Icons** - Icon library
- **React Intersection Observer** - Scroll animasyonları

### Backend
- **Next.js API Routes** - Server-side functionality
- **Node.js** - Runtime environment

## 📁 Proje Yapısı

```
portfolio/
├── src/
│   ├── app/
│   │   ├── api/contact/route.js     # İletişim formu API
│   │   ├── globals.css              # Global stiller
│   │   ├── layout.tsx               # Ana layout
│   │   └── page.tsx                 # Ana sayfa
│   ├── components/
│   │   ├── Hero.jsx                 # Hero bölümü
│   │   ├── About.jsx                # Hakkımda bölümü
│   │   ├── Skills.jsx               # Yetenekler bölümü
│   │   ├── Projects.jsx             # Projeler bölümü
│   │   ├── Experience.jsx           # Deneyim bölümü
│   │   ├── Contact.jsx              # İletişim bölümü
│   │   ├── Navbar.jsx               # Navigasyon bar
│   │   └── Footer.jsx               # Footer
│   └── data/portfolioData.js        # Portfolyo verileri
├── public/                          # Statik dosyalar
└── README.md                        # Proje dokümantasyonu
```

## 🚀 Kurulum ve Çalıştırma

### Gereksinimler
- Node.js 18+ 
- npm veya yarn

### Adımlar

1. **Dependencies'leri yükle:**
```bash
npm install
```

2. **Geliştirme sunucusunu başlat:**
```bash
npm run dev
```

3. **Tarayıcıda aç:**
```
http://localhost:3000
```

## 🎯 Bölümler

### 1. Hero Section
- Kişisel tanıtım ve gradient animasyonlar
- Sosyal medya linkleri ve CTA butonları

### 2. About Section  
- Profesyonel özet ve yetenekler
- Değer önerileri ve profil görseli

### 3. Skills Section
- Kategorize edilmiş yetenekler (Frontend, Backend, Tools)
- Animasyonlu progress bar'lar

### 4. Projects Section
- 6 adet örnek proje
- Teknoloji etiketleri ve GitHub linkleri

### 5. Experience Section
- Timeline formatında deneyim
- Şirket bilgileri ve başarılar

### 6. Contact Section
- İletişim formu ve sosyal medya linkleri
- Form validasyonu ve API entegrasyonu

## 📝 Özelleştirme

Kişisel bilgileri `src/data/portfolioData.js` dosyasından düzenleyebilirsiniz:

- Kişisel bilgiler
- Proje verileri  
- Deneyim bilgileri
- Sosyal medya linkleri

## 🎨 Stil Özelleştirme

`src/app/globals.css` dosyasında:
- Renk paleti ve CSS değişkenleri
- Animasyonlar ve geçişler
- Custom stiller

## 📱 Responsive Tasarım

- **Mobil**: 320px ve üzeri
- **Tablet**: 768px ve üzeri  
- **Desktop**: 1024px ve üzeri

## 📧 İletişim Formu

Form gönderimi için API endpoint:
```
POST /api/contact
{
  "name": "İsim",
  "email": "email@example.com", 
  "message": "Mesaj içeriği"
}
```

## 🚀 Deployment

### Vercel (Önerilen)
```bash
npm install -g vercel
vercel
```

## 👨‍💻 Author

**Birol Sanlı**
- [GitHub](https://github.com/birolsanli)
- [LinkedIn](https://linkedin.com/in/birolsanli)

---

⭐ Eğer bu proje beğendiyseniz star vermeyi unutmayın!
# portfolio
