import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useFirestore } from '@/hooks/useFirestore';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { formatDateAsMonthYear } from '@/lib/utils';

const DoctorDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { userData } = useAuth();
  const { toast } = useToast();
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [prescriptionForm, setPrescriptionForm] = useState({
    patientEmail: '',
    diagnosis: '',
    medication: '',
    notes: ''
  });

  // Fetch patients (users with role 'patient')
  const { data: patients } = useFirestore('users', [
    { field: 'role', operator: '==', value: 'patient' }
  ]);

  // Fetch prescriptions created by this doctor
  const { add: addPrescription } = useFirestore('prescriptions');

  // Fetch reports for selected patient
  const { data: reports } = useFirestore('reports', 
    selectedPatient ? [{ field: 'userId', operator: '==', value: selectedPatient }] : undefined
  );

  // Fetch appointments for this doctor
  const { data: appointments } = useFirestore('appointments', [
    { field: 'doctorId', operator: '==', value: userData?.id || '' }
  ]);

  const handlePrescriptionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData) return;

    try {
      await addPrescription({
        doctorId: userData.id,
        patientId: selectedPatient,
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
        title: t('success'),
        description: t('prescriptionCreated'),
      });
    } catch (error) {
      toast({
        title: t('error'),
        description: t('prescriptionFailed'),
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      
      {/* Patient Management */}
      <div className="space-y-6">
        
        {/* Patient List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="material-icons mr-2">people</span>
              {t('patientList')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {patients.length === 0 ? (
                <p className="text-gray-500 text-center py-4">{t('noPatientsFound')}</p>
              ) : (
                patients.map((patient) => (
                  <div 
                    key={patient.id}
                    className={`p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer ${
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
                        <p className="text-sm text-gray-600">Patient ID: {patient.id.slice(0, 8)}...</p>
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
                {t('patientReports')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reports.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No reports found for this patient</p>
                ) : (
                  reports.map((report) => (
                    <div key={report.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{report.title}</p>
                          <p className="text-sm text-gray-600">
                            {formatDateAsMonthYear(report.createdAt?.toDate?.())}
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
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
                <Label htmlFor="patientEmail">{t('patientEmail')}</Label>
                <Input
                  id="patientEmail"
                  type="email"
                  value={prescriptionForm.patientEmail}
                  onChange={(e) => setPrescriptionForm(prev => ({ ...prev, patientEmail: e.target.value }))}
                  placeholder="patient@example.com"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="diagnosis">{t('diagnosis')}</Label>
                <Input
                  id="diagnosis"
                  value={prescriptionForm.diagnosis}
                  onChange={(e) => setPrescriptionForm(prev => ({ ...prev, diagnosis: e.target.value }))}
                  placeholder="Enter diagnosis"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="medication">{t('medication')}</Label>
                <Input
                  id="medication"
                  value={prescriptionForm.medication}
                  onChange={(e) => setPrescriptionForm(prev => ({ ...prev, medication: e.target.value }))}
                  placeholder="Enter medication details"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="notes">{t('notes')}</Label>
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
                style={{ backgroundColor: 'hsl(207, 90%, 54%)' }}
              >
                {t('createPrescription')}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Appointment Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="material-icons mr-2">event</span>
              {t('upcomingAppointments')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {appointments.length === 0 ? (
                <p className="text-gray-500 text-center py-4">{t('noUpcomingAppointments')}</p>
              ) : (
                appointments.map((appointment) => (
                  <div key={appointment.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{appointment.purpose}</p>
                        <p className="text-sm text-gray-600">{t('patientId')}: {appointment.patientId.slice(0, 8)}...</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {formatDateAsMonthYear(appointment.dateTime?.toDate?.())}
                        </p>
                        <p className="text-sm text-gray-600">
                          {appointment.dateTime?.toDate?.()?.toLocaleTimeString() || t('noTime')}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 flex space-x-2">
                      <Button variant="outline" size="sm">{t('confirm')}</Button>
                      <Button variant="outline" size="sm">{t('reschedule')}</Button>
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
