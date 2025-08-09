import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, User, Users } from 'lucide-react';

interface Appointment {
  id: string;
  patientName?: string;
  familyMemberName?: string;
  familyMemberRelationship?: string;
  doctorName?: string;
  specialty?: string;
  dateTime: string;
  purpose: string;
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed' | 'pending';
  location?: string;
  room?: string;
  type?: 'in-person' | 'virtual';
  duration?: number;
  isFamilyAppointment?: boolean;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

const UpcomingAppointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    // Load appointments from localStorage
    const savedAppointments = localStorage.getItem('mock_appointments');
    if (savedAppointments) {
      const parsedAppointments = JSON.parse(savedAppointments);
      // Filter for upcoming appointments only
      const upcoming = parsedAppointments.filter((apt: Appointment) => 
        new Date(apt.dateTime) > new Date() && 
        apt.status !== 'cancelled' && 
        apt.status !== 'completed'
      );
      setAppointments(upcoming.slice(0, 3)); // Show only next 3 appointments
    }
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'virtual' ? '🖥️' : '🏥';
  };

  if (appointments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Appointments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">No upcoming appointments</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Upcoming Appointments
          <Badge variant="secondary" className="ml-auto">
            {appointments.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {appointments.map((appointment) => (
          <div
            key={appointment.id}
            className={`p-4 rounded-lg border ${
              appointment.isFamilyAppointment 
                ? 'border-blue-200 bg-blue-50' 
                : 'border-green-200 bg-green-50'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">{getTypeIcon(appointment.type || 'in-person')}</span>
                <div>
                  <h4 className="font-semibold text-sm text-gray-900">
                    {appointment.purpose}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    {appointment.isFamilyAppointment ? (
                      <>
                        <Users className="h-3 w-3 text-blue-600" />
                        <span className="text-xs text-blue-700">
                          {appointment.familyMemberName} ({appointment.familyMemberRelationship})
                        </span>
                      </>
                    ) : (
                      <>
                        <User className="h-3 w-3 text-green-600" />
                        <span className="text-xs text-green-700">You</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <Badge className={`text-xs ${getStatusColor(appointment.status)}`}>
                {appointment.status}
              </Badge>
            </div>

            <div className="space-y-2 text-xs text-gray-600">
              {appointment.doctorName && (
                <div className="flex items-center gap-2">
                  <User className="h-3 w-3" />
                  <span>{appointment.doctorName}</span>
                  {appointment.specialty && (
                    <Badge variant="outline" className="text-xs">
                      {appointment.specialty}
                    </Badge>
                  )}
                </div>
              )}

              <div className="flex items-center gap-2">
                <Calendar className="h-3 w-3" />
                <span>{new Date(appointment.dateTime).toLocaleDateString()}</span>
                <Clock className="h-3 w-3 ml-2" />
                <span>{new Date(appointment.dateTime).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}</span>
                {appointment.duration && (
                  <span className="text-gray-500">({appointment.duration} min)</span>
                )}
              </div>

              {appointment.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-3 w-3" />
                  <span>{appointment.location}</span>
                  {appointment.room && <span>• Room {appointment.room}</span>}
                </div>
              )}

              {appointment.priority && appointment.priority !== 'medium' && (
                <Badge className={`text-xs ${getPriorityColor(appointment.priority)}`}>
                  {appointment.priority.charAt(0).toUpperCase() + appointment.priority.slice(1)} Priority
                </Badge>
              )}
            </div>
          </div>
        ))}

        <Button variant="outline" className="w-full mt-4">
          View All Appointments
        </Button>
      </CardContent>
    </Card>
  );
};

export default UpcomingAppointments;
