"use client"

import React, { useState, useCallback, useRef } from 'react';
import { Upload, X, FileText, CheckCircle, XCircle, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { Button } from './button';
import { Label } from './label';
import { Input } from './input';
import { cn } from '@/lib/utils';

interface FileUploadPopupProps {
  onFileSelect: (file: File) => void;
  onFileRemove?: () => void;
  selectedFile?: File | null;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
  label?: string;
  placeholder?: string;
  showPreview?: boolean;
  disabled?: boolean;
}

interface FileInfo {
  name: string;
  size: number;
  type: string;
  preview?: string;
}

const FileUploadPopup: React.FC<FileUploadPopupProps> = ({
  onFileSelect,
  onFileRemove,
  selectedFile,
  accept = ".pdf,.jpg,.jpeg,.png",
  maxSize = 15,
  className,
      label = t('uploadFile'),
  placeholder = "Choose file or drag and drop",
  showPreview = true,
  disabled = false
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((file: File): boolean => {
    setError(null);
    
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      const errorMsg = `File size must be less than ${maxSize}MB`;
      setError(errorMsg);
      console.error(errorMsg);
      return false;
    }

    // Check file type
    const allowedTypes = accept.split(',').map(type => type.trim());
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    const fileType = file.type;
    
    const isValidType = allowedTypes.some(type => {
      if (type.startsWith('.')) {
        return fileExtension === type.toLowerCase();
      }
      return fileType === type;
    });

    if (!isValidType) {
      const errorMsg = `File type not supported. Allowed types: ${accept}`;
      setError(errorMsg);
      console.error(errorMsg);
      return false;
    }

    return true;
  }, [accept, maxSize]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(prev => prev + 1);
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(prev => prev - 1);
    if (dragCounter <= 1) {
      setIsDragging(false);
    }
  }, [dragCounter]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setDragCounter(0);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0];
      if (validateFile(file)) {
        onFileSelect(file);
      }
    }
  }, [onFileSelect, validateFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (validateFile(file)) {
        onFileSelect(file);
      }
    }
    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onFileSelect, validateFile]);

  const handleClick = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <ImageIcon className="h-5 w-5 text-blue-600" />;
    }
    if (fileType === 'application/pdf') {
      return <FileText className="h-5 w-5 text-red-600" />;
    }
    return <FileText className="h-5 w-5 text-blue-600" />;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFilePreview = (file: File) => {
    if (!showPreview || !file.type.startsWith('image/')) return null;
    
    try {
      const url = URL.createObjectURL(file);
      return (
        <img 
          src={url} 
                          alt={t('filePreview')} 
          className="w-16 h-16 object-cover rounded-lg border border-gray-200"
          onLoad={() => URL.revokeObjectURL(url)}
        />
      );
    } catch (error) {
      console.error('Error creating preview:', error);
      return null;
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      {label && (
        <Label className="text-sm font-medium text-gray-700">
          {label}
        </Label>
      )}
      
      {/* File Upload Area */}
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200",
          isDragging
            ? "border-blue-500 bg-blue-50 scale-[1.02]"
            : "border-gray-300 hover:border-gray-400 hover:bg-gray-50",
          selectedFile && "border-green-300 bg-green-50",
          disabled && "opacity-50 cursor-not-allowed",
          !disabled && "cursor-pointer"
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileInput}
          className="hidden"
          disabled={disabled}
        />
        
        {!selectedFile ? (
          <>
            <Upload className={cn(
              "h-8 w-8 mx-auto mb-3 transition-colors",
              isDragging ? "text-blue-500" : "text-gray-400"
            )} />
            <p className="text-sm font-medium text-gray-900 mb-1">
              {placeholder}
            </p>
            <p className="text-xs text-gray-500">
              {accept} up to {maxSize}MB
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Click to browse or drag and drop
            </p>
          </>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-center">
              {getFileIcon(selectedFile.type)}
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {selectedFile.name}
              </p>
              <p className="text-xs text-gray-600">
                {formatFileSize(selectedFile.size)}
              </p>
              <p className="text-xs text-gray-500">
                {selectedFile.type || 'Unknown type'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Selected File Display */}
      {selectedFile && (
        <div className="p-4 bg-white border-2 border-green-200 rounded-lg shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              {showPreview && getFilePreview(selectedFile) ? (
                getFilePreview(selectedFile)
              ) : (
                getFileIcon(selectedFile.type)
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-gray-600">
                  {formatFileSize(selectedFile.size)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {selectedFile.type || 'Unknown type'}
                </p>
              </div>
            </div>
            {onFileRemove && (
              <Button
                size="sm"
                variant="outline"
                onClick={onFileRemove}
                disabled={disabled}
                className="px-2 py-1.5 text-xs text-red-600 hover:text-red-800 hover:bg-red-50 border-red-200 hover:border-red-300 transition-colors flex-shrink-0"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Success Indicator */}
      {selectedFile && !error && (
        <div className="flex items-center space-x-2 p-2 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <p className="text-sm text-green-600">File selected successfully</p>
        </div>
      )}
    </div>
  );
};

export { FileUploadPopup };
