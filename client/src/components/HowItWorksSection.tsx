import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { 
  UserPlus, 
  Users, 
  Upload, 
  Brain, 
  Calendar, 
  MessageCircle,
  ArrowRight,
  CheckCircle,
  Play,
  Target
} from 'lucide-react';

const HowItWorksSection: React.FC = () => {
  const { t } = useTranslation();

  const steps = [
    {
      number: 1,
      icon: UserPlus,
      titleKey: 'signUp',
      descriptionKey: 'signUpDesc',
      color: 'bg-blue-500'
    },
    {
      number: 2,
      icon: Users,
      titleKey: 'chooseRole',
      descriptionKey: 'chooseRoleDesc',
      color: 'bg-green-500'
    },
    {
      number: 3,
      icon: Upload,
      titleKey: 'uploadReports',
      descriptionKey: 'uploadReportsDesc',
      color: 'bg-purple-500'
    },
    {
      number: 4,
      icon: Brain,
      titleKey: 'useAiTools',
      descriptionKey: 'useAiToolsDesc',
      color: 'bg-orange-500'
    },
    {
      number: 5,
      icon: Calendar,
      titleKey: 'trackSchedule',
      descriptionKey: 'trackScheduleDesc',
      color: 'bg-pink-500'
    },
    {
      number: 6,
      icon: MessageCircle,
      titleKey: 'getSupport',
      descriptionKey: 'getSupportDesc',
      color: 'bg-indigo-500'
    }
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
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

  const stepVariants = {
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

  const numberVariants = {
    hidden: { 
      scale: 0,
      rotate: -180
    },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 15
      }
    }
  };

  return (
    <section className="py-20 bg-gradient-to-br from-green-50 to-blue-50 overflow-hidden">
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
            Simple Steps
          </motion.h2>
          <motion.p 
            className="text-lg text-gray-600 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            Get started with your healthcare journey in just a few simple steps
          </motion.p>
        </motion.div>
        
        {/* Steps Grid with Staggered Animation */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              variants={stepVariants}
              whileHover={{ 
                y: -8,
                scale: 1.02,
                transition: { type: "spring", stiffness: 300, damping: 20 }
              }}
              whileTap={{ scale: 0.98 }}
            >
              <Card className="group h-full hover:shadow-2xl transition-all duration-500 border-2 border-gray-200 bg-white/90 backdrop-blur-sm relative overflow-hidden">
                {/* Background gradient effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.8 }}
                />
                
                <CardContent className="p-6 relative z-10">
                  <motion.div 
                    className="flex items-center justify-center mb-6"
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <motion.div 
                      className={`w-12 h-12 ${step.color} rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden`}
                      whileHover={{ 
                        scale: 1.1,
                        rotate: [0, 5, -5, 0],
                        transition: { duration: 0.6 }
                      }}
                    >
                      {/* Icon background animation */}
                      <motion.div
                        className="absolute inset-0 bg-white/20"
                        initial={{ scale: 0 }}
                        whileHover={{ scale: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                      
                      <motion.div
                        className="relative z-10"
                        animate={{ 
                          rotate: [0, 2, -2, 0],
                          scale: [1, 1.05, 1]
                        }}
                        transition={{ 
                          duration: 4, 
                          repeat: Infinity, 
                          ease: "easeInOut",
                          delay: index * 0.3
                        }}
                      >
                        <step.icon className="w-6 h-6 text-white" />
                      </motion.div>
                    </motion.div>
                  </motion.div>
                  
                  <div className="text-center">
                    <motion.div 
                      className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-white text-sm font-bold mx-auto mb-3 shadow-lg relative overflow-hidden"
                      variants={numberVariants}
                      whileHover={{ 
                        scale: 1.2,
                        backgroundColor: "#4B5563",
                        transition: { type: "spring", stiffness: 400 }
                      }}
                    >
                      {/* Number background animation */}
                      <motion.div
                        className="absolute inset-0 bg-white/20"
                        initial={{ scale: 0 }}
                        whileHover={{ scale: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                      <span className="relative z-10">{step.number}</span>
                    </motion.div>
                    
                    <motion.h3 
                      className="text-lg font-semibold text-gray-900 mb-3"
                      whileHover={{ color: "#3B82F6" }}
                      transition={{ duration: 0.3 }}
                    >
                      {t(step.titleKey)}
                    </motion.h3>
                    
                    <motion.p 
                      className="text-gray-600 text-sm leading-relaxed"
                      whileHover={{ color: "#4B5563" }}
                      transition={{ duration: 0.3 }}
                    >
                      {t(step.descriptionKey)}
                    </motion.p>
                  </div>
                </CardContent>
                
                {/* Card border glow effect */}
                <motion.div
                  className="absolute inset-0 rounded-lg border-2 border-transparent"
                  whileHover={{ 
                    borderColor: "#3B82F6",
                    boxShadow: "0 0 20px rgba(59, 130, 246, 0.3)"
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
            className="inline-flex items-center gap-4"
            animate={{ 
              scale: [1, 1.05, 1],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          >
            <div className="w-16 h-1 bg-gradient-to-r from-green-500 to-blue-500 rounded-full" />
            <motion.div
              className="w-4 h-4 bg-blue-500 rounded-full"
              animate={{ 
                scale: [1, 1.3, 1],
                backgroundColor: ["#3B82F6", "#10B981", "#3B82F6"]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            />
            <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-green-500 rounded-full" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
