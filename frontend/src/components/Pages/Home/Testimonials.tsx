import { motion } from 'framer-motion';
import { FadeIn } from '../../Animation';
import { prefersReducedMotion } from '../../../utils/animationConfig';

/**
 * Premium Testimonials Section Component
 * 
 * Features:
 * - Premium testimonial cards with quotes
 * - Client photos with professional styling
 * - Grid layout with responsive design
 * - Subtle scroll-triggered animations
 * 
 * Requirements: 6.4
 */

interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  quote: string;
  avatarUrl: string;
  rating?: number;
}

// Sample testimonials data - in production, this would come from an API
const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    role: 'Creative Director',
    company: 'Pixel Studios',
    quote: 'The motion design course transformed how I approach animation. The instructors break down complex concepts into digestible lessons that stick with you.',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
    rating: 5,
  },
  {
    id: '2',
    name: 'Marcus Johnson',
    role: 'Senior Designer',
    company: 'Brand Co',
    quote: 'Working with Motion Design Studio on our rebrand was incredible. They brought our vision to life with animations that perfectly capture our brand essence.',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    rating: 5,
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    role: 'Marketing Lead',
    company: 'TechFlow',
    quote: 'The attention to detail and creative expertise exceeded our expectations. Our product launch video generated 3x more engagement than previous campaigns.',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    rating: 5,
  },
];

interface TestimonialCardProps {
  testimonial: Testimonial;
  index: number;
}

/**
 * Premium Testimonial Card with quote styling
 */
const TestimonialCard = ({ testimonial, index }: TestimonialCardProps) => {
  const reducedMotion = prefersReducedMotion();
  
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
      className="group relative"
      data-testid={`testimonial-card-${testimonial.id}`}
      role="article"
      aria-label={`Testimonial from ${testimonial.name}`}
    >
      {/* Card Container with premium styling */}
      <div className="relative h-full overflow-hidden rounded-2xl bg-[#1A1A1A] border border-white/5 shadow-lg transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-1 p-6 sm:p-8">
        {/* Quote Icon */}
        <div className="absolute top-6 right-6 sm:top-8 sm:right-8" aria-hidden="true">
          <svg 
            className="w-10 h-10 sm:w-12 sm:h-12 text-accent/20" 
            fill="currentColor" 
            viewBox="0 0 24 24"
          >
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
          </svg>
        </div>
        
        {/* Quote Text */}
        <blockquote className="relative z-10 mb-6 pr-8">
          <p className="text-base sm:text-lg text-secondary-text leading-relaxed">
            "{testimonial.quote}"
          </p>
        </blockquote>
        
        {/* Rating Stars */}
        {testimonial.rating && (
          <div className="flex gap-1 mb-6" aria-label={`Rating: ${testimonial.rating} out of 5 stars`}>
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-5 h-5 ${i < testimonial.rating! ? 'text-accent' : 'text-secondary-text/30'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
        )}
        
        {/* Author Info */}
        <div className="flex items-center gap-4 pt-4 border-t border-white/5">
          {/* Avatar with professional styling */}
          <div className="relative flex-shrink-0">
            <div className="w-14 h-14 rounded-full overflow-hidden ring-2 ring-accent/30 ring-offset-2 ring-offset-[#1A1A1A]">
              <img
                src={testimonial.avatarUrl}
                alt={`${testimonial.name}'s profile photo`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
          
          {/* Name and Role */}
          <div>
            <h3 className="text-lg font-serif font-semibold text-primary-text">
              {testimonial.name}
            </h3>
            <p className="text-sm text-secondary-text">
              {testimonial.role} at <span className="text-accent">{testimonial.company}</span>
            </p>
          </div>
        </div>
      </div>
    </motion.article>
  );
};

/**
 * Main Testimonials Section
 */
const Testimonials = () => {
  const reducedMotion = prefersReducedMotion();
  
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
      className="py-16 sm:py-20 lg:py-24 bg-secondary-bg relative overflow-hidden"
      aria-labelledby="testimonials-heading"
      data-testid="testimonials-section"
    >
      {/* Decorative accent glow */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-accent/5 via-transparent to-transparent blur-3xl pointer-events-none" 
        aria-hidden="true"
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <FadeIn inView={true}>
          <div className="text-center mb-12 sm:mb-16 lg:mb-20">
            <span className="inline-block text-xs font-medium text-accent uppercase tracking-[0.2em] mb-4">
              Testimonials
            </span>
            <h2 
              id="testimonials-heading"
              className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-primary-text mb-4 sm:mb-6"
            >
              What Our Clients Say
            </h2>
            <p className="text-base sm:text-lg text-secondary-text max-w-2xl mx-auto">
              Hear from the creative professionals and brands we've had the pleasure of working with
            </p>
          </div>
        </FadeIn>

        {/* Testimonials Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          data-testid="testimonials-grid"
        >
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={testimonial.id}
              testimonial={testimonial}
              index={index}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;
