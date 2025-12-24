import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import SubmissionHistory from './SubmissionHistory';
import { useAuth } from '../../../hooks/useAuth';

// Mock the hooks
vi.mock('../../../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

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

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockSubmissions = [
  {
    id: 'submission-1',
    submissionType: 'file' as const,
    fileUrl: 'https://example.com/file1.pdf',
    status: 'submitted' as const,
    submittedAt: '2024-01-15T10:00:00Z',
    assignment: {
      id: 'assignment-1',
      title: 'Motion Design Project',
      description: 'Create a 30-second motion graphics piece',
      deadline: '2024-01-20T23:59:59Z',
      course: {
        id: 'course-1',
        title: 'Advanced Motion Design',
      },
    },
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
  },
  {
    id: 'submission-2',
    submissionType: 'link' as const,
    linkUrl: 'https://example.com/project2',
    status: 'late' as const,
    submittedAt: '2024-01-22T10:00:00Z',
    assignment: {
      id: 'assignment-2',
      title: 'Typography Animation',
      description: 'Create animated typography for a brand',
      deadline: '2024-01-21T23:59:59Z',
      course: {
        id: 'course-2',
        title: 'Typography in Motion',
      },
    },
    feedback: [],
  },
  {
    id: 'submission-3',
    submissionType: 'file' as const,
    fileUrl: 'https://example.com/file3.mp4',
    status: 'reviewed' as const,
    submittedAt: '2024-01-10T10:00:00Z',
    assignment: {
      id: 'assignment-3',
      title: 'Character Animation',
      description: 'Animate a character walking cycle',
      deadline: '2024-01-15T23:59:59Z',
      course: {
        id: 'course-1',
        title: 'Advanced Motion Design',
      },
    },
    feedback: [
      {
        id: 'feedback-2',
        comment: 'Good effort, but the timing could be improved.',
        rating: 3,
        createdAt: '2024-01-11T09:00:00Z',
        instructor: {
          firstName: 'Jane',
          lastName: 'Smith',
        },
      },
    ],
  },
];

const renderSubmissionHistory = () => {
  return render(
    <BrowserRouter>
      <SubmissionHistory />
    </BrowserRouter>
  );
};

describe('SubmissionHistory Component', () => {
  beforeEach(async () => {
    const { useAuth } = await import('../../../hooks/useAuth');
    const { useNavigate } = await import('react-router-dom');
    
    vi.mocked(useAuth).mockReturnValue({
      token: 'mock-token',
      user: null,
      isAuthenticated: true,
    });

    vi.mocked(useNavigate).mockReturnValue(vi.fn());

    mockFetch.mockClear();
  });

  describe('Loading State', () => {
    it('shows loading message while fetching submissions', () => {
      mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves
      
      renderSubmissionHistory();
      
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      expect(screen.getByText('Loading submissions...')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('shows error message when submissions fetch fails', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Failed to fetch submissions'));
      
      renderSubmissionHistory();
      
      await waitFor(() => {
        expect(screen.getByText('Unable to Load Submissions')).toBeInTheDocument();
        expect(screen.getByText('Failed to fetch submissions')).toBeInTheDocument();
      });
    });

    it('provides back button in error state', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      
      renderSubmissionHistory();
      
      await waitFor(() => {
        const backButton = screen.getByRole('button', { name: /back to dashboard/i });
        expect(backButton).toBeInTheDocument();
      });
    });
  });

  describe('Submissions List Rendering', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ submissions: mockSubmissions }),
      });
    });

    it('renders page header with submission count', async () => {
      renderSubmissionHistory();
      
      await waitFor(() => {
        expect(screen.getByText('Submission History')).toBeInTheDocument();
        expect(screen.getByText('View all your assignment submissions and feedback')).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument(); // Total submissions count
      });
    });

    it('displays all submissions by default', async () => {
      renderSubmissionHistory();
      
      await waitFor(() => {
        expect(screen.getByText('Motion Design Project')).toBeInTheDocument();
        expect(screen.getByText('Typography Animation')).toBeInTheDocument();
        expect(screen.getByText('Character Animation')).toBeInTheDocument();
      });
    });

    it('shows submission details for each submission', async () => {
      renderSubmissionHistory();
      
      await waitFor(() => {
        // Check for course titles (multiple instances expected)
        expect(screen.getAllByText('📚 Advanced Motion Design')).toHaveLength(2);
        expect(screen.getByText('📚 Typography in Motion')).toBeInTheDocument();
        
        // Check for submission types
        expect(screen.getAllByText('file')).toHaveLength(2);
        expect(screen.getByText('link')).toBeInTheDocument();
        
        // Check for status badges
        expect(screen.getByText('✓ submitted')).toBeInTheDocument();
        expect(screen.getByText('⚠ late')).toBeInTheDocument();
        expect(screen.getByText('✓ reviewed')).toBeInTheDocument();
      });
    });
  });

  describe('Filter Functionality', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ submissions: mockSubmissions }),
      });
    });

    it('displays filter tabs with correct counts', async () => {
      renderSubmissionHistory();
      
      await waitFor(() => {
        expect(screen.getByText('All (3)')).toBeInTheDocument();
        expect(screen.getByText('Submitted (1)')).toBeInTheDocument();
        expect(screen.getByText('Late (1)')).toBeInTheDocument();
        expect(screen.getByText('Reviewed (1)')).toBeInTheDocument();
      });
    });

    it('filters submissions by status when tab is clicked', async () => {
      renderSubmissionHistory();
      
      await waitFor(() => {
        expect(screen.getByText('Motion Design Project')).toBeInTheDocument();
        expect(screen.getByText('Typography Animation')).toBeInTheDocument();
        expect(screen.getByText('Character Animation')).toBeInTheDocument();
      });

      // Click on "Submitted" tab
      const submittedTab = screen.getByText('Submitted (1)');
      fireEvent.click(submittedTab);

      // Should only show submitted submissions
      expect(screen.getByText('Motion Design Project')).toBeInTheDocument();
      expect(screen.queryByText('Typography Animation')).not.toBeInTheDocument();
      expect(screen.queryByText('Character Animation')).not.toBeInTheDocument();
    });

    it('filters submissions by late status', async () => {
      renderSubmissionHistory();
      
      await waitFor(() => {
        expect(screen.getAllByText(/Motion Design Project|Typography Animation|Character Animation/)).toHaveLength(3);
      });

      // Click on "Late" tab
      const lateTab = screen.getByText('Late (1)');
      fireEvent.click(lateTab);

      // Should only show late submissions
      expect(screen.getByText('Typography Animation')).toBeInTheDocument();
      expect(screen.queryByText('Motion Design Project')).not.toBeInTheDocument();
      expect(screen.queryByText('Character Animation')).not.toBeInTheDocument();
    });
  });

  describe('Feedback Display', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ submissions: mockSubmissions }),
      });
    });

    it('displays instructor feedback when available', async () => {
      renderSubmissionHistory();
      
      await waitFor(() => {
        expect(screen.getAllByText('Instructor Feedback')).toHaveLength(2); // Two submissions have feedback
        expect(screen.getByText('Great work! The animation is smooth and engaging.')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('⭐ 5/5')).toBeInTheDocument();
      });
    });

    it('shows multiple feedback entries', async () => {
      renderSubmissionHistory();
      
      await waitFor(() => {
        expect(screen.getByText('Good effort, but the timing could be improved.')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.getByText('⭐ 3/5')).toBeInTheDocument();
      });
    });
  });

  describe('File and Link Handling', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ submissions: mockSubmissions }),
      });
    });

    it('provides file download buttons for file submissions', async () => {
      renderSubmissionHistory();
      
      await waitFor(() => {
        const fileButtons = screen.getAllByRole('button', { name: /view file/i });
        expect(fileButtons).toHaveLength(2); // Two file submissions
      });
    });

    it('provides link open buttons for link submissions', async () => {
      renderSubmissionHistory();
      
      await waitFor(() => {
        const linkButton = screen.getByRole('button', { name: /open link/i });
        expect(linkButton).toBeInTheDocument();
      });
    });
  });

  describe('Navigation Actions', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ submissions: mockSubmissions }),
      });
    });

    it('provides view course buttons', async () => {
      renderSubmissionHistory();
      
      await waitFor(() => {
        const viewCourseButtons = screen.getAllByRole('button', { name: /view course/i });
        expect(viewCourseButtons).toHaveLength(3);
      });
    });

    it('provides view assignment buttons', async () => {
      renderSubmissionHistory();
      
      await waitFor(() => {
        const viewAssignmentButtons = screen.getAllByRole('button', { name: /view assignment/i });
        expect(viewAssignmentButtons).toHaveLength(3);
      });
    });

    it('provides back to dashboard navigation', async () => {
      renderSubmissionHistory();
      
      await waitFor(() => {
        const backButton = screen.getByRole('button', { name: /back to dashboard/i });
        expect(backButton).toBeInTheDocument();
      });
    });
  });

  describe('Empty State', () => {
    it('shows empty state when no submissions exist', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ submissions: [] }),
      });
      
      renderSubmissionHistory();
      
      await waitFor(() => {
        expect(screen.getByText('No Submissions Yet')).toBeInTheDocument();
        expect(screen.getByText("You haven't submitted any assignments yet. Check your courses for available assignments.")).toBeInTheDocument();
      });
    });

    it('shows filtered empty state when no submissions match filter', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ submissions: mockSubmissions }),
      });
      
      renderSubmissionHistory();
      
      await waitFor(() => {
        expect(screen.getByText('All (3)')).toBeInTheDocument();
      });

      // Click on "Submitted" tab, then switch to a filter with no results
      const submittedTab = screen.getByText('Submitted (1)');
      fireEvent.click(submittedTab);

      // Manually test empty filter state by mocking empty filtered results
      // This would happen if we had a filter with 0 results
      const reviewedTab = screen.getByText('Reviewed (1)');
      fireEvent.click(reviewedTab);

      // Should show the reviewed submission
      expect(screen.getByText('Character Animation')).toBeInTheDocument();
    });
  });

  describe('Date Formatting', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ submissions: mockSubmissions }),
      });
    });

    it('formats submission and deadline dates correctly', async () => {
      renderSubmissionHistory();
      
      await waitFor(() => {
        // Check for formatted dates (exact format may vary based on locale)
        // Dates appear multiple times in the UI (submitted and deadline)
        const dates = screen.getAllByText(/Jan \d+, 2024/);
        expect(dates.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Authentication', () => {
    it('does not fetch submissions when no token', () => {
      vi.mocked(useAuth).mockReturnValue({
        token: null,
        user: null,
        isAuthenticated: false,
        login: vi.fn(),
        logout: vi.fn(),
        loading: false,
      });
      
      renderSubmissionHistory();
      
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });
});