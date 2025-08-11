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

interface LabReport {
  id: string;
  labId: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  title: string;
  testType: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  completedAt?: string;
  dueDate: string;
  fileURL?: string;
  notes: string;
  results: TestResult[];
  doctorName?: string;
  labName: string;
}

interface TestResult {
  parameter: string;
  value: string | number;
  unit: string;
  normalRange: string;
  status: 'normal' | 'low' | 'high' | 'critical';
  flag?: string;
}

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  age: number;
  gender: string;
  bloodType: string;
  medicalHistory: string[];
  allergies: string[];
}

interface TestType {
  id: string;
  name: string;
  category: string;
  description: string;
  preparation: string;
  turnaroundTime: string;
  price: number;
}

const LabDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { userData } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Data states
  const [labReports, setLabReports] = useState<LabReport[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [testTypes, setTestTypes] = useState<TestType[]>([]);
  
  // Form states
  const [showReportModal, setShowReportModal] = useState(false);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [showTestTypeModal, setShowTestTypeModal] = useState(false);
  
  // Form data
  const [newReport, setNewReport] = useState({
    patientId: '',
    title: '',
    testType: '',
    priority: 'medium' as LabReport['priority'],
    dueDate: '',
    notes: '',
    doctorName: ''
  });
  
  const [newPatient, setNewPatient] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    gender: '',
    bloodType: '',
    medicalHistory: [] as string[],
    allergies: [] as string[]
  });
  
  const [newTestType, setNewTestType] = useState({
    name: '',
    category: '',
    description: '',
    preparation: '',
    turnaroundTime: '',
    price: ''
  });

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    patientEmail: '',
    title: '',
    file: null as File | null,
    notes: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Initialize demo data
  useEffect(() => {
    const initializeDemoData = async () => {
      if (!userData) return;
      
      try {
        setLoading(true);
        
        // Check if demo data exists
        const existingReports = localStorage.getItem('mock_lab_reports');
        const existingPatients = localStorage.getItem('mock_lab_patients');
        const existingTestTypes = localStorage.getItem('mock_test_types');
        
        if (!existingReports || !existingPatients || !existingTestTypes) {
          await generateDemoData(userData.id, 'lab', userData.email || '');
        }
        
        // Load data from localStorage
        const reportsData = JSON.parse(localStorage.getItem('mock_lab_reports') || '[]');
        const patientsData = JSON.parse(localStorage.getItem('mock_lab_patients') || '[]');
        const testTypesData = JSON.parse(localStorage.getItem('mock_test_types') || '[]');
        
        setLabReports(reportsData);
        setPatients(patientsData);
        setTestTypes(testTypesData);
        
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

  // Lab Report CRUD operations
  const handleAddReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData) return;

    const patient = patients.find(p => p.id === newReport.patientId);
    if (!patient) return;

    const testType = testTypes.find(t => t.id === newReport.testType);
    if (!testType) return;

    const report: LabReport = {
      id: `report_${Date.now()}`,
      labId: userData.id,
      patientId: newReport.patientId,
      patientName: patient.name,
      patientEmail: patient.email,
      title: newReport.title,
      testType: testType.name,
      status: 'pending',
      priority: newReport.priority,
      createdAt: new Date().toISOString(),
      dueDate: newReport.dueDate,
      notes: newReport.notes,
      results: [],
      doctorName: newReport.doctorName,
      labName: userData.labName || 'Medical Laboratory'
    };

    const updatedReports = [...labReports, report];
    setLabReports(updatedReports);
    saveData('lab_reports', updatedReports);
    
    setShowReportModal(false);
    resetReportForm();
    
    toast({
      title: 'Success',
      description: 'Lab report created successfully',
    });
  };

  const handleUpdateReportStatus = async (reportId: string, status: LabReport['status']) => {
    const updatedReports = labReports.map(report => {
      if (report.id === reportId) {
        return {
          ...report,
          status,
          completedAt: status === 'completed' ? new Date().toISOString() : report.completedAt
        };
      }
      return report;
    });
    
    setLabReports(updatedReports);
    saveData('lab_reports', updatedReports);
    
    toast({
      title: 'Success',
      description: 'Report status updated successfully',
    });
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!confirm('Are you sure you want to delete this report?')) return;
    
    const updatedReports = labReports.filter(r => r.id !== reportId);
    setLabReports(updatedReports);
    saveData('lab_reports', updatedReports);
    
    toast({
      title: 'Success',
      description: 'Report deleted successfully',
    });
  };

  // Patient CRUD operations
  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();

    const patient: Patient = {
      id: `patient_${Date.now()}`,
      name: newPatient.name,
      email: newPatient.email,
      phone: newPatient.phone,
      age: parseInt(newPatient.age),
      gender: newPatient.gender,
      bloodType: newPatient.bloodType,
      medicalHistory: newPatient.medicalHistory,
      allergies: newPatient.allergies
    };

    const updatedPatients = [...patients, patient];
    setPatients(updatedPatients);
    saveData('lab_patients', updatedPatients);
    
    setShowPatientModal(false);
    resetPatientForm();
    
    toast({
      title: 'Success',
      description: 'Patient added successfully',
    });
  };

  const handleDeletePatient = async (patientId: string) => {
    if (!confirm('Are you sure you want to delete this patient?')) return;
    
    const updatedPatients = patients.filter(p => p.id !== patientId);
    setPatients(updatedPatients);
    saveData('lab_patients', updatedPatients);
    
    toast({
      title: 'Success',
      description: 'Patient deleted successfully',
    });
  };

  // Test Type CRUD operations
  const handleAddTestType = async (e: React.FormEvent) => {
    e.preventDefault();

    const testType: TestType = {
      id: `test_${Date.now()}`,
      name: newTestType.name,
      category: newTestType.category,
      description: newTestType.description,
      preparation: newTestType.preparation,
      turnaroundTime: newTestType.turnaroundTime,
      price: parseFloat(newTestType.price)
    };

    const updatedTestTypes = [...testTypes, testType];
    setTestTypes(updatedTestTypes);
    saveData('test_types', updatedTestTypes);
    
    setShowTestTypeModal(false);
    resetTestTypeForm();
    
    toast({
      title: 'Success',
      description: 'Test type added successfully',
    });
  };

  // Upload functionality
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData || !selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('patientEmail', uploadForm.patientEmail);
    formData.append('title', uploadForm.title);
    formData.append('notes', uploadForm.notes);

    setUploading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      const newReport: LabReport = {
        id: `report_${Date.now()}`,
        labId: userData.id,
        patientId: 'patient_1', // Placeholder, needs actual patient ID
        patientName: 'Patient Name', // Placeholder
        patientEmail: uploadForm.patientEmail,
        title: uploadForm.title,
        testType: 'Blood Test', // Placeholder
        status: 'pending',
        priority: 'medium',
        createdAt: new Date().toISOString(),
        dueDate: '2023-12-31', // Placeholder
        notes: uploadForm.notes,
        results: [],
        doctorName: 'Dr. Smith', // Placeholder
        labName: userData.labName || 'Medical Laboratory'
      };
      setLabReports(prev => [...prev, newReport]);
      saveData('lab_reports', [...labReports, newReport]);
      toast({
        title: 'Success',
        description: 'Report uploaded successfully!',
      });
      setUploadForm({ patientEmail: '', title: '', file: null, notes: '' });
      setSelectedFile(null);
    } catch (error) {
      console.error('Error uploading report:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload report.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  // Form reset functions
  const resetReportForm = () => {
    setNewReport({
      patientId: '', title: '', testType: '', priority: 'medium', dueDate: '', notes: '', doctorName: ''
    });
  };

  const resetPatientForm = () => {
    setNewPatient({
      name: '', email: '', phone: '', age: '', gender: '', bloodType: '', medicalHistory: [], allergies: []
    });
  };

  const resetTestTypeForm = () => {
    setNewTestType({
      name: '', category: '', description: '', preparation: '', turnaroundTime: '', price: ''
    });
  };

  // Computed values
  const dashboardStats = useMemo(() => ({
    totalReports: labReports.length,
    pendingReports: labReports.filter(r => r.status === 'pending').length,
    inProgressReports: labReports.filter(r => r.status === 'in_progress').length,
    completedReports: labReports.filter(r => r.status === 'completed').length,
    urgentReports: labReports.filter(r => r.priority === 'urgent').length,
    totalPatients: patients.length,
    totalTestTypes: testTypes.length
  }), [labReports, patients, testTypes]);

  const filteredReports = useMemo(() => {
    let filtered = labReports;
    
    if (searchTerm) {
      filtered = filtered.filter(report =>
        report.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.testType.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(report => report.status === filterStatus);
    }
    
    if (filterPriority !== 'all') {
      filtered = filtered.filter(report => report.priority === filterPriority);
    }
    
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'date':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          aValue = priorityOrder[a.priority as keyof typeof priorityOrder];
          bValue = priorityOrder[b.priority as keyof typeof priorityOrder];
          break;
        case 'status':
          const statusOrder = { pending: 1, in_progress: 2, completed: 3, cancelled: 4 };
          aValue = statusOrder[a.status as keyof typeof statusOrder];
          bValue = statusOrder[b.status as keyof typeof statusOrder];
          break;
        default:
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
    
    return filtered;
  }, [labReports, searchTerm, filterStatus, filterPriority, sortBy, sortOrder]);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Lab Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12">
              <Loading size="lg" text="Loading dashboard..." variant="healthcare" />
              <p className="text-gray-400 text-sm text-center mt-4">Please wait while we fetch your lab data</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
      
      {/* Upload Reports */}
      <div className="space-y-6">
        
        <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-blue-50">
          <CardHeader className="space-y-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg border-b border-blue-100">
            <CardTitle className="flex items-center text-xl sm:text-2xl font-bold text-gray-900">
              <span className="material-icons mr-2 text-blue-600">cloud_upload</span>
              {t('uploadReport')}
            </CardTitle>
            <p className="text-sm text-gray-600">
              Upload medical reports and lab results for patients
            </p>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6 p-6">
            <form onSubmit={handleUploadSubmit} className="space-y-4 sm:space-y-6">
              <div className="space-y-2">
                <Label htmlFor="patientEmail" className="text-sm font-medium text-gray-700">
                  {t('patientEmail')}
                </Label>
                <Input
                  id="patientEmail"
                  type="email"
                  value={uploadForm.patientEmail}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, patientEmail: e.target.value }))}
                  placeholder="patient@example.com"
                  required
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                  {t('reportTitle')}
                </Label>
                <Input
                  id="title"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Blood Test Report"
                  required
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="file" className="text-sm font-medium text-gray-700">
                  {t('reportFile')}
                </Label>
                <Input
                  id="file"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileSelect}
                  required
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:transition-colors"
                />
                {selectedFile && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="material-icons text-blue-600 text-lg">description</span>
                        <div>
                          <p className="text-sm font-medium text-blue-900">
                            {selectedFile.name}
                          </p>
                          <p className="text-xs text-blue-700">
                            Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedFile(null)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <span className="material-icons text-lg">close</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
                  {t('notes')}
                </Label>
                <Textarea
                  id="notes"
                  value={uploadForm.notes}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder={t('additionalNotesAboutReport')}
                  rows={3}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full px-6 py-2.5 text-white hover:bg-blue-700 transition-colors shadow-sm"
                disabled={uploading}
                style={{ backgroundColor: 'hsl(207, 90%, 54%)' }}
              >
                {uploading ? (
                  <div className="flex items-center justify-center">
                    <Loading size="sm" />
                    <span className="ml-2">{t('uploading')}</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <span className="material-icons mr-2">cloud_upload</span>
                    {t('uploadReport')}
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

      </div>

      {/* Manage Reports */}
      <div className="space-y-6">
        
        <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-green-50">
          <CardHeader className="space-y-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg border-b border-green-100">
            <CardTitle className="flex items-center text-xl sm:text-2xl font-bold text-gray-900">
              <span className="material-icons mr-2 text-green-600">manage_accounts</span>
              {t('manageReports')}
            </CardTitle>
            <p className="text-sm text-gray-600">
              View and manage uploaded reports
            </p>
          </CardHeader>
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="overview" className="text-sm font-medium">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="reports" className="text-sm font-medium">
                  Reports ({labReports.length})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-900">Total Reports</p>
                        <p className="text-2xl font-bold text-blue-600">{labReports.length}</p>
                      </div>
                      <span className="material-icons text-blue-600 text-2xl">description</span>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-900">Completed</p>
                        <p className="text-2xl font-bold text-green-600">
                          {labReports.filter(r => r.status === 'completed').length}
                        </p>
                      </div>
                      <span className="material-icons text-green-600 text-2xl">check_circle</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-yellow-900">Pending Reports</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {labReports.filter(r => r.status === 'pending').length}
                      </p>
                    </div>
                    <span className="material-icons text-yellow-600 text-2xl">pending</span>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="reports" className="space-y-4">
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {labReports.map((report) => (
                    <div
                      key={report.id}
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{report.title}</h4>
                        <Badge 
                          variant={report.status === 'completed' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {report.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        Patient: {report.patientName} • Type: {report.testType}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Created: {new Date(report.createdAt).toLocaleDateString()}</span>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateReportStatus(report.id, 'completed')}
                            disabled={report.status === 'completed'}
                            className="h-7 px-2 text-xs"
                          >
                            Complete
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateReportStatus(report.id, 'in_progress')}
                            disabled={report.status === 'in_progress'}
                            className="h-7 px-2 text-xs"
                          >
                            In Progress
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default LabDashboard;
