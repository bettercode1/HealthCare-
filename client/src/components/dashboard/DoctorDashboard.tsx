import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Loading } from '@/components/ui/loading';
import { motion, AnimatePresence } from 'framer-motion';
import { generateDemoData } from '@/lib/demoData';
import { useAuth } from '@/contexts/AuthContext';

interface Patient {
  id: string;
  doctorId: string;
  name: string;
  age: number;
  phone: string;
  email: string;
  gender: string;
  bloodType: string;
  lastVisit: string;
  nextAppointment: string;
  medicalHistory: string[];
  allergies: string[];
  currentMedications: string[];
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  insurance: {
    provider: string;
    number: string;
  };
  status: 'active' | 'inactive' | 'pending';
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
  type: 'consultation' | 'follow-up' | 'emergency' | 'routine';
  priority: 'low' | 'medium' | 'high';
}

interface Prescription {
  id: string;
  doctorId: string;
  patientId: string;
  patientName: string;
  diagnosis: string;
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
  }>;
  notes: string;
  prescribedDate: string;
  nextFollowUp: string;
  status: 'active' | 'completed' | 'discontinued';
}

interface MedicalRecord {
  id: string;
  doctorId: string;
  patientId: string;
  patientName: string;
  visitDate: string;
  symptoms: string[];
  diagnosis: string;
  treatment: string;
  prescriptions: string[];
  followUpNotes: string;
  vitals: {
    bloodPressure: string;
    heartRate: number;
    temperature: number;
    weight: number;
  };
}

const DoctorDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { userData } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Data states
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  
  // Form states
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [showMedicalRecordModal, setShowMedicalRecordModal] = useState(false);
  
  // Form data
  const [newPatient, setNewPatient] = useState({
    name: '',
    age: '',
    phone: '',
    email: '',
    gender: '',
    bloodType: '',
    medicalHistory: [] as string[],
    allergies: [] as string[],
    currentMedications: [] as string[],
    emergencyContact: { name: '', phone: '', relationship: '' },
    insurance: { provider: '', number: '' }
  });
  
  const [newAppointment, setNewAppointment] = useState({
    patientId: '',
    purpose: '',
    dateTime: '',
    notes: '',
    duration: 30,
    type: 'consultation' as Appointment['type'],
    priority: 'medium' as Appointment['priority']
  });
  
  const [newPrescription, setNewPrescription] = useState({
    patientId: '',
    diagnosis: '',
    medications: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
    notes: '',
    nextFollowUp: ''
  });
  
  const [newMedicalRecord, setNewMedicalRecord] = useState({
    patientId: '',
    visitDate: '',
    symptoms: [] as string[],
    diagnosis: '',
    treatment: '',
    prescriptions: [] as string[],
    followUpNotes: '',
    vitals: { bloodPressure: '', heartRate: '', temperature: '', weight: '' }
  });

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'status'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Initialize demo data
  useEffect(() => {
    const initializeDemoData = async () => {
      if (!userData) return;
      
      try {
        setLoading(true);
        
        // Check if demo data exists
        const existingPatients = localStorage.getItem('mock_patients');
        const existingAppointments = localStorage.getItem('mock_appointments');
        
        if (!existingPatients || !existingAppointments) {
          await generateDemoData(userData.id, 'doctor', userData.email || '');
        }
        
        // Load data from localStorage
        const patientsData = JSON.parse(localStorage.getItem('mock_patients') || '[]');
        const appointmentsData = JSON.parse(localStorage.getItem('mock_appointments') || '[]');
        const prescriptionsData = JSON.parse(localStorage.getItem('mock_prescriptions') || '[]');
        const medicalRecordsData = JSON.parse(localStorage.getItem('mock_medical_records') || '[]');
        
        setPatients(patientsData);
        setAppointments(appointmentsData);
        setPrescriptions(prescriptionsData);
        setMedicalRecords(medicalRecordsData);
        
      } catch (error) {
        console.error('Error initializing demo data:', error);
        toast({
          title: 'Error',
          description: 'Failed to initialize demo data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    if (userData) {
      initializeDemoData();
    }
  }, [userData, toast]);

  // Save data to localStorage
  const saveData = useCallback((key: string, data: any[]) => {
    localStorage.setItem(`mock_${key}`, JSON.stringify(data));
  }, []);

  // Patient CRUD operations
  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData) return;

    const patient: Patient = {
      id: `patient_${Date.now()}`,
      doctorId: userData.id,
      name: newPatient.name,
      age: parseInt(newPatient.age),
      phone: newPatient.phone,
      email: newPatient.email,
      gender: newPatient.gender,
      bloodType: newPatient.bloodType,
      lastVisit: new Date().toISOString(),
      nextAppointment: '',
      medicalHistory: newPatient.medicalHistory,
      allergies: newPatient.allergies,
      currentMedications: newPatient.currentMedications,
      emergencyContact: newPatient.emergencyContact,
      insurance: newPatient.insurance,
      status: 'active'
    };

    const updatedPatients = [...patients, patient];
    setPatients(updatedPatients);
    saveData('patients', updatedPatients);
    
    setShowPatientModal(false);
    resetPatientForm();
    
    toast({
      title: 'Success',
      description: 'Patient added successfully',
    });
  };

  const handleUpdatePatient = async (patientId: string, updates: Partial<Patient>) => {
    const updatedPatients = patients.map(p => 
      p.id === patientId ? { ...p, ...updates } : p
    );
    setPatients(updatedPatients);
    saveData('patients', updatedPatients);
    
    toast({
      title: 'Success',
      description: 'Patient updated successfully',
    });
  };

  const handleDeletePatient = async (patientId: string) => {
    if (!confirm('Are you sure you want to delete this patient?')) return;
    
    const updatedPatients = patients.filter(p => p.id !== patientId);
    setPatients(updatedPatients);
    saveData('patients', updatedPatients);
    
    toast({
      title: 'Success',
      description: 'Patient deleted successfully',
    });
  };

  // Appointment CRUD operations
  const handleAddAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData) return;

    const patient = patients.find(p => p.id === newAppointment.patientId);
    if (!patient) return;

    const appointment: Appointment = {
      id: `apt_${Date.now()}`,
      doctorId: userData.id,
      patientId: newAppointment.patientId,
      patientName: patient.name,
      purpose: newAppointment.purpose,
      dateTime: newAppointment.dateTime,
      status: 'pending',
      notes: newAppointment.notes,
      duration: newAppointment.duration,
      type: newAppointment.type,
      priority: newAppointment.priority
    };

    const updatedAppointments = [...appointments, appointment];
    setAppointments(updatedAppointments);
    saveData('appointments', updatedAppointments);
    
    setShowAppointmentModal(false);
    resetAppointmentForm();
    
    toast({
      title: 'Success',
      description: 'Appointment scheduled successfully',
    });
  };

  const handleUpdateAppointmentStatus = async (appointmentId: string, status: Appointment['status']) => {
    const updatedAppointments = appointments.map(apt => 
      apt.id === appointmentId ? { ...apt, status } : apt
    );
    setAppointments(updatedAppointments);
    saveData('appointments', updatedAppointments);
    
    toast({
      title: 'Success',
      description: 'Appointment status updated',
    });
  };

  // Prescription CRUD operations
  const handleAddPrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData) return;

    const patient = patients.find(p => p.id === newPrescription.patientId);
    if (!patient) return;

    const prescription: Prescription = {
      id: `prescription_${Date.now()}`,
      doctorId: userData.id,
      patientId: newPrescription.patientId,
      patientName: patient.name,
      diagnosis: newPrescription.diagnosis,
      medications: newPrescription.medications,
      notes: newPrescription.notes,
      prescribedDate: new Date().toISOString(),
      nextFollowUp: newPrescription.nextFollowUp,
      status: 'active'
    };

    const updatedPrescriptions = [...prescriptions, prescription];
    setPrescriptions(updatedPrescriptions);
    saveData('prescriptions', updatedPrescriptions);
    
    setShowPrescriptionModal(false);
    resetPrescriptionForm();
    
    toast({
      title: 'Success',
      description: 'Prescription created successfully',
    });
  };

  // Medical Record CRUD operations
  const handleAddMedicalRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData) return;

    const patient = patients.find(p => p.id === newMedicalRecord.patientId);
    if (!patient) return;

    const medicalRecord: MedicalRecord = {
      id: `record_${Date.now()}`,
      doctorId: userData.id,
      patientId: newMedicalRecord.patientId,
      patientName: patient.name,
      visitDate: newMedicalRecord.visitDate,
      symptoms: newMedicalRecord.symptoms,
      diagnosis: newMedicalRecord.diagnosis,
      treatment: newMedicalRecord.treatment,
      prescriptions: newMedicalRecord.prescriptions,
      followUpNotes: newMedicalRecord.followUpNotes,
      vitals: {
        bloodPressure: newMedicalRecord.vitals.bloodPressure,
        heartRate: parseInt(newMedicalRecord.vitals.heartRate) || 0,
        temperature: parseFloat(newMedicalRecord.vitals.temperature) || 0,
        weight: parseFloat(newMedicalRecord.vitals.weight) || 0
      }
    };

    const updatedMedicalRecords = [...medicalRecords, medicalRecord];
    setMedicalRecords(updatedMedicalRecords);
    saveData('medical_records', updatedMedicalRecords);
    
    setShowMedicalRecordModal(false);
    resetMedicalRecordForm();
    
    toast({
      title: 'Success',
      description: 'Medical record created successfully',
    });
  };

  // Form reset functions
  const resetPatientForm = () => {
    setNewPatient({
      name: '', age: '', phone: '', email: '', gender: '', bloodType: '',
      medicalHistory: [], allergies: [], currentMedications: [],
      emergencyContact: { name: '', phone: '', relationship: '' },
      insurance: { provider: '', number: '' }
    });
  };

  const resetAppointmentForm = () => {
    setNewAppointment({
      patientId: '', purpose: '', dateTime: '', notes: '', duration: 30,
      type: 'consultation', priority: 'medium'
    });
  };

  const resetPrescriptionForm = () => {
    setNewPrescription({
      patientId: '', diagnosis: '', medications: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
      notes: '', nextFollowUp: ''
    });
  };

  const resetMedicalRecordForm = () => {
    setNewMedicalRecord({
      patientId: '', visitDate: '', symptoms: [], diagnosis: '', treatment: '',
      prescriptions: [], followUpNotes: '', vitals: { bloodPressure: '', heartRate: '', temperature: '', weight: '' }
    });
  };

  // Computed values
  const dashboardStats = useMemo(() => ({
    totalPatients: patients.length,
    activePatients: patients.filter(p => p.status === 'active').length,
    todayAppointments: appointments.filter(apt => 
      new Date(apt.dateTime).toDateString() === new Date().toDateString()
    ).length,
    pendingAppointments: appointments.filter(apt => apt.status === 'pending').length,
    activePrescriptions: prescriptions.filter(p => p.status === 'active').length,
    totalMedicalRecords: medicalRecords.length
  }), [patients, appointments, prescriptions, medicalRecords]);

  const filteredPatients = useMemo(() => {
    let filtered = patients;
    
    if (searchTerm) {
      filtered = filtered.filter(patient =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phone.includes(searchTerm)
      );
    }
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(patient => patient.status === filterStatus);
    }
    
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'date':
          aValue = new Date(a.lastVisit);
          bValue = new Date(b.lastVisit);
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
    
    return filtered;
  }, [patients, searchTerm, filterStatus, sortBy, sortOrder]);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Doctor Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12">
              <Loading size="lg" text="Loading dashboard..." variant="healthcare" />
              <p className="text-gray-400 text-sm text-center mt-4">Please wait while we fetch your medical data</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50/50">
          <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="material-icons text-white text-xl">medical_services</span>
                </div>
                <CardTitle className="text-xl font-bold text-white">Doctor Dashboard</CardTitle>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-white/90">
                  Welcome back, Dr. {userData?.name || 'Doctor'}
                </span>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-5 mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="patients">Patients</TabsTrigger>
                <TabsTrigger value="appointments">Appointments</TabsTrigger>
                <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
                <TabsTrigger value="records">Medical Records</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                {/* Dashboard Stats */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <motion.div 
                    className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl text-white"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <div className="text-2xl font-bold">{dashboardStats.totalPatients}</div>
                    <div className="text-sm text-blue-100">Total Patients</div>
                  </motion.div>
                  
                  <motion.div 
                    className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-xl text-white"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="text-2xl font-bold">{dashboardStats.activePatients}</div>
                    <div className="text-sm text-green-100">Active Patients</div>
                  </motion.div>
                  
                  <motion.div 
                    className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl text-white"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="text-2xl font-bold">{dashboardStats.todayAppointments}</div>
                    <div className="text-sm text-purple-100">Today's Appointments</div>
                  </motion.div>
                  
                  <motion.div 
                    className="p-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl text-white"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <div className="text-2xl font-bold">{dashboardStats.pendingAppointments}</div>
                    <div className="text-sm text-orange-100">Pending Appointments</div>
                  </motion.div>
                  
                  <motion.div 
                    className="p-4 bg-gradient-to-br from-red-500 to-red-600 rounded-xl text-white"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <div className="text-2xl font-bold">{dashboardStats.activePrescriptions}</div>
                    <div className="text-sm text-red-100">Active Prescriptions</div>
                  </motion.div>
                  
                  <motion.div 
                    className="p-4 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl text-white"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    <div className="text-2xl font-bold">{dashboardStats.totalMedicalRecords}</div>
                    <div className="text-sm text-indigo-100">Medical Records</div>
                  </motion.div>
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recent Appointments */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Recent Appointments</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {appointments.slice(0, 5).map((apt) => (
                          <div key={apt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium">{apt.patientName}</p>
                              <p className="text-sm text-gray-600">{apt.purpose}</p>
                            </div>
                            <Badge variant={apt.status === 'confirmed' ? 'default' : 'secondary'}>
                              {apt.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recent Patients */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Recent Patients</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {patients.slice(0, 5).map((patient) => (
                          <div key={patient.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium">{patient.name}</p>
                              <p className="text-sm text-gray-600">{patient.age} years • {patient.gender}</p>
                            </div>
                            <Badge variant={patient.status === 'active' ? 'default' : 'secondary'}>
                              {patient.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Patients Tab */}
              <TabsContent value="patients" className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">Patient Management</h3>
                  <Dialog open={showPatientModal} onOpenChange={setShowPatientModal}>
                    <DialogTrigger asChild>
                      <Button className="bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                        <span className="material-icons mr-2">person_add</span>
                        Add Patient
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                              <span className="material-icons text-green-600 text-xl">person_add</span>
                            </div>
                            <div>
                              <DialogTitle className="text-2xl font-bold text-green-900">Add New Patient</DialogTitle>
                              <p className="text-sm text-green-700">Register a new patient to your practice</p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowPatientModal(false)}
                            className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </DialogHeader>
                      <form onSubmit={handleAddPatient} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="name" className="text-gray-700">Full Name</Label>
                            <Input
                              id="name"
                              value={newPatient.name}
                              onChange={(e) => setNewPatient(prev => ({ ...prev, name: e.target.value }))}
                              placeholder="Enter full name"
                              className="h-11 focus:ring-2 focus:ring-green-500"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="age" className="text-gray-700">Age</Label>
                            <Input
                              id="age"
                              type="number"
                              value={newPatient.age}
                              onChange={(e) => setNewPatient(prev => ({ ...prev, age: e.target.value }))}
                              placeholder="Age"
                              className="h-11 focus:ring-2 focus:ring-green-500"
                              required
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="phone" className="text-gray-700">Phone</Label>
                            <Input
                              id="phone"
                              value={newPatient.phone}
                              onChange={(e) => setNewPatient(prev => ({ ...prev, phone: e.target.value }))}
                              placeholder={t('phoneNumber')}
                              className="h-11 focus:ring-2 focus:ring-green-500"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="email" className="text-gray-700">Email</Label>
                            <Input
                              id="email"
                              type="email"
                              value={newPatient.email}
                              onChange={(e) => setNewPatient(prev => ({ ...prev, email: e.target.value }))}
                              placeholder={t('emailAddress')}
                              className="h-11 focus:ring-2 focus:ring-green-500"
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="gender" className="text-gray-700">Gender</Label>
                            <Select value={newPatient.gender} onValueChange={(value) => setNewPatient(prev => ({ ...prev, gender: value }))}>
                              <SelectTrigger className="h-11 focus:ring-2 focus:ring-green-500">
                                <SelectValue placeholder={t('selectGender')} />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Male">Male</SelectItem>
                                <SelectItem value="Female">Female</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="bloodType" className="text-gray-700">Blood Type</Label>
                            <Select value={newPatient.bloodType} onValueChange={(value) => setNewPatient(prev => ({ ...prev, bloodType: value }))}>
                              <SelectTrigger className="h-11 focus:ring-2 focus:ring-green-500">
                                <SelectValue placeholder="Select blood type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="A+">A+</SelectItem>
                                <SelectItem value="A-">A-</SelectItem>
                                <SelectItem value="B+">B+</SelectItem>
                                <SelectItem value="B-">B-</SelectItem>
                                <SelectItem value="AB+">AB+</SelectItem>
                                <SelectItem value="AB-">AB-</SelectItem>
                                <SelectItem value="O+">O+</SelectItem>
                                <SelectItem value="O-">O-</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <Button type="submit" className="flex-1 h-11 bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                            <span className="material-icons mr-2">person_add</span>
                            Add Patient
                          </Button>
                          <Button type="button" variant="outline" onClick={() => setShowPatientModal(false)} className="flex-1 h-11 shadow-lg hover:shadow-xl transition-all duration-200">
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Search and Filter */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    placeholder="Search patients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="col-span-2"
                  />
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Patients Table */}
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Age</TableHead>
                          <TableHead>Contact</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Last Visit</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredPatients.map((patient) => (
                          <TableRow key={patient.id}>
                            <TableCell className="font-medium">{patient.name}</TableCell>
                            <TableCell>{patient.age} years</TableCell>
                            <TableCell>
                              <div>
                                <p>{patient.phone}</p>
                                <p className="text-sm text-gray-500">{patient.email}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={patient.status === 'active' ? 'default' : 'secondary'}>
                                {patient.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString() : 'Never'}
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button variant="ghost" size="sm">View</Button>
                                <Button variant="ghost" size="sm">Edit</Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => handleDeletePatient(patient.id)}
                                  className="text-red-600"
                                >
                                  Delete
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Appointments Tab */}
              <TabsContent value="appointments" className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">Appointment Management</h3>
                  <Dialog open={showAppointmentModal} onOpenChange={setShowAppointmentModal}>
                    <DialogTrigger asChild>
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <span className="material-icons mr-2">event</span>
                        Schedule Appointment
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Schedule New Appointment</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleAddAppointment} className="space-y-4">
                        <div>
                          <Label htmlFor="patientId">Patient</Label>
                          <Select value={newAppointment.patientId} onValueChange={(value) => setNewAppointment(prev => ({ ...prev, patientId: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select patient" />
                            </SelectTrigger>
                            <SelectContent>
                              {patients.map((patient) => (
                                <SelectItem key={patient.id} value={patient.id}>
                                  {patient.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label htmlFor="purpose">Purpose</Label>
                          <Input
                            id="purpose"
                            value={newAppointment.purpose}
                            onChange={(e) => setNewAppointment(prev => ({ ...prev, purpose: e.target.value }))}
                            placeholder={t('appointmentPurpose')}
                            required
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="dateTime">Date & Time</Label>
                            <Input
                              id="dateTime"
                              type="datetime-local"
                              value={newAppointment.dateTime}
                              onChange={(e) => setNewAppointment(prev => ({ ...prev, dateTime: e.target.value }))}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="duration">Duration (minutes)</Label>
                            <Input
                              id="duration"
                              type="number"
                              value={newAppointment.duration}
                              onChange={(e) => setNewAppointment(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                              min="15"
                              max="120"
                              step="15"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="notes">Notes</Label>
                          <Textarea
                            id="notes"
                            value={newAppointment.notes}
                            onChange={(e) => setNewAppointment(prev => ({ ...prev, notes: e.target.value }))}
                            placeholder="Additional notes"
                          />
                        </div>

                        <div className="flex space-x-2">
                          <Button type="submit" className="flex-1">Schedule Appointment</Button>
                          <Button type="button" variant="outline" onClick={() => setShowAppointmentModal(false)}>
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Appointments List */}
                <div className="grid gap-4">
                  {appointments.map((apt) => (
                    <Card key={apt.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold">{apt.patientName}</h4>
                            <p className="text-sm text-gray-600">{apt.purpose}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(apt.dateTime).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={apt.status === 'confirmed' ? 'default' : 'secondary'}>
                              {apt.status}
                            </Badge>
                            <Select 
                              value={apt.status} 
                              onValueChange={(value: Appointment['status']) => handleUpdateAppointmentStatus(apt.id, value)}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="confirmed">Confirmed</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Prescriptions Tab */}
              <TabsContent value="prescriptions" className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">Prescription Management</h3>
                  <Dialog open={showPrescriptionModal} onOpenChange={setShowPrescriptionModal}>
                    <DialogTrigger asChild>
                      <Button className="bg-purple-600 hover:bg-purple-700">
                        <span className="material-icons mr-2">medication</span>
                        Create Prescription
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Create New Prescription</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleAddPrescription} className="space-y-4">
                        <div>
                          <Label htmlFor="patientId">Patient</Label>
                          <Select value={newPrescription.patientId} onValueChange={(value) => setNewPrescription(prev => ({ ...prev, patientId: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select patient" />
                            </SelectTrigger>
                            <SelectContent>
                              {patients.map((patient) => (
                                <SelectItem key={patient.id} value={patient.id}>
                                  {patient.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label htmlFor="diagnosis">Diagnosis</Label>
                          <Input
                            id="diagnosis"
                            value={newPrescription.diagnosis}
                            onChange={(e) => setNewPrescription(prev => ({ ...prev, diagnosis: e.target.value }))}
                            placeholder="Patient diagnosis"
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="notes">Notes</Label>
                          <Textarea
                            id="notes"
                            value={newPrescription.notes}
                            onChange={(e) => setNewPrescription(prev => ({ ...prev, notes: e.target.value }))}
                            placeholder="Additional notes"
                          />
                        </div>

                        <div className="flex space-x-2">
                          <Button type="submit" className="flex-1">Create Prescription</Button>
                          <Button type="button" variant="outline" onClick={() => setShowPrescriptionModal(false)}>
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Prescriptions List */}
                <div className="grid gap-4">
                  {prescriptions.map((prescription) => (
                    <Card key={prescription.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold">{prescription.patientName}</h4>
                            <p className="text-sm text-gray-600">Diagnosis: {prescription.diagnosis}</p>
                            <p className="text-sm text-gray-500">
                              Prescribed: {new Date(prescription.prescribedDate).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant={prescription.status === 'active' ? 'default' : 'secondary'}>
                            {prescription.status}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Medical Records Tab */}
              <TabsContent value="records" className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">Medical Records</h3>
                  <Dialog open={showMedicalRecordModal} onOpenChange={setShowMedicalRecordModal}>
                    <DialogTrigger asChild>
                      <Button className="bg-indigo-600 hover:bg-indigo-700">
                        <span className="material-icons mr-2">folder</span>
                        Add Record
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Add Medical Record</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleAddMedicalRecord} className="space-y-4">
                        <div>
                          <Label htmlFor="patientId">Patient</Label>
                          <Select value={newMedicalRecord.patientId} onValueChange={(value) => setNewMedicalRecord(prev => ({ ...prev, patientId: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select patient" />
                            </SelectTrigger>
                            <SelectContent>
                              {patients.map((patient) => (
                                <SelectItem key={patient.id} value={patient.id}>
                                  {patient.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label htmlFor="diagnosis">Diagnosis</Label>
                          <Input
                            id="diagnosis"
                            value={newMedicalRecord.diagnosis}
                            onChange={(e) => setNewMedicalRecord(prev => ({ ...prev, diagnosis: e.target.value }))}
                            placeholder="Patient diagnosis"
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="treatment">Treatment</Label>
                          <Textarea
                            id="treatment"
                            value={newMedicalRecord.treatment}
                            onChange={(e) => setNewMedicalRecord(prev => ({ ...prev, treatment: e.target.value }))}
                            placeholder={t('treatmentPlan')}
                          />
                        </div>

                        <div className="flex space-x-2">
                          <Button type="submit" className="flex-1">Add Record</Button>
                          <Button type="button" variant="outline" onClick={() => setShowMedicalRecordModal(false)}>
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Medical Records List */}
                <div className="grid gap-4">
                  {medicalRecords.map((record) => (
                    <Card key={record.id}>
                      <CardContent className="p-4">
                        <div>
                          <h4 className="font-semibold">{record.patientName}</h4>
                          <p className="text-sm text-gray-600">Diagnosis: {record.diagnosis}</p>
                          <p className="text-sm text-gray-500">
                            Visit Date: {new Date(record.visitDate).toLocaleDateString()}
                          </p>
                          {record.treatment && (
                            <p className="text-sm text-gray-600 mt-2">Treatment: {record.treatment}</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
};

export default DoctorDashboard;
