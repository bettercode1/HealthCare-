import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Activity, 
  Heart, 
  Thermometer, 
  Droplets, 
  Scale, 
  Zap, 
  Target, 
  BarChart3, 
  RefreshCw,
  Stethoscope,
  User,
  Clock,
  Bell,
  Lightbulb,
  Shield,
  TrendingDown,
  Minus,
  Plus
} from 'lucide-react';

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

interface HealthReport {
  id: string;
  userId: string;
  title: string;
  reportType: string;
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
  createdAt: string;
}

interface AIInsight {
  id: string;
  type: 'health_trend' | 'risk_alert' | 'recommendation' | 'medication_reminder' | 'lifestyle_suggestion';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  confidence: number;
  actionable: boolean;
  actionUrl?: string;
  relatedMetrics?: string[];
  relatedReports?: string[];
  createdAt: string;
  expiresAt?: string;
}

interface HealthTrend {
  metricName: string;
  currentValue: number;
  previousValue: number;
  change: number;
  changePercent: number;
  trend: 'improving' | 'declining' | 'stable';
  significance: 'minimal' | 'moderate' | 'significant';
  recommendation: string;
}

const SelfAIAnalysis: React.FC = () => {
  const { t } = useTranslation();
  const { userData } = useAuth();
  const { toast } = useToast();
  
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([]);
  const [healthReports, setHealthReports] = useState<HealthReport[]>([]);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [healthTrends, setHealthTrends] = useState<HealthTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInsight, setSelectedInsight] = useState<AIInsight | null>(null);
  const [analysisMode, setAnalysisMode] = useState<'overview' | 'trends' | 'risks' | 'recommendations'>('overview');

  // Load health data and generate AI insights
  const loadHealthData = useCallback(async () => {
    if (!userData?.id) return;
    
    try {
      setLoading(true);
      
      // Load from localStorage
      const storedMetrics = JSON.parse(localStorage.getItem('mock_health_metrics') || '[]');
      const storedReports = JSON.parse(localStorage.getItem('mock_reports') || '[]');
      
      // Filter for current user
      const userMetrics = storedMetrics.filter((m: any) => m.userId === userData.id);
      const userReports = storedReports.filter((r: any) => r.userId === userData.id);
      
      setHealthMetrics(userMetrics);
      setHealthReports(userReports);
      
      // Generate AI insights and trends
      generateAIInsights(userMetrics, userReports);
      generateHealthTrends(userMetrics);
      
    } catch (error) {
      console.error('Error loading health data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load health data for AI analysis',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [userData, toast]);

  // Generate AI insights from health data
  const generateAIInsights = useCallback((metrics: HealthMetric[], reports: HealthReport[]) => {
    const insights: AIInsight[] = [];
    
    // Analyze critical health metrics
    const criticalMetrics = metrics.filter(m => m.status === 'critical');
    if (criticalMetrics.length > 0) {
      insights.push({
        id: 'critical_metrics_alert',
        type: 'risk_alert',
        title: 'Critical Health Metrics Detected',
        description: `${criticalMetrics.length} health metrics are in critical range and require immediate attention.`,
        severity: 'critical',
        category: 'health_monitoring',
        confidence: 95,
        actionable: true,
        actionUrl: '/metrics',
        relatedMetrics: criticalMetrics.map(m => m.id),
        createdAt: new Date().toISOString()
      });
    }
    
    // Analyze abnormal trends
    const decliningMetrics = metrics.filter(m => m.trend === 'down' && m.status !== 'normal');
    if (decliningMetrics.length > 0) {
      insights.push({
        id: 'declining_health_trends',
        type: 'health_trend',
        title: 'Declining Health Trends',
        description: `${decliningMetrics.length} health metrics are showing declining trends. Consider lifestyle changes or medical consultation.`,
        severity: 'high',
        category: 'trend_analysis',
        confidence: 85,
        actionable: true,
        actionUrl: '/trends',
        relatedMetrics: decliningMetrics.map(m => m.id),
        createdAt: new Date().toISOString()
      });
    }
    
    // Analyze lab reports for critical findings
    reports.forEach(report => {
      if (report.analysis?.summary.criticalCount > 0) {
        insights.push({
          id: `report_critical_${report.id}`,
          type: 'risk_alert',
          title: `Critical Lab Results - ${report.title}`,
          description: `Your ${report.reportType} report shows ${report.analysis.summary.criticalCount} critical values requiring immediate medical attention.`,
          severity: 'critical',
          category: 'lab_results',
          confidence: 90,
          actionable: true,
          actionUrl: `/reports/${report.id}`,
          relatedReports: [report.id],
          createdAt: new Date().toISOString()
        });
      }
    });
    
    // Lifestyle recommendations based on health data
    const highRiskMetrics = metrics.filter(m => m.status === 'high' || m.status === 'borderline');
    if (highRiskMetrics.length > 0) {
      insights.push({
        id: 'lifestyle_recommendations',
        type: 'lifestyle_suggestion',
        title: 'Lifestyle Optimization Recommendations',
        description: `Based on ${highRiskMetrics.length} borderline/high metrics, consider dietary changes, exercise, and stress management.`,
        severity: 'medium',
        category: 'lifestyle',
        confidence: 75,
        actionable: true,
        actionUrl: '/recommendations',
        relatedMetrics: highRiskMetrics.map(m => m.id),
        createdAt: new Date().toISOString()
      });
    }
    
    // Medication adherence insights
    const medicationMetrics = metrics.filter(m => m.name.toLowerCase().includes('medication') || m.name.toLowerCase().includes('adherence'));
    if (medicationMetrics.length > 0) {
      const lowAdherence = medicationMetrics.filter(m => m.value < 80);
      if (lowAdherence.length > 0) {
        insights.push({
          id: 'medication_adherence_alert',
          type: 'medication_reminder',
          title: 'Medication Adherence Alert',
          description: 'Your medication adherence is below optimal levels. Consider setting up reminders or discussing with your healthcare provider.',
          severity: 'medium',
          category: 'medications',
          confidence: 80,
          actionable: true,
          actionUrl: '/medications',
          relatedMetrics: lowAdherence.map(m => m.id),
          createdAt: new Date().toISOString()
        });
      }
    }
    
    setAiInsights(insights);
  }, []);

  // Generate health trends analysis
  const generateHealthTrends = useCallback((metrics: HealthMetric[]) => {
    const trends: HealthTrend[] = [];
    
    // Group metrics by name to analyze trends
    const metricGroups = metrics.reduce((groups, metric) => {
      if (!groups[metric.name]) {
        groups[metric.name] = [];
      }
      groups[metric.name].push(metric);
      return groups;
    }, {} as Record<string, HealthMetric[]>);
    
    Object.entries(metricGroups).forEach(([metricName, metricList]) => {
      if (metricList.length >= 2) {
        // Sort by date to get current and previous values
        const sortedMetrics = metricList.sort((a, b) => 
          new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
        );
        
        const current = sortedMetrics[0];
        const previous = sortedMetrics[1];
        
        if (current && previous) {
          const change = current.value - previous.value;
          const changePercent = (change / previous.value) * 100;
          
          let trend: 'improving' | 'declining' | 'stable' = 'stable';
          let significance: 'minimal' | 'moderate' | 'significant' = 'minimal';
          
          if (Math.abs(changePercent) > 20) {
            significance = 'significant';
          } else if (Math.abs(changePercent) > 10) {
            significance = 'moderate';
          }
          
          if (changePercent > 5) {
            trend = 'improving';
          } else if (changePercent < -5) {
            trend = 'declining';
          }
          
          let recommendation = 'Continue monitoring this metric.';
          if (trend === 'declining' && current.status !== 'normal') {
            recommendation = 'Consider lifestyle changes or consult healthcare provider.';
          } else if (trend === 'improving') {
            recommendation = 'Good progress! Maintain current healthy habits.';
          }
          
          trends.push({
            metricName,
            currentValue: current.value,
            previousValue: previous.value,
            change,
            changePercent,
            trend,
            significance,
            recommendation
          });
        }
      }
    });
    
    setHealthTrends(trends);
  }, []);

  // Get metric icon based on name
  const getMetricIcon = (metricName: string) => {
    const name = metricName.toLowerCase();
    if (name.includes('heart') || name.includes('pulse')) return <Heart className="w-5 h-5 text-red-500" />;
    if (name.includes('temperature') || name.includes('temp')) return <Thermometer className="w-5 h-5 text-orange-500" />;
    if (name.includes('blood') || name.includes('pressure')) return <Droplets className="w-5 h-5 text-red-500" />;
    if (name.includes('weight') || name.includes('bmi')) return <Scale className="w-5 h-5 text-blue-500" />;
    if (name.includes('activity') || name.includes('steps')) return <Activity className="w-5 h-5 text-green-500" />;
    return <Activity className="w-5 h-5 text-gray-500" />;
  };

  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Get trend icon
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadHealthData();
  }, [loadHealthData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Analyzing your health data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-0 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl text-purple-900">AI Health Analysis</CardTitle>
              <p className="text-purple-700">Intelligent insights and recommendations based on your health data</p>
            </div>
            <Button
              variant="outline"
              onClick={loadHealthData}
              className="border-purple-300 text-purple-700 hover:bg-purple-50"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Analysis
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Analysis Mode Tabs */}
      <div className="flex space-x-2">
        {(['overview', 'trends', 'risks', 'recommendations'] as const).map((mode) => (
          <Button
            key={mode}
            variant={analysisMode === mode ? 'default' : 'outline'}
            onClick={() => setAnalysisMode(mode)}
            className="capitalize"
          >
            {mode === 'overview' && <Brain className="w-4 h-4 mr-2" />}
            {mode === 'trends' && <TrendingUp className="w-4 h-4 mr-2" />}
            {mode === 'risks' && <AlertTriangle className="w-4 h-4 mr-2" />}
            {mode === 'recommendations' && <Lightbulb className="w-4 h-4 mr-2" />}
            {mode}
          </Button>
        ))}
      </div>

      {/* Overview Mode */}
      {analysisMode === 'overview' && (
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-0">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-blue-700">Total Metrics</p>
                    <p className="text-2xl font-bold text-blue-900">{healthMetrics.length}</p>
                    <p className="text-xs text-blue-600">Tracked values</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-0">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-green-700">Normal Range</p>
                    <p className="text-2xl font-bold text-green-900">
                      {healthMetrics.filter(m => m.status === 'normal').length}
                    </p>
                    <p className="text-xs text-green-600">Healthy metrics</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-0">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-orange-700">Alerts</p>
                    <p className="text-2xl font-bold text-orange-900">
                      {aiInsights.filter(i => i.severity === 'critical' || i.severity === 'high').length}
                    </p>
                    <p className="text-xs text-orange-600">Require attention</p>
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
                    <p className="text-xs text-purple-600">Generated</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Critical Alerts */}
          {aiInsights.filter(i => i.severity === 'critical').length > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-red-800">
                  <AlertTriangle className="w-5 h-5" />
                  <span>Critical Health Alerts</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {aiInsights
                    .filter(i => i.severity === 'critical')
                    .map((insight) => (
                      <div key={insight.id} className="p-4 bg-red-100 border border-red-200 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-red-800">{insight.title}</h3>
                            <p className="text-sm text-red-700 mt-1">{insight.description}</p>
                            <div className="flex items-center space-x-2 mt-2">
                              <Badge variant="destructive">{insight.category}</Badge>
                              <Badge variant="outline" className="text-red-700">
                                {insight.confidence}% confidence
                              </Badge>
                            </div>
                          </div>
                          {insight.actionable && (
                            <Button variant="destructive" size="sm">
                              Take Action
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Health Trends */}
          {healthTrends.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>Recent Health Trends</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {healthTrends.slice(0, 5).map((trend, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{trend.metricName}</h3>
                        <Badge variant={
                          trend.trend === 'improving' ? 'default' :
                          trend.trend === 'declining' ? 'destructive' :
                          'secondary'
                        }>
                          {trend.trend}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Current:</span>
                          <p className="font-medium">{trend.currentValue}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Previous:</span>
                          <p>{trend.previousValue}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Change:</span>
                          <p className={`font-medium ${trend.changePercent > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {trend.changePercent > 0 ? '+' : ''}{trend.changePercent.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">{trend.recommendation}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Trends Mode */}
      {analysisMode === 'trends' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Health Trends Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {healthTrends.length > 0 ? (
              <div className="space-y-4">
                {healthTrends.map((trend, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        {getMetricIcon(trend.metricName)}
                        <h3 className="font-semibold">{trend.metricName}</h3>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={
                          trend.trend === 'improving' ? 'default' :
                          trend.trend === 'declining' ? 'destructive' :
                          'secondary'
                        }>
                          {trend.trend}
                        </Badge>
                        <Badge variant="outline">
                          {trend.significance}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                      <div>
                        <p className="text-sm text-gray-600">Current Value</p>
                        <p className="text-lg font-bold">{trend.currentValue}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Previous Value</p>
                        <p className="text-lg">{trend.previousValue}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Change</p>
                        <p className={`text-lg font-bold ${trend.changePercent > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {trend.changePercent > 0 ? '+' : ''}{trend.changePercent.toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Trend</p>
                        <div className="flex items-center space-x-1">
                          {getTrendIcon(trend.trend)}
                          <span className="text-sm">{trend.trend}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <span className="font-semibold">AI Recommendation:</span> {trend.recommendation}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No trend data available yet</p>
                <p className="text-sm text-gray-500">Continue tracking your health metrics to see trends</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Risks Mode */}
      {analysisMode === 'risks' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span>Health Risk Assessment</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {aiInsights.filter(i => i.severity === 'critical' || i.severity === 'high').length > 0 ? (
              <div className="space-y-4">
                {aiInsights
                  .filter(i => i.severity === 'critical' || i.severity === 'high')
                  .map((insight) => (
                    <motion.div
                      key={insight.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`p-4 border rounded-lg ${
                        insight.severity === 'critical' ? 'bg-red-50 border-red-200' :
                        'bg-orange-50 border-orange-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold">{insight.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge variant={insight.severity === 'critical' ? 'destructive' : 'default'}>
                              {insight.severity}
                            </Badge>
                            <Badge variant="outline">{insight.category}</Badge>
                            <Badge variant="outline">
                              {insight.confidence}% confidence
                            </Badge>
                          </div>
                        </div>
                        {insight.actionable && (
                          <Button variant={insight.severity === 'critical' ? 'destructive' : 'default'} size="sm">
                            Take Action
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Shield className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <p className="text-green-600">No high-risk alerts detected</p>
                <p className="text-sm text-green-500">Your health metrics are within safe ranges</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recommendations Mode */}
      {analysisMode === 'recommendations' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Lightbulb className="w-5 h-5 text-yellow-600" />
              <span>AI Health Recommendations</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {aiInsights.filter(i => i.type === 'recommendation' || i.type === 'lifestyle_suggestion').length > 0 ? (
              <div className="space-y-4">
                {aiInsights
                  .filter(i => i.type === 'recommendation' || i.type === 'lifestyle_suggestion')
                  .map((insight) => (
                    <motion.div
                      key={insight.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold">{insight.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge variant="outline">{insight.category}</Badge>
                            <Badge variant="outline">
                              {insight.confidence}% confidence
                            </Badge>
                          </div>
                        </div>
                        {insight.actionable && (
                          <Button variant="outline" size="sm">
                            Learn More
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Lightbulb className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No specific recommendations available</p>
                <p className="text-sm text-gray-500">Continue monitoring your health for personalized suggestions</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SelfAIAnalysis;
