import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FadeIn } from '../../Animation';
import { useProjects, Project } from '../../../hooks/useProjects';
import { animationConfig, prefersReducedMotion } from '../../../utils/animationConfig';

/**
 * Premium Featured Projects Section Component
 * 
 * Features:
 * - 3-column grid with premium project cards
 * - Hover effects with image zoom and overlay
 * - Staggered scroll-triggered animations
 * - "View All" link with arrow animation
 * 
 * Requirements: 6.2, 5.1
 */

interface FeaturedProjectCardProps {
  project: Project;
  onClick: (id: string) => void;
  index: number;
}

/**
 * Premium Project Card with hover effects
 * - Image zoom on hover
 * - Gradient overlay with content reveal
 * - Smooth transitions
 */
const FeaturedProjectCard = ({ project, onClick, index }: FeaturedProjectCardProps) => {
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
      className="group relative cursor-pointer"
      onClick={() => onClick(project.id)}
      data-testid={`featured-project-card-${project.id}`}
      role="article"
      aria-label={`Project: ${project.title}`}
    >
      {/* Card Container with premium styling */}
      <div className="relative overflow-hidden rounded-xl bg-surface-card border-subtle shadow-card transition-all duration-400 ease-smooth group-hover:shadow-card-hover group-hover:-translate-y-1">
        {/* Image Container with zoom effect */}
        <div className="relative aspect-[4/3] overflow-hidden">
          {/* Project Image with zoom on hover */}
          <img
            src={project.thumbnailUrl}
            alt={project.title}
            className="w-full h-full object-cover transition-transform duration-500 ease-smooth group-hover:scale-110"
            loading="lazy"
          />
          
          {/* Gradient Overlay - always visible at bottom, more visible on hover */}
          <div 
            className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 transition-opacity duration-400 group-hover:opacity-90"
            aria-hidden="true"
          />
          
          {/* Accent Color Overlay on hover */}
          <div 
            className="absolute inset-0 bg-brand-accent/0 transition-all duration-400 group-hover:bg-brand-accent/10"
            aria-hidden="true"
          />
          
          {/* Content Overlay */}
          <div className="absolute inset-0 flex flex-col justify-end p-6">
            {/* Tools/Tags - visible on hover */}
            <div className="flex flex-wrap gap-2 mb-3 opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
              {project.toolsUsed.slice(0, 3).map((tool, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 text-xs font-medium bg-white/10 backdrop-blur-sm text-white rounded-full border border-white/20"
                >
                  {tool}
                </span>
              ))}
              {project.toolsUsed.length > 3 && (
                <span className="px-2 py-1 text-xs font-medium bg-brand-accent/20 backdrop-blur-sm text-white rounded-full border border-brand-accent/30">
                  +{project.toolsUsed.length - 3}
                </span>
              )}
            </div>
            
            {/* Title */}
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-white mb-2 line-clamp-2 transition-transform duration-300 group-hover:-translate-y-1">
              {project.title}
            </h3>
            
            {/* Description - visible on hover */}
            <p className="text-sm text-white/80 line-clamp-2 opacity-0 max-h-0 overflow-hidden transition-all duration-300 group-hover:opacity-100 group-hover:max-h-20">
              {project.description}
            </p>
            
            {/* View Case Study Link */}
            <div className="flex items-center mt-4 text-brand-accent-light text-sm font-medium opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
              <span>View Case Study</span>
              <svg 
                className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
};

/**
 * View All Projects Link with arrow animation
 */
const ViewAllLink = () => {
  const navigate = useNavigate();
  
  return (
    <motion.button
      onClick={() => navigate('/portfolio')}
      className="group inline-flex items-center gap-2 px-6 py-3 text-brand-accent font-medium text-body-md transition-colors duration-300 hover:text-brand-accent-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 focus-visible:ring-offset-brand-secondary-bg rounded-lg"
      data-testid="view-all-projects-link"
      whileHover={{ x: 4 }}
      transition={{ duration: 0.2 }}
    >
      <span>View All Projects</span>
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
 * Loading Skeleton for project cards
 */
const ProjectCardSkeleton = () => (
  <div className="relative overflow-hidden rounded-xl bg-surface-card border-subtle animate-pulse">
    <div className="aspect-[4/3] bg-surface-elevated" />
    <div className="absolute bottom-0 left-0 right-0 p-6">
      <div className="h-4 bg-white/10 rounded w-3/4 mb-2" />
      <div className="h-6 bg-white/10 rounded w-full" />
    </div>
  </div>
);

/**
 * Main Featured Projects Section
 */
const FeaturedProjects = () => {
  const navigate = useNavigate();
  const { projects, loading } = useProjects();
  
  // Debug logging
  console.log('FeaturedProjects - loading:', loading, 'projects:', projects);
  
  // Get first 3 projects for featured section
  const featuredProjects = projects?.slice(0, 3) || [];

  const handleProjectClick = (projectId: string) => {
    navigate(`/portfolio/${projectId}`);
  };

  // Stagger container variants for the grid
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      }
    }
  };

  return (
    <section 
      className="section-spacing bg-brand-secondary-bg relative overflow-hidden"
      aria-labelledby="featured-projects-heading"
      data-testid="featured-projects-section"
    >
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-premium-radial-top opacity-50" aria-hidden="true" />
      
      <div className="container-premium relative z-10">
        {/* Section Header */}
        <FadeIn inView={true}>
          <div className="text-center mb-12 sm:mb-16 lg:mb-20">
            <span className="inline-block text-premium-caption text-brand-accent uppercase tracking-widest mb-4">
              Our Portfolio
            </span>
            <h2 
              id="featured-projects-heading"
              className="text-display-sm sm:text-display-md lg:text-display-lg font-serif font-bold text-brand-primary-text mb-4 sm:mb-6"
            >
              Featured Work
            </h2>
            <p className="text-body-md sm:text-body-lg text-brand-secondary-text max-w-2xl mx-auto">
              Explore our latest motion design projects and see how we bring brands to life
            </p>
          </div>
        </FadeIn>

        {/* Projects Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12">
            {[1, 2, 3].map((i) => (
              <ProjectCardSkeleton key={i} />
            ))}
          </div>
        ) : featuredProjects.length > 0 ? (
          <>
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              data-testid="featured-projects-grid"
            >
              {featuredProjects.map((project, index) => (
                <FeaturedProjectCard
                  key={project.id}
                  project={project}
                  onClick={handleProjectClick}
                  index={index}
                />
              ))}
            </motion.div>
            
            {/* View All Link */}
            <FadeIn inView={true} delay={0.4}>
              <div className="text-center">
                <ViewAllLink />
              </div>
            </FadeIn>
          </>
        ) : (
          <FadeIn inView={true} delay={0.2}>
            <div className="text-center py-12 sm:py-16">
              <div className="text-4xl sm:text-5xl mb-4" aria-hidden="true">🎨</div>
              <p className="text-brand-secondary-text text-body-lg">
                Featured projects coming soon!
              </p>
            </div>
          </FadeIn>
        )}
      </div>
    </section>
  );
};

export default FeaturedProjects;
