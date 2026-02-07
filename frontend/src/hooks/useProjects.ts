import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5001/api';

export interface Project {
  id: string;
  title: string;
  description: string;
  goal: string;
  solution: string;
  motionBreakdown: string;
  toolsUsed: string[];
  
  // Legacy URL fields (backward compatible)
  thumbnailUrl: string;
  caseStudyUrl: string;
  
  // New file path fields for uploaded media
  thumbnailPath?: string;
  caseStudyPath?: string;
  
  // Media type selection
  mediaType: 'image' | 'video';
  
  // Video-specific fields
  videoPath?: string;
  videoThumbnailPath?: string;
  videoDuration?: number;
  
  // Gallery images
  galleryImages: string; // JSON array of image paths
  
  order: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

// Mock data for development
const mockProjects: Project[] = [
  {
    id: '1',
    title: 'Brand Animation Suite',
    description: 'Complete motion identity system for a tech startup including logo animations, transitions, and micro-interactions.',
    goal: 'Create a cohesive motion language that reflects the brand\'s innovative spirit',
    solution: 'Developed a comprehensive animation system with smooth transitions and engaging micro-interactions',
    motionBreakdown: 'Logo reveal, page transitions, button states, loading animations',
    toolsUsed: ['After Effects', 'Lottie', 'Figma', 'Principle'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=600&fit=crop',
    caseStudyUrl: '/portfolio/brand-animation-suite',
    mediaType: 'image',
    galleryImages: '[]',
    order: 1,
    isPublished: true,
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: '2',
    title: 'Product Launch Video',
    description: 'Dynamic product showcase video featuring 3D animations and kinetic typography for a major product launch.',
    goal: 'Create excitement and clearly communicate product benefits through motion',
    solution: 'Combined 3D product renders with dynamic typography and smooth camera movements',
    motionBreakdown: '3D product animation, kinetic typography, camera movements, color transitions',
    toolsUsed: ['Cinema 4D', 'After Effects', 'Octane Render', 'Premiere Pro'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&h=600&fit=crop',
    caseStudyUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
    mediaType: 'video',
    videoDuration: 30,
    galleryImages: '[]',
    order: 2,
    isPublished: true,
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2024-01-10T00:00:00Z'
  },
  {
    id: '3',
    title: 'Interactive Web Animations',
    description: 'Custom web animations and interactions for an e-commerce platform, enhancing user experience and engagement.',
    goal: 'Improve user engagement and create a premium shopping experience',
    solution: 'Implemented subtle animations that guide users through the shopping journey',
    motionBreakdown: 'Scroll animations, hover effects, cart interactions, page transitions',
    toolsUsed: ['Framer Motion', 'GSAP', 'Lottie', 'React'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
    caseStudyUrl: '/portfolio/interactive-web-animations',
    mediaType: 'image',
    galleryImages: '[]',
    order: 3,
    isPublished: true,
    createdAt: '2024-01-05T00:00:00Z',
    updatedAt: '2024-01-05T00:00:00Z'
  },
  {
    id: '4',
    title: 'Motion Graphics Reel',
    description: 'A compilation of motion graphics work showcasing various animation techniques and styles.',
    goal: 'Demonstrate versatility and technical skills in motion design',
    solution: 'Created a dynamic reel with smooth transitions between different project highlights',
    motionBreakdown: 'Seamless transitions, typography animation, shape morphing, color grading',
    toolsUsed: ['After Effects', 'Cinema 4D', 'Premiere Pro', 'DaVinci Resolve'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&h=600&fit=crop',
    caseStudyUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    mediaType: 'video',
    videoDuration: 120,
    galleryImages: '[]',
    order: 4,
    isPublished: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to fetch from API first with timeout, fallback to mock data
      try {
        const response = await axios.get(`${API_URL}/projects`, {
          timeout: 3000 // 3 second timeout
        });
        setProjects(response.data.projects);
      } catch (apiError) {
        // If API fails, use mock data
        console.log('API not available, using mock data');
        setProjects(mockProjects);
      }
    } catch (err: any) {
      console.error('Error fetching projects:', err);
      setError(err.response?.data?.error || 'Failed to fetch projects');
      // Even on error, show mock data
      setProjects(mockProjects);
    } finally {
      setLoading(false);
    }
  };

  const getProjectById = async (id: string): Promise<Project | null> => {
    try {
      const response = await axios.get(`${API_URL}/projects/${id}`);
      return response.data.project;
    } catch (err: any) {
      console.error('Error fetching project:', err);
      // Fallback to mock data
      const mockProject = mockProjects.find(p => p.id === id);
      if (mockProject) return mockProject;
      throw new Error(err.response?.data?.error || 'Failed to fetch project');
    }
  };

  useEffect(() => {
    fetchProjects();
    
    // Safety timeout: force loading=false after 2 seconds
    const safetyTimeout = setTimeout(() => {
      console.warn('useProjects: Safety timeout triggered, forcing loading=false');
      setLoading(false);
      setProjects(prev => prev.length === 0 ? mockProjects : prev);
    }, 2000); // Reduced from 5000 to 2000ms
    
    return () => clearTimeout(safetyTimeout);
  }, []);

  return {
    projects,
    loading,
    error,
    refetch: fetchProjects,
    getProjectById,
  };
};