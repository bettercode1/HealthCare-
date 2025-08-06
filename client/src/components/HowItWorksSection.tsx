import React from 'react';

const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      number: 1,
      title: 'Sign Up',
      description: 'Create your account and choose the plan that fits your needs.',
      bgColor: 'hsl(207, 90%, 54%)'
    },
    {
      number: 2,
      title: 'Choose Role',
      description: 'Select your role: Patient, Doctor, or Lab to access relevant features.',
      bgColor: 'hsl(153, 72%, 51%)'
    },
    {
      number: 3,
      title: 'Upload Reports',
      description: 'Securely upload and organize your medical reports and documents.',
      bgColor: 'hsl(271, 81%, 56%)'
    },
    {
      number: 4,
      title: 'Use AI Tools',
      description: 'Get intelligent insights and recommendations from our AI analysis.',
      bgColor: 'hsl(48, 96%, 53%)'
    },
    {
      number: 5,
      title: 'Track & Schedule',
      description: 'Monitor dosages and schedule appointments with ease.',
      bgColor: 'hsl(0, 84%, 60%)'
    },
    {
      number: 6,
      title: 'Get Support',
      description: 'Chat with our healthcare bot for instant assistance and guidance.',
      bgColor: 'hsl(238, 83%, 67%)'
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get started with HealthCare Pro in just a few simple steps
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div key={step.number} className="text-center">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4"
                style={{ backgroundColor: step.bgColor }}
              >
                {step.number}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
