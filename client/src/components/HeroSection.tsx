import React from 'react';
import { Button } from '@/components/ui/button';

interface HeroSectionProps {
  onGetStarted: () => void;
  onGoToDashboard: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onGetStarted, onGoToDashboard }) => {
  return (
    <section className="relative text-white" style={{ background: 'linear-gradient(to right, hsl(207, 90%, 54%), hsl(153, 72%, 51%))' }}>
      <div className="absolute inset-0 bg-black opacity-40"></div>
      <div 
        className="absolute inset-0 bg-cover bg-center" 
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&h=1080')"
        }}
      ></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="text-center">
          <h1 className="text-4xl lg:text-6xl font-bold mb-6">
            Smarter Healthcare.<br />
            <span className="text-yellow-300">For You and Your Family.</span>
          </h1>
          <p className="text-xl lg:text-2xl mb-8 text-gray-200 max-w-3xl mx-auto">
            AI-powered health insights, prescription management, and family care coordination in one secure platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={onGetStarted}
              className="bg-white hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold text-lg flex items-center justify-center"
              style={{ color: 'hsl(207, 90%, 54%)' }}
            >
              <span className="material-icons mr-2">rocket_launch</span>
              Get Started
            </Button>
            <Button 
              onClick={onGoToDashboard}
              variant="outline"
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 flex items-center justify-center"
            >
              <span className="material-icons mr-2">dashboard</span>
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
