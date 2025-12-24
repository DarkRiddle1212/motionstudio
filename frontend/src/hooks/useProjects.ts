import { useState, useEffect } from 'react';
import axios from 'axios';

export interface Project {
  id: string;
  title: string;
  description: string;
  goal: string;
  solution: string;
  motionBreakdown: string;
  toolsUsed: string[];
  thumbnailUrl: string;
  caseStudyUrl: string;
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
    caseStudyUrl: '/portfolio/product-launch-video',
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
    order: 3,
    isPublished: true,
    createdAt: '2024-01-05T00:00:00Z',
    updatedAt: '2024-01-05T00:00:00Z'
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
      
      // Try to fetch from API first, fallback to mock data
      try {
        const response = await axios.get('/api/projects');
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
      const response = await axios.get(`/api/projects/${id}`);
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
  }, []);

  return {
    projects,
    loading,
    error,
    refetch: fetchProjects,
    getProjectById,
  };
};