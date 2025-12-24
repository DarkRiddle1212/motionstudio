import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LessonCard from './LessonCard';
import type { Lesson } from './LessonCard';

// Mock the animation components
vi.mock('../../Animation', () => ({
  FadeIn: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const mockLesson: Lesson = {
  id: 'lesson-1',
  title: 'Introduction to Motion Design',
  description: 'Learn the basics of motion design and animation principles',
  content: 'Lesson content here',
  videoUrl: 'https://example.com/video.mp4',
  fileUrls: ['https://example.com/file1.pdf', 'https://example.com/file2.zip'],
  order: 1,
  isPublished: true,
  isCompleted: false,
  createdAt: '2023-01-01T00:00:00Z',
};

const mockCompletedLesson: Lesson = {
  ...mockLesson,
  id: 'lesson-2',
  isCompleted: true,
  completedAt: '2023-01-02T00:00:00Z',
};

describe('LessonCard Component', () => {
  const mockOnClick = vi.fn();

  beforeEach(() => {
    mockOnClick.mockClear();
  });

  describe('Basic Rendering', () => {
    it('renders lesson information correctly', () => {
      render(<LessonCard lesson={mockLesson} onClick={mockOnClick} />);
      
      expect(screen.getByText('Introduction to Motion Design')).toBeInTheDocument();
      expect(screen.getByText('Learn the basics of motion design and animation principles')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(
        <LessonCard lesson={mockLesson} onClick={mockOnClick} className="custom-class" />
      );
      
      expect(container.querySelector('.custom-class')).toBeInTheDocument();
    });
  });

  describe('Completion Status', () => {
    it('shows completed badge for completed lessons', () => {
      render(<LessonCard lesson={mockCompletedLesson} onClick={mockOnClick} />);
      
      expect(screen.getByText('✓ Completed')).toBeInTheDocument();
      expect(screen.getByText('Review Lesson')).toBeInTheDocument();
    });

    it('shows start lesson button for incomplete lessons', () => {
      render(<LessonCard lesson={mockLesson} onClick={mockOnClick} />);
      
      expect(screen.queryByText('✓ Completed')).not.toBeInTheDocument();
      expect(screen.getByText('Start Lesson')).toBeInTheDocument();
    });

    it('displays completion date for completed lessons', () => {
      render(<LessonCard lesson={mockCompletedLesson} onClick={mockOnClick} />);
      
      const completionDate = new Date(mockCompletedLesson.completedAt!).toLocaleDateString();
      expect(screen.getByText(`Completed ${completionDate}`)).toBeInTheDocument();
    });
  });

  describe('Content Indicators', () => {
    it('shows video indicator when lesson has video', () => {
      render(<LessonCard lesson={mockLesson} onClick={mockOnClick} />);
      
      expect(screen.getByText('Video')).toBeInTheDocument();
    });

    it('shows file indicator when lesson has files', () => {
      render(<LessonCard lesson={mockLesson} onClick={mockOnClick} />);
      
      expect(screen.getByText('2 files')).toBeInTheDocument();
    });

    it('shows singular file text for single file', () => {
      const lessonWithOneFile = { ...mockLesson, fileUrls: ['file1.pdf'] };
      render(<LessonCard lesson={lessonWithOneFile} onClick={mockOnClick} />);
      
      expect(screen.getByText('1 file')).toBeInTheDocument();
    });

    it('does not show indicators when no video or files', () => {
      const lessonWithoutContent = { ...mockLesson, videoUrl: undefined, fileUrls: [] };
      render(<LessonCard lesson={lessonWithoutContent} onClick={mockOnClick} />);
      
      expect(screen.queryByText('Video')).not.toBeInTheDocument();
      expect(screen.queryByText(/file/)).not.toBeInTheDocument();
    });
  });

  describe('Interaction', () => {
    it('calls onClick when action button is clicked', () => {
      render(<LessonCard lesson={mockLesson} onClick={mockOnClick} />);
      
      const actionButton = screen.getByRole('button', { name: /start lesson/i });
      fireEvent.click(actionButton);
      
      expect(mockOnClick).toHaveBeenCalledWith('lesson-1');
    });

    it('calls onClick when completed lesson button is clicked', () => {
      render(<LessonCard lesson={mockCompletedLesson} onClick={mockOnClick} />);
      
      const actionButton = screen.getByRole('button', { name: /review lesson/i });
      fireEvent.click(actionButton);
      
      expect(mockOnClick).toHaveBeenCalledWith('lesson-2');
    });
  });

  describe('Visual Design', () => {
    it('uses serif font for lesson title', () => {
      render(<LessonCard lesson={mockLesson} onClick={mockOnClick} />);
      
      const title = screen.getByText('Introduction to Motion Design');
      expect(title).toHaveClass('font-serif');
    });

    it('applies proper spacing classes', () => {
      const { container } = render(<LessonCard lesson={mockLesson} onClick={mockOnClick} />);
      
      expect(container.querySelector('.p-6')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles lesson with order 0', () => {
      const zeroOrderLesson = { ...mockLesson, order: 0 };
      render(<LessonCard lesson={zeroOrderLesson} onClick={mockOnClick} />);
      
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('handles lesson with high order number', () => {
      const highOrderLesson = { ...mockLesson, order: 999 };
      render(<LessonCard lesson={highOrderLesson} onClick={mockOnClick} />);
      
      expect(screen.getByText('999')).toBeInTheDocument();
    });
  });
});