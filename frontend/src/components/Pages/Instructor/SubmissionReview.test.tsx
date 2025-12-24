import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import SubmissionReview from './SubmissionReview';

// Mock the useAuth hook
const mockUseAuth = vi.fn();
vi.mock('../../../hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock react-router-dom hooks
const mockNavigate = vi.fn();
const mockUseParams = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => mockUseParams(),
  };
});

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('SubmissionReview', () => {
  const mockToken = 'mock-token';
  const mockAssignmentId = 'assignment-123';

  const mockAssignment = {
    id: mockAssignmentId,
    title: 'Test Assignment',
    description: 'A test assignment',
    submissionType: 'file' as const,
    deadline: '2024-12-31T23:59:59.000Z',
    course: {
      id: 'course-123',
      title: 'Test Course',
    },
  };

  const mockSubmissions = [
    {
      id: 'submission-1',
      submissionType: 'file' as const,
      fileUrl: 'https://example.com/file1.pdf',
      status: 'submitted' as const,
      submittedAt: '2024-12-15T10:00:00.000Z',
      student: {
        id: 'student-1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
      },
      feedback: [],
    },
    {
      id: 'submission-2',
      submissionType: 'link' as const,
      linkUrl: 'https://github.com/student/project',
      status: 'late' as const,
      submittedAt: '2025-01-02T10:00:00.000Z',
      student: {
        id: 'student-2',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
      },
      feedback: [
        {
          id: 'feedback-1',
          comment: 'Good work!',
          rating: 4,
          createdAt: '2025-01-03T10:00:00.000Z',
          instructor: {
            firstName: 'Prof',
            lastName: 'Teacher',
          },
        },
      ],
    },
  ];

  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      token: mockToken,
      user: { id: 'instructor-1', role: 'instructor' },
    });
    mockUseParams.mockReturnValue({ assignmentId: mockAssignmentId });
    mockFetch.mockClear();
    mockNavigate.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

    renderWithRouter(<SubmissionReview />);

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.getByText('Loading submissions...')).toBeInTheDocument();
  });

  it('renders submission review page with assignment and submissions', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ assignment: mockAssignment }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ submissions: mockSubmissions }),
      });

    renderWithRouter(<SubmissionReview />);

    await waitFor(() => {
      expect(screen.getByText('Review Submissions')).toBeInTheDocument();
    });

    expect(screen.getByText('Test Assignment')).toBeInTheDocument();
    expect(screen.getByText(/Test Course/)).toBeInTheDocument();
    expect(screen.getByText(/2.*submissions/)).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('displays correct submission status badges', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ assignment: mockAssignment }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ submissions: mockSubmissions }),
      });

    renderWithRouter(<SubmissionReview />);

    await waitFor(() => {
      expect(screen.getByText('✓ Submitted')).toBeInTheDocument();
    });

    expect(screen.getByText('⚠ Late')).toBeInTheDocument();
  });

  it('opens feedback modal when Add Feedback button is clicked', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ assignment: mockAssignment }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ submissions: mockSubmissions }),
      });

    renderWithRouter(<SubmissionReview />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const addFeedbackButtons = screen.getAllByText('Add Feedback');
    const addFeedbackButton = addFeedbackButtons[0]; // Get the first button
    fireEvent.click(addFeedbackButton);

    expect(screen.getByLabelText('Feedback Comment')).toBeInTheDocument();
    expect(screen.getByLabelText('Feedback Comment')).toBeInTheDocument();
    expect(screen.getByText('Rating (Optional)')).toBeInTheDocument();
  });

  it('submits feedback successfully', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ assignment: mockAssignment }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ submissions: mockSubmissions }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ feedback: { id: 'new-feedback' } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ assignment: mockAssignment }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ submissions: mockSubmissions }),
      });

    renderWithRouter(<SubmissionReview />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Open feedback modal
    const addFeedbackButtons = screen.getAllByText('Add Feedback');
    const addFeedbackButton = addFeedbackButtons[0]; // Get the first button
    fireEvent.click(addFeedbackButton);

    // Fill in feedback form
    const commentTextarea = screen.getByLabelText('Feedback Comment');
    fireEvent.change(commentTextarea, { target: { value: 'Great work on this assignment!' } });

    // Select rating
    const ratingButton = screen.getByText('5');
    fireEvent.click(ratingButton);

    // Submit feedback
    const submitButton = screen.getByText('Submit Feedback');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/feedback',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${mockToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            submissionId: 'submission-1',
            comment: 'Great work on this assignment!',
            rating: 5,
          }),
        })
      );
    });
  });

  it('validates feedback form and shows errors', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ assignment: mockAssignment }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ submissions: mockSubmissions }),
      });

    renderWithRouter(<SubmissionReview />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Open feedback modal
    const addFeedbackButtons = screen.getAllByText('Add Feedback');
    const addFeedbackButton = addFeedbackButtons[0]; // Get the first button
    fireEvent.click(addFeedbackButton);

    // Try to submit without comment
    const submitButton = screen.getByText('Submit Feedback');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Feedback comment is required')).toBeInTheDocument();
    });
  });

  it('displays existing feedback for reviewed submissions', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ assignment: mockAssignment }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ submissions: mockSubmissions }),
      });

    renderWithRouter(<SubmissionReview />);

    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    // Check that feedback is displayed
    expect(screen.getByText('Feedback')).toBeInTheDocument();
    expect(screen.getByText('Good work!')).toBeInTheDocument();
    expect(screen.getByText('4/5 ⭐')).toBeInTheDocument();
    expect(screen.getByText('Prof Teacher')).toBeInTheDocument();
  });

  it('opens external links when View File or Open Link buttons are clicked', async () => {
    const mockWindowOpen = vi.fn();
    global.window.open = mockWindowOpen;

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ assignment: mockAssignment }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ submissions: mockSubmissions }),
      });

    renderWithRouter(<SubmissionReview />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Click View File button
    const viewFileButton = screen.getByText('View File');
    fireEvent.click(viewFileButton);

    expect(mockWindowOpen).toHaveBeenCalledWith('https://example.com/file1.pdf', '_blank');

    // Click Open Link button
    const openLinkButton = screen.getByText('Open Link');
    fireEvent.click(openLinkButton);

    expect(mockWindowOpen).toHaveBeenCalledWith('https://github.com/student/project', '_blank');
  });

  it('navigates back to course when back button is clicked', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ assignment: mockAssignment }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ submissions: mockSubmissions }),
      });

    renderWithRouter(<SubmissionReview />);

    await waitFor(() => {
      expect(screen.getByText('← Back to Course')).toBeInTheDocument();
    });

    const backButton = screen.getByText('← Back to Course');
    fireEvent.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith('/courses/course-123/content');
  });

  it('displays no submissions message when there are no submissions', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ assignment: mockAssignment }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ submissions: [] }),
      });

    renderWithRouter(<SubmissionReview />);

    await waitFor(() => {
      expect(screen.getByText('No Submissions Yet')).toBeInTheDocument();
    });

    expect(screen.getByText("Students haven't submitted any work for this assignment yet.")).toBeInTheDocument();
  });

  it('handles API errors gracefully', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Failed to fetch assignment'));

    renderWithRouter(<SubmissionReview />);

    await waitFor(() => {
      expect(screen.getByText('Unable to Load Submissions')).toBeInTheDocument();
    });

    expect(screen.getByText('Failed to fetch assignment')).toBeInTheDocument();
  });

  it('handles feedback submission errors', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ assignment: mockAssignment }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ submissions: mockSubmissions }),
      })
      .mockRejectedValueOnce(new Error('Failed to submit feedback'));

    renderWithRouter(<SubmissionReview />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Open feedback modal and submit
    const addFeedbackButtons = screen.getAllByText('Add Feedback');
    const addFeedbackButton = addFeedbackButtons[0]; // Get the first button
    fireEvent.click(addFeedbackButton);

    const commentTextarea = screen.getByLabelText('Feedback Comment');
    fireEvent.change(commentTextarea, { target: { value: 'Test feedback' } });

    const submitButton = screen.getByText('Submit Feedback');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Unable to Load Submissions')).toBeInTheDocument();
    });
  });
});