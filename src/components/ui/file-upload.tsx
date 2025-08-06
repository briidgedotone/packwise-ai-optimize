import React, { useCallback, useState } from 'react';
import { Upload, FileText, X, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFileContent: (content: string, filename: string) => void;
  acceptedTypes?: string[];
  maxSizeMB?: number;
  placeholder?: string;
  className?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileContent,
  acceptedTypes = ['.csv', '.txt'],
  maxSizeMB = 10,
  placeholder = 'Drop your CSV file here or click to browse',
  className
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: number } | null>(null);

  const validateFile = (file: File): string | null => {
    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedTypes.includes(fileExtension)) {
      return `File type not supported. Please upload: ${acceptedTypes.join(', ')}`;
    }

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      return `File too large. Maximum size: ${maxSizeMB}MB`;
    }

    return null;
  };

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    setIsUploading(true);

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setIsUploading(false);
      return;
    }

    try {
      const content = await file.text();
      setUploadedFile({ name: file.name, size: file.size });
      onFileContent(content, file.name);
    } catch (err) {
      setError('Failed to read file content');
    } finally {
      setIsUploading(false);
    }
  }, [onFileContent, acceptedTypes, maxSizeMB]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const clearFile = () => {
    setUploadedFile(null);
    setError(null);
    onFileContent('', '');
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={cn('w-full', className)}>
      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          'relative border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer',
          isDragOver 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400',
          isUploading && 'pointer-events-none opacity-50'
        )}
      >
        <input
          type="file"
          accept={acceptedTypes.join(',')}
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isUploading}
        />

        <div className="flex flex-col items-center space-y-3">
          <div className={cn(
            'w-12 h-12 rounded-full flex items-center justify-center',
            isDragOver ? 'bg-blue-100' : 'bg-gray-100'
          )}>
            <Upload className={cn(
              'h-6 w-6',
              isDragOver ? 'text-blue-600' : 'text-gray-600'
            )} />
          </div>

          <div>
            <p className="text-sm font-medium text-gray-900">
              {isUploading ? 'Processing...' : placeholder}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Supports: {acceptedTypes.join(', ')} • Max {maxSizeMB}MB
            </p>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      )}

      {/* Uploaded File Display */}
      {uploadedFile && !error && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-900">{uploadedFile.name}</p>
                <p className="text-xs text-green-600">{formatFileSize(uploadedFile.size)}</p>
              </div>
            </div>
            <button
              onClick={clearFile}
              className="p-1 hover:bg-green-100 rounded"
              title="Remove file"
            >
              <X className="h-4 w-4 text-green-600" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};