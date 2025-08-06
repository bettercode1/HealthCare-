import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

const AIAnalysis: React.FC = () => {
  // Mock AI analysis data - in real app, this would come from actual health reports analysis
  const healthTrendData = [
    { month: 'Jul', bloodPressure: 130, bloodSugar: 95, cholesterol: 200 },
    { month: 'Aug', bloodPressure: 135, bloodSugar: 98, cholesterol: 205 },
    { month: 'Sep', bloodPressure: 140, bloodSugar: 100, cholesterol: 210 },
    { month: 'Oct', bloodPressure: 142, bloodSugar: 96, cholesterol: 215 },
    { month: 'Nov', bloodPressure: 145, bloodSugar: 98, cholesterol: 218 },
    { month: 'Dec', bloodPressure: 145, bloodSugar: 98, cholesterol: 220 },
  ];

  const conditionData = [
    { name: 'Normal', value: 60, color: 'hsl(153, 72%, 51%)' },
    { name: 'Borderline', value: 25, color: 'hsl(48, 96%, 53%)' },
    { name: 'High', value: 15, color: 'hsl(0, 84%, 60%)' },
  ];

  const symptomsData = [
    { symptom: 'Fatigue', severity: 3 },
    { symptom: 'Headache', severity: 2 },
    { symptom: 'Dizziness', severity: 1 },
    { symptom: 'Chest Pain', severity: 0 },
  ];

  const labReadings = [
    {
      reading: 'Blood Pressure',
      value: '145/92 mmHg',
      range: '120/80 - 140/90',
      status: 'High',
      recommendation: 'Reduce sodium, increase exercise',
      color: 'hsl(0, 84%, 60%)'
    },
    {
      reading: 'Blood Sugar',
      value: '98 mg/dL',
      range: '70-100',
      status: 'Normal',
      recommendation: 'Maintain current diet',
      color: 'hsl(153, 72%, 51%)'
    },
    {
      reading: 'Cholesterol',
      value: '220 mg/dL',
      range: 'Less than 200',
      status: 'Borderline',
      recommendation: 'Increase fiber intake',
      color: 'hsl(48, 96%, 53%)'
    },
    {
      reading: 'BMI',
      value: '23.5',
      range: '18.5-24.9',
      status: 'Normal',
      recommendation: 'Maintain current weight',
      color: 'hsl(153, 72%, 51%)'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold text-gray-900">AI Health Analysis</CardTitle>
          <Button variant="ghost" size="sm" style={{ color: 'hsl(207, 90%, 54%)' }}>
            <span className="material-icons">refresh</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        
        {/* Health Metrics Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {labReadings.map((reading) => (
            <div key={reading.reading} className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">{reading.reading}</p>
              <p className="text-lg font-semibold" style={{ color: reading.color }}>
                {reading.value}
              </p>
              <span className="text-xs" style={{ color: reading.color }}>
                {reading.status}
              </span>
            </div>
          ))}
        </div>

        {/* Health Trend Chart */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Health Trends (Last 6 Months)</h3>
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
                  name="Blood Pressure (Systolic)"
                />
                <Line 
                  type="monotone" 
                  dataKey="bloodSugar" 
                  stroke="hsl(153, 72%, 51%)" 
                  strokeWidth={2}
                  name="Blood Sugar"
                />
                <Line 
                  type="monotone" 
                  dataKey="cholesterol" 
                  stroke="hsl(48, 96%, 53%)" 
                  strokeWidth={2}
                  name="Cholesterol"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Condition Distribution */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-3">Condition Distribution</h4>
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
            <h4 className="text-md font-medium text-gray-900 mb-3">Symptoms vs Severity</h4>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={symptomsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="symptom" 
                    tick={{ fontSize: 12 }}
                    interval={0}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="severity" fill="hsl(207, 90%, 54%)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* AI Insights */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <h4 className="font-medium mb-2 flex items-center" style={{ color: 'hsl(207, 90%, 54%)' }}>
            <span className="material-icons mr-2">psychology</span>
            AI Insights & Recommendations
          </h4>
          <div className="space-y-2 text-sm text-gray-700">
            <p>• <strong>Blood Pressure Alert:</strong> Your systolic pressure has increased to 145 mmHg. Consider reducing sodium intake and increasing physical activity.</p>
            <p>• <strong>Cholesterol Warning:</strong> At 220 mg/dL, your cholesterol is approaching high risk. Include more fiber-rich foods and omega-3 fatty acids.</p>
            <p>• <strong>Positive Trend:</strong> Blood sugar levels remain stable within normal range. Continue current dietary habits.</p>
            <p>• <strong>Overall Assessment:</strong> Health metrics show mixed results. Focus on cardiovascular health through diet and exercise.</p>
          </div>
          <div className="mt-4 flex space-x-2">
            <Button variant="link" className="p-0 h-auto text-xs hover:text-blue-700" style={{ color: 'hsl(207, 90%, 54%)' }}>
              View Detailed Analysis →
            </Button>
            <Button variant="link" className="p-0 h-auto text-xs hover:text-green-700" style={{ color: 'hsl(153, 72%, 51%)' }}>
              Download Report →
            </Button>
          </div>
        </div>

        {/* Data Table */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-3">Lab Readings Analysis</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 font-medium text-gray-900">Reading</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-900">Value</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-900">Normal Range</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-900">Status</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-900">Recommendation</th>
                </tr>
              </thead>
              <tbody className="text-gray-600">
                {labReadings.map((reading, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-2 font-medium">{reading.reading}</td>
                    <td className="py-3 px-2">{reading.value}</td>
                    <td className="py-3 px-2">{reading.range}</td>
                    <td className="py-3 px-2">
                      <span 
                        className="font-medium"
                        style={{ color: reading.color }}
                      >
                        {reading.status}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-xs">{reading.recommendation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm"
            className="text-blue-600 border-blue-200 hover:bg-blue-50"
          >
            <span className="material-icons mr-2 text-sm">share</span>
            Share with Doctor
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="text-green-600 border-green-200 hover:bg-green-50"
          >
            <span className="material-icons mr-2 text-sm">schedule</span>
            Set Reminders
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="text-purple-600 border-purple-200 hover:bg-purple-50"
          >
            <span className="material-icons mr-2 text-sm">history</span>
            View History
          </Button>
        </div>

      </CardContent>
    </Card>
  );
};

export default AIAnalysis;
