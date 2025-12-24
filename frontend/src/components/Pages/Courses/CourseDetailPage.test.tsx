import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { CourseDetailPage } from './CourseDetailPage';

// Mock hooks
const mockUseCourses = {
  courses: [],
  loading: false,
  error: null,
  fetchCourses: vi.fn(),
  fetchCourseById: vi.fn(),
  enrollInCourse: vi.fn(),
};

const mockUseAuth = {
  isAuthenticated: false,
  user: null,
  token: null,
  loading: false,
  login: vi.fn(),
  signup: vi.fn(),
  logout: vi.fn(),
  verifyEmail: vi.fn(),
};

vi.mock('../../../hooks/useCourses', () => ({
  useCourses: () => mockUseCourses,
}));

vi.mock('../../../hooks/useAuth', () => ({
  useAuth: () => mockUseAuth,
}));

const mockNavigate = vi.fn();
const mockParams = { courseId: 'test-course-id' };

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => mockParams,
  };
});

const mockCourse = {
  id: 'test-course-id',
  title: 'Test Course',
  description: 'Test Description',
  duration: '4 weeks',
  pricing: 0,
  currency: 'USD',
  curriculum: 'Week 1: Introduction\nWeek 2: Basics',
  introVideoUrl: 'https://example.com/video.mp4',
  thumbnailUrl: 'https://example.com/thumb.jpg',
  isPublished: true,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
  instructor: {
    id: 'instructor1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
  },
  lessons: [
    {
      id: 'lesson1',
      title: 'Lesson 1',
      description: 'First lesson',
      order: 1,
      videoUrl: 'https://example.com/lesson1.mp4',
      createdAt: '2024-01-01',
    },
  ],
  assignments: [
    {
      id: 'assignment1',
      title: 'Assignment 1',
      description: 'First assignment',
      submissionType: 'file' as const,
      deadline: '2024-12-31',
      createdAt: '2024-01-01',
    },
  ],
  _count: {
    enrollments: 10,
    lessons: 1,
    assignments: 1,
  },
};

const renderCourseDetailPage = () => {
  return render(
    <BrowserRouter>
      <CourseDetailPage />
    </BrowserRouter>
  );
};

describe('CourseDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseCourses.fetchCourseById.mockResolvedValue(mockCourse);
    mockUseAuth.isAuthenticated = false;
  });

  it('shows loading state initially', () => {
    renderCourseDetailPage();
    
    expect(screen.getByText('Loading course...')).toBeInTheDocument();
  });

  it('renders course information after loading', async () => {
    renderCourseDetailPage();
    
    await waitFor(() => {
      expect(screen.getByText('Test Course')).toBeInTheDocument();
    });

    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('shows error state when course fetch fails', async () => {
    mockUseCourses.fetchCourseById.mockRejectedValue(new Error('Course not found'));
    
    renderCourseDetailPage();
    
    await waitFor(() => {
      expect(screen.getByText('Course not found')).toBeInTheDocument();
    });

    expect(screen.getByText('Back to Courses')).toBeInTheDocument();
  });

  it('displays course curriculum', async () => {
    renderCourseDetailPage();
    
    await waitFor(() => {
      expect(screen.getByText('Course Curriculum')).toBeInTheDocument();
    });

    expect(screen.getByText(/Week 1: Introduction/)).toBeInTheDocument();
  });

  it('displays lessons list', async () => {
    renderCourseDetailPage();
    
    await waitFor(() => {
      expect(screen.getByText('Lessons (1)')).toBeInTheDocument();
    });

    expect(screen.getByText('Lesson 1')).toBeInTheDocument();
    expect(screen.getByText('First lesson')).toBeInTheDocument();
  });

  it('displays assignments list', async () => {
    renderCourseDetailPage();
    
    await waitFor(() => {
      expect(screen.getByText('Assignments (1)')).toBeInTheDocument();
    });

    expect(screen.getByText('Assignment 1')).toBeInTheDocument();
    expect(screen.getByText('First assignment')).toBeInTheDocument();
  });

  it('shows free course badge for free courses', async () => {
    renderCourseDetailPage();
    
    await waitFor(() => {
      expect(screen.getByText('Free Course')).toBeInTheDocument();
    });
  });

  it('shows price for paid courses', async () => {
    const paidCourse = { ...mockCourse, pricing: 99 };
    mockUseCourses.fetchCourseById.mockResolvedValue(paidCourse);
    
    renderCourseDetailPage();
    
    await waitFor(() => {
      expect(screen.getAllByText('USD 99')).toHaveLength(2); // Badge and sidebar
    });
  });

  it('navigates to login when unauthenticated user clicks enroll', async () => {
    mockUseAuth.isAuthenticated = false;
    
    renderCourseDetailPage();
    
    await waitFor(() => {
      expect(screen.getByText('Test Course')).toBeInTheDocument();
    });

    const enrollButtons = screen.getAllByText('Enroll Free');
    fireEvent.click(enrollButtons[0]);

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('enrolls authenticated user in course', async () => {
    mockUseAuth.isAuthenticated = true;
    mockUseCourses.enrollInCourse.mockResolvedValue({});
    
    renderCourseDetailPage();
    
    await waitFor(() => {
      expect(screen.getByText('Test Course')).toBeInTheDocument();
    });

    const enrollButtons = screen.getAllByText('Enroll Free');
    fireEvent.click(enrollButtons[0]);

    await waitFor(() => {
      expect(mockUseCourses.enrollInCourse).toHaveBeenCalledWith('test-course-id');
    });
  });

  it('shows error message when enrollment fails', async () => {
    mockUseAuth.isAuthenticated = true;
    mockUseCourses.enrollInCourse.mockRejectedValue(new Error('Enrollment failed'));
    
    renderCourseDetailPage();
    
    await waitFor(() => {
      expect(screen.getByText('Test Course')).toBeInTheDocument();
    });

    const enrollButtons = screen.getAllByText('Enroll Free');
    fireEvent.click(enrollButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Enrollment failed')).toBeInTheDocument();
    });
  });
});
