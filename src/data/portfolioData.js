export const portfolioData = {
  hero: {
    name: "Birol Sanlı",
    title: "Full Stack Developer",
    slogan: "Modern web çözümleriyle dijital geleceği şekillendiriyorum",
    ctaButtons: [
      { text: "Projelerimi İncele", href: "#projects" },
      { text: "Bana Ulaş", href: "#contact" }
    ]
  },
  files: {
    vers_kontrolu: "1.0.0",
    vers_kontroluBillboard: "1.0.0",
    vers_kontroluCBS: "1.0.0",
    vers_kontroluExcelArama: "1.0.0",
    vers_kontroluTespitKontrol: "1.0.0"
  },
  about: {
    title: "Hakkımda",
    description: "Yazılım geliştirmeye olan tutkum, kullanıcı odaklı ve performanslı web uygulamaları oluşturmayı hedefliyorum. Frontend ve backend teknolojilerinde derinlemesine uzmanlıkla, karmaşık problemlere elegant çözümler sunuyorum. 5+ yıllık deneyimimle, startup'lardan enterprise seviye projelere kadar çeşitli ölçeklerde uygulamalar geliştirdim.",
    skills: "React, Next.js, Node.js, MongoDB, TypeScript, PostgreSQL, Docker, AWS"
  },
  skills: {
    title: "Yetenekler",
    categories: [
      {
        name: "Frontend",
        items: [
          { name: "React.js", level: 90 },
          { name: "Next.js", level: 85 },
          { name: "TypeScript", level: 80 },
          { name: "Tailwind CSS", level: 88 },
          { name: "HTML/CSS", level: 95 },
          { name: "JavaScript", level: 92 }
        ]
      },
      {
        name: "Backend",
        items: [
          { name: "Node.js", level: 85 },
          { name: "Express.js", level: 80 },
          { name: "MongoDB", level: 75 },
          { name: "PostgreSQL", level: 70 },
          { name: "REST APIs", level: 88 },
          { name: "GraphQL", level: 65 }
        ]
      },
      {
        name: "Tools & Others",
        items: [
          { name: "Git", level: 90 },
          { name: "Docker", level: 65 },
          { name: "AWS", level: 60 },
          { name: "Figma", level: 70 },
          { name: "VS Code", level: 95 },
          { name: "Linux", level: 75 }
        ]
      }
    ]
  },
  projects: [
    {
      id: 1,
      title: "E-Ticaret Platformu",
      description: "Modern React ve Node.js ile geliştirilmiş, tam fonksiyonlu e-ticaret sitesi. Kullanıcı kimlik doğrulama, ödeme sistemi, yönetici paneli ve gerçek zamanlı stok yönetimi özellikleri içerir.",
      image: "/images/project1.jpg",
      technologies: ["React", "Node.js", "MongoDB", "Stripe", "JWT"],
      github: "https://github.com/birolsanli/ecommerce-platform",
      demo: "https://ecommerce-demo.com"
    },
    {
      id: 2,
      title: "Task Management App",
      description: "Drag-and-drop özellikli, modern task yönetim uygulaması. Real-time collaboration, proje takibi ve analitik raporlama özellikleri sunar.",
      image: "/images/project2.jpg",
      technologies: ["Next.js", "TypeScript", "PostgreSQL", "Prisma", "Socket.io"],
      github: "https://github.com/birolsanli/task-app",
      demo: "https://task-app-demo.com"
    },
    {
      id: 3,
      title: "Real-time Chat App",
      description: "Socket.io ile gerçek zamanlı mesajlaşma uygulaması. Oda oluşturma, dosya paylaşımı ve emoji desteği gibi özellikler içerir.",
      image: "/images/project3.jpg",
      technologies: ["React", "Socket.io", "Express", "Redis", "JWT"],
      github: "https://github.com/birolsanli/chat-app",
      demo: null
    },
    {
      id: 4,
      title: "Blog Platformu",
      description: "CMS özellikli, SEO optimize edilmiş blog platformu. Markdown desteği, etiket sistemi ve yorum özellikleri içerir.",
      image: "/images/project4.jpg",
      technologies: ["Next.js", "MDX", "PostgreSQL", "Tailwind", "Vercel"],
      github: "https://github.com/birolsanli/blog-platform",
      demo: "https://blog-demo.com"
    },
    {
      id: 5,
      title: "Weather Dashboard",
      description: "Hava durumu takip uygulaması. Konum bazlı tahminler, grafiksel gösterimler ve 5 günlük tahmin özellikleri.",
      image: "/images/project5.jpg",
      technologies: ["React", "API Integration", "Chart.js", "Geolocation"],
      github: "https://github.com/birolsanli/weather-app",
      demo: "https://weather-demo.com"
    },
    {
      id: 6,
      title: "Social Media Analytics",
      description: "Sosyal medya analitik platformu. Performans metrikleri, raporlama ve veri görselleştirme özellikleri sunar.",
      image: "/images/project6.jpg",
      technologies: ["Node.js", "React", "D3.js", "MongoDB", "REST API"],
      github: "https://github.com/birolsanli/analytics-dashboard",
      demo: null
    }
  ],
  experience: [
    {
      id: 1,
      title: "Senior Full Stack Developer",
      company: "Tech Company",
      period: "2022 - Present",
      description: "React ve Node.js tabanlı enterprise seviye uygulamalar geliştirme. Mikroservis mimarisi ve bulut çözümleri üzerinde çalışıyorum.",
      achievements: [
        "Performans optimizasyonu ile %40 hız artışı sağlandı",
        "Mikroservis mimarisine geçiş tamamlandı",
        "Ekip liderliği ve junior geliştiricilere mentorluk",
        "CI/CD pipeline'ları kurulumu ve optimizasyonu"
      ]
    },
    {
      id: 2,
      title: "Full Stack Developer",
      company: "Digital Agency",
      period: "2020 - 2022",
      description: "Müşteri projeleri için modern frontend ve backend çözümleri geliştirme. Agile metodoloji ile proje yönetimi.",
      achievements: [
        "15+ responsive web sitesi teslim edildi",
        "UI/UX implementasyonu ve prototipleme",
        "Cross-browser uyumluluk ve accessibility optimizasyonu",
        "Müşteri memnuniyet oranı %95+"
      ]
    },
    {
      id: 3,
      title: "Frontend Developer",
      company: "Startup Hub",
      period: "2018 - 2020",
      description: "Early stage startup'lar için web uygulamaları geliştirme. MVP oluşturma ve product development süreçleri.",
      achievements: [
        "3 startup'ın MVP geliştirilmesi",
        "Component library ve design system oluşturma",
        "Performance optimization ve SEO implementasyonu",
        "User testing ve feedback collection"
      ]
    }
  ],
  contact: {
    title: "İletişim",
    description: "Yeni projeler, iş birlikleri ve fırsatlar için benimle iletişime geçin. Size nasıl yardımcı olabileceğimi konuşmaktan mutluluk duyarım.",
    email: "cozumleyici@outlook.com",
    social: [
      { name: "GitHub", icon: "FaGithub", url: "https://github.com/birolsanli" },
      { name: "LinkedIn", icon: "FaLinkedin", url: "https://linkedin.com/in/birolsanli" },
      { name: "Twitter", icon: "FaTwitter", url: "https://twitter.com/birolsanli" }
    ]
  }
};
