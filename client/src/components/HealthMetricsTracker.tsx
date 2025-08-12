import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useFirestore } from '@/hooks/useFirestore';
import { useAuth } from '@/contexts/AuthContext';
import { Activity, Heart, Thermometer, Scale, Droplets, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface HealthMetric {
  id: string;
  userId: string;
  date: any;
  bloodPressure?: {
    systolic: number;
    diastolic: number;
  };
  heartRate?: number;
  weight?: number;
  bloodSugar?: number;
  temperature?: number;
  notes?: string;
  createdAt?: any;
}

const HealthMetricsTracker: React.FC = () => {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const [selectedMetric, setSelectedMetric] = useState<string>('all');
  
  const { data: healthMetrics } = useFirestore<HealthMetric>('health_metrics',
    currentUser?.uid ? [{ field: 'userId', operator: '==', value: currentUser.uid }] : undefined
  );

  // Sort metrics by date (most recent first)
  const sortedMetrics = healthMetrics
    .sort((a, b) => {
      const dateA = a.date?.toDate?.() || a.createdAt?.toDate?.() || new Date(0);
      const dateB = b.date?.toDate?.() || b.createdAt?.toDate?.() || new Date(0);
      return dateB.getTime() - dateA.getTime();
    })
    .slice(0, 7); // Last 7 days

  const getLatestMetric = (type: string) => {
    if (sortedMetrics.length === 0) return null;
    
    switch (type) {
      case 'bloodPressure':
        return sortedMetrics.find(m => m.bloodPressure);
      case 'heartRate':
        return sortedMetrics.find(m => m.heartRate);
      case 'weight':
        return sortedMetrics.find(m => m.weight);
      case 'bloodSugar':
        return sortedMetrics.find(m => m.bloodSugar);
      case 'temperature':
        return sortedMetrics.find(m => m.temperature);
      default:
        return sortedMetrics[0];
    }
  };

  const getTrend = (type: string) => {
    if (sortedMetrics.length < 2) return 'stable';
    
    const recent = sortedMetrics[0];
    const previous = sortedMetrics[1];
    
    let current: number, past: number;
    
    switch (type) {
      case 'heartRate':
        current = recent.heartRate || 0;
        past = previous.heartRate || 0;
        break;
      case 'weight':
        current = recent.weight || 0;
        past = previous.weight || 0;
        break;
      case 'bloodSugar':
        current = recent.bloodSugar || 0;
        past = previous.bloodSugar || 0;
        break;
      case 'temperature':
        current = recent.temperature || 0;
        past = previous.temperature || 0;
        break;
      default:
        return 'stable';
    }
    
    if (current > past) return 'up';
    if (current < past) return 'down';
    return 'stable';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-green-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getBloodPressureStatus = (systolic: number, diastolic: number) => {
    if (systolic < 120 && diastolic < 80) return { status: 'Normal', color: 'bg-green-100 text-green-800' };
    if (systolic < 130 && diastolic < 80) return { status: 'Elevated', color: 'bg-yellow-100 text-yellow-800' };
    if (systolic >= 130 || diastolic >= 80) return { status: 'High', color: 'bg-red-100 text-red-800' };
    return { status: 'Unknown', color: 'bg-gray-100 text-gray-800' };
  };

  const getHeartRateStatus = (rate: number) => {
    if (rate >= 60 && rate <= 100) return { status: 'Normal', color: 'bg-green-100 text-green-800' };
    if (rate < 60) return { status: 'Low', color: 'bg-blue-100 text-blue-800' };
    return { status: 'High', color: 'bg-red-100 text-red-800' };
  };

  const getBloodSugarStatus = (sugar: number) => {
    if (sugar < 100) return { status: 'Normal', color: 'bg-green-100 text-green-800' };
    if (sugar >= 100 && sugar < 126) return { status: 'Pre-diabetic', color: 'bg-yellow-100 text-yellow-800' };
    return { status: 'High', color: 'bg-red-100 text-red-800' };
  };

  const getTemperatureStatus = (temp: number) => {
    if (temp >= 97 && temp <= 99) return { status: 'Normal', color: 'bg-green-100 text-green-800' };
    if (temp > 99) return { status: 'Elevated', color: 'bg-red-100 text-red-800' };
    return { status: 'Low', color: 'bg-blue-100 text-blue-800' };
  };

  const latestBloodPressure = getLatestMetric('bloodPressure');
  const latestHeartRate = getLatestMetric('heartRate');
  const latestWeight = getLatestMetric('weight');
  const latestBloodSugar = getLatestMetric('bloodSugar');
  const latestTemperature = getLatestMetric('temperature');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          {t('healthMetrics')}
        </CardTitle>
        <CardDescription>
          {t('trackVitalSigns')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Health Summary Banner */}
        <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-green-900 mb-1">{t('healthOverview')}</h3>
              <p className="text-green-700 text-sm">
                {sortedMetrics.length > 0 
                  ? t('trackingHealthMetrics', { count: sortedMetrics.length })
                  : t('startTrackingVitalSigns')
                }
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">
                {sortedMetrics.filter(m => m.bloodPressure || m.heartRate || m.weight || m.bloodSugar || m.temperature).length}
              </div>
              <div className="text-xs text-green-600">{t('activeMetrics')}</div>
            </div>
          </div>
        </div>

        {/* Quick Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Blood Pressure */}
          <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Droplets className="h-4 w-4 text-red-500" />
                <span className="text-sm font-medium">{t('bloodPressure')}</span>
              </div>
              {getTrendIcon(getTrend('bloodPressure'))}
            </div>
            {latestBloodPressure?.bloodPressure ? (
              <>
                <div className="text-2xl font-bold text-gray-900">
                  {latestBloodPressure.bloodPressure.systolic}/{latestBloodPressure.bloodPressure.diastolic}
                </div>
                <div className="text-sm text-gray-600">mmHg</div>
                <Badge className={`mt-2 ${getBloodPressureStatus(latestBloodPressure.bloodPressure.systolic, latestBloodPressure.bloodPressure.diastolic).color}`}>
                  {getBloodPressureStatus(latestBloodPressure.bloodPressure.systolic, latestBloodPressure.bloodPressure.diastolic).status}
                </Badge>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="w-12 h-12 mx-auto mb-2 bg-red-100 rounded-full flex items-center justify-center">
                  <Droplets className="h-6 w-6 text-red-500" />
                </div>
                <div className="text-gray-500 text-sm">{t('noData')}</div>
                <div className="text-xs text-gray-400 mt-1">{t('addBloodPressureReading')}</div>
              </div>
            )}
          </div>

          {/* Heart Rate */}
          <div className="p-4 border border-gray-200 rounded-lg hover:border-red-300 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Heart className="h-4 w-4 text-red-500" />
                <span className="text-sm font-medium">{t('heartRate')}</span>
              </div>
              {getTrendIcon(getTrend('heartRate'))}
            </div>
            {latestHeartRate?.heartRate ? (
              <>
                <div className="text-2xl font-bold text-gray-900">{latestHeartRate.heartRate}</div>
                <div className="text-sm text-gray-600">bpm</div>
                <Badge className={`mt-2 ${getHeartRateStatus(latestHeartRate.heartRate).color}`}>
                  {getHeartRateStatus(latestHeartRate.heartRate).status}
                </Badge>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="w-12 h-12 mx-auto mb-2 bg-red-100 rounded-full flex items-center justify-center">
                  <Heart className="h-6 w-6 text-red-500" />
                </div>
                <div className="text-gray-500 text-sm">{t('noData')}</div>
                <div className="text-xs text-gray-400 mt-1">{t('addHeartRateReading')}</div>
              </div>
            )}
          </div>

          {/* Weight */}
          <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Scale className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">{t('weight')}</span>
              </div>
              {getTrendIcon(getTrend('weight'))}
            </div>
            {latestWeight?.weight ? (
              <>
                <div className="text-2xl font-bold text-gray-900">{latestWeight.weight}</div>
                <div className="text-sm text-gray-600">kg</div>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="w-12 h-12 mx-auto mb-2 bg-blue-100 rounded-full flex items-center justify-center">
                  <Scale className="h-6 w-6 text-blue-500" />
                </div>
                <div className="text-gray-500 text-sm">{t('noData')}</div>
                <div className="text-xs text-gray-400 mt-1">{t('addWeightReading')}</div>
              </div>
            )}
          </div>

          {/* Blood Sugar */}
          <div className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-medium">{t('bloodSugar')}</span>
              </div>
              {getTrendIcon(getTrend('bloodSugar'))}
            </div>
            {latestBloodSugar?.bloodSugar ? (
              <>
                <div className="text-2xl font-bold text-gray-900">{latestBloodSugar.bloodSugar}</div>
                <div className="text-sm text-gray-600">mg/dL</div>
                <Badge className={`mt-2 ${getBloodSugarStatus(latestBloodSugar.bloodSugar).color}`}>
                  {getBloodSugarStatus(latestBloodSugar.bloodSugar).status}
                </Badge>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="w-12 h-12 mx-auto mb-2 bg-purple-100 rounded-full flex items-center justify-center">
                  <Activity className="h-6 w-6 text-purple-500" />
                </div>
                <div className="text-gray-500 text-sm">{t('noData')}</div>
                <div className="text-xs text-gray-400 mt-1">{t('addBloodSugarReading')}</div>
              </div>
            )}
          </div>
        </div>

        {/* Temperature */}
        <div className="p-4 border border-gray-200 rounded-lg hover:border-orange-300 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Thermometer className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">{t('temperature')}</span>
            </div>
            {getTrendIcon(getTrend('temperature'))}
          </div>
          {latestTemperature?.temperature ? (
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{latestTemperature.temperature}°F</div>
                <div className="text-sm text-gray-600">{t('bodyTemperature')}</div>
              </div>
              <Badge className={getTemperatureStatus(latestTemperature.temperature).color}>
                {getTemperatureStatus(latestTemperature.temperature).status}
              </Badge>
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="w-12 h-12 mx-auto mb-2 bg-orange-100 rounded-full flex items-center justify-center">
                <Thermometer className="h-6 w-6 text-orange-500" />
              </div>
              <div className="text-gray-500 text-sm">{t('noData')}</div>
              <div className="text-xs text-gray-400 mt-1">{t('addTemperatureReading')}</div>
            </div>
          )}
        </div>

        {/* Recent History */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900">{t('recentHistory')}</h3>
            {sortedMetrics.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {t('entries', { count: sortedMetrics.length })}
              </Badge>
            )}
          </div>
          
          {sortedMetrics.length > 0 ? (
            <div className="space-y-2">
              {sortedMetrics.map((metric) => (
                <div key={metric.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-sm font-medium text-gray-900 bg-gray-100 px-2 py-1 rounded">
                        {metric.date?.toDate?.()?.toLocaleDateString() || 'Unknown date'}
                      </div>
                      <div className="flex items-center space-x-4 text-sm">
                        {metric.bloodPressure && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <Droplets className="h-3 w-3 mr-1" />
                            BP: {metric.bloodPressure.systolic}/{metric.bloodPressure.diastolic}
                          </span>
                        )}
                        {metric.heartRate && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <Heart className="h-3 w-3 mr-1" />
                            HR: {metric.heartRate} bpm
                          </span>
                        )}
                        {metric.weight && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            <Scale className="h-3 w-3 mr-1" />
                            Weight: {metric.weight} kg
                          </span>
                        )}
                        {metric.bloodSugar && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            <Activity className="h-3 w-3 mr-1" />
                            BS: {metric.bloodSugar} mg/dL
                          </span>
                        )}
                        {metric.temperature && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            <Thermometer className="h-6 w-6 text-orange-500" />
                            Temp: {metric.temperature}°F
                          </span>
                        )}
                      </div>
                    </div>
                    {metric.notes && (
                      <div className="text-xs text-gray-500 max-w-xs truncate bg-gray-50 px-2 py-1 rounded">
                        {metric.notes}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 px-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Activity className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Health Metrics Yet</h3>
              <p className="text-gray-600 text-sm mb-4">
                Start tracking your vital signs to build a comprehensive health history
              </p>
              <div className="space-y-2 max-w-sm mx-auto text-xs text-gray-500">
                <div className="flex items-center space-x-2">
                  <span className="material-icons text-green-500 text-sm">check_circle</span>
                  <span>Monitor blood pressure trends</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="material-icons text-green-500 text-sm">check_circle</span>
                  <span>Track heart rate patterns</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="material-icons text-green-500 text-sm">check_circle</span>
                  <span>Record weight changes</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="material-icons text-green-500 text-sm">check_circle</span>
                  <span>Monitor blood sugar levels</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Add New Metric Button */}
        <div className="flex justify-center">
          <Button className="bg-blue-600 hover:bg-blue-700">
                         <Activity className="h-4 w-4 mr-2" />
             {t('addNewMetric')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default HealthMetricsTracker;
