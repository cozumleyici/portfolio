'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useState, useEffect } from 'react';
import { FaCode, FaLightbulb, FaRocket } from 'react-icons/fa';
import { portfolioData } from '@/data/portfolioData';

const About = () => {
  const [about, setAbout] = useState(portfolioData.about);
  const [mounted, setMounted] = useState(false);
  
  // localStorage değişikliklerini dinle
  useEffect(() => {
    const updateData = () => {
      const saved = localStorage.getItem('portfolioData');
      if (saved) {
        const data = JSON.parse(saved);
        setAbout(data.about);
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
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

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
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: [0.6, -0.05, 0.01, 0.99]
      }
    }
  };

  const features = [
    {
      icon: FaCode,
      title: "Temiz Kod",
      description: "Okunabilir, sürdürülebilir ve en iyi pratiklere uygun kod yazıyorum."
    },
    {
      icon: FaLightbulb,
      title: "Yenilikçi Çözümler",
      description: "Karmaşık problemlere yaratıcı ve etkili çözümler üretiyorum."
    },
    {
      icon: FaRocket,
      title: "Performans Odaklı",
      description: "Hızlı ve optimize edilmiş kullanıcı deneyimleri sunuyorum."
    }
  ];

  return (
    <section id="about" className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="text-center mb-16"
        >
          <motion.h2 
            variants={itemVariants}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            <span className="gradient-text">{about.title}</span>
          </motion.h2>
          <motion.div 
            variants={itemVariants}
            className="w-24 h-1 bg-gradient-to-r from-primary to-secondary mx-auto mb-8"
          />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
          >
            <motion.div variants={itemVariants} className="mb-8">
              <div className="relative">
                <div className="w-64 h-64 mx-auto lg:mx-0 rounded-2xl bg-gradient-to-br from-primary to-secondary p-1">
                  <div className="w-full h-full bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-32 h-32 mx-auto bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                        <span className="text-4xl font-bold gradient-text">BS</span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 font-medium">Full Stack Developer</p>
                    </div>
                  </div>
                </div>
                <motion.div
                  animate={{ 
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ 
                    duration: 4, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute -top-4 -right-4 w-20 h-20 bg-accent rounded-full flex items-center justify-center text-white font-bold"
                >
                  5+ Yıl
                </motion.div>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className="space-y-6"
          >
            <motion.p variants={itemVariants} className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              {about.description}
            </motion.p>

            <motion.div variants={itemVariants} className="mb-8">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Ana Yetenekler</h3>
              <div className="flex flex-wrap gap-2">
                {about.skills.split(', ').map((skill, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium hover:bg-primary hover:text-white transition-colors cursor-default"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  whileHover={{ y: -5 }}
                  className="text-center p-6 bg-gray-50 dark:bg-gray-800 rounded-xl hover:shadow-lg transition-shadow"
                >
                  <div className="w-12 h-12 mx-auto mb-4 bg-primary rounded-full flex items-center justify-center text-white">
                    <feature.icon size={20} />
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
