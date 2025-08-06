import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useFirestore } from '@/hooks/useFirestore';
import { useAuth } from '@/contexts/AuthContext';

interface Report {
  id: string;
  userId: string;
  title: string;
  fileURL: string;
  notes?: string;
  createdAt?: any;
}

const RecentReports: React.FC = () => {
  const { userData } = useAuth();
  
  const { data: reports } = useFirestore<Report>('reports',
    userData ? [{ field: 'userId', operator: '==', value: userData.id }] : undefined
  );

  const getReportColor = (title: string) => {
    if (title.toLowerCase().includes('blood')) return 'bg-red-100 text-red-600';
    if (title.toLowerCase().includes('xray') || title.toLowerCase().includes('x-ray')) return 'bg-blue-100 text-blue-600';
    if (title.toLowerCase().includes('mri')) return 'bg-purple-100 text-purple-600';
    if (title.toLowerCase().includes('scan')) return 'bg-green-100 text-green-600';
    return 'bg-gray-100 text-gray-600';
  };

  const handleViewReport = (fileURL: string) => {
    window.open(fileURL, '_blank');
  };

  const handleDownloadReport = (fileURL: string, title: string) => {
    const link = document.createElement('a');
    link.href = fileURL;
    link.download = title;
    link.click();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold text-gray-900">Recent Reports</CardTitle>
          <Button className="text-white hover:bg-blue-700" style={{ backgroundColor: 'hsl(207, 90%, 54%)' }}>
            <span className="material-icons mr-2 text-sm">upload</span>
            Upload Report
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {reports.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No reports uploaded yet</p>
          ) : (
            reports.slice(0, 5).map((report) => (
              <div 
                key={report.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getReportColor(report.title)}`}>
                    <span className="material-icons text-sm">description</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{report.title}</p>
                    <p className="text-sm text-gray-600">
                      {report.createdAt?.toDate?.()?.toLocaleDateString() || 'No date'}
                      {report.notes && ` • ${report.notes.slice(0, 20)}...`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="hover:text-blue-700"
                    style={{ color: 'hsl(207, 90%, 54%)' }}
                    onClick={() => handleViewReport(report.fileURL)}
                  >
                    <span className="material-icons">visibility</span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-gray-600 hover:text-gray-800"
                    onClick={() => handleDownloadReport(report.fileURL, report.title)}
                  >
                    <span className="material-icons">download</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700">
                    <span className="material-icons">psychology</span>
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentReports;
