import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useProjects, Project } from '../../../hooks/useProjects';
import { Button } from '../../Common';
import { FadeIn, SlideUp, Parallax, StaggerContainer, StaggerItem } from '../../Animation';
import { Layout } from '../../Layout';

// Lightbox Component for Image Gallery
interface LightboxProps {
  images: string[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  projectTitle: string;
}

const Lightbox = ({ images, currentIndex, isOpen, onClose, onNext, onPrev, projectTitle }: LightboxProps) => {
  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNext();
      if (e.key === 'ArrowLeft') onPrev();
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onNext, onPrev]);

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={`Image gallery for ${projectTitle}`}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 z-10 p-3 rounded-full bg-surface-elevated/80 text-brand-primary-text hover:bg-surface-card transition-colors duration-300 focus-ring"
            aria-label="Close gallery"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Navigation Buttons */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); onPrev(); }}
                className="absolute left-4 md:left-8 z-10 p-3 rounded-full bg-surface-elevated/80 text-brand-primary-text hover:bg-surface-card transition-colors duration-300 focus-ring"
                aria-label="Previous image"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onNext(); }}
                className="absolute right-4 md:right-8 z-10 p-3 rounded-full bg-surface-elevated/80 text-brand-primary-text hover:bg-surface-card transition-colors duration-300 focus-ring"
                aria-label="Next image"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Image */}
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="relative max-w-[90vw] max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={images[currentIndex]}
              alt={`${projectTitle} - Image ${currentIndex + 1}`}
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
            />
          </motion.div>

          {/* Image Counter */}
          {images.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-surface-elevated/80 text-brand-secondary-text text-body-sm">
              {currentIndex + 1} / {images.length}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Gallery Thumbnail Component
interface GalleryThumbnailProps {
  src: string;
  alt: string;
  onClick: () => void;
  index: number;
}

const GalleryThumbnail = ({ src, alt, onClick, index }: GalleryThumbnailProps) => (
  <motion.button
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    onClick={onClick}
    className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-surface-card border border-white/5 cursor-pointer focus-ring transition-all duration-500 hover:border-brand-accent/30"
    aria-label={`View ${alt} in gallery`}
  >
    <img
      src={src}
      alt={alt}
      className="w-full h-full object-cover transition-transform duration-700 ease-out-expo group-hover:scale-110"
      loading="lazy"
    />
    {/* Hover Overlay */}
    <div className="absolute inset-0 bg-gradient-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
      <div className="p-3 rounded-full bg-brand-accent/90 text-brand-primary-bg">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
        </svg>
      </div>
    </div>
  </motion.button>
);

// Content Section Component for consistent styling
interface ContentSectionProps {
  title: string;
  content: string;
  delay?: number;
}

const ContentSection = ({ title, content, delay = 0 }: ContentSectionProps) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.6, delay, ease: [0.25, 0.1, 0.25, 1] }}
    className="mb-16"
  >
    <h2 className="text-display-sm md:text-display-md font-serif font-bold text-brand-primary-text mb-6">
      {title}
    </h2>
    <div className="prose prose-lg max-w-none">
      <p className="text-body-lg text-brand-secondary-text leading-relaxed whitespace-pre-line">
        {content}
      </p>
    </div>
  </motion.div>
);

const CaseStudyPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { getProjectById } = useProjects();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId) {
        setError('Project ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const projectData = await getProjectById(projectId);
        setProject(projectData);
      } catch (err: any) {
        console.error('Error fetching project:', err);
        setError(err.message || 'Failed to load project');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId, getProjectById]);

  // Generate gallery images from project data
  const galleryImages = project ? [
    project.caseStudyUrl,
    project.thumbnailUrl,
    // Add placeholder images for demo - in production these would come from the API
  ].filter(Boolean) : [];

  const openLightbox = useCallback((index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
  }, []);

  const nextImage = useCallback(() => {
    setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
  }, [galleryImages.length]);

  const prevImage = useCallback(() => {
    setCurrentImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  }, [galleryImages.length]);

  if (loading) {
    return (
      <Layout className="bg-brand-primary-bg">
        <div className="min-h-screen flex items-center justify-center bg-gradient-premium-subtle">
          <div className="text-center">
            <div className="spinner-modern mx-auto mb-4" />
            <p className="text-brand-secondary-text text-sm">Loading case study...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !project) {
    return (
      <Layout className="bg-brand-primary-bg">
        <div className="min-h-screen flex items-center justify-center bg-gradient-premium-subtle">
          <div className="text-center px-4 max-w-md">
            <div className="mb-4 p-4 rounded-lg border border-red-500/20 bg-red-500/10 text-red-300">{error || 'Project not found'}</div>
            <Button onClick={() => navigate('/portfolio')}>Back to Portfolio</Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout className="bg-brand-primary-bg">
      {/* Lightbox */}
      <Lightbox
        images={galleryImages}
        currentIndex={currentImageIndex}
        isOpen={lightboxOpen}
        onClose={closeLightbox}
        onNext={nextImage}
        onPrev={prevImage}
        projectTitle={project.title}
      />

      {/* Full-Width Hero Section */}
      <section className="relative min-h-[70vh] md:min-h-[80vh] overflow-hidden">
        {/* Hero Image with Parallax */}
        <Parallax speed={0.3} className="absolute inset-0">
          <div className="absolute inset-0">
            <img
              src={project.caseStudyUrl}
              alt={project.title}
              className="w-full h-full object-cover"
            />
            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-overlay-full" />
            <div className="absolute inset-0 bg-gradient-hero-radial opacity-50" />
          </div>
        </Parallax>

        {/* Back Button */}
        <div className="absolute top-6 left-4 md:left-8 z-20">
          <FadeIn>
            <button
              onClick={() => navigate('/portfolio')}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-elevated/80 backdrop-blur-md text-brand-primary-text hover:bg-surface-card transition-all duration-300 border border-white/10 focus-ring"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-body-sm font-medium">Back to Portfolio</span>
            </button>
          </FadeIn>
        </div>

        {/* Hero Content */}
        <div className="absolute inset-0 flex items-end z-10">
          <div className="container-premium pb-16 md:pb-24">
            <div className="max-w-4xl">
              <SlideUp delay={0.2}>
                <span className="inline-block px-4 py-2 mb-6 text-caption font-medium text-brand-accent bg-brand-accent/10 rounded-full border border-brand-accent/20 backdrop-blur-sm">
                  Case Study
                </span>
              </SlideUp>
              
              <FadeIn delay={0.3}>
                <h1 className="text-display-lg md:text-display-xl lg:text-display-2xl font-serif font-bold text-brand-primary-text mb-6 text-balance">
                  {project.title}
                </h1>
              </FadeIn>
              
              <FadeIn delay={0.4}>
                <p className="text-body-lg md:text-heading-lg text-brand-secondary-text max-w-2xl leading-relaxed text-pretty">
                  {project.description}
                </p>
              </FadeIn>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-6 h-10 rounded-full border-2 border-brand-primary-text/30 flex items-start justify-center p-2"
          >
            <div className="w-1 h-2 rounded-full bg-brand-primary-text/50" />
          </motion.div>
        </motion.div>
      </section>

      {/* Tools & Technologies Section */}
      <section className="relative z-20 -mt-8">
        <div className="container-premium">
          <FadeIn delay={0.5}>
            <div className="bg-surface-elevated/80 backdrop-blur-xl rounded-2xl border border-white/5 p-6 md:p-8 shadow-premium">
              <h3 className="text-heading-md font-serif font-semibold text-brand-primary-text mb-6">
                Tools & Technologies
              </h3>
              <div className="flex flex-wrap gap-3">
                {project.toolsUsed.map((tool, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + index * 0.05 }}
                    className="px-4 py-2 bg-surface-card text-brand-primary-text rounded-full text-body-sm font-medium border border-white/5 hover:border-brand-accent/30 hover:text-brand-accent transition-all duration-300"
                  >
                    {tool}
                  </motion.span>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Main Content */}
      <section className="container-narrow section-spacing">
        {/* Project Goal */}
        <ContentSection
          title="Project Goal"
          content={project.goal}
          delay={0}
        />

        {/* Our Solution */}
        <ContentSection
          title="Our Solution"
          content={project.solution}
          delay={0.1}
        />

        {/* Motion Breakdown */}
        <ContentSection
          title="Motion Breakdown"
          content={project.motionBreakdown}
          delay={0.2}
        />
      </section>

      {/* Image Gallery Section */}
      {galleryImages.length > 0 && (
        <section className="bg-surface-elevated/30 noise-overlay">
          <div className="container-premium section-spacing">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-display-sm md:text-display-md font-serif font-bold text-brand-primary-text mb-4">
                Project Gallery
              </h2>
              <p className="text-body-lg text-brand-secondary-text max-w-xl mx-auto">
                Explore the visual journey of this project
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              {galleryImages.map((image, index) => (
                <GalleryThumbnail
                  key={index}
                  src={image}
                  alt={`${project.title} - Image ${index + 1}`}
                  onClick={() => openLightbox(index)}
                  index={index}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Call to Action Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero-radial" />
        <div className="absolute inset-0 bg-gradient-accent-glow opacity-30" />
        
        <div className="relative z-10 container-premium section-spacing">
          <StaggerContainer className="max-w-3xl mx-auto text-center">
            <StaggerItem>
              <span className="inline-block px-4 py-2 mb-6 text-caption font-medium text-brand-accent bg-brand-accent/10 rounded-full border border-brand-accent/20">
                Let's Collaborate
              </span>
            </StaggerItem>
            
            <StaggerItem>
              <h2 className="text-display-md md:text-display-lg font-serif font-bold text-brand-primary-text mb-6 text-balance">
                Interested in Working Together?
              </h2>
            </StaggerItem>
            
            <StaggerItem>
              <p className="text-body-lg text-brand-secondary-text mb-10 max-w-xl mx-auto">
                Let's discuss how we can bring your vision to life with motion design that captivates and engages your audience.
              </p>
            </StaggerItem>
            
            <StaggerItem>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => navigate('/contact')}
                  className="min-w-[180px]"
                >
                  Get in Touch
                </Button>
                <Button 
                  variant="secondary" 
                  onClick={() => navigate('/portfolio')}
                  className="min-w-[180px]"
                >
                  View More Projects
                </Button>
              </div>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </section>
    </Layout>
  );
};

export default CaseStudyPage;
