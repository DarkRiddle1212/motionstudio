import { ReactNode, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface MobileActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

interface ActionSheetItemProps {
  icon?: ReactNode;
  label: string;
  onClick: () => void;
  variant?: 'default' | 'destructive';
  disabled?: boolean;
}

export const ActionSheetItem = ({
  icon,
  label,
  onClick,
  variant = 'default',
  disabled = false,
}: ActionSheetItemProps) => {
  const handleClick = () => {
    if (!disabled) {
      onClick();
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`
        w-full flex items-center gap-3 px-4 py-4 text-left transition-colors
        ${variant === 'destructive' 
          ? 'text-red-600 hover:bg-red-50 active:bg-red-100' 
          : 'text-gray-900 hover:bg-gray-50 active:bg-gray-100'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        touch-manipulation
      `}
    >
      {icon && (
        <div className={`flex-shrink-0 w-5 h-5 ${variant === 'destructive' ? 'text-red-500' : 'text-gray-400'}`}>
          {icon}
        </div>
      )}
      <span className="font-medium">{label}</span>
    </button>
  );
};

const MobileActionSheet = ({ isOpen, onClose, title, children }: MobileActionSheetProps) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      // Prevent body scroll when sheet is open
      document.body.style.overflow = 'hidden';
    } else {
      // Re-enable body scroll when sheet is closed
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen && !isAnimating) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleAnimationEnd = () => {
    if (!isOpen) {
      setIsAnimating(false);
    }
  };

  return createPortal(
    <div
      className={`fixed inset-0 z-50 lg:hidden ${isOpen ? 'block' : 'hidden'}`}
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isOpen ? 'opacity-50' : 'opacity-0'
        }`}
      />
      
      {/* Action Sheet */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-xl shadow-xl transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        onTransitionEnd={handleAnimationEnd}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        {title && (
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="max-h-96 overflow-y-auto">
          {children}
        </div>

        {/* Safe area for devices with home indicator */}
        <div className="h-safe-area-inset-bottom" />
      </div>
    </div>,
    document.body
  );
};

export default MobileActionSheet;