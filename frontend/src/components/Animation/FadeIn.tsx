import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { animationConfig, prefersReducedMotion, getAnimationDuration } from '../../utils/animationConfig';

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
  inView?: boolean; // For scroll-triggered animations
}

const FadeIn = ({ 
  children, 
  delay = 0, 
  duration = animationConfig.duration.default, 
  className = '',
  inView = false
}: FadeInProps) => {
  // Check if user prefers reduced motion
  const reducedMotion = prefersReducedMotion();
  
  // Use reduced duration if user prefers reduced motion
  const effectiveDuration = reducedMotion 
    ? animationConfig.reducedMotion.duration 
    : duration;
  
  // Use no delay if user prefers reduced motion
  const effectiveDelay = reducedMotion ? 0 : delay;
  
  const customVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        duration: effectiveDuration,
        delay: effectiveDelay,
        ease: reducedMotion ? 'linear' : animationConfig.easing.default,
      }
    },
  };

  if (inView) {
    return (
      <motion.div
        variants={customVariants}
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
      variants={customVariants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default FadeIn;
