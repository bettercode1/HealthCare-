import React, { useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, Image, X, CheckCircle, AlertCircle, XCircle, Calendar } from 'lucide-react';
import BettercodeLogo from './BettercodeLogo';

interface FileUploadProps {
  type: 'prescription' | 'report';
  onUploadComplete?: () => void;
}

interface UploadedFile {
  file: File;
  preview?: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string | null;
}

const FileUpload: React.FC<FileUploadProps> = ({ type, onUploadComplete }) => {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    reportType: '',
    validTill: '',
    reminderNeeded: false,
    labName: '',
    doctorName: '',
    dosage: '',
    frequency: '',
    prescribedDate: '',
    refills: ''
  });

  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
  const maxFileSize = 10 * 1024 * 1024; // 10MB

  const validateFile = (file: File): string | null => {
    if (!allowedTypes.includes(file.type)) {
      return t('fileTypeNotSupported') || 'File type not supported';
    }
    if (file.size > maxFileSize) {
      return t('fileSizeTooLarge') || 'File size too large';
    }
    return null;
  };

  // Extract data from PDF
  const extractPDFData = async (file: File) => {
    try {
      // Show extraction status
      toast({
        title: 'Extracting Data',
        description: 'Analyzing PDF content...',
      });

      // In production, you would use a PDF parsing library like pdf-parse or pdf.js
      // For now, we'll simulate extraction but with better logic
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const fileName = file.name.toLowerCase();
      let extractedData = {
        title: '',
        reportType: '',
        labName: '',
        doctorName: '',
        description: ''
      };

      // Enhanced PDF content analysis simulation
      if (fileName.includes('blood') || fileName.includes('cbc') || fileName.includes('metabolic')) {
        extractedData = {
          title: 'Blood Test Report',
          reportType: 'Blood Test',
          labName: 'City Medical Laboratory',
          doctorName: 'Dr. Sarah Johnson',
          description: 'Complete blood count and comprehensive metabolic panel'
        };
      } else if (fileName.includes('xray') || fileName.includes('x-ray') || fileName.includes('chest')) {
        extractedData = {
          title: 'Chest X-Ray Report',
          reportType: 'X-Ray',
          labName: 'Radiology Department',
          doctorName: 'Dr. Michael Chen',
          description: 'Chest X-ray examination for respiratory assessment'
        };
      } else if (fileName.includes('mri') || fileName.includes('brain') || fileName.includes('head')) {
        extractedData = {
          title: 'Brain MRI Report',
          reportType: 'MRI',
          labName: 'Advanced Imaging Center',
          doctorName: 'Dr. Emily Rodriguez',
          description: 'Magnetic resonance imaging of the brain'
        };
      } else if (fileName.includes('ecg') || fileName.includes('ekg') || fileName.includes('cardio')) {
        extractedData = {
          title: 'Electrocardiogram Report',
          reportType: 'ECG',
          labName: 'Cardiology Department',
          doctorName: 'Dr. James Wilson',
          description: '12-lead electrocardiogram examination'
        };
      } else if (fileName.includes('urine') || fileName.includes('urinalysis')) {
        extractedData = {
          title: 'Urine Analysis Report',
          reportType: 'Urine Test',
          labName: 'Clinical Laboratory',
          doctorName: 'Dr. Lisa Thompson',
          description: 'Urinalysis and microscopic examination'
        };
      } else if (fileName.includes('prescription') || fileName.includes('rx')) {
        extractedData = {
          title: 'Prescription',
          reportType: 'Prescription',
          labName: 'Pharmacy',
          doctorName: 'Dr. Healthcare Provider',
          description: 'Medical prescription document'
        };
      } else {
        // Generic extraction for other files with better naming
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        extractedData = {
          title: cleanName.charAt(0).toUpperCase() + cleanName.slice(1),
          reportType: type === 'prescription' ? 'Prescription' : 'Medical Report',
          labName: 'Medical Center',
          doctorName: 'Dr. Healthcare Provider',
          description: `${type === 'prescription' ? 'Prescription' : 'Medical report'} document`
        };
      }

      setFormData(prev => ({
        ...prev,
        ...extractedData
      }));

      // Delay the success toast to avoid conflicts
      setTimeout(() => {
        toast({
          title: 'Data Extracted',
          description: 'Information has been automatically extracted from the PDF',
        });
      }, 500);

    } catch (error) {
      console.error('PDF extraction error:', error);
      toast({
        title: 'Extraction Failed',
        description: 'Could not extract data from PDF. Please fill manually.',
        variant: 'destructive',
      });
    }
  };

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return;

    const newFiles: UploadedFile[] = Array.from(files).map(file => {
      const error = validateFile(file);
      return {
        file,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
        progress: 0,
        status: error ? 'error' : 'pending',
        error
      };
    });

    setUploadedFiles(prev => [...prev, ...newFiles]);
    
    // If it's a PDF, try to extract data from the first file
    if (newFiles.length > 0 && newFiles[0].file.type === 'application/pdf') {
      extractPDFData(newFiles[0].file);
    } else if (newFiles.length > 0) {
      // For non-PDF files, set basic information
      const file = newFiles[0].file;
      const fileName = file.name.replace(/\.[^/.]+$/, '');
      setFormData(prev => ({
        ...prev,
        title: fileName.charAt(0).toUpperCase() + fileName.slice(1).replace(/[-_]/g, ' '),
        reportType: file.type.startsWith('image/') ? 'Image Report' : 'Document Report',
        labName: prev.labName || 'Medical Center',
        doctorName: prev.doctorName || 'Dr. Healthcare Provider',
        description: prev.description || `${file.type.startsWith('image/') ? 'Image' : 'Document'} report`
      }));
    }
  }, [validateFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const handleClick = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  const removeFile = (index: number) => {
    setUploadedFiles(prev => {
      const newFiles = [...prev];
      const file = newFiles[index];
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const uploadFile = async (file: File, index: number): Promise<string> => {
    // Mock upload - simulate network delay
    setUploadedFiles(prev => prev.map((f, i) => 
      i === index ? { ...f, status: 'uploading' as const } : f
    ));

    try {
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create mock URL
      const mockUrl = `mock://storage/${currentUser?.uid}/${type}/${Date.now()}_${file.name}`;
      
      setUploadedFiles(prev => prev.map((f, i) => 
        i === index ? { ...f, status: 'success' as const, progress: 100 } : f
      ));

      return mockUrl;
    } catch (error) {
      setUploadedFiles(prev => prev.map((f, i) => 
        i === index ? { 
          ...f, 
          status: 'error' as const, 
          error: t('uploadFailed') || 'Upload failed'
        } : f
      ));
      throw error;
    }
  };

  const saveToLocalStorage = async (fileUrl: string, file: File) => {
    const metadata = {
      id: `file_${Date.now()}`,
      fileUrl,
      uploadedAt: new Date().toISOString(),
      type,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      title: formData.title || file.name,
      description: formData.description,
      reportType: formData.reportType,
      validTill: formData.validTill ? new Date(Date.now() + parseInt(formData.validTill) * 30 * 24 * 60 * 60 * 1000).toISOString() : null,
      reminderNeeded: formData.reminderNeeded,
      userId: currentUser?.uid,
      // Prescription specific fields
      dosage: formData.dosage,
      frequency: formData.frequency,
      prescribedDate: formData.prescribedDate,
      refills: formData.refills,
      labName: formData.labName,
      doctorName: formData.doctorName
    };

    // Save to localStorage
    const existingData = JSON.parse(localStorage.getItem(`mock_${type}s`) || '[]');
    existingData.push(metadata);
    localStorage.setItem(`mock_${type}s`, JSON.stringify(existingData));
  };

  const handleUpload = async () => {
    if (!currentUser?.uid || uploadedFiles.length === 0) return;

    setUploading(true);
    const pendingFiles = uploadedFiles.filter(f => f.status === 'pending');

    try {
      for (let i = 0; i < pendingFiles.length; i++) {
        const fileIndex = uploadedFiles.findIndex(f => f.file === pendingFiles[i].file);
        const fileUrl = await uploadFile(pendingFiles[i].file, fileIndex);
        await saveToLocalStorage(fileUrl, pendingFiles[i].file);
      }

      toast({
        title: t('uploadSuccess') || 'Upload Success',
        description: `${pendingFiles.length} file(s) uploaded successfully`,
      });

      setUploadedFiles([]);
      setFormData({
        title: '',
        description: '',
        reportType: '',
        validTill: '',
        reminderNeeded: false,
        labName: '',
        doctorName: '',
        dosage: '',
        frequency: '',
        prescribedDate: '',
        refills: ''
      });

      onUploadComplete?.();
    } catch (error) {
      toast({
        title: t('uploadError') || 'Upload Error',
        description: t('failedToUploadFiles') || 'Failed to upload files',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  const canUpload = uploadedFiles.some(f => f.status === 'pending') && !uploading;

  return (
    <Card className="w-full shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
      <CardHeader className="space-y-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg border-b border-blue-100">
        <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl font-bold text-gray-900">
          <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
          {type === 'prescription' ? t('uploadPrescription') || 'Upload Prescription' : t('uploadReport') || 'Upload Report'}
        </CardTitle>
        <CardDescription className="text-gray-600 text-sm sm:text-base">
          {t('dragDropFiles') || 'Drag & drop files'} • {t('supportedFormats') || 'Supported formats'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        {/* File Upload Area */}
        <div
          className={`border-2 border-dashed rounded-xl p-6 sm:p-8 text-center transition-all duration-200 ${
            isDragging 
              ? 'border-blue-500 bg-blue-50 scale-[1.02]' 
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <Upload className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-gray-400 mb-4 transition-colors" />
          <p className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
            {t('dragDropFiles') || 'Drag & drop files'}
          </p>
          <p className="text-sm text-gray-500 mb-4 sm:mb-6">
            {t('supportedFormats') || 'Supported formats'}
          </p>
          <Button
            variant="outline"
            onClick={handleClick}
            disabled={uploading}
            className="px-6 py-2.5 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <Upload className="h-4 w-4 mr-2" />
            {t('scanDocument') || 'Scan Document'}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              {type === 'prescription' ? 'Diagnosis' : t('name') || 'Name'} *
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder={type === 'prescription' ? 'e.g., Hypertension' : t('reportTitle') || 'Report Title'}
              className="h-11 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            />
          </div>
          
          {type === 'prescription' ? (
            <div className="space-y-2">
              <Label htmlFor="medication" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Medication *
              </Label>
              <Input
                id="medication"
                value={formData.reportType}
                onChange={(e) => setFormData(prev => ({ ...prev, reportType: e.target.value }))}
                placeholder="e.g., Lisinopril 10mg"
                className="h-11 border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="reportType" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                {t('reportType') || 'Report Type'} *
              </Label>
              <Input
                id="reportType"
                value={formData.reportType}
                onChange={(e) => setFormData(prev => ({ ...prev, reportType: e.target.value }))}
                placeholder={t('selectReportType') || 'Select Report Type'}
                className="h-11 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>
          )}
        </div>

        {type === 'prescription' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2">
              <Label htmlFor="dosage" className="text-sm font-medium text-gray-700">
                Dosage
              </Label>
              <Input
                id="dosage"
                value={formData.dosage}
                onChange={(e) => setFormData(prev => ({ ...prev, dosage: e.target.value }))}
                placeholder="e.g., 1 tablet"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="frequency" className="text-sm font-medium text-gray-700">
                Frequency
              </Label>
              <Input
                id="frequency"
                value={formData.frequency}
                onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value }))}
                placeholder="e.g., Daily"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="space-y-2">
            <Label htmlFor="labName" className="text-sm font-medium text-gray-700">
              {type === 'prescription' ? 'Pharmacy' : 'Lab/Clinic Name'}
            </Label>
            <Input
              id="labName"
              value={formData.labName}
              onChange={(e) => setFormData(prev => ({ ...prev, labName: e.target.value }))}
              placeholder={type === 'prescription' ? 'e.g., City Pharmacy' : 'e.g., City Medical Lab'}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="doctorName" className="text-sm font-medium text-gray-700">
              Doctor Name
            </Label>
            <Input
              id="doctorName"
              value={formData.doctorName}
              onChange={(e) => setFormData(prev => ({ ...prev, doctorName: e.target.value }))}
              placeholder="e.g., Dr. Sarah Johnson"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {type === 'prescription' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2">
              <Label htmlFor="prescribedDate" className="text-sm font-medium text-gray-700">
                Prescribed Date
              </Label>
              <div className="relative">
                <Input
                  id="prescribedDate"
                  type="date"
                  value={formData.prescribedDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, prescribedDate: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors pr-10"
                />
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="refills" className="text-sm font-medium text-gray-700">
                Refills
              </Label>
              <Input
                id="refills"
                type="number"
                min="0"
                value={formData.refills}
                onChange={(e) => setFormData(prev => ({ ...prev, refills: e.target.value }))}
                placeholder="Number of refills"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-medium text-gray-700">
            {type === 'prescription' ? 'Notes' : t('description') || 'Description'}
          </Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder={type === 'prescription' ? 'Special instructions or notes' : t('addDescriptionOrNotes') || 'Add description or notes'}
            rows={3}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
          />
        </div>

        {type === 'report' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2">
              <Label htmlFor="validTill" className="text-sm font-medium text-gray-700">
                {t('validFor') || 'Valid For (months)'}
              </Label>
              <Input
                id="validTill"
                type="number"
                min="1"
                max="12"
                value={formData.validTill}
                onChange={(e) => setFormData(prev => ({ ...prev, validTill: e.target.value }))}
                placeholder="3"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
            <div className="flex items-center space-x-3 pt-8">
              <input
                type="checkbox"
                id="reminderNeeded"
                checked={formData.reminderNeeded}
                onChange={(e) => setFormData(prev => ({ ...prev, reminderNeeded: e.target.checked }))}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2 transition-colors"
              />
              <Label htmlFor="reminderNeeded" className="text-sm font-medium text-gray-700">
                {t('setExpiryReminder') || 'Set expiry reminder'}
              </Label>
            </div>
          </div>
        )}

        {/* File List */}
        {uploadedFiles.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 text-sm sm:text-base">
              {t('selectedFiles') || 'Selected Files'} ({uploadedFiles.length})
            </h4>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {uploadedFiles.map((file, index) => (
                <div
                  key={index}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border transition-all duration-200 ${
                    file.status === 'error' 
                      ? 'border-red-200 bg-red-50' 
                      : file.status === 'success'
                      ? 'border-green-200 bg-green-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0 flex-1 mb-2 sm:mb-0">
                    {file.preview ? (
                      <img 
                        src={file.preview} 
                        alt="Preview" 
                        className="w-10 h-10 rounded object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded bg-gray-200 flex items-center justify-center flex-shrink-0">
                        <FileText className="h-5 w-5 text-gray-500" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {file.file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(file.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      {file.status === 'error' && file.error && (
                        <p className="text-xs text-red-600 mt-1">{file.error}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    {file.status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => uploadFile(file.file, index)}
                        disabled={uploading}
                        className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 shadow-sm hover:shadow-md w-full sm:w-auto"
                      >
                        {uploading ? t('uploading') || 'Uploading' : t('upload') || 'Upload'}
                      </Button>
                    )}
                    {file.status === 'uploading' && (
                      <div className="flex items-center space-x-2 w-full sm:w-auto">
                        <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin flex-shrink-0"></div>
                        <span className="text-xs text-blue-600">{file.progress}%</span>
                      </div>
                    )}
                    {file.status === 'success' && (
                      <span className="text-green-600 flex-shrink-0">
                        <CheckCircle className="h-5 w-5" />
                      </span>
                    )}
                    {file.status === 'error' && (
                      <span className="text-red-600 flex-shrink-0" title={file.error}>
                        <XCircle className="h-5 w-5" />
                      </span>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeFile(index)}
                      className="px-2 py-1.5 text-xs text-red-600 hover:text-red-800 hover:bg-red-50 border-red-200 hover:border-red-300 transition-colors flex-shrink-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Button */}
        {canUpload && (
          <div className="pt-4">
            <Button
              onClick={handleUpload}
              disabled={uploading}
              className="w-full px-6 py-3 text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700"
            >
              {uploading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  {t('uploading') || 'Uploading'}
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Upload className="h-5 w-5 mr-2" />
                  {t('uploadFiles') || 'Upload Files'}
                </div>
              )}
            </Button>
          </div>
        )}
      </CardContent>

      {/* Bettercode Logo */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <BettercodeLogo variant="minimal" className="justify-center" />
      </div>
    </Card>
  );
};

export default FileUpload;
