// Koşu Takip LocalStorage Veri Katmanı

const DB_KEYS = {
    PROFILE: 'kosutakip_profile',
    ACTIVITIES: 'kosutakip_activities',
    ONBOARDING_COMPLETED: 'kosutakip_onboarding_completed',
    POSTS: 'kosutakip_posts'
};

// Varsayılan Kullanıcı Profili
const DEFAULT_PROFILE = {
    weight: 70, // kg
    height: 175, // cm
    gender: 'female',
    birthDate: '1995-06-10',
    goal: '5km',
    audioFeedback: true,
    audioInterval: 500, // 500m
    keepScreenOn: false,
    endActivityConfirm: true,
    showStepGoalConfirm: true,
    
    // Oturum & Premium Bilgileri
    isLoggedIn: false,
    email: '',
    displayName: '',
    photoUrl: '',
    premium: false
};

// Ekran görüntülerindeki Haz 2026 verileri ile eşleşen tohum veriler
const MOCK_ACTIVITIES = [
    {
        id: 'mock-1',
        type: 'Koşu',
        date: '2026-06-09T19:23:00',
        distance: 3.41, // km
        duration: 4080, // saniye (68 dakika)
        calories: 380, // kcal
        route: [
            { lat: 41.0082, lng: 28.9784 },
            { lat: 41.0102, lng: 28.9804 },
            { lat: 41.0122, lng: 28.9824 },
            { lat: 41.0142, lng: 28.9804 },
            { lat: 41.0122, lng: 28.9784 },
            { lat: 41.0082, lng: 28.9784 }
        ]
    },
    {
        id: 'mock-2',
        type: 'Koşu',
        date: '2026-06-08T19:40:00',
        distance: 1.79, // km
        duration: 1980, // saniye (33 dakika)
        calories: 180, // kcal
        route: [
            { lat: 41.0052, lng: 28.9754 },
            { lat: 41.0072, lng: 28.9774 },
            { lat: 41.0092, lng: 28.9794 },
            { lat: 41.0052, lng: 28.9754 }
        ]
    }
];

const MOCK_POSTS = [
    {
        id: 'post-1',
        author: 'Elif Aksoy',
        initials: 'EA',
        color: '#5c3d92',
        date: '2026-06-10T08:30:00',
        content: 'Harika bir sabah koşusu! Hava çok güzeldi, hedefleri aşmaya devam. 🏃‍♀️✨',
        likes: 14,
        likedByMe: false,
        isPro: true
    },
    {
        id: 'post-2',
        author: 'Murat Yılmaz',
        initials: 'MY',
        color: '#7952b3',
        date: '2026-06-09T19:15:00',
        content: 'Yağmura yakalanmadan 10k tamamlandı. Tempo biraz düşüktü ama ciğerler açıldı. 🌲🌧️',
        likes: 8,
        likedByMe: false,
        isPro: false
    }
];

export const DB = {
    // Profil İşlemleri
    getProfile() {
        const data = localStorage.getItem(DB_KEYS.PROFILE);
        if (!data) {
            this.saveProfile(DEFAULT_PROFILE);
            return DEFAULT_PROFILE;
        }
        return JSON.parse(data);
    },

    saveProfile(profile) {
        localStorage.setItem(DB_KEYS.PROFILE, JSON.stringify(profile));
    },

    // Onboarding Durumu
    isOnboardingCompleted() {
        return localStorage.getItem(DB_KEYS.ONBOARDING_COMPLETED) === 'true';
    },

    setOnboardingCompleted(completed) {
        localStorage.setItem(DB_KEYS.ONBOARDING_COMPLETED, completed ? 'true' : 'false');
    },

    // Aktivite İşlemleri
    getActivities() {
        const data = localStorage.getItem(DB_KEYS.ACTIVITIES);
        if (!data) {
            this.saveActivities(MOCK_ACTIVITIES);
            return MOCK_ACTIVITIES;
        }
        return JSON.parse(data);
    },

    saveActivities(activities) {
        localStorage.setItem(DB_KEYS.ACTIVITIES, JSON.stringify(activities));
    },

    addActivity(activity) {
        const activities = this.getActivities();
        activities.unshift({
            id: Date.now().toString(),
            ...activity
        });
        this.saveActivities(activities);
    },

    deleteActivity(id) {
        const activities = this.getActivities();
        const filtered = activities.filter(act => act.id !== id);
        this.saveActivities(filtered);
    },

    // Sosyal Gönderi İşlemleri
    getPosts() {
        const data = localStorage.getItem(DB_KEYS.POSTS);
        if (!data) {
            this.savePosts(MOCK_POSTS);
            return MOCK_POSTS;
        }
        return JSON.parse(data);
    },

    savePosts(posts) {
        localStorage.setItem(DB_KEYS.POSTS, JSON.stringify(posts));
    },

    addPost(post) {
        const posts = this.getPosts();
        posts.unshift({
            id: Date.now().toString(),
            likes: 0,
            likedByMe: false,
            ...post
        });
        this.savePosts(posts);
    },

    toggleLikePost(id) {
        const posts = this.getPosts();
        const post = posts.find(p => p.id === id);
        if (post) {
            if (post.likedByMe) {
                post.likes--;
                post.likedByMe = false;
            } else {
                post.likes++;
                post.likedByMe = true;
            }
            this.savePosts(posts);
        }
    },

    getAllUsers() {
        const users = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('kosutakip_cloud_profile_')) {
                const email = key.replace('kosutakip_cloud_profile_', '');
                try {
                    const profile = JSON.parse(localStorage.getItem(key));
                    const actKey = 'kosutakip_cloud_activities_' + email;
                    const actData = localStorage.getItem(actKey);
                    const actCount = actData ? JSON.parse(actData).length : 0;
                    
                    users.push({
                        displayName: profile.displayName || 'İsimsiz Kullanıcı',
                        email: email,
                        premium: !!profile.premium,
                        activitiesCount: actCount
                    });
                } catch (e) {
                    console.error("Profil okuma hatası:", e);
                }
            }
        }
        
        // Aktif kullanıcıyı da ekle (eğer henüz bulut profili oluşmamışsa)
        const activeProfile = this.getProfile();
        if (activeProfile.isLoggedIn && activeProfile.email) {
            const exists = users.some(u => u.email === activeProfile.email);
            if (!exists) {
                const actCount = this.getActivities().length;
                users.push({
                    displayName: activeProfile.displayName || 'İsimsiz Kullanıcı',
                    email: activeProfile.email,
                    premium: !!activeProfile.premium,
                    activitiesCount: actCount
                });
            }
        }
        
        return users;
    },

    updateUserPremium(email, premiumStatus) {
        // 1. Bulut profilini güncelle
        const key = 'kosutakip_cloud_profile_' + email;
        const profileData = localStorage.getItem(key);
        if (profileData) {
            const profile = JSON.parse(profileData);
            profile.premium = premiumStatus;
            localStorage.setItem(key, JSON.stringify(profile));
        }
        
        // 2. Eğer aktif kullanıcı ise yerel profili de güncelle
        const activeProfile = this.getProfile();
        if (activeProfile.isLoggedIn && activeProfile.email === email) {
            activeProfile.premium = premiumStatus;
            this.saveProfile(activeProfile);
        }
    },

    clearAll() {
        localStorage.removeItem(DB_KEYS.PROFILE);
        localStorage.removeItem(DB_KEYS.ACTIVITIES);
        localStorage.removeItem(DB_KEYS.ONBOARDING_COMPLETED);
        localStorage.removeItem(DB_KEYS.POSTS);
    }
};
