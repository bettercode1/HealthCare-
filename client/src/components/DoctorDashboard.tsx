import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFirestore } from '@/hooks/useFirestore';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { formatDateAsMonthYear, formatDateTime } from '@/lib/utils';

interface Patient {
  id: string;
  name: string;
  age: number;
  phone: string;
  email: string;
  lastVisit: string;
  nextAppointment: string;
  healthStatus: string;
  currentMedications: string[];
  allergies: string[];
  notes: string;
}

interface Prescription {
  id: string;
  doctorId: string;
  patientId: string;
  patientName: string;
  diagnosis: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  refillInstructions: string;
  status: 'active' | 'completed' | 'renewed';
  createdAt: string;
  updatedAt: string;
}

interface Appointment {
  id: string;
  doctorId: string;
  patientId: string;
  patientName: string;
  purpose: string;
  dateTime: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  notes: string;
  duration: number;
  followUpNotes: string;
}

interface LabReport {
  id: string;
  userId: string;
  patientName: string;
  title: string;
  fileURL: string;
  notes: string;
  status: 'pending' | 'completed' | 'reviewed';
  createdAt: string;
  completedAt?: string;
  doctorNotes?: string;
}

const DoctorDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { userData } = useAuth();
  const { toast } = useToast();
  
  // State management
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [activeTab, setActiveTab] = useState('overview');
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [showLabRequestForm, setShowLabRequestForm] = useState(false);
  
  // Form states
  const [prescriptionForm, setPrescriptionForm] = useState({
    patientId: '',
    diagnosis: '',
    medication: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: '',
    refillInstructions: ''
  });
  
  const [appointmentForm, setAppointmentForm] = useState({
    patientId: '',
    purpose: '',
    dateTime: '',
    notes: '',
    duration: 30
  });
  
  const [labRequestForm, setLabRequestForm] = useState({
    patientId: '',
    testType: '',
    priority: 'normal',
    notes: ''
  });

  // Data fetching
  const { data: patients, add: addPatient, update: updatePatient } = useFirestore('patients');
  const { data: prescriptions, add: addPrescription, update: updatePrescription, remove: removePrescription } = useFirestore('prescriptions');
  const { data: appointments, add: addAppointment, update: updateAppointment, remove: removeAppointment } = useFirestore('appointments');
  const { data: labReports, update: updateLabReport } = useFirestore('reports');
  const { data: healthMetrics } = useFirestore('healthMetrics');

  // Filter data for current doctor
  const doctorPatients = patients.filter(p => p.doctorId === userData?.id);
  const doctorPrescriptions = prescriptions.filter(p => p.doctorId === userData?.id);
  const doctorAppointments = appointments.filter(a => a.doctorId === userData?.id);
  const doctorLabReports = labReports.filter(r => r.doctorId === userData?.id);

  // Get selected patient data
  const selectedPatientData = doctorPatients.find(p => p.id === selectedPatient);

  // Handle prescription submission
  const handlePrescriptionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData || !prescriptionForm.patientId) return;

    try {
      const patient = doctorPatients.find(p => p.id === prescriptionForm.patientId);
      await addPrescription({
        doctorId: userData.id,
        patientId: prescriptionForm.patientId,
        patientName: patient?.name || 'Unknown Patient',
        diagnosis: prescriptionForm.diagnosis,
        medication: prescriptionForm.medication,
        dosage: prescriptionForm.dosage,
        frequency: prescriptionForm.frequency,
        duration: prescriptionForm.duration,
        instructions: prescriptionForm.instructions,
        refillInstructions: prescriptionForm.refillInstructions,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      // Reset form
      setPrescriptionForm({
        patientId: '',
        diagnosis: '',
        medication: '',
        dosage: '',
        frequency: '',
        duration: '',
        instructions: '',
        refillInstructions: ''
      });
      setShowPrescriptionForm(false);

      toast({
        title: 'Success',
        description: 'Prescription created successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create prescription',
        variant: 'destructive',
      });
    }
  };

  // Handle appointment submission
  const handleAppointmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData || !appointmentForm.patientId) return;

    try {
      const patient = doctorPatients.find(p => p.id === appointmentForm.patientId);
      await addAppointment({
        doctorId: userData.id,
        patientId: appointmentForm.patientId,
        patientName: patient?.name || 'Unknown Patient',
        purpose: appointmentForm.purpose,
        dateTime: appointmentForm.dateTime,
        notes: appointmentForm.notes,
        duration: appointmentForm.duration,
        status: 'confirmed',
        followUpNotes: ''
      });

      // Reset form
      setAppointmentForm({
        patientId: '',
        purpose: '',
        dateTime: '',
        notes: '',
        duration: 30
      });
      setShowAppointmentForm(false);

      toast({
        title: 'Success',
        description: 'Appointment scheduled successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to schedule appointment',
        variant: 'destructive',
      });
    }
  };

  // Handle lab request submission
  const handleLabRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData || !labRequestForm.patientId) return;

    try {
      const patient = doctorPatients.find(p => p.id === labRequestForm.patientId);
      await addLabRequest({
        doctorId: userData.id,
        patientId: labRequestForm.patientId,
        patientName: patient?.name || 'Unknown Patient',
        testType: labRequestForm.testType,
        priority: labRequestForm.priority,
        notes: labRequestForm.notes,
        status: 'pending',
        createdAt: new Date().toISOString()
      });

      // Reset form
      setLabRequestForm({
        patientId: '',
        testType: '',
        priority: 'normal',
        notes: ''
      });
      setShowLabRequestForm(false);

      toast({
        title: 'Success',
        description: 'Lab request submitted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit lab request',
        variant: 'destructive',
      });
    }
  };

  // Update prescription status
  const updatePrescriptionStatus = async (prescriptionId: string, status: string) => {
    try {
      await updatePrescription(prescriptionId, { status, updatedAt: new Date().toISOString() });
      toast({
        title: 'Success',
        description: 'Prescription status updated',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update prescription status',
        variant: 'destructive',
      });
    }
  };

  // Update appointment status
  const updateAppointmentStatus = async (appointmentId: string, status: string) => {
    try {
      await updateAppointment(appointmentId, { status });
      toast({
        title: 'Success',
        description: 'Appointment status updated',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update appointment status',
        variant: 'destructive',
      });
    }
  };

  // Add lab request (mock function for now)
  const addLabRequest = async (data: any) => {
    // This would integrate with the lab system
    console.log('Lab request added:', data);
  };

  // AI-powered alerts and recommendations
  const getAIRecommendations = (patient: Patient) => {
    const recommendations = [];
    
    // Check for drug interactions
    if (patient.currentMedications.length > 1) {
      recommendations.push({
        type: 'warning',
        message: 'Multiple medications detected. Review for potential interactions.',
        priority: 'medium'
      });
    }
    
    // Check for missed appointments
    const lastVisit = new Date(patient.lastVisit);
    const daysSinceLastVisit = Math.floor((Date.now() - lastVisit.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceLastVisit > 90) {
      recommendations.push({
        type: 'info',
        message: `Patient hasn't visited in ${daysSinceLastVisit} days. Consider follow-up.`,
        priority: 'low'
      });
    }
    
    return recommendations;
  };

  if (!userData) return null;

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('doctorDashboard')}</h1>
            <p className="text-gray-600">{t('managePatientsPrescriptionsAppointments')}</p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="text-sm">
              {doctorPatients.length} {t('patients')}
            </Badge>
            <Badge variant="outline" className="text-sm">
              {doctorAppointments.filter(a => a.status === 'confirmed').length} {t('upcoming')}
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">{t('overview')}</TabsTrigger>
          <TabsTrigger value="patients">{t('patients')}</TabsTrigger>
          <TabsTrigger value="prescriptions">{t('prescriptions')}</TabsTrigger>
          <TabsTrigger value="appointments">{t('appointments')}</TabsTrigger>
          <TabsTrigger value="reports">{t('labReports')}</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('totalPatients')}</CardTitle>
                <span className="material-icons text-blue-600">people</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{doctorPatients.length}</div>
                <p className="text-xs text-muted-foreground">{t('activePatientsUnderCare')}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('todaysAppointments')}</CardTitle>
                <span className="material-icons text-green-600">event</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {doctorAppointments.filter(a => 
                    new Date(a.dateTime).toDateString() === new Date().toDateString()
                  ).length}
                </div>
                <p className="text-xs text-muted-foreground">{t('scheduledForToday')}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('activePrescriptions')}</CardTitle>
                <span className="material-icons text-purple-600">medication</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {doctorPrescriptions.filter(p => p.status === 'active').length}
                </div>
                <p className="text-xs text-muted-foreground">{t('currentlyActive')}</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>{t('recentActivity')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {doctorPrescriptions.slice(0, 5).map((prescription) => (
                  <div key={prescription.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="material-icons text-blue-600">medication</span>
                      <div>
                        <p className="font-medium">{prescription.patientName}</p>
                        <p className="text-sm text-gray-600">{prescription.medication}</p>
                      </div>
                    </div>
                    <Badge variant={prescription.status === 'active' ? 'default' : 'secondary'}>
                      {prescription.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Patients Tab */}
        <TabsContent value="patients" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">{t('patientManagement')}</h2>
            <Button onClick={() => setShowPrescriptionForm(true)}>
              <span className="material-icons mr-2">add</span>
              {t('newPrescription')}
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Patient List */}
            <Card>
              <CardHeader>
                <CardTitle>{t('patientList')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {doctorPatients.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">{t('noPatientsFound')}</p>
                  ) : (
                    doctorPatients.map((patient) => (
                      <div 
                        key={patient.id}
                        className={`p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors ${
                          selectedPatient === patient.id ? 'bg-blue-50 border-blue-300' : ''
                        }`}
                        onClick={() => setSelectedPatient(patient.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">{patient.name}</h3>
                            <p className="text-sm text-gray-600">{patient.age} years • {patient.phone}</p>
                          </div>
                          <Badge variant="outline">{patient.healthStatus}</Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Patient Details */}
            {selectedPatientData && (
              <Card>
                <CardHeader>
                  <CardTitle>{t('patientDetails')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg">{selectedPatientData.name}</h3>
                      <p className="text-gray-600">{selectedPatientData.age} years old</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">{t('phone')}</Label>
                        <p className="text-sm">{selectedPatientData.phone}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">{t('lastVisit')}</Label>
                        <p className="text-sm">{formatDateAsMonthYear(selectedPatientData.lastVisit)}</p>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">{t('currentMedications')}</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedPatientData.currentMedications.map((med, index) => (
                          <Badge key={index} variant="secondary">{med}</Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">{t('allergies')}</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedPatientData.allergies.map((allergy, index) => (
                          <Badge key={index} variant="destructive">{allergy}</Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">{t('notes')}</Label>
                      <p className="text-sm text-gray-600 mt-1">{selectedPatientData.notes}</p>
                    </div>

                    {/* AI Recommendations */}
                    <div>
                      <Label className="text-sm font-medium">{t('aiRecommendations')}</Label>
                      <div className="space-y-2 mt-2">
                        {getAIRecommendations(selectedPatientData).map((rec, index) => (
                          <div key={index} className={`p-2 rounded text-sm ${
                            rec.type === 'warning' ? 'bg-yellow-50 text-yellow-800' :
                            rec.type === 'info' ? 'bg-blue-50 text-blue-800' : 'bg-gray-50 text-gray-800'
                          }`}>
                            {rec.message}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Prescriptions Tab */}
        <TabsContent value="prescriptions" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">{t('prescriptionManagement')}</h2>
                         <Button onClick={() => setShowPrescriptionForm(true)}>
               <span className="material-icons mr-2">add</span>
               {t('newPrescription')}
             </Button>
          </div>

          <Card>
            <CardHeader>
                             <CardTitle>{t('allPrescriptions')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {doctorPrescriptions.length === 0 ? (
                                     <p className="text-gray-500 text-center py-4">{t('noPrescriptionsFound')}</p>
                ) : (
                  doctorPrescriptions.map((prescription) => (
                    <div key={prescription.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-medium">{prescription.patientName}</h3>
                          <p className="text-sm text-gray-600">{prescription.medication}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={prescription.status === 'active' ? 'default' : 'secondary'}>
                            {prescription.status}
                          </Badge>
                          <Select 
                            value={prescription.status} 
                            onValueChange={(value) => updatePrescriptionStatus(prescription.id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                                                         <SelectContent>
                               <SelectItem value="active">{t('active')}</SelectItem>
                               <SelectItem value="completed">{t('completed')}</SelectItem>
                               <SelectItem value="renewed">{t('renewed')}</SelectItem>
                             </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <Label className="text-xs font-medium">{t('diagnosis')}</Label>
                          <p className="text-gray-600">{prescription.diagnosis}</p>
                        </div>
                        <div>
                          <Label className="text-xs font-medium">{t('dosage')}</Label>
                          <p className="text-gray-600">{prescription.dosage}</p>
                        </div>
                        <div>
                          <Label className="text-xs font-medium">{t('frequency')}</Label>
                          <p className="text-gray-600">{prescription.frequency}</p>
                        </div>
                        <div>
                          <Label className="text-xs font-medium">{t('duration')}</Label>
                          <p className="text-gray-600">{prescription.duration}</p>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <Label className="text-xs font-medium">{t('instructions')}</Label>
                        <p className="text-gray-600 text-sm">{prescription.instructions}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appointments Tab */}
        <TabsContent value="appointments" className="space-y-6">
          <div className="flex justify-between items-center">
                         <h2 className="text-xl font-semibold">{t('appointmentManagement')}</h2>
                         <Button onClick={() => setShowAppointmentForm(true)}>
               <span className="material-icons mr-2">add</span>
               {t('scheduleAppointment')}
             </Button>
          </div>

          <Card>
            <CardHeader>
                             <CardTitle>{t('allAppointments')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {doctorAppointments.length === 0 ? (
                                     <p className="text-gray-500 text-center py-4">{t('noAppointmentsFound')}</p>
                ) : (
                  doctorAppointments.map((appointment) => (
                    <div key={appointment.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-medium">{appointment.patientName}</h3>
                          <p className="text-sm text-gray-600">{appointment.purpose}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={
                            appointment.status === 'confirmed' ? 'default' :
                            appointment.status === 'pending' ? 'secondary' :
                            appointment.status === 'cancelled' ? 'destructive' : 'outline'
                          }>
                            {appointment.status}
                          </Badge>
                          <Select 
                            value={appointment.status} 
                            onValueChange={(value) => updateAppointmentStatus(appointment.id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                                                         <SelectContent>
                               <SelectItem value="confirmed">{t('confirmed')}</SelectItem>
                               <SelectItem value="pending">{t('pending')}</SelectItem>
                               <SelectItem value="cancelled">{t('cancelled')}</SelectItem>
                               <SelectItem value="completed">{t('completed')}</SelectItem>
                             </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <Label className="text-xs font-medium">{t('dateTime')}</Label>
                          <p className="text-gray-600">{formatDateTime(appointment.dateTime)}</p>
                        </div>
                        <div>
                          <Label className="text-xs font-medium">{t('duration')}</Label>
                          <p className="text-gray-600">{appointment.duration} minutes</p>
                        </div>
                        <div>
                          <Label className="text-xs font-medium">{t('notes')}</Label>
                          <p className="text-gray-600">{appointment.notes}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Lab Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <div className="flex justify-between items-center">
                         <h2 className="text-xl font-semibold">{t('labReportManagement')}</h2>
                         <Button onClick={() => setShowLabRequestForm(true)}>
               <span className="material-icons mr-2">add</span>
               {t('requestLabTest')}
             </Button>
          </div>

          <Card>
            <CardHeader>
                             <CardTitle>{t('labReports')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {doctorLabReports.length === 0 ? (
                                     <p className="text-gray-500 text-center py-4">{t('noLabReportsFound')}</p>
                ) : (
                  doctorLabReports.map((report) => (
                    <div key={report.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-medium">{report.patientName}</h3>
                          <p className="text-sm text-gray-600">{report.title}</p>
                        </div>
                        <Badge variant={
                          report.status === 'completed' ? 'default' :
                          report.status === 'pending' ? 'secondary' : 'outline'
                        }>
                          {report.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <Label className="text-xs font-medium">{t('created')}</Label>
                          <p className="text-gray-600">{formatDateAsMonthYear(report.createdAt)}</p>
                        </div>
                        {report.completedAt && (
                          <div>
                            <Label className="text-xs font-medium">{t('completed')}</Label>
                            <p className="text-gray-600">{formatDateAsMonthYear(report.completedAt)}</p>
                          </div>
                        )}
                        <div>
                          <Label className="text-xs font-medium">{t('notes')}</Label>
                          <p className="text-gray-600">{report.notes}</p>
                        </div>
                      </div>
                      
                      {report.status === 'completed' && (
                        <div className="mt-3">
                                                     <Button variant="outline" size="sm">
                             <span className="material-icons mr-2">visibility</span>
                             {t('viewReport')}
                           </Button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Prescription Form Modal */}
      {showPrescriptionForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                         <h3 className="text-lg font-semibold mb-4">{t('newPrescription')}</h3>
            <form onSubmit={handlePrescriptionSubmit} className="space-y-4">
              <div>
                <Label htmlFor="patientId">{t('patient')}</Label>
                <Select 
                  value={prescriptionForm.patientId} 
                  onValueChange={(value) => setPrescriptionForm(prev => ({ ...prev, patientId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectPatient')} />
                  </SelectTrigger>
                  <SelectContent>
                    {doctorPatients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="diagnosis">{t('diagnosis')}</Label>
                <Input
                  id="diagnosis"
                  value={prescriptionForm.diagnosis}
                  onChange={(e) => setPrescriptionForm(prev => ({ ...prev, diagnosis: e.target.value }))}
                  placeholder={t('enterDiagnosis')}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="medication">{t('medication')}</Label>
                <Input
                  id="medication"
                  value={prescriptionForm.medication}
                  onChange={(e) => setPrescriptionForm(prev => ({ ...prev, medication: e.target.value }))}
                  placeholder={t('enterMedicationName')}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dosage">{t('dosage')}</Label>
                  <Input
                    id="dosage"
                    value={prescriptionForm.dosage}
                    onChange={(e) => setPrescriptionForm(prev => ({ ...prev, dosage: e.target.value }))}
                    placeholder={t('dosagePlaceholder')}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="frequency">{t('frequency')}</Label>
                  <Input
                    id="frequency"
                    value={prescriptionForm.frequency}
                    onChange={(e) => setPrescriptionForm(prev => ({ ...prev, frequency: e.target.value }))}
                    placeholder={t('frequencyPlaceholder')}
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="duration">{t('duration')}</Label>
                <Input
                  id="duration"
                  value={prescriptionForm.duration}
                  onChange={(e) => setPrescriptionForm(prev => ({ ...prev, duration: e.target.value }))}
                  placeholder={t('durationPlaceholder')}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="instructions">{t('instructions')}</Label>
                <Textarea
                  id="instructions"
                  value={prescriptionForm.instructions}
                  onChange={(e) => setPrescriptionForm(prev => ({ ...prev, instructions: e.target.value }))}
                  placeholder={t('specialInstructions')}
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="refillInstructions">{t('refillInstructions')}</Label>
                <Textarea
                  id="refillInstructions"
                  value={prescriptionForm.refillInstructions}
                  onChange={(e) => setPrescriptionForm(prev => ({ ...prev, refillInstructions: e.target.value }))}
                  placeholder={t('instructionsForRefills')}
                  rows={2}
                />
              </div>
              
              <div className="flex space-x-3">
                                 <Button type="submit" className="flex-1">{t('createPrescription')}</Button>
                                 <Button 
                   type="button" 
                   variant="outline" 
                   onClick={() => setShowPrescriptionForm(false)}
                   className="flex-1"
                 >
                   {t('cancel')}
                 </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Appointment Form Modal */}
      {showAppointmentForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                         <h3 className="text-lg font-semibold mb-4">{t('scheduleAppointment')}</h3>
            <form onSubmit={handleAppointmentSubmit} className="space-y-4">
              <div>
                <Label htmlFor="patientId">{t('patient')}</Label>
                <Select 
                  value={appointmentForm.patientId} 
                  onValueChange={(value) => setAppointmentForm(prev => ({ ...prev, patientId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectPatient')} />
                  </SelectTrigger>
                  <SelectContent>
                    {doctorPatients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="purpose">{t('purpose')}</Label>
                <Input
                  id="purpose"
                  value={appointmentForm.purpose}
                  onChange={(e) => setAppointmentForm(prev => ({ ...prev, purpose: e.target.value }))}
                  placeholder={t('appointmentPurpose')}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="dateTime">{t('dateTime')}</Label>
                <Input
                  id="dateTime"
                  type="datetime-local"
                  value={appointmentForm.dateTime}
                  onChange={(e) => setAppointmentForm(prev => ({ ...prev, dateTime: e.target.value }))}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="duration">{t('durationMinutes')}</Label>
                <Input
                  id="duration"
                  type="number"
                  value={appointmentForm.duration}
                  onChange={(e) => setAppointmentForm(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                  min="15"
                  max="120"
                  step="15"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="notes">{t('notes')}</Label>
                <Textarea
                  id="notes"
                  value={appointmentForm.notes}
                  onChange={(e) => setAppointmentForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder={t('additionalNotes')}
                  rows={3}
                />
              </div>
              
              <div className="flex space-x-3">
                                 <Button type="submit" className="flex-1">{t('schedule')}</Button>
                                 <Button 
                   type="button" 
                   variant="outline" 
                   onClick={() => setShowAppointmentForm(false)}
                   className="flex-1"
                 >
                   {t('cancel')}
                 </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lab Request Form Modal */}
      {showLabRequestForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">{t('requestLabTest')}</h3>
            <form onSubmit={handleLabRequestSubmit} className="space-y-4">
              <div>
                <Label htmlFor="patientId">{t('patient')}</Label>
                <Select 
                  value={labRequestForm.patientId} 
                  onValueChange={(value) => setLabRequestForm(prev => ({ ...prev, patientId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectPatient')} />
                  </SelectTrigger>
                  <SelectContent>
                    {doctorPatients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="testType">{t('testType')}</Label>
                <Input
                  id="testType"
                  value={labRequestForm.testType}
                  onChange={(e) => setLabRequestForm(prev => ({ ...prev, testType: e.target.value }))}
                  placeholder={t('testTypePlaceholder')}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="priority">{t('priority')}</Label>
                <Select 
                  value={labRequestForm.priority} 
                  onValueChange={(value) => setLabRequestForm(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectPriority')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">{t('low')}</SelectItem>
                    <SelectItem value="normal">{t('normal')}</SelectItem>
                    <SelectItem value="high">{t('high')}</SelectItem>
                    <SelectItem value="urgent">{t('urgent')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="notes">{t('notes')}</Label>
                <Textarea
                  id="notes"
                  value={labRequestForm.notes}
                  onChange={(e) => setLabRequestForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder={t('specialInstructionsOrNotes')}
                  rows={3}
                />
              </div>
              
              <div className="flex space-x-3">
                <Button type="submit" className="flex-1">{t('submitRequest')}</Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowLabRequestForm(false)}
                  className="flex-1"
                >
                  {t('cancel')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;
