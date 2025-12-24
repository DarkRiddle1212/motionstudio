import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Select from './Select';

const mockOptions = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3', disabled: true },
];

describe('Select Component', () => {
  it('renders with label', () => {
    render(<Select label="Choose an option" options={mockOptions} />);
    
    expect(screen.getByLabelText('Choose an option')).toBeInTheDocument();
    expect(screen.getByText('Choose an option')).toBeInTheDocument();
  });

  it('renders options correctly', () => {
    render(<Select options={mockOptions} />);
    
    expect(screen.getByRole('option', { name: 'Option 1' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Option 2' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Option 3' })).toBeInTheDocument();
  });

  it('renders placeholder option', () => {
    render(<Select placeholder="Select an option" options={mockOptions} />);
    
    expect(screen.getByRole('option', { name: 'Select an option' })).toBeInTheDocument();
  });

  it('shows error message', () => {
    render(<Select label="Category" error="Please select a category" options={mockOptions} />);
    
    expect(screen.getByText('Please select a category')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('shows helper text when no error', () => {
    render(<Select label="Category" helperText="Choose your preferred category" options={mockOptions} />);
    
    expect(screen.getByText('Choose your preferred category')).toBeInTheDocument();
  });

  it('prioritizes error over helper text', () => {
    render(
      <Select 
        label="Category" 
        error="Required field" 
        helperText="Optional selection" 
        options={mockOptions}
      />
    );
    
    expect(screen.getByText('Required field')).toBeInTheDocument();
    expect(screen.queryByText('Optional selection')).not.toBeInTheDocument();
  });

  it('handles selection changes', () => {
    const handleChange = vi.fn();
    render(<Select onChange={handleChange} options={mockOptions} />);
    
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'option2' } });
    
    expect(handleChange).toHaveBeenCalled();
  });

  it('applies fullWidth class', () => {
    const { container } = render(<Select fullWidth options={mockOptions} />);
    
    expect(container.firstChild).toHaveClass('w-full');
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(<Select ref={ref} options={mockOptions} />);
    
    expect(ref).toHaveBeenCalled();
  });

  it('disables options correctly', () => {
    render(<Select options={mockOptions} />);
    
    const disabledOption = screen.getByRole('option', { name: 'Option 3' });
    expect(disabledOption).toBeDisabled();
  });

  // Premium features tests
  describe('Premium Features', () => {
    it('renders floating label variant', () => {
      render(<Select label="Category" variant="floating" options={mockOptions} />);
      
      expect(screen.getByLabelText('Category')).toBeInTheDocument();
    });

    it('renders with different sizes', () => {
      const { rerender } = render(<Select size="sm" options={mockOptions} />);
      expect(screen.getByRole('combobox')).toHaveClass('py-2');

      rerender(<Select size="md" options={mockOptions} />);
      expect(screen.getByRole('combobox')).toHaveClass('py-3');

      rerender(<Select size="lg" options={mockOptions} />);
      expect(screen.getByRole('combobox')).toHaveClass('py-4');
    });

    it('shows success state', () => {
      render(<Select success label="Category" options={mockOptions} />);
      
      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();
    });

    it('handles focus and blur events', () => {
      const handleFocus = vi.fn();
      const handleBlur = vi.fn();
      
      render(<Select onFocus={handleFocus} onBlur={handleBlur} options={mockOptions} />);
      
      const select = screen.getByRole('combobox');
      fireEvent.focus(select);
      expect(handleFocus).toHaveBeenCalled();
      
      fireEvent.blur(select);
      expect(handleBlur).toHaveBeenCalled();
    });

    it('sets aria-invalid when error is present', () => {
      render(<Select error="Error message" options={mockOptions} />);
      
      expect(screen.getByRole('combobox')).toHaveAttribute('aria-invalid', 'true');
    });

    it('sets aria-describedby for error message', () => {
      render(<Select id="test-select" error="Error message" options={mockOptions} />);
      
      const select = screen.getByRole('combobox');
      expect(select).toHaveAttribute('aria-describedby', 'test-select-error');
    });

    it('sets aria-describedby for helper text', () => {
      render(<Select id="test-select" helperText="Helper text" options={mockOptions} />);
      
      const select = screen.getByRole('combobox');
      expect(select).toHaveAttribute('aria-describedby', 'test-select-helper');
    });

    it('renders with children instead of options prop', () => {
      render(
        <Select label="Custom">
          <option value="a">Custom A</option>
          <option value="b">Custom B</option>
        </Select>
      );
      
      expect(screen.getByRole('option', { name: 'Custom A' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Custom B' })).toBeInTheDocument();
    });
  });
});
