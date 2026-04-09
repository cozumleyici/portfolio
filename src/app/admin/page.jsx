import { useState, useEffect } from 'react';

const AdminPanel = () => {
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  
  // Login state'i
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Component mount oldugunda localStorage'dan verileri yükle
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Login durumunu kontrol et
      try {
        const loginStatus = localStorage.getItem('adminLoggedIn');
        if (loginStatus === 'true') {
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error('localStorage error:', error);
      }
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    const savedPassword = typeof window !== 'undefined' ? (localStorage.getItem('adminPassword') || 'admin123') : 'admin123';
    if (password === savedPassword) {
      setIsLoggedIn(true);
      // Login durumunu kaydet
      if (typeof window !== 'undefined') {
        localStorage.setItem('adminLoggedIn', 'true');
      }
      setPassword('');
    } else {
      alert('Yanlýþ þifre!');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setPassword('');
    setShowPasswordChange(false);
    // Login durumunu sil
    if (typeof window !== 'undefined') {
      localStorage.setItem('adminLoggedIn', 'false');
    }
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('Þifreler eþleþmiyor!');
      return;
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('adminPassword', newPassword);
    }
    alert('Þifre baþarýyla deðiþtirildi!');
    setNewPassword('');
    setConfirmPassword('');
    setShowPasswordChange(false);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold gradient-text mb-2">Yönetim Paneli</h1>
            <p className="text-gray-600 dark:text-gray-400">Birols.com Portfolyo Yönetimi</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Þifre
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                placeholder="Þifrenizi girin"
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
            >
              Giriþ Yap
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Yönetim paneli için dark mode ana siteden kontrol edilir
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-300 dark:border-gray-600 shadow-md relative z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold gradient-text">Admin Paneli</h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Çýkýþ Yap
            </button>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowPasswordChange(!showPasswordChange)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Þifre Deðiþtir
            </button>
          </div>
        </div>

        <div className="flex-1 p-8">
          {showPasswordChange ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md mx-auto">
              <h2 className="text-2xl font-bold mb-4 gradient-text">Þifre Deðiþtir</h2>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Yeni Þifre
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
                    placeholder="Yeni þifrenizi girin"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Þifre Tekrarý
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
                    placeholder="Þifrenizi tekrar girin"
                    required
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Þifre Güncelle
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPasswordChange(false)}
                    className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Ýptal
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-4 gradient-text">Dosya Yönetimi</h2>
              
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">TXT Dosyalarý</h3>
                <div className="space-y-4">
                  <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">â Ý TXT Dosyalarý GitHub Üzerinden Yönetiliyor</h4>
                    <div className="text-sm text-yellow-700 dark:text-yellow-300 space-y-2">
                      <p>ð <strong>GitHub'dan düzenleme:</strong></p>
                      <ul className="ml-4 list-disc">
                        <li>GitHub reposuna gidin: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">https://github.com/cozumleyici/portfolio</code></li>
                        <li><code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">public/</code> klasöründeki TXT dosyalarýný düzenleyin</li>
                        <li>Deðiþiklikleri commit edin</li>
                        <li>Vercel otomatik deploy eder</li>
                      </ul>
                      <p>â <strong>Güncelleme süreci:</strong></p>
                      <ol className="ml-4 list-decimal">
                        <li>GitHub'da TXT dosyasýný düzenle</li>
                        <li>Commit: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">git add . && git commit -m "Update TXT files"</code></li>
                        <li>Push: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">git push origin main</code></li>
                        <li>Vercel otomatik yayýnlar (1-2 dakika)</li>
                      </ol>
                      <p>ð <strong>Mevcut TXT Dosyalarý:</strong></p>
                      <ul className="ml-4 list-disc">
                        <li><a href="https://birols.com/vers_kontrolu.txt" target="_blank" className="text-blue-600 hover:text-blue-800 underline">vers_kontrolu.txt</a></li>
                        <li><a href="https://birols.com/vers_kontroluBillboard.txt" target="_blank" className="text-blue-600 hover:text-blue-800 underline">vers_kontroluBillboard.txt</a></li>
                        <li><a href="https://birols.com/vers_kontroluCBS.txt" target="_blank" className="text-blue-600 hover:text-blue-800 underline">vers_kontroluCBS.txt</a></li>
                        <li><a href="https://birols.com/vers_kontroluExcelArama.txt" target="_blank" className="text-blue-600 hover:text-blue-800 underline">vers_kontroluExcelArama.txt</a></li>
                        <li><a href="https://birols.com/vers_kontroluTespitKontrol.txt" target="_blank" className="text-blue-600 hover:text-blue-800 underline">vers_kontroluTespitKontrol.txt</a></li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mt-6">
                <h3 className="text-lg font-semibold mb-4">ZIP Dosyalarý</h3>
                <div className="space-y-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <p className="mb-2">ZIP dosyalarý doðrudan URL ile eriþilebilir:</p>
                    <ul className="space-y-1">
                      <li>â BillboardReklam.zip - <a href="/BillboardReklam.zip" target="_blank" className="text-blue-600 hover:underline">Ýndir</a></li>
                      <li>â DosyaArsivlemeZip.zip - <a href="/DosyaArsivlemeZip.zip" target="_blank" className="text-blue-600 hover:underline">Ýndir</a></li>
                      <li>â ExcelArama.zip - <a href="/ExcelArama.zip" target="_blank" className="text-blue-600 hover:underline">Ýndir</a></li>
                      <li>â ExcelAramaLink.zip - <a href="/ExcelAramaLink.zip" target="_blank" className="text-blue-600 hover:underline">Ýndir</a></li>
                      <li>â TespitKontrol.zip - <a href="/TespitKontrol.zip" target="_blank" className="text-blue-600 hover:underline">Ýndir</a></li>
                      <li>â YalovaCBS.zip - <a href="/YalovaCBS.zip" target="_blank" className="text-blue-600 hover:underline">Ýndir</a></li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
