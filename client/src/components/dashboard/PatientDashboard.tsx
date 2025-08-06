import React from 'react';
import AIAnalysis from './AIAnalysis';
import DoseTracker from './DoseTracker';
import FamilyMembers from './FamilyMembers';
import RecentReports from './RecentReports';
import UpcomingAppointments from './UpcomingAppointments';
import { useFirestore } from '@/hooks/useFirestore';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingCard } from '@/components/ui/loading';

const PatientDashboard: React.FC = () => {
  const { userData } = useAuth();
  
  const { data: reports, loading: reportsLoading } = useFirestore('reports',
    userData ? [{ field: 'userId', operator: '==', value: userData.id }] : undefined
  );
  
  const { data: doses, loading: dosesLoading } = useFirestore('doses',
    userData ? [{ field: 'userId', operator: '==', value: userData.id }] : undefined
  );
  
  const { data: appointments, loading: appointmentsLoading } = useFirestore('appointments',
    userData ? [{ field: 'patientId', operator: '==', value: userData.id }] : undefined
  );

  // Get next dose time
  const today = new Date().toISOString().split('T')[0];
  const todayDoses = doses.filter(dose => dose.date === today && dose.status === 'pending');
  const nextDose = todayDoses.sort((a, b) => a.time.localeCompare(b.time))[0];

  // Get next appointment
  const upcomingAppointments = appointments
    .filter(apt => apt.dateTime?.toDate?.() > new Date())
    .sort((a, b) => a.dateTime?.toDate?.() - b.dateTime?.toDate?.());
  const nextAppointment = upcomingAppointments[0];

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
                <p className="text-2xl font-bold text-gray-900">
                  {reportsLoading ? '...' : reports.length}
                </p>
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
                <p className="text-2xl font-bold text-gray-900">
                  {dosesLoading ? '...' : nextDose ? nextDose.time : 'None'}
                </p>
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
                <p className="text-2xl font-bold text-gray-900">
                  {appointmentsLoading ? '...' : nextAppointment ? 
                    nextAppointment.dateTime?.toDate?.()?.toLocaleDateString() : 'None'}
                </p>
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
