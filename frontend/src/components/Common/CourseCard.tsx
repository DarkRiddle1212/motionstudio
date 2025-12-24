import { motion } from 'framer-motion';
import { Course } from '../../hooks/useCourses';
import Button from './Button';
import { prefersReducedMotion } from '../../utils/animationConfig';

interface CourseCardProps {
  course: Course;
  onEnroll?: (courseId: string) => void;
  onViewDetails?: (courseId: string) => void;
  showEnrollButton?: boolean;
  isEnrolled?: boolean;
  className?: string;
  /** Animation delay index for staggered animations */
  index?: number;
}

/**
 * Premium Course Card Component
 * 
 * Features:
 * - Premium styling with pricing badges
 * - Hover effects with subtle lift and shadow
 * - Scroll-triggered fade-in animations
 * - Clear CTAs for enrollment
 * 
 * Requirements: 6.3, 5.1
 */
export const CourseCard = ({
  course,
  onEnroll,
  onViewDetails,
  showEnrollButton = true,
  isEnrolled = false,
  className = '',
  index = 0,
}: CourseCardProps) => {
  const isFree = course.pricing === 0;
  const instructorName = `${course.instructor.firstName} ${course.instructor.lastName}`;
  const reducedMotion = prefersReducedMotion();

  const handleEnroll = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEnroll) {
      onEnroll(course.id);
    }
  };

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(course.id);
    }
  };

  // Format price display
  const formatPrice = (price: number) => {
    if (price === 0) return 'Free';
    return `$${price}`;
  };

  // Staggered animation variants for scroll-triggered reveal
  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: reducedMotion ? 0 : 30 
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: reducedMotion ? 0.01 : 0.6,
        delay: reducedMotion ? 0 : index * 0.15,
        ease: [0.25, 0.1, 0.25, 1],
      }
    }
  };

  return (
    <motion.article
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      className={`group relative cursor-pointer ${className}`}
      onClick={handleViewDetails}
      data-testid={`course-card-${course.id}`}
      role="article"
      aria-label={`Course: ${course.title}`}
    >
      {/* Card Container with premium styling */}
      <div className="relative overflow-hidden rounded-xl bg-surface-card border-subtle shadow-card transition-all duration-400 ease-smooth group-hover:shadow-card-hover group-hover:-translate-y-1">
        {/* Course Thumbnail with zoom effect */}
        <div className="relative aspect-video overflow-hidden">
          {course.thumbnailUrl ? (
            <img
              src={course.thumbnailUrl}
              alt={course.title}
              className="w-full h-full object-cover transition-transform duration-500 ease-smooth group-hover:scale-110"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-surface-elevated">
              <div className="text-5xl transition-transform duration-300 group-hover:scale-110" aria-hidden="true">📚</div>
            </div>
          )}
          
          {/* Gradient Overlay */}
          <div 
            className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-50 transition-opacity duration-400 group-hover:opacity-70"
            aria-hidden="true"
          />
          
          {/* Accent Color Overlay on hover */}
          <div 
            className="absolute inset-0 bg-brand-accent/0 transition-all duration-400 group-hover:bg-brand-accent/5"
            aria-hidden="true"
          />
          
          {/* Premium Price Badge */}
          <div className="absolute top-4 right-4 z-10">
            <span 
              className={`
                inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold
                backdrop-blur-md border shadow-lg
                ${isFree 
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                  : 'bg-brand-accent/20 text-brand-accent-light border-brand-accent/30'
                }
              `}
            >
              {formatPrice(course.pricing)}
            </span>
          </div>

          {/* Enrolled Badge */}
          {isEnrolled && (
            <div className="absolute top-4 left-4 z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-brand-accent/30 text-white border border-brand-accent/40 backdrop-blur-md">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Enrolled
              </span>
            </div>
          )}
        </div>

        {/* Course Content */}
        <div className="p-6">
          {/* Course Title */}
          <h3 className="text-heading-md font-serif font-semibold text-brand-primary-text mb-2 line-clamp-2 transition-colors duration-300 group-hover:text-brand-accent-light">
            {course.title}
          </h3>

          {/* Instructor with avatar placeholder */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-brand-accent/20 flex items-center justify-center text-xs text-brand-accent font-medium">
              {course.instructor.firstName.charAt(0)}
            </div>
            <p className="text-body-sm text-brand-secondary-text">
              {instructorName}
            </p>
          </div>

          {/* Course Description */}
          <p className="text-body-sm text-brand-secondary-text mb-4 line-clamp-2">
            {course.description}
          </p>

          {/* Course Stats with icons */}
          <div className="flex items-center gap-4 text-caption text-brand-muted-text mb-5 pb-5 border-b border-white/5">
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {course.duration}
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              {course._count.lessons} lessons
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {course._count.enrollments} students
            </span>
          </div>

          {/* Action Buttons */}
          {showEnrollButton && !isEnrolled && (
            <Button
              variant={isFree ? 'primary' : 'secondary'}
              size="md"
              onClick={handleEnroll}
              className="w-full shadow-button hover:shadow-button-hover"
              data-testid={`enroll-button-${course.id}`}
            >
              {isFree ? 'Start Learning Free' : `Enroll for ${formatPrice(course.pricing)}`}
            </Button>
          )}

          {isEnrolled && (
            <Button
              variant="primary"
              size="md"
              onClick={handleViewDetails}
              className="w-full"
              data-testid={`continue-button-${course.id}`}
              rightIcon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              }
            >
              Continue Learning
            </Button>
          )}
        </div>
      </div>
    </motion.article>
  );
};
