import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PlansSection: React.FC = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Choose Your Plan</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Select the perfect plan for you and your family's healthcare needs
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Personal Plan */}
          <Card className="border-2 border-gray-200 hover:border-blue-500 transition-colors">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-gray-900 mb-2">Personal Plan</CardTitle>
              <div className="text-4xl font-bold mb-2" style={{ color: 'hsl(207, 90%, 54%)' }}>
                ₹1,000<span className="text-lg text-gray-600">/year</span>
              </div>
              <p className="text-gray-600">Perfect for individuals</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <span className="material-icons text-green-500 mr-3">check_circle</span>
                  <span>AI Health Report Analysis</span>
                </li>
                <li className="flex items-center">
                  <span className="material-icons text-green-500 mr-3">check_circle</span>
                  <span>Dose Tracking System</span>
                </li>
                <li className="flex items-center">
                  <span className="material-icons text-green-500 mr-3">check_circle</span>
                  <span>Secure Report Upload</span>
                </li>
                <li className="flex items-center">
                  <span className="material-icons text-green-500 mr-3">check_circle</span>
                  <span>Prescription Management</span>
                </li>
                <li className="flex items-center">
                  <span className="material-icons text-green-500 mr-3">check_circle</span>
                  <span>24/7 Healthcare Chatbot</span>
                </li>
              </ul>
              
              <Button className="w-full bg-gray-100 text-gray-900 hover:bg-gray-200">
                Choose Personal
              </Button>
            </CardContent>
          </Card>
          
          {/* Family Plan */}
          <Card className="text-white relative overflow-hidden" style={{ background: 'linear-gradient(135deg, hsl(207, 90%, 54%) 0%, hsl(153, 72%, 51%) 100%)' }}>
            <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-semibold">
              Most Popular
            </div>
            
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold mb-2">Family Plan</CardTitle>
              <div className="text-4xl font-bold mb-2">
                ₹2,500<span className="text-lg opacity-80">/year</span>
              </div>
              <p className="opacity-80">For families of all sizes</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <span className="material-icons text-yellow-300 mr-3">check_circle</span>
                  <span>Everything in Personal Plan</span>
                </li>
                <li className="flex items-center">
                  <span className="material-icons text-yellow-300 mr-3">check_circle</span>
                  <span>Add & Manage Family Members</span>
                </li>
                <li className="flex items-center">
                  <span className="material-icons text-yellow-300 mr-3">check_circle</span>
                  <span>Family Health Dashboard</span>
                </li>
                <li className="flex items-center">
                  <span className="material-icons text-yellow-300 mr-3">check_circle</span>
                  <span>Shared Appointment Scheduling</span>
                </li>
                <li className="flex items-center">
                  <span className="material-icons text-yellow-300 mr-3">check_circle</span>
                  <span>Priority Customer Support</span>
                </li>
              </ul>
              
              <Button className="w-full bg-white hover:bg-gray-100" style={{ color: 'hsl(207, 90%, 54%)' }}>
                Choose Family
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default PlansSection;
