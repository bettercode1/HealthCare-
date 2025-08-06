import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useFirestore } from '@/hooks/useFirestore';
import { useAuth } from '@/contexts/AuthContext';

interface Appointment {
  id: string;
  patientId: string;
  doctorId?: string;
  dateTime: any;
  purpose: string;
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed';
  createdAt?: any;
}

const UpcomingAppointments: React.FC = () => {
  const { userData } = useAuth();
  
  const { data: appointments } = useFirestore<Appointment>('appointments',
    userData ? [
      { field: userData.role === 'patient' ? 'patientId' : 'doctorId', operator: '==', value: userData.id },
      { field: 'status', operator: 'in', value: ['scheduled', 'confirmed'] }
    ] : undefined
  );

  // Sort appointments by date
  const sortedAppointments = appointments
    .filter(apt => apt.dateTime?.toDate?.() > new Date())
    .sort((a, b) => a.dateTime?.toDate?.() - b.dateTime?.toDate?.())
    .slice(0, 3);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">Appointments</CardTitle>
          <Button variant="ghost" size="sm" style={{ color: 'hsl(207, 90%, 54%)' }}>
            <span className="material-icons">add</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sortedAppointments.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No upcoming appointments</p>
          ) : (
            sortedAppointments.map((appointment) => (
              <div key={appointment.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{appointment.purpose}</p>
                    <p className="text-sm text-gray-600">
                      {userData?.role === 'doctor' ? `Patient: ${appointment.patientId.slice(0, 8)}...` : 'Consultation'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {appointment.dateTime?.toDate?.()?.toLocaleDateString() || 'No date'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {appointment.dateTime?.toDate?.()?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || 'No time'}
                    </p>
                  </div>
                </div>
                <div className="mt-2 flex space-x-2">
                  <Button variant="outline" size="sm" className="text-xs">
                    Reschedule
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs">
                    Cancel
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <Button variant="link" className="w-full text-center p-0 h-auto hover:text-blue-700" style={{ color: 'hsl(207, 90%, 54%)' }}>
            View All Appointments →
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default UpcomingAppointments;
