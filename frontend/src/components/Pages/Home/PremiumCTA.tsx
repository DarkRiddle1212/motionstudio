import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../../Common';
import { FadeIn } from '../../Animation';

/**
 * Premium CTA Section Component
 * 
 * Features:
 * - Compelling call-to-action with gradient background
 * - Premium buttons for primary actions
 * - Subtle background animation with floating orbs
 * - Animated decorative elements
 * 
 * Requirements: 6.1
 */
const PremiumCTA = () => {
  const navigate = useNavigate();

  // Floating orb animation variants
  const floatVariants = {
    animate: {
      y: [-15, 15, -15],
      x: [-5, 5, -5],
      transition: {
        duration: 8,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  const floatVariantsAlt = {
    animate: {
      y: [10, -10, 10],
      x: [5, -5, 5],
      transition: {
        duration: 10,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  // Pulse animation for accent elements
  const pulseVariants = {
    animate: {
      scale: [1, 1.1, 1],
      opacity: [0.1, 0.2, 0.1],
      transition: {
        duration: 5,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  // Shimmer line animation
  const shimmerVariants = {
    animate: {
      x: ['-100%', '100%'],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: 'linear',
        repeatDelay: 2,
      },
    },
  };

  return (
    <section 
      className="relative py-20 sm:py-24 lg:py-32 overflow-hidden"
      data-testid="premium-cta-section"
      aria-labelledby="cta-heading"
    >
      {/* Premium Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-primary-bg via-brand-secondary-bg to-brand-tertiary-bg" />
      
      {/* Animated Mesh Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-mesh opacity-80" />
      
      {/* Animated Floating Orbs */}
      <motion.div
        variants={floatVariants}
        animate="animate"
        className="absolute top-1/4 left-[10%] w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 rounded-full bg-gradient-radial from-brand-accent/10 via-brand-accent/5 to-transparent blur-3xl pointer-events-none"
      />
      <motion.div
        variants={floatVariantsAlt}
        animate="animate"
        className="absolute bottom-1/4 right-[10%] w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80 rounded-full bg-gradient-radial from-brand-accent/8 via-brand-accent/3 to-transparent blur-3xl pointer-events-none"
      />
      
      {/* Pulsing Accent Circles */}
      <motion.div
        variants={pulseVariants}
        animate="animate"
        className="absolute top-1/3 right-1/4 w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-brand-accent/10 blur-2xl pointer-events-none hidden md:block"
      />
      <motion.div
        variants={pulseVariants}
        animate="animate"
        style={{ animationDelay: '2.5s' }}
        className="absolute bottom-1/3 left-1/4 w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-brand-accent/8 blur-2xl pointer-events-none hidden md:block"
      />
      
      {/* Decorative Lines with Shimmer Effect */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-accent/30 to-transparent overflow-hidden">
        <motion.div
          variants={shimmerVariants}
          animate="animate"
          className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-accent/60 to-transparent"
        />
      </div>
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-accent/30 to-transparent overflow-hidden">
        <motion.div
          variants={shimmerVariants}
          animate="animate"
          style={{ animationDelay: '1.5s' }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-accent/60 to-transparent"
        />
      </div>
      
      {/* Vertical Decorative Lines */}
      <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-brand-accent/10 to-transparent hidden lg:block" />
      <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-brand-accent/10 to-transparent hidden lg:block" />
      
      {/* Noise Texture Overlay */}
      <div className="absolute inset-0 noise-overlay-light opacity-20 pointer-events-none" />
      
      {/* Content Container */}
      <div className="container-narrow relative z-10">
        <FadeIn inView={true}>
          <div className="text-center">
            {/* Premium Label */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="mb-6"
            >
              <span className="inline-block px-4 py-1.5 text-premium-caption text-brand-accent uppercase tracking-widest border border-brand-accent/30 rounded-full bg-brand-accent/5 backdrop-blur-sm">
                Get Started Today
              </span>
            </motion.div>
            
            {/* Main Heading */}
            <motion.h2
              id="cta-heading"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-display-sm sm:text-display-md lg:text-display-lg font-serif font-bold text-brand-primary-text mb-4 sm:mb-6"
            >
              Ready to Create
              <span className="block text-brand-accent">Something Amazing?</span>
            </motion.h2>
            
            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-body-md sm:text-body-lg text-brand-secondary-text max-w-xl mx-auto mb-8 sm:mb-12 leading-relaxed"
            >
              Whether you want to hire us for your next project or learn motion design yourself, 
              we're here to help you bring your creative vision to life.
            </motion.p>
            
            {/* Premium CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center"
            >
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/contact')}
                className="w-full sm:w-auto min-w-[200px] shadow-premium hover:shadow-glow-lg group relative overflow-hidden"
                data-testid="cta-hire-button"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Start Your Project
                  <motion.svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    initial={{ x: 0 }}
                    whileHover={{ x: 4 }}
                    transition={{ duration: 0.2 }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </motion.svg>
                </span>
              </Button>
              
              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate('/courses')}
                className="w-full sm:w-auto min-w-[200px] group"
                data-testid="cta-courses-button"
              >
                <span className="flex items-center justify-center gap-2">
                  Explore Courses
                  <motion.svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    initial={{ x: 0 }}
                    whileHover={{ x: 4 }}
                    transition={{ duration: 0.2 }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </motion.svg>
                </span>
              </Button>
            </motion.div>
            
            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              viewport={{ once: true }}
              className="mt-12 sm:mt-16 flex flex-wrap justify-center items-center gap-6 sm:gap-8 text-brand-muted-text text-body-sm"
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-brand-accent" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Free Consultation</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-brand-accent" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Expert Instructors</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-brand-accent" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Lifetime Access</span>
              </div>
            </motion.div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
};

export default PremiumCTA;
