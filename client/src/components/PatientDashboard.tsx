import React from 'react';
import AIAnalysis from './AIAnalysis';
import DoseTracker from './DoseTracker';
import FamilyMembers from './FamilyMembers';
import RecentReports from './RecentReports';
import UpcomingAppointments from './UpcomingAppointments';

const PatientDashboard: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Health Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Reports</p>
                <p className="text-2xl font-bold text-gray-900">8</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="material-icons text-blue-600">description</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Next Dose</p>
                <p className="text-2xl font-bold text-gray-900">2:30 PM</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="material-icons text-green-600">medication</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Next Appointment</p>
                <p className="text-2xl font-bold text-gray-900">Dec 18</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="material-icons text-yellow-600">event</span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Health Report Analysis */}
        <AIAnalysis />

        {/* Recent Reports */}
        <RecentReports />

      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        <DoseTracker />
        <FamilyMembers />
        <UpcomingAppointments />
      </div>

    </div>
  );
};

export default PatientDashboard;
