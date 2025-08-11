import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/ui/loading';
import { Download, ZoomIn, ZoomOut, RotateCw, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface FileViewerProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrl: string;
  fileName: string;
  fileType?: string;
}

const FileViewer: React.FC<FileViewerProps> = ({
  isOpen,
  onClose,
  fileUrl,
  fileName,
  fileType
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const isImage = fileType?.startsWith('image/');
  const isPDF = fileType === 'application/pdf';

  useEffect(() => {
    if (isOpen && fileUrl) {
      setLoading(true);
      setError(null);
      setZoom(1);
      setRotation(0);
      setCurrentPage(1);
    }
  }, [isOpen, fileUrl]);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));
  const handleResetZoom = () => setZoom(1);
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);
  const handlePreviousPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const handleNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.click();
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-96">
          <Loading text="Loading file..." />
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-96 text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading File</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.open(fileUrl, '_blank')} variant="outline">
            Open in New Tab
          </Button>
        </div>
      );
    }

    if (isImage) {
      return (
        <div className="flex justify-center items-center min-h-96">
          <img
            src={fileUrl}
            alt={fileName}
            className="max-w-full max-h-full object-contain"
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
              transition: 'transform 0.2s ease-in-out'
            }}
            onLoad={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              setError('Failed to load image');
            }}
          />
        </div>
      );
    }

    if (isPDF) {
      return (
        <div className="w-full h-96">
          <iframe
            src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=0&page=${currentPage}`}
            className="w-full h-full border-0"
            onLoad={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              setError('Failed to load PDF');
            }}
          />
        </div>
      );
    }

    // For other file types, show a preview with download option
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <div className="text-blue-500 text-6xl mb-4">📄</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">File Preview Not Available</h3>
        <p className="text-gray-600 mb-4">
          This file type cannot be previewed. Please download to view.
        </p>
        <Button onClick={handleDownload} className="bg-blue-600 hover:bg-blue-700">
          <Download className="h-4 w-4 mr-2" />
          Download File
        </Button>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] w-[95vw] p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-lg font-semibold text-gray-900 truncate">
                {fileName}
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-600">
                {fileType || 'Unknown file type'}
              </DialogDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownload}
                title="Download"
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                title="Close"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Toolbar */}
        <div className="px-6 py-3 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-2">
            {isImage && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleZoomOut}
                  disabled={zoom <= 0.5}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm text-gray-600 min-w-[60px] text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleZoomIn}
                  disabled={zoom >= 3}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetZoom}
                >
                  Reset
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRotate}
                >
                  <RotateCw className="h-4 w-4" />
                </Button>
              </>
            )}
            {isPDF && totalPages > 1 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={currentPage <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={currentPage >= totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(fileUrl, '_blank')}
            >
              Open in New Tab
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6">
          {renderContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FileViewer;
