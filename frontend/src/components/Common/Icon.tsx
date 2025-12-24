import { forwardRef } from 'react';

/**
 * Standardized Icon Component
 * 
 * Features:
 * - Consistent sizing system (xs, sm, md, lg, xl)
 * - Proper alignment utilities
 * - Accessible by default
 * - Flexible styling options
 * - Support for both SVG and icon fonts
 * 
 * Requirements: Consistent icon sizing and alignment
 */

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface IconProps {
  size?: IconSize;
  className?: string;
  children: React.ReactNode;
  'aria-hidden'?: boolean;
  'aria-label'?: string;
  role?: string;
}

// Standardized icon sizes with proper alignment
const iconSizes: Record<IconSize, string> = {
  xs: 'w-3 h-3', // 12px - for small inline icons
  sm: 'w-4 h-4', // 16px - for buttons, inputs
  md: 'w-5 h-5', // 20px - default size
  lg: 'w-6 h-6', // 24px - for headers, prominent actions
  xl: 'w-8 h-8', // 32px - for large displays, hero sections
};

/**
 * Base Icon component for consistent sizing and alignment
 */
const Icon = forwardRef<HTMLElement, IconProps>(({
  size = 'md',
  className = '',
  children,
  'aria-hidden': ariaHidden = true,
  'aria-label': ariaLabel,
  role,
  ...props
}, ref) => {
  const sizeClasses = iconSizes[size];
  
  // Base classes for proper alignment and display
  const baseClasses = `
    inline-flex
    items-center
    justify-center
    flex-shrink-0
    ${sizeClasses}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <span
      ref={ref as React.Ref<HTMLSpanElement>}
      className={baseClasses}
      aria-hidden={ariaHidden}
      aria-label={ariaLabel}
      role={role}
      {...props}
    >
      {children}
    </span>
  );
});

Icon.displayName = 'Icon';

/**
 * SVG Icon wrapper with proper viewBox and accessibility
 */
interface SvgIconProps extends Omit<IconProps, 'children'> {
  viewBox?: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  children: React.ReactNode;
}

const SvgIcon = forwardRef<SVGSVGElement, SvgIconProps>(({
  size = 'md',
  className = '',
  viewBox = '0 0 24 24',
  fill = 'none',
  stroke = 'currentColor',
  strokeWidth = 2,
  children,
  'aria-hidden': ariaHidden = true,
  'aria-label': ariaLabel,
  ...props
}, ref) => {
  const sizeClasses = iconSizes[size];
  
  const baseClasses = `
    ${sizeClasses}
    flex-shrink-0
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <svg
      ref={ref}
      className={baseClasses}
      viewBox={viewBox}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      aria-hidden={ariaHidden}
      aria-label={ariaLabel}
      {...props}
    >
      {children}
    </svg>
  );
});

SvgIcon.displayName = 'SvgIcon';

/**
 * Common icon components with proper sizing
 */

// Chevron Right Icon
export const ChevronRightIcon = ({ size = 'md', className = '', ...props }: Omit<SvgIconProps, 'children'>) => (
  <SvgIcon size={size} className={className} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </SvgIcon>
);

// Chevron Down Icon
export const ChevronDownIcon = ({ size = 'md', className = '', ...props }: Omit<SvgIconProps, 'children'>) => (
  <SvgIcon size={size} className={className} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </SvgIcon>
);

// Check Icon
export const CheckIcon = ({ size = 'md', className = '', ...props }: Omit<SvgIconProps, 'children'>) => (
  <SvgIcon size={size} className={className} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </SvgIcon>
);

// Close/X Icon
export const CloseIcon = ({ size = 'md', className = '', ...props }: Omit<SvgIconProps, 'children'>) => (
  <SvgIcon size={size} className={className} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </SvgIcon>
);

// Error/Alert Icon
export const AlertIcon = ({ size = 'md', className = '', ...props }: Omit<SvgIconProps, 'children'>) => (
  <SvgIcon size={size} className={className} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </SvgIcon>
);

// Search Icon
export const SearchIcon = ({ size = 'md', className = '', ...props }: Omit<SvgIconProps, 'children'>) => (
  <SvgIcon size={size} className={className} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </SvgIcon>
);

// Play Icon
export const PlayIcon = ({ size = 'md', className = '', ...props }: Omit<SvgIconProps, 'children'>) => (
  <SvgIcon size={size} className={className} fill="currentColor" stroke="none" {...props}>
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
  </SvgIcon>
);

// Download Icon
export const DownloadIcon = ({ size = 'md', className = '', ...props }: Omit<SvgIconProps, 'children'>) => (
  <SvgIcon size={size} className={className} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" />
  </SvgIcon>
);

// Star Icon (for ratings)
export const StarIcon = ({ size = 'md', className = '', filled = false, ...props }: Omit<SvgIconProps, 'children'> & { filled?: boolean }) => (
  <SvgIcon 
    size={size} 
    className={className} 
    fill={filled ? 'currentColor' : 'none'} 
    {...props}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </SvgIcon>
);

export default Icon;
export { SvgIcon };