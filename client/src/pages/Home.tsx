import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import HeroSection from '@/components/HeroSection';
import PlansSection from '@/components/PlansSection';
import FeaturesSection from '@/components/FeaturesSection';
import HowItWorksSection from '@/components/HowItWorksSection';
import Footer from '@/components/Footer';
import LoginModal from '@/components/LoginModal';
import DashboardContent from '@/components/DashboardContent';
import ChatbotWidget from '@/components/ChatbotWidget';

const Home: React.FC = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { currentUser } = useAuth();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleGetStarted = () => {
    scrollToSection('features-section');
  };

  const handleGoToDashboard = () => {
    if (currentUser) {
      // User is already logged in, scroll to dashboard content
      scrollToSection('dashboard-content');
    } else {
      // User not logged in, show login modal
      setShowLoginModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <Navigation
        onShowLogin={() => setShowLoginModal(true)}
        onScrollToPlans={() => scrollToSection('plans-section')}
        onScrollToFeatures={() => scrollToSection('features-section')}
      />
      
      {/* Main Content */}
      <main className="pt-16">
        
        {/* Landing Page Content (Visible when not authenticated) */}
        {!currentUser && (
          <>
            <HeroSection
              onGetStarted={handleGetStarted}
              onGoToDashboard={handleGoToDashboard}
            />
            
            <div id="plans-section">
              <PlansSection />
            </div>
            
            <div id="features-section">
              <FeaturesSection />
            </div>
            
            <HowItWorksSection />
          </>
        )}

        {/* Dashboard Content (Visible when authenticated) */}
        {currentUser && (
          <div id="dashboard-content">
            <DashboardContent />
          </div>
        )}

      </main>

      {/* Footer (Always visible) */}
      <Footer />

      {/* Login Modal */}
      <LoginModal
        isVisible={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />

      {/* Chatbot Widget (Always visible but only functional when logged in) */}
      <ChatbotWidget />
    </div>
  );
};

export default Home;
