import { DB } from './db.js';

// Global Uygulama Durumu
const state = {
    currentScreen: 'basla', // basla, gunluk, yayin, istatistikler, agirlik
    onboardingStep: 1,
    profile: null,
    activities: [],

    // Filtreleme ve Navigasyon
    selectedDate: new Date(2026, 5, 10), // 10 Haziran 2026 (Haziran = 5)
    diaryFilter: 'ay', // hafta, ay, yil, toplam
    statsFilter: 'ay', // hafta, ay, yil, toplam
    isGuestMode: false, // Ziyaretçi modu
    
    // Koşu Takip Değişkenleri
    isRunning: false,
    isPaused: false,
    duration: 0, // saniye
    distance: 0.0, // km
    calories: 0, // kcal
    routePoints: [],
    runTimer: null,
    watchId: null,
    simulationMode: true, // Varsayılan olarak simülasyon modu açık (testler için)
    lastSpeechDistance: 0.0,

    // Harita Nesneleri
    map: null,
    pathLine: null,
    runnerMarker: null,

    // Grafik Nesneleri
    statsChart: null,
    weightChart: null
};

// Google Client ID (Tüm cihazlarda çalışması için Google Cloud Console'dan aldığınız kodu buraya yapıştırın)
const DEFAULT_GOOGLE_CLIENT_ID = '991487984220-2d20pbsu2jhjcaq1oq1g421vm1jf5ark.apps.googleusercontent.com';

// Sayfa yüklendiğinde çalışacak ana kod
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    // Verileri yükle
    state.profile = DB.getProfile();
    state.activities = DB.getActivities();

    // Mobil/PC Cihaz ve Çerçeve Tespiti
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
    const phoneContainer = document.querySelector('.phone-container');
    if (phoneContainer) {
        if (isMobileDevice) {
            phoneContainer.classList.add('fullscreen-mode');
        } else {
            phoneContainer.classList.remove('fullscreen-mode');
        }
    }
    
    // GPS Simülasyon modunu cihaz tipine göre otomatik ayarla
    // Mobil cihazda gerçek GPS aktif olsun (Simülasyon Kapalı), PC'de Simülasyon Açık olsun
    state.simulationMode = !isMobileDevice;
    const simToggle = document.getElementById('sim-mode-toggle');
    if (simToggle) {
        simToggle.checked = state.simulationMode;
    }

    // Olay Dinleyicileri (Event Listeners) tanımla
    setupEventListeners();

    // Giriş Durumu ve Yönlendirme Kontrolü
    if (!state.profile.isLoggedIn && !state.isGuestMode) {
        showStartupLogin();
    } else {
        hideStartupLogin();
        // Onboarding kontrolü - Sadece üye ise ve tamamlanmadıysa göster
        if (!DB.isOnboardingCompleted() && state.profile.isLoggedIn) {
            showOnboarding();
        } else {
            hideOnboarding();
            switchScreen('basla');
        }
    }
    
    // Alt Menüyü Güncelle
    updateBottomNavActive();

    // Profil ve Premium Arayüzünü Güncelle
    updateProfileUI();

    // Sosyal Akışı Yükle
    renderSocialFeed();
}

function showStartupLogin() {
    document.getElementById('startup-login-overlay').classList.remove('d-none');
    document.getElementById('startup-login-overlay').classList.add('active');
    document.getElementById('app-main-layout').classList.add('d-none');
    document.getElementById('onboarding-overlay').classList.add('d-none');
}

function hideStartupLogin() {
    document.getElementById('startup-login-overlay').classList.add('d-none');
    document.getElementById('startup-login-overlay').classList.remove('active');
}

function openGoogleLoginModal() {
    if (!window.google) {
        alert("Google Giriş Kütüphanesi henüz yüklenemedi. Lütfen internet bağlantınızı kontrol edip tekrar deneyin.");
        return;
    }

    const googleClientId = localStorage.getItem('kosutakip_google_client_id') || DEFAULT_GOOGLE_CLIENT_ID;
    
    if (googleClientId) {
        const modal = document.getElementById('google-login-modal');
        if (modal) modal.classList.add('active');
        triggerRealGoogleSignIn(googleClientId);
    } else {
        alert("Google Giriş Sistemi yapılandırılmamış. Lütfen app.js dosyasının 39. satırındaki 'DEFAULT_GOOGLE_CLIENT_ID' değişkenine Google Client ID'nizi ekleyin.");
    }
}

function triggerRealGoogleSignIn(clientId) {
    try {
        const tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: clientId,
            scope: 'openid profile email',
            callback: (tokenResponse) => {
                if (tokenResponse && tokenResponse.access_token) {
                    const modal = document.getElementById('google-login-modal');
                    const loadingView = document.getElementById('google-view-loading');
                    const setupView = document.getElementById('google-view-setup');
                    
                    if (modal) modal.classList.add('active');
                    if (setupView) setupView.classList.add('d-none');
                    if (loadingView) {
                        loadingView.classList.remove('d-none');
                        const loadingText = document.getElementById('google-loading-text');
                        if (loadingText) loadingText.textContent = "Google hesabına bağlanılıyor...";
                    }
                    
                    // Google API'den kullanıcı bilgilerini çek
                    fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                        headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
                    })
                    .then(res => res.json())
                    .then(userInfo => {
                        const loadingText = document.getElementById('google-loading-text');
                        if (loadingText) loadingText.textContent = "Bulut verileri geri yükleniyor...";
                        
                        setTimeout(() => {
                            processGoogleSignIn(userInfo.name, userInfo.email, userInfo.picture);
                        }, 1000);
                    })
                    .catch(err => {
                        console.error("Kullanıcı bilgisi çekme hatası:", err);
                        if (modal) modal.classList.remove('active');
                        alert("Google kullanıcı bilgileri alınamadı.");
                    });
                }
            },
            error_callback: (err) => {
                console.error("Google Auth Hatası:", err);
                const modal = document.getElementById('google-login-modal');
                if (modal) modal.classList.remove('active');
                alert("Google girişi esnasında bir hata oluştu.");
            }
        });
        tokenClient.requestAccessToken({ prompt: 'select_account' });
    } catch (e) {
        console.error("Google SDK başlatma hatası:", e);
        const modal = document.getElementById('google-login-modal');
        if (modal) modal.classList.remove('active');
        alert("Google Giriş Sistemi başlatılamadı. Lütfen Client ID'nizin doğruluğunu kontrol edin.");
    }
}

// Google Giriş İşleme
function processGoogleSignIn(displayName, email, photoUrl = '') {
    const modal = document.getElementById('google-login-modal');
    const loadingView = document.getElementById('google-view-loading');
    const setupView = document.getElementById('google-view-setup');
    
    if (setupView) setupView.classList.add('d-none');
    if (loadingView) loadingView.classList.remove('d-none');
    
    const loadingText = document.getElementById('google-loading-text');
    if (loadingText) loadingText.textContent = "Google hesabına bağlanılıyor...";
    
    setTimeout(() => {
        if (loadingText) loadingText.textContent = "Bulut verileri geri yükleniyor...";
        
        setTimeout(() => {
            state.profile.isLoggedIn = true;
            state.profile.displayName = displayName;
            state.profile.email = email;
            state.profile.photoUrl = photoUrl;
            DB.saveProfile(state.profile);
            
            if (modal) modal.classList.remove('active');
            
            // Buluttan tüm verileri (koşu, kilo, profil) geri yükle veya ilk yedeği oluştur
            const count = restoreAllFromCloud(email);
            
            // Uygulamayı yeniden başlat/güncelle
            initApp();
            
            if (count > 0) {
                alert(`Hoş geldiniz, ${displayName}! Verileriniz buluttan geri yüklendi (${count} aktivite).`);
            } else {
                alert(`Hoş geldiniz, ${displayName}! Google ile oturum başarıyla açıldı.`);
            }
        }, 800);
    }, 800);
}

// Bulut Yedekleme Entegrasyonu (LocalStorage E-posta Eşleşmeli)
function syncAllToCloud() {
    if (state.profile.isLoggedIn && state.profile.email) {
        showCloudSyncIndicator();
        
        const email = state.profile.email;
        
        // 1. Aktiviteleri Yedekle
        const activities = DB.getActivities();
        localStorage.setItem('kosutakip_cloud_activities_' + email, JSON.stringify(activities));
        
        // 2. Profil Bilgilerini Yedekle
        const profileBackup = { ...state.profile };
        localStorage.setItem('kosutakip_cloud_profile_' + email, JSON.stringify(profileBackup));
        
        // 3. Ağırlık Geçmişini Yedekle
        const weightHistory = JSON.parse(localStorage.getItem('kosutakip_weight_history') || '[]');
        localStorage.setItem('kosutakip_cloud_weight_' + email, JSON.stringify(weightHistory));
        
        setTimeout(() => {
            hideCloudSyncIndicator();
        }, 800);
    }
}

function restoreAllFromCloud(email) {
    let count = 0;
    
    // 1. Aktiviteleri Geri Yükle
    const cloudActivities = localStorage.getItem('kosutakip_cloud_activities_' + email) || localStorage.getItem('kosutakip_cloud_' + email); // Eski anahtar desteği
    if (cloudActivities) {
        const backup = JSON.parse(cloudActivities);
        DB.saveActivities(backup);
        state.activities = backup;
        count = backup.length;
    } else {
        // Bulutta veri yoksa yerel veriyi buluta gönder
        const localAct = DB.getActivities();
        localStorage.setItem('kosutakip_cloud_activities_' + email, JSON.stringify(localAct));
        count = localAct.length;
    }
    
    // 2. Profil Ayarlarını Geri Yükle
    const cloudProfile = localStorage.getItem('kosutakip_cloud_profile_' + email);
    if (cloudProfile) {
        const profileBackup = JSON.parse(cloudProfile);
        state.profile = {
            ...state.profile,
            ...profileBackup,
            isLoggedIn: true,
            email: email
        };
        DB.saveProfile(state.profile);
    } else {
        // Bulutta profil yoksa yereli gönder
        localStorage.setItem('kosutakip_cloud_profile_' + email, JSON.stringify(state.profile));
    }
    
    // 3. Kilo Geçmişini Geri Yükle
    const cloudWeight = localStorage.getItem('kosutakip_cloud_weight_' + email);
    if (cloudWeight) {
        const weightBackup = JSON.parse(cloudWeight);
        localStorage.setItem('kosutakip_weight_history', JSON.stringify(weightBackup));
    } else {
        const localWeight = JSON.parse(localStorage.getItem('kosutakip_weight_history') || '[]');
        localStorage.setItem('kosutakip_cloud_weight_' + email, JSON.stringify(localWeight));
    }
    
    return count;
}

function showCloudSyncIndicator() {
    const toast = document.getElementById('cloud-sync-toast');
    if (toast) {
        const text = document.getElementById('cloud-sync-toast-text');
        text.textContent = "Bulut yedeği senkronize ediliyor...";
        toast.classList.remove('d-none');
        toast.style.opacity = '1';
    }
}

function hideCloudSyncIndicator() {
    const toast = document.getElementById('cloud-sync-toast');
    if (toast) {
        const text = document.getElementById('cloud-sync-toast-text');
        text.textContent = "Bulut yedeği güncellendi ✓";
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => {
                toast.classList.add('d-none');
            }, 300);
        }, 1200);
    }
}

// --- EKRAN YÖNETİMİ & ROUTING ---
function switchScreen(screenId) {
    state.currentScreen = screenId;
    
    // Tüm ekranları gizle, hedef ekranı göster
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    const targetScreen = document.getElementById(`${screenId}-screen`);
    if (targetScreen) {
        targetScreen.classList.add('active');
    }

    // Başlık alanını güncelle
    updateHeaderTitle(screenId);

    // Alt menü durumunu güncelle
    updateBottomNavActive();

    // Ekrana özel ilklendirmeler
    if (screenId === 'basla') {
        initMap();
    } else if (screenId === 'gunluk') {
        renderDiary();
    } else if (screenId === 'istatistikler') {
        renderStatistics();
    } else if (screenId === 'agirlik') {
        renderWeightTab();
    } else if (screenId === 'admin') {
        renderAdminPanel();
    }
}

function updateHeaderTitle(screenId) {
    const titles = {
        'basla': 'Koşu Takip',
        'gunluk': 'Günlük',
        'yayin': 'Yayın Feed',
        'istatistikler': 'İstatistikler',
        'agirlik': 'Ağırlık Takibi',
        'admin': 'Yönetici Paneli'
    };
    const titleEl = document.querySelector('.header-title');
    if (titleEl) {
        titleEl.textContent = titles[screenId] || 'Koşu Takip';
    }
}

function updateBottomNavActive() {
    document.querySelectorAll('.nav-item').forEach(item => {
        const tab = item.getAttribute('data-tab');
        if (tab === state.currentScreen) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// --- ONBOARDING YÖNETİMİ ---
function showOnboarding() {
    document.getElementById('onboarding-overlay').classList.remove('d-none');
    document.getElementById('app-main-layout').classList.add('d-none');
    
    // Hedef kartı seçimi
    const goalCards = document.querySelectorAll('.goal-card');
    goalCards.forEach(card => {
        card.addEventListener('click', () => {
            goalCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            state.profile.goal = card.getAttribute('data-goal');
        });
    });

    document.getElementById('onboarding-next-btn').addEventListener('click', () => {
        // Profili kaydet ve onboarding'i tamamla
        DB.saveProfile(state.profile);
        DB.setOnboardingCompleted(true);
        hideOnboarding();
        switchScreen('basla');
    });
}

function hideOnboarding() {
    document.getElementById('onboarding-overlay').classList.add('d-none');
    document.getElementById('app-main-layout').classList.remove('d-none');
}

// --- HARİTA YÖNETİMİ (LEAFLET) ---
function initMap() {
    // Eğer harita zaten kurulmuşsa sadece boyutunu güncelle
    if (state.map) {
        setTimeout(() => {
            state.map.invalidateSize();
        }, 100);
        return;
    }

    // Harita alanının yüklendiğinden emin olmak için kısa bir bekleme
    setTimeout(() => {
        // Varsayılan koordinatlar: İstanbul Sultanahmet
        const defaultCenter = [41.0082, 28.9784];
        
        state.map = L.map('map-container', {
            zoomControl: false,
            attributionControl: false
        }).setView(defaultCenter, 16);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            maxZoom: 19
        }).addTo(state.map);

        // Yol çizim çizgisi
        state.pathLine = L.polyline([], {
            color: '#5c3d92',
            weight: 6,
            opacity: 0.8,
            lineJoin: 'round'
        }).addTo(state.map);

        // Koşucu imleci (Custom pulsing dot style using Leaflet DivIcon)
        const runnerIcon = L.divIcon({
            className: 'runner-gps-dot',
            html: '<div style="width: 16px; height: 16px; background-color: #5c3d92; border: 3px solid white; border-radius: 50%; box-shadow: 0 0 10px rgba(92,61,146,0.6); position: relative;"><div style="position: absolute; top: -3px; left: -3px; width: 16px; height: 16px; border-radius: 50%; border: 3px solid #5c3d92; animation: pulse 1.5s infinite; opacity: 0;"></div></div>',
            iconSize: [16, 16],
            iconAnchor: [8, 8]
        });

        state.runnerMarker = L.marker(defaultCenter, { icon: runnerIcon }).addTo(state.map);

        // CSS animasyonunu harita üstüne ekleyelim
        const style = document.createElement('style');
        style.innerHTML = `
            @keyframes pulse {
                0% { transform: scale(1); opacity: 0.8; }
                100% { transform: scale(2.2); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
        
        // Boyutu düzelt
        state.map.invalidateSize();
    }, 200);
}

// --- KOŞU AKTİVİTE TAKİP MOTORU ---
function startTracking() {
    if (state.isRunning) return;

    state.isRunning = true;
    state.isPaused = false;
    state.duration = 0;
    state.distance = 0.0;
    state.calories = 0;
    state.routePoints = [];
    state.lastSpeechDistance = 0.0;

    // Arayüzü güncelle
    updateTrackingUI();
    document.getElementById('btn-start').classList.add('d-none');
    document.getElementById('btn-pause').classList.remove('d-none');
    document.getElementById('btn-stop').classList.remove('d-none');

    // Harita çizgisini sıfırla
    if (state.pathLine) {
        state.pathLine.setLatLngs([]);
    }

    // Sesli başlangıç bildirimi
    speakText("Koşu başlatıldı. İyi antrenmanlar!");

    // Timer başlat
    state.runTimer = setInterval(() => {
        if (!state.isPaused) {
            state.duration++;
            calculateStats();
            updateTrackingUI();

            if (state.simulationMode) {
                simulateGPSMove();
            }
        }
    }, 1000);

    // Gerçek GPS izlemeyi başlat
    if (!state.simulationMode) {
        if (navigator.geolocation) {
            state.watchId = navigator.geolocation.watchPosition(
                handleGPSUpdate,
                (err) => console.warn('GPS Hatası: ', err),
                { enableHighAccuracy: true, distanceFilter: 2 }
            );
        } else {
            alert("Cihazınızda GPS desteği bulunamadı. Simülasyon moduna geçiliyor.");
            document.getElementById('sim-mode-toggle').checked = true;
            state.simulationMode = true;
        }
    }
}

function pauseTracking() {
    if (!state.isRunning) return;

    if (state.isPaused) {
        // Devam Et
        state.isPaused = false;
        speakText("Koşu devam ediyor.");
        document.getElementById('btn-pause').innerHTML = '<i class="fa-solid fa-pause"></i>';
        document.getElementById('btn-pause').style.backgroundColor = 'var(--surface-color)';
        document.getElementById('btn-pause').style.color = 'var(--primary-color)';
    } else {
        // Duraklat
        state.isPaused = true;
        speakText("Koşu duraklatıldı.");
        document.getElementById('btn-pause').innerHTML = '<i class="fa-solid fa-play"></i>';
        document.getElementById('btn-pause').style.backgroundColor = '#4caf50';
        document.getElementById('btn-pause').style.color = 'white';
    }
}

function stopTracking() {
    if (!state.isRunning) return;

    const confirmStop = () => {
        // Timer ve GPS kapat
        clearInterval(state.runTimer);
        if (state.watchId) {
            navigator.geolocation.clearWatch(state.watchId);
        }

        // Koşuyu kaydet
        if (state.profile.isLoggedIn) {
            if (state.distance > 0.05) { // En az 50 metre koşulmuşsa kaydet
                const newRun = {
                    type: 'Koşu',
                    date: new Date().toISOString(),
                    distance: parseFloat(state.distance.toFixed(2)),
                    duration: state.duration,
                    calories: Math.round(state.calories),
                    route: state.routePoints
                };
                DB.addActivity(newRun);
                syncAllToCloud();
                speakText(`Koşu tamamlandı. Tebrikler! ${newRun.distance} kilometre koştunuz.`);
                alert(`Koşu kaydedildi!\nMesafe: ${newRun.distance} km\nSüre: ${formatDuration(newRun.duration)}`);
            } else {
                speakText("Koşu kaydedilmeyecek kadar kısa sürdü.");
                alert("Mesafe çok kısa olduğu için koşu kaydedilmedi.");
            }
        } else {
            // Ziyaretçi Modu
            speakText("Koşu tamamlandı.");
            alert(`Koşu Bitti!\nMesafe: ${state.distance.toFixed(2)} km\nSüre: ${formatDuration(state.duration)}\n\nNot: Üyeliğiniz olmadığı için bu antrenman kaydedilmedi.`);
        }

        // Değişkenleri sıfırla
        state.isRunning = false;
        state.isPaused = false;
        state.duration = 0;
        state.distance = 0.0;
        state.calories = 0;
        state.routePoints = [];

        // UI sıfırla
        updateTrackingUI();
        document.getElementById('btn-start').classList.remove('d-none');
        document.getElementById('btn-pause').classList.add('d-none');
        document.getElementById('btn-stop').classList.add('d-none');
        document.getElementById('btn-pause').innerHTML = '<i class="fa-solid fa-pause"></i>';
        document.getElementById('btn-pause').style.backgroundColor = 'var(--surface-color)';
        document.getElementById('btn-pause').style.color = 'var(--primary-color)';

        if (state.profile.isLoggedIn) {
            switchScreen('gunluk');
        } else {
            switchScreen('basla');
        }
    };

    if (state.profile.endActivityConfirm) {
        if (confirm("Koşuyu bitirmek ve kaydetmek istiyor musunuz?")) {
            confirmStop();
        }
    } else {
        confirmStop();
    }
}

// GPS Güncellemesini Al (Gerçek GPS)
function handleGPSUpdate(position) {
    if (state.isPaused) return;

    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    const newPoint = { lat, lng };

    if (state.routePoints.length > 0) {
        const lastPoint = state.routePoints[state.routePoints.length - 1];
        const distChange = calculateDistanceBetween(lastPoint.lat, lastPoint.lng, lat, lng);
        
        // Çok küçük titreşimleri veya hatalı sıçramaları filtrele (Hız 40 km/h'ten büyük olamaz gibi)
        if (distChange > 0.001 && distChange < 0.1) { 
            state.distance += distChange;
            state.routePoints.push(newPoint);
            updateMapRoute(newPoint);
        }
    } else {
        state.routePoints.push(newPoint);
        updateMapRoute(newPoint);
    }
}

// Simülasyon GPS Hareketi (Masaüstü/Tarayıcı Testleri İçin)
function simulateGPSMove() {
    let lastPoint = { lat: 41.0082, lng: 28.9784 };
    
    if (state.routePoints.length > 0) {
        lastPoint = state.routePoints[state.routePoints.length - 1];
    }

    // Saniyede ~2-4 metre hareket (Koşucu hızı ~8-14 km/h)
    // 1 derece enlem/boylam yaklaşık 111 km'dir.
    // 3 metre yaklaşık 0.000027 dereceye eşittir.
    const latChange = (Math.random() - 0.3) * 0.00003; // Genellikle kuzeydoğuya doğru hareket
    const lngChange = (Math.random() - 0.2) * 0.00003;

    const newLat = lastPoint.lat + latChange;
    const newLng = lastPoint.lng + lngChange;
    const newPoint = { lat: newLat, lng: newLng };

    state.routePoints.push(newPoint);

    if (state.routePoints.length > 1) {
        const distChange = calculateDistanceBetween(lastPoint.lat, lastPoint.lng, newLat, newLng);
        state.distance += distChange;
    }

    updateMapRoute(newPoint);
}

function updateMapRoute(point) {
    if (state.pathLine && state.map) {
        state.pathLine.addLatLng([point.lat, point.lng]);
        state.runnerMarker.setLatLng([point.lat, point.lng]);
        state.map.panTo([point.lat, point.lng]);
    }
}

// İki GPS Koordinatı Arasındaki Mesafeyi Hesaplama (Haversine Formülü - km)
function calculateDistanceBetween(lat1, lon1, lat2, lon2) {
    const R = 6371; // Dünya yarıçapı (km)
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// Hız, Tempo ve Kalori Hesabı
function calculateStats() {
    if (state.distance === 0) {
        state.pace = 0;
        return;
    }

    // Tempo: Dakika/Km
    const durationMins = state.duration / 60;
    state.pace = durationMins / state.distance; // Dakika cinsinden

    // Kalori Hesabı (Basit formül: Kilo * Mesafe * 1.036)
    const weight = state.profile.weight || 70;
    state.calories = weight * state.distance * 1.036;

    // Sesli Geri Bildirim Tetikleyicisi (Örn: Her 500 metrede bir)
    if (state.profile.audioFeedback) {
        const interval = state.profile.audioInterval / 1000; // Metreden km'ye
        if (state.distance - state.lastSpeechDistance >= interval) {
            state.lastSpeechDistance = state.distance;
            
            const roundedDist = state.distance.toFixed(1);
            const paceMins = Math.floor(state.pace);
            const paceSecs = Math.round((state.pace - paceMins) * 60);
            
            speakText(`Mesafe: ${roundedDist} kilometre. Hızınız: kilometre başına ${paceMins} dakika ${paceSecs} saniye.`);
        }
    }
}

function updateTrackingUI() {
    document.getElementById('tracker-duration').textContent = formatDuration(state.duration);
    document.getElementById('tracker-distance').textContent = state.distance.toFixed(2);
    document.getElementById('tracker-calories').textContent = Math.round(state.calories);
    
    // Pace UI format (MM:SS)
    if (state.distance > 0.01 && state.pace) {
        const mins = Math.floor(state.pace);
        const secs = Math.floor((state.pace - mins) * 60);
        document.getElementById('tracker-pace').textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
    } else {
        document.getElementById('tracker-pace').textContent = '-:-';
    }
}

// Ses Sentezleme (Web Speech API)
function speakText(text) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'tr-TR';
        window.speechSynthesis.speak(utterance);
    }
}

// --- TARİH VE FİLTRE YARDIMCILARI ---
function activityMatchesFilter(actDateStr, filterType, refDate) {
    const actDate = new Date(actDateStr);
    const refYear = refDate.getFullYear();
    const refMonth = refDate.getMonth();
    
    if (filterType === 'ay') {
        return actDate.getFullYear() === refYear && actDate.getMonth() === refMonth;
    }
    if (filterType === 'yil') {
        return actDate.getFullYear() === refYear;
    }
    if (filterType === 'toplam') {
        return true;
    }
    if (filterType === 'hafta') {
        // Seçili tarihin haftasını hesapla (Pazartesi - Pazar)
        const day = refDate.getDay();
        const diff = refDate.getDate() - day + (day === 0 ? -6 : 1); // Pazartesi günü
        const startOfWeek = new Date(refDate);
        startOfWeek.setDate(diff);
        startOfWeek.setHours(0, 0, 0, 0);
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
        
        return actDate >= startOfWeek && actDate <= endOfWeek;
    }
    return false;
}

function updateNavigatorText(screenId, filterType, refDate) {
    const screenEl = document.getElementById(`${screenId}-screen`);
    if (!screenEl) return;
    
    const navTextEl = screenEl.querySelector('.current-month-text');
    if (!navTextEl) return;
    
    let text = '';
    if (filterType === 'ay') {
        text = refDate.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });
    } else if (filterType === 'yil') {
        text = refDate.toLocaleDateString('tr-TR', { year: 'numeric' });
    } else if (filterType === 'toplam') {
        text = "Tüm Zamanlar";
    } else if (filterType === 'hafta') {
        const day = refDate.getDay();
        const diff = refDate.getDate() - day + (day === 0 ? -6 : 1);
        const startOfWeek = new Date(refDate);
        startOfWeek.setDate(diff);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        
        const startStr = startOfWeek.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' });
        const endStr = endOfWeek.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' });
        text = `${startStr} - ${endStr}`;
    }
    
    navTextEl.textContent = text;
}

function adjustDate(direction, filter) {
    const d = new Date(state.selectedDate);
    if (filter === 'ay') {
        d.setMonth(d.getMonth() + direction);
    } else if (filter === 'yil') {
        d.setFullYear(d.getFullYear() + direction);
    } else if (filter === 'hafta') {
        d.setDate(d.getDate() + (direction * 7));
    }
    state.selectedDate = d;
}

// --- GÜNLÜK EKRANI YÖNETİMİ ---
function renderDiary() {
    state.activities = DB.getActivities();
    
    const filterType = state.diaryFilter;
    const refDate = state.selectedDate;

    // Başlık navigasyon metnini güncelle
    updateNavigatorText('gunluk', filterType, refDate);

    let totalDist = 0;
    let totalDur = 0;
    let totalCal = 0;
    let totalAct = 0;

    const listContainer = document.getElementById('activity-list');
    listContainer.innerHTML = '';

    state.activities.forEach(act => {
        if (activityMatchesFilter(act.date, filterType, refDate)) {
            totalDist += act.distance;
            totalDur += act.duration;
            totalCal += act.calories;
            totalAct++;

            // Kart oluştur
            const card = document.createElement('div');
            card.className = 'activity-card';
            card.innerHTML = `
                <div class="activity-card-left">
                    <div class="activity-icon-container">
                        <i class="fa-solid fa-person-running"></i>
                    </div>
                    <div class="activity-details">
                        <span class="activity-name">${act.type}</span>
                        <span class="activity-time">${formatDate(act.date)} | ${formatTime(act.date)}</span>
                    </div>
                </div>
                <div class="activity-card-right">
                    <span class="activity-dist">${act.distance.toFixed(2)} km</span>
                    <button class="activity-delete-btn" data-id="${act.id}">
                        <i class="fa-regular fa-trash-can"></i>
                    </button>
                </div>
            `;

            // Silme olayı
            card.querySelector('.activity-delete-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm("Bu aktiviteyi silmek istediğinize emin misiniz?")) {
                    DB.deleteActivity(act.id);
                    syncAllToCloud();
                    renderDiary();
                }
            });

            // Tıklayınca detay/harita gösterme (Eğer kayıtlı rotası varsa)
            card.addEventListener('click', () => {
                if (act.route && act.route.length > 0) {
                    showRouteModal(act);
                }
            });

            listContainer.appendChild(card);
        }
    });

    // Toplamları UI'a yazdır
    document.getElementById('diary-total-duration').textContent = formatDuration(totalDur);
    document.getElementById('diary-total-distance').textContent = `${totalDist.toFixed(1)} km`;
    document.getElementById('diary-total-calories').textContent = `${totalCal} kcal`;
    document.getElementById('diary-total-activities').textContent = totalAct;
}

function showRouteModal(activity) {
    const modal = document.getElementById('route-modal');
    modal.classList.add('active');

    // Haritayı ilklendir
    setTimeout(() => {
        const mapDiv = document.getElementById('modal-map-container');
        mapDiv.innerHTML = ''; // Temizle
        
        const modalMap = L.map(mapDiv, {
            zoomControl: true,
            attributionControl: false
        });

        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            maxZoom: 19
        }).addTo(modalMap);

        const latlngs = activity.route.map(pt => [pt.lat, pt.lng]);
        
        L.polyline(latlngs, {
            color: '#5c3d92',
            weight: 6,
            opacity: 0.9
        }).addTo(modalMap);

        // Başlangıç ve bitiş noktalarına ikon koy
        L.marker(latlngs[0]).addTo(modalMap).bindPopup('Başlangıç');
        L.marker(latlngs[latlngs.length - 1]).addTo(modalMap).bindPopup('Bitiş');

        // Haritayı rotaya sığdır
        const bounds = L.latLngBounds(latlngs);
        modalMap.fitBounds(bounds, { padding: [20, 20] });
    }, 200);
}

// --- İSTATİSTİKLER EKRANI YÖNETİMİ ---
function renderStatistics() {
    state.activities = DB.getActivities();
    
    const filterType = state.statsFilter;
    const refDate = state.selectedDate;

    // Başlık navigasyon metnini güncelle
    updateNavigatorText('istatistikler', filterType, refDate);

    let labels = [];
    let chartData = [];
    let barThickness = 6;

    if (filterType === 'ay') {
        const year = refDate.getFullYear();
        const month = refDate.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        labels = Array.from({length: daysInMonth}, (_, i) => i + 1);
        chartData = Array(daysInMonth).fill(0);
        
        state.activities.forEach(act => {
            const d = new Date(act.date);
            if (d.getFullYear() === year && d.getMonth() === month) {
                const day = d.getDate();
                chartData[day - 1] += act.distance;
            }
        });
        barThickness = 6;
    } else if (filterType === 'hafta') {
        labels = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
        chartData = Array(7).fill(0);
        
        // Haftanın pazartesi gününü bul
        const day = refDate.getDay();
        const diff = refDate.getDate() - day + (day === 0 ? -6 : 1);
        const startOfWeek = new Date(refDate);
        startOfWeek.setDate(diff);
        startOfWeek.setHours(0, 0, 0, 0);
        
        state.activities.forEach(act => {
            const d = new Date(act.date);
            const diffTime = d.getTime() - startOfWeek.getTime();
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays >= 0 && diffDays < 7) {
                chartData[diffDays] += act.distance;
            }
        });
        barThickness = 20;
    } else if (filterType === 'yil') {
        labels = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
        chartData = Array(12).fill(0);
        const year = refDate.getFullYear();
        
        state.activities.forEach(act => {
            const d = new Date(act.date);
            if (d.getFullYear() === year) {
                const month = d.getMonth();
                chartData[month] += act.distance;
            }
        });
        barThickness = 14;
    } else if (filterType === 'toplam') {
        const year = refDate.getFullYear();
        labels = [year - 3, year - 2, year - 1, year];
        chartData = Array(4).fill(0);
        
        state.activities.forEach(act => {
            const d = new Date(act.date);
            const actYear = d.getFullYear();
            const idx = labels.indexOf(actYear);
            if (idx !== -1) {
                chartData[idx] += act.distance;
            }
        });
        barThickness = 30;
    }

    // Chart.js yükle ve çiz
    const ctx = document.getElementById('statsChartCanvas').getContext('2d');
    
    if (state.statsChart) {
        state.statsChart.destroy();
    }

    state.statsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Mesafe (km)',
                data: chartData,
                backgroundColor: '#5c3d92',
                borderRadius: 4,
                borderSkipped: false,
                barThickness: barThickness
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(0,0,0,0.03)' },
                    ticks: { color: '#7e7e9a', font: { family: 'Outfit' } }
                },
                x: {
                    grid: { display: false },
                    ticks: {
                        color: '#7e7e9a',
                        font: { family: 'Outfit', size: 9 },
                        callback: function(val, index) {
                            if (filterType === 'ay') {
                                const label = this.getLabelForValue(val);
                                const allowed = ['1', '5', '9', '13', '17', '21', '25', '29'];
                                return allowed.includes(label) ? label : '';
                            }
                            return this.getLabelForValue(val);
                        }
                    }
                }
            }
        }
    });

    // Toplamları Hesapla
    let totalDist = 0;
    let totalDur = 0;
    let totalCal = 0;
    let totalAct = 0;

    state.activities.forEach(act => {
        if (activityMatchesFilter(act.date, filterType, refDate)) {
            totalDist += act.distance;
            totalDur += act.duration;
            totalCal += act.calories;
            totalAct++;
        }
    });

    document.getElementById('stat-total-activities').textContent = totalAct;
    document.getElementById('stat-active-mins').textContent = Math.round(totalDur / 60);
    document.getElementById('stat-total-distance').textContent = `${totalDist.toFixed(1)} km`;
    document.getElementById('stat-total-calories').textContent = `${totalCal} kcal`;
    updateProfileUI();
}

// --- AĞIRLIK EKRANI YÖNETİMİ ---
function renderWeightTab() {
    const profile = DB.getProfile();
    document.getElementById('weight-current-display').textContent = `${profile.weight} kg`;
    
    // Ağırlık geçmişini çiz
    const weightHistory = JSON.parse(localStorage.getItem('kosutakip_weight_history') || '[]');
    
    if (weightHistory.length === 0) {
        // Başlangıç tohum verisi
        const initialHistory = [
            { date: '2026-05-10', weight: profile.weight + 2 },
            { date: '2026-05-20', weight: profile.weight + 1.5 },
            { date: '2026-06-01', weight: profile.weight + 0.5 },
            { date: '2026-06-10', weight: profile.weight }
        ];
        localStorage.setItem('kosutakip_weight_history', JSON.stringify(initialHistory));
        renderWeightChart(initialHistory);
    } else {
        renderWeightChart(weightHistory);
    }
}

function renderWeightChart(history) {
    const ctx = document.getElementById('weightChartCanvas').getContext('2d');
    
    if (state.weightChart) {
        state.weightChart.destroy();
    }

    state.weightChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: history.map(h => formatDateShort(h.date)),
            datasets: [{
                label: 'Kilo (kg)',
                data: history.map(h => h.weight),
                borderColor: '#ff9d00',
                backgroundColor: 'rgba(255, 157, 0, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.3,
                pointRadius: 4,
                pointBackgroundColor: '#ff9d00'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    grid: { color: 'rgba(0,0,0,0.03)' },
                    ticks: { color: '#7e7e9a', font: { family: 'Outfit' } }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#7e7e9a', font: { family: 'Outfit' } }
                }
            }
        }
    });
}

function logWeight(weightValue) {
    const weight = parseFloat(weightValue);
    if (isNaN(weight) || weight <= 0) return;

    // Profil güncelle
    state.profile.weight = weight;
    DB.saveProfile(state.profile);

    // Geçmişe ekle
    const weightHistory = JSON.parse(localStorage.getItem('kosutakip_weight_history') || '[]');
    weightHistory.push({
        date: new Date().toISOString().split('T')[0],
        weight: weight
    });
    localStorage.setItem('kosutakip_weight_history', JSON.stringify(weightHistory));

    // Bulut yedeklemesini tetikle
    syncAllToCloud();

    // Ekranı güncelle
    renderWeightTab();
    alert("Kilo kaydınız başarıyla eklendi.");
}

// --- PROFİL VE PREMIUM ARAYÜZ YÖNETİMİ ---
function updateProfileUI() {
    const profile = state.profile;
    
    // Ziyaretçi (Misafir) Modu Kısıtlamaları
    const settingsBtn = document.getElementById('header-settings-btn');
    const bottomNav = document.querySelector('.bottom-nav');
    
    if (!profile.isLoggedIn) {
        if (settingsBtn) settingsBtn.style.display = 'none';
        if (bottomNav) bottomNav.style.display = 'none';
    } else {
        if (settingsBtn) settingsBtn.style.display = 'flex';
        if (bottomNav) bottomNav.style.display = 'flex';
    }
    
    // Üst bar sol kısma profil resmi ekle
    let avatarContainer = document.getElementById('header-profile-avatar');
    if (!avatarContainer) {
        avatarContainer = document.createElement('div');
        avatarContainer.id = 'header-profile-avatar';
        avatarContainer.className = 'profile-avatar-header';
        avatarContainer.style.marginRight = '10px';
        
        const headerBar = document.querySelector('.header-bar');
        const titleEl = headerBar.querySelector('.header-title');
        headerBar.insertBefore(avatarContainer, titleEl);
        
        // Flexbox hizalamasını düzenle
        headerBar.style.display = 'flex';
        headerBar.style.alignItems = 'center';
        headerBar.style.justifyContent = 'space-between';
        titleEl.style.display = 'flex';
        titleEl.style.alignItems = 'center';
        titleEl.style.flex = '1';
    }
    
    if (profile.isLoggedIn) {
        if (profile.photoUrl) {
            avatarContainer.innerHTML = `<img src="${profile.photoUrl}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
        } else {
            const initials = profile.displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
            avatarContainer.innerHTML = `<span>${initials}</span>`;
        }
        avatarContainer.style.display = 'flex';
    } else {
        avatarContainer.style.display = 'none';
    }

    // Oturum/Profil Kartları Gösterim Mantığı
    const profileCard = document.getElementById('settings-profile-card');
    const loginItem = document.querySelector('#ayarlar-screen .settings-item'); // İlk settings item "Oturum aç"
    const logoutItem = document.getElementById('settings-logout-item');
    
    if (profile.isLoggedIn) {
        // Profil kartını göster ve doldur
        if (profileCard) {
            profileCard.classList.remove('d-none');
            const initials = profile.displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
            const avatarCircle = document.getElementById('settings-avatar-circle');
            if (profile.photoUrl) {
                avatarCircle.innerHTML = `<img src="${profile.photoUrl}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
                avatarCircle.style.background = 'none';
                avatarCircle.style.border = 'none';
            } else {
                avatarCircle.textContent = initials;
                avatarCircle.style.background = 'var(--violet-grad)';
                avatarCircle.style.border = '2px solid white';
            }
            document.getElementById('settings-profile-name').innerHTML = `${profile.displayName} ${profile.premium ? '<i class="fa-solid fa-crown crown-icon"></i>' : ''}`;
            document.getElementById('settings-profile-email').textContent = profile.email;
        }
        // Giriş satırını gizle, Çıkış satırını göster
        if (loginItem) loginItem.classList.add('d-none');
        if (logoutItem) logoutItem.classList.remove('d-none');
    } else {
        // Profil kartını gizle
        if (profileCard) profileCard.classList.add('d-none');
        // Giriş satırını göster, Çıkış satırını gizle
        if (loginItem) {
            loginItem.classList.remove('d-none');
            const titleEl = loginItem.querySelector('.settings-item-title');
            const descEl = loginItem.querySelector('.settings-item-desc');
            const actionEl = loginItem.querySelector('span[style*="color"]');
            
            titleEl.textContent = "Oturum aç (Google)";
            descEl.innerHTML = `<span class="status-dot inactive"></span> Bulut Yedekleme Aktif Değil`;
            if (actionEl) {
                actionEl.textContent = "Giriş Yap";
                actionEl.style.color = "var(--primary-color)";
                actionEl.id = "btn-signin-trigger";
            }
        }
        if (logoutItem) logoutItem.classList.add('d-none');
    }

    // Premium Banner Alanı (Ayarlar Ekranında)
    const premiumBanner = document.querySelector('.premium-banner');
    if (premiumBanner) {
        if (profile.premium) {
            premiumBanner.style.background = 'var(--violet-grad)';
            premiumBanner.querySelector('.premium-banner-subtitle').textContent = "YKME-FİT Premium Üyesi";
            premiumBanner.querySelector('.premium-banner-desc').textContent = "Tüm premium özellikler aktif. Reklamlar kaldırıldı. Teşekkürler!";
            premiumBanner.style.boxShadow = '0 10px 25px rgba(92, 61, 146, 0.2)';
        } else {
            premiumBanner.style.background = 'var(--premium-grad)';
            premiumBanner.querySelector('.premium-banner-subtitle').textContent = "Premium'yu Dene";
            premiumBanner.querySelector('.premium-banner-desc').textContent = "Abone olun ve şimdi tüm YKME-FİT Premium özelliklerine erişin! Reklamları kaldırın.";
            premiumBanner.style.boxShadow = '0 10px 25px rgba(255, 94, 0, 0.2)';
        }
    }
    
    // İstatistiklerdeki Premium Kilitlerinin Durumu
    const premiumBadges = document.querySelectorAll('.stats-detailed-list .premium-badge');
    premiumBadges.forEach(badge => {
        const valEl = badge.previousElementSibling;
        if (profile.premium) {
            badge.style.display = 'none';
            // Önceki ay verisini göster
            if (valEl.id === 'stat-active-mins' && !valEl.querySelector('.prev-val-stat')) {
                valEl.innerHTML = `${valEl.textContent} <span class="prev-val-stat" style="font-size: 11px; color: #4caf50; font-weight: 500; margin-left: 6px;">(Önceki Ay: 96 dk)</span>`;
            } else if (valEl.id === 'stat-total-distance' && !valEl.querySelector('.prev-val-stat')) {
                valEl.innerHTML = `${valEl.textContent} <span class="prev-val-stat" style="font-size: 11px; color: #4caf50; font-weight: 500; margin-left: 6px;">(Önceki Ay: 4.8 km)</span>`;
            }
        } else {
            badge.style.display = 'inline-block';
            if (valEl) {
                const span = valEl.querySelector('.prev-val-stat');
                if (span) span.remove();
            }
        }
    });

    // Ziyaretçi Uyarı Banner Kontrolü
    const guestBanner = document.getElementById('guest-login-banner');
    if (guestBanner) {
        if (profile.isLoggedIn) {
            guestBanner.classList.add('d-none');
        } else {
            guestBanner.classList.remove('d-none');
        }
    }

    // Reklam Görünürlüğünü Güncelle
    updateAdsVisibility();
}

// Reklam Görünürlüğünü Kontrol Etme Motoru
function updateAdsVisibility() {
    const banner = document.getElementById('google-ads-banner');
    if (!banner) return;
    
    // Varsayılan reklam ayarlarını yükle
    const adSettings = JSON.parse(localStorage.getItem('kosutakip_ad_settings') || JSON.stringify({
        enabled: true,
        type: 'manual',
        title: "YKME-FİT Premium'a Geçin!",
        description: "Reklamları kaldırın, tüm analizleri açın.",
        actionUrl: "#premium",
        imageUrl: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=100&fit=crop&q=60",
        scriptCode: ""
    }));
    
    const profile = state.profile || DB.getProfile();
    
    // Eğer reklamlar açık ise ve kullanıcı premium değil ise reklamı göster
    if (adSettings.enabled && !profile.premium) {
        banner.classList.remove('d-none');
        
        const manualContent = document.getElementById('ad-manual-content');
        const scriptContent = document.getElementById('ad-script-content');
        
        if (adSettings.type === 'script') {
            if (manualContent) manualContent.classList.add('d-none');
            if (scriptContent) {
                scriptContent.classList.remove('d-none');
                
                // Kod değiştiyse veya henüz eklenmediyse güncelle
                if (scriptContent.getAttribute('data-applied-code') !== adSettings.scriptCode) {
                    scriptContent.innerHTML = adSettings.scriptCode;
                    scriptContent.setAttribute('data-applied-code', adSettings.scriptCode);
                    
                    // Script etiketlerini çalıştır
                    const scripts = scriptContent.querySelectorAll('script');
                    scripts.forEach(oldScript => {
                        const newScript = document.createElement('script');
                        Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
                        newScript.appendChild(document.createTextNode(oldScript.innerHTML));
                        oldScript.parentNode.replaceChild(newScript, oldScript);
                    });
                }
            }
        } else {
            // Manuel reklam göster
            if (scriptContent) scriptContent.classList.add('d-none');
            if (manualContent) manualContent.classList.remove('d-none');
            
            // Reklam içeriklerini doldur
            const titleEl = document.getElementById('ad-banner-title');
            const descEl = document.getElementById('ad-banner-desc');
            const imageEl = document.getElementById('ad-banner-image');
            const linkEl = document.getElementById('ad-banner-link');
            
            if (titleEl) titleEl.textContent = adSettings.title;
            if (descEl) descEl.textContent = adSettings.description;
            if (imageEl) imageEl.src = adSettings.imageUrl;
            if (linkEl) {
                linkEl.href = adSettings.actionUrl;
                if (adSettings.actionUrl === '#premium') {
                    linkEl.removeAttribute('target');
                    linkEl.onclick = (e) => {
                        e.preventDefault();
                        document.getElementById('premium-checkout-modal').classList.add('active');
                    };
                } else {
                    linkEl.setAttribute('target', '_blank');
                    linkEl.onclick = null;
                }
            }
        }
    } else {
        banner.classList.add('d-none');
    }
}

// Yönetici Kontrol Paneli Arayüzünü Çizme
function renderAdminPanel() {
    // 1. Reklam Ayarlarını Forma Yükle
    const adSettings = JSON.parse(localStorage.getItem('kosutakip_ad_settings') || JSON.stringify({
        enabled: true,
        type: 'manual',
        title: "YKME-FİT Premium'a Geçin!",
        description: "Reklamları kaldırın, tüm analizleri açın.",
        actionUrl: "#premium",
        imageUrl: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=100&fit=crop&q=60",
        scriptCode: ""
    }));
    
    const toggleAds = document.getElementById('admin-toggle-ads');
    const adTypeSelect = document.getElementById('admin-ad-type');
    const adTitle = document.getElementById('admin-ad-title');
    const adDesc = document.getElementById('admin-ad-desc');
    const adLink = document.getElementById('admin-ad-link');
    const adImage = document.getElementById('admin-ad-image');
    const adScript = document.getElementById('admin-ad-script');
    
    if (toggleAds) toggleAds.checked = adSettings.enabled;
    if (adTypeSelect) adTypeSelect.value = adSettings.type || 'manual';
    if (adTitle) adTitle.value = adSettings.title || '';
    if (adDesc) adDesc.value = adSettings.description || '';
    if (adLink) adLink.value = adSettings.actionUrl || '';
    if (adImage) adImage.value = adSettings.imageUrl || '';
    if (adScript) adScript.value = adSettings.scriptCode || '';
    
    toggleAdminAdFields(adSettings.type || 'manual');
    

    
    // 2. Kullanıcıları Listele
    const users = DB.getAllUsers();
    const listContainer = document.getElementById('admin-users-list');
    if (!listContainer) return;
    
    listContainer.innerHTML = '';
    
    if (users.length === 0) {
        listContainer.innerHTML = '<div style="font-size: 12px; color: var(--text-secondary); text-align: center; padding: 10px 0;">Kayıtlı kullanıcı bulunamadı.</div>';
        return;
    }
    
    users.forEach(user => {
        const userCard = document.createElement('div');
        userCard.className = 'admin-user-card';
        
        const isChecked = user.premium ? 'checked' : '';
        const premiumLabel = user.premium ? 'Premium (Aktif)' : 'Standart Üye';
        
        userCard.innerHTML = `
            <div class="admin-user-info">
                <span class="admin-user-name">${user.displayName}</span>
                <span class="admin-user-email">${user.email}</span>
                <span class="admin-user-stats">${user.activitiesCount} Aktivite Kaydı | ${premiumLabel}</span>
            </div>
            <label class="toggle-switch" style="margin-bottom: 0;">
                <input type="checkbox" class="admin-user-premium-toggle" data-email="${user.email}" ${isChecked}>
                <span class="toggle-slider"></span>
            </label>
        `;
        
        // Premium durumunu değiştirme eylemi
        userCard.querySelector('.admin-user-premium-toggle').addEventListener('change', (e) => {
            const email = e.target.getAttribute('data-email');
            const newStatus = e.target.checked;
            
            DB.updateUserPremium(email, newStatus);
            
            // Eğer aktif kullanıcı güncellendiyse state'i de güncelle
            if (state.profile.isLoggedIn && state.profile.email === email) {
                state.profile.premium = newStatus;
                updateProfileUI();
            }
            
            // Paneli ve reklam görünümünü yenile
            renderAdminPanel();
            updateAdsVisibility();
        });
        
        listContainer.appendChild(userCard);
    });
}

function toggleAdminAdFields(type) {
    const manualFields = document.getElementById('admin-manual-ad-fields');
    const scriptFields = document.getElementById('admin-script-ad-fields');
    if (type === 'script') {
        if (manualFields) manualFields.classList.add('d-none');
        if (scriptFields) scriptFields.classList.remove('d-none');
    } else {
        if (manualFields) manualFields.classList.remove('d-none');
        if (scriptFields) scriptFields.classList.add('d-none');
    }
}

// --- TOPLULUK AKIŞI YÖNETİMİ ---
function renderSocialFeed() {
    const posts = DB.getPosts();
    const container = document.getElementById('yayin-feed-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    posts.forEach(post => {
        const isLikedClass = post.likedByMe ? 'liked' : '';
        const thumbsIcon = post.likedByMe ? 'fa-solid fa-thumbs-up' : 'fa-regular fa-thumbs-up';
        
        const card = document.createElement('div');
        card.className = 'activity-card';
        card.style.flexDirection = 'column';
        card.style.alignItems = 'flex-start';
        card.style.gap = '12px';
        card.style.cursor = 'default';
        
        card.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px; width: 100%;">
                <div style="width: 40px; height: 40px; border-radius: 50%; background-color: ${post.color || 'var(--primary-color)'}; color: white; display: flex; align-items: center; justify-content: center; font-weight: 700;">
                    ${post.initials || 'MK'}
                </div>
                <div style="display: flex; flex-direction: column; flex: 1;">
                    <span style="font-weight: 700; font-size: 14px;">${post.author}</span>
                    <span style="font-size: 11px; color: var(--text-secondary);">${formatDate(post.date)} | ${formatTime(post.date)}</span>
                </div>
                ${post.isPro ? '<span class="premium-badge" style="background: var(--premium-grad)">PRO</span>' : ''}
            </div>
            <p style="font-size: 13px; color: #2c2543; line-height: 1.4; white-space: pre-line;">${post.content}</p>
            <div style="display: flex; gap: 16px; width: 100%; border-top: 1px solid rgba(0,0,0,0.03); padding-top: 10px;">
                <button class="like-btn ${isLikedClass}" data-id="${post.id}">
                    <i class="${thumbsIcon}"></i> <span>${post.likes} Beğeni</span>
                </button>
            </div>
        `;
        
        // Like click event
        card.querySelector('.like-btn').addEventListener('click', (e) => {
            e.preventDefault();
            DB.toggleLikePost(post.id);
            renderSocialFeed();
        });
        
        container.appendChild(card);
    });
}

// --- PREMIUM BAŞARI KONFETİ SİMÜLASYONU ---
function startConfetti() {
    let canvas = document.getElementById('confetti');
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'confetti';
        canvas.className = 'confetti-canvas';
        document.body.appendChild(canvas);
    }
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'];
    const particles = [];
    
    for (let i = 0; i < 150; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            r: Math.random() * 6 + 4,
            d: Math.random() * canvas.height,
            color: colors[Math.floor(Math.random() * colors.length)],
            tilt: Math.random() * 10 - 5,
            tiltAngleIncremental: Math.random() * 0.07 + 0.02,
            tiltAngle: 0
        });
    }
    
    let animationId;
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        let active = false;
        particles.forEach(p => {
            p.tiltAngle += p.tiltAngleIncremental;
            p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
            p.x += Math.sin(p.tiltAngle);
            p.tilt = Math.sin(p.tiltAngle - (p.r / 3)) * 15;
            
            if (p.y < canvas.height) {
                active = true;
            }
            
            ctx.beginPath();
            ctx.lineWidth = p.r;
            ctx.strokeStyle = p.color;
            ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
            ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
            ctx.stroke();
        });
        
        if (active) {
            animationId = requestAnimationFrame(draw);
        } else {
            canvas.remove();
        }
    }
    
    draw();
    
    setTimeout(() => {
        cancelAnimationFrame(animationId);
        canvas.remove();
    }, 5000);
}

// --- OLAY DİNLEYİCİLERİ ---
function setupEventListeners() {
    // Alt Gezinme Menüsü Tıklamaları
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const tab = item.getAttribute('data-tab');
            switchScreen(tab);
        });
    });

    // Koşu Kontrol Butonları
    document.getElementById('btn-start').addEventListener('click', startTracking);
    document.getElementById('btn-pause').addEventListener('click', pauseTracking);
    document.getElementById('btn-stop').addEventListener('click', stopTracking);

    // Simülasyon / Gerçek GPS Değişimi
    const simToggle = document.getElementById('sim-mode-toggle');
    if (simToggle) {
        simToggle.addEventListener('change', (e) => {
            state.simulationMode = e.target.checked;
            if (state.isRunning) {
                // Eğer koşarken değiştirilirse baştan izleme mekanizmasını değiştir
                alert("İzleme modu değiştirildi. Bu değişiklik bir sonraki koşuda geçerli olacaktır.");
            }
        });
    }

    // Günlük Sekmeleri Tıklaması
    const diaryScreen = document.getElementById('gunluk-screen');
    const diaryTabs = diaryScreen.querySelectorAll('.filter-tab');
    diaryTabs.forEach((tab, index) => {
        tab.addEventListener('click', (e) => {
            diaryTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            const filterTypes = ['hafta', 'ay', 'yil', 'toplam'];
            state.diaryFilter = filterTypes[index];
            renderDiary();
        });
    });

    // İstatistikler Sekmeleri Tıklaması
    const statsScreen = document.getElementById('istatistikler-screen');
    const statsTabs = statsScreen.querySelectorAll('.filter-tab');
    statsTabs.forEach((tab, index) => {
        tab.addEventListener('click', (e) => {
            statsTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            const filterTypes = ['hafta', 'ay', 'yil', 'toplam'];
            state.statsFilter = filterTypes[index];
            renderStatistics();
        });
    });

    // Tarih/Ay Navigasyonu (Günlük ve İstatistikler için ok butonları)
    const setupMonthNavigation = (screenEl, screenName) => {
        const arrows = screenEl.querySelectorAll('.nav-arrow');
        if (arrows.length >= 2) {
            // Sol Ok (Geri)
            arrows[0].addEventListener('click', () => {
                const filter = screenName === 'gunluk' ? state.diaryFilter : state.statsFilter;
                adjustDate(-1, filter);
                if (screenName === 'gunluk') renderDiary();
                else renderStatistics();
            });
            
            // Sağ Ok (İleri)
            arrows[1].addEventListener('click', () => {
                const filter = screenName === 'gunluk' ? state.diaryFilter : state.statsFilter;
                adjustDate(1, filter);
                if (screenName === 'gunluk') renderDiary();
                else renderStatistics();
            });
        }
    };
    
    setupMonthNavigation(diaryScreen, 'gunluk');
    setupMonthNavigation(statsScreen, 'istatistikler');

    // Manuel Aktivite Ekleme Butonu
    document.getElementById('btn-add-activity-manual').addEventListener('click', () => {
        document.getElementById('manual-activity-modal').classList.add('active');
    });

    // Manuel Aktivite Formu Kaydetme
    document.getElementById('manual-activity-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const distance = parseFloat(document.getElementById('man-distance').value);
        const durationMins = parseInt(document.getElementById('man-duration').value);
        const date = document.getElementById('man-date').value;

        if (distance > 0 && durationMins > 0) {
            const newRun = {
                type: 'Koşu',
                date: new Date(date).toISOString(),
                distance: distance,
                duration: durationMins * 60,
                calories: Math.round(state.profile.weight * distance * 1.036),
                route: [] // Manuel aktivitede rota çizimi olmaz
            };
            DB.addActivity(newRun);
            syncAllToCloud();
            document.getElementById('manual-activity-modal').classList.remove('active');
            document.getElementById('manual-activity-form').reset();
            renderDiary();
        }
    });

    // Ağırlık Ekleme Formu
    document.getElementById('weight-log-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const weightInput = document.getElementById('weight-input-val');
        logWeight(weightInput.value);
        weightInput.value = '';
    });

    // Profil Bilgileri Butonu (Ayarlar'da)
    document.getElementById('btn-personal-settings').addEventListener('click', () => {
        const prof = DB.getProfile();
        document.getElementById('prof-weight').value = prof.weight;
        document.getElementById('prof-height').value = prof.height;
        document.getElementById('prof-birthdate').value = prof.birthDate;
        document.getElementById('prof-gender').value = prof.gender;
        
        document.getElementById('profile-settings-modal').classList.add('active');
    });

    // Profil Formu Kaydetme
    document.getElementById('profile-settings-form').addEventListener('submit', (e) => {
        e.preventDefault();
        state.profile.weight = parseFloat(document.getElementById('prof-weight').value);
        state.profile.height = parseFloat(document.getElementById('prof-height').value);
        state.profile.birthDate = document.getElementById('prof-birthdate').value;
        state.profile.gender = document.getElementById('prof-gender').value;

        DB.saveProfile(state.profile);
        syncAllToCloud();
        document.getElementById('profile-settings-modal').classList.remove('active');
        
        // Değişikliği yansıtmak için ekranları güncelle
        if (state.currentScreen === 'agirlik') renderWeightTab();
        alert("Profil bilgileriniz güncellendi.");
    });

    // Ayarlar Toggles (Sesli geri bildirim vb.)
    const audioFeedbackToggle = document.getElementById('settings-audio-feedback');
    if (audioFeedbackToggle) {
        audioFeedbackToggle.checked = state.profile.audioFeedback;
        audioFeedbackToggle.addEventListener('change', (e) => {
            state.profile.audioFeedback = e.target.checked;
            DB.saveProfile(state.profile);
        });
    }

    const screenAwakeToggle = document.getElementById('settings-screen-awake');
    if (screenAwakeToggle) {
        screenAwakeToggle.checked = state.profile.keepScreenOn;
        screenAwakeToggle.addEventListener('change', (e) => {
            state.profile.keepScreenOn = e.target.checked;
            DB.saveProfile(state.profile);
            // Gerçek ekran açık tutma API desteği (WakeLock API)
            if (e.target.checked) {
                requestWakeLock();
            } else {
                releaseWakeLock();
            }
        });
    }

    const confirmEndToggle = document.getElementById('settings-confirm-end');
    if (confirmEndToggle) {
        confirmEndToggle.checked = state.profile.endActivityConfirm;
        confirmEndToggle.addEventListener('change', (e) => {
            state.profile.endActivityConfirm = e.target.checked;
            DB.saveProfile(state.profile);
        });
    }

    // Modal Kapatma Butonları
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.closest('.modal-overlay').classList.remove('active');
        });
    });

    // Modal Dışına Tıklayınca Kapatma
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.classList.remove('active');
            }
        });
    });

    // Üst Bar Ayarlar Butonu Tıklaması
    const headerSettingsBtn = document.getElementById('header-settings-btn');
    if (headerSettingsBtn) {
        headerSettingsBtn.addEventListener('click', () => {
            switchScreen('ayarlar');
        });
    }

    // Oturum Aç Tıklama Kontrolü (Ayarlar)
    const loginItem = document.querySelector('#ayarlar-screen .settings-item');
    if (loginItem) {
        loginItem.addEventListener('click', (e) => {
            openGoogleLoginModal();
        });
    }

    // Oturumu Kapat Tıklama Kontrolü (Ayarlar)
    const logoutItem = document.getElementById('settings-logout-item');
    if (logoutItem) {
        logoutItem.addEventListener('click', (e) => {
            if (confirm("Oturumu kapatmak istediğinize emin misiniz?")) {
                DB.clearAll();
                state.isGuestMode = false;
                initApp();
            }
        });
    }

    // Google Client ID Kurulum Kaydetme ve Giriş Butonu
    const btnSaveSetup = document.getElementById('btn-save-setup-client-id');
    if (btnSaveSetup) {
        btnSaveSetup.addEventListener('click', (e) => {
            e.preventDefault();
            const setupClientId = document.getElementById('setup-google-client-id').value.trim();
            if (!setupClientId) {
                alert("Lütfen geçerli bir Google Client ID girin.");
                return;
            }
            if (!setupClientId.includes('apps.googleusercontent.com')) {
                alert("Girdiğiniz değer geçerli bir Google Client ID formatında görünmüyor. Lütfen '.apps.googleusercontent.com' ile biten tam değeri girin.");
                return;
            }
            
            // Kaydet
            localStorage.setItem('kosutakip_google_client_id', setupClientId);
            
            // Admin panelindeki input'u da senkronize et
            const adminGoogleClientId = document.getElementById('admin-google-client-id');
            if (adminGoogleClientId) {
                adminGoogleClientId.value = setupClientId;
            }
            
            // Görünümleri değiştir ve Girişi başlat
            const loadingView = document.getElementById('google-view-loading');
            const setupView = document.getElementById('google-view-setup');
            if (setupView) setupView.classList.add('d-none');
            if (loadingView) loadingView.classList.remove('d-none');
            
            triggerRealGoogleSignIn(setupClientId);
        });
    }

    // Premium Banner Tıklaması
    const premiumBanner = document.querySelector('.premium-banner');
    if (premiumBanner) {
        premiumBanner.addEventListener('click', () => {
            if (state.profile.premium) {
                alert("Zaten aktif bir YKME-FİT Premium üyesisiniz. Desteğiniz için teşekkürler!");
            } else {
                document.getElementById('premium-checkout-modal').classList.add('active');
            }
        });
    }

    // Paket Seçimi Tıklamaları
    const packAnnual = document.getElementById('pack-annual');
    const packMonthly = document.getElementById('pack-monthly');
    if (packAnnual && packMonthly) {
        packAnnual.addEventListener('click', () => {
            packAnnual.classList.add('selected');
            packAnnual.style.borderColor = 'var(--primary-color)';
            packMonthly.classList.remove('selected');
            packMonthly.style.borderColor = '#edf0f7';
        });
        packMonthly.addEventListener('click', () => {
            packMonthly.classList.add('selected');
            packMonthly.style.borderColor = 'var(--primary-color)';
            packAnnual.classList.remove('selected');
            packAnnual.style.borderColor = '#edf0f7';
        });
    }

    // Kredi Kartı Numarası Formatlama
    const cardNumInput = document.getElementById('pay-card-num');
    if (cardNumInput) {
        cardNumInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
            let formattedValue = '';
            for (let i = 0; i < value.length; i++) {
                if (i > 0 && i % 4 === 0) formattedValue += ' ';
                formattedValue += value[i];
            }
            e.target.value = formattedValue;
        });
    }

    // Expiry MM/YY Formatlama
    const cardExpiryInput = document.getElementById('pay-card-expiry');
    if (cardExpiryInput) {
        cardExpiryInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
            if (value.length > 2) {
                e.target.value = value.substring(0, 2) + '/' + value.substring(2, 4);
            } else {
                e.target.value = value;
            }
        });
    }

    // Premium Ödeme Formu Gönderimi
    document.getElementById('premium-payment-form').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const btnSubmit = document.getElementById('btn-submit-payment');
        const originalText = btnSubmit.textContent;
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin" style="margin-right: 8px;"></i> İşleniyor...';
        
        setTimeout(() => {
            state.profile.premium = true;
            DB.saveProfile(state.profile);
            
            btnSubmit.disabled = false;
            btnSubmit.textContent = originalText;
            
            document.getElementById('premium-checkout-modal').classList.remove('active');
            document.getElementById('premium-payment-form').reset();
            
            updateProfileUI();
            if (state.currentScreen === 'istatistikler') renderStatistics();
            
            startConfetti();
            
            speakText("Tebrikler! YKME-FİT Premium üyeliğiniz başarıyla aktif edildi.");
            alert("YKME-FİT Premium Satın Alındı!\nTüm özelliklerin kilidi açıldı.");
        }, 1500);
    });

    // İstatistikler Alanındaki Premium Kilit Satırları Tıklaması
    document.querySelectorAll('.stats-detailed-list .detail-row').forEach(row => {
        row.addEventListener('click', () => {
            if (!state.profile.premium && row.querySelector('.premium-badge')) {
                document.getElementById('premium-checkout-modal').classList.add('active');
            }
        });
    });

    // Sosyal Gönderi Paylaşma Formu Gönderimi
    document.getElementById('yayin-post-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const textarea = document.getElementById('yayin-post-input');
        const content = textarea.value.trim();
        
        if (content) {
            const author = state.profile.isLoggedIn ? state.profile.displayName : 'Misafir Koşucu';
            const initials = author.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
            const color = state.profile.isLoggedIn ? '#5c3d92' : '#' + Math.floor(Math.random()*16777215).toString(16);
            
            const newPost = {
                author: author,
                initials: initials,
                color: color,
                date: new Date().toISOString(),
                content: content,
                isPro: state.profile.premium
            };
            
            DB.addPost(newPost);
            textarea.value = '';
            renderSocialFeed();
            alert("Gönderiniz topluluk akışında paylaşıldı!");
        }
    });

    // Açılış Google Giriş Butonu Tıklaması
    const startupGoogleBtn = document.getElementById('btn-startup-google-login');
    if (startupGoogleBtn) {
        startupGoogleBtn.addEventListener('click', () => {
            openGoogleLoginModal();
        });
    }

    // Ziyaretçi Banner Giriş Butonu Tıklaması
    const guestBannerLoginBtn = document.getElementById('btn-guest-banner-login');
    if (guestBannerLoginBtn) {
        guestBannerLoginBtn.addEventListener('click', () => {
            openGoogleLoginModal();
        });
    }

    // Ziyaretçi Girişi Tıklaması
    const guestBtn = document.getElementById('btn-login-guest');
    if (guestBtn) {
        guestBtn.addEventListener('click', () => {
            state.isGuestMode = true;
            initApp();
        });
    }

    // Yönetici Paneline Geçiş Butonu (Ayarlar)
    const adminPanelBtn = document.getElementById('btn-admin-panel');
    if (adminPanelBtn) {
        adminPanelBtn.addEventListener('click', () => {
            switchScreen('admin');
        });
    }

    // Yönetici Panelinden Ayarlar'a Geri Dönüş
    const adminBackBtn = document.getElementById('btn-admin-back');
    if (adminBackBtn) {
        adminBackBtn.addEventListener('click', () => {
            switchScreen('ayarlar');
        });
    }

    // Reklam Ayarları Kaydetme Formu Gönderimi
    const adminAdForm = document.getElementById('admin-ad-form');
    if (adminAdForm) {
        // Reklam türü değiştiğinde alanları göster/gizle
        const adTypeSelect = document.getElementById('admin-ad-type');
        if (adTypeSelect) {
            adTypeSelect.addEventListener('change', (e) => {
                toggleAdminAdFields(e.target.value);
            });
        }

        adminAdForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const enabled = document.getElementById('admin-toggle-ads').checked;
            const type = document.getElementById('admin-ad-type').value;
            const title = document.getElementById('admin-ad-title').value.trim();
            const description = document.getElementById('admin-ad-desc').value.trim();
            const actionUrl = document.getElementById('admin-ad-link').value.trim();
            const imageUrl = document.getElementById('admin-ad-image').value.trim();
            const scriptCode = document.getElementById('admin-ad-script').value.trim();
            
            const newAdSettings = {
                enabled,
                type,
                title,
                description,
                actionUrl,
                imageUrl,
                scriptCode
            };
            
            localStorage.setItem('kosutakip_ad_settings', JSON.stringify(newAdSettings));
            
            // Reklam görünümünü anında güncelle
            updateAdsVisibility();
            
            alert("Reklam ayarları başarıyla kaydedildi.");
        });
    }




}

// Screen WakeLock API yönetimi
let wakeLock = null;
async function requestWakeLock() {
    try {
        if ('wakeLock' in navigator) {
            wakeLock = await navigator.wakeLock.request('screen');
        }
    } catch (err) {
        console.warn('Wake Lock Hatası:', err);
    }
}
function releaseWakeLock() {
    if (wakeLock) {
        wakeLock.release();
        wakeLock = null;
    }
}

// --- GENEL YARDIMCI METOTLAR ---
function formatDuration(sec) {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec - (hrs * 3600)) / 60);
    const secs = sec - (hrs * 3600) - (mins * 60);
    
    if (hrs > 0) {
        return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatDate(isoStr) {
    const d = new Date(isoStr);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}.${month}.${year}`;
}

function formatDateShort(dateStr) {
    const d = new Date(dateStr);
    const day = d.getDate();
    const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
    return `${day} ${months[d.getMonth()]}`;
}

function formatTime(isoStr) {
    const d = new Date(isoStr);
    return d.toTimeString().split(' ')[0].substring(0, 5);
}
