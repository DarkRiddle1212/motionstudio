import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { CourseBuilderPage } from './CourseBuilderPage';

// Mock hooks
const mockCreateCourse = vi.fn();
const mockUseInstructorCourses = {
  courses: [],
  loading: false,
  error: null,
  fetchInstructorCourses: vi.fn(),
  createCourse: mockCreateCourse,
  updateCourse: vi.fn(),
  deleteCourse: vi.fn(),
};

vi.mock('../../../hooks/useCourses', () => ({
  useInstructorCourses: () => mockUseInstructorCourses,
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderCourseBuilderPage = () => {
  return render(
    <BrowserRouter>
      <CourseBuilderPage />
    </BrowserRouter>
  );
};

describe('CourseBuilderPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders course builder form', () => {
    renderCourseBuilderPage();
    
    expect(screen.getByText('Create New Course')).toBeInTheDocument();
    expect(screen.getByLabelText('Course Title')).toBeInTheDocument();
    expect(screen.getByLabelText('Course Description')).toBeInTheDocument();
    expect(screen.getByLabelText('Duration')).toBeInTheDocument();
    expect(screen.getByLabelText('Pricing')).toBeInTheDocument();
    expect(screen.getByLabelText('Course Curriculum')).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    renderCourseBuilderPage();
    
    const submitButton = screen.getByRole('button', { name: /create course/i });
    
    // Try to submit with empty fields
    await fireEvent.click(submitButton);
    
    // The form should not call createCourse when validation fails
    expect(mockCreateCourse).not.toHaveBeenCalled();
  });

  it('validates pricing field', async () => {
    renderCourseBuilderPage();
    
    // Fill in required fields but leave pricing invalid
    fireEvent.change(screen.getByLabelText('Course Title'), {
      target: { value: 'Test Course' },
    });
    fireEvent.change(screen.getByLabelText('Course Description'), {
      target: { value: 'Test Description' },
    });
    fireEvent.change(screen.getByLabelText('Duration'), {
      target: { value: '4 weeks' },
    });
    fireEvent.change(screen.getByLabelText('Course Curriculum'), {
      target: { value: 'Test Curriculum' },
    });
    
    const pricingInput = screen.getByLabelText('Pricing');
    fireEvent.change(pricingInput, { target: { value: 'invalid' } });
    
    const submitButton = screen.getByRole('button', { name: /create course/i });
    fireEvent.click(submitButton);
    
    // The form should not call createCourse when validation fails
    expect(mockCreateCourse).not.toHaveBeenCalled();
  });

  it('submits form with valid data', async () => {
    const mockCourse = {
      id: 'new-course-id',
      title: 'New Course',
      description: 'Course description',
      duration: '4 weeks',
      pricing: 0,
      currency: 'USD',
      curriculum: 'Course curriculum',
      isPublished: false,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
      instructor: {
        id: 'instructor1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      },
      _count: {
        enrollments: 0,
        lessons: 0,
        assignments: 0,
      },
    };

    mockCreateCourse.mockResolvedValue(mockCourse);
    
    renderCourseBuilderPage();
    
    fireEvent.change(screen.getByLabelText('Course Title'), {
      target: { value: 'New Course' },
    });
    fireEvent.change(screen.getByLabelText('Course Description'), {
      target: { value: 'Course description' },
    });
    fireEvent.change(screen.getByLabelText('Duration'), {
      target: { value: '4 weeks' },
    });
    fireEvent.change(screen.getByLabelText('Pricing'), {
      target: { value: '0' },
    });
    fireEvent.change(screen.getByLabelText('Course Curriculum'), {
      target: { value: 'Course curriculum' },
    });
    
    const submitButton = screen.getByRole('button', { name: /create course/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockCreateCourse).toHaveBeenCalledWith({
        title: 'New Course',
        description: 'Course description',
        duration: '4 weeks',
        pricing: 0,
        currency: 'USD',
        curriculum: 'Course curriculum',
        introVideoUrl: undefined,
        thumbnailUrl: undefined,
      });
    });

    expect(mockNavigate).toHaveBeenCalledWith('/instructor/courses/new-course-id');
  });

  it('handles form submission errors', async () => {
    mockCreateCourse.mockRejectedValue(new Error('Failed to create course'));
    
    renderCourseBuilderPage();
    
    fireEvent.change(screen.getByLabelText('Course Title'), {
      target: { value: 'New Course' },
    });
    fireEvent.change(screen.getByLabelText('Course Description'), {
      target: { value: 'Course description' },
    });
    fireEvent.change(screen.getByLabelText('Duration'), {
      target: { value: '4 weeks' },
    });
    fireEvent.change(screen.getByLabelText('Course Curriculum'), {
      target: { value: 'Course curriculum' },
    });
    
    const submitButton = screen.getByRole('button', { name: /create course/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to create course')).toBeInTheDocument();
    });
  });

  it('allows user to type in form fields', async () => {
    renderCourseBuilderPage();
    
    const titleInput = screen.getByLabelText('Course Title');
    fireEvent.change(titleInput, { target: { value: 'New Course' } });
    
    expect(titleInput).toHaveValue('New Course');
  });

  it('navigates back when cancel button is clicked', () => {
    renderCourseBuilderPage();
    
    const cancelButtons = screen.getAllByText('Cancel');
    fireEvent.click(cancelButtons[0]);
    
    expect(mockNavigate).toHaveBeenCalledWith('/instructor/courses');
  });

  it('includes optional media fields', () => {
    renderCourseBuilderPage();
    
    expect(screen.getByLabelText('Intro Video URL')).toBeInTheDocument();
    expect(screen.getByLabelText('Thumbnail URL')).toBeInTheDocument();
  });

  it('submits form with optional media URLs', async () => {
    const mockCourse = {
      id: 'new-course-id',
      title: 'New Course',
      description: 'Course description',
      duration: '4 weeks',
      pricing: 0,
      currency: 'USD',
      curriculum: 'Course curriculum',
      introVideoUrl: 'https://example.com/video.mp4',
      thumbnailUrl: 'https://example.com/thumb.jpg',
      isPublished: false,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
      instructor: {
        id: 'instructor1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      },
      _count: {
        enrollments: 0,
        lessons: 0,
        assignments: 0,
      },
    };

    mockCreateCourse.mockResolvedValue(mockCourse);
    
    renderCourseBuilderPage();
    
    fireEvent.change(screen.getByLabelText('Course Title'), {
      target: { value: 'New Course' },
    });
    fireEvent.change(screen.getByLabelText('Course Description'), {
      target: { value: 'Course description' },
    });
    fireEvent.change(screen.getByLabelText('Duration'), {
      target: { value: '4 weeks' },
    });
    fireEvent.change(screen.getByLabelText('Course Curriculum'), {
      target: { value: 'Course curriculum' },
    });
    fireEvent.change(screen.getByLabelText('Intro Video URL'), {
      target: { value: 'https://example.com/video.mp4' },
    });
    fireEvent.change(screen.getByLabelText('Thumbnail URL'), {
      target: { value: 'https://example.com/thumb.jpg' },
    });
    
    const submitButton = screen.getByRole('button', { name: /create course/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockCreateCourse).toHaveBeenCalledWith({
        title: 'New Course',
        description: 'Course description',
        duration: '4 weeks',
        pricing: 0,
        currency: 'USD',
        curriculum: 'Course curriculum',
        introVideoUrl: 'https://example.com/video.mp4',
        thumbnailUrl: 'https://example.com/thumb.jpg',
      });
    });
  });
});
