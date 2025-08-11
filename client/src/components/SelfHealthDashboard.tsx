import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import SelfAIAnalysis from './SelfAIAnalysis';
import SelfReminder from './SelfReminder';
import { 
  FileText, 
  Pill, 
  Activity, 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Upload, 
  Plus, 
  Eye, 
  Download, 
  Share2, 
  Calendar,
  Heart,
  Thermometer,
  Droplets,
  Scale,
  BrainCircuit,
  Zap,
  Target,
  BarChart3,
  RefreshCw,
  Stethoscope,
  User,
  Clock,
  Bell,
  X,
  BellRing,
  Shield
} from 'lucide-react';

// Interfaces for unified data structure
interface HealthReport {
  id: string;
  userId: string;
  title: string;
  reportType: 'bloodtest' | 'xray' | 'mri' | 'ecg' | 'urinetest' | 'scan' | 'other';
  fileUrl?: string;
  imageUrl?: string;
  labName?: string;
  doctorName?: string;
  uploadedAt: string;
  status: 'active' | 'expired' | 'pending';
  analysis?: {
    parameters: Record<string, {
      value: number;
      unit: string;
      normalRange: string;
      status: 'normal' | 'borderline' | 'high' | 'low' | 'critical';
      previousValue?: number;
      change?: number;
      significance?: string;
    }>;
    summary: {
      normalCount: number;
      abnormalCount: number;
      criticalCount: number;
      overallStatus: string;
      riskLevel: string;
      recommendations: string[];
    };
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface Prescription {
  id: string;
  userId: string;
  doctorId?: string;
  doctorName?: string;
  diagnosis: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes?: string;
  prescribedDate: string;
  refills?: number;
  status: 'active' | 'completed' | 'discontinued';
  sideEffects?: string[];
  interactions?: string[];
  monitoring?: string[];
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface HealthMetric {
  id: string;
  userId: string;
  name: string;
  value: number;
  unit: string;
  status: 'normal' | 'borderline' | 'high' | 'low' | 'critical';
  trend: 'up' | 'down' | 'stable';
  lastUpdated: string;
  targetRange: { min: number; max: number };
  source: 'report' | 'manual' | 'device';
  sourceId?: string;
  aiAnalysis?: string;
}

interface AIInsight {
  id: string;
  userId: string;
  type: 'health_trend' | 'risk_alert' | 'recommendation' | 'medication_reminder';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  relatedData: {
    reports?: string[];
    prescriptions?: string[];
    metrics?: string[];
  };
  actionable: boolean;
  actionUrl?: string;
  createdAt: string;
}

const SelfHealthDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { userData } = useAuth();
  const { toast } = useToast();
  
  // State management
  const [reports, setReports] = useState<HealthReport[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([]);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [reminderCount, setReminderCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Modal states
  const [showAddReport, setShowAddReport] = useState(false);
  const [showAddPrescription, setShowAddPrescription] = useState(false);
  const [selectedReport, setSelectedReport] = useState<HealthReport | null>(null);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [showPDFViewer, setShowPDFViewer] = useState(false);
  const [currentPDFUrl, setCurrentPDFUrl] = useState<string>('');
  const [currentPDFTitle, setCurrentPDFTitle] = useState<string>('');
  
  // Form states
  const [newReport, setNewReport] = useState({
    title: '',
    reportType: 'bloodtest' as HealthReport['reportType'],
    labName: '',
    doctorName: '',
    notes: '',
    imageFile: null as File | null,
    fileUrl: ''
  });
  
  const [newPrescription, setNewPrescription] = useState({
    diagnosis: '',
    medication: '',
    dosage: '',
    frequency: '',
    duration: '',
    notes: '',
    prescribedDate: '',
    refills: 0,
    imageFile: null as File | null
  });

  // Load unified health data
  const loadHealthData = useCallback(async () => {
    if (!userData?.id) return;
    
    try {
      setLoading(true);
      
      // Load from localStorage (demo data)
      const storedReports = JSON.parse(localStorage.getItem('mock_reports') || '[]');
      const storedPrescriptions = JSON.parse(localStorage.getItem('mock_prescriptions') || '[]');
      const storedHealthMetrics = JSON.parse(localStorage.getItem('mock_health_metrics') || '[]');
      const storedReminders = JSON.parse(localStorage.getItem('mock_self_reminders') || '[]');
      
      // Filter data for current user
      const userReports = storedReports.filter((r: any) => r.userId === userData.id);
      const userPrescriptions = storedPrescriptions.filter((p: any) => p.patientId === userData.id);
      const userMetrics = storedHealthMetrics.filter((m: any) => m.userId === userData.id);
      const userReminders = storedReminders.filter((r: any) => r.userId === userData.id);
      
      setReports(userReports);
      setPrescriptions(userPrescriptions);
      setHealthMetrics(userMetrics);
      setReminderCount(userReminders.filter((r: any) => r.isActive).length);
      
      // Generate AI insights based on data
      generateAIInsights(userReports, userPrescriptions, userMetrics);
      
    } catch (error) {
      console.error('Error loading health data:', error);
      toast({
        title: t('error'),
        description: t('failedToLoadHealthData'),
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [userData, toast]);

  // Generate AI insights from health data
  const generateAIInsights = useCallback((reports: HealthReport[], prescriptions: Prescription[], metrics: HealthMetric[]) => {
    const insights: AIInsight[] = [];
    
    // Analyze reports for critical findings
    reports.forEach(report => {
      if (report.analysis?.summary.criticalCount && report.analysis.summary.criticalCount > 0) {
        insights.push({
          id: `insight_${report.id}_critical`,
          userId: userData?.id || '',
          type: 'risk_alert',
          title: `${t('criticalHealthAlert')} - ${report.title}`,
          description: t('yourReportShowsCriticalValues', { 
            reportType: report.reportType, 
            count: report.analysis.summary.criticalCount 
          }),
          severity: 'critical',
          category: 'lab_results',
          relatedData: { reports: [report.id] },
          actionable: true,
          actionUrl: `/reports/${report.id}`,
          createdAt: new Date().toISOString()
        });
      }
    });
    
    // Analyze medication adherence
    if (prescriptions.length > 0) {
      insights.push({
        id: 'insight_medication_adherence',
        userId: userData?.id || '',
        type: 'medication_reminder',
        title: t('medicationManagement'),
        description: t('youHaveActivePrescriptions', { 
          count: prescriptions.filter(p => p.status === 'active').length 
        }),
        severity: 'medium',
        category: 'medications',
        relatedData: { prescriptions: prescriptions.map(p => p.id) },
        actionable: true,
        actionUrl: '/prescriptions',
        createdAt: new Date().toISOString()
      });
    }
    
    // Analyze health trends
    if (metrics.length > 0) {
      const abnormalMetrics = metrics.filter(m => m.status !== 'normal');
      if (abnormalMetrics.length > 0) {
        insights.push({
          id: 'insight_health_trends',
          userId: userData?.id || '',
          type: 'health_trend',
          title: t('healthTrendsAnalysis'),
          description: t('healthMetricsOutsideNormalRange', { 
            count: abnormalMetrics.length 
          }),
          severity: 'medium',
          category: 'health_metrics',
          relatedData: { metrics: abnormalMetrics.map(m => m.id) },
          actionable: true,
          actionUrl: '/metrics',
          createdAt: new Date().toISOString()
        });
      }
    }
    
    setAiInsights(insights);
  }, [userData]);

  // Handle report upload
  const handleReportUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData?.id) return;
    
    try {
      let fileUrl = '';
      let imageUrl = '';
      
      // Handle file upload (PDF or image)
      if (newReport.imageFile) {
        if (newReport.imageFile.type === 'application/pdf') {
          // For PDF files, create a file URL
          fileUrl = URL.createObjectURL(newReport.imageFile);
        } else if (newReport.imageFile.type.startsWith('image/')) {
          // For image files, create a data URL
          const reader = new FileReader();
          imageUrl = await new Promise((resolve) => {
            reader.onload = (e) => {
              resolve(e.target?.result as string);
            };
            reader.readAsDataURL(newReport.imageFile!);
          });
        }
      }
      
      // Generate AI analysis based on report type
      const analysis = generateReportAnalysis(newReport.reportType, newReport.title);
      
      const report: HealthReport = {
        id: `report_${Date.now()}`,
        userId: userData.id,
        title: newReport.title,
        reportType: newReport.reportType,
        labName: newReport.labName,
        doctorName: newReport.doctorName,
        uploadedAt: new Date().toISOString(),
        status: 'active',
        notes: newReport.notes,
        fileUrl, // Store fileUrl for PDFs
        imageUrl, // Store imageUrl for images
        analysis: analysis as HealthReport['analysis'], // Properly type the analysis
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Add to reports
      const updatedReports = [...reports, report];
      setReports(updatedReports);
      
      // Update localStorage
      const allReports = JSON.parse(localStorage.getItem('mock_reports') || '[]');
      allReports.push(report);
      localStorage.setItem('mock_reports', JSON.stringify(allReports));
      
      // Generate new insights
      generateAIInsights(updatedReports, prescriptions, healthMetrics);
      
      // Reset form and close modal
      setNewReport({
        title: '',
        reportType: 'bloodtest',
        labName: '',
        doctorName: '',
        notes: '',
        imageFile: null,
        fileUrl: ''
      });
      setShowAddReport(false);
      
      toast({
        title: 'Success',
        description: 'Report uploaded successfully with AI analysis',
      });
      
    } catch (error) {
      console.error('Error uploading report:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload report',
        variant: 'destructive'
      });
    }
  };

  // Generate AI analysis for reports
  const generateReportAnalysis = (reportType: HealthReport['reportType'], title: string) => {
    const analysisData: Record<string, any> = {};
    
    switch (reportType) {
      case 'bloodtest':
        analysisData.parameters = {
          'Hemoglobin': {
            value: 14.2,
            unit: 'g/dL',
            normalRange: '12.0-15.5',
            status: 'normal' as const,
            change: 2.1,
            significance: 'Within healthy range, slight increase from previous'
          },
          'White Blood Cells': {
            value: 11.2,
            unit: 'K/μL',
            normalRange: '4.5-11.0',
            status: 'high' as const,
            change: 8.5,
            significance: 'Elevated, may indicate infection or inflammation'
          },
          'Platelets': {
            value: 250,
            unit: 'K/μL',
            normalRange: '150-450',
            status: 'normal' as const,
            change: -5.2,
            significance: 'Normal platelet count, slight decrease'
          },
          'Glucose': {
            value: 95,
            unit: 'mg/dL',
            normalRange: '70-100',
            status: 'normal' as const,
            change: -3.1,
            significance: 'Healthy blood sugar level'
          }
        };
        break;
        
      case 'xray':
        analysisData.parameters = {
          'Lung Fields': {
            value: 100,
            unit: '%',
            normalRange: 'Clear',
            status: 'normal' as const,
            change: 0,
            significance: 'Normal lung fields, no abnormalities detected'
          },
          'Cardiac Silhouette': {
            value: 100,
            unit: '%',
            normalRange: 'Normal size',
            status: 'normal' as const,
            change: 0,
            significance: 'Normal cardiac silhouette'
          },
          'Bone Structure': {
            value: 100,
            unit: '%',
            normalRange: 'Intact',
            status: 'normal' as const,
            change: 0,
            significance: 'No fractures or bone abnormalities'
          }
        };
        break;
        
      case 'mri':
        analysisData.parameters = {
          'Brain Tissue': {
            value: 100,
            unit: '%',
            normalRange: 'Normal',
            status: 'normal' as const,
            change: 0,
            significance: 'Normal brain tissue, no lesions or abnormalities'
          },
          'Ventricles': {
            value: 100,
            unit: '%',
            normalRange: 'Normal size',
            status: 'normal' as const,
            change: 0,
            significance: 'Normal ventricular size and position'
          },
          'White Matter': {
            value: 100,
            unit: '%',
            normalRange: 'Intact',
            status: 'normal' as const,
            change: 0,
            significance: 'Normal white matter integrity'
          }
        };
        break;
        
      case 'ecg':
        analysisData.parameters = {
          'Heart Rate': {
            value: 72,
            unit: 'bpm',
            normalRange: '60-100',
            status: 'normal' as const,
            change: 0,
            significance: 'Normal sinus rhythm'
          },
          'PR Interval': {
            value: 0.16,
            unit: 'seconds',
            normalRange: '0.12-0.20',
            status: 'normal' as const,
            change: 0,
            significance: 'Normal PR interval'
          },
          'QRS Duration': {
            value: 0.08,
            unit: 'seconds',
            normalRange: '<0.12',
            status: 'normal' as const,
            change: 0,
            significance: 'Normal QRS duration'
          }
        };
        break;
        
      default:
        analysisData.parameters = {
          'General Assessment': {
            value: 100,
            unit: '%',
            normalRange: 'Normal',
            status: 'normal' as const,
            change: 0,
            significance: 'Report appears normal based on available data'
          }
        };
    }
    
    // Calculate summary
    const parameters = Object.values(analysisData.parameters);
    const normalCount = parameters.filter((p: any) => p.status === 'normal').length;
    const abnormalCount = parameters.filter((p: any) => p.status === 'high' || p.status === 'low').length;
    const criticalCount = parameters.filter((p: any) => p.status === 'critical').length;
    
    analysisData.summary = {
      normalCount,
      abnormalCount,
      criticalCount,
      overallStatus: criticalCount > 0 ? 'Critical' : abnormalCount > 0 ? 'Abnormal' : 'Normal',
      riskLevel: criticalCount > 0 ? 'critical' : abnormalCount > 0 ? 'medium' : 'low',
      recommendations: generateRecommendations(reportType, analysisData.parameters)
    };
    
    return analysisData;
  };

  // Generate recommendations based on analysis
  const generateRecommendations = (reportType: HealthReport['reportType'], parameters: any) => {
    const recommendations: string[] = [];
    
    // Add general recommendations based on report type
    switch (reportType) {
      case 'bloodtest':
        recommendations.push('Schedule follow-up with your doctor to discuss results');
        recommendations.push('Maintain healthy lifestyle habits');
        break;
      case 'xray':
        recommendations.push('Follow up with radiologist if any concerns');
        recommendations.push('Continue monitoring symptoms if present');
        break;
      case 'mri':
        recommendations.push('Consult with neurologist for detailed interpretation');
        recommendations.push('Keep track of any new symptoms');
        break;
      case 'ecg':
        recommendations.push('Continue monitoring heart health');
        recommendations.push('Report any chest pain or palpitations');
        break;
    }
    
    // Add specific recommendations based on abnormal values
    Object.entries(parameters).forEach(([key, param]: [string, any]) => {
      if (param.status === 'high') {
        recommendations.push(`Monitor ${key} levels and consult doctor if symptoms persist`);
      } else if (param.status === 'low') {
        recommendations.push(`Consider dietary changes to improve ${key} levels`);
      } else if (param.status === 'critical') {
        recommendations.push(`Seek immediate medical attention for ${key} levels`);
      }
    });
    
    return recommendations;
  };

  // Handle PDF viewing
  const handleViewPDF = (report: HealthReport) => {
    if (report.fileUrl) {
      // Open PDF in modal viewer
      setCurrentPDFUrl(report.fileUrl);
      setCurrentPDFTitle(report.title);
      setShowPDFViewer(true);
    } else if (report.imageUrl) {
      // For image reports, open in full screen
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head>
              <title>${report.title}</title>
              <style>
                body { margin: 0; padding: 20px; background: #f5f5f5; font-family: Arial, sans-serif; }
                .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                h1 { color: #333; margin-bottom: 20px; }
                .report-info { background: #f8f9fa; padding: 15px; border-radius: 6px; margin-bottom: 20px; }
                .report-info p { margin: 5px 0; }
                img { max-width: 100%; height: auto; border-radius: 6px; }
                .pdf-placeholder { background: #e9ecef; padding: 40px; text-align: center; border-radius: 6px; }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>${report.title}</h1>
                <div class="report-info">
                  <p><strong>Type:</strong> ${report.reportType}</p>
                  <p><strong>Lab:</strong> ${report.labName || 'Not specified'}</p>
                  <p><strong>Doctor:</strong> ${report.doctorName || 'Not specified'}</p>
                  <p><strong>Uploaded:</strong> ${new Date(report.uploadedAt).toLocaleDateString()}</p>
                </div>
                ${report.imageUrl && report.imageUrl.startsWith('data:image/') 
                  ? `<img src="${report.imageUrl}" alt="${report.title}" />`
                  : `<div class="pdf-placeholder"><p>PDF File: ${report.title}</p><p>Click to download or view in your PDF reader</p></div>`
                }
              </div>
            </body>
          </html>
        `);
      }
    } else {
      toast({
        title: 'No File Available',
        description: 'This report doesn\'t have an associated file to view.',
        variant: 'destructive'
      });
    }
  };

  // Handle report download
  const handleDownloadReport = (report: HealthReport) => {
    if (report.fileUrl) {
      // Create a temporary link element to trigger download
      const link = document.createElement('a');
      link.href = report.fileUrl;
      link.download = `${report.title}.pdf`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: 'Download Started',
        description: `Downloading ${report.title}`,
      });
    } else if (report.imageUrl && report.imageUrl.startsWith('data:image/')) {
      // Download image data URL
      const link = document.createElement('a');
      link.href = report.imageUrl;
      link.download = `${report.title}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: 'Download Started',
        description: `Downloading ${report.title}`,
      });
    } else {
      // Generate a simple PDF report for download
      const reportContent = `
        Health Report: ${report.title}
        Type: ${report.reportType}
        Lab: ${report.labName || 'Not specified'}
        Doctor: ${report.doctorName || 'Not specified'}
        Uploaded: ${new Date(report.uploadedAt).toLocaleDateString()}
        Status: ${report.status}
        ${report.notes ? `Notes: ${report.notes}` : ''}
        
        ${report.analysis ? `
        Analysis Summary:
        - Overall Status: ${report.analysis.summary.overallStatus}
        - Risk Level: ${report.analysis.summary.riskLevel}
        - Normal Parameters: ${report.analysis.summary.normalCount}
        - Abnormal Parameters: ${report.analysis.summary.abnormalCount}
        - Critical Parameters: ${report.analysis.summary.criticalCount}
        ` : ''}
      `;
      
      const blob = new Blob([reportContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${report.title}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: 'Download Started',
        description: `Downloading ${report.title} as text file`,
      });
    }
  };

  // Handle prescription upload
  const handlePrescriptionUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData?.id) return;
    
    try {
      let imageUrl = '';
      
      // Handle image upload
      if (newPrescription.imageFile) {
        // In a real app, you would upload to a cloud service
        // For demo purposes, we'll create a data URL
        const reader = new FileReader();
        imageUrl = await new Promise((resolve) => {
          reader.onload = (e) => {
            resolve(e.target?.result as string);
          };
          reader.readAsDataURL(newPrescription.imageFile!);
        });
      }
      
      const prescription: Prescription = {
        id: `prescription_${Date.now()}`,
        userId: userData.id,
        diagnosis: newPrescription.diagnosis,
        medication: newPrescription.medication,
        dosage: newPrescription.dosage,
        frequency: newPrescription.frequency,
        duration: newPrescription.duration,
        prescribedDate: newPrescription.prescribedDate,
        status: 'active',
        notes: newPrescription.notes,
        refills: newPrescription.refills,
        imageUrl,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Add to prescriptions
      const updatedPrescriptions = [...prescriptions, prescription];
      setPrescriptions(updatedPrescriptions);
      
      // Update localStorage
      const allPrescriptions = JSON.parse(localStorage.getItem('mock_prescriptions') || '[]');
      allPrescriptions.push(prescription);
      localStorage.setItem('mock_prescriptions', JSON.stringify(allPrescriptions));
      
      // Generate new insights
      generateAIInsights(reports, updatedPrescriptions, healthMetrics);
      
      // Reset form and close modal
      setNewPrescription({
        diagnosis: '',
        medication: '',
        dosage: '',
        frequency: '',
        duration: '',
        notes: '',
        prescribedDate: '',
        refills: 0,
        imageFile: null
      });
      setShowAddPrescription(false);
      
      toast({
        title: 'Success',
        description: 'Prescription uploaded successfully',
      });
      
    } catch (error) {
      console.error('Error uploading prescription:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload prescription',
        variant: 'destructive'
      });
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadHealthData();
  }, [loadHealthData]);

  // Refresh reminder count when navigating to reminders tab
  useEffect(() => {
    if (activeTab === 'reminders') {
      const storedReminders = JSON.parse(localStorage.getItem('mock_self_reminders') || '[]');
      const userReminders = storedReminders.filter((r: any) => r.userId === userData?.id);
      setReminderCount(userReminders.filter((r: any) => r.isActive).length);
    }
  }, [activeTab, userData?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your health data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Quick Actions */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-0 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl text-blue-900">Personal Health Dashboard</CardTitle>
              <p className="text-blue-700">Manage your health reports, prescriptions, and insights in one place</p>
            </div>
            <div className="flex items-center space-x-3">
              <Dialog open={showAddReport} onOpenChange={setShowAddReport}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Report
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader className="text-center pb-6">
                    <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                      <Upload className="w-8 h-8 text-blue-600" />
                    </div>
                    <DialogTitle className="text-2xl font-bold text-gray-900">Upload Health Report</DialogTitle>
                    <DialogDescription className="text-gray-600">
                      Upload medical reports, lab results, and health documents for AI analysis
                    </DialogDescription>
                  </DialogHeader>
                  
                  <form onSubmit={handleReportUpload} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="reportTitle" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          Report Title *
                        </Label>
                        <Input
                          id="reportTitle"
                          value={newReport.title}
                          onChange={(e) => setNewReport(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="e.g., Blood Test Results - January 2024"
                          required
                          className="h-11 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="reportType" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          Report Type *
                        </Label>
                        <Select 
                          value={newReport.reportType} 
                          onValueChange={(value: HealthReport['reportType']) => setNewReport(prev => ({ ...prev, reportType: value }))}
                        >
                          <SelectTrigger className="h-11 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200">
                            <SelectValue placeholder="Select report type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bloodtest">🩸 Blood Test</SelectItem>
                            <SelectItem value="xray">📷 X-Ray</SelectItem>
                            <SelectItem value="mri">🧠 MRI</SelectItem>
                            <SelectItem value="ecg">💓 ECG</SelectItem>
                            <SelectItem value="urinetest">🧪 Urine Test</SelectItem>
                            <SelectItem value="scan">🔍 Scan</SelectItem>
                            <SelectItem value="other">📄 Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="labName" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          Lab/Clinic Name
                        </Label>
                        <Input
                          id="labName"
                          value={newReport.labName}
                          onChange={(e) => setNewReport(prev => ({ ...prev, labName: e.target.value }))}
                          placeholder="e.g., City Medical Laboratory"
                          className="h-11 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="doctorName" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          Doctor Name
                        </Label>
                        <Input
                          id="doctorName"
                          value={newReport.doctorName}
                          onChange={(e) => setNewReport(prev => ({ ...prev, doctorName: e.target.value }))}
                          placeholder="e.g., Dr. Sarah Johnson"
                          className="h-11 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="notes" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        Additional Notes
                      </Label>
                      <Textarea
                        id="notes"
                        value={newReport.notes}
                        onChange={(e) => setNewReport(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Any additional notes, symptoms, or context about this report..."
                        rows={3}
                        className="border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <Label htmlFor="reportImage" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        Report File *
                      </Label>
                      <div className="space-y-3">
                        <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                          newReport.imageFile ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                        }`}>
                          <Input
                            id="reportImage"
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                // Validate file type
                                if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
                                  toast({
                                    title: 'Invalid file type',
                                    description: 'Please select an image file (PNG, JPG, JPEG) or PDF file',
                                    variant: 'destructive'
                                  });
                                  return;
                                }
                                // Validate file size (15MB limit for reports)
                                if (file.size > 15 * 1024 * 1024) {
                                  toast({
                                    title: 'File too large',
                                    description: 'Please select a file smaller than 15MB',
                                    variant: 'destructive'
                                  });
                                  return;
                                }
                                setNewReport(prev => ({ ...prev, imageFile: file }));
                              }
                            }}
                            className="cursor-pointer absolute inset-0 w-full h-full opacity-0"
                          />
                          <div className="space-y-3">
                            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                              <Upload className="w-8 h-8 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-base font-medium text-gray-700">
                                {newReport.imageFile ? 'File selected successfully!' : 'Click to upload or drag and drop'}
                              </p>
                              <p className="text-sm text-gray-500 mt-1">
                                {newReport.imageFile ? newReport.imageFile.name : 'PNG, JPG, JPEG, PDF up to 15MB'}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {newReport.imageFile && (
                          <div className="relative bg-white rounded-lg border border-gray-200 p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                {newReport.imageFile.type.startsWith('image/') ? (
                                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <span className="text-blue-600 text-lg">🖼️</span>
                                  </div>
                                ) : newReport.imageFile.type === 'application/pdf' ? (
                                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                    <FileText className="w-5 h-5 text-red-600" />
                                  </div>
                                ) : (
                                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <FileText className="w-5 h-5 text-gray-600" />
                                  </div>
                                )}
                                <div>
                                  <p className="font-medium text-gray-900">{newReport.imageFile.name}</p>
                                  <p className="text-sm text-gray-500">
                                    {(newReport.imageFile.size / 1024 / 1024).toFixed(2)} MB
                                  </p>
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setNewReport(prev => ({ ...prev, imageFile: null }))}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                            
                            {newReport.imageFile.type.startsWith('image/') ? (
                              <img
                                src={URL.createObjectURL(newReport.imageFile)}
                                alt="Report preview"
                                className="w-full h-32 object-cover rounded-lg border border-gray-200"
                              />
                            ) : newReport.imageFile.type === 'application/pdf' && (
                              <div className="w-full h-32 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
                                   onClick={() => {
                                     const url = URL.createObjectURL(newReport.imageFile!);
                                     setCurrentPDFUrl(url);
                                     setCurrentPDFTitle(newReport.imageFile!.name);
                                     setShowPDFViewer(true);
                                   }}
                              >
                                <div className="text-center">
                                  <FileText className="w-12 h-12 text-red-500 mx-auto mb-2" />
                                  <p className="text-sm text-gray-600 font-medium">PDF Document</p>
                                  <p className="text-xs text-gray-500">Click to preview</p>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex space-x-3 pt-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setShowAddReport(false)}
                        className="flex-1 h-11 border-gray-300 hover:bg-gray-50"
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-200"
                        disabled={!newReport.title || !newReport.reportType || !newReport.imageFile}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Report
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
              
              <Dialog open={showAddPrescription} onOpenChange={setShowAddPrescription}>
                <DialogTrigger asChild>
                  <Button className="bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Prescription
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader className="text-center pb-6">
                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                      <Plus className="w-8 h-8 text-green-600" />
                    </div>
                    <DialogTitle className="text-2xl font-bold text-gray-900">Add New Prescription</DialogTitle>
                    <DialogDescription className="text-gray-600">
                      Add prescription details and medication information for better health tracking
                    </DialogDescription>
                  </DialogHeader>
                  
                  <form onSubmit={handlePrescriptionUpload} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="diagnosis" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          Diagnosis *
                        </Label>
                        <Input
                          id="diagnosis"
                          value={newPrescription.diagnosis}
                          onChange={(e) => setNewPrescription(prev => ({ ...prev, diagnosis: e.target.value }))}
                          placeholder="e.g., Hypertension, Diabetes Type 2"
                          required
                          className="h-11 border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="medication" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          Medication *
                        </Label>
                        <Input
                          id="medication"
                          value={newPrescription.medication}
                          onChange={(e) => setNewPrescription(prev => ({ ...prev, medication: e.target.value }))}
                          placeholder="e.g., Lisinopril 10mg, Metformin 500mg"
                          required
                          className="h-11 border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="dosage" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          Dosage *
                        </Label>
                        <Input
                          id="dosage"
                          value={newPrescription.dosage}
                          onChange={(e) => setNewPrescription(prev => ({ ...prev, dosage: e.target.value }))}
                          placeholder="e.g., 1 tablet, 2 capsules"
                          required
                          className="h-11 border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="frequency" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          Frequency *
                        </Label>
                        <Input
                          id="frequency"
                          value={newPrescription.frequency}
                          onChange={(e) => setNewPrescription(prev => ({ ...prev, frequency: e.target.value }))}
                          placeholder="e.g., Daily, Twice daily, Every 8 hours"
                          required
                          className="h-11 border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="prescribedDate" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          Prescribed Date *
                        </Label>
                        <Input
                          id="prescribedDate"
                          type="date"
                          value={newPrescription.prescribedDate}
                          onChange={(e) => setNewPrescription(prev => ({ ...prev, prescribedDate: e.target.value }))}
                          required
                          className="h-11 border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="prescriptionRefills" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          Refills
                        </Label>
                        <Input
                          id="prescriptionRefills"
                          type="number"
                          min="0"
                          value={newPrescription.refills || ''}
                          onChange={(e) => setNewPrescription(prev => ({ ...prev, refills: parseInt(e.target.value) || 0 }))}
                          placeholder="Number of refills"
                          className="h-11 border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="prescriptionNotes" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        Special Instructions & Notes
                      </Label>
                      <Textarea
                        id="prescriptionNotes"
                        value={newPrescription.notes}
                        onChange={(e) => setNewPrescription(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Enter any special instructions, side effects to watch for, or additional notes..."
                        rows={3}
                        className="border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 resize-none"
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <Label htmlFor="prescriptionImage" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        Prescription Image
                      </Label>
                      <div className="space-y-3">
                        <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                          newPrescription.imageFile ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-green-400 hover:bg-green-50'
                        }`}>
                          <Input
                            id="prescriptionImage"
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                // Validate file type
                                if (!file.type.startsWith('image/')) {
                                  toast({
                                    title: 'Invalid file type',
                                    description: 'Please select an image file (PNG, JPG, JPEG)',
                                    variant: 'destructive'
                                  });
                                  return;
                                }
                                
                                // Validate file size (10MB limit)
                                if (file.size > 10 * 1024 * 1024) {
                                  toast({
                                    title: 'File too large',
                                    description: 'Please select an image smaller than 10MB',
                                    variant: 'destructive'
                                  });
                                  return;
                                }
                                
                                setNewPrescription(prev => ({ ...prev, imageFile: file }));
                              }
                            }}
                            className="cursor-pointer absolute inset-0 w-full h-full opacity-0"
                          />
                          <div className="space-y-3">
                            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                              <span className="text-green-600 text-xl">💊</span>
                            </div>
                            <div>
                              <p className="text-base font-medium text-gray-700">
                                {newPrescription.imageFile ? 'Image selected successfully!' : 'Click to upload or drag and drop'}
                              </p>
                              <p className="text-sm text-gray-500 mt-1">
                                {newPrescription.imageFile ? newPrescription.imageFile.name : 'PNG, JPG, JPEG up to 10MB'}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {newPrescription.imageFile && (
                          <div className="relative bg-white rounded-lg border border-gray-200 p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                  <span className="text-green-600 text-lg">🖼️</span>
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">{newPrescription.imageFile.name}</p>
                                  <p className="text-sm text-gray-500">
                                    {(newPrescription.imageFile.size / 1024 / 1024).toFixed(2)} MB
                                  </p>
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setNewPrescription(prev => ({ ...prev, imageFile: null }))}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                            
                            <img
                              src={URL.createObjectURL(newPrescription.imageFile)}
                              alt="Prescription preview"
                              className="w-full h-32 object-cover rounded-lg border border-gray-200"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex space-x-3 pt-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setShowAddPrescription(false)}
                        className="flex-1 h-11 border-gray-300 hover:bg-gray-50"
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        className="flex-1 h-11 bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl transition-all duration-200"
                        disabled={!newPrescription.diagnosis || !newPrescription.medication || !newPrescription.dosage || !newPrescription.frequency || !newPrescription.prescribedDate}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Prescription
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-7 bg-white shadow-lg rounded-xl p-1">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <Activity className="w-4 h-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center space-x-2">
            <FileText className="w-4 h-4" />
            <span>Reports ({reports.length})</span>
          </TabsTrigger>
          <TabsTrigger value="prescriptions" className="flex items-center space-x-2">
            <Pill className="w-4 h-4" />
            <span>Prescriptions ({prescriptions.length})</span>
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center space-x-2">
            <Brain className="w-4 h-4" />
            <span>AI Insights ({aiInsights.length})</span>
          </TabsTrigger>
          <TabsTrigger value="analysis" className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4" />
            <span>AI Analysis</span>
          </TabsTrigger>
          <TabsTrigger value="metrics" className="flex items-center space-x-2">
            <Scale className="w-4 h-4" />
            <span>Health Metrics</span>
          </TabsTrigger>
          <TabsTrigger value="reminders" className="flex items-center space-x-2">
            <BellRing className="w-4 h-4" />
            <span>Self Reminders</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {/* Quick Stats Cards */}
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-0">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-blue-700">Total Reports</p>
                    <p className="text-2xl font-bold text-blue-900">{reports.length}</p>
                    <p className="text-xs text-blue-600">
                      {reports.filter(r => r.status === 'active').length} active
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-0">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                    <Pill className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-green-700">Active Prescriptions</p>
                    <p className="text-2xl font-bold text-green-900">
                      {prescriptions.filter(p => p.status === 'active').length}
                    </p>
                    <p className="text-xs text-green-600">Current medications</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-0">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-purple-700">AI Insights</p>
                    <p className="text-2xl font-bold text-purple-900">{aiInsights.length}</p>
                    <p className="text-xs text-purple-600">
                      {aiInsights.filter(i => i.severity === 'critical').length} critical
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-0">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-orange-700">Health Score</p>
                    <p className="text-2xl font-bold text-orange-900">85%</p>
                    <p className="text-xs text-orange-600">Based on latest data</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Self Reminders Card */}
            <Card 
              className="bg-gradient-to-br from-pink-50 to-pink-100 border-0 cursor-pointer hover:shadow-lg transition-all duration-200"
              onClick={() => setActiveTab('reminders')}
            >
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-pink-500 rounded-xl flex items-center justify-center">
                    <BellRing className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-pink-700">Self Reminders</p>
                    <p className="text-2xl font-bold text-pink-900">{reminderCount}</p>
                    <p className="text-xs text-pink-600">Active reminders</p>
                  </div>
                  <div className="text-pink-400">
                    <span className="material-icons text-sm">arrow_forward</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity and AI Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Reports */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>Recent Reports</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {reports.length > 0 ? (
                  <div className="space-y-3">
                    {reports.slice(0, 3).map((report) => (
                      <div key={report.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <FileText className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{report.title}</p>
                            <p className="text-xs text-gray-500">{report.reportType}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedReport(report)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No reports uploaded yet</p>
                )}
              </CardContent>
            </Card>

            {/* Critical AI Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <span>Critical Alerts</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {aiInsights.filter(i => i.severity === 'critical').length > 0 ? (
                  <div className="space-y-3">
                    {aiInsights
                      .filter(i => i.severity === 'critical')
                      .slice(0, 3)
                      .map((insight) => (
                        <div key={insight.id} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="font-medium text-sm text-red-800">{insight.title}</p>
                          <p className="text-xs text-red-600 mt-1">{insight.description}</p>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-green-600 text-center py-4">No critical alerts</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Health Reports</CardTitle>
            </CardHeader>
            <CardContent>
              {reports.length > 0 ? (
                <div className="space-y-4">
                  {reports.map((report) => (
                    <div key={report.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FileText className="w-6 h-6 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold">{report.title}</h3>
                            <p className="text-sm text-gray-600">
                              {report.reportType} • {report.labName}
                            </p>
                            <p className="text-xs text-gray-500">
                              Uploaded: {new Date(report.uploadedAt).toLocaleDateString()}
                            </p>
                            
                            {/* AI Analysis Summary */}
                            {report.analysis && (
                              <div className="mt-3 space-y-2">
                                <div className="flex items-center space-x-4">
                                  <Badge 
                                    variant={
                                      report.analysis.summary.riskLevel === 'critical' ? 'destructive' :
                                      report.analysis.summary.riskLevel === 'high' ? 'default' :
                                      report.analysis.summary.riskLevel === 'medium' ? 'secondary' :
                                      'outline'
                                    }
                                    className="text-xs"
                                  >
                                    {report.analysis.summary.overallStatus}
                                  </Badge>
                                  <div className="flex items-center space-x-2 text-xs text-gray-600">
                                    <span>Normal: {report.analysis.summary.normalCount}</span>
                                    <span>Abnormal: {report.analysis.summary.abnormalCount}</span>
                                    {report.analysis.summary.criticalCount > 0 && (
                                      <span className="text-red-600 font-medium">
                                        Critical: {report.analysis.summary.criticalCount}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                
                                {/* Quick Recommendations */}
                                {report.analysis.summary.recommendations.length > 0 && (
                                  <div className="text-xs text-gray-600">
                                    <span className="font-medium">Recommendations:</span> {report.analysis.summary.recommendations[0]}
                                    {report.analysis.summary.recommendations.length > 1 && '...'}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <Badge variant={report.status === 'active' ? 'default' : 'secondary'}>
                            {report.status}
                          </Badge>
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedReport(report)}
                              className="hover:bg-blue-50 hover:text-blue-600"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {report.fileUrl && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewPDF(report)}
                                className="hover:bg-green-50 hover:text-green-600"
                                title="View PDF"
                              >
                                <FileText className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownloadReport(report)}
                              className="hover:bg-purple-50 hover:text-purple-600"
                              title="Download Report"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      {/* Report Image/File */}
                      {report.imageUrl && (
                        <div className="mt-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <FileText className="w-4 h-4 text-gray-500" />
                              <span className="text-sm font-medium text-gray-700">Report File</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                // Open full screen image
                                const newWindow = window.open();
                                if (newWindow) {
                                  newWindow.document.write(`
                                    <html>
                                      <head>
                                        <title>${report.title}</title>
                                        <style>
                                          body { margin: 0; padding: 20px; background: #f5f5f5; font-family: Arial, sans-serif; }
                                          .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                                          h1 { color: #333; margin-bottom: 20px; }
                                          .report-info { background: #f8f9fa; padding: 15px; border-radius: 6px; margin-bottom: 20px; }
                                          .report-info p { margin: 5px 0; }
                                          img { max-width: 100%; height: auto; border-radius: 6px; }
                                          .pdf-placeholder { background: #e9ecef; padding: 40px; text-align: center; border-radius: 6px; }
                                        </style>
                                      </head>
                                      <body>
                                        <div class="container">
                                          <h1>${report.title}</h1>
                                          <div class="report-info">
                                            <p><strong>Type:</strong> ${report.reportType}</p>
                                            <p><strong>Lab:</strong> ${report.labName || 'Not specified'}</p>
                                            <p><strong>Doctor:</strong> ${report.doctorName || 'Not specified'}</p>
                                            <p><strong>Uploaded:</strong> ${new Date(report.uploadedAt).toLocaleDateString()}</p>
                                          </div>
                                          ${report.imageUrl && report.imageUrl.startsWith('data:image/') 
                                            ? `<img src="${report.imageUrl}" alt="${report.title}" />`
                                            : `<div class="pdf-placeholder"><p>PDF File: ${report.title}</p><p>Click to download or view in your PDF reader</p></div>`
                                          }
                                        </div>
                                      </body>
                                    </html>
                                  `);
                                }
                              }}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View Full Size
                            </Button>
                          </div>
                          <div className="relative group">
                            {report.imageUrl.startsWith('data:image/') ? (
                              <img
                                src={report.imageUrl}
                                alt="Report"
                                className="w-full max-w-xs h-32 object-cover rounded-lg border border-gray-200 hover:opacity-90 transition-opacity cursor-pointer"
                              />
                            ) : (
                              <div className="w-full max-w-xs h-32 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                                <FileText className="w-12 h-12 text-gray-400" />
                                <span className="ml-2 text-sm text-gray-600">PDF Report</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No health reports uploaded yet</p>
                  <p className="text-sm text-gray-500 mb-4">Upload your first report to get started</p>
                  <Button onClick={() => setShowAddReport(true)}>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Report
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Prescriptions Tab */}
        <TabsContent value="prescriptions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Prescriptions</CardTitle>
            </CardHeader>
            <CardContent>
              {prescriptions.length > 0 ? (
                <div className="space-y-4">
                  {prescriptions.map((prescription) => (
                    <div key={prescription.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Pill className="w-6 h-6 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold">{prescription.medication}</h3>
                            <p className="text-sm text-gray-600">
                              {prescription.diagnosis} • {prescription.dosage}
                            </p>
                            <p className="text-xs text-gray-500">
                              Prescribed: {new Date(prescription.prescribedDate).toLocaleDateString()}
                              {prescription.refills && prescription.refills > 0 && ` • ${prescription.refills} refills`}
                            </p>
                            {prescription.notes && (
                              <p className="text-sm text-gray-600 mt-2">{prescription.notes}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <Badge variant={prescription.status === 'active' ? 'default' : 'secondary'}>
                            {prescription.status}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedPrescription(prescription)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {/* Prescription Image */}
                      {prescription.imageUrl && (
                        <div className="mt-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <FileText className="w-4 h-4 text-gray-500" />
                              <span className="text-sm font-medium text-gray-700">Prescription Image</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                // Open image in full screen
                                const newWindow = window.open();
                                if (newWindow) {
                                  newWindow.document.write(`
                                    <html>
                                      <head>
                                        <title>Prescription Image - ${prescription.medication}</title>
                                        <style>
                                          body { margin: 0; padding: 20px; background: #f5f5f5; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
                                          img { max-width: 100%; max-height: 90vh; object-fit: contain; border-radius: 8px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); }
                                          .info { position: absolute; top: 20px; left: 20px; background: white; padding: 15px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
                                        </style>
                                      </head>
                                      <body>
                                        <div class="info">
                                          <h3 style="margin: 0 0 10px 0; color: #374151;">${prescription.medication}</h3>
                                          <p style="margin: 0; color: #6b7280; font-size: 14px;">${prescription.diagnosis}</p>
                                        </div>
                                        <img src="${prescription.imageUrl}" alt="Prescription" />
                                      </body>
                                    </html>
                                  `);
                                }
                              }}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View Full Size
                            </Button>
                          </div>
                          <div className="relative group">
                            <img
                              src={prescription.imageUrl}
                              alt="Prescription"
                              className="w-full max-w-xs h-32 object-cover rounded-lg border border-gray-200 hover:opacity-90 transition-opacity"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Pill className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No prescriptions added yet</p>
                  <p className="text-sm text-gray-500 mb-4">Add your first prescription to track medications</p>
                  <Button onClick={() => setShowAddPrescription(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Prescription
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Health Insights</CardTitle>
            </CardHeader>
            <CardContent>
              {aiInsights.length > 0 ? (
                <div className="space-y-4">
                  {aiInsights.map((insight) => (
                    <div key={insight.id} className={`p-4 border rounded-lg ${
                      insight.severity === 'critical' ? 'bg-red-50 border-red-200' :
                      insight.severity === 'high' ? 'bg-orange-50 border-orange-200' :
                      insight.severity === 'medium' ? 'bg-yellow-50 border-yellow-200' :
                      'bg-blue-50 border-blue-200'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold">{insight.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge variant="outline">{insight.category}</Badge>
                            <Badge variant={insight.severity === 'critical' ? 'destructive' : 'default'}>
                              {insight.severity}
                            </Badge>
                          </div>
                        </div>
                        {insight.actionable && (
                          <Button variant="outline" size="sm">
                            Take Action
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No AI insights available yet</p>
                  <p className="text-sm text-gray-500">Upload reports and prescriptions to generate insights</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Analysis Tab */}
        <TabsContent value="analysis" className="space-y-6">
          <SelfAIAnalysis />
        </TabsContent>

        {/* Health Metrics Tab */}
        <TabsContent value="metrics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Health Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              {healthMetrics.length > 0 ? (
                <div className="space-y-4">
                  {healthMetrics.map((metric) => (
                    <div key={metric.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{metric.name}</h3>
                        <Badge variant={
                          metric.status === 'critical' ? 'destructive' :
                          metric.status === 'high' ? 'default' :
                          metric.status === 'low' ? 'secondary' :
                          'outline'
                        }>
                          {metric.status}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-2xl font-bold">{metric.value} {metric.unit}</div>
                        <div className="text-sm text-gray-500">
                          Target: {metric.targetRange.min} - {metric.targetRange.max} {metric.unit}
                        </div>
                      </div>
                      {metric.aiAnalysis && (
                        <p className="text-sm text-gray-600 mt-2">{metric.aiAnalysis}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No health metrics available yet</p>
                  <p className="text-sm text-gray-500">Metrics will be extracted from your reports</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Self Reminders Tab */}
        <TabsContent value="reminders" className="space-y-6">
          <SelfReminder />
        </TabsContent>
      </Tabs>

      {/* Report Detail Modal */}
      <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          {selectedReport && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-3">
                  <FileText className="w-6 h-6 text-blue-600" />
                  <span>{selectedReport.title}</span>
                  {selectedReport.analysis && (
                    <Badge 
                      variant={
                        selectedReport.analysis.summary.riskLevel === 'critical' ? 'destructive' :
                        selectedReport.analysis.summary.riskLevel === 'high' ? 'default' :
                        selectedReport.analysis.summary.riskLevel === 'medium' ? 'secondary' :
                        'outline'
                      }
                      className="ml-2"
                    >
                      {selectedReport.analysis.summary.overallStatus}
                    </Badge>
                  )}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                {/* Report Image/File Section */}
                {selectedReport.imageUrl && (
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center space-x-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <span>Report File</span>
                    </h3>
                    <div className="relative group">
                      {selectedReport.imageUrl.startsWith('data:image/') ? (
                        <img
                          src={selectedReport.imageUrl}
                          alt="Report"
                          className="w-full max-w-2xl h-64 object-contain rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => {
                            // Open full screen image
                            const newWindow = window.open();
                            if (newWindow) {
                              newWindow.document.write(`
                                <html>
                                  <head>
                                    <title>${selectedReport.title}</title>
                                    <style>
                                      body { margin: 0; padding: 20px; background: #f5f5f5; font-family: Arial, sans-serif; }
                                      .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                                      h1 { color: #333; margin-bottom: 20px; }
                                      .report-info { background: #f8f9fa; padding: 15px; border-radius: 6px; margin-bottom: 20px; }
                                      .report-info p { margin: 5px 0; }
                                      img { max-width: 100%; height: auto; border-radius: 6px; }
                                    </style>
                                  </head>
                                  <body>
                                    <div class="container">
                                      <h1>${selectedReport.title}</h1>
                                      <div class="report-info">
                                        <p><strong>Type:</strong> ${selectedReport.reportType}</p>
                                        <p><strong>Lab:</strong> ${selectedReport.labName || 'Not specified'}</p>
                                        <p><strong>Doctor:</strong> ${selectedReport.doctorName || 'Not specified'}</p>
                                        <p><strong>Uploaded:</strong> ${new Date(selectedReport.uploadedAt).toLocaleDateString()}</p>
                                      </div>
                                      <img src="${selectedReport.imageUrl}" alt="${selectedReport.title}" />
                                    </div>
                                  </body>
                                </html>
                              `);
                            }
                          }}
                        />
                      ) : (
                        <div className="w-full max-w-2xl h-64 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                          <div className="text-center">
                            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-lg font-medium text-gray-600">PDF Report</p>
                            <p className="text-sm text-gray-500">Click to download or view in your PDF reader</p>
                          </div>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 rounded-lg flex items-center justify-center">
                        <span className="text-white opacity-0 group-hover:opacity-100 text-sm font-medium bg-black bg-opacity-50 px-3 py-1 rounded">
                          Click to view full size
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Basic Information */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-semibold">Report Type:</p>
                    <p>{selectedReport.reportType}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Lab/Clinic:</p>
                    <p>{selectedReport.labName || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Doctor:</p>
                    <p>{selectedReport.doctorName || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Status:</p>
                    <Badge variant={selectedReport.status === 'active' ? 'default' : 'secondary'}>
                      {selectedReport.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="font-semibold">Uploaded:</p>
                    <p>{new Date(selectedReport.uploadedAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Risk Level:</p>
                    {selectedReport.analysis ? (
                      <Badge 
                        variant={
                          selectedReport.analysis.summary.riskLevel === 'critical' ? 'destructive' :
                          selectedReport.analysis.summary.riskLevel === 'high' ? 'default' :
                          selectedReport.analysis.summary.riskLevel === 'medium' ? 'secondary' :
                          'outline'
                        }
                      >
                        {selectedReport.analysis.summary.riskLevel.toUpperCase()}
                      </Badge>
                    ) : (
                      <p>Not available</p>
                    )}
                  </div>
                </div>
                
                {/* AI Analysis Summary */}
                {selectedReport.analysis && (
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center space-x-2">
                      <Brain className="w-5 h-5 text-purple-600" />
                      <span>AI Analysis Summary</span>
                    </h3>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="p-4 bg-green-50 rounded-lg text-center">
                        <div className="text-2xl font-bold text-green-600">{selectedReport.analysis.summary.normalCount}</div>
                        <div className="text-sm text-green-700">Normal Values</div>
                      </div>
                      <div className="p-4 bg-yellow-50 rounded-lg text-center">
                        <div className="text-2xl font-bold text-yellow-600">{selectedReport.analysis.summary.abnormalCount}</div>
                        <div className="text-sm text-yellow-700">Abnormal Values</div>
                      </div>
                      <div className="p-4 bg-red-50 rounded-lg text-center">
                        <div className="text-2xl font-bold text-red-600">{selectedReport.analysis.summary.criticalCount}</div>
                        <div className="text-sm text-red-700">Critical Values</div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Detailed Analysis Results */}
                {selectedReport.analysis && (
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center space-x-2">
                      <BarChart3 className="w-5 h-5 text-blue-600" />
                      <span>Detailed Analysis Results</span>
                    </h3>
                    <div className="space-y-3">
                      {Object.entries(selectedReport.analysis.parameters).map(([key, param]) => (
                        <div key={key} className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <span className="font-medium text-lg">{key}</span>
                            <Badge variant={
                              param.status === 'critical' ? 'destructive' :
                              param.status === 'high' ? 'default' :
                              param.status === 'low' ? 'secondary' :
                              'outline'
                            }>
                              {param.status}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600 font-medium">Value:</span>
                              <p className="font-semibold text-lg">{param.value} {param.unit}</p>
                            </div>
                            <div>
                              <span className="text-gray-600 font-medium">Normal Range:</span>
                              <p className="font-medium">{param.normalRange}</p>
                            </div>
                            <div>
                              <span className="text-gray-600 font-medium">Change:</span>
                              <p className="font-medium">{param.change ? `${param.change > 0 ? '+' : ''}${param.change}%` : 'N/A'}</p>
                            </div>
                            <div>
                              <span className="text-gray-600 font-medium">Status:</span>
                              <Badge variant={
                                param.status === 'critical' ? 'destructive' :
                                param.status === 'high' ? 'default' :
                                param.status === 'low' ? 'secondary' :
                                'outline'
                              }>
                                {param.status}
                              </Badge>
                            </div>
                          </div>
                          {param.significance && (
                            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                              <span className="text-blue-800 font-medium">AI Insight:</span>
                              <p className="text-blue-700 mt-1">{param.significance}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Recommendations */}
                {selectedReport.analysis && selectedReport.analysis.summary.recommendations.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center space-x-2">
                      <Zap className="w-5 h-5 text-yellow-600" />
                      <span>AI Recommendations</span>
                    </h3>
                    <div className="space-y-2">
                      {selectedReport.analysis.summary.recommendations.map((recommendation, index) => (
                        <div key={index} className="p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                          <div className="flex items-start space-x-2">
                            <CheckCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                            <p className="text-yellow-800">{recommendation}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedReport.notes && (
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center space-x-2">
                      <FileText className="w-5 h-5 text-gray-600" />
                      <span>Additional Notes</span>
                    </h3>
                    <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedReport.notes}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Prescription Detail Modal */}
      <Dialog open={!!selectedPrescription} onOpenChange={() => setSelectedPrescription(null)}>
        <DialogContent className="max-w-2xl">
          {selectedPrescription && (
            <>
              <DialogHeader>
                <DialogTitle>Prescription Details</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-semibold">Medication:</p>
                    <p>{selectedPrescription.medication}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Diagnosis:</p>
                    <p>{selectedPrescription.diagnosis}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Dosage:</p>
                    <p>{selectedPrescription.dosage}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Frequency:</p>
                    <p>{selectedPrescription.frequency}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Duration:</p>
                    <p>{selectedPrescription.duration}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Refills:</p>
                    <p>{selectedPrescription.refills || 0}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Status:</p>
                    <Badge variant={selectedPrescription.status === 'active' ? 'default' : 'secondary'}>
                      {selectedPrescription.status}
                    </Badge>
                  </div>
                </div>
                
                {selectedPrescription.notes && (
                  <div>
                    <p className="font-semibold">Notes:</p>
                    <p className="text-gray-600">{selectedPrescription.notes}</p>
                  </div>
                )}
                
                {/* Prescription Image */}
                {selectedPrescription.imageUrl && (
                  <div>
                    <p className="font-semibold mb-3">Prescription Image:</p>
                    <div className="relative group">
                      <img
                        src={selectedPrescription.imageUrl}
                        alt="Prescription"
                        className="w-full max-w-md h-48 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => {
                          // Open image in full screen
                          const newWindow = window.open();
                          if (newWindow) {
                            newWindow.document.write(`
                              <html>
                                <head>
                                  <title>Prescription Image - ${selectedPrescription.medication}</title>
                                  <style>
                                    body { margin: 0; padding: 20px; background: #f5f5f5; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
                                    img { max-width: 100%; max-height: 90vh; object-fit: contain; border-radius: 8px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); }
                                    .info { position: absolute; top: 20px; left: 20px; background: white; padding: 15px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
                                  </style>
                                </head>
                                <body>
                                  <div class="info">
                                    <h3 style="margin: 0 0 10px 0; color: #374151;">${selectedPrescription.medication}</h3>
                                    <p style="margin: 0; color: #6b7280; font-size: 14px;">${selectedPrescription.diagnosis}</p>
                                  </div>
                                  <img src="${selectedPrescription.imageUrl}" alt="Prescription" />
                                </body>
                              </html>
                            `);
                          }
                        }}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 rounded-lg flex items-center justify-center">
                        <span className="text-white opacity-0 group-hover:opacity-100 text-sm font-medium">
                          Click to view full size
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                
                {selectedPrescription.sideEffects && selectedPrescription.sideEffects.length > 0 && (
                  <div>
                    <p className="font-semibold">Side Effects:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedPrescription.sideEffects.map((effect, index) => (
                        <Badge key={index} variant="outline">{effect}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* PDF Viewer Modal */}
      <Dialog open={showPDFViewer} onOpenChange={setShowPDFViewer}>
        <DialogContent className="max-w-6xl max-h-[90vh] w-full">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{currentPDFTitle}</span>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = currentPDFUrl;
                    link.download = `${currentPDFTitle}.pdf`;
                    link.target = '_blank';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="hover:bg-green-50 hover:text-green-600"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(currentPDFUrl, '_blank')}
                  className="hover:bg-blue-50 hover:text-blue-600"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Open in New Tab
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 min-h-0">
            <iframe
              src={`${currentPDFUrl}#toolbar=1&navpanes=1&scrollbar=1`}
              className="w-full h-[70vh] border border-gray-200 rounded-lg"
              title={currentPDFTitle}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SelfHealthDashboard;
