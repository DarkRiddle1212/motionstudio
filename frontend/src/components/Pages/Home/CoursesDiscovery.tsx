import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FadeIn } from '../../Animation';
import { CourseCard, Button } from '../../Common';
import { useCourses } from '../../../hooks/useCourses';
import { prefersReducedMotion } from '../../../utils/animationConfig';

/**
 * Premium Courses Discovery Section Component
 * 
 * Features:
 * - Premium course cards with pricing badges
 * - Hover effects with subtle lift and shadow
 * - Scroll-triggered fade-in animations
 * - Clear CTAs for enrollment
 * 
 * Requirements: 6.3, 5.1
 */

/**
 * Loading Skeleton for course cards
 */
const CourseCardSkeleton = () => (
  <div className="relative overflow-hidden rounded-xl bg-surface-card border-subtle animate-pulse">
    <div className="aspect-video bg-surface-elevated" />
    <div className="p-6">
      <div className="h-5 bg-white/10 rounded w-3/4 mb-3" />
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-full bg-white/10" />
        <div className="h-3 bg-white/10 rounded w-24" />
      </div>
      <div className="h-3 bg-white/10 rounded w-full mb-2" />
      <div className="h-3 bg-white/10 rounded w-2/3 mb-4" />
      <div className="flex gap-4 mb-5 pb-5 border-b border-white/5">
        <div className="h-3 bg-white/10 rounded w-16" />
        <div className="h-3 bg-white/10 rounded w-20" />
        <div className="h-3 bg-white/10 rounded w-24" />
      </div>
      <div className="h-10 bg-white/10 rounded w-full" />
    </div>
  </div>
);

/**
 * View All Courses Link with arrow animation
 */
const ViewAllCoursesLink = () => {
  const navigate = useNavigate();
  
  return (
    <motion.button
      onClick={() => navigate('/courses')}
      className="group inline-flex items-center gap-2 px-6 py-3 text-brand-accent font-medium text-body-md transition-colors duration-300 hover:text-brand-accent-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 focus-visible:ring-offset-brand-primary-bg rounded-lg"
      data-testid="view-all-courses-link"
      whileHover={{ x: 4 }}
      transition={{ duration: 0.2 }}
    >
      <span>View All Courses</span>
      <svg 
        className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    </motion.button>
  );
};

/**
 * Main Courses Discovery Section
 */
const CoursesDiscovery = () => {
  const navigate = useNavigate();
  const { courses, loading } = useCourses();
  const reducedMotion = prefersReducedMotion();
  
  // Get first 3 courses for featured section
  const featuredCourses = courses?.slice(0, 3) || [];

  const handleViewDetails = (courseId: string) => {
    navigate(`/courses/${courseId}`);
  };

  const handleEnroll = (courseId: string) => {
    navigate(`/courses/${courseId}`);
  };

  // Stagger container variants for the grid
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: reducedMotion ? 0 : 0.15,
        delayChildren: reducedMotion ? 0 : 0.2,
      }
    }
  };

  return (
    <section 
      className="section-spacing bg-brand-primary-bg relative overflow-hidden"
      aria-labelledby="courses-discovery-heading"
      data-testid="courses-discovery-section"
    >
      {/* Subtle accent glow background */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-radial from-brand-accent/5 via-transparent to-transparent blur-3xl" 
        aria-hidden="true"
      />
      
      {/* Decorative gradient orbs */}
      <div 
        className="absolute bottom-1/4 right-0 w-[400px] h-[400px] bg-gradient-radial from-brand-accent/3 via-transparent to-transparent blur-3xl" 
        aria-hidden="true"
      />
      
      <div className="container-premium relative z-10">
        {/* Section Header */}
        <FadeIn inView={true}>
          <div className="text-center mb-12 sm:mb-16 lg:mb-20">
            <span className="inline-block text-premium-caption text-brand-accent uppercase tracking-widest mb-4">
              Education
            </span>
            <h2 
              id="courses-discovery-heading"
              className="text-display-sm sm:text-display-md lg:text-display-lg font-serif font-bold text-brand-primary-text mb-4 sm:mb-6"
            >
              Learn Motion Design
            </h2>
            <p className="text-body-md sm:text-body-lg text-brand-secondary-text max-w-2xl mx-auto">
              Master the art of motion design with our comprehensive courses taught by industry experts
            </p>
          </div>
        </FadeIn>

        {/* Courses Grid */}
        {loading ? (
          <div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12"
            data-testid="courses-loading-skeleton"
          >
            {[1, 2, 3].map((i) => (
              <CourseCardSkeleton key={i} />
            ))}
          </div>
        ) : featuredCourses.length > 0 ? (
          <>
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              data-testid="courses-discovery-grid"
            >
              {featuredCourses.map((course, index) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onViewDetails={handleViewDetails}
                  onEnroll={handleEnroll}
                  index={index}
                  data-testid={`featured-course-${course.id}`}
                />
              ))}
            </motion.div>
            
            {/* View All Link */}
            <FadeIn inView={true} delay={0.4}>
              <div className="text-center">
                <ViewAllCoursesLink />
              </div>
            </FadeIn>
          </>
        ) : (
          <FadeIn inView={true} delay={0.2}>
            <div className="text-center py-12 sm:py-16">
              <div className="text-4xl sm:text-5xl mb-4" aria-hidden="true">🎓</div>
              <p className="text-brand-secondary-text text-body-lg mb-6">
                Courses coming soon!
              </p>
              <Button
                variant="secondary"
                size="md"
                onClick={() => navigate('/contact')}
                data-testid="notify-courses-cta"
              >
                Get Notified
              </Button>
            </div>
          </FadeIn>
        )}
      </div>
    </section>
  );
};

export default CoursesDiscovery;
