import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: 'psychology',
      title: 'AI Health Report Analysis',
      description: 'Get instant insights and recommendations from your medical reports using advanced AI technology.',
      color: 'hsl(207, 90%, 54%)'
    },
    {
      icon: 'medication',
      title: 'Dose Tracking System',
      description: 'Never miss a dose with our intelligent reminder system and comprehensive medication tracking.',
      color: 'hsl(153, 72%, 51%)'
    },
    {
      icon: 'cloud_upload',
      title: 'Secure Report Upload',
      description: 'Safely store and organize all your medical reports in one secure, encrypted location.',
      color: 'hsl(271, 81%, 56%)'
    },
    {
      icon: 'receipt_long',
      title: 'Prescription Management',
      description: 'Manage all your prescriptions digitally with automatic refill reminders and dosage tracking.',
      color: 'hsl(48, 96%, 53%)'
    },
    {
      icon: 'family_restroom',
      title: 'Family Member Profiles',
      description: 'Create and manage health profiles for all family members in one convenient dashboard.',
      color: 'hsl(0, 84%, 60%)'
    },
    {
      icon: 'security',
      title: 'Role-Based Access',
      description: 'Secure access controls for patients, doctors, and labs with appropriate permissions.',
      color: 'hsl(238, 83%, 67%)'
    },
    {
      icon: 'notifications_active',
      title: 'AI Recommendations & Alerts',
      description: 'Receive intelligent health recommendations and alerts based on your medical data and trends.',
      color: 'hsl(20, 90%, 58%)'
    },
    {
      icon: 'event',
      title: 'Appointment Scheduling',
      description: 'Schedule, manage, and track all your medical appointments with automatic reminders.',
      color: 'hsl(173, 80%, 40%)'
    },
    {
      icon: 'chat',
      title: 'Healthcare Chatbot',
      description: 'Get instant answers to your healthcare questions with our AI-powered assistant available 24/7.',
      color: 'hsl(316, 73%, 52%)'
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Powerful Features</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to manage your family's healthcare in one place
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="bg-white hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${feature.color}20`, color: feature.color }}
                >
                  <span className="material-icons">{feature.icon}</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
