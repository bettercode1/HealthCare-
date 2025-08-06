import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useFirestore } from '@/hooks/useFirestore';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loading } from '@/components/ui/loading';
import { serverTimestamp } from 'firebase/firestore';

interface Appointment {
  id: string;
  patientId: string;
  doctorId?: string;
  dateTime: any;
  purpose: string;
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  createdAt?: any;
}

const UpcomingAppointments: React.FC = () => {
  const { userData } = useAuth();
  const { toast } = useToast();
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [appointmentForm, setAppointmentForm] = useState({
    purpose: '',
    date: '',
    time: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { data: appointments, add: addAppointment, update: updateAppointment, loading: appointmentsLoading } = useFirestore<Appointment>('appointments',
    userData ? [
      { field: userData.role === 'patient' ? 'patientId' : 'doctorId', operator: '==', value: userData.id },
      { field: 'status', operator: 'in', value: ['scheduled', 'confirmed'] }
    ] : undefined
  );

  // Filter and sort appointments
  const now = new Date();
  const upcomingAppointments = appointments
    .filter(apt => {
      if (!apt.dateTime?.toDate) return false;
      return apt.dateTime.toDate() > now;
    })
    .sort((a, b) => {
      const dateA = a.dateTime?.toDate?.() || new Date(0);
      const dateB = b.dateTime?.toDate?.() || new Date(0);
      return dateA - dateB;
    })
    .slice(0, 5);

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData || !appointmentForm.purpose || !appointmentForm.date || !appointmentForm.time) return;

    setIsSubmitting(true);

    try {
      // Combine date and time into a Date object
      const dateTimeString = `${appointmentForm.date}T${appointmentForm.time}`;
      const dateTime = new Date(dateTimeString);

      // Check if appointment is in the future
      if (dateTime <= new Date()) {
        toast({
          title: 'Error',
          description: 'Appointment must be scheduled for a future date and time',
          variant: 'destructive',
        });
        return;
      }

      await addAppointment({
        patientId: userData.id,
        doctorId: '', // Will be assigned later
        dateTime: serverTimestamp(), // Will be updated with actual dateTime
        purpose: appointmentForm.purpose,
        status: 'scheduled',
        notes: appointmentForm.notes,
      });

      setAppointmentForm({
        purpose: '',
        date: '',
        time: '',
        notes: ''
      });
      setShowScheduleModal(false);

      toast({
        title: 'Success',
        description: 'Appointment scheduled successfully',
      });
    } catch (error) {
      console.error('Schedule appointment error:', error);
      toast({
        title: 'Error',
        description: 'Failed to schedule appointment',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateAppointment = async (appointmentId: string, status: string) => {
    try {
      await updateAppointment(appointmentId, { status });
      toast({
        title: 'Success',
        description: `Appointment ${status} successfully`,
      });
    } catch (error) {
      console.error('Update appointment error:', error);
      toast({
        title: 'Error',
        description: 'Failed to update appointment',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      case 'completed': return 'bg-blue-100 text-blue-700';
      default: return 'bg-yellow-100 text-yellow-700';
    }
  };

  const formatDateTime = (dateTime: any) => {
    if (!dateTime?.toDate) return { date: 'No date', time: 'No time' };
    
    const date = dateTime.toDate();
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const getTimeUntilAppointment = (dateTime: any) => {
    if (!dateTime?.toDate) return '';
    
    const appointmentDate = dateTime.toDate();
    const now = new Date();
    const timeDiff = appointmentDate.getTime() - now.getTime();
    
    if (timeDiff <= 0) return 'Overdue';
    
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `In ${days} day${days > 1 ? 's' : ''}`;
    if (hours > 0) return `In ${hours} hour${hours > 1 ? 's' : ''}`;
    return 'Soon';
  };

  // Set minimum date to today
  const today = new Date().toISOString().split('T')[0];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">
            Appointments ({upcomingAppointments.length})
          </CardTitle>
          {userData?.role === 'patient' && (
            <Dialog open={showScheduleModal} onOpenChange={setShowScheduleModal}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" style={{ color: 'hsl(207, 90%, 54%)' }}>
                  <span className="material-icons">add</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Schedule Appointment</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleScheduleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="purpose">Purpose</Label>
                    <Input
                      id="purpose"
                      value={appointmentForm.purpose}
                      onChange={(e) => setAppointmentForm(prev => ({ ...prev, purpose: e.target.value }))}
                      placeholder="e.g., Regular checkup, Follow-up"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        min={today}
                        value={appointmentForm.date}
                        onChange={(e) => setAppointmentForm(prev => ({ ...prev, date: e.target.value }))}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="time">Time</Label>
                      <Input
                        id="time"
                        type="time"
                        value={appointmentForm.time}
                        onChange={(e) => setAppointmentForm(prev => ({ ...prev, time: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      value={appointmentForm.notes}
                      onChange={(e) => setAppointmentForm(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Additional notes or symptoms"
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button 
                      type="submit" 
                      className="flex-1 text-white hover:bg-blue-700"
                      disabled={isSubmitting}
                      style={{ backgroundColor: 'hsl(207, 90%, 54%)' }}
                    >
                      {isSubmitting ? 'Scheduling...' : 'Schedule Appointment'}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowScheduleModal(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {appointmentsLoading ? (
            <Loading text="Loading appointments..." />
          ) : upcomingAppointments.length === 0 ? (
            <div className="text-center py-4">
              <span className="material-icons text-gray-400 text-3xl mb-2">event</span>
              <p className="text-gray-500">No upcoming appointments</p>
              <p className="text-sm text-gray-400">
                {userData?.role === 'patient' ? 'Schedule your first appointment' : 'No appointments scheduled'}
              </p>
            </div>
          ) : (
            upcomingAppointments.map((appointment) => {
              const { date, time } = formatDateTime(appointment.dateTime);
              const timeUntil = getTimeUntilAppointment(appointment.dateTime);
              
              return (
                <div key={appointment.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium text-gray-900">{appointment.purpose}</p>
                      <p className="text-sm text-gray-600">
                        {userData?.role === 'doctor' ? 
                          `Patient: ${appointment.patientId.slice(0, 8)}...` : 
                          'General Consultation'
                        }
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{date}</p>
                      <p className="text-sm text-gray-600">{time}</p>
                      {timeUntil && (
                        <p className="text-xs text-blue-600 font-medium">{timeUntil}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </span>
                    
                    <div className="flex space-x-2">
                      {appointment.status === 'scheduled' && userData?.role === 'doctor' && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleUpdateAppointment(appointment.id, 'confirmed')}
                          className="text-xs px-2 py-1"
                        >
                          Confirm
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-xs px-2 py-1"
                      >
                        Reschedule
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleUpdateAppointment(appointment.id, 'cancelled')}
                        className="text-xs px-2 py-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                  
                  {appointment.notes && (
                    <p className="text-sm text-gray-500 mt-2 italic">{appointment.notes}</p>
                  )}
                </div>
              );
            })
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
