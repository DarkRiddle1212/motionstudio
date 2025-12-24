import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { animationConfig, prefersReducedMotion } from '../../utils/animationConfig';

// Stagger Container - for animating lists of items with delays
interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  inView?: boolean;
}

export const StaggerContainer = ({ 
  children, 
  className = '',
  staggerDelay = animationConfig.stagger.default,
  inView = true
}: StaggerContainerProps) => {
  // Check if user prefers reduced motion
  const reducedMotion = prefersReducedMotion();
  
  // No stagger delay when reduced motion is preferred
  const effectiveStaggerDelay = reducedMotion ? 0 : staggerDelay;
  
  const variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: effectiveStaggerDelay,
      }
    },
  };

  if (inView) {
    return (
      <motion.div
        variants={variants}
        initial="hidden"
        whileInView="visible"
        viewport={animationConfig.viewport}
        className={className}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Stagger Item - individual items within a stagger container
interface StaggerItemProps {
  children: ReactNode;
  className?: string;
}

export const StaggerItem = ({ children, className = '' }: StaggerItemProps) => {
  // Check if user prefers reduced motion
  const reducedMotion = prefersReducedMotion();
  
  const variants = {
    hidden: { 
      opacity: 0, 
      // No movement when reduced motion is preferred
      y: reducedMotion ? 0 : animationConfig.distance.small 
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: reducedMotion 
          ? animationConfig.reducedMotion.duration 
          : animationConfig.duration.default,
        ease: reducedMotion ? 'linear' : animationConfig.easing.default,
      }
    },
  };

  return (
    <motion.div variants={variants} className={className}>
      {children}
    </motion.div>
  );
};

// Scale on Hover - subtle hover effect for interactive elements
interface ScaleOnHoverProps {
  children: ReactNode;
  scale?: number;
  className?: string;
}

export const ScaleOnHover = ({ 
  children, 
  scale = animationConfig.hover.scale,
  className = '' 
}: ScaleOnHoverProps) => {
  // Check if user prefers reduced motion
  const reducedMotion = prefersReducedMotion();
  
  // No scale effect when reduced motion is preferred
  if (reducedMotion) {
    return (
      <div className={className}>
        {children}
      </div>
    );
  }
  
  return (
    <motion.div
      whileHover={{ 
        scale,
        transition: {
          duration: animationConfig.hover.duration,
          ease: animationConfig.hover.easing,
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Gentle Bounce - very subtle bounce for buttons and CTAs
interface GentleBounceProps {
  children: ReactNode;
  className?: string;
}

export const GentleBounce = ({ children, className = '' }: GentleBounceProps) => {
  // Check if user prefers reduced motion
  const reducedMotion = prefersReducedMotion();
  
  // No bounce effect when reduced motion is preferred
  if (reducedMotion) {
    return (
      <div className={className}>
        {children}
      </div>
    );
  }
  
  return (
    <motion.div
      whileTap={{ 
        scale: 0.98,
        transition: {
          duration: 0.1,
          ease: animationConfig.easing.default,
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Fade In Up - combines fade and slide for a common pattern
interface FadeInUpProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  inView?: boolean;
}

export const FadeInUp = ({ 
  children, 
  delay = 0,
  className = '',
  inView = true
}: FadeInUpProps) => {
  // Check if user prefers reduced motion
  const reducedMotion = prefersReducedMotion();
  
  const variants = {
    hidden: { 
      opacity: 0, 
      // No movement when reduced motion is preferred
      y: reducedMotion ? 0 : animationConfig.distance.default 
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: reducedMotion 
          ? animationConfig.reducedMotion.duration 
          : animationConfig.duration.default,
        delay: reducedMotion ? 0 : delay,
        ease: reducedMotion ? 'linear' : animationConfig.easing.default,
      }
    },
  };

  if (inView) {
    return (
      <motion.div
        variants={variants}
        initial="hidden"
        whileInView="visible"
        viewport={animationConfig.viewport}
        className={className}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {children}
    </motion.div>
  );
};
