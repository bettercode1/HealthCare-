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
  Activity,
  TrendingUp,
  Lock
} from 'lucide-react';

const FeaturesSection: React.FC = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: Brain,
      titleKey: 'aiHealthReportAnalysis',
      descriptionKey: 'aiHealthReportAnalysisDesc',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      icon: Pill,
      titleKey: 'doseTrackingSystem',
      descriptionKey: 'doseTrackingSystemDesc',
      color: 'bg-green-100 text-green-600'
    },
    {
      icon: Upload,
      titleKey: 'secureReportUpload',
      descriptionKey: 'secureReportUploadDesc',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      icon: Activity,
      titleKey: 'healthMetricsMonitoring',
      descriptionKey: 'healthMetricsMonitoringDesc',
      color: 'bg-orange-100 text-orange-600'
    },
    {
      icon: Users,
      titleKey: 'familyMemberProfiles',
      descriptionKey: 'familyMemberProfilesDesc',
      color: 'bg-pink-100 text-pink-600'
    },
    {
      icon: Shield,
      titleKey: 'roleBasedAccess',
      descriptionKey: 'roleBasedAccessDesc',
      color: 'bg-indigo-100 text-indigo-600'
    },
    {
      icon: Bell,
      titleKey: 'aiRecommendationsAlerts',
      descriptionKey: 'aiRecommendationsAlertsDesc',
      color: 'bg-red-100 text-red-600'
    },
    {
      icon: Calendar,
      titleKey: 'appointmentScheduling',
      descriptionKey: 'appointmentSchedulingDesc',
      color: 'bg-teal-100 text-teal-600'
    },
    {
      icon: MessageCircle,
      titleKey: 'healthcareChatbot',
      descriptionKey: 'healthcareChatbotDesc',
      color: 'bg-violet-100 text-violet-600'
    }
  ];

  // Simple animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const headerVariants = {
    hidden: { 
      opacity: 0, 
      y: 20
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 20
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <section id="features-section" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        {/* Header */}
        <motion.div 
          className="text-center mb-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          <motion.h2 
            className="text-4xl font-bold text-gray-900 mb-4"
            variants={headerVariants}
          >
            {t('comprehensiveHealthcareFeatures')}
          </motion.h2>
          <motion.p 
            className="text-xl text-gray-600 max-w-3xl mx-auto"
            variants={headerVariants}
          >
            {t('everythingYouNeedForHealthAndFamily')}
          </motion.p>
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
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
                y: -4,
                transition: { duration: 0.2 }
              }}
            >
              <Card className="h-full border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all duration-300">
                <CardContent className="p-6">
                  {/* Icon */}
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg mb-4">
                    <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center`}>
                      <feature.icon className="w-6 h-6" />
                    </div>
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {t(feature.titleKey)}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {t(feature.descriptionKey)}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
