import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import CourseContentPage from './CourseContentPage';
import { useAuth } from '../../../hooks/useAuth';
import { useLessons } from '../../../hooks/useLessons';
import { useCourses } from '../../../hooks/useCourses';

// Mock the hooks
vi.mock('../../../hooks/useAuth');
vi.mock('../../../hooks/useLessons');
vi.mock('../../../hooks/useCourses');
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: vi.fn(),
    useNavigate: vi.fn(),
  };
});

// Mock the animation components
vi.mock('../../Animation', () => ({
  FadeIn: ({ children }: { children: React.ReactNode }) => <div data-testid="fade-in">{children}</div>,
  SlideUp: ({ children }: { children: React.ReactNode }) => <div data-testid="slide-up">{children}</div>,
}));

// Mock LessonCard component
vi.mock('../Lessons/LessonCard', () => ({
  default: ({ lesson, onClick }: { lesson: any; onClick: (id: string) => void }) => (
    <div data-testid={`lesson-card-${lesson.id}`} onClick={() => onClick(lesson.id)}>
      <h3>{lesson.title}</h3>
      <p>{lesson.description}</p>
    </div>
  ),
}));

const mockUseAuth = vi.mocked(useAuth);
const mockUseLessons = vi.mocked(useLessons);
const mockUseCourses = vi.mocked(useCourses);
const mockNavigate = vi.fn();
const mockUseParams = vi.fn();

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Test data
const mockCourse = {
  id: 'course-1',
  title: 'Motion Design Fundamentals',
  description: 'Learn the basics of motion design',
  duration: '4 weeks',
  instructor: {
    id: 'instructor-1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
  },
};

const mockLessons = [
  {
    id: 'lesson-1',
    title: 'Introduction to Motion Design',
    description: 'Learn the basics',
    content: 'Content here',
    videoUrl: 'video1.mp4',
    fileUrls: ['file1.pdf'],
    order: 1,
    isPublished: true,
    isCompleted: true,
    createdAt: '2023-01-01T00:00:00Z',
  },
  {
    id: 'lesson-2',
    title: 'Advanced Techniques',
    description: 'Advanced concepts',
    content: 'Advanced content',
    videoUrl: 'video2.mp4',
    fileUrls: [],
    order: 2,
    isPublished: true,
    isCompleted: false,
    createdAt: '2023-01-02T00:00:00Z',
  },
];

const mockAssignments = [
  {
    id: 'assignment-1',
    title: 'Create Your First Animation',
    description: 'Design a simple animation',
    submissionType: 'file' as const,
    deadline: '2023-12-31T23:59:59Z',
    createdAt: '2023-01-01T00:00:00Z',
  },
  {
    id: 'assignment-2',
    title: 'Portfolio Review',
    description: 'Submit your portfolio link',
    submissionType: 'link' as const,
    deadline: '2024-01-15T23:59:59Z',
    createdAt: '2023-01-05T00:00:00Z',
  },
];

const renderCourseContentPage = () => {
  return render(
    <BrowserRouter>
      <CourseContentPage />
    </BrowserRouter>
  );
};

describe('CourseContentPage Component', () => {
  beforeEach(async () => {
    mockUseAuth.mockReturnValue({
      token: 'mock-token',
      user: null,
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
      signup: vi.fn(),
      verifyEmail: vi.fn(),
    });

    mockUseLessons.mockReturnValue({
      lessons: mockLessons,
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    mockUseCourses.mockReturnValue({
      courses: [],
      loading: false,
      error: null,
      fetchCourses: vi.fn(),
      fetchCourseById: vi.fn().mockResolvedValue(mockCourse),
      enrollInCourse: vi.fn(),
    });

    const { useParams, useNavigate } = await import('react-router-dom');
    vi.mocked(useParams).mockReturnValue({
      courseId: 'course-1',
    });
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);

    // Mock successful assignments fetch
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ assignments: mockAssignments }),
    });

    mockFetch.mockClear();
    mockNavigate.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading State', () => {
    it('shows loading spinner while fetching data', () => {
      mockUseLessons.mockReturnValue({
        lessons: [],
        loading: true,
        error: null,
        refetch: vi.fn(),
      });

      renderCourseContentPage();

      expect(screen.getByText('Loading course content...')).toBeInTheDocument();
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('shows error message when lessons fail to load', async () => {
      mockUseLessons.mockReturnValue({
        lessons: [],
        loading: false,
        error: 'Failed to fetch lessons',
        refetch: vi.fn(),
      });

      mockUseCourses.mockReturnValue({
        courses: [],
        loading: false,
        error: null,
        fetchCourses: vi.fn(),
        fetchCourseById: vi.fn().mockResolvedValue(mockCourse),
        enrollInCourse: vi.fn(),
      });

      renderCourseContentPage();

      await waitFor(() => {
        expect(screen.getByText('Unable to Load Course')).toBeInTheDocument();
        expect(screen.getByText('Failed to fetch lessons')).toBeInTheDocument();
      });
    });

    it('shows error message when course fails to load', async () => {
      mockUseCourses.mockReturnValue({
        courses: [],
        loading: false,
        error: null,
        fetchCourses: vi.fn(),
        fetchCourseById: vi.fn().mockRejectedValue(new Error('Course not found')),
        enrollInCourse: vi.fn(),
      });

      renderCourseContentPage();

      await waitFor(() => {
        expect(screen.getByText('Unable to Load Course')).toBeInTheDocument();
        expect(screen.getByText('Course not found')).toBeInTheDocument();
      });
    });

    it('provides back to dashboard button in error state', async () => {
      mockUseLessons.mockReturnValue({
        lessons: [],
        loading: false,
        error: 'Network error',
        refetch: vi.fn(),
      });

      mockUseCourses.mockReturnValue({
        courses: [],
        loading: false,
        error: null,
        fetchCourses: vi.fn(),
        fetchCourseById: vi.fn().mockResolvedValue(mockCourse),
        enrollInCourse: vi.fn(),
      });

      renderCourseContentPage();

      await waitFor(() => {
        const backButton = screen.getByRole('button', { name: /back to dashboard/i });
        expect(backButton).toBeInTheDocument();

        fireEvent.click(backButton);
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      });
    });
  });

  describe('Course Header', () => {
    it('renders course information correctly', async () => {
      renderCourseContentPage();

      await waitFor(() => {
        expect(screen.getByText('Motion Design Fundamentals')).toBeInTheDocument();
        expect(screen.getByText('Learn the basics of motion design')).toBeInTheDocument();
      });
    });

    it('displays course statistics', async () => {
      renderCourseContentPage();

      await waitFor(() => {
        expect(screen.getByText('📖 2 lessons')).toBeInTheDocument();
        expect(screen.getByText('📝 2 assignments')).toBeInTheDocument();
        expect(screen.getByText('⏱️ 4 weeks')).toBeInTheDocument();
        expect(screen.getByText('👤 John Doe')).toBeInTheDocument();
      });
    });

    it('calculates and displays progress correctly', async () => {
      renderCourseContentPage();

      await waitFor(() => {
        expect(screen.getByText('Course Progress')).toBeInTheDocument();
        expect(screen.getAllByText('50%')).toHaveLength(2); // Progress bar and percentage display
      });
    });

    it('provides back to dashboard navigation', async () => {
      renderCourseContentPage();

      await waitFor(() => {
        const backButton = screen.getByRole('button', { name: /back to dashboard/i });
        expect(backButton).toBeInTheDocument();

        fireEvent.click(backButton);
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      });
    });
  });

  describe('Tab Navigation', () => {
    it('renders tab navigation with correct counts', async () => {
      renderCourseContentPage();

      await waitFor(() => {
        expect(screen.getByText('Lessons (2)')).toBeInTheDocument();
        expect(screen.getByText('Assignments (2)')).toBeInTheDocument();
      });
    });

    it('starts with lessons tab active', async () => {
      renderCourseContentPage();

      await waitFor(() => {
        const lessonsTab = screen.getByText('Lessons (2)');
        expect(lessonsTab).toHaveClass('border-brand-accent', 'text-brand-accent');
      });
    });

    it('switches to assignments tab when clicked', async () => {
      renderCourseContentPage();

      await waitFor(() => {
        const assignmentsTab = screen.getByText('Assignments (2)');
        fireEvent.click(assignmentsTab);

        expect(assignmentsTab).toHaveClass('border-brand-accent', 'text-brand-accent');
      });
    });

    it('applies hover styles to inactive tabs', async () => {
      renderCourseContentPage();

      await waitFor(() => {
        const assignmentsTab = screen.getByText('Assignments (2)');
        expect(assignmentsTab).toHaveClass('hover:text-brand-primary-text', 'hover:border-brand-secondary-text');
      });
    });
  });

  describe('Lessons Tab', () => {
    it('renders lesson cards when lessons are available', async () => {
      renderCourseContentPage();

      await waitFor(() => {
        expect(screen.getByTestId('lesson-card-lesson-1')).toBeInTheDocument();
        expect(screen.getByTestId('lesson-card-lesson-2')).toBeInTheDocument();
        expect(screen.getByText('Introduction to Motion Design')).toBeInTheDocument();
        expect(screen.getByText('Advanced Techniques')).toBeInTheDocument();
      });
    });

    it('handles lesson card clicks', async () => {
      renderCourseContentPage();

      await waitFor(() => {
        const lessonCard = screen.getByTestId('lesson-card-lesson-1');
        fireEvent.click(lessonCard);

        expect(mockNavigate).toHaveBeenCalledWith('/courses/course-1/lessons/lesson-1');
      });
    });

    it('shows empty state when no lessons available', async () => {
      mockUseLessons.mockReturnValue({
        lessons: [],
        loading: false,
        error: null,
        refetch: vi.fn(),
      });

      renderCourseContentPage();

      await waitFor(() => {
        expect(screen.getByText('No Lessons Yet')).toBeInTheDocument();
        expect(screen.getByText('Lessons will appear here once the instructor adds them to the course.')).toBeInTheDocument();
      });
    });
  });

  describe('Assignments Tab', () => {
    it('renders assignment cards when assignments are available', async () => {
      renderCourseContentPage();

      await waitFor(() => {
        // Switch to assignments tab
        fireEvent.click(screen.getByText('Assignments (2)'));

        expect(screen.getByText('Create Your First Animation')).toBeInTheDocument();
        expect(screen.getByText('Portfolio Review')).toBeInTheDocument();
        expect(screen.getByText('Design a simple animation')).toBeInTheDocument();
        expect(screen.getByText('Submit your portfolio link')).toBeInTheDocument();
      });
    });

    it('displays assignment metadata correctly', async () => {
      renderCourseContentPage();

      await waitFor(() => {
        fireEvent.click(screen.getByText('Assignments (2)'));

        expect(screen.getByText('file')).toBeInTheDocument();
        expect(screen.getByText('link')).toBeInTheDocument();
        expect(screen.getAllByText(/Due: \d{1,2}\/\d{1,2}\/\d{4}/)).toHaveLength(2);
      });
    });

    it('handles assignment card clicks', async () => {
      renderCourseContentPage();

      await waitFor(() => {
        fireEvent.click(screen.getByText('Assignments (2)'));

        const assignmentCard = screen.getByText('Create Your First Animation').closest('[role="button"]');
        if (assignmentCard) {
          fireEvent.click(assignmentCard);
          expect(mockNavigate).toHaveBeenCalledWith('/assignments/assignment-1');
        }
      });
    });

    it('handles assignment button clicks', async () => {
      renderCourseContentPage();

      await waitFor(() => {
        fireEvent.click(screen.getByText('Assignments (2)'));

        const viewButtons = screen.getAllByText('View Assignment');
        fireEvent.click(viewButtons[0]);

        expect(mockNavigate).toHaveBeenCalledWith('/assignments/assignment-1');
      });
    });

    it('shows empty state when no assignments available', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ assignments: [] }),
      });

      renderCourseContentPage();

      await waitFor(() => {
        fireEvent.click(screen.getByText('Assignments (0)'));

        expect(screen.getByText('No Assignments Yet')).toBeInTheDocument();
        expect(screen.getByText('Assignments will appear here once the instructor adds them to the course.')).toBeInTheDocument();
      });
    });
  });

  describe('Progress Calculation', () => {
    it('calculates 0% progress when no lessons', async () => {
      mockUseLessons.mockReturnValue({
        lessons: [],
        loading: false,
        error: null,
        refetch: vi.fn(),
      });

      renderCourseContentPage();

      await waitFor(() => {
        expect(screen.getAllByText('0%')).toHaveLength(2);
      });
    });

    it('calculates 100% progress when all lessons completed', async () => {
      const completedLessons = mockLessons.map(lesson => ({ ...lesson, isCompleted: true }));
      mockUseLessons.mockReturnValue({
        lessons: completedLessons,
        loading: false,
        error: null,
        refetch: vi.fn(),
      });

      renderCourseContentPage();

      await waitFor(() => {
        expect(screen.getAllByText('100%')).toHaveLength(2);
      });
    });

    it('rounds progress percentage correctly', async () => {
      // 1 of 3 lessons completed = 33.33% -> rounds to 33%
      const threeLessons = [
        ...mockLessons,
        {
          id: 'lesson-3',
          title: 'Third Lesson',
          description: 'Third lesson description',
          content: 'Content',
          videoUrl: '',
          fileUrls: [],
          order: 3,
          isPublished: true,
          isCompleted: false,
          createdAt: '2023-01-03T00:00:00Z',
        },
      ];

      mockUseLessons.mockReturnValue({
        lessons: threeLessons,
        loading: false,
        error: null,
        refetch: vi.fn(),
      });

      renderCourseContentPage();

      await waitFor(() => {
        expect(screen.getAllByText('33%')).toHaveLength(2);
      });
    });
  });

  describe('API Integration', () => {
    it('fetches assignments on component mount', async () => {
      renderCourseContentPage();

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:5000/api/courses/course-1/assignments',
          expect.objectContaining({
            headers: {
              'Authorization': 'Bearer mock-token',
              'Content-Type': 'application/json',
            },
          })
        );
      });
    });

    it('handles assignments fetch failure gracefully', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      renderCourseContentPage();

      await waitFor(() => {
        fireEvent.click(screen.getByText('Assignments (0)'));
        expect(screen.getByText('No Assignments Yet')).toBeInTheDocument();
      });
    });

    it('does not fetch data when no courseId', async () => {
      mockFetch.mockClear();
      const { useParams } = await import('react-router-dom');
      vi.mocked(useParams).mockReturnValue({
        courseId: undefined,
      });

      renderCourseContentPage();

      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('does not fetch data when no token', () => {
      mockUseAuth.mockReturnValue({
        token: null,
        user: null,
        isAuthenticated: false,
        login: vi.fn(),
        logout: vi.fn(),
        signup: vi.fn(),
        verifyEmail: vi.fn(),
      });

      renderCourseContentPage();

      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe('Responsive Design', () => {
    it('applies responsive grid classes', async () => {
      const { container } = renderCourseContentPage();

      await waitFor(() => {
        expect(container.querySelector('.grid')).toBeInTheDocument();
        expect(container.querySelector('.gap-4')).toBeInTheDocument();
      });
    });

    it('uses proper spacing classes', async () => {
      const { container } = renderCourseContentPage();

      await waitFor(() => {
        expect(container.querySelector('.max-w-6xl')).toBeInTheDocument();
        expect(container.querySelector('.mx-auto')).toBeInTheDocument();
        expect(container.querySelector('.px-4')).toBeInTheDocument();
        expect(container.querySelector('.py-8')).toBeInTheDocument();
      });
    });
  });
});