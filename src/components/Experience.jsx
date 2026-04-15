'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FaBriefcase, FaCalendarAlt, FaMapMarkerAlt, FaCheckCircle } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { portfolioData } from '@/data/portfolioData';

const Experience = () => {
  const [experience, setExperience] = useState(portfolioData.experience);
  const [mounted, setMounted] = useState(false);
  
  // localStorage değişikliklerini dinle
  useEffect(() => {
    const updateData = () => {
      const saved = localStorage.getItem('portfolioData');
      if (saved) {
        const data = JSON.parse(saved);
        setExperience(data.experience);
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
        staggerChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { x: -50, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: [0.6, -0.05, 0.01, 0.99]
      }
    }
  };

  const lineVariants = {
    hidden: { scaleY: 0 },
    visible: {
      scaleY: 1,
      transition: {
        duration: 1,
        ease: "easeOut"
      }
    }
  };

  return (
    <section id="experience" className="py-20 bg-gray-50 dark:bg-gray-800">
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
            <span className="gradient-text">Deneyim</span>
          </motion.h2>
          <motion.div 
            variants={itemVariants}
            className="w-24 h-1 bg-gradient-to-r from-primary to-secondary mx-auto mb-8"
          />
          <motion.p 
            variants={itemVariants}
            className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
          >
            Profesyonel kariyerim boyunca edindiğim deneyimler ve çalıştığım projeler
          </motion.p>
        </motion.div>

        <div className="relative">
          <motion.div
            variants={lineVariants}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className="absolute left-8 md:left-1/2 transform md:-translate-x-1/2 w-0.5 h-full bg-gradient-to-b from-primary to-secondary"
          />

          <div className="space-y-12">
            {experience.map((exp, index) => (
              <motion.div
                key={exp.id}
                variants={itemVariants}
                className={`relative flex items-center ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                <div className={`flex-1 ${index % 2 === 0 ? 'md:pr-8 md:text-right' : 'md:pl-8'}`}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <div className="flex items-center mb-4 md:justify-end">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white">
                        <FaBriefcase size={20} />
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                      {exp.title}
                    </h3>
                    
                    <div className={`flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3 md:justify-end`}>
                      <div className="flex items-center gap-1">
                        <FaMapMarkerAlt size={12} />
                        <span>{exp.company}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FaCalendarAlt size={12} />
                        <span>{exp.period}</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      {exp.description}
                    </p>
                    
                    <div className="space-y-2">
                      {exp.achievements.map((achievement, achIndex) => (
                        <div key={achIndex} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 md:justify-end">
                          <FaCheckCircle className="text-green-500 flex-shrink-0" size={14} />
                          <span>{achievement}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>

                <div className="absolute left-8 transform -translate-x-1/2 w-4 h-4 bg-white dark:bg-gray-900 border-4 border-primary rounded-full md:left-1/2">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity,
                      delay: index * 0.5
                    }}
                    className="absolute inset-0 bg-primary rounded-full opacity-30"
                  />
                </div>

                <div className="flex-1 hidden md:block"></div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          variants={itemVariants}
          className="mt-16 text-center"
        >
          <motion.a
            href="/cv.html"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 px-8 py-3 bg-white dark:bg-gray-900 border-2 border-primary text-primary rounded-full font-medium hover:bg-primary hover:text-white transition-all"
          >
            <FaCalendarAlt size={20} />
            Tam CV İndir
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
};

export default Experience;
