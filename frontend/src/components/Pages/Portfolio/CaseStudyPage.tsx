import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useProjects, Project } from '../../../hooks/useProjects';
import { Button } from '../../Common';
import { FadeIn, SlideUp, Parallax, StaggerContainer, StaggerItem } from '../../Animation';
import { Layout } from '../../Layout';

// Video Player Component with Custom Controls
interface VideoPlayerProps {
  src: string;
  poster: string;
  title: string;
}

const VideoPlayer = ({ src, poster, title }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(0.7);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  // Auto-play and loop setup
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      // Auto-play muted
      video.muted = true;
      video.play().catch(() => {
        // Ignore autoplay restrictions
      });
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      // Loop the video
      video.currentTime = 0;
      video.play();
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
    };
  }, []);

  // Handle volume changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    video.volume = volume;
    video.muted = isMuted;
  }, [volume, isMuted]);

  // Controls visibility management
  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  }, []);

  const handleMouseMove = useCallback(() => {
    showControlsTemporarily();
  }, [showControlsTemporarily]);

  const handleMouseEnter = useCallback(() => {
    setShowControls(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    setShowControls(false);
  }, []);

  // Control handlers
  const togglePlayPause = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  }, [isPlaying]);

  const toggleMute = useCallback(() => {
    setIsMuted(!isMuted);
  }, [isMuted]);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (newVolume > 0) {
      setIsMuted(false);
    }
  }, []);

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const newTime = (parseFloat(e.target.value) / 100) * duration;
    video.currentTime = newTime;
    setCurrentTime(newTime);
  }, [duration]);

  const toggleFullscreen = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (!isFullscreen) {
      if (video.requestFullscreen) {
        video.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }, [isFullscreen]);

  // Fullscreen change handler
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div 
      className="relative w-full h-full group"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full object-cover"
        loop
        playsInline
        preload="metadata"
        aria-label={`Video: ${title}`}
      />

      {/* Custom Controls Overlay */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"
          >
            {/* Bottom Controls */}
            <div className="absolute bottom-0 left-0 right-0 p-6 pointer-events-auto">
              <div className="bg-black/40 backdrop-blur-md rounded-xl border border-white/10 p-4">
                {/* Progress Bar */}
                <div className="mb-4">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={progressPercentage}
                    onChange={handleSeek}
                    className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer slider-thumb"
                    aria-label="Video progress"
                  />
                </div>

                {/* Control Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Play/Pause Button */}
                    <button
                      onClick={togglePlayPause}
                      className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors duration-200"
                      aria-label={isPlaying ? 'Pause video' : 'Play video'}
                    >
                      {isPlaying ? (
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      )}
                    </button>

                    {/* Volume Controls */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={toggleMute}
                        className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors duration-200"
                        aria-label={isMuted ? 'Unmute video' : 'Mute video'}
                      >
                        {isMuted || volume === 0 ? (
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                          </svg>
                        )}
                      </button>
                      
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                        className="w-16 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer slider-thumb"
                        aria-label="Volume control"
                      />
                    </div>

                    {/* Time Display */}
                    <div className="text-white text-sm font-mono">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </div>
                  </div>

                  {/* Fullscreen Button */}
                  <button
                    onClick={toggleFullscreen}
                    className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors duration-200"
                    aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                  >
                    {isFullscreen ? (
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

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
  // Touch/swipe handling for mobile
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null); // Reset touchEnd
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && images.length > 1) {
      onNext();
    }
    if (isRightSwipe && images.length > 1) {
      onPrev();
    }
  };

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
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
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

          {/* Image Counter and Thumbnail Strip */}
          {images.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4">
              {/* Image Counter */}
              <div className="px-4 py-2 rounded-full bg-surface-elevated/80 text-brand-secondary-text text-body-sm">
                {currentIndex + 1} / {images.length}
              </div>
              
              {/* Thumbnail Strip */}
              <div className="flex gap-2 max-w-md overflow-x-auto scrollbar-hide">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      // Update current index when thumbnail is clicked
                      const event = new CustomEvent('thumbnailClick', { detail: index });
                      window.dispatchEvent(event);
                    }}
                    className={`flex-shrink-0 w-12 h-8 rounded overflow-hidden border-2 transition-all duration-200 ${
                      index === currentIndex 
                        ? 'border-brand-accent shadow-glow' 
                        : 'border-white/20 hover:border-white/40'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
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

  // Add custom styles for video controls
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .slider-thumb::-webkit-slider-thumb {
        appearance: none;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: #ffffff;
        cursor: pointer;
        border: 2px solid #6366f1;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }
      .slider-thumb::-moz-range-thumb {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: #ffffff;
        cursor: pointer;
        border: 2px solid #6366f1;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }
      .scrollbar-hide {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
      .scrollbar-hide::-webkit-scrollbar {
        display: none;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

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

  // Handle thumbnail clicks from lightbox
  useEffect(() => {
    const handleThumbnailClick = (event: CustomEvent) => {
      setCurrentImageIndex(event.detail);
    };

    window.addEventListener('thumbnailClick', handleThumbnailClick as EventListener);
    return () => {
      window.removeEventListener('thumbnailClick', handleThumbnailClick as EventListener);
    };
  }, []);

  // Generate gallery images from project data
  const galleryImages = project ? [
    // Hero/case study image or video thumbnail
    project.mediaType === 'video' ? project.thumbnailUrl : project.caseStudyUrl,
    // Thumbnail (if different from hero)
    ...(project.thumbnailUrl !== project.caseStudyUrl ? [project.thumbnailUrl] : []),
    // Parse gallery images from JSON string
    ...(project.galleryImages ? JSON.parse(project.galleryImages) : []),
    // Add some demo images for video projects to show gallery functionality
    ...(project.mediaType === 'video' ? [
      'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&h=600&fit=crop'
    ] : [])
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
        {/* Hero Media with Parallax */}
        <Parallax speed={0.3} className="absolute inset-0">
          <div className="absolute inset-0">
            {project.mediaType === 'video' ? (
              <VideoPlayer
                src={project.caseStudyUrl}
                poster={project.thumbnailUrl}
                title={project.title}
              />
            ) : (
              <img
                src={project.caseStudyUrl}
                alt={project.title}
                className="w-full h-full object-cover"
              />
            )}
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
