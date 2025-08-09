import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Check, Star, Users, User, Crown } from 'lucide-react';

// Dot Dot Animation Component
const DotDotAnimation: React.FC = () => {
  return (
    <div className="flex justify-center items-center gap-2 mt-4">
      <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
      <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
      <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
    </div>
  );
};

const PlansSection: React.FC = () => {
  const { t } = useTranslation();

  const personalFeatures = [
    t('personalPlanFeature1'),
    t('personalPlanFeature2'),
    t('personalPlanFeature3'),
    t('personalPlanFeature4'),
    t('personalPlanFeature5'),
  ];

  const familyFeatures = [
    t('familyPlanFeature1'),
    t('familyPlanFeature2'),
    t('familyPlanFeature3'),
    t('familyPlanFeature4'),
    t('familyPlanFeature5'),
    t('familyPlanFeature6'),
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
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

  const featureVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };

  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-50 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        {/* Header with Animation */}
        <motion.div 
          className="text-center mb-8"
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
            Choose Your Perfect Plan
          </motion.h2>
          <motion.p 
            className="text-lg text-gray-600 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            Start your healthcare journey with our comprehensive plans designed for individuals and families
          </motion.p>
        </motion.div>

        {/* Plans Grid with Staggered Animation */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {/* Personal Plan */}
          <motion.div
            variants={cardVariants}
            whileHover={{ 
              y: -8,
              scale: 1.02,
              transition: { type: "spring", stiffness: 300, damping: 20 }
            }}
            whileTap={{ scale: 0.98 }}
            className="h-full"
          >
            <Card className="relative border-2 border-blue-200 hover:border-blue-400 transition-all duration-300 hover:shadow-xl bg-white/90 backdrop-blur-sm overflow-hidden group h-full flex flex-col">
              {/* Background gradient effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100"
                initial={{ x: "-100%" }}
                whileHover={{ x: "100%" }}
                transition={{ duration: 0.8 }}
              />
              
              <CardHeader className="text-center pb-6 relative z-10">
                <motion.div 
                  className="flex justify-center mb-6"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <motion.div 
                    className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg relative overflow-hidden"
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
                        ease: "easeInOut"
                      }}
                    >
                      <User className="w-8 h-8 text-white" />
                    </motion.div>
                  </motion.div>
                </motion.div>
                
                <motion.h3 
                  className="text-2xl font-bold text-gray-900 mb-3"
                  whileHover={{ color: "#2563EB" }}
                  transition={{ duration: 0.3 }}
                >
                  {t('personalPlan')}
                </motion.h3>
                
                <motion.div 
                  className="mb-4"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <span className="text-4xl font-bold text-blue-600">₹1,000</span>
                  <span className="text-lg text-gray-500 ml-2">/year</span>
                </motion.div>
                
                <motion.p 
                  className="text-gray-600 text-sm"
                  whileHover={{ color: "#4B5563" }}
                  transition={{ duration: 0.3 }}
                >
                  {t('perfectForIndividuals')}
                </motion.p>
              </CardHeader>
              
              <CardContent className="px-6 pb-6 relative z-10 flex-1 flex flex-col">
                <motion.ul 
                  className="space-y-4 mb-8 flex-1"
                  variants={containerVariants}
                >
                  {personalFeatures.map((feature, index) => (
                    <motion.li 
                      key={index} 
                      className="flex items-center gap-3"
                      variants={featureVariants}
                      whileHover={{ x: 5, transition: { duration: 0.2 } }}
                    >
                      <motion.div 
                        className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0"
                        whileHover={{ scale: 1.2, backgroundColor: "#DCFCE7" }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <Check className="w-3 h-3 text-green-600" />
                      </motion.div>
                      <span className="text-gray-700">{feature}</span>
                    </motion.li>
                  ))}
                </motion.ul>
                
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="mt-auto"
                >
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 rounded-lg relative overflow-hidden group">
                    <motion.span
                      className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-500 opacity-0 group-hover:opacity-100"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "100%" }}
                      transition={{ duration: 0.6 }}
                    />
                    <span className="relative z-10">{t('choosePersonal')}</span>
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Family Plan - Most Popular */}
          <motion.div
            variants={cardVariants}
            animate={{ 
              y: [0, -5, 0],
              scale: [1, 1.01, 1]
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            whileHover={{ 
              y: -12,
              scale: 1.03,
              transition: { type: "spring", stiffness: 300, damping: 20 }
            }}
            whileTap={{ scale: 0.98 }}
            className="h-full relative"
          >
            {/* Special glow effect for most popular */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100"
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0, 0.3, 0]
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            />
            <Card className="relative border-4 border-purple-500 hover:border-purple-600 transition-all duration-300 hover:shadow-2xl bg-gradient-to-br from-white via-purple-50 to-pink-50 overflow-hidden group h-full flex flex-col shadow-xl">
              {/* Enhanced background effects for most popular */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-purple-100/30 via-pink-100/20 to-purple-200/30 opacity-0 group-hover:opacity-100"
                initial={{ x: "-100%" }}
                whileHover={{ x: "100%" }}
                transition={{ duration: 1.2 }}
              />
              <motion.div
                className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                transition={{ duration: 1, delay: 0.8 }}
              />
              {/* Enhanced Popular Badge */}
              <motion.div 
                className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 300, 
                  damping: 20,
                  delay: 0.5 
                }}
                whileHover={{ 
                  scale: 1.1, 
                  rotate: [0, -5, 5, 0],
                  transition: { duration: 0.6 }
                }}
              >
                <div className="relative">
                  {/* Glowing background effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-lg opacity-60 animate-pulse"></div>
                  
                  {/* Main badge */}
                  <Badge className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 text-white px-6 py-3 rounded-full text-sm font-bold shadow-2xl border-4 border-white/90 backdrop-blur-sm">
                    <motion.div
                      animate={{ 
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity, 
                        ease: "easeInOut" 
                      }}
                    >
                      <Star className="w-5 h-5 mr-2 text-yellow-300 drop-shadow-lg" />
                    </motion.div>
                    <span className="drop-shadow-sm">{t('mostPopular')}</span>
                  </Badge>
                  
                  {/* Sparkle effects */}
                  <motion.div
                    className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full"
                    animate={{ 
                      scale: [1, 1.5, 1],
                      opacity: [1, 0.7, 1]
                    }}
                    transition={{ 
                      duration: 1.5, 
                      repeat: Infinity, 
                      ease: "easeInOut" 
                    }}
                  />
                  <motion.div
                    className="absolute -bottom-1 -left-1 w-2 h-2 bg-pink-400 rounded-full"
                    animate={{ 
                      scale: [1, 1.3, 1],
                      opacity: [1, 0.6, 1]
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity, 
                      ease: "easeInOut",
                      delay: 0.5
                    }}
                  />
                </div>
              </motion.div>

              <CardHeader className="text-center pb-6 relative z-10">
                <motion.div 
                  className="flex justify-center mb-6"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <motion.div 
                    className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg relative overflow-hidden"
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
                        delay: 0.5
                      }}
                    >
                      <Users className="w-8 h-8 text-white" />
                    </motion.div>
                  </motion.div>
                </motion.div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {t('familyPlan')}
                </h3>
                
                <motion.div 
                  className="mb-4 relative"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  {/* Special pricing highlight for most popular */}
                  <div className="absolute -inset-2 bg-gradient-to-r from-purple-200 to-pink-200 rounded-lg blur-sm opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
                  <div className="relative bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-purple-200/50">
                    <span className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      ₹2,500
                    </span>
                    <span className="text-lg text-gray-500 ml-2">/year</span>
                    <motion.div
                      className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center"
                      animate={{ 
                        scale: [1, 1.2, 1],
                        rotate: [0, 180, 360]
                      }}
                      transition={{ 
                        duration: 3, 
                        repeat: Infinity, 
                        ease: "easeInOut" 
                      }}
                    >
                      <span className="text-xs font-bold text-yellow-800">★</span>
                    </motion.div>
                  </div>
                </motion.div>
                
                <p className="text-gray-600 text-sm">
                  {t('perfectForFamilies')}
                </p>
              </CardHeader>
              
              <CardContent className="px-6 pb-6 relative z-10 flex-1 flex flex-col">
                <motion.ul 
                  className="space-y-4 mb-8 flex-1"
                  variants={containerVariants}
                >
                  {familyFeatures.map((feature, index) => (
                    <motion.li 
                      key={index} 
                      className="flex items-center gap-3"
                      variants={featureVariants}
                      whileHover={{ x: 5, transition: { duration: 0.2 } }}
                    >
                      <motion.div 
                        className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0"
                        whileHover={{ scale: 1.2, backgroundColor: "#DCFCE7" }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <Check className="w-3 h-3 text-green-600" />
                      </motion.div>
                      <span className="text-gray-700">{feature}</span>
                    </motion.li>
                  ))}
                </motion.ul>
                
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="mt-auto"
                >
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-4 rounded-xl relative overflow-hidden group shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-purple-500/50">
                    {/* Enhanced button effects for most popular */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-500 opacity-0 group-hover:opacity-100"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "100%" }}
                      transition={{ duration: 0.6 }}
                    />
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 opacity-0 group-hover:opacity-20"
                      initial={{ x: "100%" }}
                      whileHover={{ x: "-100%" }}
                      transition={{ duration: 0.8, delay: 0.1 }}
                    />
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      <motion.span
                        animate={{ 
                          scale: [1, 1.1, 1],
                          rotate: [0, 5, -5, 0]
                        }}
                        transition={{ 
                          duration: 2, 
                          repeat: Infinity, 
                          ease: "easeInOut" 
                        }}
                      >
                        👑
                      </motion.span>
                      {t('chooseFamily')}
                      <motion.span
                        animate={{ 
                          scale: [1, 1.1, 1],
                          rotate: [0, -5, 5, 0]
                        }}
                        transition={{ 
                          duration: 2, 
                          repeat: Infinity, 
                          ease: "easeInOut",
                          delay: 0.5
                        }}
                      >
                        ✨
                      </motion.span>
                    </span>
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
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
            className="inline-block w-32 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full"
            animate={{ 
              scaleX: [1, 1.3, 1],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          />
        </motion.div>
      </div>
    </section>
  );
};

export default PlansSection;
