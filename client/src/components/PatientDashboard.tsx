import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import FamilyMembers from './dashboard/FamilyMembers';
import UpcomingAppointments from './UpcomingAppointments';
import SelfHealthDashboard from './SelfHealthDashboard';
import InsuranceManagement from './InsuranceManagement';
import {
  User,
  Users,
  CalendarDays,
  Heart,
  CheckCircle,
  AlertTriangle,
  Brain,
  Activity,
  Stethoscope,
  TrendingUp,
  Droplets,
  Thermometer,
  Scale,
  Target,
  RefreshCw,
  Shield
} from 'lucide-react';

interface HealthMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  status: 'normal' | 'borderline' | 'high' | 'low' | 'critical';
  trend: 'up' | 'down' | 'stable';
  lastUpdated: string;
  targetRange: { min: number; max: number };
  aiAnalysis?: string;
  recommendations?: string[];
}

interface DiseaseAnalysis {
  id: string;
  diseaseName: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  probability: number;
  aiInsights: string;
  symptoms: string[];
  recommendations: string[];
  medications: string[];
  lifestyleFactors: string[];
  lastUpdated: string;
}

interface HealthTrend {
  id: string;
  metricName: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
  period: string;
  lastUpdated: string;
}



const PatientDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  console.log('=== PATIENT DASHBOARD DEBUG ===');
  console.log('Current user:', currentUser);
  console.log('Current user ID:', currentUser?.uid);
  
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([]);
  const [diseaseAnalysis, setDiseaseAnalysis] = useState<DiseaseAnalysis[]>([]);
  const [healthTrends, setHealthTrends] = useState<HealthTrend[]>([]);
  const [selectedDisease, setSelectedDisease] = useState<DiseaseAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<HealthMetric | null>(null);
  const [isMetricDialogOpen, setIsMetricDialogOpen] = useState(false);
  const [isDiseaseDialogOpen, setIsDiseaseDialogOpen] = useState(false);
  const [isAnalysisDialogOpen, setIsAnalysisDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newMetric, setNewMetric] = useState({
    name: '',
    value: 0,
    unit: '',
    status: 'normal' as const
  });

  useEffect(() => {
    console.log('PatientDashboard useEffect triggered');
    if (currentUser?.uid) {
      console.log('Loading dashboard data for user:', currentUser.uid);
      loadDashboardData();
    } else {
      console.log('No current user, skipping dashboard data load');
    }

    // Listen for navigation events from child components
    const handleNavigateToTab = (event: CustomEvent) => {
      // setActiveTab(event.detail.tab); // This line was removed from the new_code, so it's removed here.
    };

    window.addEventListener('navigateToTab', handleNavigateToTab as EventListener);
    
    return () => {
      window.removeEventListener('navigateToTab', handleNavigateToTab as EventListener);
    };
  }, [currentUser]);

  // Fallback: Create basic demo data if none exists
  useEffect(() => {
    const createBasicDemoData = async () => {
      try {
        // Check if any demo data exists
        const hasAnyData = localStorage.getItem('mock_health_metrics') || 
                          localStorage.getItem('mock_disease_analysis') || 
                          localStorage.getItem('mock_health_trends');
        
        if (!hasAnyData) {
          console.log('No demo data found, creating basic data...');
          try {
            const { generateDemoData } = await import('@/lib/demoData');
            await generateDemoData(
              currentUser?.uid || 'demo-patient-1',
              'patient',
              'patient@demo.com'
            );
            console.log('Full demo data created');
          } catch (error) {
            console.error('Full demo data generation failed, creating minimal data:', error);
            // Fallback to minimal data
            const { createMinimalDemoData } = await import('@/lib/demoData');
            createMinimalDemoData(currentUser?.uid || 'demo-patient-1');
          }
          
          // Reload dashboard data
          if (currentUser?.uid) {
            loadDashboardData();
          }
        }
      } catch (error) {
        console.error('Failed to create any demo data:', error);
      }
    };

    createBasicDemoData();
  }, [currentUser]);

  const loadDashboardData = async () => {
    try {
      console.log('=== LOAD DASHBOARD DATA DEBUG ===');
      setLoading(true);
      
      // Debug: Check current user and localStorage
      console.log('Current user:', currentUser);
      console.log('Current user ID:', currentUser?.uid);
      
      // Check if demo data exists in localStorage
      const storedHealthMetrics = localStorage.getItem('mock_health_metrics');
      const storedDiseaseAnalysis = localStorage.getItem('mock_disease_analysis');
      const storedHealthTrends = localStorage.getItem('mock_health_trends');
      
      console.log('Stored health metrics:', storedHealthMetrics);
      console.log('Stored disease analysis:', storedDiseaseAnalysis);
      console.log('Stored health trends:', storedHealthTrends);
      
      // If no demo data exists, generate it first
      if (!storedHealthMetrics || !storedDiseaseAnalysis || !storedHealthTrends) {
        console.log('Demo data missing, generating now...');
        try {
          const { generateDemoData } = await import('@/lib/demoData');
          await generateDemoData(
            currentUser?.uid || 'demo-patient-1',
            'patient',
            'patient@demo.com'
          );
          console.log('Demo data generated successfully');
        } catch (error) {
          console.error('Failed to generate demo data:', error);
        }
      }
      
      console.log('Calling API functions...');
      const [metricsData, analysisData, trendsData] = await Promise.all([
        api.healthMetrics.getHealthMetrics(),
        api.diseaseAnalysis.getDiseaseAnalysis(),
        api.healthTrends.getHealthTrends()
      ]);
      
      console.log('API calls completed successfully');
      console.log('Loaded health metrics:', metricsData);
      console.log('Loaded disease analysis:', analysisData);
      console.log('Loaded health trends:', trendsData);
      
      setHealthMetrics(metricsData);
      setDiseaseAnalysis(analysisData);
      setHealthTrends(trendsData);
      setError(null);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
      toast({
        title: t('error'),
        description: t('failedToLoadData'),
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const addHealthMetric = async () => {
    try {
      const metric = await api.healthMetrics.createHealthMetric({
        ...newMetric,
        trend: 'stable',
        lastUpdated: new Date().toISOString(),
        targetRange: { min: 0, max: 100 }
      });
      
      setHealthMetrics(prev => [...prev, metric]);
      setIsMetricDialogOpen(false);
      setNewMetric({ name: '', value: 0, unit: '', status: 'normal' });
      
      toast({
        title: t('success'),
        description: t('healthMetricAdded'),
      });
    } catch (error) {
      console.error('Error adding health metric:', error);
      toast({
        title: t('error'),
        description: t('failedToAddMetric'),
        variant: 'destructive'
      });
    }
  };

  const updateHealthMetric = async (metricId: string, updates: Partial<HealthMetric>) => {
    try {
      const updatedMetric = await api.healthMetrics.updateHealthMetric(metricId, updates);
      setHealthMetrics(prev => 
        prev.map(metric => metric.id === metricId ? updatedMetric : metric)
      );
      
      toast({
        title: t('success'),
        description: t('healthMetricUpdated'),
      });
    } catch (error) {
      console.error('Error updating health metric:', error);
      toast({
        title: t('error'),
        description: t('failedToUpdateMetric'),
        variant: 'destructive'
      });
    }
  };

  const deleteHealthMetric = async (metricId: string) => {
    try {
      await api.healthMetrics.deleteHealthMetric(metricId);
      setHealthMetrics(prev => prev.filter(metric => metric.id !== metricId));
      
      toast({
        title: t('success'),
        description: t('healthMetricDeleted'),
      });
    } catch (error) {
      console.error('Error deleting health metric:', error);
      toast({
        title: t('error'),
        description: t('failedToDeleteMetric'),
        variant: 'destructive'
      });
    }
  };

  const runAIAnalysis = async () => {
    try {
      setLoading(true);
      const analysis = await api.diseaseAnalysis.runAIAnalysis();
      setDiseaseAnalysis(analysis);
      
      toast({
        title: t('success'),
        description: t('aiAnalysisCompleted'),
      });
    } catch (error) {
      console.error('Error running AI analysis:', error);
      toast({
        title: t('error'),
        description: t('failedToRunAnalysis'),
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const openDiseaseDialog = (disease: DiseaseAnalysis) => {
    setSelectedDisease(disease);
    setIsDiseaseDialogOpen(true);
  };



  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'bg-green-100 text-green-800 border-green-200';
      case 'borderline': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'down': return <TrendingUp className="w-4 h-4 text-green-500 transform rotate-180" />;
      case 'stable': return <Activity className="w-4 h-4 text-blue-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getMetricIcon = (metricName: string | undefined) => {
    if (!metricName) return <Activity className="w-6 h-6" />;
    const name = metricName.toLowerCase();
    if (name.includes('blood pressure')) return <Droplets className="w-6 h-6" />;
    if (name.includes('blood sugar')) return <Thermometer className="w-6 h-6" />;
    if (name.includes('cholesterol')) return <Scale className="w-6 h-6" />;
    if (name.includes('bmi')) return <Target className="w-6 h-6" />;
    if (name.includes('heart rate')) return <Heart className="w-6 h-6" />;
    return <Activity className="w-6 h-6" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {t('aiPoweredHealthDashboard')}
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('monitorHealthMetrics')}
            </p>
          </div>
          
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-4">
              <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
              <p className="text-gray-600 text-lg">{t('loadingYourHealthData')}</p>
              <p className="text-sm text-gray-500">{t('pleaseWaitWhileWeFetch')}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {t('aiPoweredHealthDashboard')}
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('monitorHealthMetrics')}
            </p>
          </div>
          
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-4">
              <AlertTriangle className="w-12 h-12 text-red-600 mx-auto" />
              <p className="text-gray-600 text-lg">{t('somethingWentWrong')}</p>
              <p className="text-sm text-gray-500">{error}</p>
              <Button
                onClick={() => {
                  setError(null);
                  loadDashboardData();
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                {t('tryAgain')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      
      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your health data...</p>
        </div>
      )}



      {/* Main Dashboard Content with Tabs */}
              <Tabs defaultValue="self" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white shadow-lg rounded-xl p-1">
            <TabsTrigger value="self" className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>{t('selfHealth')}</span>
            </TabsTrigger>
            <TabsTrigger value="family" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>{t('family')}</span>
            </TabsTrigger>
            <TabsTrigger value="insurance" className="flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>{t('insurance')}</span>
            </TabsTrigger>
            <TabsTrigger value="appointments" className="flex items-center space-x-2">
              <CalendarDays className="w-4 h-4" />
              <span>{t('appointments')}</span>
            </TabsTrigger>
          </TabsList>







        {/* Family Tab */}
        <TabsContent value="family" className="space-y-8">
          <div className="space-y-6">
            {/* Header with Quick Actions */}
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl text-green-900">{t('familyHealthManagement')}</CardTitle>
                    <p className="text-green-700">{t('manageFamilyHealthRecords')}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Button className="bg-green-600 hover:bg-green-700 text-white">
                      <span className="material-icons mr-2">family_restroom</span>
                      {t('viewAllMembers')}
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
            
            {/* Family Members Component */}
            <FamilyMembers />
          </div>
        </TabsContent>

        {/* Insurance Tab */}
        <TabsContent value="insurance" className="space-y-8">
          <div className="space-y-6">
            {/* Header with Quick Actions */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl text-blue-900">{t('insuranceManagement')}</CardTitle>
                    <p className="text-blue-700">{t('manageInsurancePolicies')}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      <Shield className="w-4 h-4 mr-2" />
                      {t('addPolicy')}
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
            
            {/* Insurance Management Component */}
            <InsuranceManagement />
          </div>
        </TabsContent>

        {/* Self Health Tab */}
        <TabsContent value="self" className="space-y-8">
          <SelfHealthDashboard />
        </TabsContent>

        {/* Appointments Tab */}
        <TabsContent value="appointments" className="space-y-8">
          <div className="space-y-6">
            {/* Header with Quick Actions */}
            <Card className="bg-gradient-to-r from-purple-50 to-violet-50 border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl text-purple-900">{t('appointmentsManagement')}</CardTitle>
                    <p className="text-purple-700">{t('scheduleManageTrack')}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                      <span className="material-icons mr-2">calendar_today</span>
                      {t('scheduleNew')}
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
            
            {/* Appointments Component */}
            <UpcomingAppointments />
          </div>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Health Metric Dialog */}
      <Dialog open={isMetricDialogOpen} onOpenChange={setIsMetricDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-blue-600" />
              <span>{selectedMetric ? t('editHealthMetric') : t('addHealthMetric')}</span>
            </DialogTitle>
            <DialogDescription>
              {selectedMetric ? t('updateHealthMetric') : t('addNewHealthMetric')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="metricName">{t('metricName')}</Label>
              <Input
                id="metricName"
                value={selectedMetric ? selectedMetric.name : newMetric.name}
                onChange={(e) => selectedMetric 
                  ? updateHealthMetric(selectedMetric.id, { name: e.target.value })
                  : setNewMetric({ ...newMetric, name: e.target.value })
                }
                placeholder={t('e.g., Blood Pressure, Blood Sugar')}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <Label htmlFor="metricValue">{t('value')}</Label>
                <Input
                  id="metricValue"
                  type="number"
                  value={selectedMetric ? selectedMetric.value : newMetric.value}
                  onChange={(e) => selectedMetric 
                    ? updateHealthMetric(selectedMetric.id, { value: parseFloat(e.target.value) })
                    : setNewMetric({ ...newMetric, value: parseFloat(e.target.value) })
                  }
                  placeholder="120"
                />
              </div>
              <div>
                <Label htmlFor="metricUnit">{t('unit')}</Label>
                <Input
                  id="metricUnit"
                  value={selectedMetric ? selectedMetric.unit : newMetric.unit}
                  onChange={(e) => selectedMetric 
                    ? updateHealthMetric(selectedMetric.id, { unit: e.target.value })
                    : setNewMetric({ ...newMetric, unit: e.target.value })
                  }
                  placeholder="mmHg"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="metricStatus">{t('status')}</Label>
              <Select
                value={selectedMetric ? selectedMetric.status : newMetric.status}
                onValueChange={(value) => selectedMetric 
                  ? updateHealthMetric(selectedMetric.id, { status: value as any })
                  : setNewMetric({ ...newMetric, status: value as any })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('selectStatus')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">{t('normal')}</SelectItem>
                  <SelectItem value="borderline">{t('borderline')}</SelectItem>
                  <SelectItem value="high">{t('high')}</SelectItem>
                  <SelectItem value="low">{t('low')}</SelectItem>
                  <SelectItem value="critical">{t('critical')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
              <Button variant="outline" onClick={() => setIsMetricDialogOpen(false)}>{t('cancel')}</Button>
                <Button
                onClick={selectedMetric ? () => setIsMetricDialogOpen(false) : addHealthMetric}
                className="bg-blue-600 hover:bg-blue-700"
                >
                {selectedMetric ? t('update') : t('add')} {t('metric')}
                </Button>
              </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Disease Analysis Dialog */}
      <Dialog open={isDiseaseDialogOpen} onOpenChange={(open) => {
        setIsDiseaseDialogOpen(open);
        if (!open) {
          setSelectedDisease(null);
        }
      }}>
        <DialogContent className="max-w-2xl w-[95vw] sm:w-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Stethoscope className="w-5 h-5 text-red-600" />
              <span>{t('diseaseAnalysis')}: {selectedDisease?.diseaseName}</span>
            </DialogTitle>
            <DialogDescription>
              {t('detailedAIAnalysis')}
            </DialogDescription>
          </DialogHeader>
          {selectedDisease && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">{t('riskLevel')}</Label>
                  <Badge className={`${getStatusColor(selectedDisease.riskLevel || 'low')} mt-1`}>
                    {(selectedDisease.riskLevel || 'low').toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">{t('probability')}</Label>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{selectedDisease.probability || 0}%</p>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">{t('aiInsights')}</Label>
                <p className="text-gray-600 mt-1">{selectedDisease.aiInsights || t('noAIInsightsAvailable')}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">{t('symptoms')}</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedDisease.symptoms && selectedDisease.symptoms.length > 0 ? (
                    selectedDisease.symptoms.map((symptom, index) => (
                      <Badge key={index} variant="outline">
                        {symptom || t('unknownSymptom')}
                      </Badge>
                    ))
                  ) : (
                    <Badge variant="outline">{t('noSymptomsRecorded')}</Badge>
                  )}
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">{t('recommendations')}</Label>
                <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
                  {selectedDisease.recommendations && selectedDisease.recommendations.length > 0 ? (
                    selectedDisease.recommendations.map((rec, index) => (
                      <li key={index}>{rec || t('noRecommendation')}</li>
                    ))
                  ) : (
                    <li>{t('noRecommendationsAvailable')}</li>
                  )}
                </ul>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">{t('medications')}</Label>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedDisease.medications && selectedDisease.medications.length > 0 ? (
                      selectedDisease.medications.map((med, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {med || t('noMedication')}
                        </Badge>
                      ))
                    ) : (
                      <Badge variant="outline" className="text-xs">{t('noMedications')}</Badge>
                    )}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">{t('lifestyleFactors')}</Label>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedDisease.lifestyleFactors && selectedDisease.lifestyleFactors.length > 0 ? (
                      selectedDisease.lifestyleFactors.map((factor, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {factor || t('noFactor')}
                        </Badge>
                      ))
                    ) : (
                      <Badge variant="outline" className="text-xs">{t('noLifestyleFactors')}</Badge>
                    )}
                  </div>
            </div>
          </div>
        </div>
      )}
        </DialogContent>
      </Dialog>

      {/* AI Analysis Dialog */}
      <Dialog open={isAnalysisDialogOpen} onOpenChange={setIsAnalysisDialogOpen}>
        <DialogContent className="max-w-md w-[95vw] sm:w-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Brain className="w-5 h-5 text-purple-600" />
              <span>{t('runAIAnalysis')}</span>
            </DialogTitle>
            <DialogDescription>
              {t('analyzeHealthData')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-purple-800">
                {t('aiAnalysisDescription')}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
              <Button variant="outline" onClick={() => setIsAnalysisDialogOpen(false)}>{t('cancel')}</Button>
              <Button 
                onClick={() => {
                  runAIAnalysis();
                  setIsAnalysisDialogOpen(false);
                }}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Brain className="w-4 h-4 mr-2" />
                {t('runAnalysis')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PatientDashboard;
