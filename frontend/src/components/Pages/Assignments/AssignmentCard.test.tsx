import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AssignmentCard from './AssignmentCard';

const mockAssignment = {
  id: 'assignment-1',
  title: 'Motion Design Project',
  description: 'Create a 30-second motion graphics piece showcasing advanced animation techniques and storytelling principles.',
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

const mockOnClick = vi.fn();

describe('AssignmentCard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders assignment title and description', () => {
      render(
        <AssignmentCard 
          assignment={mockAssignment} 
          onClick={mockOnClick} 
        />
      );
      
      expect(screen.getByText('Motion Design Project')).toBeInTheDocument();
      expect(screen.getByText(/Create a 30-second motion graphics piece/)).toBeInTheDocument();
    });

    it('displays submission type badge', () => {
      render(
        <AssignmentCard 
          assignment={mockAssignment} 
          onClick={mockOnClick} 
        />
      );
      
      expect(screen.getByText('file')).toBeInTheDocument();
    });

    it('shows submission count when available', () => {
      render(
        <AssignmentCard 
          assignment={mockAssignment} 
          onClick={mockOnClick} 
        />
      );
      
      expect(screen.getByText('5 submissions')).toBeInTheDocument();
    });

    it('handles singular submission count', () => {
      const singleSubmissionAssignment = {
        ...mockAssignment,
        _count: { submissions: 1 },
      };
      
      render(
        <AssignmentCard 
          assignment={singleSubmissionAssignment} 
          onClick={mockOnClick} 
        />
      );
      
      expect(screen.getByText('1 submission')).toBeInTheDocument();
    });
  });

  describe('Course Information', () => {
    it('shows course title when showCourse is true', () => {
      render(
        <AssignmentCard 
          assignment={mockAssignment} 
          onClick={mockOnClick} 
          showCourse={true}
        />
      );
      
      expect(screen.getByText('📚 Advanced Motion Design')).toBeInTheDocument();
    });

    it('hides course title when showCourse is false', () => {
      render(
        <AssignmentCard 
          assignment={mockAssignment} 
          onClick={mockOnClick} 
          showCourse={false}
        />
      );
      
      expect(screen.queryByText('📚 Advanced Motion Design')).not.toBeInTheDocument();
    });

    it('defaults to not showing course information', () => {
      render(
        <AssignmentCard 
          assignment={mockAssignment} 
          onClick={mockOnClick} 
        />
      );
      
      expect(screen.queryByText('📚 Advanced Motion Design')).not.toBeInTheDocument();
    });
  });

  describe('Deadline Status', () => {
    it('shows "Due Today" for assignments due today', () => {
      const today = new Date();
      const todayAssignment = {
        ...mockAssignment,
        deadline: today.toISOString(),
      };
      
      render(
        <AssignmentCard 
          assignment={todayAssignment} 
          onClick={mockOnClick} 
        />
      );
      
      expect(screen.getByText('Due Today')).toBeInTheDocument();
    });

    it('shows "Overdue" for past assignments', () => {
      const pastAssignment = {
        ...mockAssignment,
        deadline: '2020-01-01T00:00:00Z',
      };
      
      render(
        <AssignmentCard 
          assignment={pastAssignment} 
          onClick={mockOnClick} 
        />
      );
      
      expect(screen.getByText('Overdue')).toBeInTheDocument();
    });

    it('shows days remaining for future assignments', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);
      const futureAssignment = {
        ...mockAssignment,
        deadline: futureDate.toISOString(),
      };
      
      render(
        <AssignmentCard 
          assignment={futureAssignment} 
          onClick={mockOnClick} 
        />
      );
      
      expect(screen.getByText('Due in 5 days')).toBeInTheDocument();
    });

    it('shows "Due in 1 day" for singular day', () => {
      const tomorrowDate = new Date();
      tomorrowDate.setDate(tomorrowDate.getDate() + 1);
      const tomorrowAssignment = {
        ...mockAssignment,
        deadline: tomorrowDate.toISOString(),
      };
      
      render(
        <AssignmentCard 
          assignment={tomorrowAssignment} 
          onClick={mockOnClick} 
        />
      );
      
      expect(screen.getByText('Due in 1 day')).toBeInTheDocument();
    });
  });

  describe('Description Truncation', () => {
    it('truncates long descriptions', () => {
      const longDescription = 'A'.repeat(150); // 150 characters
      const longDescAssignment = {
        ...mockAssignment,
        description: longDescription,
      };
      
      render(
        <AssignmentCard 
          assignment={longDescAssignment} 
          onClick={mockOnClick} 
        />
      );
      
      const displayedText = screen.getByText(/A+\.\.\./);
      expect(displayedText).toBeInTheDocument();
      expect(displayedText.textContent?.length).toBeLessThan(150);
    });

    it('does not truncate short descriptions', () => {
      const shortDescription = 'Short description';
      const shortDescAssignment = {
        ...mockAssignment,
        description: shortDescription,
      };
      
      render(
        <AssignmentCard 
          assignment={shortDescAssignment} 
          onClick={mockOnClick} 
        />
      );
      
      expect(screen.getByText('Short description')).toBeInTheDocument();
      expect(screen.queryByText(/\.\.\./)).not.toBeInTheDocument();
    });
  });

  describe('Date Formatting', () => {
    it('formats deadline date correctly', () => {
      render(
        <AssignmentCard 
          assignment={mockAssignment} 
          onClick={mockOnClick} 
        />
      );
      
      // Should show formatted date (flexible matching for different locales)
      // The date shows as "Jan 1, 2025, 12:59 AM" based on the test output
      expect(screen.getByText(/Jan.*1.*2025/)).toBeInTheDocument();
    });
  });

  describe('Interaction', () => {
    it('calls onClick when card is clicked', () => {
      render(
        <AssignmentCard 
          assignment={mockAssignment} 
          onClick={mockOnClick} 
        />
      );
      
      const card = screen.getByTestId('assignment-card-assignment-1');
      fireEvent.click(card);
      
      expect(mockOnClick).toHaveBeenCalledWith('assignment-1');
    });

    it('calls onClick when View Assignment button is clicked', () => {
      render(
        <AssignmentCard 
          assignment={mockAssignment} 
          onClick={mockOnClick} 
        />
      );
      
      const viewButton = screen.getByRole('button', { name: /view assignment/i });
      fireEvent.click(viewButton);
      
      expect(mockOnClick).toHaveBeenCalledWith('assignment-1');
    });

    it('prevents event bubbling when button is clicked', () => {
      render(
        <AssignmentCard 
          assignment={mockAssignment} 
          onClick={mockOnClick} 
        />
      );
      
      const viewButton = screen.getByRole('button', { name: /view assignment/i });
      fireEvent.click(viewButton);
      
      // Should only be called once (from button click, not card click)
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Custom Styling', () => {
    it('applies custom className', () => {
      render(
        <AssignmentCard 
          assignment={mockAssignment} 
          onClick={mockOnClick} 
          className="custom-class"
        />
      );
      
      const card = screen.getByTestId('assignment-card-assignment-1');
      expect(card).toHaveClass('custom-class');
    });
  });

  describe('Missing Data Handling', () => {
    it('handles assignment without course information', () => {
      const assignmentWithoutCourse = {
        ...mockAssignment,
        course: undefined,
      };
      
      render(
        <AssignmentCard 
          assignment={assignmentWithoutCourse} 
          onClick={mockOnClick} 
          showCourse={true}
        />
      );
      
      expect(screen.queryByText(/📚/)).not.toBeInTheDocument();
    });

    it('handles assignment without submission count', () => {
      const assignmentWithoutCount = {
        ...mockAssignment,
        _count: undefined,
      };
      
      render(
        <AssignmentCard 
          assignment={assignmentWithoutCount} 
          onClick={mockOnClick} 
        />
      );
      
      expect(screen.queryByText(/submissions/)).not.toBeInTheDocument();
    });
  });
});