import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Textarea from './Textarea';

describe('Textarea Component', () => {
  it('renders with label', () => {
    render(<Textarea label="Description" />);
    
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
  });

  it('renders without label', () => {
    render(<Textarea placeholder="Enter description" />);
    
    expect(screen.getByPlaceholderText('Enter description')).toBeInTheDocument();
  });

  it('shows error message', () => {
    render(<Textarea label="Description" error="Description is required" />);
    
    expect(screen.getByText('Description is required')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('shows helper text when no error', () => {
    render(<Textarea label="Bio" helperText="Tell us about yourself" />);
    
    expect(screen.getByText('Tell us about yourself')).toBeInTheDocument();
  });

  it('prioritizes error over helper text', () => {
    render(
      <Textarea 
        label="Description" 
        error="Required field" 
        helperText="Optional description" 
      />
    );
    
    expect(screen.getByText('Required field')).toBeInTheDocument();
    expect(screen.queryByText('Optional description')).not.toBeInTheDocument();
  });

  it('handles input changes', () => {
    const handleChange = vi.fn();
    render(<Textarea onChange={handleChange} />);
    
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'test content' } });
    
    expect(handleChange).toHaveBeenCalled();
    expect(textarea).toHaveValue('test content');
  });

  it('applies fullWidth class', () => {
    const { container } = render(<Textarea fullWidth />);
    
    expect(container.firstChild).toHaveClass('w-full');
  });

  it('applies resize classes correctly', () => {
    const { rerender } = render(<Textarea resize="vertical" />);
    expect(screen.getByRole('textbox')).toHaveClass('resize-y');

    rerender(<Textarea resize={false} />);
    expect(screen.getByRole('textbox')).toHaveClass('resize-none');

    rerender(<Textarea resize="none" />);
    expect(screen.getByRole('textbox')).toHaveClass('resize-none');
  });

  it('has minimum height', () => {
    render(<Textarea />);
    
    expect(screen.getByRole('textbox')).toHaveClass('min-h-[120px]');
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(<Textarea ref={ref} />);
    
    expect(ref).toHaveBeenCalled();
  });

  // New tests for premium features
  describe('Premium Features', () => {
    it('renders floating label variant', () => {
      render(<Textarea label="Description" variant="floating" />);
      
      expect(screen.getByLabelText('Description')).toBeInTheDocument();
    });

    it('renders with different sizes', () => {
      const { rerender } = render(<Textarea size="sm" />);
      expect(screen.getByRole('textbox')).toHaveClass('min-h-[80px]');

      rerender(<Textarea size="md" />);
      expect(screen.getByRole('textbox')).toHaveClass('min-h-[120px]');

      rerender(<Textarea size="lg" />);
      expect(screen.getByRole('textbox')).toHaveClass('min-h-[160px]');
    });

    it('shows character count when enabled', () => {
      render(<Textarea showCharCount defaultValue="Hello" />);
      
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('shows character count with max length', () => {
      render(<Textarea showCharCount maxLength={100} defaultValue="Hello" />);
      
      expect(screen.getByText('5/100')).toBeInTheDocument();
    });

    it('updates character count on change', () => {
      render(<Textarea showCharCount />);
      
      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: 'Hello World' } });
      
      expect(screen.getByText('11')).toBeInTheDocument();
    });

    it('shows success state', () => {
      render(<Textarea success label="Description" />);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeInTheDocument();
    });

    it('handles focus and blur events', () => {
      const handleFocus = vi.fn();
      const handleBlur = vi.fn();
      
      render(<Textarea onFocus={handleFocus} onBlur={handleBlur} />);
      
      const textarea = screen.getByRole('textbox');
      fireEvent.focus(textarea);
      expect(handleFocus).toHaveBeenCalled();
      
      fireEvent.blur(textarea);
      expect(handleBlur).toHaveBeenCalled();
    });

    it('sets aria-invalid when error is present', () => {
      render(<Textarea error="Error message" />);
      
      expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
    });

    it('sets aria-describedby for error message', () => {
      render(<Textarea id="test-textarea" error="Error message" />);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('aria-describedby', 'test-textarea-error');
    });

    it('sets aria-describedby for helper text', () => {
      render(<Textarea id="test-textarea" helperText="Helper text" />);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('aria-describedby', 'test-textarea-helper');
    });
  });
});
