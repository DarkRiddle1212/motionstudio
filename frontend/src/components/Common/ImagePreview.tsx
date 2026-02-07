import React from 'react';
import { motion } from 'framer-motion';

export interface ImagePreviewProps {
  url: string;
  alt?: string;
  metadata?: {
    width: number;
    height: number;
    size: number;
    format?: string;
  };
  onReplace?: () => void;
  onRemove?: () => void;
  className?: string;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  url,
  alt = 'Preview',
  metadata,
  onReplace,
  onRemove,
  className = '',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`relative group ${className}`}
    >
      {/* Image */}
      <div className="relative overflow-hidden rounded-lg shadow-lg">
        <img
          src={url}
          alt={alt}
          className="w-full h-48 sm:h-56 md:h-64 object-cover transition-all duration-300 group-hover:scale-105"
        />
        
        {/* Overlay with buttons */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out">
          <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center justify-between">
            {/* Metadata */}
            {metadata && (
              <motion.div 
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-white text-sm space-y-1"
              >
                <div className="font-medium">
                  {metadata.width} × {metadata.height}
                </div>
                <div className="text-gray-300">
                  {(metadata.size / 1024).toFixed(1)} KB
                  {metadata.format && ` • ${metadata.format.toUpperCase()}`}
                </div>
              </motion.div>
            )}
            
            {/* Action buttons */}
            <motion.div 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex gap-2"
            >
              {onReplace && (
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onReplace}
                  className="px-4 py-2 bg-[#F6C1CC]/90 backdrop-blur-sm text-black rounded-lg hover:bg-[#F8D1D8]/90 transition-all duration-200 shadow-lg"
                >
                  Replace
                </motion.button>
              )}
              {onRemove && (
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onRemove}
                  className="px-4 py-2 bg-red-600/90 backdrop-blur-sm text-white rounded-lg hover:bg-red-700/90 transition-all duration-200 shadow-lg"
                >
                  Remove
                </motion.button>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
