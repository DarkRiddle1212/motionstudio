import { Variants } from 'framer-motion';
import { animationConfig, prefersReducedMotion } from './animationConfig';

/**
 * Creates animation variants that respect reduced motion preferences
 * When reduced motion is preferred, animations use instant transitions with opacity only
 */
const createReducedMotionVariants = (
  normalVariants: Variants,
  reducedVariants?: Variants
): Variants => {
  // Return reduced variants if provided, otherwise create simple opacity-only variants
  if (reducedVariants) return reducedVariants;
  
  return {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        duration: animationConfig.reducedMotion.duration,
        ease: 'linear',
      }
    }
  };
};

// Reduced motion variants - simple opacity transitions only
export const reducedMotionVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: {
      duration: animationConfig.reducedMotion.duration,
      ease: 'linear',
    }
  }
};

// Common animation variants for consistent use across the platform
export const fadeInVariants: Variants = {
  hidden: { 
    opacity: 0 
  },
  visible: { 
    opacity: 1,
    transition: {
      duration: animationConfig.duration.default,
      ease: animationConfig.easing.default,
    }
  }
};

export const slideUpVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: animationConfig.distance.default 
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: animationConfig.duration.default,
      ease: animationConfig.easing.default,
    }
  }
};

export const slideInFromLeftVariants: Variants = {
  hidden: { 
    opacity: 0, 
    x: -animationConfig.distance.large 
  },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: animationConfig.duration.default,
      ease: animationConfig.easing.default,
    }
  }
};

export const slideInFromRightVariants: Variants = {
  hidden: { 
    opacity: 0, 
    x: animationConfig.distance.large 
  },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: animationConfig.duration.default,
      ease: animationConfig.easing.default,
    }
  }
};

export const scaleInVariants: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.95 
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: animationConfig.duration.default,
      ease: animationConfig.easing.default,
    }
  }
};

// Stagger container for sequential animations
export const staggerContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: animationConfig.stagger.default,
    }
  }
};

// Reduced motion stagger container - no stagger delay
export const reducedMotionStaggerContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0,
    }
  }
};

// Hover variants for interactive elements
export const hoverVariants: Variants = {
  rest: { 
    scale: 1,
    transition: {
      duration: animationConfig.hover.duration,
      ease: animationConfig.hover.easing,
    }
  },
  hover: { 
    scale: animationConfig.hover.scale,
    transition: {
      duration: animationConfig.hover.duration,
      ease: animationConfig.hover.easing,
    }
  }
};

// Card hover variants with accent color (#C89AA6)
export const cardHoverVariants: Variants = {
  rest: { 
    scale: 1,
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    transition: {
      duration: animationConfig.hover.duration,
      ease: animationConfig.hover.easing,
    }
  },
  hover: { 
    scale: animationConfig.hover.scale,
    boxShadow: "0 10px 15px -3px rgba(200, 154, 166, 0.2)", // Using brand accent color
    transition: {
      duration: animationConfig.hover.duration,
      ease: animationConfig.hover.easing,
    }
  }
};

// Card lift variants - subtle lift with shadow transition
// Uses shadow-card and shadow-card-hover from design system
export const cardLiftVariants: Variants = {
  rest: {
    y: 0,
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2), 0 8px 16px rgba(0, 0, 0, 0.3)", // shadow-card
    transition: {
      duration: animationConfig.hover.duration,
      ease: animationConfig.hover.easing,
    }
  },
  hover: {
    y: -4,
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3), 0 16px 32px rgba(0, 0, 0, 0.4)", // shadow-card-hover
    transition: {
      duration: animationConfig.hover.duration,
      ease: animationConfig.hover.easing,
    }
  }
};

// Card glow variants - accent color glow effect
// Uses shadow-glow from design system
export const cardGlowVariants: Variants = {
  rest: {
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2), 0 8px 16px rgba(0, 0, 0, 0.3)", // shadow-card
    transition: {
      duration: animationConfig.hover.duration,
      ease: animationConfig.hover.easing,
    }
  },
  hover: {
    boxShadow: "0 0 20px rgba(200, 154, 166, 0.3), 0 4px 8px rgba(0, 0, 0, 0.3)", // shadow-glow + shadow
    transition: {
      duration: animationConfig.hover.duration,
      ease: animationConfig.hover.easing,
    }
  }
};

/**
 * Get appropriate variants based on user's motion preference
 * Returns reduced motion variants when user prefers reduced motion
 */
export const getMotionSafeVariants = (
  normalVariants: Variants,
  reducedVariants: Variants = reducedMotionVariants
): Variants => {
  return prefersReducedMotion() ? reducedVariants : normalVariants;
};

/**
 * Get appropriate stagger container variants based on user's motion preference
 */
export const getMotionSafeStaggerVariants = (): Variants => {
  return prefersReducedMotion() ? reducedMotionStaggerContainerVariants : staggerContainerVariants;
};
