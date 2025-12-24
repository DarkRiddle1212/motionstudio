import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import PortfolioPage from './PortfolioPage';
import { useProjects } from '../../../hooks/useProjects';

// Mock the useProjects hook
vi.mock('../../../hooks/useProjects');

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, onClick, 'data-testid': testId, ...props }: any) => (
      <div className={className} onClick={onClick} data-testid={testId} {...props}>{children}</div>
    ),
    article: ({ children, className, onClick, 'data-testid': testId, ...props }: any) => (
      <article className={className} onClick={onClick} data-testid={testId} {...props}>{children}</article>
    ),
    img: ({ src, alt, className, ...props }: any) => (
      <img src={src} alt={alt} className={className} {...props} />
    ),
    button: ({ children, className, onClick, 'data-testid': testId, ...props }: any) => (
      <button className={className} onClick={onClick} data-testid={testId} {...props}>{children}</button>
    ),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock Animation components
vi.mock('../../Animation', () => ({
  FadeIn: ({ children }: any) => <div data-testid="fade-in">{children}</div>,
  SlideUp: ({ children }: any) => <div data-testid="slide-up">{children}</div>,
  Parallax: ({ children, className }: any) => <div className={className}>{children}</div>,
  StaggerContainer: ({ children, className }: any) => <div className={className} data-testid="stagger-container">{children}</div>,
  StaggerItem: ({ children }: any) => <div data-testid="stagger-item">{children}</div>,
}));

// Mock Common components
vi.mock('../../Common', () => ({
  Button: ({ children, onClick, className, 'data-testid': testId }: any) => (
    <button onClick={onClick} className={className} data-testid={testId}>{children}</button>
  ),
}));

// Mock Layout components
vi.mock('../../Layout', () => ({
  Layout: ({ children }: any) => <div>{children}</div>,
}));

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockProjects = [
  {
    id: '1',
    title: 'Project One',
    description: 'First test project',
    goal: 'Test goal',
    solution: 'Test solution',
    motionBreakdown: 'Test breakdown',
    toolsUsed: ['After Effects', 'Cinema 4D'],
    thumbnailUrl: 'https://example.com/thumb1.jpg',
    caseStudyUrl: 'https://example.com/case1.jpg',
    order: 1,
    isPublished: true,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  },
  {
    id: '2',
    title: 'Project Two',
    description: 'Second test project',
    goal: 'Test goal 2',
    solution: 'Test solution 2',
    motionBreakdown: 'Test breakdown 2',
    toolsUsed: ['Photoshop', 'Illustrator'],
    thumbnailUrl: 'https://example.com/thumb2.jpg',
    caseStudyUrl: 'https://example.com/case2.jpg',
    order: 2,
    isPublished: true,
    createdAt: '2023-01-02T00:00:00Z',
    updatedAt: '2023-01-02T00:00:00Z',
  },
];

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('PortfolioPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state correctly', () => {
    (useProjects as any).mockReturnValue({
      projects: [],
      loading: true,
      error: null,
    });

    renderWithRouter(<PortfolioPage />);
    
    expect(screen.getByText('Loading portfolio...')).toBeInTheDocument();
  });

  it('renders error state correctly', () => {
    (useProjects as any).mockReturnValue({
      projects: [],
      loading: false,
      error: 'Failed to load projects',
    });

    renderWithRouter(<PortfolioPage />);
    
    expect(screen.getByText('Failed to load projects')).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });

  it('renders portfolio header and projects grid', () => {
    (useProjects as any).mockReturnValue({
      projects: mockProjects,
      loading: false,
      error: null,
    });

    renderWithRouter(<PortfolioPage />);
    
    expect(screen.getByText('Motion Design Portfolio')).toBeInTheDocument();
    expect(screen.getByText('Project One')).toBeInTheDocument();
    expect(screen.getByText('Project Two')).toBeInTheDocument();
  });

  it('renders empty state when no projects', () => {
    (useProjects as any).mockReturnValue({
      projects: [],
      loading: false,
      error: null,
    });

    renderWithRouter(<PortfolioPage />);
    
    expect(screen.getByText('No Projects Available')).toBeInTheDocument();
    expect(screen.getByText('Check back soon for new projects!')).toBeInTheDocument();
  });

  it('handles project card clicks correctly', async () => {
    (useProjects as any).mockReturnValue({
      projects: mockProjects,
      loading: false,
      error: null,
    });

    renderWithRouter(<PortfolioPage />);
    
    const projectCard = screen.getByTestId('project-card-1');
    fireEvent.click(projectCard);
    
    expect(mockNavigate).toHaveBeenCalledWith('/portfolio/1');
  });

  it('filters projects by category correctly', async () => {
    (useProjects as any).mockReturnValue({
      projects: mockProjects,
      loading: false,
      error: null,
    });

    renderWithRouter(<PortfolioPage />);
    
    // Click on After Effects filter button
    const filterButton = screen.getByTestId('filter-after-effects');
    fireEvent.click(filterButton);
    
    await waitFor(() => {
      expect(screen.getByText('Project One')).toBeInTheDocument();
      expect(screen.queryByText('Project Two')).not.toBeInTheDocument();
    });
  });

  it('sorts projects correctly', async () => {
    (useProjects as any).mockReturnValue({
      projects: mockProjects,
      loading: false,
      error: null,
    });

    renderWithRouter(<PortfolioPage />);
    
    const sortSelect = screen.getByTestId('sort-select');
    fireEvent.change(sortSelect, { target: { value: 'title' } });
    
    await waitFor(() => {
      const projectCards = screen.getAllByTestId(/project-card-/);
      expect(projectCards).toHaveLength(2);
    });
  });

  it('shows filtered empty state correctly', async () => {
    (useProjects as any).mockReturnValue({
      projects: mockProjects,
      loading: false,
      error: null,
    });

    renderWithRouter(<PortfolioPage />);
    
    // Click on a filter that has no matching projects
    const filterButton = screen.getByTestId('filter-photoshop');
    fireEvent.click(filterButton);
    
    await waitFor(() => {
      // Project Two should be visible (has Photoshop)
      expect(screen.getByText('Project Two')).toBeInTheDocument();
      // Project One should not be visible (doesn't have Photoshop)
      expect(screen.queryByText('Project One')).not.toBeInTheDocument();
    });
  });

  it('clears filter when All Projects is clicked', async () => {
    (useProjects as any).mockReturnValue({
      projects: mockProjects,
      loading: false,
      error: null,
    });

    renderWithRouter(<PortfolioPage />);
    
    // First filter by After Effects
    const filterButton = screen.getByTestId('filter-after-effects');
    fireEvent.click(filterButton);
    
    await waitFor(() => {
      expect(screen.queryByText('Project Two')).not.toBeInTheDocument();
    });
    
    // Then click All Projects to clear filter
    const allProjectsButton = screen.getByTestId('filter-all-projects');
    fireEvent.click(allProjectsButton);
    
    await waitFor(() => {
      expect(screen.getByText('Project One')).toBeInTheDocument();
      expect(screen.getByText('Project Two')).toBeInTheDocument();
    });
  });

  it('handles CTA button clicks correctly', () => {
    (useProjects as any).mockReturnValue({
      projects: mockProjects,
      loading: false,
      error: null,
    });

    renderWithRouter(<PortfolioPage />);
    
    fireEvent.click(screen.getByTestId('start-project-button'));
    expect(mockNavigate).toHaveBeenCalledWith('/contact');
    
    fireEvent.click(screen.getByTestId('learn-motion-design-button'));
    expect(mockNavigate).toHaveBeenCalledWith('/courses');
  });

  it('displays project count correctly', () => {
    (useProjects as any).mockReturnValue({
      projects: mockProjects,
      loading: false,
      error: null,
    });

    renderWithRouter(<PortfolioPage />);
    
    // Check for the count display in the results section
    const countText = screen.getByText(/Showing/);
    expect(countText).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('renders premium hero section with decorative elements', () => {
    (useProjects as any).mockReturnValue({
      projects: mockProjects,
      loading: false,
      error: null,
    });

    renderWithRouter(<PortfolioPage />);
    
    expect(screen.getByText('Our Work')).toBeInTheDocument();
    expect(screen.getByText(/Explore our collection/)).toBeInTheDocument();
  });

  it('renders tool tags on project cards', () => {
    (useProjects as any).mockReturnValue({
      projects: mockProjects,
      loading: false,
      error: null,
    });

    renderWithRouter(<PortfolioPage />);
    
    // Check that tool tags are rendered (use getAllByText since tools appear in both filter and cards)
    const afterEffectsElements = screen.getAllByText('After Effects');
    expect(afterEffectsElements.length).toBeGreaterThanOrEqual(1);
    
    const cinema4DElements = screen.getAllByText('Cinema 4D');
    expect(cinema4DElements.length).toBeGreaterThanOrEqual(1);
  });
});
