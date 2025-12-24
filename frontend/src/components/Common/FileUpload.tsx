import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { motion } from 'framer-motion';

interface FileUploadProps {
  label?: string;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in MB
  onFileSelect: (files: File[]) => void;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

const FileUpload = ({
  label,
  accept,
  multiple = false,
  maxSize = 50,
  onFileSelect,
  error,
  helperText,
  fullWidth = false
}: FileUploadProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  const handleFiles = (files: File[]) => {
    // Filter files by size
    const validFiles = files.filter(file => {
      const fileSizeMB = file.size / (1024 * 1024);
      return fileSizeMB <= maxSize;
    });

    setSelectedFiles(validFiles);
    onFileSelect(validFiles);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    onFileSelect(newFiles);
  };

  const baseClasses = 'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-300';
  const dragClasses = isDragOver 
    ? 'border-brand-accent bg-brand-accent bg-opacity-10' 
    : 'border-brand-accent border-opacity-30 hover:border-opacity-50';
  const errorClasses = error ? 'border-red-400' : '';
  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label className="block text-sm font-medium text-brand-primary-text mb-2">
          {label}
        </label>
      )}
      
      <motion.div
        className={`${baseClasses} ${dragClasses} ${errorClasses} ${widthClass}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInput}
          className="hidden"
        />
        
        <div className="space-y-2">
          <div className="text-brand-primary-text">
            <svg className="mx-auto h-12 w-12 text-brand-secondary-text" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <p className="text-brand-primary-text font-medium">
              Drop files here or click to browse
            </p>
            <p className="text-sm text-brand-secondary-text">
              {accept ? `Accepted formats: ${accept}` : 'All file types accepted'}
            </p>
            <p className="text-sm text-brand-secondary-text">
              Max size: {maxSize}MB {multiple ? '(multiple files allowed)' : ''}
            </p>
          </div>
        </div>
      </motion.div>

      {selectedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          {selectedFiles.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-brand-secondary-bg rounded-lg border border-brand-accent border-opacity-20">
              <div className="flex items-center space-x-3">
                <div className="text-brand-primary-text">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-brand-primary-text">{file.name}</p>
                  <p className="text-xs text-brand-secondary-text">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
                className="text-brand-secondary-text hover:text-red-500 transition-colors"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-brand-secondary-text">{helperText}</p>
      )}
    </div>
  );
};

export default FileUpload;