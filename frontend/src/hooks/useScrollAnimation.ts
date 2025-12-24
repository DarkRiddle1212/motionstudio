import { useInView } from 'framer-motion';
import { useRef } from 'react';

interface UseScrollAnimationOptions {
  amount?: number;
  once?: boolean;
  margin?: string;
}

export const useScrollAnimation = (options: UseScrollAnimationOptions = {}) => {
  const {
    amount = 0.1,
    once = true,
    margin = "0px 0px -100px 0px"
  } = options;

  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, {
    amount,
    once,
    margin,
  });

  return { ref, isInView };
};