import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { animationConfig, prefersReducedMotion } from '../../utils/animationConfig';

interface SlideUpProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  distance?: number;
  className?: string;
  inView?: boolean; // For scroll-triggered animations
}

const SlideUp = ({ 
  children, 
  delay = 0, 
  duration = animationConfig.duration.default, 
  distance = animationConfig.distance.default,
  className = '',
  inView = false
}: SlideUpProps) => {
  // Check if user prefers reduced motion
  const reducedMotion = prefersReducedMotion();
  
  // Use reduced values if user prefers reduced motion
  const effectiveDuration = reducedMotion 
    ? animationConfig.reducedMotion.duration 
    : duration;
  const effectiveDelay = reducedMotion ? 0 : delay;
  // No movement when reduced motion is preferred - only opacity transition
  const effectiveDistance = reducedMotion 
    ? animationConfig.reducedMotion.distance 
    : distance;
  
  const customVariants = {
    hidden: { 
      opacity: 0, 
      y: effectiveDistance 
    },
    visible: { 
      opacity: 1, 
      y: 0,
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

export default SlideUp;
