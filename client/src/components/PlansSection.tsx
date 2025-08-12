import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Check, Star, Users, User, Shield, Brain, Activity, Calendar, MessageCircle } from 'lucide-react';

const PlansSection: React.FC = () => {
  const { t } = useTranslation();

  const personalFeatures = [
    t('personalPlanFeature1'),
    t('personalPlanFeature2'),
    t('personalPlanFeature3'),
    t('personalPlanFeature4'),
    t('personalPlanFeature5'),
    t('personalPlanFeature6'),
  ];

  const familyFeatures = [
    t('familyPlanFeature1'),
    t('familyPlanFeature2'),
    t('familyPlanFeature3'),
    t('familyPlanFeature4'),
    t('familyPlanFeature5'),
    t('familyPlanFeature6'),
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

  const featureVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  return (
    <section id="plans-section" className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
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
            variants={cardVariants}
          >
            {t('chooseYourPerfectPlan')}
          </motion.h2>
          <motion.p 
            className="text-lg text-gray-600 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            {t('startYourHealthcareJourney')}
          </motion.p>
        </motion.div>

        {/* Plans Grid */}
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
              y: -4,
              transition: { duration: 0.2 }
            }}
            className="h-full"
          >
            <Card className="relative h-full border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all duration-300">
              <CardHeader className="text-center pb-6">
                {/* Icon */}
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center">
                    <User className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
                
                {/* Title */}
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                  {t('personalPlan')}
                </h3>
                
                {/* Price */}
                <div className="mb-4">
                  <span className="text-4xl font-bold text-blue-600">{t('personalPlanPrice')}</span>
                  <span className="text-lg text-gray-500 ml-2">{t('perYear')}</span>
                </div>
                
                {/* Description */}
                <p className="text-gray-600 text-sm">
                  {t('perfectForIndividuals')}
                </p>
              </CardHeader>
              
              <CardContent className="px-6 pb-6">
                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {personalFeatures.map((feature, index) => (
                    <motion.li 
                      key={index} 
                      className="flex items-center gap-3"
                      variants={featureVariants}
                    >
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-green-600" />
                      </div>
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </motion.li>
                  ))}
                </ul>
                
                {/* CTA Button */}
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors duration-200">
                  {t('choosePersonal')}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Family Plan - Most Popular */}
          <motion.div
            variants={cardVariants}
            whileHover={{ 
              y: -4,
              transition: { duration: 0.2 }
            }}
            className="h-full"
          >
            <Card className="relative h-full border-2 border-purple-200 bg-white shadow-md hover:shadow-lg transition-all duration-300">
              {/* Popular Badge */}
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  {t('mostPopular')}
                </Badge>
              </div>
              
              <CardHeader className="text-center pb-6 pt-8">
                {/* Icon */}
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center">
                    <Users className="w-8 h-8 text-purple-600" />
                  </div>
                </div>
                
                {/* Title */}
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                  {t('familyPlan')}
                </h3>
                
                {/* Price */}
                <div className="mb-4">
                  <span className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {t('familyPlanPrice')}
                  </span>
                  <span className="text-lg text-gray-500 ml-2">{t('perYear')}</span>
                </div>
                
                {/* Description */}
                <p className="text-gray-600 text-sm">
                  {t('perfectForFamilies')}
                </p>
              </CardHeader>
              
              <CardContent className="px-6 pb-6">
                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {familyFeatures.map((feature, index) => (
                    <motion.li 
                      key={index} 
                      className="flex items-center gap-3"
                      variants={featureVariants}
                    >
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-green-600" />
                      </div>
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </motion.li>
                  ))}
                </ul>
                
                {/* CTA Button */}
                <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-3 rounded-lg transition-all duration-200">
                  {t('chooseFamily')}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default PlansSection;
