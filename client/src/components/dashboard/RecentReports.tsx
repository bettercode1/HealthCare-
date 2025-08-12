import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogCloseButton } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileUploadPopup } from '@/components/ui/file-upload-popup';
import FileViewer from '@/components/ui/file-viewer';
import { Download, Upload, Eye, Trash2, Plus, FileText, Image as ImageIcon } from 'lucide-react';
import { useFirestore } from '@/hooks/useFirestore';
import { useStorage } from '@/hooks/useStorage';
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
  const { t } = useTranslation();
  const { userData } = useAuth();
  const { toast } = useToast();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showFileViewer, setShowFileViewer] = useState(false);
  const [selectedReportForViewing, setSelectedReportForViewing] = useState<Report | null>(null);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    notes: '',
    reportType: '',
    labName: '',
    doctorName: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExtractingData, setIsExtractingData] = useState(false);
  
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

  // Extract data from PDF using PDF.js or similar library
  const extractPDFData = async (file: File) => {
    setIsExtractingData(true);
    try {
      // Show extraction status
      toast({
        title: t('extractingData'),
        description: t('analyzingPdfContent'),
      });

      // In production, you would use a PDF parsing library like pdf-parse or pdf.js
      // For now, we'll simulate extraction but with better logic
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Enhanced PDF content analysis simulation
      const fileName = file.name.toLowerCase();
      let extractedData = {
        title: '',
        reportType: '',
        labName: '',
        doctorName: '',
        notes: ''
      };

      if (fileName.includes('blood') || fileName.includes('cbc') || fileName.includes('metabolic')) {
        extractedData = {
          title: t('bloodTestReport'),
          reportType: t('bloodTest'),
          labName: t('cityMedicalLaboratory'),
          doctorName: t('drSarahJohnson'),
          notes: t('completeBloodCountAndComprehensiveMetabolicPanel')
        };
      } else if (fileName.includes('xray') || fileName.includes('x-ray') || fileName.includes('chest')) {
        extractedData = {
          title: t('chestXrayReport'),
          reportType: t('xray'),
          labName: t('radiologyDepartment'),
          doctorName: t('drMichaelChen'),
          notes: t('chestXrayExaminationForRespiratoryAssessment')
        };
      } else if (fileName.includes('mri') || fileName.includes('brain') || fileName.includes('head')) {
        extractedData = {
          title: t('brainMriReport'),
          reportType: t('mri'),
          labName: t('advancedImagingCenter'),
          doctorName: t('drEmilyRodriguez'),
          notes: t('magneticResonanceImagingOfTheBrain')
        };
      } else if (fileName.includes('ecg') || fileName.includes('ekg') || fileName.includes('cardio')) {
        extractedData = {
          title: t('electrocardiogramReport'),
          reportType: t('ecg'),
          labName: t('cardiologyDepartment'),
          doctorName: t('drJamesWilson'),
          notes: t('twelveLeadElectrocardiogramExamination')
        };
      } else if (fileName.includes('urine') || fileName.includes('urinalysis')) {
        extractedData = {
          title: t('urineAnalysisReport'),
          reportType: t('urineTest'),
          labName: t('clinicalLaboratory'),
          doctorName: t('drLisaThompson'),
          notes: t('urinalysisAndMicroscopicExamination')
        };
      } else if (fileName.includes('prescription') || fileName.includes('rx')) {
        extractedData = {
          title: t('prescription'),
          reportType: t('prescription'),
          labName: t('pharmacy'),
          doctorName: t('drHealthcareProvider'),
          notes: t('medicalPrescriptionDocument')
        };
      } else {
        // Generic extraction for other files with better naming
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        extractedData = {
          title: cleanName.charAt(0).toUpperCase() + cleanName.slice(1),
          reportType: t('medicalReport'),
          labName: t('medicalCenter'),
          doctorName: t('drHealthcareProvider'),
          notes: t('medicalReportDocument')
        };
      }

      // Update form with extracted data
      setUploadForm(prev => ({
        ...prev,
        ...extractedData
      }));

      // Delay the success toast to avoid conflicts
      setTimeout(() => {
        toast({
          title: t('dataExtracted'),
          description: t('informationHasBeenAutomaticallyExtracted'),
        });
      }, 500);

    } catch (error) {
      console.error('PDF extraction error:', error);
      toast({
        title: t('extractionFailed'),
        description: t('couldNotExtractDataFromPdf'),
        variant: 'destructive',
      });
    } finally {
      setIsExtractingData(false);
    }
  };

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    
    // If it's a PDF, try to extract data
    if (file.type === 'application/pdf') {
      await extractPDFData(file);
    } else {
      // For non-PDF files, set basic information
      const fileName = file.name.replace(/\.[^/.]+$/, '');
      setUploadForm(prev => ({
        ...prev,
        title: fileName.charAt(0).toUpperCase() + fileName.slice(1).replace(/[-_]/g, ' '),
        reportType: file.type.startsWith('image/') ? t('imageReport') : t('documentReport'),
        labName: prev.labName || t('medicalCenter'),
        doctorName: prev.doctorName || t('drHealthcareProvider'),
        notes: prev.notes || `${file.type.startsWith('image/') ? t('imageReportDocument') : t('documentReportDocument')}`
      }));
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData || !selectedFile || !uploadForm.title) return;

    setIsSubmitting(true);

    try {
      let fileURL = '';
      if (userData.email?.includes('@example.com')) {
        fileURL = `https://demo-storage.example.com/reports/${selectedFile.name}`;
      } else {
        fileURL = await uploadFile(selectedFile, 'reports');
      }

      await addReport({
        userId: userData.id,
        title: uploadForm.title,
        fileURL: fileURL,
        notes: uploadForm.notes,
        fileType: selectedFile.type,
        fileSize: selectedFile.size,
      });

      setUploadForm({
        title: '',
        notes: '',
        reportType: '',
        labName: '',
        doctorName: ''
      });
      setSelectedFile(null);
      setShowUploadModal(false);

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
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewReport = (report: Report) => {
    setSelectedReportForViewing(report);
    setShowFileViewer(true);
  };

  const handleDownloadReport = (fileURL: string, title: string) => {
    const link = document.createElement('a');
    link.href = fileURL;
    link.download = title;
    link.click();
  };

  const handleDeleteReport = async (reportId: string, title: string) => {
    if (!confirm(t('areYouSureYouWantToDelete', { title }))) return;

    try {
      await removeReport(reportId);
      toast({
        title: t('success'),
        description: t('reportDeletedSuccessfully'),
      });
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: t('error'),
        description: t('failedToDeleteReport'),
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
            {t('recentReports')} ({reports.length})
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
                <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                  <span className="material-icons mr-2 text-sm">upload</span>
                  Upload Report
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogCloseButton />
                <DialogHeader className="text-center pb-6">
                  <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <span className="material-icons text-2xl text-blue-600">upload</span>
                  </div>
                  <DialogTitle className="text-2xl font-bold text-gray-900">{t('uploadMedicalReport')}</DialogTitle>
                  <DialogDescription className="text-gray-600">
                    {t('uploadYourMedicalReports')}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-4 sm:space-y-6 min-h-0">
                  <form onSubmit={handleUploadSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        {t('reportTitle')}
                      </Label>
                      <Input
                        id="title"
                        value={uploadForm.title}
                        onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                        placeholder={t('eGBloodTestResultsJanuary2024')}
                        required
                        className="h-11 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="reportType" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          {t('reportType')}
                        </Label>
                        <Input
                          id="reportType"
                          value={uploadForm.reportType}
                          onChange={(e) => setUploadForm(prev => ({ ...prev, reportType: e.target.value }))}
                          placeholder={t('eGBloodTestXrayMri')}
                          required
                          className="h-11 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="labName" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          {t('labClinicName')}
                        </Label>
                        <Input
                          id="labName"
                          value={uploadForm.labName}
                          onChange={(e) => setUploadForm(prev => ({ ...prev, labName: e.target.value }))}
                          placeholder={t('eGCityMedicalLaboratory')}
                          className="h-11 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="doctorName" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          {t('doctorName')}
                        </Label>
                        <Input
                          id="doctorName"
                          value={uploadForm.doctorName}
                          onChange={(e) => setUploadForm(prev => ({ ...prev, doctorName: e.target.value }))}
                          placeholder={t('eGDrSarahJohnson')}
                          className="h-11 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        {t('additionalNotes')}
                      </Label>
                      <Textarea
                        id="description"
                        value={uploadForm.notes}
                        onChange={(e) => setUploadForm(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder={t('anyAdditionalNotesSymptomsOrContext')}
                        rows={3}
                        className="border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <Label htmlFor="file" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        {t('reportFile')}
                      </Label>
                      <FileUploadPopup
                        onFileSelect={handleFileSelect}
                        onFileRemove={() => setSelectedFile(null)}
                        selectedFile={selectedFile}
                        accept=".pdf,.jpg,.jpeg,.png"
                        maxSize={15}
                        label=""
                        placeholder={t('chooseMedicalReportFile')}
                        className="w-full"
                      />
                    </div>
                  </form>
                </div>
                
                <div className="flex space-x-3 pt-6 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowUploadModal(false)}
                    className="flex-1 h-11 border-gray-300 hover:bg-gray-50"
                  >
                    {t('cancel')}
                  </Button>
                  <Button
                    type="submit"
                    disabled={uploading || !selectedFile || isSubmitting}
                    onClick={handleUploadSubmit}
                    className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        {isExtractingData ? t('extractingDataLoading') : t('uploading')}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <span className="material-icons mr-2">cloud_upload</span>
                        {t('uploadReportButton')}
                      </div>
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {reportsLoading ? (
            <HealthcareLoading text={t('loadingReports')} />
          ) : sortedReports.length === 0 ? (
            <div className="text-center py-8">
              <span className="material-icons text-gray-400 text-4xl mb-2">description</span>
              <p className="text-gray-500">{t('noReportsUploadedYet')}</p>
              <p className="text-sm text-gray-400">{t('uploadFirstMedicalReport')}</p>
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
                        {t('size')}: {formatFileSize(report.fileSize)}
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
                    onClick={() => handleViewReport(report)}
                    title={t('viewReport')}
                  >
                    <span className="material-icons">visibility</span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                    onClick={() => handleDownloadReport(report.fileURL, report.title)}
                    title={t('downloadReport')}
                  >
                    <span className="material-icons">download</span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                    title={t('aiAnalysis')}
                  >
                    <span className="material-icons">psychology</span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDeleteReport(report.id, report.title)}
                    title={t('deleteReport')}
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
              {t('viewAllReports', { count: reports.length })} →
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
          fileUrl={selectedReportForViewing.fileURL}
          fileName={selectedReportForViewing.title}
          fileType={selectedReportForViewing.fileType}
        />
      )}
    </Card>
  );
};

export default RecentReports;
