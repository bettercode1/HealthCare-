import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface HeroSectionProps {
  onGoToDashboard: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onGoToDashboard }) => {
  const { t } = useTranslation();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.9
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const pulseVariants = {
    animate: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Parallax Effect */}
      <motion.div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&h=1080')"
        }}
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      />
      
      {/* Gradient Overlay with Animation */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-primary/80 via-primary/60 to-secondary/80"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: 0.5 }}
      />
      
      {/* Additional dark overlay */}
      <motion.div 
        className="absolute inset-0 bg-black/30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.8 }}
      />
      
      {/* Floating Decorative Elements */}
      <motion.div
        className="absolute top-20 left-20 w-4 h-4 bg-yellow-300 rounded-full opacity-60"
        variants={floatingVariants}
        animate="animate"
      />
      <motion.div
        className="absolute top-40 right-32 w-3 h-3 bg-blue-300 rounded-full opacity-50"
        variants={floatingVariants}
        animate="animate"
        style={{ animationDelay: "2s" }}
      />
      <motion.div
        className="absolute bottom-40 left-32 w-2 h-2 bg-green-300 rounded-full opacity-40"
        variants={floatingVariants}
        animate="animate"
        style={{ animationDelay: "4s" }}
      />
      
      {/* Content Container */}
      <motion.div 
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="text-center space-y-8">
          {/* Main Heading with Staggered Animation */}
          <motion.div className="space-y-4" variants={itemVariants}>
            <motion.h1 
              className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white leading-tight"
              variants={itemVariants}
            >
              {t('heroTitle')}
            </motion.h1>
            <motion.h2 
              className="text-3xl sm:text-4xl lg:text-6xl font-bold text-yellow-300 leading-tight"
              variants={itemVariants}
            >
              {t('heroSubtitle')}
            </motion.h2>
          </motion.div>
          
          {/* Subtitle */}
          <motion.p 
            className="text-lg sm:text-xl lg:text-2xl text-white/90 max-w-4xl mx-auto leading-relaxed font-medium"
            variants={itemVariants}
          >
            {t('heroDescription')}
          </motion.p>
          
          {/* Call to Action Button with Hover Effects */}
          <motion.div 
            className="flex justify-center items-center pt-8"
            variants={itemVariants}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Button 
                onClick={onGoToDashboard}
                size="lg"
                className="bg-white hover:bg-gray-50 text-blue-600 font-semibold px-8 py-4 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 min-w-[250px] border-2 border-white relative overflow-hidden group"
              >
                <motion.span 
                  className="material-icons mr-2 text-blue-600"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  dashboard
                </motion.span>
                {t('goToDashboard')}
                
                {/* Button shine effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.6 }}
                />
              </Button>
            </motion.div>
          </motion.div>
          
          {/* Trust indicators with staggered animation */}
          <motion.div 
            className="pt-8"
            variants={itemVariants}
          >
            <motion.div 
              className="flex flex-wrap justify-center items-center gap-8 text-white/70 text-sm"
              variants={containerVariants}
            >
              {[
                { icon: "security", text: t('hipaaCompliant'), color: "text-green-400" },
                { icon: "verified", text: t('aiPowered'), color: "text-blue-400" },
                { icon: "family_restroom", text: t('familyCare'), color: "text-purple-400" }
              ].map((item, index) => (
                <motion.div 
                  key={index}
                  className="flex items-center gap-2"
                  variants={itemVariants}
                  whileHover={{ scale: 1.1, y: -2 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <motion.span 
                    className={`material-icons ${item.color}`}
                    animate={{ 
                      rotate: [0, 5, -5, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity, 
                      delay: index * 0.5,
                      ease: "easeInOut" 
                    }}
                  >
                    {item.icon}
                  </motion.span>
                  <span>{item.text}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
      
      {/* Decorative elements with animation */}
      <motion.div 
        className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background/20 to-transparent"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 1.5 }}
      />
      
      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 2 }}
      >
        <motion.div
          className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <motion.div
            className="w-1 h-3 bg-white/60 rounded-full mt-2"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
