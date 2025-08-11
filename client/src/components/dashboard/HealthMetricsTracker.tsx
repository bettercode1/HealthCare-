import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRealtimeDb } from '@/hooks/useRealtimeDb';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loading, HealthcareLoading } from '@/components/ui/loading';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface HealthMetric {
  id: string;
  userId: string;
  type: 'blood_pressure' | 'blood_sugar' | 'weight' | 'temperature' | 'heart_rate';
  value: number | { systolic: number; diastolic: number };
  unit: string;
  date: string;
  notes?: string;
  timestamp: any;
}

const HealthMetricsTracker: React.FC = () => {
  const { t } = useTranslation();
  const { userData } = useAuth();
  const { toast } = useToast();
  const [showAddModal, setShowAddModal] = useState(false);
  const [metricForm, setMetricForm] = useState({
    type: '',
    systolic: '',
    diastolic: '',
    value: '',
    unit: '',
    notes: ''
  });
  
  const { 
    data: metrics, 
    add: addMetric, 
    loading: metricsLoading 
  } = useRealtimeDb<HealthMetric>('health_metrics');

  const metricTypes = [
            { value: 'blood_pressure', label: t('bloodPressure'), unit: 'mmHg' },
        { value: 'blood_sugar', label: t('bloodSugar'), unit: 'mg/dL' },
        { value: 'weight', label: t('weight'), unit: 'kg' },
        { value: 'temperature', label: t('temperature'), unit: '°C' },
        { value: 'heart_rate', label: t('heartRate'), unit: 'bpm' }
  ];

  const handleAddMetric = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData || !metricForm.type) return;

    try {
      let value: number | { systolic: number; diastolic: number };
      let unit = metricForm.unit;

      if (metricForm.type === 'blood_pressure') {
        if (!metricForm.systolic || !metricForm.diastolic) {
          toast({
            title: t('error'),
            description: t('pleaseEnterBothSystolicAndDiastolicValues'),
            variant: 'destructive',
          });
          return;
        }
        value = {
          systolic: parseInt(metricForm.systolic),
          diastolic: parseInt(metricForm.diastolic)
        };
        unit = 'mmHg';
      } else {
        if (!metricForm.value) {
          toast({
            title: t('error'),
            description: t('pleaseEnterAValue'),
            variant: 'destructive',
          });
          return;
        }
        value = parseFloat(metricForm.value);
        unit = metricForm.unit || metricTypes.find(t => t.value === metricForm.type)?.unit || '';
      }

      await addMetric({
        userId: userData.id,
        type: metricForm.type as any,
        value,
        unit,
        date: new Date().toISOString().split('T')[0],
        notes: metricForm.notes,
      });

      setMetricForm({
        type: '',
        systolic: '',
        diastolic: '',
        value: '',
        unit: '',
        notes: ''
      });
      setShowAddModal(false);

      toast({
        title: 'Success',
        description: 'Health metric added successfully',
      });
    } catch (error) {
      console.error('Add metric error:', error);
      toast({
        title: 'Error',
        description: 'Failed to add health metric',
        variant: 'destructive',
      });
    }
  };

  const getMetricIcon = (type: string) => {
    switch (type) {
      case 'blood_pressure':
        return 'favorite';
      case 'blood_sugar':
        return 'water_drop';
      case 'weight':
        return 'monitor_weight';
      case 'temperature':
        return 'thermostat';
      case 'heart_rate':
        return 'favorite_border';
      default:
        return 'monitor_heart';
    }
  };

  const getMetricColor = (type: string) => {
    switch (type) {
      case 'blood_pressure':
        return 'bg-red-100 text-red-600';
      case 'blood_sugar':
        return 'bg-blue-100 text-blue-600';
      case 'weight':
        return 'bg-green-100 text-green-600';
      case 'temperature':
        return 'bg-orange-100 text-orange-600';
      case 'heart_rate':
        return 'bg-purple-100 text-purple-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const formatMetricValue = (metric: HealthMetric) => {
    if (metric.type === 'blood_pressure' && typeof metric.value === 'object') {
      return `${metric.value.systolic}/${metric.value.diastolic} ${metric.unit}`;
    }
    return `${metric.value} ${metric.unit}`;
  };

  const getMetricStatus = (metric: HealthMetric) => {
    if (metric.type === 'blood_pressure' && typeof metric.value === 'object') {
      const { systolic, diastolic } = metric.value;
      if (systolic >= 140 || diastolic >= 90) return 'high';
      if (systolic >= 120 || diastolic >= 80) return 'elevated';
      return 'normal';
    }
    
    if (metric.type === 'blood_sugar' && typeof metric.value === 'number') {
      if (metric.value >= 126) return 'high';
      if (metric.value >= 100) return 'elevated';
      return 'normal';
    }
    
    if (metric.type === 'heart_rate' && typeof metric.value === 'number') {
      if (metric.value > 100) return 'high';
      if (metric.value < 60) return 'low';
      return 'normal';
    }
    
    return 'normal';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'high':
        return 'text-red-600';
      case 'elevated':
        return 'text-yellow-600';
      case 'low':
        return 'text-blue-600';
      default:
        return 'text-green-600';
    }
  };

  // Prepare chart data for the last 7 days
  const chartData = metrics
    .filter(metric => {
      const date = new Date(metric.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return date >= weekAgo;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(metric => ({
      date: metric.date,
      value: typeof metric.value === 'number' ? metric.value : metric.value.systolic,
      type: metric.type
    }));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">
            Health Metrics
          </CardTitle>
          <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                <span className="material-icons mr-2 text-sm">add</span>
                Add Metric
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="material-icons text-blue-600 text-xl">add</span>
                    </div>
                    <div>
                      <DialogTitle className="text-2xl font-bold text-blue-900">Add Health Metric</DialogTitle>
                      <p className="text-sm text-blue-700">Track your health measurements and vital signs</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAddModal(false)}
                    className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </DialogHeader>
              <form onSubmit={handleAddMetric} className="space-y-6">
                <div>
                  <Label htmlFor="type" className="text-gray-700">{t('metricType')}</Label>
                  <Select 
                    value={metricForm.type} 
                    onValueChange={(value) => setMetricForm(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger className="h-11 focus:ring-2 focus:ring-blue-500">
                      <SelectValue placeholder={t('selectMetricType')} />
                    </SelectTrigger>
                    <SelectContent>
                      {metricTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {metricForm.type === 'blood_pressure' ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="systolic" className="text-gray-700">{t('systolic')} (mmHg)</Label>
                      <Input
                        id="systolic"
                        type="number"
                        value={metricForm.systolic}
                        onChange={(e) => setMetricForm(prev => ({ ...prev, systolic: e.target.value }))}
                        placeholder="120"
                        className="h-11 focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="diastolic" className="text-gray-700">{t('diastolic')} (mmHg)</Label>
                      <Input
                        id="diastolic"
                        type="number"
                        value={metricForm.diastolic}
                        onChange={(e) => setMetricForm(prev => ({ ...prev, diastolic: e.target.value }))}
                        placeholder="80"
                        className="h-11 focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <Label htmlFor="value" className="text-gray-700">{t('value')}</Label>
                    <Input
                      id="value"
                      type="number"
                      step="0.1"
                      value={metricForm.value}
                      onChange={(e) => setMetricForm(prev => ({ ...prev, value: e.target.value }))}
                      placeholder="Enter value"
                      className="h-11 focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                )}
                
                <div>
                  <Label htmlFor="notes" className="text-gray-700">{t('notes')} ({t('optional')})</Label>
                  <Input
                    id="notes"
                    value={metricForm.notes}
                    onChange={(e) => setMetricForm(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional notes"
                    className="h-11 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    type="submit" 
                    className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                  >
                    <span className="material-icons mr-2">add</span>
                    Add Metric
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 h-11 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {metricsLoading ? (
          <HealthcareLoading text={t('loadingHealthMetrics')} />
        ) : (
          <div className="space-y-4">
            {/* Recent Metrics */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Recent Measurements</h4>
              {metrics.slice(0, 5).map((metric) => {
                const status = getMetricStatus(metric);
                return (
                  <div key={metric.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getMetricColor(metric.type)}`}>
                        <span className="material-icons text-sm">
                          {getMetricIcon(metric.type)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {metricTypes.find(t => t.value === metric.type)?.label}
                        </p>
                        <p className={`text-sm font-medium ${getStatusColor(status)}`}>
                          {formatMetricValue(metric)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(metric.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        status === 'high' ? 'bg-red-100 text-red-700' :
                        status === 'elevated' ? 'bg-yellow-100 text-yellow-700' :
                        status === 'low' ? 'bg-blue-100 text-blue-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Chart */}
            {chartData.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">7-Day Trend</h4>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="hsl(207, 90%, 54%)" 
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {metrics.length === 0 && (
              <div className="text-center py-4">
                <span className="material-icons text-gray-400 text-3xl mb-2">monitor_heart</span>
                <p className="text-gray-500">No health metrics recorded yet</p>
                <p className="text-sm text-gray-400">Start tracking your health metrics</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HealthMetricsTracker;
