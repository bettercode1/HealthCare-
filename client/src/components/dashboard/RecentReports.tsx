import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useFirestore } from '@/hooks/useFirestore';
import { useStorage } from '@/hooks/useStorage';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loading, HealthcareLoading } from '@/components/ui/loading';
import { formatDateAsMonthYear } from '@/lib/utils';

interface Report {
  id: string;
  userId: string;
  title: string;
  fileURL: string;
  notes?: string;
  createdAt?: any;
  fileType?: string;
  fileSize?: number;
}

const RecentReports: React.FC = () => {
  const { userData } = useAuth();
  const { toast } = useToast();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    notes: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { data: reports, add: addReport, remove: removeReport, loading: reportsLoading, refresh } = useFirestore<Report>('reports',
    userData ? [{ field: 'userId', operator: '==', value: userData.id }] : undefined
  );

  const { uploadFile, uploading } = useStorage();

  const getReportColor = (title: string) => {
    const titleLower = title.toLowerCase();
    if (titleLower.includes('blood')) return 'bg-red-100 text-red-600';
    if (titleLower.includes('xray') || titleLower.includes('x-ray')) return 'bg-blue-100 text-blue-600';
    if (titleLower.includes('mri')) return 'bg-purple-100 text-purple-600';
    if (titleLower.includes('scan')) return 'bg-green-100 text-green-600';
    if (titleLower.includes('urine')) return 'bg-yellow-100 text-yellow-600';
    if (titleLower.includes('echo')) return 'bg-indigo-100 text-indigo-600';
    return 'bg-gray-100 text-gray-600';
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: 'Error',
          description: 'File size must be less than 10MB',
          variant: 'destructive',
        });
        return;
      }
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: 'Error',
          description: 'Only PDF, JPG, and PNG files are allowed',
          variant: 'destructive',
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData || !selectedFile || !uploadForm.title) return;

    setIsSubmitting(true);

    try {
      // For demo users, simulate file upload
      let fileURL = '';
      if (userData.email?.includes('@example.com')) {
        // Simulate file upload for demo
        fileURL = `https://demo-storage.example.com/reports/${selectedFile.name}`;
      } else {
        // Mock file upload
        fileURL = await uploadFile(selectedFile, 'reports');
      }

      // Create report document
      await addReport({
        userId: userData.id,
        title: uploadForm.title,
        fileURL: fileURL,
        notes: uploadForm.notes,
        fileType: selectedFile.type,
        fileSize: selectedFile.size,
      });

      // Reset form
      setUploadForm({
        title: '',
        notes: ''
      });
      setSelectedFile(null);
      setShowUploadModal(false);
      
      // Reset file input
      const fileInput = document.getElementById('upload-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      toast({
        title: 'Success',
        description: 'Report uploaded successfully',
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload report',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
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

  const handleDeleteReport = async (reportId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      await removeReport(reportId);
      toast({
        title: 'Success',
        description: 'Report deleted successfully',
      });
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete report',
        variant: 'destructive',
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Sort reports by creation date (newest first)
  const sortedReports = reports.sort((a, b) => {
    const dateA = a.createdAt?.toDate?.() || new Date(0);
    const dateB = b.createdAt?.toDate?.() || new Date(0);
    return dateB - dateA;
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold text-gray-900">
            Recent Reports ({reports.length})
          </CardTitle>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={refresh}
              className="text-blue-600 hover:text-blue-700"
            >
              <span className="material-icons text-sm">refresh</span>
            </Button>
            <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
              <DialogTrigger asChild>
                <Button className="text-white hover:bg-blue-700" style={{ backgroundColor: 'hsl(207, 90%, 54%)' }}>
                  <span className="material-icons mr-2 text-sm">upload</span>
                  Upload Report
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Upload Medical Report</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleUploadSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Report Title *</Label>
                    <Input
                      id="title"
                      value={uploadForm.title}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., Blood Test Report"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="upload-file">Report File * (PDF, JPG, PNG - Max 10MB)</Label>
                    <Input
                      id="upload-file"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileSelect}
                      required
                      className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {selectedFile && (
                      <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">
                          <strong>Selected:</strong> {selectedFile.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          Size: {formatFileSize(selectedFile.size)} | Type: {selectedFile.type}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      value={uploadForm.notes}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Additional notes about this report"
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button 
                      type="submit" 
                      className="flex-1 text-white hover:bg-blue-700"
                      disabled={isSubmitting || uploading}
                      style={{ backgroundColor: 'hsl(207, 90%, 54%)' }}
                    >
                      {isSubmitting || uploading ? (
                        <div className="flex items-center">
                          <Loading size="sm" />
                          <span className="ml-2">Uploading...</span>
                        </div>
                      ) : (
                        'Upload Report'
                      )}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowUploadModal(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {reportsLoading ? (
            <HealthcareLoading text="Loading reports..." />
          ) : sortedReports.length === 0 ? (
            <div className="text-center py-8">
              <span className="material-icons text-gray-400 text-4xl mb-2">description</span>
              <p className="text-gray-500">No reports uploaded yet</p>
              <p className="text-sm text-gray-400">Upload your first medical report to get started</p>
            </div>
          ) : (
            sortedReports.slice(0, 10).map((report) => (
              <div 
                key={report.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getReportColor(report.title)}`}>
                    <span className="material-icons text-sm">description</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{report.title}</p>
                    <p className="text-sm text-gray-600">
                      {formatDateAsMonthYear(report.createdAt?.toDate?.())}
                      {report.createdAt?.toDate?.() && (
                        <span> • {report.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      )}
                    </p>
                    {report.fileSize && (
                      <p className="text-xs text-gray-500">
                        Size: {formatFileSize(report.fileSize)}
                      </p>
                    )}
                    {report.notes && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{report.notes}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="hover:text-blue-700 hover:bg-blue-50"
                    style={{ color: 'hsl(207, 90%, 54%)' }}
                    onClick={() => handleViewReport(report.fileURL)}
                    title="View Report"
                  >
                    <span className="material-icons">visibility</span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                    onClick={() => handleDownloadReport(report.fileURL, report.title)}
                    title="Download Report"
                  >
                    <span className="material-icons">download</span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                    title="AI Analysis"
                  >
                    <span className="material-icons">psychology</span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDeleteReport(report.id, report.title)}
                    title="Delete Report"
                  >
                    <span className="material-icons">delete</span>
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
        
        {sortedReports.length > 10 && (
          <div className="mt-4 pt-4 border-t border-gray-200 text-center">
            <Button variant="link" className="p-0 h-auto hover:text-blue-700" style={{ color: 'hsl(207, 90%, 54%)' }}>
              View All {reports.length} Reports →
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentReports;
