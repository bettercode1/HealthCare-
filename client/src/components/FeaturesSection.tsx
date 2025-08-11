import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Pill, 
  Upload, 
  FileText, 
  Users, 
  Shield, 
  Bell, 
  Calendar, 
  MessageCircle,
  Zap,
  TrendingUp,
  Lock,
  RefreshCw
} from 'lucide-react';

const FeaturesSection: React.FC = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: Brain,
      titleKey: 'aiHealthReportAnalysis',
      descriptionKey: 'aiHealthReportAnalysisDesc',
      color: 'bg-blue-500'
    },
    {
      icon: Pill,
      titleKey: 'doseTrackingSystem',
      descriptionKey: 'doseTrackingSystemDesc',
      color: 'bg-green-500'
    },
    {
      icon: Upload,
      titleKey: 'secureReportUpload',
      descriptionKey: 'secureReportUploadDesc',
      color: 'bg-purple-500'
    },
    {
      icon: FileText,
      titleKey: 'prescriptionManagement',
      descriptionKey: 'prescriptionManagementDesc',
      color: 'bg-orange-500'
    },
    {
      icon: Users,
      titleKey: 'familyMemberProfiles',
      descriptionKey: 'familyMemberProfilesDesc',
      color: 'bg-pink-500'
    },
    {
      icon: Shield,
      titleKey: 'roleBasedAccess',
      descriptionKey: 'roleBasedAccessDesc',
      color: 'bg-indigo-500'
    },
    {
      icon: Bell,
      titleKey: 'aiRecommendationsAlerts',
      descriptionKey: 'aiRecommendationsAlertsDesc',
      color: 'bg-red-500'
    },
    {
      icon: Calendar,
      titleKey: 'appointmentScheduling',
      descriptionKey: 'appointmentSchedulingDesc',
      color: 'bg-teal-500'
    },
    {
      icon: MessageCircle,
      titleKey: 'healthcareChatbot',
      descriptionKey: 'healthcareChatbotDesc',
      color: 'bg-violet-500'
    }
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const headerVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.95
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

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      scale: 0.9
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  return (
    <section id="features-section" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        {/* Header with Animation */}
        <motion.div 
          className="text-center mb-12"
          variants={headerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.h2 
            className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Powerful Features
          </motion.h2>
          <motion.p 
            className="text-lg text-gray-600 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            Everything you need for comprehensive healthcare management
          </motion.p>
        </motion.div>
        
        {/* Features Grid with Staggered Animation */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              whileHover={{ 
                y: -8,
                scale: 1.02,
                transition: { type: "spring", stiffness: 300, damping: 20 }
              }}
              whileTap={{ scale: 0.98 }}
            >
              <Card className="features-section-card">
                {/* Background gradient effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.8 }}
                />
                
                <CardContent className="p-8 relative z-10">
                  <motion.div 
                    className="flex items-center justify-center mb-8"
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <motion.div 
                      className={`features-section-icon-container ${feature.color}`}
                      whileHover={{ 
                        scale: 1.1,
                        rotate: [0, 5, -5, 0],
                        transition: { duration: 0.6 }
                      }}
                    >
                      {/* Icon background animation */}
                      <motion.div
                        className="features-section-icon-bg"
                        initial={{ scale: 0 }}
                        whileHover={{ scale: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                      
                      <motion.div
                        className="features-section-icon"
                        animate={{ 
                          rotate: [0, 2, -2, 0],
                          scale: [1, 1.05, 1]
                        }}
                        transition={{ 
                          duration: 4, 
                          repeat: Infinity, 
                          ease: "easeInOut",
                          delay: index * 0.2
                        }}
                      >
                        <feature.icon className="w-10 h-10 text-white drop-shadow-lg" />
                      </motion.div>
                    </motion.div>
                  </motion.div>
                  
                  <motion.h3 
                    className="text-xl font-bold text-gray-900 mb-4 text-center"
                    whileHover={{ color: "#3B82F6" }}
                    transition={{ duration: 0.3 }}
                  >
                    {t(feature.titleKey)}
                  </motion.h3>
                  
                  <motion.p 
                    className="text-gray-600 text-base text-center leading-relaxed"
                    whileHover={{ color: "#4B5563" }}
                    transition={{ duration: 0.3 }}
                  >
                    {t(feature.descriptionKey)}
                  </motion.p>
                </CardContent>
                
                {/* Card border glow effect */}
                <motion.div
                  className="absolute inset-0 rounded-lg border-2 border-transparent"
                  whileHover={{ 
                    borderColor: "#3B82F6",
                    boxShadow: "0 0 30px rgba(59, 130, 246, 0.4)"
                  }}
                  transition={{ duration: 0.3 }}
                />
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom decorative element */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="inline-block w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
            animate={{ 
              scaleX: [1, 1.2, 1],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          />
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
