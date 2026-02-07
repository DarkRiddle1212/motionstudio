import React, { useState, useRef } from 'react';
import { motion, Reorder, AnimatePresence } from 'framer-motion';

export interface GalleryImage {
  id: string;
  url: string;
  path: string;
  metadata?: {
    width: number;
    height: number;
    size: number;
    format?: string;
  };
}

export interface GalleryUploadProps {
  images: GalleryImage[];
  onImagesChange: (images: GalleryImage[]) => void;
  onUpload: (files: File[]) => Promise<GalleryImage[]>;
  onRemove: (imageId: string) => void;
  maxImages?: number;
  className?: string;
}

export const GalleryUpload: React.FC<GalleryUploadProps> = ({
  images,
  onImagesChange,
  onUpload,
  onRemove,
  maxImages = 10,
  className = '',
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const remainingSlots = maxImages - images.length;

    if (fileArray.length > remainingSlots) {
      setError(`You can only upload ${remainingSlots} more image${remainingSlots !== 1 ? 's' : ''}`);
      return;
    }

    setError(null);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const newImages = await onUpload(fileArray);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Add new images to the list
      onImagesChange([...images, ...newImages]);
      
      // Success animation
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        
        // Trigger success animation for each new image
        newImages.forEach((_, index) => {
          setTimeout(() => {
            // Could add individual success animations here
          }, index * 100);
        });
      }, 500);
    } catch (err: any) {
      setError(err.message || 'Upload failed');
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = (imageId: string) => {
    onRemove(imageId);
    onImagesChange(images.filter(img => img.id !== imageId));
  };

  const canAddMore = images.length < maxImages;

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-300">
          Gallery Images
        </label>
        <span className="text-sm text-gray-400">
          {images.length} / {maxImages} images
        </span>
      </div>

      {/* Image grid */}
      {images.length > 0 && (
        <Reorder.Group
          axis="x"
          values={images}
          onReorder={onImagesChange}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          <AnimatePresence>
            {images.map((image, index) => (
              <Reorder.Item
                key={image.id}
                value={image}
                className="relative group cursor-move"
              >
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: -20 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className="relative aspect-square rounded-lg overflow-hidden shadow-lg"
                >
                  {/* Image */}
                  <img
                    src={image.url}
                    alt={`Gallery ${index + 1}`}
                    className="w-full h-full object-cover"
                  />

                  {/* Number badge */}
                  <motion.div
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="absolute top-2 left-2 w-8 h-8 bg-black/60 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-white text-sm font-medium shadow-lg"
                  >
                    {index + 1}
                  </motion.div>

                  {/* Hover overlay */}
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute inset-0 bg-black/60 backdrop-blur-md border border-white/5 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center rounded-lg"
                  >
                    <button
                      onClick={() => handleRemove(image.id)}
                      className="p-2 bg-red-600/90 backdrop-blur-md border border-red-400/20 text-white rounded-lg hover:bg-red-700/90 transition-all duration-200 shadow-lg"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </motion.div>

                  {/* Drag handle indicator */}
                  <motion.div 
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg className="w-5 h-5 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </motion.div>
                </motion.div>
              </Reorder.Item>
            ))}
          </AnimatePresence>
        </Reorder.Group>
      )}

      {/* Upload area */}
      {canAddMore && (
        <motion.div
          layout
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleBrowseClick}
          className={`
            relative border-2 border-dashed rounded-lg p-4 sm:p-6 md:p-8 text-center cursor-pointer
            transition-all duration-300 ease-out backdrop-blur-sm
            ${isDragging
              ? 'border-[#F6C1CC] bg-[#F6C1CC]/10 shadow-lg shadow-[#F6C1CC]/20 scale-[1.02]'
              : 'border-gray-600 hover:border-gray-500 bg-gray-800/50 hover:bg-gray-800/70'
            }
            ${isUploading ? 'pointer-events-none' : ''}
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />

          {isUploading ? (
            <div className="space-y-4">
              <div className="text-[#F6C1CC]">Uploading...</div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <motion.div
                  className="bg-[#F6C1CC] h-2 rounded-full relative overflow-hidden"
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
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
              <div className="text-sm text-gray-400">{uploadProgress}%</div>
              
              {/* Success celebration when complete */}
              {uploadProgress === 100 && (
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
                  
                  {/* Sparkle effects */}
                  <motion.div className="absolute inset-0 pointer-events-none">
                    {[...Array(4)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ 
                          scale: [0, 1, 0],
                          opacity: [0, 1, 0],
                          x: [0, (i % 2 === 0 ? 20 : -20)],
                          y: [0, (i < 2 ? -20 : 20)]
                        }}
                        transition={{ 
                          delay: 0.3 + i * 0.1, 
                          duration: 0.8,
                          ease: "easeOut"
                        }}
                        className="absolute top-1/2 left-1/2 text-yellow-400"
                        style={{ fontSize: '12px' }}
                      >
                        ✨
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-4xl">🖼️</div>
              <div className="text-gray-300">
                {isDragging
                  ? 'Drop images here'
                  : 'Add more images'}
              </div>
              <div className="text-sm text-gray-400">
                Drag & drop or click to browse
              </div>
              <div className="text-xs text-gray-500">
                {maxImages - images.length} slot{maxImages - images.length !== 1 ? 's' : ''} remaining
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Error message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-red-500 bg-opacity-10 border border-red-500 rounded-lg text-red-400 text-sm"
        >
          {error}
        </motion.div>
      )}

      {/* Help text */}
      <p className="text-sm text-gray-400">
        Drag images to reorder. Maximum {maxImages} images. Each image will be optimized automatically.
      </p>
    </div>
  );
};
