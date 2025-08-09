import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, FileText, Calendar, Download, Plus, Search, Activity, Target, Zap, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Report {
  id: string;
  title: string;
  reportType: string;
  uploadedAt: string;
  validTill?: string;
  fileUrl: string;
  analysis?: ReportAnalysis;
  userId: string;
  source?: 'uploaded' | 'web' | 'demo';
  labName?: string;
  doctorName?: string;
}

interface ReportAnalysis {
  parameters: {
    [key: string]: {
      value: number;
      unit: string;
      normalRange: string;
      status: 'normal' | 'high' | 'low' | 'critical';
      trend?: 'increasing' | 'decreasing' | 'stable';
      previousValue?: number;
      change?: number;
      significance?: 'significant' | 'moderate' | 'minimal';
    };
  };
  summary: {
    normalCount: number;
    abnormalCount: number;
    criticalCount: number;
    overallStatus: 'healthy' | 'attention' | 'critical';
    riskLevel: 'low' | 'medium' | 'high';
    recommendations: string[];
  };
  metadata?: {
    labName: string;
    doctorName: string;
    testDate: string;
    reportNumber: string;
  };
}

const ReportAnalytics: React.FC = () => {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [isWebReportDialogOpen, setIsWebReportDialogOpen] = useState(false);
  const [webReportData, setWebReportData] = useState({
    title: '',
    reportType: 'bloodTest',
    labName: '',
    doctorName: '',
    reportNumber: '',
    testDate: '',
    parameters: ''
  });

  useEffect(() => {
    if (currentUser?.uid) {
      loadReports();
    }
  }, [currentUser]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const data = await api.reports.getReports();
      setReports(data);
    } catch (error) {
      console.error('Error loading reports:', error);
      toast({
        title: t('error'),
        description: t('failedToLoadReports'),
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'bg-green-100 text-green-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'normal': return <CheckCircle className="w-4 h-4" />;
      case 'high': return <TrendingUp className="w-4 h-4" />;
      case 'low': return <TrendingDown className="w-4 h-4" />;
      case 'critical': return <AlertTriangle className="w-4 h-4" />;
      default: return <Minus className="w-4 h-4" />;
    }
  };

  const getOverallStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800';
      case 'attention': return 'bg-yellow-100 text-yellow-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const generateChartData = (analysis: ReportAnalysis) => {
    return Object.entries(analysis.parameters).map(([name, param]) => ({
      name,
      value: param.value,
      status: param.status,
      normalRange: param.normalRange
    }));
  };

  const generateTrendData = (reports: Report[]) => {
    return reports
      .filter(report => report.analysis)
      .map(report => ({
        date: new Date(report.uploadedAt).toLocaleDateString(),
        normalCount: report.analysis!.summary.normalCount,
        abnormalCount: report.analysis!.summary.abnormalCount,
        criticalCount: report.analysis!.summary.criticalCount
      }));
  };

  const parseWebReportParameters = (parametersText: string) => {
    const parameters: any = {};
    const lines = parametersText.split('\n').filter(line => line.trim());
    
    lines.forEach(line => {
      const [name, value, unit, normalRange] = line.split(',').map(s => s.trim());
      if (name && value && unit && normalRange) {
        const numValue = parseFloat(value);
        const [min, max] = normalRange.split('-').map(s => parseFloat(s.trim()));
        
        let status: 'normal' | 'high' | 'low' | 'critical' = 'normal';
        if (numValue > max) {
          status = numValue > max * 1.5 ? 'critical' : 'high';
        } else if (numValue < min) {
          status = numValue < min * 0.5 ? 'critical' : 'low';
        }
        
        parameters[name] = {
          value: numValue,
          unit,
          normalRange,
          status
        };
      }
    });
    
    return parameters;
  };

  const generateAnalysisFromParameters = (parameters: any) => {
    const normalCount = Object.values(parameters).filter((p: any) => p.status === 'normal').length;
    const abnormalCount = Object.values(parameters).filter((p: any) => p.status === 'high' || p.status === 'low').length;
    const criticalCount = Object.values(parameters).filter((p: any) => p.status === 'critical').length;
    
    let overallStatus: 'healthy' | 'attention' | 'critical' = 'healthy';
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    
    if (criticalCount > 0) {
      overallStatus = 'critical';
      riskLevel = 'high';
    } else if (abnormalCount > 2) {
      overallStatus = 'attention';
      riskLevel = 'medium';
    }
    
    const recommendations = [];
    if (criticalCount > 0) {
      recommendations.push('Immediate medical attention required');
    }
    if (abnormalCount > 0) {
      recommendations.push('Follow up with healthcare provider');
    }
    if (normalCount > 0) {
      recommendations.push('Continue monitoring');
    }
    
    return {
      parameters,
      summary: {
        normalCount,
        abnormalCount,
        criticalCount,
        overallStatus,
        riskLevel,
        recommendations
      },
      metadata: {
        labName: webReportData.labName,
        doctorName: webReportData.doctorName,
        testDate: webReportData.testDate,
        reportNumber: webReportData.reportNumber
      }
    };
  };

  const handleAddWebReport = async () => {
    try {
      setLoading(true);
      
      const parameters = parseWebReportParameters(webReportData.parameters);
      const analysis = generateAnalysisFromParameters(parameters);
      
      const reportData = {
        title: webReportData.title,
        reportType: webReportData.reportType,
        labName: webReportData.labName,
        doctorName: webReportData.doctorName,
        reportNumber: webReportData.reportNumber,
        testDate: webReportData.testDate,
        fileUrl: '', // Web reports don't have file URLs
        analysis,
        source: 'web' as const
      };
      
      const newReport = await api.reports.createReport(reportData);
      setReports(prev => [newReport, ...prev]);
      
      setIsWebReportDialogOpen(false);
      setWebReportData({
        title: '',
        reportType: 'bloodTest',
        labName: '',
        doctorName: '',
        reportNumber: '',
        testDate: '',
        parameters: ''
      });
      
      toast({
        title: t('success'),
        description: t('reportAddedSuccessfully'),
      });
    } catch (error) {
      console.error('Error adding web report:', error);
      toast({
        title: t('error'),
        description: t('failedToAddReport'),
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteReport = async (reportId: string) => {
    try {
      await api.reports.deleteReport(reportId);
      setReports(prev => prev.filter(report => report.id !== reportId));
      
      toast({
        title: t('success'),
        description: t('reportDeletedSuccessfully'),
      });
    } catch (error) {
      console.error('Error deleting report:', error);
      toast({
        title: t('error'),
        description: t('failedToDeleteReport'),
        variant: 'destructive'
      });
    }
  };

  const filteredReports = reports.filter(report => {
    if (filterType === 'all') return true;
    if (filterType === 'normal') return report.analysis?.summary.overallStatus === 'healthy';
    if (filterType === 'abnormal') return report.analysis?.summary.overallStatus === 'attention';
    if (filterType === 'critical') return report.analysis?.summary.overallStatus === 'critical';
    return true;
  });

  const totalReports = reports.length;
  const normalReports = reports.filter(r => r.analysis?.summary.overallStatus === 'healthy').length;
  const abnormalReports = reports.filter(r => r.analysis?.summary.overallStatus === 'attention').length;
  const criticalReports = reports.filter(r => r.analysis?.summary.overallStatus === 'critical').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t('reportAnalytics')}</h2>
          <p className="text-gray-600">{t('analyzeHealthReports')}</p>
        </div>
        <div className="flex space-x-2">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allReports')}</SelectItem>
              <SelectItem value="normal">{t('normalValues')}</SelectItem>
              <SelectItem value="abnormal">{t('abnormalValues')}</SelectItem>
              <SelectItem value="critical">{t('criticalValues')}</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={isWebReportDialogOpen} onOpenChange={setIsWebReportDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                {t('addWebReport')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{t('addWebReport')}</DialogTitle>
                <DialogDescription>
                  {t('addWebReportDescription')}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">{t('reportTitle')}</Label>
                    <Input
                      id="title"
                      value={webReportData.title}
                      onChange={(e) => setWebReportData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder={t('enterReportTitle')}
                    />
                  </div>
                  <div>
                    <Label htmlFor="reportType">{t('reportType')}</Label>
                    <Select value={webReportData.reportType} onValueChange={(value) => setWebReportData(prev => ({ ...prev, reportType: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bloodTest">{t('bloodTest')}</SelectItem>
                        <SelectItem value="urineTest">{t('urineTest')}</SelectItem>
                        <SelectItem value="imaging">{t('imaging')}</SelectItem>
                        <SelectItem value="other">{t('other')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="labName">{t('labName')}</Label>
                    <Input
                      id="labName"
                      value={webReportData.labName}
                      onChange={(e) => setWebReportData(prev => ({ ...prev, labName: e.target.value }))}
                      placeholder={t('enterLabName')}
                    />
                  </div>
                  <div>
                    <Label htmlFor="doctorName">{t('doctorName')}</Label>
                    <Input
                      id="doctorName"
                      value={webReportData.doctorName}
                      onChange={(e) => setWebReportData(prev => ({ ...prev, doctorName: e.target.value }))}
                      placeholder={t('enterDoctorName')}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="reportNumber">{t('reportNumber')}</Label>
                    <Input
                      id="reportNumber"
                      value={webReportData.reportNumber}
                      onChange={(e) => setWebReportData(prev => ({ ...prev, reportNumber: e.target.value }))}
                      placeholder={t('enterReportNumber')}
                    />
                  </div>
                  <div>
                    <Label htmlFor="testDate">{t('testDate')}</Label>
                    <Input
                      id="testDate"
                      type="date"
                      value={webReportData.testDate}
                      onChange={(e) => setWebReportData(prev => ({ ...prev, testDate: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="parameters">{t('parameters')}</Label>
                  <Textarea
                    id="parameters"
                    value={webReportData.parameters}
                    onChange={(e) => setWebReportData(prev => ({ ...prev, parameters: e.target.value }))}
                    placeholder={t('parametersPlaceholder')}
                    rows={6}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {t('parametersFormat')}
                  </p>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsWebReportDialogOpen(false)}>
                    {t('cancel')}
                  </Button>
                  <Button onClick={handleAddWebReport} disabled={loading}>
                    {loading ? t('adding') : t('addReport')}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-100 rounded-full">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">{t('totalReports')}</p>
                <p className="text-2xl font-bold text-blue-600">{totalReports}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-green-100 rounded-full">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">{t('normalValues')}</p>
                <p className="text-2xl font-bold text-green-600">{normalReports}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-orange-100 rounded-full">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">{t('abnormalValues')}</p>
                <p className="text-2xl font-bold text-orange-600">{abnormalReports}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">{t('criticalValues')}</p>
                <p className="text-2xl font-bold text-red-600">{criticalReports}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5" />
            <span>{t('recentReports')}</span>
          </CardTitle>
          <CardDescription>{t('selectReportForAnalysis')}</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredReports.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('noReportsAvailableForAnalysis')}
              </h3>
              <p className="text-gray-600 mb-4">
                {t('addReportsToStartAnalysis')}
              </p>
              <Button onClick={() => setIsWebReportDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                {t('addReport')}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{report.title}</h4>
                      <p className="text-sm text-gray-600">
                        {report.labName} • {new Date(report.uploadedAt).toLocaleDateString()}
                      </p>
                      {report.analysis && (
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className={getOverallStatusColor(report.analysis.summary.overallStatus)}>
                            {t(report.analysis.summary.overallStatus)}
                          </Badge>
                          <Badge className={getRiskLevelColor(report.analysis.summary.riskLevel)}>
                            {t(report.analysis.summary.riskLevel)} {t('risk')}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedReport(report)}
                    >
                      <Activity className="w-4 h-4 mr-2" />
                      {t('analyze')}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteReport(report.id)}
                    >
                      <AlertTriangle className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Report Analysis Dialog */}
      {selectedReport && selectedReport.analysis && (
        <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedReport.title}</DialogTitle>
              <DialogDescription>
                {t('detailedAnalysis')} • {new Date(selectedReport.uploadedAt).toLocaleDateString()}
              </DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="summary" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="summary">{t('summary')}</TabsTrigger>
                <TabsTrigger value="parameters">{t('parameters')}</TabsTrigger>
                <TabsTrigger value="charts">{t('charts')}</TabsTrigger>
              </TabsList>
              
              <TabsContent value="summary" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">{t('overallStatus')}</p>
                        <Badge className={`mt-2 ${getOverallStatusColor(selectedReport.analysis!.summary.overallStatus)}`}>
                          {t(selectedReport.analysis!.summary.overallStatus)}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">{t('riskLevel')}</p>
                        <Badge className={`mt-2 ${getRiskLevelColor(selectedReport.analysis!.summary.riskLevel)}`}>
                          {t(selectedReport.analysis!.summary.riskLevel)}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">{t('parameters')}</p>
                        <p className="text-2xl font-bold mt-2">
                          {Object.keys(selectedReport.analysis!.parameters).length}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle>{t('recommendations')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {selectedReport.analysis!.summary.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="parameters" className="space-y-4">
                <div className="space-y-3">
                  {Object.entries(selectedReport.analysis!.parameters).map(([name, param]) => (
                    <div key={name} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{name}</p>
                        <p className="text-sm text-gray-600">
                          {param.value} {param.unit} • {t('normalRange')}: {param.normalRange}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(param.status)}
                        <Badge className={getStatusColor(param.status)}>
                          {t(param.status)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="charts" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('parameterValues')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={generateChartData(selectedReport.analysis!)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ReportAnalytics;
