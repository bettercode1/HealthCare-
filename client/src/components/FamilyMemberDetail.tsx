import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/use-toast';
import { familyAPI, medicationAPI, doseAPI, reportAPI, diseaseAnalysisAPI } from '../lib/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogCloseButton
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Loading } from '@/components/ui/loading';
import FileViewer from '@/components/ui/file-viewer';
import { motion } from 'framer-motion';
import BettercodeLogo from './BettercodeLogo';

interface FamilyMember {
  id: string;
  userId: string;
  name: string;
  relationship: string;
  age: number;
  gender: string;
  contactNumber: string;
  emergencyContact: boolean;
  bloodType: string;
  allergies: string[];
  medicalConditions: string[];
  medications: string[];
  lastCheckup: string;
  nextCheckup: string;
  profileImage?: string;
  createdAt?: string;
  updatedAt?: string;
  // Additional comprehensive data
  height?: number;
  weight?: number;
  bmi?: number;
  occupation?: string;
  insuranceProvider?: string;
  insuranceNumber?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  address?: string;
  preferredHospital?: string;
  preferredDoctor?: string;
  dietaryRestrictions?: string[];
  exerciseRoutine?: string;
  sleepPattern?: string;
  stressLevel?: string;
  familyHistory?: string[];
  vaccinationHistory?: string[];
  lastDentalCheckup?: string;
  nextDentalCheckup?: string;
  visionTest?: string;
  hearingTest?: string;
  mentalHealthStatus?: string;
  lifestyleFactors?: string[];
  bloodPressure?: { systolic: number; diastolic: number; lastUpdated: string };
  heartRate?: number;
  temperature?: number;
  oxygenSaturation?: number;
  respiratoryRate?: number;
  bloodSugar?: number;
}

interface Medication {
  id: string;
  medicineName: string;
  dosage: string;
  doseStrength: string;
  doseForm: string;
  frequency: string;
  times: string[];
  instructions: string;
  startDate: string;
  endDate?: string;
  status: 'active' | 'completed' | 'discontinued';
}

interface DoseRecord {
  id: string;
  medicationId: string;
  medicationName: string;
  dosage: string;
  scheduledTime: string;
  status: 'pending' | 'taken' | 'missed' | 'skipped';
  takenTime?: string;
  notes?: string;
}

interface HealthReport {
  id: string;
  title: string;
  reportType: string;
  fileUrl?: string;
  fileName?: string;
  uploadedAt: string;
  doctorName?: string;
  labName?: string;
  notes?: string;
  status: 'pending' | 'reviewed' | 'completed';
}

interface DiseaseAnalysis {
  id: string;
  diseaseName: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  probability: number;
  symptoms: string[];
  aiInsights: string;
  recommendations: string[];
  lastAnalyzed: string;
  medications: string[];
  lifestyleFactors: string[];
}

const FamilyMemberDetail: React.FC<{ 
  memberId: string; 
  isOpen: boolean;
  onClose: () => void;
}> = ({ memberId, isOpen, onClose }) => {
  const { t } = useTranslation();
  const { userData } = useAuth();
  const { toast } = useToast();
  const [member, setMember] = useState<FamilyMember | null>(null);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [doseRecords, setDoseRecords] = useState<DoseRecord[]>([]);
  const [reports, setReports] = useState<HealthReport[]>([]);
  const [diseaseAnalysis, setDiseaseAnalysis] = useState<DiseaseAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Form states
  const [showAddMedication, setShowAddMedication] = useState(false);
  const [showAddReport, setShowAddReport] = useState(false);
  const [showEditMember, setShowEditMember] = useState(false);
  const [newMedication, setNewMedication] = useState({
    medicineName: '',
    dosage: '',
    doseStrength: '',
    doseForm: 'tablet',
    frequency: 'daily',
    times: ['08:00'],
    instructions: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    status: 'active' as const
  });
  const [newReport, setNewReport] = useState({
    title: '',
    reportType: 'lab_report' as const,
    doctorName: '',
    labName: '',
    notes: '',
    file: null as File | null
  });
  const [editMember, setEditMember] = useState<Partial<FamilyMember>>({});
  const [selectedReportFile, setSelectedReportFile] = useState<File | null>(null);
  const [showFileViewer, setShowFileViewer] = useState(false);
  const [selectedReportForViewing, setSelectedReportForViewing] = useState<HealthReport | null>(null);

  useEffect(() => {
    if (memberId && userData && isOpen) {
      loadMemberData();
    }
  }, [memberId, userData, isOpen]);

  const loadMemberData = async () => {
    try {
      setLoading(true);
      
      // Load family member details
      const memberData = await familyAPI.getFamilyMember(memberId);
      console.log('Loaded member data:', memberData);
      setMember(memberData);
      setEditMember(memberData);

      // Load related data
      const [medsData, dosesData, reportsData, analysisData] = await Promise.all([
        medicationAPI.getMedications(),
        doseAPI.getDoseRecords(),
        reportAPI.getReports(),
        diseaseAnalysisAPI.getDiseaseAnalysis()
      ]);

      console.log('All medications:', medsData);
      console.log('All dose records:', dosesData);
      console.log('All reports:', reportsData);
      console.log('All disease analysis:', analysisData);

      // Filter data for this family member
      const filteredMeds = medsData.filter((m: any) => m.familyMemberId === memberId);
      const filteredDoses = dosesData.filter((d: any) => d.familyMemberId === memberId);
      const filteredReports = reportsData.filter((r: any) => r.familyMemberId === memberId);
      const filteredAnalysis = analysisData.filter((a: any) => a.familyMemberId === memberId);

      console.log('Filtered medications for member', memberId, ':', filteredMeds);
      console.log('Filtered dose records for member', memberId, ':', filteredDoses);
      console.log('Filtered reports for member', memberId, ':', filteredReports);
      console.log('Filtered disease analysis for member', memberId, ':', filteredAnalysis);

      setMedications(filteredMeds);
      setDoseRecords(filteredDoses);
      setReports(filteredReports);
      setDiseaseAnalysis(filteredAnalysis);

      // Additional debugging - show data counts
      console.log('Data Summary for Member', memberId, ':');
      console.log('- Medications:', filteredMeds.length);
      console.log('- Dose Records:', filteredDoses.length);
      console.log('- Reports:', filteredReports.length);
      console.log('- Disease Analysis:', filteredAnalysis.length);
    } catch (error) {
      console.error('Error loading member data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load family member data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMember = async () => {
    if (!member) return;
    
    try {
      await familyAPI.updateFamilyMember(member.id, editMember);
      setMember({ ...member, ...editMember });
      setShowEditMember(false);
      toast({
        title: 'Success',
        description: 'Family member updated successfully'
      });
    } catch (error) {
      console.error('Error updating member:', error);
      toast({
        title: 'Error',
        description: 'Failed to update family member',
        variant: 'destructive'
      });
    }
  };

  const handleAddMedication = async () => {
    if (!member) return;
    
    try {
      const medicationData = {
        ...newMedication,
        userId: userData?.id || '',
        familyMemberId: member.id
      };
      
      await medicationAPI.createMedication(medicationData);
      await loadMemberData();
      setShowAddMedication(false);
      setNewMedication({
        medicineName: '',
        dosage: '',
        doseStrength: '',
        doseForm: 'tablet',
        frequency: 'daily',
        times: ['08:00'],
        instructions: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        status: 'active'
      });
      toast({
        title: 'Success',
        description: 'Medication added successfully'
      });
    } catch (error) {
      console.error('Error adding medication:', error);
      toast({
        title: 'Error',
        description: t('failedToAddMedication'),
        variant: 'destructive'
      });
    }
  };

  const handleAddReport = async () => {
    if (!member) return;
    
    try {
      const reportData = {
        ...newReport,
        userId: userData?.id || '',
        familyMemberId: member.id,
        uploadedAt: new Date().toISOString(),
        status: 'pending' as const
      };
      
      await reportAPI.createReport(reportData);
      await loadMemberData();
      setShowAddReport(false);
      setNewReport({
        title: '',
        reportType: 'lab_report',
        doctorName: '',
        labName: '',
        notes: '',
        file: null
      });
      toast({
        title: 'Success',
        description: 'Report uploaded successfully'
      });
    } catch (error) {
      console.error('Error adding report:', error);
      toast({
        title: 'Error',
        description: t('uploadError'),
        variant: 'destructive'
      });
    }
  };

  const handleRunAIAnalysis = async () => {
    if (!member) return;
    
    try {
      const analysisData = {
        userId: userData?.id || '',
        familyMemberId: member.id,
        symptoms: member.medicalConditions,
        currentMedications: medications.map(m => m.medicineName)
      };
      
      await diseaseAnalysisAPI.createDiseaseAnalysis(analysisData);
      await loadMemberData();
      toast({
        title: 'Success',
        description: 'AI analysis completed successfully'
      });
    } catch (error) {
      console.error('Error running AI analysis:', error);
      toast({
        title: 'Error',
        description: 'Failed to run AI analysis',
        variant: 'destructive'
      });
    }
  };

  const handleDoseStatusUpdate = async (doseId: string, status: 'taken' | 'missed' | 'skipped') => {
    try {
      await doseAPI.updateDoseRecord(doseId, { status });
      await loadMemberData();
      toast({
        title: 'Success',
        description: 'Dose status updated successfully'
      });
    } catch (error) {
      console.error('Error updating dose status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update dose status',
        variant: 'destructive'
      });
    }
  };

  // Fixed function with null check
  const getAvatarColor = (relationship: string | undefined) => {
    if (!relationship) return 'bg-gray-100 text-gray-600';
    
    switch (relationship.toLowerCase()) {
      case 'spouse':
      case 'wife':
      case 'husband':
        return 'bg-purple-100 text-purple-600';
      case 'daughter':
      case 'niece':
        return 'bg-pink-100 text-pink-600';
      case 'son':
      case 'nephew':
        return 'bg-green-100 text-green-600';
      case 'mother':
      case 'mother-in-law':
        return 'bg-red-100 text-red-600';
      case 'father':
      case 'father-in-law':
        return 'bg-indigo-100 text-indigo-600';
      case 'sister':
      case 'sister-in-law':
        return 'bg-orange-100 text-orange-600';
      case 'brother':
      case 'brother-in-law':
        return 'bg-blue-100 text-blue-600';
      case 'grandmother':
        return 'bg-yellow-100 text-yellow-600';
      case 'grandfather':
        return 'bg-teal-100 text-teal-600';
      case 'aunt':
        return 'bg-rose-100 text-rose-600';
      case 'uncle':
        return 'bg-cyan-100 text-cyan-600';
      case 'cousin':
        return 'bg-emerald-100 text-emerald-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getAvatarIcon = (relationship: string | undefined) => {
    if (!relationship) return 'person';
    
    switch (relationship.toLowerCase()) {
      case 'daughter':
      case 'son':
      case 'niece':
      case 'nephew':
        return 'child_care';
      case 'spouse':
      case 'wife':
      case 'husband':
        return 'favorite';
      case 'mother':
      case 'mother-in-law':
      case 'grandmother':
        return 'elderly_woman';
      case 'father':
      case 'father-in-law':
      case 'grandfather':
        return 'elderly';
      case 'sister':
      case 'sister-in-law':
        return 'woman';
      case 'brother':
      case 'brother-in-law':
        return 'man';
      case 'aunt':
        return 'woman';
      case 'uncle':
        return 'man';
      case 'cousin':
        return 'group';
      default:
        return 'person';
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleReportFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedReportFile(file);
      setNewReport(prev => ({ ...prev, file }));
    }
  };

  const handleViewReport = (report: HealthReport) => {
    setSelectedReportForViewing(report);
    setShowFileViewer(true);
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl w-[95vw] sm:w-auto max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center h-32">
            <Loading />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!member) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl w-[95vw] sm:w-auto max-h-[90vh] overflow-y-auto">
          <Alert variant="destructive">
            <AlertDescription>{t('familyMemberNotFound')}</AlertDescription>
          </Alert>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
              <DialogContent className="max-w-6xl w-[95vw] sm:w-auto max-h-[95vh] overflow-y-auto bg-gradient-to-br from-white to-gray-50/50">
        <DialogHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg -mt-6 -mx-6 px-6 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-4">
              <motion.div 
                className={`w-16 h-16 rounded-full flex items-center justify-center ${getAvatarColor(member.relationship)} shadow-lg`}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.5, type: "spring" }}
              >
                <span className="material-icons text-2xl">{getAvatarIcon(member.relationship)}</span>
              </motion.div>
              <div>
                <motion.h1 
                  className="text-2xl lg:text-3xl font-bold text-white"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {member.name}
                </motion.h1>
                <motion.p 
                  className="text-blue-100 text-base lg:text-lg"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {member.relationship} • {t('age')}: {member.age} • {t('gender')}: {member.gender}
                </motion.p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 lg:gap-3">
              {member.emergencyContact && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                >
                  <Badge variant="destructive" className="text-sm animate-pulse bg-red-500 text-white">
                    <span className="material-icons text-xs mr-1">emergency</span>
                    <span className="hidden sm:inline">{t('emergencyContact')}</span>
                    <span className="sm:hidden">{t('emergency')}</span>
                  </Badge>
                </motion.div>
              )}
              {member.bloodType && (
                <Badge variant="outline" className="text-white border-white/30 bg-white/10">
                  {t('bloodType')}: {member.bloodType}
                </Badge>
              )}
              <Button
                variant="ghost"
                onClick={() => setShowEditMember(true)}
                className="text-white/90 hover:text-white hover:bg-white/20 transition-all duration-200"
              >
                <span className="material-icons mr-2">edit</span>
                <span className="hidden sm:inline">{t('editProfile')}</span>
                <span className="sm:hidden">{t('edit')}</span>
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-6">
          {/* Enhanced Data Summary */}
          <motion.div 
            className="p-6 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-xl border border-blue-200/50 shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="text-lg font-bold text-blue-900 mb-4">{t('healthDataSummary')}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6">
              <motion.div 
                className="text-center p-4 bg-white rounded-lg border border-blue-200 shadow-sm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="w-12 h-12 mx-auto mb-3 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="material-icons text-blue-600 text-xl">medication</span>
                </div>
                <div className="text-2xl font-bold text-blue-700">{medications.length}</div>
                <div className="text-sm text-blue-600">{t('medications')}</div>
              </motion.div>
              
              <motion.div 
                className="text-center p-4 bg-white rounded-lg border border-green-200 shadow-sm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <div className="w-12 h-12 mx-auto mb-3 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="material-icons text-green-600 text-xl">schedule</span>
                </div>
                <div className="text-2xl font-bold text-green-700">{doseRecords.length}</div>
                <div className="text-sm text-green-600">{t('doseRecords')}</div>
              </motion.div>
              
              <motion.div 
                className="text-center p-4 bg-white rounded-lg border border-orange-200 shadow-sm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <div className="w-12 h-12 mx-auto mb-3 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="material-icons text-orange-600 text-xl">description</span>
                </div>
                <div className="text-2xl font-bold text-orange-700">{reports.length}</div>
                <div className="text-sm text-orange-600">{t('reports')}</div>
              </motion.div>
              
              <motion.div 
                className="text-center p-4 bg-white rounded-lg border border-purple-200 shadow-sm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <div className="w-12 h-12 mx-auto mb-3 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="material-icons text-purple-600 text-xl">psychology</span>
                </div>
                <div className="text-2xl font-bold text-purple-700">{diseaseAnalysis.length}</div>
                <div className="text-sm text-purple-600">{t('aiAnalysis')}</div>
              </motion.div>
            </div>
          </motion.div>

          {/* Enhanced Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 bg-gray-100 p-1 rounded-lg">
              <TabsTrigger 
                value="overview" 
                className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all duration-200"
              >
                <span className="material-icons text-sm mr-2">dashboard</span>
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="health" 
                className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all duration-200"
              >
                <span className="material-icons text-sm mr-2">favorite</span>
                Health Data
              </TabsTrigger>
              <TabsTrigger 
                value="medications" 
                className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all duration-200"
              >
                <span className="material-icons text-sm mr-2">medication</span>
                Medications
              </TabsTrigger>
              <TabsTrigger 
                value="doses" 
                className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all duration-200"
              >
                <span className="material-icons text-sm mr-2">schedule</span>
                Dose Tracker
              </TabsTrigger>
              <TabsTrigger 
                value="reports" 
                className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all duration-200"
              >
                <span className="material-icons text-sm mr-2">description</span>
                Reports
              </TabsTrigger>
              <TabsTrigger 
                value="analysis" 
                className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all duration-200"
              >
                <span className="material-icons text-sm mr-2">psychology</span>
                AI Analysis
              </TabsTrigger>
            </TabsList>

            {/* Enhanced Overview Tab */}
            <TabsContent value="overview" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Info - Enhanced */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50/30">
                    <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
                      <CardTitle className="flex items-center">
                        <span className="material-icons mr-2">person</span>
                        Basic Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-3 rounded-lg border border-blue-100">
                          <Label className="text-xs font-medium text-gray-600">{t('age')}</Label>
                          <p className="text-lg font-bold text-blue-900">{member.age} years</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-blue-100">
                          <Label className="text-xs font-medium text-gray-600">{t('gender')}</Label>
                          <p className="text-lg font-bold text-blue-900">{member.gender || 'Not specified'}</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-blue-100">
                          <Label className="text-xs font-medium text-gray-600">{t('bloodType')}</Label>
                          <p className="text-lg font-bold text-blue-900">{member.bloodType || 'Not specified'}</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-blue-100">
                          <Label className="text-xs font-medium text-gray-600">{t('contact')}</Label>
                          <p className="text-lg font-bold text-blue-900">{member.contactNumber || 'Not specified'}</p>
                        </div>
                      </div>
                      {member.occupation && (
                        <div className="bg-white p-3 rounded-lg border border-blue-100">
                          <Label className="text-xs font-medium text-gray-600">{t('occupation')}</Label>
                          <p className="text-lg font-bold text-blue-900">{member.occupation}</p>
                        </div>
                      )}
                      {member.address && (
                        <div className="bg-white p-3 rounded-lg border border-blue-100">
                          <Label className="text-xs font-medium text-gray-600">{t('address')}</Label>
                          <p className="text-sm font-semibold text-blue-900">{member.address}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Physical Stats - Enhanced */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-green-50/30">
                    <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-lg">
                      <CardTitle className="flex items-center">
                        <span className="material-icons mr-2">fitness_center</span>
                        Physical Statistics
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        {member.height ? (
                          <div className="bg-white p-3 rounded-lg border border-green-100 text-center">
                            <Label className="text-xs font-medium text-gray-600">{t('height')}</Label>
                            <p className="text-lg font-bold text-green-900">{member.height} cm</p>
                          </div>
                        ) : (
                          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-center">
                            <Label className="text-xs font-medium text-gray-500">{t('height')}</Label>
                            <p className="text-sm text-gray-500">{t('notRecorded')}</p>
                          </div>
                        )}
                        {member.weight ? (
                          <div className="bg-white p-3 rounded-lg border border-green-100 text-center">
                            <Label className="text-xs font-medium text-gray-600">{t('weight')}</Label>
                            <p className="text-lg font-bold text-green-900">{member.weight} kg</p>
                          </div>
                        ) : (
                          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-center">
                            <Label className="text-xs font-medium text-gray-500">{t('weight')}</Label>
                            <p className="text-sm text-gray-500">{t('notRecorded')}</p>
                          </div>
                        )}
                        {member.bmi ? (
                          <div className="bg-white p-3 rounded-lg border border-green-100 text-center">
                            <Label className="text-xs font-medium text-gray-600">{t('bmi')}</Label>
                            <p className="text-lg font-bold text-green-900">{member.bmi}</p>
                          </div>
                        ) : (
                          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-center">
                            <Label className="text-xs font-medium text-gray-500">{t('bmi')}</Label>
                            <p className="text-sm text-gray-500">{t('notCalculated')}</p>
                          </div>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {member.visionTest ? (
                          <div className="bg-white p-3 rounded-lg border border-green-100">
                            <Label className="text-xs font-medium text-gray-600">{t('vision')}</Label>
                            <p className="text-lg font-bold text-green-900">{member.visionTest}</p>
                          </div>
                        ) : (
                          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <Label className="text-xs font-medium text-gray-500">{t('vision')}</Label>
                            <p className="text-sm text-gray-500">{t('notTested')}</p>
                          </div>
                        )}
                        {member.hearingTest ? (
                          <div className="bg-white p-3 rounded-lg border border-green-100">
                            <Label className="text-xs font-medium text-gray-600">{t('hearing')}</Label>
                            <p className="text-lg font-bold text-green-900">{member.hearingTest}</p>
                          </div>
                        ) : (
                          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <Label className="text-xs font-medium text-gray-500">{t('hearing')}</Label>
                            <p className="text-sm text-gray-500">{t('notTested')}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Medical Info */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-red-50/30">
                    <CardHeader className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-t-lg">
                      <CardTitle className="flex items-center">
                        <span className="material-icons mr-2">medical_services</span>
                        Medical Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        {member.allergies && member.allergies.length > 0 ? (
                          <div className="bg-white p-3 rounded-lg border border-red-100">
                            <Label className="text-xs font-medium text-gray-600">{t('allergies')}</Label>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {member.allergies.map((allergy, index) => (
                                <Badge key={index} variant="destructive" className="text-xs">
                                  {allergy}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <Label className="text-xs font-medium text-gray-500">{t('allergies')}</Label>
                            <p className="text-sm text-gray-500">{t('noneRecorded')}</p>
                          </div>
                        )}
                        {member.medicalConditions && member.medicalConditions.length > 0 ? (
                          <div className="bg-white p-3 rounded-lg border border-red-100">
                            <Label className="text-xs font-medium text-gray-600">{t('medicalConditions')}</Label>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {member.medicalConditions.map((condition, index) => (
                                <Badge key={index} variant="outline" className="text-xs border-red-200 text-red-700">
                                  {condition}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <Label className="text-xs font-medium text-gray-500">{t('medicalConditions')}</Label>
                            <p className="text-sm text-gray-500">{t('noneRecorded')}</p>
                          </div>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {member.emergencyContact ? (
                          <div className="bg-white p-3 rounded-lg border border-red-100">
                            <Label className="text-xs font-medium text-gray-600">{t('emergencyContact')}</Label>
                            <p className="text-sm font-semibold text-red-900">{member.emergencyContact}</p>
                          </div>
                        ) : (
                          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <Label className="text-xs font-medium text-gray-500">{t('emergencyContact')}</Label>
                            <p className="text-sm text-gray-500">{t('notSpecified')}</p>
                          </div>
                        )}
                        {member.insuranceProvider ? (
                          <div className="bg-white p-3 rounded-lg border border-red-100">
                            <Label className="text-xs font-medium text-gray-600">{t('insurance')}</Label>
                            <p className="text-sm font-semibold text-red-900">{member.insuranceProvider}</p>
                          </div>
                        ) : (
                          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <Label className="text-xs font-medium text-gray-500">{t('insurance')}</Label>
                            <p className="text-sm text-gray-500">{t('notSpecified')}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Appointments & Checkups */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-purple-50/30">
                    <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-t-lg">
                      <CardTitle className="flex items-center">
                        <span className="material-icons mr-2">event</span>
                        Appointments & Checkups
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        {member.nextCheckup ? (
                          <div className="bg-white p-3 rounded-lg border border-purple-100">
                            <Label className="text-xs font-medium text-gray-600">{t('nextCheckup')}</Label>
                            <p className="text-sm font-semibold text-purple-900">{member.nextCheckup}</p>
                          </div>
                        ) : (
                          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <Label className="text-xs font-medium text-gray-500">{t('nextCheckup')}</Label>
                            <p className="text-sm text-gray-500">{t('notScheduled')}</p>
                          </div>
                        )}
                        {member.nextDentalCheckup ? (
                          <div className="bg-white p-3 rounded-lg border border-purple-100">
                            <Label className="text-xs font-medium text-gray-600">{t('nextDental')}</Label>
                            <p className="text-sm font-semibold text-purple-900">{member.nextDentalCheckup}</p>
                          </div>
                        ) : (
                          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <Label className="text-xs font-medium text-gray-500">{t('nextDental')}</Label>
                            <p className="text-sm text-gray-500">{t('notScheduled')}</p>
                          </div>
                        )}
                      </div>
                      {member.lastCheckup && (
                        <div className="bg-white p-3 rounded-lg border border-purple-100">
                          <Label className="text-xs font-medium text-gray-600">{t('lastCheckup')}</Label>
                          <p className="text-sm font-semibold text-purple-900">{member.lastCheckup}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </TabsContent>

            {/* Health Data Tab */}
            <TabsContent value="health" className="space-y-6 mt-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-green-50/30">
                  <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-lg">
                    <CardTitle className="flex items-center">
                      <span className="material-icons mr-2">favorite</span>
                      Health Metrics & Vital Signs
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {/* Blood Pressure */}
                      <div className="bg-white p-4 rounded-xl border border-green-200 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                            <span className="material-icons text-red-600 text-lg">favorite</span>
                          </div>
                          <Badge variant="outline" className="border-green-200 text-green-700">
                            Vital Sign
                          </Badge>
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-2">{t('bloodPressure')}</h4>
                        {member.bloodPressure ? (
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Systolic:</span>
                              <span className="font-bold text-red-600">{member.bloodPressure.systolic} mmHg</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Diastolic:</span>
                              <span className="font-bold text-red-600">{member.bloodPressure.diastolic} mmHg</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-2">
                              Last updated: {member.bloodPressure.lastUpdated || 'Unknown'}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-4">
                            <span className="material-icons text-gray-400 text-2xl mb-2">monitor_heart</span>
                            <p className="text-sm text-gray-500">{t('noBloodPressureData')}</p>
                          </div>
                        )}
                      </div>

                      {/* Heart Rate */}
                      <div className="bg-white p-4 rounded-xl border border-green-200 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                          <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                            <span className="material-icons text-pink-600 text-lg">monitor_heart</span>
                          </div>
                          <Badge variant="outline" className="border-green-200 text-green-700">
                            Vital Sign
                          </Badge>
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-2">{t('heartRate')}</h4>
                        {member.heartRate ? (
                          <div className="space-y-2">
                            <div className="text-center">
                              <span className="text-3xl font-bold text-pink-600">{member.heartRate} bpm</span>
                            </div>
                            <div className="text-xs text-gray-500 text-center">
                              Resting heart rate
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-4">
                            <span className="material-icons text-gray-400 text-2xl mb-2">favorite</span>
                            <p className="text-sm text-gray-500">{t('noHeartRateData')}</p>
                          </div>
                        )}
                      </div>

                      {/* Temperature */}
                      <div className="bg-white p-4 rounded-xl border border-green-200 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                            <span className="material-icons text-orange-600 text-lg">thermostat</span>
                          </div>
                          <Badge variant="outline" className="border-green-200 text-green-700">
                            Vital Sign
                          </Badge>
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-2">{t('bodyTemperature')}</h4>
                        {member.temperature ? (
                          <div className="space-y-2">
                            <div className="text-center">
                              <span className="text-3xl font-bold text-orange-600">{member.temperature}°C</span>
                            </div>
                            <div className="text-xs text-gray-500 text-center">
                              Normal range: 36.1°C - 37.2°C
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-4">
                            <span className="material-icons text-gray-400 text-2xl mb-2">thermostat</span>
                            <p className="text-sm text-gray-500">{t('noTemperatureData')}</p>
                          </div>
                        )}
                      </div>

                      {/* Oxygen Saturation */}
                      <div className="bg-white p-4 rounded-xl border border-green-200 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="material-icons text-blue-600 text-lg">air</span>
                          </div>
                          <Badge variant="outline" className="border-green-200 text-green-700">
                            Vital Sign
                          </Badge>
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-2">{t('oxygenSaturation')}</h4>
                        {member.oxygenSaturation ? (
                          <div className="space-y-2">
                            <div className="text-center">
                              <span className="text-3xl font-bold text-blue-600">{member.oxygenSaturation}%</span>
                            </div>
                            <div className="text-xs text-gray-500 text-center">
                              Normal: ≥95%
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-4">
                            <span className="material-icons text-gray-400 text-2xl mb-2">air</span>
                            <p className="text-sm text-gray-500">{t('noOxygenData')}</p>
                          </div>
                        )}
                      </div>

                      {/* Respiratory Rate */}
                      <div className="bg-white p-4 rounded-xl border border-green-200 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                          <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                            <span className="material-icons text-teal-600 text-lg">airline_seat_flat</span>
                          </div>
                          <Badge variant="outline" className="border-green-200 text-green-700">
                            Vital Sign
                          </Badge>
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-2">{t('respiratoryRate')}</h4>
                        {member.respiratoryRate ? (
                          <div className="space-y-2">
                            <div className="text-center">
                              <span className="text-3xl font-bold text-teal-600">{member.respiratoryRate} bpm</span>
                            </div>
                            <div className="text-xs text-gray-500 text-center">
                              Normal: 12-20 bpm
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-4">
                            <span className="material-icons text-gray-400 text-2xl mb-2">airline_seat_flat</span>
                            <p className="text-sm text-gray-500">{t('noRespiratoryData')}</p>
                          </div>
                        )}
                      </div>

                      {/* Blood Sugar */}
                      <div className="bg-white p-4 rounded-xl border border-green-200 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                            <span className="material-icons text-purple-600 text-lg">water_drop</span>
                          </div>
                          <Badge variant="outline" className="border-green-200 text-green-700">
                            Vital Sign
                          </Badge>
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-2">{t('bloodSugar')}</h4>
                        {member.bloodSugar ? (
                          <div className="space-y-2">
                            <div className="text-center">
                              <span className="text-3xl font-bold text-purple-600">{member.bloodSugar} mg/dL</span>
                            </div>
                            <div className="text-xs text-gray-500 text-center">
                              Fasting: 70-100 mg/dL
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-4">
                            <span className="material-icons text-gray-400 text-2xl mb-2">water_drop</span>
                            <p className="text-sm text-gray-500">{t('noBloodSugarData')}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Medications Tab */}
            <TabsContent value="medications" className="space-y-6 mt-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50/30">
                  <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
                    <CardTitle className="flex items-center">
                      <span className="material-icons mr-2">medication</span>
                      Active Medications & Prescriptions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    {medications.length > 0 ? (
                      <div className="space-y-4">
                        {medications.map((med, index) => (
                          <motion.div
                            key={med.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white p-4 rounded-xl border border-blue-200 shadow-sm hover:shadow-md transition-all duration-200"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                    med.status === 'active' ? 'bg-green-100' : 
                                    med.status === 'completed' ? 'bg-blue-100' : 'bg-gray-100'
                                  }`}>
                                    <span className={`material-icons text-lg ${
                                      med.status === 'active' ? 'text-green-600' : 
                                      med.status === 'completed' ? 'text-blue-600' : 'text-gray-600'
                                    }`}>
                                      {med.status === 'active' ? 'medication' : 
                                       med.status === 'completed' ? 'check_circle' : 'pause_circle'}
                                    </span>
                                  </div>
                                                                     <div className="flex-1">
                                     <h4 className="font-bold text-lg text-gray-900">{med.medicineName}</h4>
                                     <div className="flex items-center gap-2 text-sm text-gray-600">
                                       <span className="font-medium">{med.dosage} {med.doseStrength} {med.doseForm}</span>
                                       <span>•</span>
                                       <span>{med.frequency}</span>
                                       <span>•</span>
                                       <Badge variant={med.status === 'active' ? 'default' : 'secondary'}>
                                         {med.status}
                                       </Badge>
                                     </div>
                                   </div>
                                 </div>
                                 
                                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                                   <div className="bg-gray-50 p-3 rounded-lg">
                                     <Label className="text-xs font-medium text-gray-600">{t('startDate')}</Label>
                                     <p className="text-sm font-semibold text-gray-900">{med.startDate}</p>
                                   </div>
                                   <div className="bg-gray-50 p-3 rounded-lg">
                                     <Label className="text-xs font-medium text-gray-600">{t('endDate')}</Label>
                                     <p className="text-sm font-semibold text-gray-900">{med.endDate || 'Ongoing'}</p>
                                   </div>
                                   <div className="bg-gray-50 p-3 rounded-lg">
                                     <Label className="text-xs font-medium text-gray-600">{t('instructions')}</Label>
                                     <p className="text-sm font-semibold text-gray-900">{med.instructions}</p>
                                   </div>
                                   <div className="bg-gray-50 p-3 rounded-lg">
                                     <Label className="text-xs font-medium text-gray-600">{t('times')}</Label>
                                     <p className="text-sm font-semibold text-gray-900">{med.times.join(', ')}</p>
                                   </div>
                                 </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-center py-12"
                      >
                        <div className="w-24 h-24 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="material-icons text-blue-600 text-3xl">medication</span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('noMedicationsFound')}</h3>
                        <p className="text-gray-500">This family member doesn't have any medications recorded yet.</p>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Dose Tracker Tab */}
            <TabsContent value="doses" className="space-y-6 mt-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-orange-50/30">
                  <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-t-lg">
                    <CardTitle className="flex items-center">
                      <span className="material-icons mr-2">schedule</span>
                      Medication Dose Tracking
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    {doseRecords.length > 0 ? (
                      <div className="space-y-4">
                        {doseRecords.map((dose, index) => (
                          <motion.div
                            key={dose.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white p-4 rounded-xl border border-orange-200 shadow-sm hover:shadow-md transition-all duration-200"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                  dose.status === 'taken' ? 'bg-green-100' : 
                                  dose.status === 'missed' ? 'bg-red-100' : 
                                  dose.status === 'skipped' ? 'bg-yellow-100' : 'bg-blue-100'
                                }`}>
                                  <span className={`material-icons text-lg ${
                                    dose.status === 'taken' ? 'text-green-600' : 
                                    dose.status === 'missed' ? 'text-red-600' : 
                                    dose.status === 'skipped' ? 'text-yellow-600' : 'text-blue-600'
                                  }`}>
                                    {dose.status === 'taken' ? 'check_circle' : 
                                     dose.status === 'missed' ? 'cancel' : 
                                     dose.status === 'skipped' ? 'pause_circle' : 'schedule'}
                                  </span>
                                </div>
                                <div>
                                  <h4 className="font-bold text-lg text-gray-900">{dose.medicationName}</h4>
                                  <p className="text-sm text-gray-600">{dose.dosage}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge variant={
                                      dose.status === 'taken' ? 'default' : 
                                      dose.status === 'missed' ? 'destructive' : 
                                      dose.status === 'skipped' ? 'secondary' : 'outline'
                                    }>
                                      {dose.status}
                                    </Badge>
                                    <span className="text-xs text-gray-500">
                                      Scheduled: {new Date(dose.scheduledTime).toLocaleString()}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                {dose.status === 'pending' && (
                                  <>
                                    <Button
                                      size="sm"
                                      onClick={() => handleDoseStatusUpdate(dose.id, 'taken')}
                                      className="bg-green-600 hover:bg-green-700 text-white"
                                    >
                                      <span className="material-icons text-sm mr-1">check</span>
                                      Taken
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleDoseStatusUpdate(dose.id, 'skipped')}
                                      className="border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                                    >
                                      <span className="material-icons text-sm mr-1">pause</span>
                                      Skip
                                    </Button>
                                  </>
                                )}
                                {dose.status === 'taken' && dose.takenTime && (
                                  <div className="text-right">
                                    <p className="text-sm font-medium text-green-700">{t('takenAt')}</p>
                                    <p className="text-xs text-green-600">{new Date(dose.takenTime).toLocaleString()}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {dose.notes && (
                              <div className="mt-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                                <Label className="text-xs font-medium text-orange-700 mb-1 block">{t('notes')}</Label>
                                <p className="text-sm text-orange-800">{dose.notes}</p>
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-center py-12"
                      >
                        <div className="w-24 h-24 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
                          <span className="material-icons text-orange-600 text-3xl">schedule</span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('noDoseRecordsFound')}</h3>
                        <p className="text-gray-500">This family member doesn't have any medication doses scheduled yet.</p>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Reports Tab */}
            <TabsContent value="reports" className="space-y-6 mt-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-indigo-50/30">
                  <CardHeader className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-t-lg">
                    <CardTitle className="flex items-center">
                      <span className="material-icons mr-2">description</span>
                      Health Reports & Documents
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    {reports.length > 0 ? (
                      <div className="space-y-4">
                        {reports.map((report, index) => (
                          <motion.div
                            key={report.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white p-4 rounded-xl border border-indigo-200 shadow-sm hover:shadow-md transition-all duration-200"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                  report.status === 'completed' ? 'bg-green-100' : 
                                  report.status === 'reviewed' ? 'bg-blue-100' : 'bg-yellow-100'
                                }`}>
                                  <span className={`material-icons text-lg ${
                                    report.status === 'completed' ? 'text-green-600' : 
                                    report.status === 'reviewed' ? 'text-blue-600' : 'text-yellow-600'
                                  }`}>
                                    {report.status === 'completed' ? 'check_circle' : 
                                     report.status === 'reviewed' ? 'visibility' : 'pending'}
                                  </span>
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-bold text-lg text-gray-900">{report.title}</h4>
                                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                    <Badge variant="outline" className="border-indigo-200 text-indigo-700">
                                      {report.reportType.replace('_', ' ').toUpperCase()}
                                    </Badge>
                                    <Badge variant={
                                      report.status === 'completed' ? 'default' : 
                                      report.status === 'reviewed' ? 'secondary' : 'outline'
                                    }>
                                      {report.status}
                                    </Badge>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-3">
                                    {report.doctorName && (
                                      <div className="bg-gray-50 p-3 rounded-lg">
                                        <Label className="text-xs font-medium text-gray-600">{t('doctor')}</Label>
                                        <p className="text-sm font-semibold text-gray-900">{report.doctorName}</p>
                                      </div>
                                    )}
                                    {report.labName && (
                                      <div className="bg-gray-50 p-3 rounded-lg">
                                        <Label className="text-xs font-medium text-gray-600">{t('lab')}</Label>
                                        <p className="text-sm font-semibold text-gray-900">{report.labName}</p>
                                      </div>
                                    )}
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                      <Label className="text-xs font-medium text-gray-600">{t('uploaded')}</Label>
                                      <p className="text-sm font-semibold text-gray-900">
                                        {new Date(report.uploadedAt).toLocaleDateString()}
                                      </p>
                                    </div>
                                  </div>

                                  {report.notes && (
                                    <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-200">
                                      <Label className="text-xs font-medium text-indigo-700 mb-1 block">{t('notes')}</Label>
                                      <p className="text-sm text-indigo-800">{report.notes}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex flex-col items-end gap-2">
                                {report.fileUrl && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleViewReport(report)}
                                    className="border-indigo-300 text-indigo-700 hover:bg-indigo-50"
                                  >
                                    <span className="material-icons text-sm mr-1">visibility</span>
                                    View
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setNewReport({
                                      title: report.title,
                                      reportType: report.reportType as any,
                                      doctorName: report.doctorName || '',
                                      labName: report.labName || '',
                                      notes: report.notes || '',
                                      file: null
                                    });
                                    setShowAddReport(true);
                                  }}
                                  className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                                >
                                  <span className="material-icons text-sm mr-1">edit</span>
                                  Edit
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-center py-12"
                      >
                        <div className="w-24 h-24 mx-auto mb-4 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="material-icons text-indigo-600 text-3xl">description</span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('noReportsFound')}</h3>
                        <p className="text-gray-500">This family member doesn't have any health reports uploaded yet.</p>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* AI Analysis Tab */}
            <TabsContent value="analysis" className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{t('aiDiseaseAnalysis')}</h3>
                <Button onClick={handleRunAIAnalysis}>
                  <span className="material-icons mr-2">psychology</span>
                  Run Analysis
                </Button>
              </div>

              {diseaseAnalysis.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <span className="material-icons text-4xl text-gray-400 mb-4">psychology</span>
                    <p className="text-gray-500">No AI analysis available</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={handleRunAIAnalysis}
                    >
                      Run First Analysis
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6">
                  {diseaseAnalysis.map((analysis) => (
                    <Card key={analysis.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle>{analysis.diseaseName}</CardTitle>
                          <Badge className={getRiskLevelColor(analysis.riskLevel || 'low')}>
                            {analysis.riskLevel || 'Unknown'} Risk
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Probability</Label>
                          <div className="flex items-center space-x-2 mt-1">
                            <Progress value={analysis.probability} className="flex-1" />
                            <span className="text-sm font-medium">{analysis.probability}%</span>
                          </div>
                        </div>
                        
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Symptoms</Label>
                                                      <div className="flex flex-wrap gap-2 mt-2">
                            {analysis.symptoms && analysis.symptoms.map((symptom, index) => (
                              <Badge key={index} variant="outline">{symptom}</Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <Label className="text-sm font-medium text-gray-600">AI Insights</Label>
                          <p className="text-sm text-gray-600 mt-1">{analysis.aiInsights}</p>
                        </div>

                        <div>
                          <Label className="text-sm font-medium text-gray-600">Recommendations</Label>
                          <ul className="list-disc list-inside text-sm text-gray-600 mt-1 space-y-1">
                            {analysis.recommendations && analysis.recommendations.map((rec, index) => (
                              <li key={index}>{rec}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="text-xs text-gray-500">
                          Last analyzed: {analysis.lastAnalyzed ? new Date(analysis.lastAnalyzed).toLocaleDateString() : 'Unknown'}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Add Medication Dialog */}
        {showAddMedication && (
          <Dialog open={showAddMedication} onOpenChange={setShowAddMedication}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('addMedication')}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="medicineName">{t('medicineName')}</Label>
                  <Input
                    id="medicineName"
                    value={newMedication.medicineName}
                    onChange={(e) => setNewMedication({...newMedication, medicineName: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dosage">{t('dosage')}</Label>
                    <Input
                      id="dosage"
                      value={newMedication.dosage}
                      onChange={(e) => setNewMedication({...newMedication, dosage: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="doseStrength">{t('strength')}</Label>
                    <Input
                      id="doseStrength"
                      value={newMedication.doseStrength}
                      onChange={(e) => setNewMedication({...newMedication, doseStrength: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="doseForm">{t('form')}</Label>
                    <Select value={newMedication.doseForm} onValueChange={(value) => setNewMedication({...newMedication, doseForm: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tablet">{t('tablet')}</SelectItem>
                        <SelectItem value="capsule">{t('capsule')}</SelectItem>
                        <SelectItem value="liquid">{t('liquid')}</SelectItem>
                        <SelectItem value="injection">{t('injection')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="frequency">{t('frequency')}</Label>
                    <Select value={newMedication.frequency} onValueChange={(value) => setNewMedication({...newMedication, frequency: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">{t('daily')}</SelectItem>
                        <SelectItem value="twice_daily">{t('twiceDaily')}</SelectItem>
                        <SelectItem value="weekly">{t('weekly')}</SelectItem>
                        <SelectItem value="as_needed">{t('asNeeded')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="instructions">{t('instructions')}</Label>
                  <Textarea
                    id="instructions"
                    value={newMedication.instructions}
                    onChange={(e) => setNewMedication({...newMedication, instructions: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">{t('startDate')}</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={newMedication.startDate}
                      onChange={(e) => setNewMedication({...newMedication, startDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">{t('endDateOptional')}</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={newMedication.endDate}
                      onChange={(e) => setNewMedication({...newMedication, endDate: e.target.value})}
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowAddMedication(false)}>
                    {t('cancel')}
                  </Button>
                  <Button onClick={handleAddMedication}>
                    {t('addMedication')}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Add Report Dialog */}
        {showAddReport && (
          <Dialog open={showAddReport} onOpenChange={setShowAddReport}>
            <DialogContent className="max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl w-[95vw] relative">
              <DialogCloseButton />
              <DialogHeader>
                <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                  {t('uploadReport')}
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-600 mb-4">
                  {t('uploadReportDescription')}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 sm:space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="reportTitle" className="text-sm font-medium text-gray-700">
                    {t('reportTitle')}
                  </Label>
                  <Input
                    id="reportTitle"
                    value={newReport.title}
                    onChange={(e) => setNewReport(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Blood Test Report"
                    required
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="reportType" className="text-sm font-medium text-gray-700">
                    {t('reportType')}
                  </Label>
                  <Select
                    value={newReport.type}
                    onValueChange={(value) => setNewReport(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
                      <SelectValue placeholder={t('selectReportType')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bloodTest">{t('bloodTest')}</SelectItem>
                      <SelectItem value="xray">{t('xray')}</SelectItem>
                      <SelectItem value="mri">{t('mri')}</SelectItem>
                      <SelectItem value="ecg">{t('ecg')}</SelectItem>
                      <SelectItem value="urineTest">{t('urineTest')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="reportFile" className="text-sm font-medium text-gray-700">
                    {t('uploadFile')}
                  </Label>
                  <Input
                    id="reportFile"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleReportFileSelect}
                    required
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:transition-colors"
                  />
                  {selectedReportFile && (
                    <div className="mt-3 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg shadow-sm">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
                        <div className="flex items-center space-x-3 min-w-0 flex-1">
                          <span className="material-icons text-blue-600 text-xl flex-shrink-0">description</span>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-blue-900 truncate">
                              {selectedReportFile.name}
                            </p>
                            <p className="text-xs text-blue-700">
                              {t('size')}: {(selectedReportFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                            <p className="text-xs text-blue-600 mt-1">
                              {t('type')}: {selectedReportFile.type || 'Unknown'}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedReportFile(null)}
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-100 p-2 rounded-full transition-colors flex-shrink-0"
                          title={t('removeFile')}
                        >
                          <span className="material-icons text-lg">close</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="reportNotes" className="text-sm font-medium text-gray-700">
                    Notes
                  </Label>
                  <Textarea
                    id="reportNotes"
                    value={newReport.notes}
                    onChange={(e) => setNewReport(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional notes about this report"
                    rows={3}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                  />
                </div>
                
                <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddReport(false)}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddReport}
                    disabled={!selectedReportFile || !newReport.title}
                    className="w-full sm:w-auto px-6 py-2.5 text-white hover:bg-blue-700 transition-colors shadow-sm"
                    style={{ backgroundColor: 'hsl(207, 90%, 54%)' }}
                  >
                    {t('uploadReport')}
                  </Button>
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Edit Member Dialog */}
        {showEditMember && (
          <Dialog open={showEditMember} onOpenChange={setShowEditMember}>
            <DialogContent className="max-w-2xl w-[95vw] sm:w-auto max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{t('editFamilyMember')}</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">{t('basicInformation')}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <Label htmlFor="editName">{t('name')}</Label>
                      <Input
                        id="editName"
                        value={editMember.name || ''}
                        onChange={(e) => setEditMember({...editMember, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="editAge">{t('age')}</Label>
                      <Input
                        id="editAge"
                        type="number"
                        value={editMember.age || ''}
                        onChange={(e) => setEditMember({...editMember, age: parseInt(e.target.value)})}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <Label htmlFor="editGender">{t('gender')}</Label>
                      <Select value={editMember.gender || ''} onValueChange={(value) => setEditMember({...editMember, gender: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">{t('male')}</SelectItem>
                          <SelectItem value="Female">{t('female')}</SelectItem>
                          <SelectItem value="Other">{t('other')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="editBloodType">{t('bloodType')}</Label>
                      <Select value={editMember.bloodType || ''} onValueChange={(value) => setEditMember({...editMember, bloodType: value})}>
                        <SelectTrigger>
                          <SelectValue />
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
                  <div>
                                          <Label htmlFor="editContact">{t('contactNumber')}</Label>
                    <Input
                      id="editContact"
                      value={editMember.contactNumber || ''}
                      onChange={(e) => setEditMember({...editMember, contactNumber: e.target.value})}
                    />
                  </div>
                  <div>
                                          <Label htmlFor="editAddress">{t('address')}</Label>
                    <Input
                      id="editAddress"
                      value={editMember.address || ''}
                      onChange={(e) => setEditMember({...editMember, address: e.target.value})}
                    />
                  </div>
                  <div>
                                          <Label htmlFor="editOccupation">{t('occupation')}</Label>
                    <Input
                      id="editOccupation"
                      value={editMember.occupation || ''}
                      onChange={(e) => setEditMember({...editMember, occupation: e.target.value})}
                    />
                  </div>
                </div>

                {/* Physical Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Physical Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    <div>
                      <Label htmlFor="editHeight">Height (cm)</Label>
                      <Input
                        id="editHeight"
                        type="number"
                        value={editMember.height || ''}
                        onChange={(e) => setEditMember({...editMember, height: parseInt(e.target.value)})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="editWeight">Weight (kg)</Label>
                      <Input
                        id="editWeight"
                        type="number"
                        value={editMember.weight || ''}
                        onChange={(e) => setEditMember({...editMember, weight: parseInt(e.target.value)})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="editBMI">BMI</Label>
                      <Input
                        id="editBMI"
                        type="number"
                        step="0.1"
                        value={editMember.bmi || ''}
                        onChange={(e) => setEditMember({...editMember, bmi: parseFloat(e.target.value)})}
                      />
                    </div>
                  </div>
                </div>

                {/* Healthcare Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Healthcare Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="editInsuranceProvider">Insurance Provider</Label>
                      <Input
                        id="editInsuranceProvider"
                        value={editMember.insuranceProvider || ''}
                        onChange={(e) => setEditMember({...editMember, insuranceProvider: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="editInsuranceNumber">Insurance Number</Label>
                      <Input
                        id="editInsuranceNumber"
                        value={editMember.insuranceNumber || ''}
                        onChange={(e) => setEditMember({...editMember, insuranceNumber: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="editPreferredHospital">Preferred Hospital</Label>
                      <Input
                        id="editPreferredHospital"
                        value={editMember.preferredHospital || ''}
                        onChange={(e) => setEditMember({...editMember, preferredHospital: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="editPreferredDoctor">Preferred Doctor</Label>
                      <Input
                        id="editPreferredDoctor"
                        value={editMember.preferredDoctor || ''}
                        onChange={(e) => setEditMember({...editMember, preferredDoctor: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Emergency Contact</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="editEmergencyContactName">Emergency Contact Name</Label>
                      <Input
                        id="editEmergencyContactName"
                        value={editMember.emergencyContactName || ''}
                        onChange={(e) => setEditMember({...editMember, emergencyContactName: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="editEmergencyContactPhone">Emergency Contact Phone</Label>
                      <Input
                        id="editEmergencyContactPhone"
                        value={editMember.emergencyContactPhone || ''}
                        onChange={(e) => setEditMember({...editMember, emergencyContactPhone: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="editEmergency"
                      checked={editMember.emergencyContact || false}
                      onChange={(e) => setEditMember({...editMember, emergencyContact: e.target.checked})}
                    />
                    <Label htmlFor="editEmergency">Primary Emergency Contact</Label>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowEditMember(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleUpdateMember}>
                    Update Member
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* File Viewer Modal */}
        {selectedReportForViewing && (
          <FileViewer
            isOpen={showFileViewer}
            onClose={() => {
              setShowFileViewer(false);
              setSelectedReportForViewing(null);
            }}
            fileUrl={selectedReportForViewing.fileUrl || ''}
            fileName={selectedReportForViewing.title}
            fileType={selectedReportForViewing.fileType}
          />
        )}

        {/* Bettercode Logo */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <BettercodeLogo variant="minimal" className="justify-center" />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FamilyMemberDetail;
