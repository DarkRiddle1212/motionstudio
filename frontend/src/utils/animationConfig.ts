// Animation configuration for Motion Design Studio Platform
// Ensures subtle, professional animations throughout the application

export const animationConfig = {
  // Timing functions - no bouncing, shaking, or aggressive easing
  easing: {
    default: "easeOut",
    gentle: [0.25, 0.46, 0.45, 0.94], // Custom gentle cubic-bezier
    smooth: [0.4, 0, 0.2, 1], // Material Design standard
  },

  // Duration presets for consistency
  duration: {
    fast: 0.3,
    default: 0.6,
    slow: 0.9,
    // Reduced motion duration (instant)
    reduced: 0.01,
  },

  // Distance presets for movement animations
  distance: {
    small: 20,
    default: 30,
    large: 50,
  },

  // Parallax speed presets (limited for professionalism)
  parallax: {
    subtle: 0.3,
    default: 0.5,
    noticeable: 0.7,
  },

  // Stagger delays for sequential animations
  stagger: {
    fast: 0.1,
    default: 0.15,
    slow: 0.2,
  },

  // Viewport animation thresholds
  viewport: {
    once: true, // Animate only once when entering viewport
    margin: "0px 0px -100px 0px", // Trigger slightly before element is visible
    amount: 0.3, // Percentage of element that needs to be visible
  },

  // Hover animation presets (subtle only)
  hover: {
    scale: 1.02, // Very subtle scale increase
    duration: 0.2,
    easing: "easeOut",
  },

  // Focus animation presets
  focus: {
    scale: 1.01,
    duration: 0.15,
    easing: "easeOut",
  },

  // Reduced motion configuration
  reducedMotion: {
    // When reduced motion is preferred, use these values
    duration: 0.01,
    distance: 0,
    scale: 1,
    // Simple opacity transition as fallback
    transition: {
      duration: 0.01,
      ease: "linear",
    },
  },
} as const;

/**
 * Check if user prefers reduced motion
 * Returns true if the user has enabled reduced motion in their system settings
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Get animation duration based on user's motion preference
 * Returns reduced duration if user prefers reduced motion
 */
export const getAnimationDuration = (normalDuration: number): number => {
  return prefersReducedMotion() ? animationConfig.reducedMotion.duration : normalDuration;
};

/**
 * Get animation distance based on user's motion preference
 * Returns 0 if user prefers reduced motion (no movement)
 */
export const getAnimationDistance = (normalDistance: number): number => {
  return prefersReducedMotion() ? animationConfig.reducedMotion.distance : normalDistance;
};

/**
 * Get transition configuration based on user's motion preference
 */
export const getTransitionConfig = (normalConfig: { duration: number; ease: string | number[] }) => {
  if (prefersReducedMotion()) {
    return animationConfig.reducedMotion.transition;
  }
  return normalConfig;
};

// Animation variants for common patterns
export const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: {
      duration: animationConfig.duration.default,
      ease: animationConfig.easing.default,
    }
  },
};

export const slideUpVariants = {
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
  },
};

export const staggerContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: animationConfig.stagger.default,
    }
  },
};

// Utility function to create consistent hover animations
export const createHoverAnimation = (scale = animationConfig.hover.scale) => ({
  whileHover: { 
    scale,
    transition: {
      duration: animationConfig.hover.duration,
      ease: animationConfig.hover.easing,
    }
  },
});

// Utility function to create consistent focus animations
export const createFocusAnimation = (scale = animationConfig.focus.scale) => ({
  whileFocus: { 
    scale,
    transition: {
      duration: animationConfig.focus.duration,
      ease: animationConfig.focus.easing,
    }
  },
});