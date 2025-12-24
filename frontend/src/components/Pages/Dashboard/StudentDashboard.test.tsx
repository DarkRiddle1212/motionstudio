import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import StudentDashboard from './StudentDashboard';

// Mock the hooks
vi.mock('../../../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../../hooks/useCourses', () => ({
  useStudentCourses: vi.fn(),
}));

import { useStudentCourses } from '../../../hooks/useCourses';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

// Mock the animation components
vi.mock('../../Animation', () => ({
  FadeIn: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SlideUp: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Test data
const mockUser = {
  id: 'user-1',
  email: 'student@example.com',
  firstName: 'John',
  lastName: 'Doe',
  role: 'student' as const,
  emailVerified: true,
};

const mockEnrollments = [
  {
    id: 'enrollment-1',
    studentId: 'user-1',
    courseId: 'course-1',
    enrolledAt: '2023-01-01T00:00:00Z',
    progressPercentage: 75,
    status: 'active' as const,
    course: {
      id: 'course-1',
      title: 'Motion Design Fundamentals',
      description: 'Learn the basics of motion design',
      duration: '4 weeks',
      pricing: 0,
      thumbnailUrl: 'https://example.com/thumb1.jpg',
      instructor: {
        firstName: 'Jane',
        lastName: 'Smith',
      },
      _count: {
        lessons: 8,
      },
    },
  },
  {
    id: 'enrollment-2',
    studentId: 'user-1',
    courseId: 'course-2',
    enrolledAt: '2023-01-15T00:00:00Z',
    progressPercentage: 25,
    status: 'active' as const,
    course: {
      id: 'course-2',
      title: 'Advanced Animation Techniques',
      description: 'Master advanced animation concepts',
      duration: '6 weeks',
      pricing: 99,
      thumbnailUrl: 'https://example.com/thumb2.jpg',
      instructor: {
        firstName: 'Bob',
        lastName: 'Johnson',
      },
      _count: {
        lessons: 12,
      },
    },
  },
];

const renderStudentDashboard = () => {
  return render(
    <BrowserRouter>
      <StudentDashboard />
    </BrowserRouter>
  );
};

describe('StudentDashboard Component', () => {
  beforeEach(async () => {
    const { useAuth } = await import('../../../hooks/useAuth');
    const { useStudentCourses } = await import('../../../hooks/useCourses');
    const { useNavigate } = await import('react-router-dom');
    
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      logout: vi.fn(),
      isAuthenticated: true,
      token: 'mock-token',
    });

    vi.mocked(useStudentCourses).mockReturnValue({
      enrollments: mockEnrollments,
      loading: false,
      error: null,
      fetchEnrollments: vi.fn(),
    });

    vi.mocked(useNavigate).mockReturnValue(vi.fn());
  });

  describe('Header', () => {
    it('displays the platform title', () => {
      renderStudentDashboard();
      
      expect(screen.getByText('Motion Design Studio')).toBeInTheDocument();
    });

    it('displays welcome message with user name', () => {
      renderStudentDashboard();
      
      expect(screen.getByText('Welcome, John')).toBeInTheDocument();
    });

    it('provides sign out functionality', () => {
      renderStudentDashboard();
      
      const signOutButton = screen.getByRole('button', { name: /sign out/i });
      expect(signOutButton).toBeInTheDocument();
    });
  });

  describe('Dashboard Welcome Section', () => {
    it('displays welcome title and description', () => {
      renderStudentDashboard();
      
      expect(screen.getByText('Welcome to Your Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Track your progress and continue your motion design journey')).toBeInTheDocument();
    });
  });

  describe('Quick Actions', () => {
    it('displays browse courses action card', () => {
      renderStudentDashboard();
      
      expect(screen.getByText('Browse Courses')).toBeInTheDocument();
      expect(screen.getByText('Discover new motion design courses')).toBeInTheDocument();
    });

    it('displays progress summary card', () => {
      renderStudentDashboard();
      
      expect(screen.getByText('My Progress')).toBeInTheDocument();
      expect(screen.getByText('2 courses enrolled')).toBeInTheDocument();
    });

    it('calculates average progress correctly', () => {
      renderStudentDashboard();
      
      // (75 + 25) / 2 = 50%
      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('displays profile action card', () => {
      renderStudentDashboard();
      
      expect(screen.getByText('My Profile')).toBeInTheDocument();
      expect(screen.getByText('Update your account settings')).toBeInTheDocument();
    });
  });

  describe('Enrolled Courses Section', () => {
    it('displays enrolled courses title with count', () => {
      renderStudentDashboard();
      
      expect(screen.getByText('My Courses (2)')).toBeInTheDocument();
    });

    it('renders course cards for each enrollment', () => {
      renderStudentDashboard();
      
      expect(screen.getByText('Motion Design Fundamentals')).toBeInTheDocument();
      expect(screen.getByText('Advanced Animation Techniques')).toBeInTheDocument();
      expect(screen.getByText('by Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('by Bob Johnson')).toBeInTheDocument();
    });

    it('displays course progress for each enrollment', () => {
      renderStudentDashboard();
      
      expect(screen.getAllByText('75%')).toHaveLength(2); // One in progress summary, one in course card
      expect(screen.getAllByText('25%')).toHaveLength(2); // Appears in course card and possibly elsewhere
    });

    it('displays course statistics', () => {
      renderStudentDashboard();
      
      expect(screen.getByText('8 lessons')).toBeInTheDocument();
      expect(screen.getByText('12 lessons')).toBeInTheDocument();
      expect(screen.getByText('4 weeks')).toBeInTheDocument();
      expect(screen.getByText('6 weeks')).toBeInTheDocument();
    });

    it('provides view course navigation', () => {
      renderStudentDashboard();
      
      const viewCourseButtons = screen.getAllByRole('button', { name: /view course/i });
      expect(viewCourseButtons).toHaveLength(2);
    });

    it('provides course details navigation', () => {
      renderStudentDashboard();
      
      const detailsButtons = screen.getAllByRole('button', { name: /course details/i });
      expect(detailsButtons).toHaveLength(2);
    });
  });

  describe('Loading State', () => {
    it('shows loading message when enrollments are loading', () => {
      vi.mocked(useStudentCourses).mockReturnValue({
        enrollments: [],
        loading: true,
        error: null,
        fetchEnrollments: vi.fn(),
      });

      renderStudentDashboard();
      
      expect(screen.getByText('Loading your courses...')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('shows error message when enrollment loading fails', () => {
      vi.mocked(useStudentCourses).mockReturnValue({
        enrollments: [],
        loading: false,
        error: 'Failed to load enrollments',
        fetchEnrollments: vi.fn(),
      });

      renderStudentDashboard();
      
      expect(screen.getByText('Failed to load enrollments')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('shows empty state when no courses are enrolled', () => {
      vi.mocked(useStudentCourses).mockReturnValue({
        enrollments: [],
        loading: false,
        error: null,
        fetchEnrollments: vi.fn(),
      });

      renderStudentDashboard();
      
      expect(screen.getByText('No courses yet')).toBeInTheDocument();
      expect(screen.getByText('Start your motion design journey by enrolling in a course')).toBeInTheDocument();
    });
  });

  describe('Account Information', () => {
    it('displays account information section', () => {
      renderStudentDashboard();
      
      expect(screen.getByText('Account Information')).toBeInTheDocument();
    });

    it('displays user email', () => {
      renderStudentDashboard();
      
      expect(screen.getByText('student@example.com')).toBeInTheDocument();
    });

    it('displays user role', () => {
      renderStudentDashboard();
      
      expect(screen.getByText('student')).toBeInTheDocument();
    });

    it('displays email verification status', () => {
      renderStudentDashboard();
      
      expect(screen.getByText('Yes')).toBeInTheDocument();
    });

    it('displays user name when available', () => {
      renderStudentDashboard();
      
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  describe('Visual Design', () => {
    it('uses serif font for headings', () => {
      renderStudentDashboard();
      
      const heading = screen.getByText('Welcome to Your Dashboard');
      expect(heading).toHaveClass('font-serif');
    });

    it('applies responsive grid classes', () => {
      const { container } = renderStudentDashboard();
      
      expect(container.querySelector('.grid')).toBeInTheDocument();
    });
  });
});