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
import { useStorage } from '@/hooks/useStorage';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { formatDateAsMonthYear, formatDateTime } from '@/lib/utils';

interface LabRequest {
  id: string;
  doctorId: string;
  doctorName: string;
  patientId: string;
  patientName: string;
  testType: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  notes: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
  requestedDate?: string;
  completedDate?: string;
  labNotes?: string;
}

interface LabReport {
  id: string;
  labId: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  title: string;
  testType: string;
  fileURL: string;
  notes: string;
  status: 'pending' | 'completed' | 'reviewed';
  createdAt: string;
  completedAt?: string;
  testParameters: TestParameter[];
  normalRanges: Record<string, string>;
  results: Record<string, any>;
  overallStatus: 'normal' | 'abnormal' | 'critical';
  recommendations: string[];
}

interface TestParameter {
  name: string;
  value: any;
  unit: string;
  normalRange: string;
  status: 'normal' | 'high' | 'low' | 'critical';
  previousValue?: any;
  change?: number;
}

interface Patient {
  id: string;
  name: string;
  age: number;
  phone: string;
  email: string;
  lastTest: string;
  upcomingTests: string[];
  testHistory: string[];
}

const LabDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { userData } = useAuth();
  const { toast } = useToast();
  
  // State management
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedRequest, setSelectedRequest] = useState<string>('');
  const [showReportForm, setShowReportForm] = useState(false);
  const [showTestForm, setShowTestForm] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Form states
  const [reportForm, setReportForm] = useState({
    patientId: '',
    testType: '',
    title: '',
    notes: '',
    testParameters: '',
    normalRanges: '',
    results: '',
    recommendations: ''
  });
  
  const [testForm, setTestForm] = useState({
    patientId: '',
    testType: '',
    priority: 'normal',
    notes: '',
    requestedDate: ''
  });

  // Data fetching
  const { data: labRequests, add: addLabRequest, update: updateLabRequest, remove: removeLabRequest } = useFirestore('labRequests');
  const { data: labReports, add: addLabReport, update: updateLabReport, remove: removeLabReport } = useFirestore('reports');
  const { data: patients } = useFirestore('patients');
  const { data: doctors } = useFirestore('users');
  const { uploadFile, uploading } = useStorage();

  // Filter data for current lab
  const labLabRequests = labRequests.filter(r => r.labId === userData?.id);
  const labLabReports = labReports.filter(r => r.labId === userData?.id);
  const labPatients = patients.filter(p => labLabRequests.some(r => r.patientId === p.id));

  // Get selected request data
  const selectedRequestData = labLabRequests.find(r => r.id === selectedRequest);

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Handle report submission
  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData || !selectedFile || !reportForm.patientId) return;

    try {
      // Mock file upload
      const fileURL = `mock://storage/reports/${Date.now()}_${selectedFile.name}`;

      // Parse form data
      const testParameters = reportForm.testParameters ? JSON.parse(reportForm.testParameters) : [];
      const normalRanges = reportForm.normalRanges ? JSON.parse(reportForm.normalRanges) : {};
      const results = reportForm.results ? JSON.parse(reportForm.results) : {};

      // Determine overall status
      const overallStatus = testParameters.some((p: TestParameter) => p.status === 'critical') ? 'critical' :
                           testParameters.some((p: TestParameter) => p.status === 'abnormal') ? 'abnormal' : 'normal';

      // Create report
      await addLabReport({
        labId: userData.id,
        patientId: reportForm.patientId,
        patientName: patients.find(p => p.id === reportForm.patientId)?.name || 'Unknown Patient',
        doctorId: labLabRequests.find(r => r.patientId === reportForm.patientId)?.doctorId || '',
        doctorName: doctors.find(d => d.id === labLabRequests.find(r => r.patientId === reportForm.patientId)?.doctorId)?.name || 'Unknown Doctor',
        title: reportForm.title,
        testType: reportForm.testType,
        fileURL: fileURL,
        notes: reportForm.notes,
        status: 'completed',
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        testParameters: testParameters,
        normalRanges: normalRanges,
        results: results,
        overallStatus: overallStatus,
        recommendations: reportForm.recommendations ? [reportForm.recommendations] : []
      });

      // Update lab request status
      const request = labLabRequests.find(r => r.patientId === reportForm.patientId);
      if (request) {
        await updateLabRequest(request.id, { 
          status: 'completed', 
          completedDate: new Date().toISOString() 
        });
      }

      // Reset form
      setReportForm({
        patientId: '',
        testType: '',
        title: '',
        notes: '',
        testParameters: '',
        normalRanges: '',
        results: '',
        recommendations: ''
      });
      setSelectedFile(null);
      setShowReportForm(false);

      toast({
        title: 'Success',
        description: 'Lab report uploaded successfully',
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload lab report',
        variant: 'destructive',
      });
    }
  };

  // Handle test request submission
  const handleTestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData || !testForm.patientId) return;

    try {
      const patient = patients.find(p => p.id === testForm.patientId);
      await addLabRequest({
        labId: userData.id,
        doctorId: '', // Will be filled when doctor requests
        doctorName: 'Self Requested',
        patientId: testForm.patientId,
        patientName: patient?.name || 'Unknown Patient',
        testType: testForm.testType,
        priority: testForm.priority as any,
        notes: testForm.notes,
        status: 'pending',
        createdAt: new Date().toISOString(),
        requestedDate: testForm.requestedDate || new Date().toISOString()
      });

      // Reset form
      setTestForm({
        patientId: '',
        testType: '',
        priority: 'normal',
        notes: '',
        requestedDate: ''
      });
      setShowTestForm(false);

      toast({
        title: 'Success',
        description: 'Test request created successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create test request',
        variant: 'destructive',
      });
    }
  };

  // Update request status
  const updateRequestStatus = async (requestId: string, status: string) => {
    try {
      await updateLabRequest(requestId, { status });
      toast({
        title: 'Success',
        description: 'Request status updated',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update request status',
        variant: 'destructive',
      });
    }
  };

  // Delete report
  const handleDeleteReport = async (reportId: string) => {
    try {
      await removeLabReport(reportId);
      toast({
        title: 'Success',
        description: 'Report deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete report',
        variant: 'destructive',
      });
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'default';
      case 'normal': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'in_progress': return 'secondary';
      case 'pending': return 'outline';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  if (!userData) return null;

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('labDashboard')}</h1>
            <p className="text-gray-600">{t('manageLabReportsAndResults')}</p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="text-sm">
              {labLabRequests.length} {t('requests')}
            </Badge>
            <Badge variant="outline" className="text-sm">
              {labLabReports.length} {t('reports')}
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">{t('overview')}</TabsTrigger>
          <TabsTrigger value="requests">{t('testRequests')}</TabsTrigger>
          <TabsTrigger value="reports">{t('reports')}</TabsTrigger>
          <TabsTrigger value="patients">{t('patients')}</TabsTrigger>
          <TabsTrigger value="analytics">{t('analytics')}</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('totalRequests')}</CardTitle>
                <span className="material-icons text-blue-600">assignment</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{labLabRequests.length}</div>
                <p className="text-xs text-muted-foreground">{t('allTestRequests')}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('pendingTests')}</CardTitle>
                <span className="material-icons text-yellow-600">pending</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {labLabRequests.filter(r => r.status === 'pending').length}
                </div>
                <p className="text-xs text-muted-foreground">{t('awaitingCompletion')}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('completedToday')}</CardTitle>
                <span className="material-icons text-green-600">check_circle</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {labLabReports.filter(r => 
                    new Date(r.completedAt || '').toDateString() === new Date().toDateString()
                  ).length}
                </div>
                <p className="text-xs text-muted-foreground">{t('reportsCompletedToday')}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('urgentTests')}</CardTitle>
                <span className="material-icons text-red-600">priority_high</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {labLabRequests.filter(r => r.priority === 'urgent').length}
                </div>
                <p className="text-xs text-muted-foreground">{t('highPriorityTests')}</p>
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
                {labLabRequests.slice(0, 5).map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="material-icons text-blue-600">science</span>
                      <div>
                        <p className="font-medium">{request.patientName}</p>
                        <p className="text-sm text-gray-600">{request.testType}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getPriorityColor(request.priority)}>
                        {request.priority}
                      </Badge>
                      <Badge variant={getStatusColor(request.status)}>
                        {request.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Test Requests Tab */}
        <TabsContent value="requests" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Test Request Management</h2>
            <Button onClick={() => setShowTestForm(true)}>
              <span className="material-icons mr-2">add</span>
              New Test Request
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Test Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {labLabRequests.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No test requests found</p>
                ) : (
                  labLabRequests.map((request) => (
                    <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-medium">{request.patientName}</h3>
                          <p className="text-sm text-gray-600">{request.testType}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={getPriorityColor(request.priority)}>
                            {request.priority}
                          </Badge>
                          <Badge variant={getStatusColor(request.status)}>
                            {request.status}
                          </Badge>
                          <Select 
                            value={request.status} 
                            onValueChange={(value) => updateRequestStatus(request.id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">{t('pending')}</SelectItem>
                              <SelectItem value="in_progress">{t('inProgress')}</SelectItem>
                              <SelectItem value="completed">{t('completed')}</SelectItem>
                              <SelectItem value="cancelled">{t('cancelled')}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <Label className="text-xs font-medium">{t('doctor')}</Label>
                          <p className="text-gray-600">{request.doctorName}</p>
                        </div>
                        <div>
                          <Label className="text-xs font-medium">{t('requested')}</Label>
                          <p className="text-gray-600">{formatDateAsMonthYear(request.createdAt)}</p>
                        </div>
                        <div>
                          <Label className="text-xs font-medium">{t('priority')}</Label>
                          <p className="text-gray-600 capitalize">{request.priority}</p>
                        </div>
                        <div>
                          <Label className="text-xs font-medium">{t('notes')}</Label>
                          <p className="text-gray-600">{request.notes || t('noNotes')}</p>
                        </div>
                      </div>
                      
                      {request.status === 'completed' && (
                        <div className="mt-3">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setReportForm(prev => ({ ...prev, patientId: request.patientId, testType: request.testType }));
                              setShowReportForm(true);
                            }}
                          >
                            <span className="material-icons mr-2">upload</span>
                            {t('uploadReport')}
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

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">{t('reportManagement')}</h2>
            <Button onClick={() => setShowReportForm(true)}>
              <span className="material-icons mr-2">upload</span>
              {t('uploadReport')}
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t('allLabReports')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {labLabReports.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">{t('noLabReportsFound')}</p>
                ) : (
                  labLabReports.map((report) => (
                    <div key={report.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-medium">{report.patientName}</h3>
                          <p className="text-sm text-gray-600">{report.title}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={
                            report.overallStatus === 'critical' ? 'destructive' :
                            report.overallStatus === 'abnormal' ? 'default' : 'secondary'
                          }>
                            {report.overallStatus}
                          </Badge>
                          <Badge variant={getStatusColor(report.status)}>
                            {report.status}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <Label className="text-xs font-medium">{t('testTypeLabel')}</Label>
                          <p className="text-gray-600">{report.testType}</p>
                        </div>
                        <div>
                          <Label className="text-xs font-medium">Created</Label>
                          <p className="text-gray-600">{formatDateAsMonthYear(report.createdAt)}</p>
                        </div>
                        <div>
                          <Label className="text-xs font-medium">Completed</Label>
                          <p className="text-gray-600">{formatDateAsMonthYear(report.completedAt || '')}</p>
                        </div>
                        <div>
                          <Label className="text-xs font-medium">Doctor</Label>
                          <p className="text-gray-600">{report.doctorName}</p>
                        </div>
                      </div>
                      
                      {report.testParameters && report.testParameters.length > 0 && (
                        <div className="mt-3">
                          <Label className="text-xs font-medium">Test Parameters</Label>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                            {report.testParameters.slice(0, 6).map((param: TestParameter, index: number) => (
                              <div key={index} className="text-xs p-2 bg-gray-50 rounded">
                                <span className="font-medium">{param.name}:</span> {param.value} {param.unit}
                                <Badge 
                                  variant={
                                    param.status === 'critical' ? 'destructive' :
                                    param.status === 'abnormal' ? 'default' : 'secondary'
                                  } 
                                  className="ml-2 text-xs"
                                >
                                  {param.status}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="mt-3 flex space-x-2">
                        <Button variant="outline" size="sm">
                          <span className="material-icons mr-2">visibility</span>
                          View Report
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteReport(report.id)}
                        >
                          <span className="material-icons mr-2">delete</span>
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Patients Tab */}
        <TabsContent value="patients" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Patient Management</h2>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Patient Test History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {labPatients.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No patients found</p>
                ) : (
                  labPatients.map((patient) => {
                    const patientReports = labLabReports.filter(r => r.patientId === patient.id);
                    const patientRequests = labLabRequests.filter(r => r.patientId === patient.id);
                    
                    return (
                      <div key={patient.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="font-medium">{patient.name}</h3>
                            <p className="text-sm text-gray-600">{patient.age} years • {patient.phone}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Total Tests</p>
                            <p className="font-medium">{patientReports.length + patientRequests.length}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <Label className="text-xs font-medium">Last Test</Label>
                            <p className="text-gray-600">
                              {patientReports.length > 0 
                                ? formatDateAsMonthYear(patientReports[0].createdAt)
                                : 'No tests yet'
                              }
                            </p>
                          </div>
                          <div>
                            <Label className="text-xs font-medium">Pending Tests</Label>
                            <p className="text-gray-600">
                              {patientRequests.filter(r => r.status === 'pending').length}
                            </p>
                          </div>
                          <div>
                            <Label className="text-xs font-medium">Completed Tests</Label>
                            <p className="text-gray-600">{patientReports.length}</p>
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setTestForm(prev => ({ ...prev, patientId: patient.id }));
                              setShowTestForm(true);
                            }}
                          >
                            <span className="material-icons mr-2">add</span>
                            Request Test
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Lab Analytics</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Test Type Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Test Type Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(
                    labLabRequests.reduce((acc, request) => {
                      acc[request.testType] = (acc[request.testType] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>)
                  ).map(([testType, count]) => (
                    <div key={testType} className="flex items-center justify-between">
                      <span className="text-sm">{testType}</span>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Request Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(
                    labLabRequests.reduce((acc, request) => {
                      acc[request.status] = (acc[request.status] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>)
                  ).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{status.replace('_', ' ')}</span>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {labLabReports.filter(r => 
                        new Date(r.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                      ).length}
                    </div>
                    <p className="text-sm text-gray-600">This Week</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {labLabReports.filter(r => 
                        new Date(r.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                      ).length}
                    </div>
                    <p className="text-sm text-gray-600">This Month</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {labLabRequests.filter(r => r.priority === 'urgent').length}
                    </div>
                    <p className="text-sm text-gray-600">Urgent Tests</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {labLabRequests.filter(r => r.status === 'pending').length}
                    </div>
                    <p className="text-sm text-gray-600">Pending</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Report Upload Form Modal */}
      {showReportForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">{t('uploadLabReport')}</h3>
            <form onSubmit={handleReportSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="patientId">{t('patient')}</Label>
                  <Select 
                    value={reportForm.patientId} 
                    onValueChange={(value) => setReportForm(prev => ({ ...prev, patientId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('selectPatient')} />
                    </SelectTrigger>
                    <SelectContent>
                      {labPatients.map((patient) => (
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
                    value={reportForm.testType}
                    onChange={(e) => setReportForm(prev => ({ ...prev, testType: e.target.value }))}
                    placeholder={t('testTypePlaceholder')}
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="title">{t('reportTitle')}</Label>
                <Input
                  id="title"
                  value={reportForm.title}
                  onChange={(e) => setReportForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder={t('enterReportTitle')}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="file">{t('reportFile')}</Label>
                <Input
                  id="file"
                  type="file"
                  onChange={handleFileSelect}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="notes">{t('notes')}</Label>
                <Textarea
                  id="notes"
                  value={reportForm.notes}
                  onChange={(e) => setReportForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder={t('additionalNotesAboutReport')}
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="testParameters">{t('testParameters')}</Label>
                <Textarea
                  id="testParameters"
                  value={reportForm.testParameters}
                  onChange={(e) => setReportForm(prev => ({ ...prev, testParameters: e.target.value }))}
                  placeholder={`[{"name": "Hemoglobin", "value": 14.2, "unit": "${t('gdL')}", "normalRange": "12-16", "status": "normal"}]`}
                  rows={4}
                />
              </div>
              
              <div>
                <Label htmlFor="normalRanges">{t('normalRanges')}</Label>
                <Textarea
                  id="normalRanges"
                  value={reportForm.normalRanges}
                  onChange={(e) => setReportForm(prev => ({ ...prev, normalRanges: e.target.value }))}
                  placeholder={`{"Hemoglobin": "12-16 ${t('gdL')}", "Glucose": "70-100 ${t('mgdL')}"}`}
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="results">{t('testResults')}</Label>
                <Textarea
                  id="results"
                  value={reportForm.results}
                  onChange={(e) => setReportForm(prev => ({ ...prev, results: e.target.value }))}
                  placeholder='{"Hemoglobin": 14.2, "Glucose": 95}'
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="recommendations">{t('recommendations')}</Label>
                <Textarea
                  id="recommendations"
                  value={reportForm.recommendations}
                  onChange={(e) => setReportForm(prev => ({ ...prev, recommendations: e.target.value }))}
                  placeholder={t('medicalRecommendationsBasedOnResults')}
                  rows={3}
                />
              </div>
              
              <div className="flex space-x-3">
                <Button type="submit" className="flex-1" disabled={uploading}>
                  {uploading ? 'Uploading...' : 'Upload Report'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowReportForm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Test Request Form Modal */}
      {showTestForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">{t('newTestRequest')}</h3>
            <form onSubmit={handleTestSubmit} className="space-y-4">
              <div>
                <Label htmlFor="patientId">{t('patient')}</Label>
                <Select 
                  value={testForm.patientId} 
                  onValueChange={(value) => setTestForm(prev => ({ ...prev, patientId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectPatient')} />
                  </SelectTrigger>
                  <SelectContent>
                    {labPatients.map((patient) => (
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
                  value={testForm.testType}
                  onChange={(e) => setTestForm(prev => ({ ...prev, testType: e.target.value }))}
                  placeholder={t('testTypePlaceholder')}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="priority">{t('priority')}</Label>
                <Select 
                  value={testForm.priority} 
                  onValueChange={(value) => setTestForm(prev => ({ ...prev, priority: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
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
                <Label htmlFor="requestedDate">{t('requestedDate')}</Label>
                <Input
                  id="requestedDate"
                  type="date"
                  value={testForm.requestedDate}
                  onChange={(e) => setTestForm(prev => ({ ...prev, requestedDate: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="notes">{t('notes')}</Label>
                <Textarea
                  id="notes"
                  value={testForm.notes}
                  onChange={(e) => setTestForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder={t('specialInstructionsOrNotes')}
                  rows={3}
                />
              </div>
              
              <div className="flex space-x-3">
                <Button type="submit" className="flex-1">{t('createRequest')}</Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowTestForm(false)}
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

export default LabDashboard;
