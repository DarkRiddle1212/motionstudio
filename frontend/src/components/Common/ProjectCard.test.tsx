import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ProjectCard from './ProjectCard';
import { Project } from '../../hooks/useProjects';

// Mock framer-motion with all required exports
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, onClick, ...props }: any) => (
      <div onClick={onClick} {...props}>
        {children}
      </div>
    ),
  },
  useScroll: () => ({
    scrollYProgress: { get: () => 0 },
  }),
  useTransform: () => 0,
  useSpring: () => 0,
}));

const mockProject: Project = {
  id: '1',
  title: 'Test Motion Project',
  description: 'A test project for motion design',
  goal: 'Create engaging animations',
  solution: 'Used advanced motion techniques',
  motionBreakdown: 'Detailed motion analysis',
  toolsUsed: ['After Effects', 'Cinema 4D', 'Photoshop', 'Illustrator'],
  thumbnailUrl: 'https://example.com/thumbnail.jpg',
  caseStudyUrl: 'https://example.com/casestudy.jpg',
  order: 1,
  isPublished: true,
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
};

describe('ProjectCard Component', () => {
  it('renders project information correctly', () => {
    const handleClick = vi.fn();
    
    render(
      <ProjectCard 
        project={mockProject} 
        onClick={handleClick}
        data-testid="project-card"
      />
    );
    
    expect(screen.getByText('Test Motion Project')).toBeInTheDocument();
    expect(screen.getByText('A test project for motion design')).toBeInTheDocument();
    expect(screen.getByText('View Case Study')).toBeInTheDocument();
  });

  it('displays project thumbnail image', () => {
    const handleClick = vi.fn();
    
    render(
      <ProjectCard 
        project={mockProject} 
        onClick={handleClick}
      />
    );
    
    const image = screen.getByAltText('Test Motion Project');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/thumbnail.jpg');
  });

  it('displays tools used with limit of 3', () => {
    const handleClick = vi.fn();
    
    render(
      <ProjectCard 
        project={mockProject} 
        onClick={handleClick}
      />
    );
    
    expect(screen.getByText('After Effects')).toBeInTheDocument();
    expect(screen.getByText('Cinema 4D')).toBeInTheDocument();
    expect(screen.getByText('Photoshop')).toBeInTheDocument();
    expect(screen.getByText('+1 more')).toBeInTheDocument();
  });

  it('displays all tools when 3 or fewer', () => {
    const projectWithFewTools = {
      ...mockProject,
      toolsUsed: ['After Effects', 'Photoshop'],
    };
    const handleClick = vi.fn();
    
    render(
      <ProjectCard 
        project={projectWithFewTools} 
        onClick={handleClick}
      />
    );
    
    expect(screen.getByText('After Effects')).toBeInTheDocument();
    expect(screen.getByText('Photoshop')).toBeInTheDocument();
    expect(screen.queryByText('+1 more')).not.toBeInTheDocument();
  });

  it('handles click events correctly', () => {
    const handleClick = vi.fn();
    
    render(
      <ProjectCard 
        project={mockProject} 
        onClick={handleClick}
        data-testid="project-card"
      />
    );
    
    fireEvent.click(screen.getByTestId('project-card'));
    expect(handleClick).toHaveBeenCalledWith('1');
  });

  it('applies custom className', () => {
    const handleClick = vi.fn();
    
    render(
      <ProjectCard 
        project={mockProject} 
        onClick={handleClick}
        className="custom-class"
        data-testid="project-card"
      />
    );
    
    expect(screen.getByTestId('project-card')).toHaveClass('custom-class');
  });
});