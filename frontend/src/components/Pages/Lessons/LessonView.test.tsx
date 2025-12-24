import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import LessonView from './LessonView';
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

const mockLesson = {
  id: 'lesson-1',
  title: 'Introduction to Motion Design',
  description: 'Learn the basics of motion design',
  content: '<p>This is the lesson content with <strong>HTML</strong> formatting.</p>',
  videoUrl: 'https://example.com/video.mp4',
  fileUrls: ['https://example.com/file1.pdf'],
  order: 1,
  isPublished: true,
  isCompleted: false,
  createdAt: '2023-01-01T00:00:00Z',
};

const renderLessonView = () => {
  return render(
    <BrowserRouter>
      <LessonView />
    </BrowserRouter>
  );
};

describe('LessonView Component', () => {
  beforeEach(async () => {
    const { useAuth } = await import('../../../hooks/useAuth');
    const { useParams, useNavigate } = await import('react-router-dom');
    
    vi.mocked(useAuth).mockReturnValue({
      token: 'mock-token',
      user: null,
      isAuthenticated: true,
    });

    vi.mocked(useParams).mockReturnValue({
      lessonId: 'lesson-1',
      courseId: 'course-1',
    });

    vi.mocked(useNavigate).mockReturnValue(vi.fn());

    mockFetch.mockClear();
  });

  describe('Loading State', () => {
    it('shows loading message while fetching lesson', () => {
      mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves
      
      renderLessonView();
      
      expect(screen.getByText('Loading lesson...')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('shows error message when lesson fetch fails', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Failed to fetch lesson'));
      
      renderLessonView();
      
      await waitFor(() => {
        expect(screen.getByText('Unable to Load Lesson')).toBeInTheDocument();
      });
    });

    it('provides back button in error state', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      
      renderLessonView();
      
      await waitFor(() => {
        const backButton = screen.getByRole('button', { name: /back to course/i });
        expect(backButton).toBeInTheDocument();
      });
    });
  });

  describe('Lesson Content Rendering', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ lesson: mockLesson }),
      });
    });

    it('renders lesson header with title and description', async () => {
      renderLessonView();
      
      await waitFor(() => {
        expect(screen.getByText('Introduction to Motion Design')).toBeInTheDocument();
        expect(screen.getByText('Learn the basics of motion design')).toBeInTheDocument();
      });
    });

    it('renders video content when videoUrl is provided', async () => {
      renderLessonView();
      
      await waitFor(() => {
        const videoElement = document.querySelector('video');
        expect(videoElement).toBeInTheDocument();
        
        // Check for source element within video
        const sourceElement = document.querySelector('video source');
        expect(sourceElement).toBeInTheDocument();
        expect(sourceElement).toHaveAttribute('src', 'https://example.com/video.mp4');
      });
    });

    it('renders file downloads when fileUrls are provided', async () => {
      renderLessonView();
      
      await waitFor(() => {
        expect(screen.getByText('Course Materials')).toBeInTheDocument();
        expect(screen.getByText('Download')).toBeInTheDocument();
      });
    });
  });

  describe('Lesson Completion', () => {
    it('shows completion button for incomplete lessons', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ lesson: mockLesson }),
      });
      
      renderLessonView();
      
      await waitFor(() => {
        const completeButton = screen.getByRole('button', { name: /mark as complete/i });
        expect(completeButton).toBeInTheDocument();
      });
    });

    it('shows completed badge for completed lessons', async () => {
      const completedLesson = { ...mockLesson, isCompleted: true };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ lesson: completedLesson }),
      });
      
      renderLessonView();
      
      await waitFor(() => {
        expect(screen.getByText('✓ Completed')).toBeInTheDocument();
      });
    });

    it('handles lesson completion', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ lesson: mockLesson }),
      });

      renderLessonView();
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /mark as complete/i })).toBeInTheDocument();
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      const completeButton = screen.getByRole('button', { name: /mark as complete/i });
      fireEvent.click(completeButton);

      await waitFor(() => {
        expect(screen.getByText('Completing...')).toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ lesson: mockLesson }),
      });
    });

    it('provides back to course navigation', async () => {
      renderLessonView();
      
      await waitFor(() => {
        const backButton = screen.getByRole('button', { name: /back to course/i });
        expect(backButton).toBeInTheDocument();
      });
    });
  });

  describe('Authentication', () => {
    it('does not fetch lesson when no token', () => {
      // Mock useAuth to return no token
      vi.mocked(useAuth).mockReturnValue({
        token: null,
        user: null,
        isAuthenticated: false,
        login: vi.fn(),
        logout: vi.fn(),
        loading: false,
      });
      
      renderLessonView();
      
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });
});