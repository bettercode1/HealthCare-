import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import PatientDashboard from './PatientDashboard';
import DoctorDashboard from './DoctorDashboard';
import LabDashboard from './LabDashboard';

const DashboardContent: React.FC = () => {
  const { userData } = useAuth();

  if (!userData) return null;

  return (
    <section className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Welcome Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Welcome back!</h1>
              <p className="text-gray-600">Here's your health overview for today</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Last login</p>
                <p className="font-medium">{new Date().toLocaleDateString()}</p>
              </div>
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center text-white"
                style={{ backgroundColor: 'hsl(207, 90%, 54%)' }}
              >
                <span className="material-icons">person</span>
              </div>
            </div>
          </div>
        </div>

        {/* Role-based Dashboard Content */}
        {userData.role === 'patient' && <PatientDashboard />}
        {userData.role === 'doctor' && <DoctorDashboard />}
        {userData.role === 'lab' && <LabDashboard />}

      </div>
    </section>
  );
};

export default DashboardContent;
