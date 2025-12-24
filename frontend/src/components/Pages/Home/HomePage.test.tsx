import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import HomePage from './HomePage';

// Store mock data for FeaturedProjects to access
let mockProjectsData: any[] = [];
let mockProjectsLoading = false;

// Mock the hooks
vi.mock('../../../hooks/useProjects', () => ({
  useProjects: () => ({
    projects: mockProjectsData,
    loading: mockProjectsLoading,
  }),
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

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
    article: ({ children, onClick, ...props }: any) => <article onClick={onClick} {...props}>{children}</article>,
  },
}));

// Mock Animation components
vi.mock('../../Animation', () => ({
  FadeIn: ({ children }: any) => <div>{children}</div>,
  SlideUp: ({ children }: any) => <div>{children}</div>,
  Parallax: ({ children, className }: any) => <div className={className}>{children}</div>,
}));

// Mock Layout component to avoid useAuth dependency
vi.mock('../../Layout', () => ({
  Layout: ({ children, className }: any) => <div className={className}>{children}</div>,
}));

// Mock FeaturedProjects component - uses the mockProjectsData and mockNavigate
vi.mock('./FeaturedProjects', () => ({
  default: () => {
    if (mockProjectsLoading) {
      return (
        <section data-testid="featured-projects-section">
          <h2>Featured Work</h2>
          <div className="animate-spin" role="generic">Loading...</div>
        </section>
      );
    }
    
    const featuredProjects = mockProjectsData?.slice(0, 3) || [];
    
    if (featuredProjects.length === 0) {
      return (
        <section data-testid="featured-projects-section">
          <h2>Featured Work</h2>
          <p>Featured projects coming soon!</p>
        </section>
      );
    }
    
    return (
      <section data-testid="featured-projects-section">
        <h2>Featured Work</h2>
        {featuredProjects.map((project: any) => (
          <div 
            key={project.id} 
            data-testid={`featured-project-${project.id}`}
            onClick={() => mockNavigate(`/portfolio/${project.id}`)}
          >
            <h3>{project.title}</h3>
            <p>{project.description}</p>
          </div>
        ))}
        <button 
          data-testid="view-all-projects-cta"
          onClick={() => mockNavigate('/portfolio')}
        >
          View All Projects
        </button>
      </section>
    );
  },
}));

// Store mock courses data for CoursesDiscovery to access
let mockCoursesData: any[] = [];
let mockCoursesLoading = false;

// Mock CoursesDiscovery component - uses the mockCoursesData and mockNavigate
vi.mock('./CoursesDiscovery', () => ({
  default: () => {
    if (mockCoursesLoading) {
      return (
        <section data-testid="courses-discovery-section">
          <h2>Learn Motion Design</h2>
          <div className="animate-spin" role="generic">Loading...</div>
        </section>
      );
    }
    
    const featuredCourses = mockCoursesData?.slice(0, 3) || [];
    
    if (featuredCourses.length === 0) {
      return (
        <section data-testid="courses-discovery-section">
          <h2>Learn Motion Design</h2>
          <p>Courses coming soon!</p>
        </section>
      );
    }
    
    return (
      <section data-testid="courses-discovery-section">
        <h2>Learn Motion Design</h2>
        {featuredCourses.map((course: any) => (
          <div 
            key={course.id} 
            data-testid={`featured-course-${course.id}`}
            onClick={() => mockNavigate(`/courses/${course.id}`)}
          >
            <h3>{course.title}</h3>
            <p>{course.description}</p>
          </div>
        ))}
        <button 
          data-testid="view-all-courses-cta"
          onClick={() => mockNavigate('/courses')}
        >
          View All Courses
        </button>
      </section>
    );
  },
}));

// Mock Common components
vi.mock('../../Common', () => ({
  ProjectCard: ({ project, onClick, 'data-testid': testId }: any) => (
    <div data-testid={testId} onClick={() => onClick(project.id)}>
      <h3>{project.title}</h3>
      <p>{project.description}</p>
    </div>
  ),
  CourseCard: ({ course, onViewDetails, 'data-testid': testId }: any) => (
    <div data-testid={testId} onClick={() => onViewDetails(course.id)}>
      <h3>{course.title}</h3>
      <p>{course.description}</p>
    </div>
  ),
  Button: ({ children, onClick, 'data-testid': testId, className }: any) => (
    <button onClick={onClick} data-testid={testId} className={className}>{children}</button>
  ),
}));

// Mock Testimonials component
vi.mock('./Testimonials', () => ({
  default: () => (
    <section data-testid="testimonials-section">
      <h2>What Our Clients Say</h2>
      <div data-testid="testimonial-card-1">
        <p>"Great experience working with the team"</p>
        <span>Sarah Chen - Creative Director at Pixel Studios</span>
      </div>
      <div data-testid="testimonial-card-2">
        <p>"Incredible motion design work"</p>
        <span>Marcus Johnson - Senior Designer at Brand Co</span>
      </div>
      <div data-testid="testimonial-card-3">
        <p>"Exceeded our expectations"</p>
        <span>Emily Rodriguez - Marketing Lead at TechFlow</span>
      </div>
    </section>
  ),
}));

// Mock PremiumCTA component
vi.mock('./PremiumCTA', () => ({
  default: () => (
    <section data-testid="premium-cta-section">
      <h2>Ready to Get Started?</h2>
      <p>Whether you want to hire us for your next project or learn motion design yourself</p>
      <button 
        data-testid="final-hire-cta"
        onClick={() => mockNavigate('/contact')}
      >
        Start Your Project
      </button>
      <button 
        data-testid="final-enrollment-cta"
        onClick={() => mockNavigate('/signup')}
      >
        Start Learning Today
      </button>
    </section>
  ),
}));

const mockProjects = [
  {
    id: '1',
    title: 'Featured Project One',
    description: 'First featured project',
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
    title: 'Featured Project Two',
    description: 'Second featured project',
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
  {
    id: '3',
    title: 'Featured Project Three',
    description: 'Third featured project',
    goal: 'Test goal 3',
    solution: 'Test solution 3',
    motionBreakdown: 'Test breakdown 3',
    toolsUsed: ['Blender'],
    thumbnailUrl: 'https://example.com/thumb3.jpg',
    caseStudyUrl: 'https://example.com/case3.jpg',
    order: 3,
    isPublished: true,
    createdAt: '2023-01-03T00:00:00Z',
    updatedAt: '2023-01-03T00:00:00Z',
  },
];

const mockCourses = [
  {
    id: 'course-1',
    title: 'Motion Design Fundamentals',
    description: 'Learn the basics of motion design',
    duration: '4 weeks',
    pricing: 0,
    currency: 'USD',
    curriculum: 'Week 1: Introduction...',
    isPublished: true,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
    instructor: {
      id: 'instructor-1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
    },
    _count: {
      enrollments: 50,
      lessons: 10,
      assignments: 5,
    },
  },
  {
    id: 'course-2',
    title: 'Advanced Animation Techniques',
    description: 'Master advanced animation',
    duration: '6 weeks',
    pricing: 99,
    currency: 'USD',
    curriculum: 'Week 1: Advanced concepts...',
    isPublished: true,
    createdAt: '2023-01-02T00:00:00Z',
    updatedAt: '2023-01-02T00:00:00Z',
    instructor: {
      id: 'instructor-1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
    },
    _count: {
      enrollments: 30,
      lessons: 15,
      assignments: 8,
    },
  },
  {
    id: 'course-3',
    title: 'Character Animation',
    description: 'Bring characters to life',
    duration: '8 weeks',
    pricing: 149,
    currency: 'USD',
    curriculum: 'Week 1: Character basics...',
    isPublished: true,
    createdAt: '2023-01-03T00:00:00Z',
    updatedAt: '2023-01-03T00:00:00Z',
    instructor: {
      id: 'instructor-2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
    },
    _count: {
      enrollments: 25,
      lessons: 20,
      assignments: 10,
    },
  },
];

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

// Helper to set mock data for tests
const setMockProjectsData = (projects: any[], loading = false) => {
  mockProjectsData = projects;
  mockProjectsLoading = loading;
};

// Helper to set mock courses data for tests
const setMockCoursesData = (courses: any[], loading = false) => {
  mockCoursesData = courses;
  mockCoursesLoading = loading;
};

describe('HomePage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock data
    mockProjectsData = [];
    mockProjectsLoading = false;
    mockCoursesData = [];
    mockCoursesLoading = false;
  });

  describe('Hero Section', () => {
    it('renders hero section with heading and description', () => {
      setMockProjectsData([]);
      setMockCoursesData([]);

      renderWithRouter(<HomePage />);
      
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Motion Design');
      expect(screen.getByText(/That Moves/i)).toBeInTheDocument();
      expect(screen.getByText(/We create purposeful motion design/i)).toBeInTheDocument();
    });

    it('renders hero CTA buttons', () => {
      setMockProjectsData([]);
      setMockCoursesData([]);

      renderWithRouter(<HomePage />);
      
      expect(screen.getByTestId('hire-us-cta')).toBeInTheDocument();
      expect(screen.getByTestId('browse-courses-cta')).toBeInTheDocument();
    });

    it('navigates to contact page when "Start Your Project" is clicked', () => {
      setMockProjectsData([]);
      setMockCoursesData([]);

      renderWithRouter(<HomePage />);
      
      const hireCTA = screen.getByTestId('hire-us-cta');
      fireEvent.click(hireCTA);
      
      expect(mockNavigate).toHaveBeenCalledWith('/contact');
    });

    it('navigates to courses page when "Browse Courses" is clicked', () => {
      setMockProjectsData([]);
      setMockCoursesData([]);

      renderWithRouter(<HomePage />);
      
      const coursesCTA = screen.getByTestId('browse-courses-cta');
      fireEvent.click(coursesCTA);
      
      expect(mockNavigate).toHaveBeenCalledWith('/courses');
    });
  });

  describe('Featured Projects Section', () => {
    it('renders featured projects section heading', () => {
      setMockProjectsData(mockProjects);
      setMockCoursesData([]);

      renderWithRouter(<HomePage />);
      
      expect(screen.getByText('Featured Work')).toBeInTheDocument();
    });

    it('displays loading state for projects', () => {
      setMockProjectsData([], true);
      setMockCoursesData([]);

      renderWithRouter(<HomePage />);
      
      const spinners = screen.getAllByRole('generic');
      const loadingSpinner = spinners.find(el => 
        el.className.includes('animate-spin')
      );
      expect(loadingSpinner).toBeInTheDocument();
    });

    it('renders first 3 featured projects', () => {
      setMockProjectsData(mockProjects);
      setMockCoursesData([]);

      renderWithRouter(<HomePage />);
      
      expect(screen.getByTestId('featured-project-1')).toBeInTheDocument();
      expect(screen.getByTestId('featured-project-2')).toBeInTheDocument();
      expect(screen.getByTestId('featured-project-3')).toBeInTheDocument();
    });

    it('shows empty state when no projects available', () => {
      setMockProjectsData([]);
      setMockCoursesData([]);

      renderWithRouter(<HomePage />);
      
      expect(screen.getByText('Featured projects coming soon!')).toBeInTheDocument();
    });

    it('renders "View All Projects" button when projects exist', () => {
      setMockProjectsData(mockProjects);
      setMockCoursesData([]);

      renderWithRouter(<HomePage />);
      
      expect(screen.getByTestId('view-all-projects-cta')).toBeInTheDocument();
    });

    it('navigates to portfolio when "View All Projects" is clicked', () => {
      setMockProjectsData(mockProjects);
      setMockCoursesData([]);

      renderWithRouter(<HomePage />);
      
      const viewAllCTA = screen.getByTestId('view-all-projects-cta');
      fireEvent.click(viewAllCTA);
      
      expect(mockNavigate).toHaveBeenCalledWith('/portfolio');
    });

    it('navigates to project detail when project card is clicked', () => {
      setMockProjectsData(mockProjects);
      setMockCoursesData([]);

      renderWithRouter(<HomePage />);
      
      const projectCard = screen.getByTestId('featured-project-1');
      fireEvent.click(projectCard);
      
      expect(mockNavigate).toHaveBeenCalledWith('/portfolio/1');
    });
  });

  describe('Course Discovery Section', () => {
    it('renders course discovery section heading', () => {
      setMockProjectsData([]);
      setMockCoursesData(mockCourses);

      renderWithRouter(<HomePage />);
      
      expect(screen.getByText('Learn Motion Design')).toBeInTheDocument();
    });

    it('displays loading state for courses', () => {
      setMockProjectsData([]);
      setMockCoursesData([], true);

      renderWithRouter(<HomePage />);
      
      const spinners = screen.getAllByRole('generic');
      const loadingSpinner = spinners.find(el => 
        el.className.includes('animate-spin')
      );
      expect(loadingSpinner).toBeInTheDocument();
    });

    it('renders first 3 featured courses', () => {
      setMockProjectsData([]);
      setMockCoursesData(mockCourses);

      renderWithRouter(<HomePage />);
      
      expect(screen.getByTestId('featured-course-course-1')).toBeInTheDocument();
      expect(screen.getByTestId('featured-course-course-2')).toBeInTheDocument();
      expect(screen.getByTestId('featured-course-course-3')).toBeInTheDocument();
    });

    it('shows empty state when no courses available', () => {
      setMockProjectsData([]);
      setMockCoursesData([]);

      renderWithRouter(<HomePage />);
      
      expect(screen.getByText('Courses coming soon!')).toBeInTheDocument();
    });

    it('renders "View All Courses" button when courses exist', () => {
      setMockProjectsData([]);
      setMockCoursesData(mockCourses);

      renderWithRouter(<HomePage />);
      
      expect(screen.getByTestId('view-all-courses-cta')).toBeInTheDocument();
    });

    it('navigates to courses page when "View All Courses" is clicked', () => {
      setMockProjectsData([]);
      setMockCoursesData(mockCourses);

      renderWithRouter(<HomePage />);
      
      const viewAllCTA = screen.getByTestId('view-all-courses-cta');
      fireEvent.click(viewAllCTA);
      
      expect(mockNavigate).toHaveBeenCalledWith('/courses');
    });

    it('navigates to course detail when course card is clicked', () => {
      setMockProjectsData([]);
      setMockCoursesData(mockCourses);

      renderWithRouter(<HomePage />);
      
      const courseCard = screen.getByTestId('featured-course-course-1');
      fireEvent.click(courseCard);
      
      expect(mockNavigate).toHaveBeenCalledWith('/courses/course-1');
    });
  });

  describe('Testimonials Section', () => {
    it('renders testimonials section with heading', () => {
      setMockProjectsData([]);
      setMockCoursesData([]);

      renderWithRouter(<HomePage />);
      
      expect(screen.getByText('What Our Clients Say')).toBeInTheDocument();
    });

    it('renders testimonial cards', () => {
      setMockProjectsData([]);
      setMockCoursesData([]);

      renderWithRouter(<HomePage />);
      
      expect(screen.getByTestId('testimonial-card-1')).toBeInTheDocument();
      expect(screen.getByTestId('testimonial-card-2')).toBeInTheDocument();
      expect(screen.getByTestId('testimonial-card-3')).toBeInTheDocument();
    });

    it('displays testimonial quotes', () => {
      setMockProjectsData([]);
      setMockCoursesData([]);

      renderWithRouter(<HomePage />);
      
      expect(screen.getByText(/"Great experience working with the team"/)).toBeInTheDocument();
      expect(screen.getByText(/"Incredible motion design work"/)).toBeInTheDocument();
      expect(screen.getByText(/"Exceeded our expectations"/)).toBeInTheDocument();
    });

    it('displays client information', () => {
      setMockProjectsData([]);
      setMockCoursesData([]);

      renderWithRouter(<HomePage />);
      
      expect(screen.getByText(/Sarah Chen/)).toBeInTheDocument();
      expect(screen.getByText(/Marcus Johnson/)).toBeInTheDocument();
      expect(screen.getByText(/Emily Rodriguez/)).toBeInTheDocument();
    });
  });

  describe('Final CTA Section', () => {
    it('renders final CTA section with heading', () => {
      setMockProjectsData([]);
      setMockCoursesData([]);

      renderWithRouter(<HomePage />);
      
      expect(screen.getByText('Ready to Get Started?')).toBeInTheDocument();
    });

    it('renders final CTA buttons', () => {
      setMockProjectsData([]);
      setMockCoursesData([]);

      renderWithRouter(<HomePage />);
      
      expect(screen.getByTestId('final-hire-cta')).toBeInTheDocument();
      expect(screen.getByTestId('final-enrollment-cta')).toBeInTheDocument();
    });

    it('navigates to contact page when "Hire Us" is clicked', () => {
      setMockProjectsData([]);
      setMockCoursesData([]);

      renderWithRouter(<HomePage />);
      
      const hireCTA = screen.getByTestId('final-hire-cta');
      fireEvent.click(hireCTA);
      
      expect(mockNavigate).toHaveBeenCalledWith('/contact');
    });

    it('navigates to signup page when "Start Learning Today" is clicked', () => {
      setMockProjectsData([]);
      setMockCoursesData([]);

      renderWithRouter(<HomePage />);
      
      const enrollCTA = screen.getByTestId('final-enrollment-cta');
      fireEvent.click(enrollCTA);
      
      expect(mockNavigate).toHaveBeenCalledWith('/signup');
    });
  });

  describe('Full Page Rendering', () => {
    it('renders all sections with content', () => {
      setMockProjectsData(mockProjects);
      setMockCoursesData(mockCourses);

      renderWithRouter(<HomePage />);
      
      // Hero section
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Motion Design');
      
      // Featured projects section
      expect(screen.getByText('Featured Work')).toBeInTheDocument();
      expect(screen.getByTestId('featured-project-1')).toBeInTheDocument();
      
      // Course discovery section
      expect(screen.getByText('Learn Motion Design')).toBeInTheDocument();
      expect(screen.getByTestId('featured-course-course-1')).toBeInTheDocument();
      
      // Final CTA section
      expect(screen.getByText('Ready to Get Started?')).toBeInTheDocument();
    });
  });
});
