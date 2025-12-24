import { ReactNode } from 'react';
import { useResponsive } from '../../hooks/useResponsive';

interface ResponsiveCardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  border?: boolean;
  rounded?: 'none' | 'sm' | 'md' | 'lg';
  mobileFullWidth?: boolean;
  mobileStackVertical?: boolean;
}

const ResponsiveCard = ({
  children,
  className = '',
  padding = 'md',
  shadow = 'sm',
  border = true,
  rounded = 'lg',
  mobileFullWidth = true,
  mobileStackVertical = false,
}: ResponsiveCardProps) => {
  const { isMobile } = useResponsive();

  const paddingClasses = {
    none: '',
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8',
  };

  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
  };

  const roundedClasses = {
    none: '',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
  };

  const baseClasses = `
    bg-white
    ${border ? 'border border-gray-200' : ''}
    ${shadowClasses[shadow]}
    ${roundedClasses[rounded]}
    ${paddingClasses[padding]}
    ${mobileFullWidth && isMobile ? 'w-full' : ''}
    ${mobileStackVertical && isMobile ? 'flex flex-col space-y-4' : ''}
    transition-shadow duration-200
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className={baseClasses}>
      {children}
    </div>
  );
};

// Specialized card components for common use cases
interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}

export const CardHeader = ({ title, subtitle, action, className = '' }: CardHeaderProps) => {
  const { isMobile } = useResponsive();

  return (
    <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 ${className}`}>
      <div className="min-w-0 flex-1">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">{title}</h3>
        {subtitle && (
          <p className="mt-1 text-sm text-gray-500 truncate">{subtitle}</p>
        )}
      </div>
      {action && (
        <div className={`flex-shrink-0 ${isMobile ? 'w-full' : ''}`}>
          {action}
        </div>
      )}
    </div>
  );
};

interface CardContentProps {
  children: ReactNode;
  className?: string;
  spacing?: 'none' | 'sm' | 'md' | 'lg';
}

export const CardContent = ({ children, className = '', spacing = 'md' }: CardContentProps) => {
  const spacingClasses = {
    none: '',
    sm: 'space-y-2',
    md: 'space-y-4',
    lg: 'space-y-6',
  };

  return (
    <div className={`${spacingClasses[spacing]} ${className}`}>
      {children}
    </div>
  );
};

interface CardFooterProps {
  children: ReactNode;
  className?: string;
  borderTop?: boolean;
  padding?: boolean;
}

export const CardFooter = ({ 
  children, 
  className = '', 
  borderTop = true, 
  padding = true 
}: CardFooterProps) => {
  return (
    <div className={`
      ${borderTop ? 'border-t border-gray-200 pt-4 mt-4' : ''}
      ${padding ? 'px-4 sm:px-6 py-3 sm:py-4' : ''}
      ${className}
    `}>
      {children}
    </div>
  );
};

// Grid layout component for responsive card grids
interface ResponsiveGridProps {
  children: ReactNode;
  columns?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const ResponsiveGrid = ({
  children,
  columns = { xs: 1, sm: 2, lg: 3, xl: 4 },
  gap = 'md',
  className = '',
}: ResponsiveGridProps) => {
  const gapClasses = {
    none: 'gap-0',
    sm: 'gap-2 sm:gap-3',
    md: 'gap-4 sm:gap-6',
    lg: 'gap-6 sm:gap-8',
    xl: 'gap-8 sm:gap-10',
  };

  const getColumnClasses = () => {
    const classes = ['grid'];
    
    if (columns.xs) classes.push(`grid-cols-${columns.xs}`);
    if (columns.sm) classes.push(`sm:grid-cols-${columns.sm}`);
    if (columns.md) classes.push(`md:grid-cols-${columns.md}`);
    if (columns.lg) classes.push(`lg:grid-cols-${columns.lg}`);
    if (columns.xl) classes.push(`xl:grid-cols-${columns.xl}`);
    
    return classes.join(' ');
  };

  return (
    <div className={`${getColumnClasses()} ${gapClasses[gap]} ${className}`}>
      {children}
    </div>
  );
};

export default ResponsiveCard;