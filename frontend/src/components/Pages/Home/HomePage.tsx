import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../../Common';
import { Layout } from '../../Layout';
import FeaturedProjects from './FeaturedProjects';
import CoursesDiscovery from './CoursesDiscovery';
import Testimonials from './Testimonials';
import PremiumCTA from './PremiumCTA';

/**
 * Premium HomePage Component
 * 
 * Features:
 * - Full-viewport hero with gradient background
 * - Animated decorative elements with parallax
 * - Display-2xl typography for main heading
 * - Staggered content reveal animation
 * - Premium CTA buttons with proper spacing
 * - Featured Projects section with premium cards
 * 
 * Requirements: 6.1, 5.1, 5.2, 6.2
 */
const HomePage = () => {
  const navigate = useNavigate();

  // Staggered animation variants for hero content
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  };

  // Decorative element animation variants
  const floatVariants = {
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  const pulseVariants = {
    animate: {
      scale: [1, 1.05, 1],
      opacity: [0.15, 0.25, 0.15],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  return (
    <Layout className="bg-brand-primary-bg">
      {/* ============================================
          PREMIUM HERO SECTION
          Requirements: 6.1, 5.1, 5.2
          ============================================ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Premium Gradient Background with Mesh Effect */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          {/* Base gradient */}
          <div className="absolute inset-0 bg-gradient-hero-radial" />
          
          {/* Animated gradient orbs - Modern Indigo */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-gradient-radial from-brand-accent/15 via-brand-accent/8 to-transparent blur-3xl" />
          </div>
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-gradient-radial from-brand-accent/12 via-transparent to-transparent blur-3xl" />
          </div>
          
          {/* Noise texture overlay for premium feel */}
          <div className="absolute inset-0 noise-overlay-light opacity-20" />
        </div>

        {/* Animated Decorative Elements */}
        {/* Large accent circle - top left */}
        <div className="absolute top-16 left-8 sm:top-20 sm:left-16 lg:top-24 lg:left-24 z-0 hidden sm:block pointer-events-none">
          <motion.div
            variants={floatVariants}
            animate="animate"
            className="w-20 h-20 sm:w-28 sm:h-28 lg:w-40 lg:h-40 rounded-full bg-gradient-accent opacity-15 blur-sm"
          />
        </div>

        {/* Medium accent circle - top right */}
        <div className="absolute top-32 right-12 sm:top-40 sm:right-20 lg:top-48 lg:right-32 z-0 hidden md:block pointer-events-none">
          <motion.div
            variants={pulseVariants}
            animate="animate"
            className="w-16 h-16 sm:w-20 sm:h-20 lg:w-28 lg:h-28 rounded-full bg-brand-accent/20 blur-md"
          />
        </div>

        {/* Small accent circle - bottom left */}
        <div className="absolute bottom-32 left-16 sm:bottom-40 sm:left-24 lg:bottom-48 lg:left-32 z-0 hidden sm:block pointer-events-none">
          <motion.div
            variants={floatVariants}
            animate="animate"
            style={{ animationDelay: '2s' }}
            className="w-12 h-12 sm:w-16 sm:h-16 lg:w-24 lg:h-24 rounded-full bg-brand-accent opacity-10 blur-sm"
          />
        </div>

        {/* Large accent circle - bottom right */}
        <div className="absolute bottom-20 right-8 sm:bottom-24 sm:right-16 lg:bottom-32 lg:right-24 z-0 hidden sm:block pointer-events-none">
          <motion.div
            variants={pulseVariants}
            animate="animate"
            style={{ animationDelay: '1s' }}
            className="w-24 h-24 sm:w-32 sm:h-32 lg:w-48 lg:h-48 rounded-full bg-gradient-accent opacity-10 blur-lg"
          />
        </div>

        {/* Decorative lines */}
        <div className="absolute top-1/3 left-0 w-32 h-px bg-gradient-to-r from-transparent via-brand-accent/20 to-transparent hidden lg:block" />
        <div className="absolute bottom-1/3 right-0 w-32 h-px bg-gradient-to-l from-transparent via-brand-accent/20 to-transparent hidden lg:block" />

        {/* Hero Content with Staggered Animation */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 container-premium text-center"
        >
          {/* Premium Label */}
          <motion.div variants={itemVariants} className="mb-6 sm:mb-8">
            <span className="inline-block px-6 py-3 text-premium-caption text-brand-accent uppercase tracking-widest border border-brand-accent/40 rounded-full bg-brand-accent/8 backdrop-blur-sm shadow-glow">
              Motion Design Studio
            </span>
          </motion.div>

          {/* Main Heading - Display 2XL Typography */}
          <motion.h1
            variants={itemVariants}
            className="text-display-md sm:text-display-lg md:text-display-xl lg:text-display-2xl font-serif font-bold text-brand-primary-text mb-6 sm:mb-8 leading-tight text-balance"
          >
            <span className="block">Create Stunning</span>
            <span className="block text-brand-accent">Motion Experiences</span>
          </motion.h1>

          {/* Tagline - Body Large Typography */}
          <motion.p
            variants={itemVariants}
            className="text-body-md sm:text-body-lg text-brand-secondary-text mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed text-pretty px-4"
          >
            Transform your ideas into captivating motion graphics and animations. 
            Learn from industry professionals or let our team bring your vision to life.
          </motion.p>

          {/* Premium CTA Buttons with Proper Spacing */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center px-4"
          >
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/contact')}
              className="w-full sm:w-auto min-w-[200px]"
              data-testid="hire-us-cta"
            >
              Get Started Today
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate('/courses')}
              className="w-full sm:w-auto min-w-[200px]"
              data-testid="browse-courses-cta"
            >
              Explore Courses
            </Button>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            variants={itemVariants}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 hidden md:block"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="w-6 h-10 border-2 border-brand-secondary-text/30 rounded-full flex justify-center pt-2"
            >
              <motion.div
                animate={{ opacity: [0.3, 1, 0.3], y: [0, 8, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="w-1.5 h-1.5 bg-brand-accent rounded-full"
              />
            </motion.div>
          </motion.div>
        </motion.div>
      </section>


      {/* ============================================
          FEATURED PROJECTS SECTION
          Requirements: 6.2, 5.1
          ============================================ */}
      <FeaturedProjects />

      {/* ============================================
          COURSES DISCOVERY SECTION
          Requirements: 6.3, 5.1
          ============================================ */}
      <CoursesDiscovery />

      {/* ============================================
          TESTIMONIALS SECTION
          Requirements: 6.4
          ============================================ */}
      <Testimonials />

      {/* ============================================
          PREMIUM CTA SECTION
          Requirements: 6.1
          ============================================ */}
      <PremiumCTA />
    </Layout>
  );
};

export default HomePage;
