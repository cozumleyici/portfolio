'use client';

import { useState, useEffect } from 'react';
import { FaSave, FaEye, FaEdit, FaTrash, FaPlus, FaTimes, FaBars } from 'react-icons/fa';
import { portfolioData } from '@/data/portfolioData';

const AdminPanel = () => {
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [activeTab, setActiveTab] = useState('hero');
  const [editMode, setEditMode] = useState({});
  const [tempData, setTempData] = useState(portfolioData);
  const [showPreview, setShowPreview] = useState(false);
  
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

        // Portfolio verilerini yükle
        const savedData = localStorage.getItem('portfolioData');
        if (savedData) {
          const parsed = JSON.parse(savedData);
          setTempData(parsed);
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
    if (newPassword.length < 4) {
      alert('Þifre en az 4 karakter olmalý!');
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

  const handleSave = async () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('portfolioData', JSON.stringify(tempData));
        alert('Deðiþiklikler baþarýyla kaydedildi!');
      }
    } catch (error) {
      console.error('Kaydetme hatasý:', error);
      alert('Kaydetme sýrasýnda hata oluþtu!');
    }
  };

  const handleEdit = (section, field, value) => {
    setTempData(prev => {
      const newData = { ...prev };
      if (!newData[section]) {
        newData[section] = {};
      }
      newData[section] = {
        ...newData[section],
        [field]: value
      };
      return newData;
    });
  };

  const handleNestedEdit = (section, index, field, value) => {
    setTempData(prev => {
      const newData = { ...prev };
      if (Array.isArray(newData[section])) {
        newData[section] = [...newData[section]];
        newData[section][index] = {
          ...newData[section][index],
          [field]: value
        };
      }
      return newData;
    });
  };

  const addProject = () => {
    const newProject = {
      id: Date.now(),
      title: "Yeni Proje",
      description: "Proje açýklamasý",
      image: "/images/project-new.jpg",
      technologies: ["React", "Node.js"],
      github: "https://github.com/",
      demo: null
    };
    setTempData(prev => ({
      ...prev,
      projects: [...prev.projects, newProject]
    }));
  };

  const deleteProject = (index) => {
    if (window.confirm('Bu projeyi silmek istediðinizden emin misiniz?')) {
      setTempData(prev => ({
        ...prev,
        projects: prev.projects.filter((_, i) => i !== index)
      }));
    }
  };

  const addExperience = () => {
    const newExperience = {
      id: Date.now(),
      title: "Yeni Deneyim",
      company: "Þirket Adý",
      period: "2024",
      description: "Deneyim açýklamasý",
      achievements: ["Baþarý 1", "Baþarý 2"]
    };
    setTempData(prev => ({
      ...prev,
      experience: [...prev.experience, newExperience]
    }));
  };

  const deleteExperience = (index) => {
    if (window.confirm('Bu deneyimi silmek istediðinizden emin misiniz?')) {
      setTempData(prev => ({
        ...prev,
        experience: prev.experience.filter((_, i) => i !== index)
      }));
    }
  };

  const tabs = [
    { id: 'hero', name: 'Hero', icon: 'ð' },
    { id: 'about', name: 'Hakkýmda', icon: 'ð' },
    { id: 'skills', name: 'Yetenekler', icon: 'â¡' },
    { id: 'projects', name: 'Projeler', icon: 'ð' },
    { id: 'experience', name: 'Deneyim', icon: 'ð¼' },
    { id: 'contact', name: 'Ýletiþim', icon: 'ð§' },
    { id: 'files', name: 'Dosyalar', icon: 'ð' }
  ];

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
                Şifre
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                placeholder="Şifrenizi girin"
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
            >
              Giriş Yap
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

  const tabs = [
    { id: 'hero', name: 'Hero', icon: '👤' },
    { id: 'about', name: 'Hakkımda', icon: '📝' },
    { id: 'skills', name: 'Yetenekler', icon: '💡' },
    { id: 'projects', name: 'Projeler', icon: '🚀' },
    { id: 'experience', name: 'Deneyim', icon: '💼' },
    { id: 'contact', name: 'İletişim', icon: '📧' },
    { id: 'files', name: 'Dosyalar', icon: '📁' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-300 dark:border-gray-600 shadow-md relative z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold gradient-text">Yönetim Paneli</h1>
              <span className="text-sm text-gray-500 dark:text-gray-400">Birols.com</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowPasswordChange(!showPasswordChange)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Şifre Değiştir
              </button>
              
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FaEye size={14} />
                {showPreview ? 'Düzenle' : 'Önizleme'}
              </button>
              
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <FaSave size={14} />
                Kaydet
              </button>
              
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Çıkış
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 min-h-screen">
          <nav className="p-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors mb-2 ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="flex-1 p-8">
          {showPreview ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-4 gradient-text">Önizleme</h2>
              <pre className="text-sm text-gray-600 dark:text-gray-400 overflow-x-auto">
                {JSON.stringify(tempData, null, 2)}
              </pre>
            </div>
          ) : showPasswordChange ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md mx-auto">
              <h2 className="text-2xl font-bold mb-4 gradient-text">Şifre Değiştir</h2>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Yeni Şifre
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
                    placeholder="Yeni şifrenizi girin"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Şifre Tekrarı
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
                    placeholder="Şifrenizi tekrar girin"
                    required
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Şifreyi Değiştir
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPasswordChange(false)}
                    className="flex-1 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    İptal
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <>
              {activeTab === 'hero' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold gradient-text">Hero Bölümü</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Ad
                      </label>
                      <input
                        type="text"
                        value={tempData.hero.name}
                        onChange={(e) => handleEdit('hero', 'name', e.target.value)}
                        className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Ünvan
                      </label>
                      <input
                        type="text"
                        value={tempData.hero.title}
                        onChange={(e) => handleEdit('hero', 'title', e.target.value)}
                        className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Slogan
                      </label>
                      <textarea
                        value={tempData.hero.slogan}
                        onChange={(e) => handleEdit('hero', 'slogan', e.target.value)}
                        className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'about' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold gradient-text">Hakkımda Bölümü</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Başlık
                      </label>
                      <input
                        type="text"
                        value={tempData.about.title}
                        onChange={(e) => handleEdit('about', 'title', e.target.value)}
                        className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Açıklama
                      </label>
                      <textarea
                        value={tempData.about.description}
                        onChange={(e) => handleEdit('about', 'description', e.target.value)}
                        className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
                        rows={6}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Yetenekler (virgülle ayırın)
                      </label>
                      <input
                        type="text"
                        value={tempData.about.skills}
                        onChange={(e) => handleEdit('about', 'skills', e.target.value)}
                        className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'skills' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold gradient-text">Yetenekler Bölümü</h2>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Başlık
                    </label>
                    <input
                      type="text"
                      value={tempData.skills.title}
                      onChange={(e) => handleEdit('skills', 'title', e.target.value)}
                      className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg mb-6"
                    />
                  </div>
                  
                  {tempData.skills.categories.map((category, catIndex) => (
                    <div key={catIndex} className="mb-8 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Kategori Adı
                        </label>
                        <input
                          type="text"
                          value={category.name}
                          onChange={(e) => {
                            const newCategories = [...tempData.skills.categories];
                            newCategories[catIndex].name = e.target.value;
                            setTempData(prev => ({ ...prev, skills: { ...prev.skills, categories: newCategories } }));
                          }}
                          className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
                        />
                      </div>
                      
                      <div className="space-y-3">
                        {category.items.map((skill, skillIndex) => (
                          <div key={skillIndex} className="flex gap-3">
                            <input
                              type="text"
                              value={skill.name}
                              onChange={(e) => {
                                const newCategories = [...tempData.skills.categories];
                                newCategories[catIndex].items[skillIndex].name = e.target.value;
                                setTempData(prev => ({ ...prev, skills: { ...prev.skills, categories: newCategories } }));
                              }}
                              className="flex-1 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
                              placeholder="Yetenek adı"
                            />
                            <input
                              type="number"
                              value={skill.level}
                              onChange={(e) => {
                                const newCategories = [...tempData.skills.categories];
                                newCategories[catIndex].items[skillIndex].level = parseInt(e.target.value);
                                setTempData(prev => ({ ...prev, skills: { ...prev.skills, categories: newCategories } }));
                              }}
                              className="w-20 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
                              placeholder="Seviye"
                              min="0"
                              max="100"
                            />
                            <span className="flex items-center text-gray-500">%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'projects' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold gradient-text">Projeler Bölümü</h2>
                    <button
                      onClick={addProject}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <FaPlus size={14} />
                      Proje Ekle
                    </button>
                  </div>
                  
                  <div className="space-y-6">
                    {tempData.projects.map((project, index) => (
                      <div key={project.id} className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-lg font-semibold">Proje {index + 1}</h3>
                          <button
                            onClick={() => deleteProject(index)}
                            className="text-red-600 hover:text-red-700 transition-colors"
                          >
                            <FaTrash size={16} />
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Başlık
                            </label>
                            <input
                              type="text"
                              value={project.title}
                              onChange={(e) => handleNestedEdit('projects', index, 'title', e.target.value)}
                              className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Görsel
                            </label>
                            <input
                              type="text"
                              value={project.image}
                              onChange={(e) => handleNestedEdit('projects', index, 'image', e.target.value)}
                              className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              GitHub
                            </label>
                            <input
                              type="text"
                              value={project.github}
                              onChange={(e) => handleNestedEdit('projects', index, 'github', e.target.value)}
                              className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Demo
                            </label>
                            <input
                              type="text"
                              value={project.demo || ''}
                              onChange={(e) => handleNestedEdit('projects', index, 'demo', e.target.value)}
                              className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Açıklama
                            </label>
                            <textarea
                              value={project.description}
                              onChange={(e) => handleNestedEdit('projects', index, 'description', e.target.value)}
                              className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
                              rows={3}
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Teknolojiler (virgülle ayırın)
                            </label>
                            <input
                              type="text"
                              value={project.technologies.join(', ')}
                              onChange={(e) => handleNestedEdit('projects', index, 'technologies', e.target.value.split(', ').map(t => t.trim()))}
                              className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'experience' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold gradient-text">Deneyim Bölümü</h2>
                    <button
                      onClick={addExperience}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <FaPlus size={14} />
                      Deneyim Ekle
                    </button>
                  </div>
                  
                  <div className="space-y-6">
                    {tempData.experience.map((exp, index) => (
                      <div key={exp.id} className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-lg font-semibold">Deneyim {index + 1}</h3>
                          <button
                            onClick={() => deleteExperience(index)}
                            className="text-red-600 hover:text-red-700 transition-colors"
                          >
                            <FaTrash size={16} />
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Pozisyon
                            </label>
                            <input
                              type="text"
                              value={exp.title}
                              onChange={(e) => handleNestedEdit('experience', index, 'title', e.target.value)}
                              className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Şirket
                            </label>
                            <input
                              type="text"
                              value={exp.company}
                              onChange={(e) => handleNestedEdit('experience', index, 'company', e.target.value)}
                              className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Periyot
                            </label>
                            <input
                              type="text"
                              value={exp.period}
                              onChange={(e) => handleNestedEdit('experience', index, 'period', e.target.value)}
                              className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Açıklama
                            </label>
                            <textarea
                              value={exp.description}
                              onChange={(e) => handleNestedEdit('experience', index, 'description', e.target.value)}
                              className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
                              rows={3}
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Başarılar (her satıra bir başarı)
                            </label>
                            <textarea
                              value={exp.achievements.join('\n')}
                              onChange={(e) => handleNestedEdit('experience', index, 'achievements', e.target.value.split('\n').filter(a => a.trim()))}
                              className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
                              rows={4}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'contact' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold gradient-text">İletişim Bölümü</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Başlık
                      </label>
                      <input
                        type="text"
                        value={tempData.contact.title}
                        onChange={(e) => handleEdit('contact', 'title', e.target.value)}
                        className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Açıklama
                      </label>
                      <textarea
                        value={tempData.contact.description}
                        onChange={(e) => handleEdit('contact', 'description', e.target.value)}
                        className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
                        rows={4}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        E-posta
                      </label>
                      <input
                        type="email"
                        value={tempData.contact.email}
                        onChange={(e) => handleEdit('contact', 'email', e.target.value)}
                        className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
                      />
                    </div>
                    
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold mb-4">Sosyal Medya Linkleri</h3>
                      {tempData.contact.social.map((social, index) => (
                        <div key={index} className="flex gap-3 mb-3">
                          <input
                            type="text"
                            value={social.name}
                            onChange={(e) => {
                              const newSocial = [...tempData.contact.social];
                              newSocial[index].name = e.target.value;
                              setTempData(prev => ({ ...prev, contact: { ...prev.contact, social: newSocial } }));
                            }}
                            className="flex-1 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
                            placeholder="Platform adı"
                          />
                          <input
                            type="text"
                            value={social.url}
                            onChange={(e) => {
                              const newSocial = [...tempData.contact.social];
                              newSocial[index].url = e.target.value;
                              setTempData(prev => ({ ...prev, contact: { ...prev.contact, social: newSocial } }));
                            }}
                            className="flex-1 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
                            placeholder="URL"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'files' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold gradient-text">Dosya Yönetimi</h2>
              
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">TXT Dosyaları</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Versiyon Kontrolü
                      </label>
                      <textarea
                        value={tempData.files?.vers_kontrolu || ''}
                        onChange={(e) => handleEdit('files', 'vers_kontrolu', e.target.value)}
                        className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
                        rows={3}
                        placeholder="Versiyon kontrolü içeriği..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Billboard Versiyon Kontrolü
                      </label>
                      <textarea
                        value={tempData.files?.vers_kontroluBillboard || ''}
                        onChange={(e) => handleEdit('files', 'vers_kontroluBillboard', e.target.value)}
                        className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
                        rows={3}
                        placeholder="Billboard versiyon kontrolü içeriği..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        CBS Versiyon Kontrolü
                      </label>
                      <textarea
                        value={tempData.files?.vers_kontroluCBS || ''}
                        onChange={(e) => handleEdit('files', 'vers_kontroluCBS', e.target.value)}
                        className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
                        rows={3}
                        placeholder="CBS versiyon kontrolü içeriği..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Excel Arama Versiyon Kontrolü
                      </label>
                      <textarea
                        value={tempData.files?.vers_kontroluExcelArama || ''}
                        onChange={(e) => handleEdit('files', 'vers_kontroluExcelArama', e.target.value)}
                        className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
                        rows={3}
                        placeholder="Excel arama versiyon kontrolü içeriği..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Tespit Kontrol Versiyon Kontrolü
                      </label>
                      <textarea
                        value={tempData.files?.vers_kontroluTespitKontrol || ''}
                        onChange={(e) => handleEdit('files', 'vers_kontroluTespitKontrol', e.target.value)}
                        className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
                        rows={3}
                        placeholder="Tespit kontrol versiyon kontrolü içeriği..."
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">ZIP Dosyaları</h3>
                  <div className="space-y-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <p className="mb-2">ZIP dosyaları doğrudan URL ile erişilebilir:</p>
                      <ul className="space-y-1">
                        <li>• BillboardReklam.zip - <a href="/BillboardReklam.zip" target="_blank" className="text-blue-600 hover:underline">İndir</a></li>
                        <li>• DosyaArsivlemeZip.zip - <a href="/DosyaArsivlemeZip.zip" target="_blank" className="text-blue-600 hover:underline">İndir</a></li>
                        <li>• ExcelArama.zip - <a href="/ExcelArama.zip" target="_blank" className="text-blue-600 hover:underline">İndir</a></li>
                        <li>• ExcelAramaLink.zip - <a href="/ExcelAramaLink.zip" target="_blank" className="text-blue-600 hover:underline">İndir</a></li>
                        <li>• TespitKontrol.zip - <a href="/TespitKontrol.zip" target="_blank" className="text-blue-600 hover:underline">İndir</a></li>
                        <li>• YalovaCBS.zip - <a href="/YalovaCBS.zip" target="_blank" className="text-blue-600 hover:underline">İndir</a></li>
                      </ul>
                    </div>
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
