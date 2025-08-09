import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, Image, X, CheckCircle, AlertCircle } from 'lucide-react';

interface FileUploadProps {
  type: 'prescription' | 'report';
  onUploadComplete?: () => void;
}

interface UploadedFile {
  file: File;
  preview?: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ type, onUploadComplete }) => {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    reportType: '',
    validTill: '',
    reminderNeeded: false
  });

  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
  const maxFileSize = 10 * 1024 * 1024; // 10MB

  const validateFile = (file: File): string | null => {
    if (!allowedTypes.includes(file.type)) {
      return t('fileTypeNotSupported');
    }
    if (file.size > maxFileSize) {
      return t('fileSizeTooLarge');
    }
    return null;
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
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

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
          error: t('uploadFailed') 
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
      userId: currentUser?.uid
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
        title: t('uploadSuccess'),
        description: `${pendingFiles.length} file(s) uploaded successfully`,
      });

      setUploadedFiles([]);
      setFormData({
        title: '',
        description: '',
        reportType: '',
        validTill: '',
        reminderNeeded: false
      });

      onUploadComplete?.();
    } catch (error) {
      toast({
        title: t('uploadError'),
        description: t('failedToUploadFiles'),
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  const canUpload = uploadedFiles.some(f => f.status === 'pending') && !uploading;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          {type === 'prescription' ? t('uploadPrescription') : t('uploadReport')}
        </CardTitle>
        <CardDescription>
          {t('dragDropFiles')} • {t('supportedFormats')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-900 mb-2">
            {t('dragDropFiles')}
          </p>
          <p className="text-sm text-gray-500 mb-4">
            {t('supportedFormats')}
          </p>
          <Button
            variant="outline"
            onClick={() => document.getElementById('file-input')?.click()}
            disabled={uploading}
          >
            <Upload className="h-4 w-4 mr-2" />
            {t('scanDocument')}
          </Button>
          <input
            id="file-input"
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="title">{t('name')}</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder={type === 'prescription' ? t('prescriptionTitle') : t('reportTitle')}
            />
          </div>
          
          {type === 'report' && (
            <div>
              <Label htmlFor="reportType">{t('reportType')}</Label>
              <Select
                value={formData.reportType}
                onValueChange={(value) => setFormData(prev => ({ ...prev, reportType: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('selectReportType')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bloodTest">{t('bloodTest')}</SelectItem>
                  <SelectItem value="xray">{t('xray')}</SelectItem>
                  <SelectItem value="mri">{t('mri')}</SelectItem>
                  <SelectItem value="ecg">{t('ecg')}</SelectItem>
                  <SelectItem value="urineTest">{t('urineTest')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="description">{t('description')}</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder={t('addDescriptionOrNotes')}
            rows={3}
          />
        </div>

        {type === 'report' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="validTill">{t('validFor')}</Label>
              <Input
                id="validTill"
                type="number"
                min="1"
                max="12"
                value={formData.validTill}
                onChange={(e) => setFormData(prev => ({ ...prev, validTill: e.target.value }))}
                placeholder="3"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="reminderNeeded"
                checked={formData.reminderNeeded}
                onChange={(e) => setFormData(prev => ({ ...prev, reminderNeeded: e.target.checked }))}
                className="rounded"
              />
              <Label htmlFor="reminderNeeded">{t('setExpiryReminder')}</Label>
            </div>
          </div>
        )}

        {/* File List */}
        {uploadedFiles.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">{t('selectedFiles')}</h4>
            {uploadedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  {file.preview ? (
                    <img
                      src={file.preview}
                      alt="Preview"
                      className="w-10 h-10 object-cover rounded"
                    />
                  ) : (
                    <FileText className="w-10 h-10 text-gray-400" />
                  )}
                  <div>
                    <p className="font-medium text-sm">{file.file.name}</p>
                    <p className="text-xs text-gray-500">
                      {(file.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {file.status === 'pending' && (
                    <span className="text-xs text-gray-500">{t('ready')}</span>
                  )}
                  {file.status === 'uploading' && (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs text-blue-500">{t('uploading')}</span>
                    </div>
                  )}
                  {file.status === 'success' && (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                  {file.status === 'error' && (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    disabled={file.status === 'uploading'}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Upload Button */}
        <Button
          onClick={handleUpload}
          disabled={!canUpload}
          className="w-full"
        >
          {uploading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              {t('save')}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default FileUpload;
