import React from 'react';
import { motion } from 'framer-motion';

export interface MediaTypeSelectorProps {
  value: 'image' | 'video';
  onChange: (value: 'image' | 'video') => void;
  className?: string;
}

export const MediaTypeSelector: React.FC<MediaTypeSelectorProps> = ({
  value,
  onChange,
  className = '',
}) => {
  return (
    <div className={`inline-flex rounded-lg bg-gray-800/80 backdrop-blur-md border border-gray-700/50 p-1 shadow-lg text-sm sm:text-base ${className}`}>
      {/* Image option */}
      <button
        type="button"
        onClick={() => onChange('image')}
        className={`
          relative px-4 sm:px-6 py-2 rounded-md text-sm font-medium transition-all duration-200
          ${value === 'image'
            ? 'text-white'
            : 'text-gray-400 hover:text-gray-300'
          }
        `}
      >
        {value === 'image' && (
          <motion.div
            layoutId="activeTab"
            className="absolute inset-0 bg-[#F6C1CC]/90 backdrop-blur-md border border-[#F6C1CC]/20 rounded-md shadow-lg"
            initial={false}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        )}
        <span className="relative z-10 flex items-center gap-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
          Image
        </span>
      </button>

      {/* Video option */}
      <button
        type="button"
        onClick={() => onChange('video')}
        className={`
          relative px-4 sm:px-6 py-2 rounded-md text-sm font-medium transition-all duration-200
          ${value === 'video'
            ? 'text-white'
            : 'text-gray-400 hover:text-gray-300'
          }
        `}
      >
        {value === 'video' && (
          <motion.div
            layoutId="activeTab"
            className="absolute inset-0 bg-[#F6C1CC]/90 backdrop-blur-md border border-[#F6C1CC]/20 rounded-md shadow-lg"
            initial={false}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        )}
        <span className="relative z-10 flex items-center gap-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
          </svg>
          Video
        </span>
      </button>
    </div>
  );
};
