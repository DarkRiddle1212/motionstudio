import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import CaseStudyPage from './CaseStudyPage';
import { useProjects } from '../../../hooks/useProjects';

// Mock the useProjects hook
vi.mock('../../../hooks/useProjects');

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
    button: ({ children, onClick, ...props }: any) => <button onClick={onClick} {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock Animation components
vi.mock('../../Animation', () => ({
  FadeIn: ({ children }: any) => <div>{children}</div>,
  SlideUp: ({ children }: any) => <div>{children}</div>,
  Parallax: ({ children, className }: any) => <div className={className}>{children}</div>,
  StaggerContainer: ({ children, className }: any) => <div className={className}>{children}</div>,
  StaggerItem: ({ children }: any) => <div>{children}</div>,
}));

// Mock Common components
vi.mock('../../Common', () => ({
  Button: ({ children, onClick, className }: any) => (
    <button onClick={onClick} className={className}>{children}</button>
  ),
}));

// Mock Layout component
vi.mock('../../Layout', () => ({
  Layout: ({ children, className }: any) => <div className={className}>{children}</div>,
}));

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ projectId: '1' }),
  };
});

const mockProject = {
  id: '1',
  title: 'Test Motion Project',
  description: 'A comprehensive test project showcasing motion design capabilities',
  goal: 'Create engaging animations that tell a compelling story',
  solution: 'Used advanced motion techniques including parallax scrolling and micro-interactions',
  motionBreakdown: 'The animation consists of three main phases:\n1. Introduction with fade-in effects\n2. Main content with slide transitions\n3. Conclusion with scale animations',
  toolsUsed: ['After Effects', 'Cinema 4D', 'Photoshop', 'Illustrator'],
  thumbnailUrl: 'https://example.com/thumbnail.jpg',
  caseStudyUrl: 'https://example.com/casestudy.jpg',
  order: 1,
  isPublished: true,
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
};

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('CaseStudyPage Component', () => {
  const mockGetProjectById = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useProjects as any).mockReturnValue({
      getProjectById: mockGetProjectById,
    });
  });

  it('renders loading state correctly', () => {
    mockGetProjectById.mockImplementation(() => new Promise(() => {})); // Never resolves

    renderWithRouter(<CaseStudyPage />);
    
    expect(screen.getByText('Loading case study...')).toBeInTheDocument();
  });

  it('renders error state when project fetch fails', async () => {
    mockGetProjectById.mockRejectedValue(new Error('Project not found'));

    renderWithRouter(<CaseStudyPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Project not found')).toBeInTheDocument();
      expect(screen.getByText('Back to Portfolio')).toBeInTheDocument();
    });
  });

  it('renders project details correctly with premium styling', async () => {
    mockGetProjectById.mockResolvedValue(mockProject);

    renderWithRouter(<CaseStudyPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Motion Project')).toBeInTheDocument();
      expect(screen.getByText('A comprehensive test project showcasing motion design capabilities')).toBeInTheDocument();
      expect(screen.getByText('Project Goal')).toBeInTheDocument();
      expect(screen.getByText('Our Solution')).toBeInTheDocument();
      expect(screen.getByText('Motion Breakdown')).toBeInTheDocument();
    });
  });

  it('displays case study badge in hero section', async () => {
    mockGetProjectById.mockResolvedValue(mockProject);

    renderWithRouter(<CaseStudyPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Case Study')).toBeInTheDocument();
    });
  });

  it('displays project goal section', async () => {
    mockGetProjectById.mockResolvedValue(mockProject);

    renderWithRouter(<CaseStudyPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Create engaging animations that tell a compelling story')).toBeInTheDocument();
    });
  });

  it('displays solution section', async () => {
    mockGetProjectById.mockResolvedValue(mockProject);

    renderWithRouter(<CaseStudyPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Used advanced motion techniques including parallax scrolling and micro-interactions')).toBeInTheDocument();
    });
  });

  it('displays motion breakdown with line breaks', async () => {
    mockGetProjectById.mockResolvedValue(mockProject);

    renderWithRouter(<CaseStudyPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/The animation consists of three main phases/)).toBeInTheDocument();
      expect(screen.getByText(/1\. Introduction with fade-in effects/)).toBeInTheDocument();
    });
  });

  it('displays tools and technologies section', async () => {
    mockGetProjectById.mockResolvedValue(mockProject);

    renderWithRouter(<CaseStudyPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Tools & Technologies')).toBeInTheDocument();
      expect(screen.getByText('After Effects')).toBeInTheDocument();
      expect(screen.getByText('Cinema 4D')).toBeInTheDocument();
      expect(screen.getByText('Photoshop')).toBeInTheDocument();
      expect(screen.getByText('Illustrator')).toBeInTheDocument();
    });
  });

  it('displays hero image correctly', async () => {
    mockGetProjectById.mockResolvedValue(mockProject);

    renderWithRouter(<CaseStudyPage />);
    
    await waitFor(() => {
      const image = screen.getByAltText('Test Motion Project');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', 'https://example.com/casestudy.jpg');
    });
  });

  it('displays project gallery section', async () => {
    mockGetProjectById.mockResolvedValue(mockProject);

    renderWithRouter(<CaseStudyPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Project Gallery')).toBeInTheDocument();
      expect(screen.getByText('Explore the visual journey of this project')).toBeInTheDocument();
    });
  });

  it('handles back button click correctly', async () => {
    mockGetProjectById.mockResolvedValue(mockProject);

    renderWithRouter(<CaseStudyPage />);
    
    await waitFor(() => {
      const backButtons = screen.getAllByText('Back to Portfolio');
      backButtons[0].click();
      expect(mockNavigate).toHaveBeenCalledWith('/portfolio');
    });
  });

  it('handles CTA button clicks correctly', async () => {
    mockGetProjectById.mockResolvedValue(mockProject);

    renderWithRouter(<CaseStudyPage />);
    
    await waitFor(() => {
      const getInTouchButton = screen.getByText('Get in Touch');
      getInTouchButton.click();
      expect(mockNavigate).toHaveBeenCalledWith('/contact');
      
      const viewMoreButton = screen.getByText('View More Projects');
      viewMoreButton.click();
      expect(mockNavigate).toHaveBeenCalledWith('/portfolio');
    });
  });

  it('renders call to action section with premium styling', async () => {
    mockGetProjectById.mockResolvedValue(mockProject);

    renderWithRouter(<CaseStudyPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Interested in Working Together?')).toBeInTheDocument();
      expect(screen.getByText("Let's discuss how we can bring your vision to life with motion design that captivates and engages your audience.")).toBeInTheDocument();
      expect(screen.getByText("Let's Collaborate")).toBeInTheDocument();
    });
  });

  it('renders gallery thumbnails that can be clicked', async () => {
    mockGetProjectById.mockResolvedValue(mockProject);

    renderWithRouter(<CaseStudyPage />);
    
    await waitFor(() => {
      // Check for gallery thumbnail buttons
      const galleryButtons = screen.getAllByRole('button', { name: /View.*in gallery/i });
      expect(galleryButtons.length).toBeGreaterThan(0);
    });
  });
});
