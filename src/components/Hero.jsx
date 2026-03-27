'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { FaGithub, FaLinkedin, FaTwitter, FaDownload } from 'react-icons/fa';
import { portfolioData } from '@/data/portfolioData';

const Hero = () => {
  const [hero, setHero] = useState(portfolioData.hero);
  
  // localStorage değişikliklerini dinle
  useEffect(() => {
    const updateData = () => {
      const saved = localStorage.getItem('portfolioData');
      if (saved) {
        const data = JSON.parse(saved);
        setHero(data.hero);
      }
    };
    
    // İlk yükleme
    updateData();
    
    // Custom storage event'ini dinle
    window.addEventListener('portfolioDataUpdated', updateData);
    
    return () => {
      window.removeEventListener('portfolioDataUpdated', updateData);
    };
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: [0.6, -0.05, 0.01, 0.99]
      }
    }
  };

  const socialLinks = [
    { icon: FaGithub, url: 'https://github.com/birolsanli', label: 'GitHub' },
    { icon: FaLinkedin, url: 'https://linkedin.com/in/birolsanli', label: 'LinkedIn' },
    { icon: FaTwitter, url: 'https://twitter.com/birolsanli', label: 'Twitter' }
  ];

  return (
    <section id="home" className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center"
        >
          <motion.div variants={itemVariants} className="mb-6">
            <div className="inline-block p-1 bg-gradient-to-r from-primary to-secondary rounded-full">
              <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <span className="text-4xl font-bold gradient-text">BS</span>
              </div>
            </div>
          </motion.div>

          <motion.h1 
            variants={itemVariants}
            className="text-5xl md:text-7xl font-bold mb-6"
          >
            <span className="text-gray-900 dark:text-white">Merhaba, ben </span>
            <span className="gradient-text">{hero.name}</span>
          </motion.h1>

          <motion.div variants={itemVariants} className="mb-6">
            <h2 className="text-2xl md:text-4xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
              {hero.title}
            </h2>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {hero.slogan}
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            {hero.ctaButtons.map((button, index) => (
              <motion.a
                key={index}
                href={button.href}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-8 py-3 rounded-full font-medium transition-all duration-300 ${
                  index === 0 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:shadow-blue-500/25' 
                    : 'border-2 border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white'
                }`}
              >
                {button.text}
              </motion.a>
            ))}
          </motion.div>

          <motion.div variants={itemVariants} className="flex justify-center items-center space-x-6 mb-8">
            {socialLinks.map((social, index) => (
              <motion.a
                key={index}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                whileHover={{ y: -3, scale: 1.1 }}
                className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors"
              >
                <social.icon size={24} />
              </motion.a>
            ))}
          </motion.div>

          <motion.div variants={itemVariants}>
            <motion.a
              href="/cv.html"
              whileHover={{ scale: 1.05 }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <FaDownload size={16} />
              CV İndir
            </motion.a>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-6 h-10 border-2 border-gray-300 dark:border-gray-600 rounded-full flex justify-center"
          >
            <div className="w-1 h-3 bg-gray-300 dark:bg-gray-600 rounded-full mt-2"></div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
