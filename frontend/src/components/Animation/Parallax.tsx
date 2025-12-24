import { motion, useScroll, useTransform } from 'framer-motion';
import { ReactNode, useRef } from 'react';
import { animationConfig, prefersReducedMotion } from '../../utils/animationConfig';

interface ParallaxProps {
  children: ReactNode;
  speed?: number;
  className?: string;
  direction?: 'up' | 'down';
}

const Parallax = ({ 
  children, 
  speed = animationConfig.parallax.default,
  className = '',
  direction = 'up'
}: ParallaxProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  // Check if user prefers reduced motion
  const reducedMotion = prefersReducedMotion();

  // Disable parallax effect when reduced motion is preferred
  // Gentle parallax effect - limited movement to maintain professionalism
  // Maximum movement is 50px to ensure subtlety
  const maxMovement = reducedMotion ? 0 : 50;
  const movement = speed * maxMovement;
  
  const y = useTransform(
    scrollYProgress, 
    [0, 1], 
    direction === 'up' ? [movement, -movement] : [-movement, movement]
  );

  // When reduced motion is preferred, render without parallax effect
  if (reducedMotion) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      style={{ y }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default Parallax;
