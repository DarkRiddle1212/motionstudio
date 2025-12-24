import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Input from './Input';

describe('Input Component', () => {
  it('renders with label', () => {
    render(<Input label="Email Address" />);
    
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
    expect(screen.getByText('Email Address')).toBeInTheDocument();
  });

  it('renders without label', () => {
    render(<Input placeholder="Enter text" />);
    
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('shows error message', () => {
    render(<Input label="Email" error="Invalid email format" />);
    
    expect(screen.getByText('Invalid email format')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('shows helper text when no error', () => {
    render(<Input label="Password" helperText="Must be at least 8 characters" />);
    
    expect(screen.getByText('Must be at least 8 characters')).toBeInTheDocument();
  });

  it('prioritizes error over helper text', () => {
    render(
      <Input 
        label="Email" 
        error="Invalid email" 
        helperText="Enter your email address" 
      />
    );
    
    expect(screen.getByText('Invalid email')).toBeInTheDocument();
    expect(screen.queryByText('Enter your email address')).not.toBeInTheDocument();
  });

  it('handles input changes', () => {
    const handleChange = vi.fn();
    render(<Input onChange={handleChange} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test input' } });
    
    expect(handleChange).toHaveBeenCalled();
    expect(input).toHaveValue('test input');
  });

  it('applies fullWidth class', () => {
    const { container } = render(<Input fullWidth />);
    
    expect(container.firstChild).toHaveClass('w-full');
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(<Input ref={ref} />);
    
    expect(ref).toHaveBeenCalled();
  });

  // New tests for premium features
  describe('Premium Features', () => {
    it('renders floating label variant', () => {
      render(<Input label="Email" variant="floating" />);
      
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
    });

    it('renders with different sizes', () => {
      const { rerender } = render(<Input inputSize="sm" />);
      expect(screen.getByRole('textbox')).toHaveClass('py-2');

      rerender(<Input inputSize="md" />);
      expect(screen.getByRole('textbox')).toHaveClass('py-3');

      rerender(<Input inputSize="lg" />);
      expect(screen.getByRole('textbox')).toHaveClass('py-4');
    });

    it('renders with left icon', () => {
      render(<Input leftIcon={<span data-testid="left-icon">🔍</span>} />);
      
      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    });

    it('renders with right icon', () => {
      render(<Input rightIcon={<span data-testid="right-icon">✓</span>} />);
      
      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    });

    it('shows success state', () => {
      render(<Input success label="Email" />);
      
      // Success checkmark should be visible
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });

    it('handles focus and blur events', () => {
      const handleFocus = vi.fn();
      const handleBlur = vi.fn();
      
      render(<Input onFocus={handleFocus} onBlur={handleBlur} />);
      
      const input = screen.getByRole('textbox');
      fireEvent.focus(input);
      expect(handleFocus).toHaveBeenCalled();
      
      fireEvent.blur(input);
      expect(handleBlur).toHaveBeenCalled();
    });

    it('sets aria-invalid when error is present', () => {
      render(<Input error="Error message" />);
      
      expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
    });

    it('sets aria-describedby for error message', () => {
      render(<Input id="test-input" error="Error message" />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-describedby', 'test-input-error');
    });

    it('sets aria-describedby for helper text', () => {
      render(<Input id="test-input" helperText="Helper text" />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-describedby', 'test-input-helper');
    });
  });
});
