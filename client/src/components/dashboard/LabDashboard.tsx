import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useFirestore } from '@/hooks/useFirestore';
import { useStorage } from '@/hooks/useStorage';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loading } from '@/components/ui/loading';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const LabDashboard: React.FC = () => {
  const { userData } = useAuth();
  const { toast } = useToast();
  const [uploadForm, setUploadForm] = useState({
    patientEmail: '',
    title: '',
    notes: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: reports, add: addReport, update: updateReport, remove: removeReport, loading: reportsLoading } = useFirestore('reports');
  const { uploadFile, uploading } = useStorage();

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
    if (!userData || !selectedFile) return;

    setIsSubmitting(true);

    try {
      // Find patient by email
      const patientsQuery = query(
        collection(db, 'users'),
        where('email', '==', uploadForm.patientEmail)
      );
      const patientsSnapshot = await getDocs(patientsQuery);

      if (patientsSnapshot.empty) {
        toast({
          title: 'Error',
          description: 'Patient not found with this email',
          variant: 'destructive',
        });
        return;
      }

      const patientId = patientsSnapshot.docs[0].id;

      // Upload file to Firebase Storage
      const fileURL = await uploadFile(selectedFile, 'reports');

      // Create report document
      await addReport({
        userId: patientId,
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
      
      // Reset file input
      const fileInput = document.getElementById('file') as HTMLInputElement;
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

  const handleDeleteReport = async (reportId: string) => {
    if (!confirm('Are you sure you want to delete this report?')) return;
    
    try {
      await removeReport(reportId);
      toast({
        title: 'Success',
        description: 'Report deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete report',
        variant: 'destructive',
      });
    }
  };

  // Calculate statistics
  const totalReports = reports.length;
  const uniquePatients = new Set(reports.map(r => r.userId)).size;
  const weekAgoDate = new Date();
  weekAgoDate.setDate(weekAgoDate.getDate() - 7);
  const reportsThisWeek = reports.filter(r => {
    const reportDate = r.createdAt?.toDate?.();
    return reportDate && reportDate > weekAgoDate;
  }).length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      
      {/* Upload Reports */}
      <div className="space-y-6">
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="material-icons mr-2">cloud_upload</span>
              Upload Report
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <Label htmlFor="patientEmail">Patient Email *</Label>
                <Input
                  id="patientEmail"
                  type="email"
                  value={uploadForm.patientEmail}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, patientEmail: e.target.value }))}
                  placeholder="patient@example.com"
                  required
                  className="focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <Label htmlFor="title">Report Title *</Label>
                <Input
                  id="title"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Blood Test Report"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="file">Report File * (PDF, JPG, PNG - Max 10MB)</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileSelect}
                  required
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {selectedFile && (
                  <p className="text-sm text-gray-500 mt-1">
                    Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={uploadForm.notes}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes about the report"
                  rows={3}
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full text-white hover:bg-blue-700"
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
            </form>
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="material-icons mr-2">analytics</span>
              Lab Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{totalReports}</p>
                <p className="text-sm text-gray-600">Reports Uploaded</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{uniquePatients}</p>
                <p className="text-sm text-gray-600">Unique Patients</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">{reportsThisWeek}</p>
                <p className="text-sm text-gray-600">This Week</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">98%</p>
                <p className="text-sm text-gray-600">Accuracy Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Manage Reports */}
      <div className="space-y-6">
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="material-icons mr-2">description</span>
              Recent Uploads ({totalReports})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {reportsLoading ? (
                <Loading text="Loading reports..." />
              ) : reports.length === 0 ? (
                <div className="text-center py-8">
                  <span className="material-icons text-gray-400 text-4xl mb-2">description</span>
                  <p className="text-gray-500">No reports uploaded yet</p>
                  <p className="text-sm text-gray-400">Upload your first report to get started</p>
                </div>
              ) : (
                reports
                  .sort((a, b) => {
                    const dateA = a.createdAt?.toDate?.() || new Date(0);
                    const dateB = b.createdAt?.toDate?.() || new Date(0);
                    return dateB - dateA;
                  })
                  .slice(0, 10)
                  .map((report) => (
                    <div key={report.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{report.title}</p>
                          <p className="text-sm text-gray-600">Patient ID: {report.userId?.slice(0, 8)}...</p>
                          <p className="text-sm text-gray-500">
                            Uploaded: {report.createdAt?.toDate?.()?.toLocaleDateString() || 'No date'}
                          </p>
                          {report.notes && (
                            <p className="text-sm text-gray-500 mt-1">{report.notes}</p>
                          )}
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.open(report.fileURL, '_blank')}
                            title="View Report"
                          >
                            <span className="material-icons">visibility</span>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteReport(report.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Delete Report"
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

      </div>

    </div>
  );
};

export default LabDashboard;
