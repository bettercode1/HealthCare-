import React from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '@/lib/i18n';
import { useAuth } from '@/contexts/AuthContext';
import PatientDashboard from './PatientDashboard';
import DoctorDashboard from './DoctorDashboard';
import LabDashboard from './LabDashboard';
import BettercodeLogo from './BettercodeLogo';

const DashboardContent: React.FC = () => {
  const { t } = useTranslation();
  const { userData } = useAuth();

  console.log('=== DASHBOARD CONTENT DEBUG ===');
  console.log('User data in DashboardContent:', userData);
  console.log('User role:', userData?.role);

  if (!userData) {
    console.log('No user data, returning null');
    return null;
  }

  console.log('Rendering dashboard content for role:', userData.role);

  return (
    <section className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-hidden">
        
        {/* Welcome Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{t('welcomeBack')}</h1>
              <p className="text-gray-600 truncate">{t('healthOverview')}</p>
            </div>
            <div className="flex items-center space-x-4 flex-shrink-0">
              <div className="text-right">
                <p className="text-sm text-gray-500">{t('lastLogin')}</p>
                <p className="font-medium text-sm sm:text-base">{new Date().toLocaleDateString(i18n.language === 'hi' ? 'hi-IN' : i18n.language === 'mr' ? 'mr-IN' : 'en-US')}</p>
              </div>
              <div 
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white flex-shrink-0"
                style={{ backgroundColor: 'hsl(207, 90%, 54%)' }}
              >
                <span className="material-icons text-lg sm:text-xl">person</span>
              </div>
            </div>
          </div>
        </div>

        {/* Role-based Dashboard Content */}
        <div className="overflow-x-hidden">
          {userData.role === 'patient' && <PatientDashboard />}
          {userData.role === 'doctor' && <DoctorDashboard />}
          {userData.role === 'lab' && <LabDashboard />}
        </div>

        {/* Bettercode Logo */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <BettercodeLogo variant="compact" className="justify-center" />
        </div>

      </div>
    </section>
  );
};

export default DashboardContent;
