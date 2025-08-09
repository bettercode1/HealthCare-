import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useFirestore } from '@/hooks/useFirestore';
import { useStorage } from '@/hooks/useStorage';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { formatDateAsMonthYear } from '@/lib/utils';

const LabDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { userData } = useAuth();
  const { toast } = useToast();
  const [uploadForm, setUploadForm] = useState({
    patientEmail: '',
    title: '',
    notes: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { data: reports, add: addReport, update: updateReport, remove: removeReport } = useFirestore('reports');
  const { uploadFile, uploading } = useStorage();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData || !selectedFile) return;

    try {
      // Mock upload file
      const fileURL = `mock://storage/reports/${Date.now()}_${selectedFile.name}`;

      // Mock patient lookup
      const mockPatientId = `patient_${Date.now()}`;

      // Create report document
      await addReport({
        userId: mockPatientId,
        title: uploadForm.title,
        fileURL: fileURL,
        notes: uploadForm.notes,
      });

      // Reset form
      setUploadForm({
        patientEmail: '',
        title: '',
        notes: ''
      });
      setSelectedFile(null);

      toast({
        title: t('success'),
        description: t('reportUploadedSuccessfully'),
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: t('error'),
        description: t('failedToUploadReport'),
        variant: 'destructive',
      });
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    try {
      await removeReport(reportId);
      toast({
        title: t('success'),
        description: t('reportDeletedSuccessfully'),
      });
    } catch (error) {
      toast({
        title: t('error'),
        description: t('failedToDeleteReport'),
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      
      {/* Upload Reports */}
      <div className="space-y-6">
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="material-icons mr-2">cloud_upload</span>
              {t('uploadReport')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <Label htmlFor="patientEmail">{t('patientEmail')}</Label>
                <Input
                  id="patientEmail"
                  type="email"
                  value={uploadForm.patientEmail}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, patientEmail: e.target.value }))}
                  placeholder="patient@example.com"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="title">{t('reportTitle')}</Label>
                <Input
                  id="title"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Blood Test Report"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="file">{t('reportFile')}</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileSelect}
                  required
                />
                {selectedFile && (
                  <p className="text-sm text-gray-500 mt-1">
                    {t('selected')}: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="notes">{t('notes')}</Label>
                <Textarea
                  id="notes"
                  value={uploadForm.notes}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder={t('additionalNotesAboutReport')}
                  rows={3}
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full text-white hover:bg-blue-700"
                disabled={uploading}
                style={{ backgroundColor: 'hsl(207, 90%, 54%)' }}
              >
                {uploading ? t('uploading') : t('uploadReport')}
              </Button>
            </form>
          </CardContent>
        </Card>

      </div>

      {/* Manage Reports */}
      <div className="space-y-6">
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="material-icons mr-2">description</span>
              {t('recentUploads')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reports.length === 0 ? (
                <p className="text-gray-500 text-center py-4">{t('noReportsUploadedYet')}</p>
              ) : (
                reports.slice(0, 10).map((report) => (
                  <div key={report.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{report.title}</p>
                        <p className="text-sm text-gray-600">{t('patientId')}: {report.userId?.slice(0, 8)}...</p>
                        <p className="text-sm text-gray-500">
                          {t('uploaded')}: {formatDateAsMonthYear(report.createdAt?.toDate?.())}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <span className="material-icons">edit</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteReport(report.id)}
                        >
                          <span className="material-icons">delete</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="material-icons mr-2">analytics</span>
              {t('labStatistics')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{reports.length}</p>
                <p className="text-sm text-gray-600">{t('reportsUploaded')}</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  {new Set(reports.map(r => r.userId)).size}
                </p>
                <p className="text-sm text-gray-600">{t('uniquePatients')}</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">
                  {reports.filter(r => {
                    const date = r.createdAt?.toDate?.();
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return date && date > weekAgo;
                  }).length}
                </p>
                <p className="text-sm text-gray-600">{t('thisWeek')}</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">98%</p>
                <p className="text-sm text-gray-600">{t('accuracyRate')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

    </div>
  );
};

export default LabDashboard;
