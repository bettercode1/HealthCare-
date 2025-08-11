import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import FileViewer from '@/components/ui/file-viewer';
import { useFirestore } from '@/hooks/useFirestore';
import { useAuth } from '@/contexts/AuthContext';
import { formatDateAsMonthYear } from '@/lib/utils';

interface Report {
  id: string;
  userId: string;
  title: string;
  fileUrl: string;
  reportType: string;
  labName?: string;
  doctorName?: string;
  uploadedAt?: any;
  status?: string;
  reminderNeeded?: boolean;
  validTill?: number;
  analysis?: any;
  notes?: string;
  createdAt?: any;
}

const RecentReports: React.FC = () => {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const [showFileViewer, setShowFileViewer] = useState(false);
  const [selectedReportForViewing, setSelectedReportForViewing] = useState<Report | null>(null);
  
  const { data: reports } = useFirestore<Report>('reports',
    currentUser?.uid ? [{ field: 'userId', operator: '==', value: currentUser.uid }] : undefined
  );

  const getReportColor = (reportType?: string) => {
    if (!reportType) return 'bg-gray-100 text-gray-600 border-gray-200';
    
    switch (reportType.toLowerCase()) {
      case 'bloodtest':
      case 'blood':
        return 'bg-red-100 text-red-600 border-red-200';
      case 'xray':
      case 'x-ray':
        return 'bg-blue-100 text-blue-600 border-blue-200';
      case 'mri':
        return 'bg-purple-100 text-purple-600 border-purple-200';
      case 'ecg':
        return 'bg-green-100 text-green-600 border-green-200';
      case 'urinetest':
      case 'urine':
        return 'bg-yellow-100 text-yellow-600 border-yellow-200';
      case 'scan':
        return 'bg-indigo-100 text-indigo-600 border-indigo-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getReportIcon = (reportType?: string) => {
    if (!reportType) return '📄';
    
    switch (reportType.toLowerCase()) {
      case 'bloodtest':
      case 'blood':
        return '🩸';
      case 'xray':
      case 'x-ray':
        return '📷';
      case 'mri':
        return '🧠';
      case 'ecg':
        return '💓';
      case 'urinetest':
      case 'urine':
        return '🧪';
      case 'scan':
        return '🔍';
      default:
        return '📄';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'expired':
        return <Badge className="bg-red-100 text-red-800">Expired</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };

  const handleViewReport = (report: Report) => {
    setSelectedReportForViewing(report);
    setShowFileViewer(true);
  };

  const handleDownloadReport = (fileUrl: string, title: string) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = title;
    link.click();
  };

  const handleAnalyzeReport = (report: Report) => {
    // This would typically open an analysis modal or navigate to analysis page
    console.log('Analyzing report:', report.title);
  };

  // Sort reports by upload date (most recent first)
  const sortedReports = reports
    .sort((a, b) => {
      const dateA = a.uploadedAt?.toDate?.() || a.createdAt?.toDate?.() || new Date(0);
      const dateB = b.uploadedAt?.toDate?.() || b.createdAt?.toDate?.() || new Date(0);
      return dateB.getTime() - dateA.getTime();
    })
    .slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold text-gray-900">{t('recentReports')}</CardTitle>
          <Button className="text-white hover:bg-blue-700" style={{ backgroundColor: 'hsl(207, 90%, 54%)' }}>
            <span className="material-icons mr-2 text-sm">upload</span>
            {t('uploadReport')}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedReports.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-4xl mb-2">📄</div>
              <p className="text-gray-500">{t('noReportsYet')}</p>
              <p className="text-sm text-gray-400 mt-1">{t('uploadFirstReport')}</p>
            </div>
          ) : (
            sortedReports.map((report) => (
              <div 
                key={report.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getReportColor(report.reportType)} border`}>
                    <span className="text-lg">{getReportIcon(report.reportType)}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="font-medium text-gray-900">{report.title}</p>
                      {report.status && getStatusBadge(report.status)}
                      {report.reminderNeeded && (
                        <Badge className="bg-orange-100 text-orange-800">Reminder</Badge>
                      )}
                    </div>
                                         <div className="text-sm text-gray-600 space-y-1">
                       {report.labName && <p>{t('labName')}: {report.labName}</p>}
                       {report.doctorName && <p>{t('doctorName')}: {report.doctorName}</p>}
                       <p>
                         {t('uploaded')}: {formatDateAsMonthYear(report.uploadedAt?.toDate?.() || report.createdAt?.toDate?.())}
                         {report.validTill && ` • ${t('validFor')} ${report.validTill} ${t('months')}`}
                       </p>
                      {report.analysis?.summary?.overallStatus && (
                                                 <p className={`font-medium ${
                           report.analysis.summary.overallStatus === 'healthy' ? 'text-green-600' :
                           report.analysis.summary.overallStatus === 'critical' ? 'text-red-600' :
                           'text-yellow-600'
                         }`}>
                           {t('status')}: {t(report.analysis.summary.overallStatus)}
                         </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="hover:text-blue-700"
                    style={{ color: 'hsl(207, 90%, 54%)' }}
                    onClick={() => handleViewReport(report)}
                                         title={t('view')}
                  >
                    <span className="material-icons">visibility</span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-gray-600 hover:text-gray-800"
                    onClick={() => handleDownloadReport(report.fileUrl, report.title)}
                                         title={t('download')}
                  >
                    <span className="material-icons">download</span>
                  </Button>
                  {report.analysis && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-green-600 hover:text-green-700"
                      onClick={() => handleAnalyzeReport(report)}
                      title={t('analysis')}
                    >
                      <span className="material-icons">psychology</span>
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
        
        {sortedReports.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
                         <Button 
               variant="link" 
               className="w-full text-center p-0 h-auto hover:text-blue-700" 
               style={{ color: 'hsl(207, 90%, 54%)' }}
             >
               {t('viewAllReports')} →
             </Button>
          </div>
        )}
      </CardContent>

      {/* File Viewer Modal */}
      {selectedReportForViewing && (
        <FileViewer
          isOpen={showFileViewer}
          onClose={() => {
            setShowFileViewer(false);
            setSelectedReportForViewing(null);
          }}
          fileUrl={selectedReportForViewing.fileUrl}
          fileName={selectedReportForViewing.title}
          fileType={selectedReportForViewing.fileType}
        />
      )}
    </Card>
  );
};

export default RecentReports;
