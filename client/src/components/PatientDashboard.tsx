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
import LiveDoseTracker from './LiveDoseTracker';
import MedicationSchedule from './MedicationSchedule';
import FamilyMembers from './FamilyMembers';
import RecentReports from './RecentReports';
import UpcomingAppointments from './UpcomingAppointments';
import AIMedicationsDashboard from './AIMedicationsDashboard';
import Prescriptions from './Prescriptions';
import { 
  Heart, 
  Activity, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Calendar, 
  User, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Brain, 
  Zap, 
  Target, 
  BarChart3, 
  RefreshCw,
  Stethoscope,
  Pill,
  Thermometer,
  Droplets,
  Scale,
  BrainCircuit,

  Users,
  FileText,
  CalendarDays
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
  symptoms: string[];
  aiInsights: string;
  recommendations: string[];
  lastAnalyzed: string;
  medications: string[];
  lifestyleFactors: string[];
}

interface HealthTrend {
  id: string;
  userId: string;
  month: string;
  bloodPressure: { systolic: number; diastolic: number; status: string };
  bloodSugar: { fasting: number; postMeal: number; status: string };
  cholesterol: { total: number; hdl: number; ldl: number; status: string };
  weight: { current: number; target: number; status: string };
}

const PatientDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([]);
  const [diseaseAnalysis, setDiseaseAnalysis] = useState<DiseaseAnalysis[]>([]);
  const [healthTrends, setHealthTrends] = useState<HealthTrend[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<HealthMetric | null>(null);
  const [selectedDisease, setSelectedDisease] = useState<DiseaseAnalysis | null>(null);
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
    if (currentUser?.uid) {
      loadDashboardData();
    }
  }, [currentUser]);

  const loadDashboardData = async () => {
    try {
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
      
      const [metricsData, analysisData, trendsData] = await Promise.all([
        api.healthMetrics.getHealthMetrics(),
        api.diseaseAnalysis.getDiseaseAnalysis(),
        api.healthTrends.getHealthTrends()
      ]);
      
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
              AI-Powered Health Dashboard
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Monitor your health metrics, analyze disease risks, and track trends with AI-powered insights
            </p>
          </div>
          
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-4">
              <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
              <p className="text-gray-600 text-lg">Loading your health data...</p>
              <p className="text-sm text-gray-500">Please wait while we fetch your latest health metrics</p>
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
              AI-Powered Health Dashboard
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Monitor your health metrics, analyze disease risks, and track trends with AI-powered insights
            </p>
          </div>
          
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-4">
              <AlertTriangle className="w-12 h-12 text-red-600 mx-auto" />
              <p className="text-gray-600 text-lg">Something went wrong</p>
              <p className="text-sm text-gray-500">{error}</p>
              <Button
                onClick={() => {
                  setError(null);
                  loadDashboardData();
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg border-0 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-blue-700 mb-1">Overall Health</p>
                <p className="text-2xl font-bold text-blue-900">85%</p>
                <p className="text-xs text-blue-600">Excellent</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 shadow-lg border-0 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-green-700 mb-1">Medication Adherence</p>
                <p className="text-2xl font-bold text-green-900">92%</p>
                <p className="text-xs text-green-600">On track</p>
            </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 shadow-lg border-0 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-white" />
            </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-orange-700 mb-1">Risk Factors</p>
                <p className="text-2xl font-bold text-orange-900">2</p>
                <p className="text-xs text-orange-600">Monitor closely</p>
            </div>
          </div>
        </CardContent>
      </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 shadow-lg border-0 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-purple-700 mb-1">AI Insights</p>
                <p className="text-2xl font-bold text-purple-900">5</p>
                <p className="text-xs text-purple-600">New today</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Content with Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-6 bg-white shadow-lg rounded-xl p-1">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <Activity className="w-4 h-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="medications" className="flex items-center space-x-2">
            <Pill className="w-4 h-4" />
            <span>Medications</span>
          </TabsTrigger>
          <TabsTrigger value="prescriptions" className="flex items-center space-x-2">
            <FileText className="w-4 h-4" />
            <span>Prescriptions</span>
          </TabsTrigger>
          <TabsTrigger value="family" className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>Family</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center space-x-2">
            <FileText className="w-4 h-4" />
            <span>Reports</span>
          </TabsTrigger>
          <TabsTrigger value="appointments" className="flex items-center space-x-2">
            <CalendarDays className="w-4 h-4" />
            <span>Appointments</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab - AI Health Analysis */}
        <TabsContent value="overview" className="space-y-8">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Left Column - AI Health Analysis & Health Trends */}
            <div className="xl:col-span-2 space-y-8">
              {/* AI Health Analysis Section */}
              <Card className="bg-white shadow-xl border-0 rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 px-8 py-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center shadow-md">
                        <Brain className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl text-gray-900 font-bold">AI Health Analysis</CardTitle>
                        <CardDescription className="text-gray-600 text-lg">Real-time health metrics with AI insights</CardDescription>
                      </div>
                    </div>
            <Button
                      onClick={loadDashboardData}
              variant="outline"
                      size="lg"
                      className="border-purple-300 text-purple-700 hover:bg-purple-50 rounded-xl"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh
            </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {healthMetrics && healthMetrics.length > 0 ? healthMetrics.map((metric) => (
                      <div key={metric.id} className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                              {getMetricIcon(metric.name)}
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900">{metric.name || 'Unknown Metric'}</h4>
                              <Badge className={`${getStatusColor(metric.status)} text-xs`}>
                                {metric.status ? metric.status.charAt(0).toUpperCase() + metric.status.slice(1) : 'Unknown'}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
            <Button
                              size="sm"
                              variant="ghost"
              onClick={() => {
                                setSelectedMetric(metric);
                                setIsMetricDialogOpen(true);
              }}
                              className="text-gray-600 hover:text-gray-900"
            >
                              <Edit className="w-4 h-4" />
            </Button>
            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteHealthMetric(metric.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
            </Button>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold text-gray-900">
                              {typeof metric.value === 'object' && metric.value.systolic && metric.value.diastolic 
                                ? `${metric.value.systolic}/${metric.value.diastolic} ${metric.unit || ''}`
                                : `${metric.value || 0} ${metric.unit || ''}`
                              }
                            </span>
                            {getTrendIcon(metric.trend)}
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Target Range</span>
                              <span className="font-semibold">
                                {metric.targetRange?.min || 0} - {metric.targetRange?.max || 100} {metric.unit || ''}
                              </span>
                            </div>
                            <Progress 
                              value={metric.targetRange ? ((typeof metric.value === 'object' && metric.value.systolic ? metric.value.systolic : metric.value) - metric.targetRange.min) / (metric.targetRange.max - metric.targetRange.min) * 100 : 0} 
                              className="h-2"
                            />
                          </div>
                          
                          {metric.aiAnalysis && (
                            <div className="bg-blue-50 rounded-lg p-3">
                              <p className="text-sm text-blue-800 font-medium">AI Insight:</p>
                              <p className="text-sm text-blue-700">{metric.aiAnalysis}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )) : (
                      <div className="col-span-2 text-center py-8">
                        <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No health metrics available</p>
                        <p className="text-sm text-gray-500 mb-4">Add your first health metric to get started</p>
                                       <p className="text-sm text-gray-500">Data will be loaded automatically</p>
                      </div>
                    )}
          </div>
        </CardContent>
      </Card>

              {/* Health Trends Section */}
              <Card className="bg-white shadow-xl border-0 rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 px-8 py-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-md">
                      <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl text-gray-900 font-bold">Health Trends (Last 6 Months)</CardTitle>
                      <CardDescription className="text-gray-600 text-lg">Track your health metrics over time</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  {healthTrends && healthTrends.length > 0 ? (
                    <div className="space-y-4">
                      {healthTrends.map((trend, index) => (
                        <div key={index} className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-bold text-gray-900">{trend.month || 'Unknown Month'}</h4>
                            <Badge variant="outline" className="text-xs">
                              Monthly Data
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Blood Pressure</span>
                                <span className="font-bold text-gray-900">
                                  {trend.bloodPressure && typeof trend.bloodPressure === 'object' && trend.bloodPressure.systolic && trend.bloodPressure.diastolic
                                    ? `${trend.bloodPressure.systolic}/${trend.bloodPressure.diastolic} mmHg`
                                    : 'N/A mmHg'
                                  }
                                </span>
                              </div>
                              <Progress 
                                value={trend.bloodPressure && typeof trend.bloodPressure === 'object' && trend.bloodPressure.systolic 
                                  ? Math.min((trend.bloodPressure.systolic / 200) * 100, 100) 
                                  : 0} 
                                className="h-2"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Blood Sugar</span>
                                <span className="font-bold text-gray-900">
                                  {trend.bloodSugar && typeof trend.bloodSugar === 'object' && trend.bloodSugar.fasting
                                    ? `${trend.bloodSugar.fasting} mg/dL`
                                    : 'N/A mg/dL'
                                  }
                                </span>
                              </div>
                              <Progress 
                                value={trend.bloodSugar && typeof trend.bloodSugar === 'object' && trend.bloodSugar.fasting 
                                  ? Math.min((trend.bloodSugar.fasting / 200) * 100, 100) 
                                  : 0} 
                                className="h-2"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Cholesterol</span>
                                <span className="font-bold text-gray-900">
                                  {trend.cholesterol && typeof trend.cholesterol === 'object' && trend.cholesterol.total
                                    ? `${trend.cholesterol.total} mg/dL`
                                    : 'N/A mg/dL'
                                  }
                                </span>
                              </div>
                              <Progress 
                                value={trend.cholesterol && typeof trend.cholesterol === 'object' && trend.cholesterol.total 
                                  ? Math.min((trend.cholesterol.total / 300) * 100, 100) 
                                  : 0} 
                                className="h-2"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Weight</span>
                                <span className="font-bold text-gray-900">
                                  {trend.weight && typeof trend.weight === 'object' && trend.weight.current
                                    ? `${trend.weight.current} kg`
                                    : 'N/A kg'
                                  }
                                </span>
                              </div>
                              <Progress 
                                value={trend.weight && typeof trend.weight === 'object' && trend.weight.current 
                                  ? Math.min((trend.weight.current / 100) * 100, 100) 
                                  : 0} 
                                className="h-2"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
             </div>
                  ) : (
                    <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No health trends data available</p>
                        <p className="text-sm text-gray-500 mb-4">Add health metrics to see trends over time</p>
                                       <p className="text-sm text-gray-500">Data will be loaded automatically</p>
             </div>
           </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Disease Analysis */}
            <div className="space-y-8">
              <Card className="bg-white shadow-xl border-0 rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 px-8 py-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center shadow-md">
                        <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <div>
                        <CardTitle className="text-2xl text-gray-900 font-bold">Disease Risk Analysis</CardTitle>
                        <CardDescription className="text-gray-600 text-lg">AI-powered risk assessment</CardDescription>
            </div>
          </div>
                  <Button
                      onClick={() => setIsAnalysisDialogOpen(true)}
                      size="lg"
                      className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-4 py-2 rounded-xl"
                    >
                      <BrainCircuit className="w-4 h-4 mr-2" />
                      Analyze
                  </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {diseaseAnalysis && diseaseAnalysis.length > 0 ? diseaseAnalysis.map((disease) => (
                      <div key={disease.id} className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all duration-300">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <Badge className={`${getRiskColor(disease.riskLevel || 'low')} text-xs`}>
                              {disease.riskLevel ? disease.riskLevel.toUpperCase() : 'UNKNOWN'}
                            </Badge>
                            <h4 className="font-bold text-gray-900">{disease.diseaseName || 'Unknown Disease'}</h4>
                          </div>
                  <Button
                            size="sm"
                            variant="ghost"
                    onClick={() => {
                              setSelectedDisease(disease);
                              setIsDiseaseDialogOpen(true);
                    }}
                            className="text-gray-600 hover:text-gray-900"
                  >
                            <Eye className="w-4 h-4" />
                  </Button>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Risk Probability</span>
                            <span className="font-bold text-gray-900">{disease.probability}%</span>
                          </div>
                          <Progress value={disease.probability} className="h-2" />
                          
                          <div className="text-sm text-gray-600">
                            <p className="font-medium mb-1">Key Symptoms:</p>
                            <div className="flex flex-wrap gap-1">
                              {disease.symptoms && disease.symptoms.length > 0 ? (
                                <>
                                  {disease.symptoms.slice(0, 3).map((symptom, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {symptom || 'Unknown Symptom'}
                                    </Badge>
                                  ))}
                                  {disease.symptoms.length > 3 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{disease.symptoms.length - 3} more
                                    </Badge>
                                  )}
                                </>
                              ) : (
                                <Badge variant="outline" className="text-xs">
                                  No symptoms recorded
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-8">
                        <Stethoscope className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No disease analysis available</p>
                        <p className="text-sm text-gray-500 mb-4">Run AI analysis to get disease risk insights</p>
                        <p className="text-sm text-gray-500">Data will be loaded automatically</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Medications Tab */}
        <TabsContent value="medications" className="space-y-8">
          <AIMedicationsDashboard />
        </TabsContent>

        {/* Prescriptions Tab */}
        <TabsContent value="prescriptions" className="space-y-8">
          <Prescriptions />
        </TabsContent>

        {/* Family Tab */}
        <TabsContent value="family" className="space-y-8">
          <FamilyMembers />
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-8">
          <RecentReports />
        </TabsContent>

        {/* Appointments Tab */}
        <TabsContent value="appointments" className="space-y-8">
          <UpcomingAppointments />
        </TabsContent>
      </Tabs>

      {/* Add/Edit Health Metric Dialog */}
      <Dialog open={isMetricDialogOpen} onOpenChange={setIsMetricDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-blue-600" />
              <span>{selectedMetric ? 'Edit Health Metric' : 'Add Health Metric'}</span>
            </DialogTitle>
            <DialogDescription>
              {selectedMetric ? 'Update your health metric' : 'Add a new health metric to track'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="metricName">Metric Name</Label>
              <Input
                id="metricName"
                value={selectedMetric ? selectedMetric.name : newMetric.name}
                onChange={(e) => selectedMetric 
                  ? updateHealthMetric(selectedMetric.id, { name: e.target.value })
                  : setNewMetric({ ...newMetric, name: e.target.value })
                }
                placeholder="e.g., Blood Pressure, Blood Sugar"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="metricValue">Value</Label>
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
                <Label htmlFor="metricUnit">Unit</Label>
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
              <Label htmlFor="metricStatus">Status</Label>
              <Select
                value={selectedMetric ? selectedMetric.status : newMetric.status}
                onValueChange={(value) => selectedMetric 
                  ? updateHealthMetric(selectedMetric.id, { status: value as any })
                  : setNewMetric({ ...newMetric, status: value as any })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="borderline">Borderline</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setIsMetricDialogOpen(false)}>
                Cancel
              </Button>
                <Button
                onClick={selectedMetric ? () => setIsMetricDialogOpen(false) : addHealthMetric}
                className="bg-blue-600 hover:bg-blue-700"
                >
                {selectedMetric ? 'Update' : 'Add'} Metric
                </Button>
              </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Disease Analysis Dialog */}
      <Dialog open={isDiseaseDialogOpen} onOpenChange={setIsDiseaseDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Stethoscope className="w-5 h-5 text-red-600" />
              <span>Disease Analysis: {selectedDisease?.diseaseName}</span>
            </DialogTitle>
            <DialogDescription>
              Detailed AI analysis and recommendations
            </DialogDescription>
          </DialogHeader>
          {selectedDisease && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Risk Level</Label>
                  <Badge className={`${getRiskColor(selectedDisease.riskLevel || 'low')} mt-1`}>
                    {(selectedDisease.riskLevel || 'low').toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Probability</Label>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{selectedDisease.probability || 0}%</p>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">AI Insights</Label>
                <p className="text-gray-600 mt-1">{selectedDisease.aiInsights || 'No AI insights available'}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">Symptoms</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedDisease.symptoms && selectedDisease.symptoms.length > 0 ? (
                    selectedDisease.symptoms.map((symptom, index) => (
                      <Badge key={index} variant="outline">
                        {symptom || 'Unknown Symptom'}
                      </Badge>
                    ))
                  ) : (
                    <Badge variant="outline">No symptoms recorded</Badge>
                  )}
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">Recommendations</Label>
                <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
                  {selectedDisease.recommendations && selectedDisease.recommendations.length > 0 ? (
                    selectedDisease.recommendations.map((rec, index) => (
                      <li key={index}>{rec || 'No recommendation'}</li>
                    ))
                  ) : (
                    <li>No recommendations available</li>
                  )}
                </ul>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Medications</Label>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedDisease.medications && selectedDisease.medications.length > 0 ? (
                      selectedDisease.medications.map((med, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {med || 'No medication'}
                        </Badge>
                      ))
                    ) : (
                      <Badge variant="outline" className="text-xs">No medications</Badge>
                    )}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Lifestyle Factors</Label>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedDisease.lifestyleFactors && selectedDisease.lifestyleFactors.length > 0 ? (
                      selectedDisease.lifestyleFactors.map((factor, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {factor || 'No factor'}
                        </Badge>
                      ))
                    ) : (
                      <Badge variant="outline" className="text-xs">No lifestyle factors</Badge>
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Brain className="w-5 h-5 text-purple-600" />
              <span>Run AI Analysis</span>
            </DialogTitle>
            <DialogDescription>
              Analyze your health data for disease risk assessment
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-purple-800">
                This will analyze your health metrics and provide AI-powered insights about potential disease risks.
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setIsAnalysisDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  runAIAnalysis();
                  setIsAnalysisDialogOpen(false);
                }}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Brain className="w-4 h-4 mr-2" />
                Run Analysis
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PatientDashboard;
