import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, 
  Pill, 
  Calendar, 
  Clock, 
  TrendingUp, 
  Heart, 
  Activity, 
  AlertTriangle,
  CheckCircle,
  Users,
  Bell,
  Upload,
  Plus,
  Eye,
  Download,
  Share2,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useFirestore } from '@/hooks/useFirestore';
import { useRealtimeDb } from '@/hooks/useRealtimeDb';
import FeatureStatus from '@/components/FeatureStatus';
import { MedicalLoading, HealthcareLoading } from '@/components/ui/loading';
import FileViewer from '@/components/ui/file-viewer';
import DoseTracker from './DoseTracker';
import UpcomingAppointments from './UpcomingAppointments';
import RecentReports from './RecentReports';
import AIAnalysis from './AIAnalysis';
import HealthMetricsTracker from './HealthMetricsTracker';

const PatientDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { userData } = useAuth();
  const [dashboardStats, setDashboardStats] = useState({
    totalReports: 0,
    pendingDoses: 0,
    upcomingAppointments: 0,
    unreadNotifications: 0,
    healthAlerts: 0,
    familyMembers: 0,
    medicationAdherence: 0,
    lastSync: new Date()
  });
  const [showFileViewer, setShowFileViewer] = useState(false);
  const [selectedReportForViewing, setSelectedReportForViewing] = useState<any>(null);

  // Fetch data using hooks
  const { data: reports, loading: reportsLoading } = useFirestore('reports',
    userData ? [{ field: 'userId', operator: '==', value: userData.id }] : undefined
  );
  
  const { data: medications, loading: medicationsLoading } = useFirestore('medication_schedule',
    userData ? [{ field: 'userId', operator: '==', value: userData.id }] : undefined
  );
  
  const { data: appointments, loading: appointmentsLoading } = useFirestore('appointments',
    userData ? [{ field: 'patientId', operator: '==', value: userData.id }] : undefined
  );

  const { data: familyMembers, loading: familyLoading } = useFirestore('family_members',
    userData ? [{ field: 'userId', operator: '==', value: userData.id }] : undefined
  );

  const { data: healthMetrics, loading: metricsLoading } = useFirestore('health_metrics',
    userData ? [{ field: 'userId', operator: '==', value: userData.id }] : undefined
  );

  const { data: notifications } = useRealtimeDb('notifications');
  const { data: healthAlerts } = useRealtimeDb('health_alerts');
  const { data: liveUpdates } = useRealtimeDb('live_updates');

  // Calculate dashboard stats
  useEffect(() => {
    if (userData) {
      const unreadNotifications = notifications.filter((n: any) => !n.read).length;
      const activeAlerts = healthAlerts.filter((a: any) => !a.acknowledged).length;
      const pendingDoses = medications.filter((m: any) => {
        const nextDose = new Date(m.nextDose);
        const now = new Date();
        return nextDose > now && nextDose <= new Date(now.getTime() + 24 * 60 * 60 * 1000);
      }).length;
      const upcomingAppointments = appointments.filter((a: any) => {
        const appointmentDate = new Date(a.dateTime);
        const now = new Date();
        return appointmentDate > now && appointmentDate <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      }).length;
      const adherenceRate = medications.length > 0 
        ? medications.reduce((acc: number, med: any) => acc + (med.adherenceRate || 0), 0) / medications.length
        : 0;

      setDashboardStats({
        totalReports: reports.length,
        pendingDoses,
        upcomingAppointments,
        unreadNotifications,
        healthAlerts: activeAlerts,
        familyMembers: familyMembers.length,
        medicationAdherence: Math.round(adherenceRate),
        lastSync: new Date()
      });
    }
  }, [userData, reports, medications, appointments, notifications, healthAlerts, familyMembers]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) {
      return <ArrowUpRight className="h-4 w-4 text-green-600" />;
    } else if (current < previous) {
      return <ArrowDownRight className="h-4 w-4 text-red-600" />;
    }
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  const handleViewReport = (report: any) => {
    setSelectedReportForViewing(report);
    setShowFileViewer(true);
  };

  const handleDownloadReport = (report: any) => {
    if (report.fileURL) {
      const link = document.createElement('a');
      link.href = report.fileURL;
      link.download = report.title || 'report';
      link.click();
    }
  };

  if (reportsLoading || medicationsLoading || appointmentsLoading || familyLoading || metricsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <HealthcareLoading text={t('loadingDashboard')} />
      </div>
    );
  }

  return (
    <div className="space-y-6 dashboard-content">
      {/* Welcome Header */}
      <Card className="bg-white shadow-sm border border-gray-100 rounded-xl dashboard-card">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <CardTitle className="text-2xl text-gray-900 truncate">{t('welcomeBack')}</CardTitle>
              <CardDescription className="text-gray-600 truncate">{t('healthOverview')}</CardDescription>
            </div>
            <div className="flex items-center space-x-4 flex-shrink-0">
              <div className="text-right">
                <p className="text-sm text-gray-500">{t('lastLogin')}</p>
                <p className="font-medium">{new Date().toLocaleDateString()}</p>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-white bg-blue-600 flex-shrink-0">
                <span className="material-icons">person</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 dashboard-item">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-600">{t('reports')}</p>
                  <p className="text-2xl font-bold text-blue-600">{dashboardStats.totalReports}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600 flex-shrink-0" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 dashboard-item">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-600">{t('pendingDoses')}</p>
                  <p className="text-2xl font-bold text-green-600">{dashboardStats.pendingDoses}</p>
                </div>
                <Pill className="h-8 w-8 text-green-600 flex-shrink-0" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 dashboard-item">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-600">{t('appointments')}</p>
                  <p className="text-2xl font-bold text-yellow-600">{dashboardStats.upcomingAppointments}</p>
                </div>
                <Calendar className="h-8 w-8 text-yellow-600 flex-shrink-0" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 dashboard-item">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-600">{t('adherence')}</p>
                  <p className="text-2xl font-bold text-purple-600">{dashboardStats.medicationAdherence}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600 flex-shrink-0" />
              </div>
              <div className="mt-2">
                <Progress value={dashboardStats.medicationAdherence} className="h-2" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 grid-responsive">
        <Card className="hover:shadow-md transition-shadow dashboard-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-600">{t('reports')}</p>
                <p className="text-xl font-bold">{reportsLoading ? <span className="animate-pulse">...</span> : dashboardStats.totalReports}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow dashboard-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
                <Pill className="h-5 w-5 text-green-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-600">{t('pendingDoses')}</p>
                <p className="text-xl font-bold">{dashboardStats.pendingDoses}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow dashboard-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg flex-shrink-0">
                <Calendar className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-600">{t('appointments')}</p>
                <p className="text-xl font-bold">{dashboardStats.upcomingAppointments}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow dashboard-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
                <Bell className="h-5 w-5 text-purple-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-600">{t('notifications')}</p>
                <p className="text-xl font-bold">{dashboardStats.unreadNotifications}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow dashboard-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-600">{t('healthAlert')}</p>
                <p className="text-xl font-bold">{dashboardStats.healthAlerts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow dashboard-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-100 rounded-lg flex-shrink-0">
                <Users className="h-5 w-5 text-indigo-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-600">{t('familyMembers')}</p>
                <p className="text-xl font-bold">{dashboardStats.familyMembers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid - Responsive Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 dashboard-container">
        {/* Left Column - Dose Tracker and Health Metrics */}
        <div className="xl:col-span-2 space-y-6">
          {/* Dose Tracker */}
          <DoseTracker />
          
          {/* Health Metrics Overview */}
          {healthMetrics.length > 0 && (
            <Card className="dashboard-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>Health Metrics Overview</span>
                </CardTitle>
                <CardDescription>Your latest health readings and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {healthMetrics.slice(0, 4).map((metric: any, index: number) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg dashboard-item">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 truncate">
                          {metric.date ? new Date(metric.date).toLocaleDateString() : t('today')}
                        </span>
                        {getTrendIcon(metric.bloodPressure?.systolic || 0, 140)}
                      </div>
                      <div className="space-y-2">
                        {metric.bloodPressure && (
                          <div className="flex justify-between">
                            <span className="text-xs text-gray-600">{t('bloodPressure')}</span>
                            <span className="text-sm font-medium">
                              {metric.bloodPressure.systolic}/{metric.bloodPressure.diastolic} mmHg
                            </span>
                          </div>
                        )}
                        {metric.heartRate && (
                          <div className="flex justify-between">
                            <span className="text-xs text-gray-600">{t('heartRate')}</span>
                            <span className="text-sm font-medium">{metric.heartRate} bpm</span>
                          </div>
                        )}
                        {metric.weight && (
                          <div className="flex justify-between">
                            <span className="text-xs text-gray-600">{t('weight')}</span>
                            <span className="text-sm font-medium">{metric.weight} kg</span>
                          </div>
                        )}
                        {metric.bloodSugar && (
                          <div className="flex justify-between">
                            <span className="text-xs text-gray-600">{t('bloodSugar')}</span>
                            <span className="text-sm font-medium">{metric.bloodSugar} mg/dL</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI Analysis */}
          <AIAnalysis />
        </div>

        {/* Right Column - Appointments and Reports */}
        <div className="space-y-6">
          {/* Upcoming Appointments */}
          <UpcomingAppointments />
          
          {/* Recent Reports */}
          {reports.length > 0 && (
            <Card className="dashboard-card">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 min-w-0 flex-1">
                    <FileText className="h-5 w-5 flex-shrink-0" />
                    <span className="truncate">Recent Reports</span>
                  </div>
                  <Button variant="outline" size="sm" className="flex-shrink-0">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload New
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {reports.slice(0, 3).map((report: any) => (
                    <div key={report.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                          <FileText className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{report.title}</p>
                          <p className="text-xs text-gray-600 truncate">
                            {report.labName} • {report.doctorName} • {new Date(report.uploadedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 flex-shrink-0 dashboard-actions">
                        <Badge variant="outline" className="text-xs">
                          {report.fileSize}
                        </Badge>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewReport(report)}
                          title={t('viewReport')}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDownloadReport(report)}
                          title={t('downloadReport')}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Live Updates Section */}
          {liveUpdates && liveUpdates.length > 0 && (
            <Card className="dashboard-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>Live Updates</span>
                </CardTitle>
                <CardDescription>Real-time health and medication updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {liveUpdates.slice(0, 3).map((update: any) => (
                    <div key={update.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        update.status === 'high' ? 'bg-red-500' : 
                        update.status === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {update.type.replace('_', ' ').toUpperCase()}
                        </p>
                        <p className="text-xs text-gray-600 truncate">
                          {typeof update.value === 'object' 
                            ? Object.entries(update.value).map(([k, v]) => `${k}: ${v}`).join(', ')
                            : update.value
                          }
                        </p>
                      </div>
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        {new Date(update.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Feature Status Component */}
      <FeatureStatus className="mt-6" />

      {/* File Viewer Modal */}
      {selectedReportForViewing && (
        <FileViewer
          isOpen={showFileViewer}
          onClose={() => {
            setShowFileViewer(false);
            setSelectedReportForViewing(null);
          }}
          fileUrl={selectedReportForViewing.fileURL || selectedReportForViewing.fileUrl}
          fileName={selectedReportForViewing.title}
          fileType={selectedReportForViewing.fileType}
        />
      )}
    </div>
  );
};

export default PatientDashboard;
