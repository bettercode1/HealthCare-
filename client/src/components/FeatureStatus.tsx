import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useFirestore } from '@/hooks/useFirestore';
import { useRealtimeDb } from '@/hooks/useRealtimeDb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Database, 
  Users, 
  Activity,
  FileText,
  Calendar,
  Pill,
  Bell,
  Heart,
  Shield,
  Zap
} from 'lucide-react';
import BettercodeLogo from './BettercodeLogo';

interface FeatureStatusProps {
  className?: string;
}

const FeatureStatus: React.FC<FeatureStatusProps> = ({ className }) => {
  const { userData } = useAuth();
  const [featureStatus, setFeatureStatus] = useState({
    reports: { status: 'loading', count: 0, lastSync: null },
    medications: { status: 'loading', count: 0, lastSync: null },
    appointments: { status: 'loading', count: 0, lastSync: null },
    healthMetrics: { status: 'loading', count: 0, lastSync: null },
    notifications: { status: 'loading', count: 0, lastSync: null },
    familyMembers: { status: 'loading', count: 0, lastSync: null },
    doseTracking: { status: 'loading', count: 0, lastSync: null },
    aiAnalysis: { status: 'loading', count: 0, lastSync: null }
  });

  const { t } = useTranslation();

  // Firestore data hooks
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

  // Realtime data hooks
  const { data: notifications } = useRealtimeDb('notifications');
  const { data: doseTracking } = useRealtimeDb('dose_tracking');
  const { data: aiAnalysis } = useRealtimeDb('ai_analysis');

  // Update feature status based on data
  useEffect(() => {
    if (userData) {
      setFeatureStatus(prev => ({
        ...prev,
        reports: {
          status: reportsLoading ? 'loading' : reports.length > 0 ? 'active' : 'inactive',
          count: reports.length,
          lastSync: new Date()
        },
        medications: {
          status: medicationsLoading ? 'loading' : medications.length > 0 ? 'active' : 'inactive',
          count: medications.length,
          lastSync: new Date()
        },
        appointments: {
          status: appointmentsLoading ? 'loading' : appointments.length > 0 ? 'active' : 'inactive',
          count: appointments.length,
          lastSync: new Date()
        },
        healthMetrics: {
          status: metricsLoading ? 'loading' : healthMetrics.length > 0 ? 'active' : 'inactive',
          count: healthMetrics.length,
          lastSync: new Date()
        },
        notifications: {
          status: notifications.length > 0 ? 'active' : 'inactive',
          count: notifications.length,
          lastSync: new Date()
        },
        familyMembers: {
          status: familyLoading ? 'loading' : familyMembers.length > 0 ? 'active' : 'inactive',
          count: familyMembers.length,
          lastSync: new Date()
        },
        doseTracking: {
          status: doseTracking.length > 0 ? 'active' : 'inactive',
          count: doseTracking.length,
          lastSync: new Date()
        },
        aiAnalysis: {
          status: aiAnalysis.length > 0 ? 'active' : 'inactive',
          count: aiAnalysis.length,
          lastSync: new Date()
        }
      }));
    }
  }, [
    userData, reports, medications, appointments, healthMetrics, 
    notifications, familyMembers, doseTracking, aiAnalysis,
    reportsLoading, medicationsLoading, appointmentsLoading, 
    metricsLoading, familyLoading
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'loading':
        return <Clock className="h-4 w-4 text-yellow-500 animate-pulse" />;
      case 'inactive':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">{t('active')}</Badge>;
      case 'loading':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">{t('loading')}</Badge>;
      case 'inactive':
        return <Badge variant="destructive" className="bg-red-100 text-red-800">{t('inactive')}</Badge>;
      default:
        return <Badge variant="outline">{t('unknown')}</Badge>;
    }
  };

  const getFeatureIcon = (feature: string) => {
    switch (feature) {
      case 'reports':
        return <FileText className="h-4 w-4" />;
      case 'medications':
        return <Pill className="h-4 w-4" />;
      case 'appointments':
        return <Calendar className="h-4 w-4" />;
      case 'healthMetrics':
        return <Heart className="h-4 w-4" />;
      case 'notifications':
        return <Bell className="h-4 w-4" />;
      case 'familyMembers':
        return <Users className="h-4 w-4" />;
      case 'doseTracking':
        return <Database className="h-4 w-4" />;
      case 'aiAnalysis':
        return <Zap className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  if (!userData) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Shield className="h-5 w-5" />
          <span>{t('featureStatus')}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(featureStatus).map(([feature, status]) => (
            <div key={feature} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                {getFeatureIcon(feature)}
                <div>
                  <p className="text-sm font-medium capitalize">
                    {feature.replace(/([A-Z])/g, ' $1').trim()}
                  </p>
                  <p className="text-xs text-gray-500">
                    {status.count} items • {status.lastSync?.toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusIcon(status.status)}
                {getStatusBadge(status.status)}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">{t('dataSynchronization')}</span>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-600">{t('realTime')}</span>
            </div>
          </div>
        </div>

        {/* Bettercode Logo */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <BettercodeLogo variant="minimal" className="justify-center" />
        </div>
      </CardContent>
    </Card>
  );
};

export default FeatureStatus;
