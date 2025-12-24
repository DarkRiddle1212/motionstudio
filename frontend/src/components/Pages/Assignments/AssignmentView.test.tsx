import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import AssignmentView from './AssignmentView';
import { useAuth } from '../../../hooks/useAuth';

// Mock the hooks
vi.mock('../../../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

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
  FadeIn: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SlideUp: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockAssignment = {
  id: 'assignment-1',
  title: 'Motion Design Project',
  description: 'Create a 30-second motion graphics piece',
  submissionType: 'file' as const,
  deadline: '2024-12-31T23:59:59Z',
  createdAt: '2024-01-01T00:00:00Z',
  course: {
    id: 'course-1',
    title: 'Advanced Motion Design',
  },
  _count: {
    submissions: 5,
  },
};

const mockSubmission = {
  id: 'submission-1',
  submissionType: 'file' as const,
  fileUrl: 'https://example.com/submission.mp4',
  status: 'submitted' as const,
  submittedAt: '2024-01-15T10:00:00Z',
  feedback: [
    {
      id: 'feedback-1',
      comment: 'Great work! The animation is smooth and engaging.',
      rating: 5,
      createdAt: '2024-01-16T09:00:00Z',
      instructor: {
        firstName: 'John',
        lastName: 'Doe',
      },
    },
  ],
};

const renderAssignmentView = () => {
  return render(
    <BrowserRouter>
      <AssignmentView />
    </BrowserRouter>
  );
};

describe('AssignmentView Component', () => {
  beforeEach(async () => {
    const { useAuth } = await import('../../../hooks/useAuth');
    const { useParams, useNavigate } = await import('react-router-dom');
    
    vi.mocked(useAuth).mockReturnValue({
      token: 'mock-token',
      user: null,
      isAuthenticated: true,
    });

    vi.mocked(useParams).mockReturnValue({
      assignmentId: 'assignment-1',
    });

    vi.mocked(useNavigate).mockReturnValue(vi.fn());

    mockFetch.mockClear();
  });

  describe('Loading State', () => {
    it('shows loading message while fetching assignment', () => {
      mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves
      
      renderAssignmentView();
      
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      expect(screen.getByText('Loading assignment...')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('shows error message when assignment fetch fails', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Assignment not found'));
      
      renderAssignmentView();
      
      await waitFor(() => {
        expect(screen.getByText('Unable to Load Assignment')).toBeInTheDocument();
        expect(screen.getByText('Assignment not found')).toBeInTheDocument();
      });
    });

    it('provides back button in error state', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      
      renderAssignmentView();
      
      await waitFor(() => {
        const backButton = screen.getByRole('button', { name: /back to course/i });
        expect(backButton).toBeInTheDocument();
      });
    });
  });

  describe('Assignment Content Rendering', () => {
    beforeEach(() => {
      // Mock assignment fetch
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ assignment: mockAssignment }),
      });
      // Mock submissions check (no existing submission)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ submissions: [] }),
      });
    });

    it('renders assignment header with title and description', async () => {
      renderAssignmentView();
      
      await waitFor(() => {
        expect(screen.getByText('Motion Design Project')).toBeInTheDocument();
        expect(screen.getByText('Create a 30-second motion graphics piece')).toBeInTheDocument();
      });
    });

    it('displays assignment metadata', async () => {
      renderAssignmentView();
      
      await waitFor(() => {
        expect(screen.getByText('📚 Advanced Motion Design')).toBeInTheDocument();
        expect(screen.getByText(/Due:/)).toBeInTheDocument();
        expect(screen.getByText('📝 5 submissions')).toBeInTheDocument();
      });
    });

    it('shows submission type badge', async () => {
      renderAssignmentView();
      
      await waitFor(() => {
        expect(screen.getByText('file')).toBeInTheDocument();
      });
    });
  });

  describe('Existing Submission Display', () => {
    beforeEach(() => {
      // Mock assignment fetch
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ assignment: mockAssignment }),
      });
      // Mock submissions check (with existing submission)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ submissions: [mockSubmission] }),
      });
    });

    it('displays existing submission details', async () => {
      renderAssignmentView();
      
      await waitFor(() => {
        expect(screen.getByText('Your Submission')).toBeInTheDocument();
        expect(screen.getByText('✓ Submitted')).toBeInTheDocument();
      });
    });

    it('shows instructor feedback when available', async () => {
      renderAssignmentView();
      
      await waitFor(() => {
        expect(screen.getByText('Instructor Feedback')).toBeInTheDocument();
        expect(screen.getByText('Great work! The animation is smooth and engaging.')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('5/5')).toBeInTheDocument();
      });
    });

    it('provides file download link for file submissions', async () => {
      renderAssignmentView();
      
      await waitFor(() => {
        const viewFileButton = screen.getByRole('button', { name: /view file/i });
        expect(viewFileButton).toBeInTheDocument();
      });
    });
  });

  describe('Submission Form', () => {
    beforeEach(() => {
      // Mock assignment fetch
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ assignment: mockAssignment }),
      });
      // Mock submissions check (no existing submission)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ submissions: [] }),
      });
    });

    it('displays submission form when no existing submission', async () => {
      renderAssignmentView();
      
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Submit Assignment' })).toBeInTheDocument();
        expect(screen.getByText('Submission Type')).toBeInTheDocument();
      });
    });

    it('shows file upload option for file submissions', async () => {
      renderAssignmentView();
      
      await waitFor(() => {
        expect(screen.getByText('File Upload')).toBeInTheDocument();
        expect(screen.getByText('Upload your assignment file')).toBeInTheDocument();
      });
    });

    it('shows link input for link submissions', async () => {
      const linkAssignment = { ...mockAssignment, submissionType: 'link' as const };
      mockFetch.mockClear();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ assignment: linkAssignment }),
      });
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ submissions: [] }),
      });
      
      renderAssignmentView();
      
      await waitFor(() => {
        expect(screen.getByText('Link Submission')).toBeInTheDocument();
      });

      // Switch to link submission type
      const linkRadio = screen.getByDisplayValue('link');
      fireEvent.click(linkRadio);
      
      expect(screen.getByText('Assignment Link')).toBeInTheDocument();
    });

    it('validates form before submission', async () => {
      renderAssignmentView();
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /submit assignment/i })).toBeInTheDocument();
      });

      const submitButton = screen.getByRole('button', { name: /submit assignment/i });
      fireEvent.click(submitButton);

      // The form should show validation errors - check for any error message
      await waitFor(() => {
        // The form validation might show different error messages based on the submission type
        const errorMessages = screen.queryAllByText(/please/i);
        expect(errorMessages.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Deadline Handling', () => {
    it('shows overdue warning for past deadline', async () => {
      const overdueAssignment = {
        ...mockAssignment,
        deadline: '2020-01-01T00:00:00Z', // Past date
      };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ assignment: overdueAssignment }),
      });
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ submissions: [] }),
      });
      
      renderAssignmentView();
      
      await waitFor(() => {
        expect(screen.getByText(/this assignment is overdue/i)).toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ assignment: mockAssignment }),
      });
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ submissions: [] }),
      });
    });

    it('provides back to course navigation', async () => {
      renderAssignmentView();
      
      await waitFor(() => {
        const backButton = screen.getByRole('button', { name: /back to course/i });
        expect(backButton).toBeInTheDocument();
      });
    });
  });

  describe('Authentication', () => {
    it('does not fetch assignment when no token', () => {
      vi.mocked(useAuth).mockReturnValue({
        token: null,
        user: null,
        isAuthenticated: false,
        login: vi.fn(),
        logout: vi.fn(),
        loading: false,
      });
      
      renderAssignmentView();
      
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });
});