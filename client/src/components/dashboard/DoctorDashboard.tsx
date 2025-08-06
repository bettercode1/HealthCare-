import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useFirestore } from '@/hooks/useFirestore';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loading } from '@/components/ui/loading';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const DoctorDashboard: React.FC = () => {
  const { userData } = useAuth();
  const { toast } = useToast();
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [prescriptionForm, setPrescriptionForm] = useState({
    patientEmail: '',
    diagnosis: '',
    medication: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch patients (users with role 'patient')
  const { data: patients, loading: patientsLoading } = useFirestore('users', [
    { field: 'role', operator: '==', value: 'patient' }
  ]);

  // Fetch prescriptions created by this doctor
  const { add: addPrescription } = useFirestore('prescriptions');

  // Fetch reports for selected patient
  const { data: reports, loading: reportsLoading } = useFirestore('reports', 
    selectedPatient ? [{ field: 'userId', operator: '==', value: selectedPatient }] : undefined
  );

  // Fetch appointments for this doctor
  const { data: appointments, loading: appointmentsLoading, update: updateAppointment } = useFirestore('appointments', [
    { field: 'doctorId', operator: '==', value: userData?.id || '' }
  ]);

  const handlePrescriptionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData) return;

    setIsSubmitting(true);
    
    try {
      // Find patient by email
      const patientsQuery = query(
        collection(db, 'users'),
        where('email', '==', prescriptionForm.patientEmail)
      );
      const patientsSnapshot = await getDocs(patientsQuery);

      if (patientsSnapshot.empty) {
        toast({
          title: 'Error',
          description: 'Patient not found with this email',
          variant: 'destructive',
        });
        return;
      }

      const patientId = patientsSnapshot.docs[0].id;

      await addPrescription({
        doctorId: userData.id,
        patientId: patientId,
        diagnosis: prescriptionForm.diagnosis,
        medication: prescriptionForm.medication,
        notes: prescriptionForm.notes,
      });

      setPrescriptionForm({
        patientEmail: '',
        diagnosis: '',
        medication: '',
        notes: ''
      });

      toast({
        title: 'Success',
        description: 'Prescription created successfully',
      });
    } catch (error) {
      console.error('Prescription creation error:', error);
      toast({
        title: 'Error',
        description: 'Failed to create prescription',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAppointmentUpdate = async (appointmentId: string, status: string) => {
    try {
      await updateAppointment(appointmentId, { status });
      toast({
        title: 'Success',
        description: `Appointment ${status} successfully`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update appointment',
        variant: 'destructive',
      });
    }
  };

  if (patientsLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Loading text="Loading patients..." />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      
      {/* Patient Management */}
      <div className="space-y-6">
        
        {/* Patient List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="material-icons mr-2">people</span>
              Patient List ({patients.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {patients.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No patients found</p>
              ) : (
                patients.map((patient) => (
                  <div 
                    key={patient.id}
                    className={`p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors ${
                      selectedPatient === patient.id ? 'bg-blue-50 border-blue-300' : ''
                    }`}
                    onClick={() => {
                      setSelectedPatient(patient.id);
                      setPrescriptionForm(prev => ({ ...prev, patientEmail: patient.email }));
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{patient.email}</p>
                        <p className="text-sm text-gray-600">ID: {patient.id.slice(0, 8)}...</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Plan</p>
                        <p className="text-sm font-medium capitalize">{patient.plan}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Patient Reports */}
        {selectedPatient && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="material-icons mr-2">description</span>
                Patient Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {reportsLoading ? (
                  <Loading text="Loading reports..." />
                ) : reports.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No reports found for this patient</p>
                ) : (
                  reports.map((report) => (
                    <div key={report.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{report.title}</p>
                          <p className="text-sm text-gray-600">
                            {report.createdAt?.toDate?.()?.toLocaleDateString() || 'No date'}
                          </p>
                          {report.notes && (
                            <p className="text-sm text-gray-500 mt-1">{report.notes}</p>
                          )}
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(report.fileURL, '_blank')}
                        >
                          <span className="material-icons mr-2">visibility</span>
                          View
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        )}

      </div>

      {/* Prescription & Appointment Management */}
      <div className="space-y-6">
        
        {/* Create Prescription */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="material-icons mr-2">receipt_long</span>
              Create Prescription
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePrescriptionSubmit} className="space-y-4">
              <div>
                <Label htmlFor="patientEmail">Patient Email</Label>
                <Input
                  id="patientEmail"
                  type="email"
                  value={prescriptionForm.patientEmail}
                  onChange={(e) => setPrescriptionForm(prev => ({ ...prev, patientEmail: e.target.value }))}
                  placeholder="patient@example.com"
                  required
                  className="focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <Label htmlFor="diagnosis">Diagnosis</Label>
                <Input
                  id="diagnosis"
                  value={prescriptionForm.diagnosis}
                  onChange={(e) => setPrescriptionForm(prev => ({ ...prev, diagnosis: e.target.value }))}
                  placeholder="Enter diagnosis"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="medication">Medication</Label>
                <Input
                  id="medication"
                  value={prescriptionForm.medication}
                  onChange={(e) => setPrescriptionForm(prev => ({ ...prev, medication: e.target.value }))}
                  placeholder="Enter medication details"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={prescriptionForm.notes}
                  onChange={(e) => setPrescriptionForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes"
                  rows={3}
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full text-white hover:bg-blue-700"
                disabled={isSubmitting}
                style={{ backgroundColor: 'hsl(207, 90%, 54%)' }}
              >
                {isSubmitting ? 'Creating...' : 'Create Prescription'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Appointment Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="material-icons mr-2">event</span>
              Appointments ({appointments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {appointmentsLoading ? (
                <Loading text="Loading appointments..." />
              ) : appointments.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No appointments scheduled</p>
              ) : (
                appointments.map((appointment) => (
                  <div key={appointment.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium text-gray-900">{appointment.purpose}</p>
                        <p className="text-sm text-gray-600">Patient: {appointment.patientId.slice(0, 8)}...</p>
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
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        appointment.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                        appointment.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {appointment.status}
                      </span>
                      <div className="flex space-x-2">
                        {appointment.status === 'scheduled' && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleAppointmentUpdate(appointment.id, 'confirmed')}
                            className="text-xs"
                          >
                            Confirm
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleAppointmentUpdate(appointment.id, 'cancelled')}
                          className="text-xs"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

      </div>

    </div>
  );
};

export default DoctorDashboard;
