import React from 'react';
import { useHelp } from './HelpProvider';

const HelpButton: React.FC = () => {
  const { isHelpMode, toggleHelpMode } = useHelp();

  return (
    <button
      onClick={toggleHelpMode}
      className={`fixed bottom-6 right-6 z-40 p-3 rounded-full shadow-lg transition-all duration-200 ${
        isHelpMode
          ? 'bg-blue-600 text-white hover:bg-blue-700'
          : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-300'
      }`}
      title={isHelpMode ? 'Exit Help Mode' : 'Enter Help Mode'}
      aria-label={isHelpMode ? 'Exit Help Mode' : 'Enter Help Mode'}
    >
      {isHelpMode ? (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ) : (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )}
    </button>
  );
};

export default HelpButton;