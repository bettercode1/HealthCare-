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
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50/50">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="material-icons text-white text-xl">science</span>
                </div>
                <CardTitle className="text-xl font-bold text-white">Laboratory Dashboard</CardTitle>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-white/90">
                  Welcome back, {userData?.labName || 'Lab Technician'}
                </span>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="reports">Lab Reports</TabsTrigger>
                <TabsTrigger value="patients">Patients</TabsTrigger>
                <TabsTrigger value="testTypes">Test Types</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                {/* Dashboard Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <motion.div 
                    className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl text-white"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <div className="text-2xl font-bold">{dashboardStats.totalReports}</div>
                    <div className="text-sm text-blue-100">Total Reports</div>
                  </motion.div>
                  
                  <motion.div 
                    className="p-4 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl text-white"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="text-2xl font-bold">{dashboardStats.pendingReports}</div>
                    <div className="text-sm text-yellow-100">Pending Reports</div>
                  </motion.div>
                  
                  <motion.div 
                    className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-xl text-white"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="text-2xl font-bold">{dashboardStats.completedReports}</div>
                    <div className="text-sm text-green-100">Completed Reports</div>
                  </motion.div>
                  
                  <motion.div 
                    className="p-4 bg-gradient-to-br from-red-500 to-red-600 rounded-xl text-white"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <div className="text-2xl font-bold">{dashboardStats.urgentReports}</div>
                    <div className="text-sm text-red-100">Urgent Reports</div>
                  </motion.div>
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recent Reports */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Recent Lab Reports</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {labReports.slice(0, 5).map((report) => (
                          <div key={report.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium">{report.patientName}</p>
                              <p className="text-sm text-gray-600">{report.testType}</p>
                            </div>
                            <Badge variant={report.status === 'completed' ? 'default' : 'secondary'}>
                              {report.status}
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
                            <Badge variant="outline">{patient.bloodType}</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Lab Reports Tab */}
              <TabsContent value="reports" className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">Lab Report Management</h3>
                  <Dialog open={showReportModal} onOpenChange={setShowReportModal}>
                    <DialogTrigger asChild>
                      <Button className="bg-purple-600 hover:bg-purple-700">
                        <span className="material-icons mr-2">add</span>
                        Create Report
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Create New Lab Report</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleAddReport} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="patientId">Patient</Label>
                            <Select value={newReport.patientId} onValueChange={(value) => setNewReport(prev => ({ ...prev, patientId: value }))}>
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
                            <Label htmlFor="testType">Test Type</Label>
                            <Select value={newReport.testType} onValueChange={(value) => setNewReport(prev => ({ ...prev, testType: value }))}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select test type" />
                              </SelectTrigger>
                              <SelectContent>
                                {testTypes.map((testType) => (
                                  <SelectItem key={testType.id} value={testType.id}>
                                    {testType.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor="title">Report Title</Label>
                          <Input
                            id="title"
                            value={newReport.title}
                            onChange={(e) => setNewReport(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="Enter report title"
                            required
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="priority">Priority</Label>
                            <Select value={newReport.priority} onValueChange={(value: LabReport['priority']) => setNewReport(prev => ({ ...prev, priority: value }))}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="urgent">Urgent</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="dueDate">Due Date</Label>
                            <Input
                              id="dueDate"
                              type="date"
                              value={newReport.dueDate}
                              onChange={(e) => setNewReport(prev => ({ ...prev, dueDate: e.target.value }))}
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="doctorName">Referring Doctor</Label>
                          <Input
                            id="doctorName"
                            value={newReport.doctorName}
                            onChange={(e) => setNewReport(prev => ({ ...prev, doctorName: e.target.value }))}
                            placeholder="Doctor's name"
                          />
                        </div>

                        <div>
                          <Label htmlFor="notes">Notes</Label>
                          <Textarea
                            id="notes"
                            value={newReport.notes}
                            onChange={(e) => setNewReport(prev => ({ ...prev, notes: e.target.value }))}
                            placeholder="Additional notes"
                          />
                        </div>

                        <div className="flex space-x-2">
                          <Button type="submit" className="flex-1">Create Report</Button>
                          <Button type="button" variant="outline" onClick={() => setShowReportModal(false)}>
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Search and Filter */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <Input
                    placeholder="Search reports..."
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
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterPriority} onValueChange={setFilterPriority}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Reports Table */}
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Patient</TableHead>
                          <TableHead>Test Type</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Priority</TableHead>
                          <TableHead>Due Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredReports.map((report) => (
                          <TableRow key={report.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{report.patientName}</p>
                                <p className="text-sm text-gray-500">{report.patientEmail}</p>
                              </div>
                            </TableCell>
                            <TableCell>{report.testType}</TableCell>
                            <TableCell>
                              <Badge variant={report.status === 'completed' ? 'default' : 'secondary'}>
                                {report.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={report.priority === 'urgent' ? 'destructive' : 'outline'}
                                className={report.priority === 'high' ? 'border-red-500 text-red-700' : ''}
                              >
                                {report.priority}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(report.dueDate).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Select 
                                  value={report.status} 
                                  onValueChange={(value: LabReport['status']) => handleUpdateReportStatus(report.id, value)}
                                >
                                  <SelectTrigger className="w-32">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => handleDeleteReport(report.id)}
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

              {/* Patients Tab */}
              <TabsContent value="patients" className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">Patient Management</h3>
                  <Dialog open={showPatientModal} onOpenChange={setShowPatientModal}>
                    <DialogTrigger asChild>
                      <Button className="bg-green-600 hover:bg-green-700">
                        <span className="material-icons mr-2">person_add</span>
                        Add Patient
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Add New Patient</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleAddPatient} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                              id="name"
                              value={newPatient.name}
                              onChange={(e) => setNewPatient(prev => ({ ...prev, name: e.target.value }))}
                              placeholder="Enter full name"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="age">Age</Label>
                            <Input
                              id="age"
                              type="number"
                              value={newPatient.age}
                              onChange={(e) => setNewPatient(prev => ({ ...prev, age: e.target.value }))}
                              placeholder="Age"
                              required
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              type="email"
                              value={newPatient.email}
                              onChange={(e) => setNewPatient(prev => ({ ...prev, email: e.target.value }))}
                              placeholder="Email address"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                              id="phone"
                              value={newPatient.phone}
                              onChange={(e) => setNewPatient(prev => ({ ...prev, phone: e.target.value }))}
                              placeholder="Phone number"
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="gender">Gender</Label>
                            <Select value={newPatient.gender} onValueChange={(value) => setNewPatient(prev => ({ ...prev, gender: value }))}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select gender" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Male">Male</SelectItem>
                                <SelectItem value="Female">Female</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="bloodType">Blood Type</Label>
                            <Select value={newPatient.bloodType} onValueChange={(value) => setNewPatient(prev => ({ ...prev, bloodType: value }))}>
                              <SelectTrigger>
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
                          <Button type="submit" className="flex-1">Add Patient</Button>
                          <Button type="button" variant="outline" onClick={() => setShowPatientModal(false)}>
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
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
                          <TableHead>Blood Type</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {patients.map((patient) => (
                          <TableRow key={patient.id}>
                            <TableCell className="font-medium">{patient.name}</TableCell>
                            <TableCell>{patient.age} years</TableCell>
                            <TableCell>
                              <div>
                                <p>{patient.email}</p>
                                <p className="text-sm text-gray-500">{patient.phone}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{patient.bloodType}</Badge>
                            </TableCell>
                            <TableCell>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleDeletePatient(patient.id)}
                                className="text-red-600"
                              >
                                Delete
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Test Types Tab */}
              <TabsContent value="testTypes" className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">Test Type Management</h3>
                  <Dialog open={showTestTypeModal} onOpenChange={setShowTestTypeModal}>
                    <DialogTrigger asChild>
                      <Button className="bg-indigo-600 hover:bg-indigo-700">
                        <span className="material-icons mr-2">add</span>
                        Add Test Type
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Add New Test Type</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleAddTestType} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="name">Test Name</Label>
                            <Input
                              id="name"
                              value={newTestType.name}
                              onChange={(e) => setNewTestType(prev => ({ ...prev, name: e.target.value }))}
                              placeholder="Enter test name"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="category">Category</Label>
                            <Input
                              id="category"
                              value={newTestType.category}
                              onChange={(e) => setNewTestType(prev => ({ ...prev, category: e.target.value }))}
                              placeholder="Test category"
                              required
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={newTestType.description}
                            onChange={(e) => setNewTestType(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Test description"
                            required
                          />
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="preparation">Preparation</Label>
                            <Input
                              id="preparation"
                              value={newTestType.preparation}
                              onChange={(e) => setNewTestType(prev => ({ ...prev, preparation: e.target.value }))}
                              placeholder="Patient preparation"
                            />
                          </div>
                          <div>
                            <Label htmlFor="turnaroundTime">Turnaround Time</Label>
                            <Input
                              id="turnaroundTime"
                              value={newTestType.turnaroundTime}
                              onChange={(e) => setNewTestType(prev => ({ ...prev, turnaroundTime: e.target.value }))}
                              placeholder="e.g., 24 hours"
                            />
                          </div>
                          <div>
                            <Label htmlFor="price">Price ($)</Label>
                            <Input
                              id="price"
                              type="number"
                              step="0.01"
                              value={newTestType.price}
                              onChange={(e) => setNewTestType(prev => ({ ...prev, price: e.target.value }))}
                              placeholder="0.00"
                              required
                            />
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <Button type="submit" className="flex-1">Add Test Type</Button>
                          <Button type="button" variant="outline" onClick={() => setShowTestTypeModal(false)}>
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Test Types Table */}
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Turnaround Time</TableHead>
                          <TableHead>Price</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {testTypes.map((testType) => (
                          <TableRow key={testType.id}>
                            <TableCell className="font-medium">{testType.name}</TableCell>
                            <TableCell>{testType.category}</TableCell>
                            <TableCell className="max-w-xs truncate">{testType.description}</TableCell>
                            <TableCell>{testType.turnaroundTime}</TableCell>
                            <TableCell>${testType.price.toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
};

export default LabDashboard;
