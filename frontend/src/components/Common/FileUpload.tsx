import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface UploadResult {
  url: string;
  path: string;
  dimensions?: { width: number; height: number };
  duration?: number;
  size: number;
}

export interface FileUploadProps {
  accept: string;
  maxSize: number;
  onUpload: (file: File) => Promise<UploadResult>;
  onRemove?: () => void;
  existingUrl?: string;
  mediaType: 'image' | 'video';
  label: string;
  helpText?: string;
}

type UploadState =
  | { status: 'idle' }
  | { status: 'dragging' }
  | { status: 'uploading'; progress: number }
  | { status: 'success'; result: UploadResult }
  | { status: 'error'; message: string };

export const FileUpload: React.FC<FileUploadProps> = ({
  accept,
  maxSize,
  onUpload,
  onRemove,
  existingUrl,
  mediaType,
  label,
  helpText,
}) => {
  const [state, setState] = useState<UploadState>({ status: 'idle' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Check file type
    const acceptedTypes = accept.split(',').map(t => t.trim());
    const isValidType = acceptedTypes.some(type => {
      if (type === 'image/*') return file.type.startsWith('image/');
      if (type === 'video/*') return file.type.startsWith('video/');
      return file.type === type;
    });

    if (!isValidType) {
      return `Invalid file type. Accepted types: ${accept}`;
    }

    // Check file size
    if (file.size > maxSize) {
      const maxMB = (maxSize / (1024 * 1024)).toFixed(1);
      const fileMB = (file.size / (1024 * 1024)).toFixed(1);
      return `File too large (${fileMB}MB). Maximum: ${maxMB}MB`;
    }

    return null;
  };

  const handleFileSelect = async (file: File) => {
    const error = validateFile(file);
    if (error) {
      setState({ status: 'error', message: error });
      return;
    }

    setSelectedFile(file);
    setState({ status: 'uploading', progress: 0 });

    try {
      // Simulate progress (in real implementation, use XMLHttpRequest for progress tracking)
      const progressInterval = setInterval(() => {
        setState(prev => {
          if (prev.status === 'uploading' && prev.progress < 90) {
            return { status: 'uploading', progress: prev.progress + 10 };
          }
          return prev;
        });
      }, 200);

      const result = await onUpload(file);

      clearInterval(progressInterval);
      setState({ status: 'success', result });
    } catch (error: any) {
      setState({ status: 'error', message: error.message || 'Upload failed' });
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (state.status === 'idle' || state.status === 'error') {
      setState({ status: 'dragging' });
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (state.status === 'dragging') {
      setState({ status: 'idle' });
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setState({ status: 'idle' });

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setState({ status: 'idle' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onRemove?.();
  };

  const displayUrl = state.status === 'success' ? state.result.url : existingUrl;

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-300">
        {label}
      </label>

      {helpText && (
        <p className="text-sm text-gray-400">{helpText}</p>
      )}

      <AnimatePresence mode="wait">
        {state.status === 'success' || existingUrl ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative group"
          >
            {/* Success checkmark animation */}
            {state.status === 'success' && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="absolute top-4 right-4 z-10 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg"
              >
                <motion.svg
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <motion.path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </motion.svg>
                
                {/* Confetti burst */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.5, 0] }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                  className="absolute inset-0 pointer-events-none"
                >
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ 
                        scale: 0,
                        x: 0,
                        y: 0,
                        rotate: 0
                      }}
                      animate={{ 
                        scale: [0, 1, 0],
                        x: [0, (Math.cos(i * 60 * Math.PI / 180) * 30)],
                        y: [0, (Math.sin(i * 60 * Math.PI / 180) * 30)],
                        rotate: [0, 360]
                      }}
                      transition={{ 
                        delay: 0.7 + i * 0.1, 
                        duration: 1,
                        ease: "easeOut"
                      }}
                      className="absolute top-1/2 left-1/2 w-2 h-2 bg-[#F6C1CC] rounded-full"
                      style={{ 
                        transformOrigin: 'center',
                        marginTop: '-4px',
                        marginLeft: '-4px'
                      }}
                    />
                  ))}
                </motion.div>
              </motion.div>
            )}

            {mediaType === 'image' ? (
              <img
                src={displayUrl}
                alt="Preview"
                className="w-full h-48 sm:h-56 md:h-64 object-cover rounded-lg shadow-lg"
              />
            ) : (
              <video
                src={displayUrl}
                controls
                className="w-full h-48 sm:h-56 md:h-64 rounded-lg shadow-lg"
              />
            )}

            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 rounded-lg flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 space-x-4">
                <button
                  onClick={handleBrowseClick}
                  className="px-4 py-2 bg-[#F6C1CC]/90 backdrop-blur-sm text-black rounded-lg hover:bg-[#F8D1D8]/90 hover:scale-105 transition-all duration-200 shadow-lg"
                >
                  Replace
                </button>
                <button
                  onClick={handleRemove}
                  className="px-4 py-2 bg-red-600/90 backdrop-blur-sm text-white rounded-lg hover:bg-red-700/90 hover:scale-105 transition-all duration-200 shadow-lg"
                >
                  Remove
                </button>
              </div>
            </div>

            {state.status === 'success' && state.result.dimensions && (
              <div className="mt-2 text-sm text-gray-400">
                {state.result.dimensions.width} × {state.result.dimensions.height} •{' '}
                {(state.result.size / 1024).toFixed(1)} KB
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="upload"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleBrowseClick}
            className={`
              relative border-2 border-dashed rounded-lg p-4 sm:p-6 md:p-8 text-center cursor-pointer
              transition-all duration-300 ease-out backdrop-blur-sm
              ${state.status === 'dragging'
                ? 'border-[#F6C1CC] bg-[#F6C1CC]/10 shadow-lg shadow-[#F6C1CC]/20'
                : 'border-gray-600 hover:border-gray-500 bg-gray-800/50 hover:bg-gray-800/70'
              }
              ${state.status === 'uploading' ? 'pointer-events-none' : ''}
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={accept}
              onChange={handleFileInputChange}
              className="hidden"
            />

            {state.status === 'uploading' ? (
              <div className="space-y-4">
                <div className="text-[#F6C1CC]">Uploading...</div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <motion.div
                    className="bg-[#F6C1CC] h-2 rounded-full relative overflow-hidden"
                    initial={{ width: 0 }}
                    animate={{ width: `${state.progress}%` }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Shimmer effect on progress bar */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                    />
                  </motion.div>
                </div>
                <div className="text-sm text-gray-400">{state.progress}%</div>
                
                {/* Success celebration when complete */}
                {state.progress === 100 && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex items-center justify-center text-green-400"
                  >
                    <motion.svg
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.5 }}
                      className="w-6 h-6 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <motion.path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </motion.svg>
                    Upload complete!
                  </motion.div>
                )}
              </div>
            ) : state.status === 'error' ? (
              <div className="space-y-2">
                <div className="text-red-400">❌ {state.message}</div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setState({ status: 'idle' });
                  }}
                  className="text-sm text-[#F6C1CC] hover:text-[#F8D1D8] hover:underline transition-all duration-200"
                >
                  Try again
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-4xl">
                  {mediaType === 'image' ? '🖼️' : '🎥'}
                </div>
                <div className="text-gray-300">
                  {state.status === 'dragging'
                    ? 'Drop file here'
                    : 'Drag & drop or click to browse'}
                </div>
                <div className="text-sm text-gray-400">
                  {accept} • Max {(maxSize / (1024 * 1024)).toFixed(0)}MB
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
