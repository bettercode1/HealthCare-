import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import BettercodeLogo from './BettercodeLogo';

const AIAnalysis: React.FC = () => {
  const { t } = useTranslation();

  // Mock AI analysis data - in real app, this would come from actual health reports
  const healthTrendData = [
    { month: 'Jul', bloodPressure: 130, bloodSugar: 95, cholesterol: 200 },
    { month: 'Aug', bloodPressure: 135, bloodSugar: 98, cholesterol: 205 },
    { month: 'Sep', bloodPressure: 140, bloodSugar: 100, cholesterol: 210 },
    { month: 'Oct', bloodPressure: 142, bloodSugar: 96, cholesterol: 215 },
    { month: 'Nov', bloodPressure: 145, bloodSugar: 98, cholesterol: 218 },
    { month: 'Dec', bloodPressure: 145, bloodSugar: 98, cholesterol: 220 },
  ];

  const conditionData = [
    { name: t('normal'), value: 60, color: 'hsl(153, 72%, 51%)' },
    { name: t('borderline'), value: 25, color: 'hsl(48, 96%, 53%)' },
    { name: t('high'), value: 15, color: 'hsl(0, 84%, 60%)' },
  ];

  const symptomsData = [
    { symptom: t('fatigue'), severity: 3 },
    { symptom: t('headache'), severity: 2 },
    { symptom: t('dizziness'), severity: 1 },
    { symptom: t('chestPain'), severity: 0 },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold text-gray-900">{t('aiHealthAnalysis')}</CardTitle>
          <Button variant="ghost" size="sm" style={{ color: 'hsl(207, 90%, 54%)' }}>
            <span className="material-icons">refresh</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        
        {/* Health Metrics Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">{t('bloodPressure')}</p>
            <p className="text-lg font-semibold" style={{ color: 'hsl(0, 84%, 60%)' }}>145/92</p>
            <span className="text-xs" style={{ color: 'hsl(0, 84%, 60%)' }}>{t('high')}</span>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">{t('bloodSugar')}</p>
            <p className="text-lg font-semibold" style={{ color: 'hsl(153, 72%, 51%)' }}>98 mg/dL</p>
            <span className="text-xs" style={{ color: 'hsl(153, 72%, 51%)' }}>{t('normal')}</span>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">{t('cholesterol')}</p>
            <p className="text-lg font-semibold" style={{ color: 'hsl(48, 96%, 53%)' }}>220 mg/dL</p>
            <span className="text-xs" style={{ color: 'hsl(48, 96%, 53%)' }}>{t('borderline')}</span>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">{t('bmi')}</p>
            <p className="text-lg font-semibold" style={{ color: 'hsl(153, 72%, 51%)' }}>23.5</p>
            <span className="text-xs" style={{ color: 'hsl(153, 72%, 51%)' }}>{t('normal')}</span>
          </div>
        </div>

        {/* Health Trend Chart */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">{t('healthTrendsLast6Months')}</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={healthTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="bloodPressure" 
                  stroke="hsl(0, 84%, 60%)" 
                  strokeWidth={2}
                  name={t('bloodPressureSystolic')}
                />
                <Line 
                  type="monotone" 
                  dataKey="bloodSugar" 
                  stroke="hsl(153, 72%, 51%)" 
                  strokeWidth={2}
                  name={t('bloodSugar')}
                />
                <Line 
                  type="monotone" 
                  dataKey="cholesterol" 
                  stroke="hsl(48, 96%, 53%)" 
                  strokeWidth={2}
                  name={t('cholesterol')}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Condition Distribution */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-3">{t('conditionDistribution')}</h4>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={conditionData}
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {conditionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Symptoms Severity */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-3">{t('symptomsVsSeverity')}</h4>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={symptomsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="symptom" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="severity" fill="hsl(207, 90%, 54%)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* AI Insights */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium mb-2 flex items-center" style={{ color: 'hsl(207, 90%, 54%)' }}>
            <span className="material-icons mr-2">psychology</span>
            {t('aiInsights')}
          </h4>
          <div className="space-y-2 text-sm text-gray-700">
            <p>• {t('bloodPressureInsight')}</p>
            <p>• {t('cholesterolInsight')}</p>
            <p>• {t('overallHealthInsight')}</p>
          </div>
          <Button variant="link" className="mt-3 p-0 h-auto hover:text-blue-700" style={{ color: 'hsl(207, 90%, 54%)' }}>
            {t('viewDetailedAnalysis')} →
          </Button>
        </div>

        {/* Data Table */}
        <div className="mt-6">
          <h4 className="text-md font-medium text-gray-900 mb-3">{t('labReadingsAnalysis')}</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2">{t('reading')}</th>
                  <th className="text-left py-2">{t('value')}</th>
                  <th className="text-left py-2">{t('range')}</th>
                  <th className="text-left py-2">{t('status')}</th>
                  <th className="text-left py-2">{t('recommendation')}</th>
                </tr>
              </thead>
              <tbody className="text-gray-600">
                <tr className="border-b border-gray-100">
                  <td className="py-2">{t('bloodPressure')}</td>
                  <td className="py-2">145/92 mmHg</td>
                  <td className="py-2">120/80 - 140/90</td>
                  <td className="py-2"><span style={{ color: 'hsl(0, 84%, 60%)' }}>{t('high')}</span></td>
                  <td className="py-2">{t('reduceSodiumIncreaseExercise')}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2">{t('bloodSugar')}</td>
                  <td className="py-2">98 mg/dL</td>
                  <td className="py-2">70-100</td>
                  <td className="py-2"><span style={{ color: 'hsl(153, 72%, 51%)' }}>{t('normal')}</span></td>
                  <td className="py-2">{t('maintainCurrentDiet')}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2">{t('cholesterol')}</td>
                  <td className="py-2">220 mg/dL</td>
                  <td className="py-2">{t('lessThan200')}</td>
                  <td className="py-2"><span style={{ color: 'hsl(48, 96%, 53%)' }}>{t('borderline')}</span></td>
                  <td className="py-2">{t('increaseFiberIntake')}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Bettercode Logo */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <BettercodeLogo variant="minimal" className="justify-center" />
        </div>

      </CardContent>
    </Card>
  );
};

export default AIAnalysis;
