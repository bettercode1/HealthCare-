import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { generateDemoData } from '@/lib/demoData';
import { HealthcareLoading } from '@/components/ui/loading';
import Navigation from '@/components/Navigation';
import HeroSection from '@/components/HeroSection';
import PlansSection from '@/components/PlansSection';
import FeaturesSection from '@/components/FeaturesSection';
import HowItWorksSection from '@/components/HowItWorksSection';
import DashboardContent from '@/components/DashboardContent';
import Footer from '@/components/Footer';
import LoginModal from '@/components/LoginModal';
import ChatbotWidget from '@/components/ChatbotWidget';
import { MedicalLoading } from '@/components/ui/loading';

const Home: React.FC = () => {
  const { currentUser, userData } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isNavigatingToLogin, setIsNavigatingToLogin] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [initializationComplete, setInitializationComplete] = useState(false);

  // Dashboard initialization logic
  useEffect(() => {
    if (!userData || initializationComplete) return;

    const initializeDashboard = async () => {
      setIsInitializing(true);
      
      try {
        // Set a longer timeout for initialization
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Initialization timeout')), 15000)
        );
        
        // Pass the correct parameters to generateDemoData
        const initPromise = generateDemoData(
          userData.id || 'demo-patient-1', 
          userData.role || 'patient', 
          userData.email
        );
        
        console.log('Starting dashboard initialization...');
        await Promise.race([initPromise, timeoutPromise]);
        console.log('Dashboard initialization completed successfully');
        
        setInitializationComplete(true);
      } catch (error) {
        console.warn('Dashboard initialization failed, continuing with demo mode:', error);
        // Continue with demo mode even if initialization fails
        setInitializationComplete(true);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeDashboard();
  }, [userData, initializationComplete]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleGoToDashboard = () => {
    if (currentUser) {
      // User is already logged in, scroll to dashboard content
      scrollToSection('dashboard-content');
    } else {
      // User not logged in, show login modal with loading animation
      setIsNavigatingToLogin(true);
      setTimeout(() => {
        setShowLoginModal(true);
        setIsNavigatingToLogin(false);
      }, 1500); // Show loading for 1.5 seconds
    }
  };

  const handleShowLogin = () => {
    setIsNavigatingToLogin(true);
    setTimeout(() => {
      setShowLoginModal(true);
      setIsNavigatingToLogin(false);
    }, 1500); // Show loading for 1.5 seconds
  };

  // Show loading while initializing dashboard
  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <HealthcareLoading text="Initializing dashboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <Navigation
        onShowLogin={handleShowLogin}
        onScrollToPlans={() => scrollToSection('plans-section')}
        onScrollToFeatures={() => scrollToSection('features-section')}
      />
      
      {/* Main Content */}
      <main className="pt-16">
        
        {/* Landing Page Content (Visible when not authenticated) */}
        {!currentUser && (
          <>
            <HeroSection
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

      {/* Loading Overlay for Login Navigation */}
              {isNavigatingToLogin && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 shadow-2xl">
              <MedicalLoading 
                text="Preparing your healthcare dashboard..." 
                className="text-center"
              />
            </div>
          </div>
        )}
    </div>
  );
};

export default Home;
