import { FaGithub, FaLinkedin, FaTwitter, FaEnvelope, FaHeart } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  const socialLinks = [
    { name: 'GitHub', icon: FaGithub, url: 'https://github.com/birolsanli' },
    { name: 'LinkedIn', icon: FaLinkedin, url: 'https://linkedin.com/in/birolsanli' },
    { name: 'Twitter', icon: FaTwitter, url: 'https://twitter.com/birolsanli' },
    { name: 'Email', icon: FaEnvelope, url: 'mailto:cozumleyici@outlook.com' }
  ];

  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4 gradient-text">Birols.com</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Modern web çözümleriyle dijital geleceği şekillendiren Full Stack Developer.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors"
                  aria-label={social.name}
                >
                  <social.icon size={20} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Hızlı Linkler</h3>
            <ul className="space-y-2">
              <li>
                <a href="#home" className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors">
                  Ana Sayfa
                </a>
              </li>
              <li>
                <a href="#about" className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors">
                  Hakkımda
                </a>
              </li>
              <li>
                <a href="#projects" className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors">
                  Projeler
                </a>
              </li>
              <li>
                <a href="#contact" className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors">
                  İletişim
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">İletişim</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              Yeni projeler ve iş birlikleri için benimle iletişime geçin.
            </p>
            <a 
              href="mailto:cozumleyici@outlook.com" 
              className="text-primary hover:text-secondary transition-colors font-medium"
            >
              cozumleyici@outlook.com
            </a>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 md:mb-0">
              © {currentYear} Birol Sanlı. Tüm hakları saklıdır.
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-sm flex items-center">
              Made with <FaHeart className="mx-2 text-red-500" /> using Next.js & Tailwind CSS
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
