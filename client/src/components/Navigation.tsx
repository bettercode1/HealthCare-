import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import LanguageSwitcher from './LanguageSwitcher';

interface NavigationProps {
  onShowLogin: () => void;
  onScrollToPlans: () => void;
  onScrollToFeatures: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ onShowLogin, onScrollToPlans, onScrollToFeatures }) => {
  const { t } = useTranslation();
  const { currentUser, userData, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Animation variants
  const navVariants = {
    hidden: { y: -100, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  const logoVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };

  const buttonVariants = {
    hover: { 
      scale: 1.05,
      transition: { type: "spring", stiffness: 400, damping: 10 }
    },
    tap: { scale: 0.95 }
  };

  return (
    <motion.nav 
      className="bg-white shadow-lg border-b border-gray-200 fixed w-full top-0 z-50"
      variants={navVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between h-auto sm:h-16 py-2 sm:py-0">
          <motion.div 
            className="flex items-center"
            variants={logoVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div 
              className="flex-shrink-0 flex items-center"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <motion.span 
                className="material-icons text-3xl mr-2" 
                style={{ color: 'hsl(207, 90%, 54%)' }}
                animate={{ 
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
              >
                local_hospital
              </motion.span>
              <motion.span 
                className="text-xl font-bold text-gray-900"
                whileHover={{ color: "hsl(207, 90%, 54%)" }}
                transition={{ duration: 0.3 }}
              >
                {t('healthcarePro')}
              </motion.span>
            </motion.div>
          </motion.div>
          
          {currentUser && userData ? (
            <motion.div 
              className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={itemVariants}>
                <LanguageSwitcher />
              </motion.div>
              
              <motion.div 
                className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2 text-center sm:text-left"
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <motion.span 
                  className="material-icons text-gray-600"
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                >
                  account_circle
                </motion.span>
                <span className="text-gray-700 font-medium">{userData.email}</span>
                <motion.span 
                  className="px-2 py-1 text-white text-xs rounded-full capitalize"
                  style={{ backgroundColor: 'hsl(207, 90%, 54%)' }}
                  whileHover={{ 
                    scale: 1.1,
                    backgroundColor: 'hsl(207, 90%, 60%)'
                  }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  {userData.role}
                </motion.span>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <Button 
                  variant="ghost" 
                  onClick={handleLogout} 
                  className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors relative overflow-hidden group"
                >
                  <motion.span
                    className="absolute inset-0 bg-gray-100 opacity-0 group-hover:opacity-100"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.3 }}
                  />
                  <span className="material-icons mr-1 relative z-10">logout</span>
                  <span className="relative z-10">{t('logout')}</span>
                </Button>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div 
              className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={itemVariants}>
                <LanguageSwitcher />
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Button 
                    variant="ghost" 
                    onClick={onScrollToPlans} 
                    className="text-gray-600 hover:text-gray-900 relative overflow-hidden group"
                  >
                    <motion.span
                      className="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-100"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "100%" }}
                      transition={{ duration: 0.3 }}
                    />
                    <span className="relative z-10">{t('plans')}</span>
                  </Button>
                </motion.div>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Button 
                    variant="ghost" 
                    onClick={onScrollToFeatures} 
                    className="text-gray-600 hover:text-gray-900 relative overflow-hidden group"
                  >
                    <motion.span
                      className="absolute inset-0 bg-green-50 opacity-0 group-hover:opacity-100"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "100%" }}
                      transition={{ duration: 0.3 }}
                    />
                    <span className="relative z-10">{t('features')}</span>
                  </Button>
                </motion.div>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <motion.div
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <Button 
                    onClick={onShowLogin} 
                    className="text-white hover:bg-blue-700 shadow-md hover:shadow-lg px-6 py-2 font-medium bg-blue-600 relative overflow-hidden group"
                  >
                    <motion.span
                      className="absolute inset-0 bg-blue-500 opacity-0 group-hover:opacity-100"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "100%" }}
                      transition={{ duration: 0.4 }}
                    />
                    <span className="relative z-10">{t('login')}</span>
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

// Container variants for staggered animation
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
};

export default Navigation;
