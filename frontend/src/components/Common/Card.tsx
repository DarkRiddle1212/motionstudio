import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { cardHoverVariants, cardLiftVariants, cardGlowVariants } from '../../utils/animationVariants';

/**
 * Premium Card Component
 * 
 * Provides sophisticated card styling with multiple variants:
 * - default: Standard card with subtle border
 * - elevated: Card with premium shadow system
 * - glass: Glassmorphism effect with backdrop blur
 * - project: Project showcase card
 * - course: Course display card
 * 
 * Hover effects:
 * - lift: Subtle lift with shadow transition
 * - glow: Accent color glow effect
 * - scale: Subtle scale animation
 * - none: No hover effect
 * 
 * Requirements: 4.2, 3.2
 */

type CardVariant = 'default' | 'project' | 'course' | 'elevated' | 'glass';
type CardHoverEffect = 'lift' | 'glow' | 'scale' | 'none';
type CardPadding = 'none' | 'sm' | 'md' | 'lg';
type CardAspectRatio = '16/9' | '4/3' | '1/1' | 'auto';

interface CardProps {
  children: ReactNode;
  variant?: CardVariant;
  hover?: CardHoverEffect;
  padding?: CardPadding;
  aspectRatio?: CardAspectRatio;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
  'data-testid'?: string;
}

// Shadow tokens from design system - used for property testing validation
export const SHADOW_TOKENS = {
  subtle: 'shadow-subtle',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
  '2xl': 'shadow-2xl',
  premium: 'shadow-premium',
  card: 'shadow-card',
  'card-hover': 'shadow-card-hover',
  button: 'shadow-button',
  'button-hover': 'shadow-button-hover',
  glow: 'shadow-glow',
  'glow-lg': 'shadow-glow-lg',
  inner: 'shadow-inner',
  none: 'shadow-none',
} as const;

// Valid shadow class names for property testing
export const VALID_SHADOW_CLASSES = Object.values(SHADOW_TOKENS);

const Card = ({
  children,
  variant = 'default',
  hover = 'lift',
  padding = 'md',
  aspectRatio = 'auto',
  className = '',
  onClick,
  hoverable = false,
  'data-testid': testId,
  ...props
}: CardProps) => {
  // Base classes with premium rounded corners and overflow handling
  const baseClasses = 'rounded-xl overflow-hidden transition-all duration-300 ease-smooth';
  
  // Variant-specific styling using design system tokens
  const variantClasses: Record<CardVariant, string> = {
    default: 'bg-surface-card border-subtle',
    project: 'bg-surface-card border-subtle cursor-pointer',
    course: 'bg-surface-card border-subtle',
    elevated: 'bg-surface-elevated shadow-card border-subtle-light',
    glass: 'glass rounded-xl',
  };

  // Padding classes using spacing scale
  const paddingClasses: Record<CardPadding, string> = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  // Aspect ratio classes for image containers
  const aspectRatioClasses: Record<CardAspectRatio, string> = {
    '16/9': 'aspect-video',
    '4/3': 'aspect-[4/3]',
    '1/1': 'aspect-square',
    'auto': '',
  };

  // Hover effect classes (CSS-based for non-interactive cards)
  const hoverEffectClasses: Record<CardHoverEffect, string> = {
    lift: 'hover-lift',
    glow: 'hover-glow',
    scale: 'hover-scale',
    none: '',
  };

  const interactiveClasses = onClick || hoverable ? 'cursor-pointer' : '';
  
  const combinedClasses = [
    baseClasses,
    variantClasses[variant],
    paddingClasses[padding],
    aspectRatioClasses[aspectRatio],
    interactiveClasses,
    className,
  ].filter(Boolean).join(' ');

  const isInteractive = onClick || hoverable;

  // Select appropriate animation variants based on hover effect
  const getHoverVariants = () => {
    switch (hover) {
      case 'lift':
        return cardLiftVariants;
      case 'glow':
        return cardGlowVariants;
      case 'scale':
        return cardHoverVariants;
      case 'none':
      default:
        return undefined;
    }
  };

  if (isInteractive && hover !== 'none') {
    const variants = getHoverVariants();
    return (
      <motion.div
        className={combinedClasses}
        variants={variants}
        initial="rest"
        whileHover="hover"
        onClick={onClick}
        data-testid={testId}
        data-variant={variant}
        data-hover={hover}
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  // Apply CSS hover classes for non-motion cards (always apply hover effect class)
  const staticHoverClasses = hover !== 'none' ? hoverEffectClasses[hover] : '';

  return (
    <div 
      className={`${combinedClasses} ${staticHoverClasses}`.trim()} 
      onClick={onClick}
      data-testid={testId}
      data-variant={variant}
      data-hover={hover}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;