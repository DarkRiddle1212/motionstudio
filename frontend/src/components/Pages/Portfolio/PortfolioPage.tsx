import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useProjects } from '../../../hooks/useProjects';
import { Button } from '../../Common';
import { FadeIn, SlideUp, StaggerContainer, StaggerItem } from '../../Animation';
import { Layout } from '../../Layout';

type SortOption = 'order' | 'title' | 'newest' | 'oldest';
type CategoryFilter = 'all' | string;
type MediaTypeFilter = 'all' | 'image' | 'video';

// Premium Project Card Component with sophisticated hover effects
interface PremiumProjectCardProps {
  project: {
    id: string;
    title: string;
    description: string;
    toolsUsed: string[];
    thumbnailUrl: string;
    caseStudyUrl: string;
    mediaType: 'image' | 'video';
    videoDuration?: number;
  };
  onClick: (id: string) => void;
  index: number;
}

const PremiumProjectCard = ({ project, onClick, index }: PremiumProjectCardProps) => {
  const [isVideoHovered, setIsVideoHovered] = useState(false);
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);

  const handleClick = useCallback(() => {
    onClick(project.id);
  }, [onClick, project.id]);

  const handleMouseEnter = useCallback(() => {
    if (project.mediaType === 'video' && videoElement) {
      setIsVideoHovered(true);
      // Start playing video on hover (muted)
      videoElement.muted = true;
      videoElement.currentTime = 0;
      videoElement.play().catch(() => {
        // Ignore play errors (autoplay restrictions)
      });
    }
  }, [project.mediaType, videoElement]);

  const handleMouseLeave = useCallback(() => {
    if (project.mediaType === 'video' && videoElement) {
      setIsVideoHovered(false);
      videoElement.pause();
      videoElement.currentTime = 0;
    }
  }, [project.mediaType, videoElement]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.1,
        ease: [0.25, 0.1, 0.25, 1]
      }}
      className="group cursor-pointer"
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      data-testid={`project-card-${project.id}`}
    >
      <div className="relative overflow-hidden rounded-xl bg-surface-card border border-white/5 shadow-card transition-all duration-500 ease-smooth hover:shadow-card-hover hover:border-brand-accent/20 hover:-translate-y-2">
        {/* Image/Video Container with Zoom Effect */}
        <div className="relative aspect-[4/3] overflow-hidden">
          {project.mediaType === 'video' ? (
            <>
              {/* Video Element (hidden, used for hover preview) */}
              <video
                ref={setVideoElement}
                src={project.caseStudyUrl}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                  isVideoHovered ? 'opacity-100' : 'opacity-0'
                }`}
                muted
                loop
                playsInline
                preload="metadata"
              />
              
              {/* Thumbnail Image (shown by default) */}
              <motion.img
                src={project.thumbnailUrl}
                alt={project.title}
                className={`w-full h-full object-cover transition-all duration-700 ease-out-expo group-hover:scale-110 ${
                  isVideoHovered ? 'opacity-0' : 'opacity-100'
                }`}
                loading="lazy"
              />
              
              {/* Play Icon Overlay */}
              <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
                isVideoHovered ? 'opacity-0' : 'opacity-100'
              }`}>
                <div className="w-16 h-16 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              </div>
              
              {/* Duration Badge */}
              {project.videoDuration && (
                <div className="absolute top-3 right-3 px-2 py-1 bg-black/70 backdrop-blur-sm text-white text-xs rounded-md border border-white/20">
                  {formatDuration(project.videoDuration)}
                </div>
              )}
            </>
          ) : (
            <motion.img
              src={project.thumbnailUrl}
              alt={project.title}
              className="w-full h-full object-cover transition-transform duration-700 ease-out-expo group-hover:scale-110"
              loading="lazy"
            />
          )}
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Hover Content Overlay */}
          <div className="absolute inset-0 flex items-end p-6 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
            <div className="flex items-center gap-2 text-white font-medium">
              <span className="text-body-sm">
                {project.mediaType === 'video' ? 'Watch Video' : 'View Case Study'}
              </span>
              <svg 
                className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          </div>
          
          {/* Accent Glow on Hover */}
          <div className="absolute inset-0 bg-gradient-accent-glow opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          
          {/* Media Type Badge */}
          <div className="absolute top-3 left-3 px-2 py-1 bg-surface-elevated/80 backdrop-blur-sm text-brand-secondary-text text-xs rounded-md border border-white/10">
            {project.mediaType === 'video' ? '🎬 Video' : '🖼️ Image'}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="text-heading-md font-serif font-semibold text-brand-primary-text mb-3 line-clamp-2 group-hover:text-brand-accent transition-colors duration-300">
            {project.title}
          </h3>
          
          <p className="text-body-sm text-brand-secondary-text mb-4 line-clamp-2">
            {project.description}
          </p>

          {/* Tools Tags */}
          <div className="flex flex-wrap gap-2">
            {project.toolsUsed.slice(0, 3).map((tool, idx) => (
              <span
                key={idx}
                className="px-3 py-1 text-caption bg-surface-elevated text-brand-secondary-text rounded-full border border-white/5 transition-all duration-300 group-hover:border-brand-accent/20 group-hover:text-brand-accent-light"
              >
                {tool}
              </span>
            ))}
            {project.toolsUsed.length > 3 && (
              <span className="px-3 py-1 text-caption bg-brand-accent/10 text-brand-accent rounded-full">
                +{project.toolsUsed.length - 3}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  );
};

// Filter Button Component
interface FilterButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const FilterButton = ({ label, isActive, onClick }: FilterButtonProps) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`
      px-4 py-2 rounded-full text-body-sm font-medium transition-all duration-300
      ${isActive 
        ? 'bg-brand-accent text-brand-primary-bg shadow-glow' 
        : 'bg-surface-elevated text-brand-secondary-text border border-white/5 hover:border-brand-accent/30 hover:text-brand-primary-text'
      }
    `}
    data-testid={`filter-${label.toLowerCase().replace(/\s+/g, '-')}`}
  >
    {label}
  </motion.button>
);

const PortfolioPage = () => {
  const navigate = useNavigate();
  const { projects, loading, error } = useProjects();
  const [sortBy, setSortBy] = useState<SortOption>('order');
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');
  const [mediaTypeFilter, setMediaTypeFilter] = useState<MediaTypeFilter>('all');

  // Get unique categories (tools) for filtering
  const categories = useMemo(() => {
    const tools = new Set<string>();
    projects.forEach(project => {
      project.toolsUsed.forEach(tool => tools.add(tool));
    });
    return ['all', ...Array.from(tools).sort()];
  }, [projects]);

  // Filter and sort projects
  const filteredAndSortedProjects = useMemo(() => {
    let filtered = projects;

    // Apply category filter
    if (activeCategory !== 'all') {
      filtered = filtered.filter(project => 
        project.toolsUsed.some(tool => 
          tool.toLowerCase() === activeCategory.toLowerCase()
        )
      );
    }

    // Apply media type filter
    if (mediaTypeFilter !== 'all') {
      filtered = filtered.filter(project => project.mediaType === mediaTypeFilter);
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'order':
          return a.order - b.order;
        case 'title':
          return a.title.localeCompare(b.title);
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        default:
          return a.order - b.order;
      }
    });

    return sorted;
  }, [projects, sortBy, activeCategory, mediaTypeFilter]);

  const handleProjectClick = useCallback((projectId: string) => {
    navigate(`/portfolio/${projectId}`);
  }, [navigate]);

  const handleCategoryChange = useCallback((category: string) => {
    setActiveCategory(category);
  }, []);

  const handleMediaTypeChange = useCallback((mediaType: MediaTypeFilter) => {
    setMediaTypeFilter(mediaType);
  }, []);

  if (loading) {
    return (
      <Layout className="bg-brand-primary-bg">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="relative w-16 h-16 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-2 border-brand-accent/20" />
              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-brand-accent animate-spin" />
            </div>
            <p className="text-brand-secondary-text text-body-md">Loading portfolio...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout className="bg-brand-primary-bg">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center px-4 max-w-md">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-red-400 mb-6 text-body-md">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout className="bg-brand-primary-bg">
      {/* Premium Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero-radial noise-overlay">
        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-1/2 -right-1/4 w-[800px] h-[800px] rounded-full bg-brand-accent/5 blur-3xl" />
          <div className="absolute -bottom-1/2 -left-1/4 w-[600px] h-[600px] rounded-full bg-brand-accent/3 blur-3xl" />
        </div>
        
        <div className="relative z-10 container-premium section-spacing-hero">
          <div className="max-w-4xl mx-auto text-center">
            <SlideUp>
              <span className="inline-block px-4 py-2 mb-6 text-caption font-medium text-brand-accent bg-brand-accent/10 rounded-full border border-brand-accent/20">
                Our Work
              </span>
            </SlideUp>
            
            <FadeIn delay={0.1}>
              <h1 className="text-display-lg md:text-display-xl lg:text-display-2xl font-serif font-bold text-brand-primary-text mb-6 text-balance">
                Motion Design Portfolio
              </h1>
            </FadeIn>
            
            <FadeIn delay={0.2}>
              <p className="text-body-lg text-brand-secondary-text max-w-2xl mx-auto leading-relaxed text-pretty">
                Explore our collection of motion design projects, from brand animations 
                to interactive experiences. Each project showcases our expertise in 
                bringing ideas to life through purposeful motion.
              </p>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="relative z-20 -mt-8">
        <div className="container-premium">
          <FadeIn delay={0.3}>
            <div className="bg-surface-elevated/80 backdrop-blur-xl rounded-2xl border border-white/5 p-6 shadow-premium">
              <div className="flex flex-col gap-6">
                {/* Media Type Filters */}
                <div className="flex flex-col gap-3">
                  <label className="text-body-sm text-brand-secondary-text font-medium">
                    Media Type:
                  </label>
                  <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by media type">
                    <FilterButton
                      label="All Media"
                      isActive={mediaTypeFilter === 'all'}
                      onClick={() => handleMediaTypeChange('all')}
                    />
                    <FilterButton
                      label="🖼️ Images"
                      isActive={mediaTypeFilter === 'image'}
                      onClick={() => handleMediaTypeChange('image')}
                    />
                    <FilterButton
                      label="🎬 Videos"
                      isActive={mediaTypeFilter === 'video'}
                      onClick={() => handleMediaTypeChange('video')}
                    />
                  </div>
                </div>

                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  {/* Category Filters */}
                  <div className="flex flex-col gap-3">
                    <label className="text-body-sm text-brand-secondary-text font-medium">
                      Tools & Categories:
                    </label>
                    <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
                      {categories.slice(0, 8).map((category) => (
                        <FilterButton
                          key={category}
                          label={category === 'all' ? 'All Projects' : category}
                          isActive={activeCategory === category}
                          onClick={() => handleCategoryChange(category)}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Sort Dropdown */}
                  <div className="flex items-center gap-3">
                    <label className="text-body-sm text-brand-secondary-text whitespace-nowrap">
                      Sort by:
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortOption)}
                      className="px-4 py-2 bg-surface-card border border-white/10 rounded-lg text-brand-primary-text text-body-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/50 focus:border-brand-accent transition-all duration-300 cursor-pointer"
                      data-testid="sort-select"
                    >
                      <option value="order">Featured</option>
                      <option value="title">Title (A-Z)</option>
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Projects Grid Section */}
      <section className="container-premium section-spacing">
        {filteredAndSortedProjects.length === 0 ? (
          <FadeIn>
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-surface-elevated flex items-center justify-center">
                <span className="text-4xl">
                  {mediaTypeFilter === 'video' ? '🎬' : mediaTypeFilter === 'image' ? '🖼️' : '🎨'}
                </span>
              </div>
              <h2 className="text-display-sm font-serif font-semibold text-brand-primary-text mb-4">
                {(activeCategory !== 'all' || mediaTypeFilter !== 'all') ? 'No Projects Found' : 'No Projects Available'}
              </h2>
              <p className="text-body-md text-brand-secondary-text mb-8 max-w-md mx-auto">
                {(activeCategory !== 'all' || mediaTypeFilter !== 'all')
                  ? `No projects found matching your filters. Try adjusting your selection.`
                  : 'Check back soon for new projects!'
                }
              </p>
              {(activeCategory !== 'all' || mediaTypeFilter !== 'all') && (
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button onClick={() => setActiveCategory('all')}>
                    Clear Category Filter
                  </Button>
                  <Button variant="secondary" onClick={() => setMediaTypeFilter('all')}>
                    Clear Media Filter
                  </Button>
                </div>
              )}
            </div>
          </FadeIn>
        ) : (
          <>
            {/* Results Count */}
            <div className="mb-8">
              <p className="text-body-sm text-brand-secondary-text">
                Showing <span className="text-brand-primary-text font-medium">{filteredAndSortedProjects.length}</span> project{filteredAndSortedProjects.length !== 1 ? 's' : ''}
                {(activeCategory !== 'all' || mediaTypeFilter !== 'all') && (
                  <>
                    {' '}filtered by{' '}
                    {mediaTypeFilter !== 'all' && (
                      <span className="text-brand-accent">{mediaTypeFilter}</span>
                    )}
                    {activeCategory !== 'all' && mediaTypeFilter !== 'all' && ' and '}
                    {activeCategory !== 'all' && (
                      <span className="text-brand-accent">{activeCategory}</span>
                    )}
                  </>
                )}
              </p>
            </div>

            {/* Premium Grid with Staggered Animation */}
            <motion.div 
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
            >
              <AnimatePresence mode="popLayout">
                {filteredAndSortedProjects.map((project, index) => (
                  <PremiumProjectCard
                    key={project.id}
                    project={{
                      id: project.id,
                      title: project.title,
                      description: project.description,
                      toolsUsed: project.toolsUsed,
                      thumbnailUrl: project.thumbnailUrl,
                      caseStudyUrl: project.caseStudyUrl,
                      mediaType: project.mediaType,
                      videoDuration: project.videoDuration,
                    }}
                    onClick={handleProjectClick}
                    index={index}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          </>
        )}
      </section>

      {/* Premium CTA Section */}
      {filteredAndSortedProjects.length > 0 && (
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
                  Ready to Start Your Project?
                </h2>
              </StaggerItem>
              
              <StaggerItem>
                <p className="text-body-lg text-brand-secondary-text mb-10 max-w-xl mx-auto">
                  Let's bring your ideas to life with purposeful motion design that captivates and engages your audience.
                </p>
              </StaggerItem>
              
              <StaggerItem>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    onClick={() => navigate('/contact')}
                    className="min-w-[180px]"
                    data-testid="start-project-button"
                  >
                    Start a Project
                  </Button>
                  <Button 
                    variant="secondary" 
                    onClick={() => navigate('/courses')}
                    className="min-w-[180px]"
                    data-testid="learn-motion-design-button"
                  >
                    Learn Motion Design
                  </Button>
                </div>
              </StaggerItem>
            </StaggerContainer>
          </div>
        </section>
      )}
    </Layout>
  );
};

export default PortfolioPage;
