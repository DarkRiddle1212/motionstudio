import { render, screen } from '@testing-library/react';
import LoadingSpinner from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders with default props', () => {
    const { container } = render(<LoadingSpinner />);
    
    const spinner = container.firstChild as HTMLElement;
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('w-6', 'h-6', 'text-brand-accent');
  });

  it('renders with different sizes', () => {
    const { container, rerender } = render(<LoadingSpinner size="sm" />);
    expect(container.firstChild).toHaveClass('w-4', 'h-4');

    rerender(<LoadingSpinner size="lg" />);
    expect(container.firstChild).toHaveClass('w-8', 'h-8');

    rerender(<LoadingSpinner size="xl" />);
    expect(container.firstChild).toHaveClass('w-12', 'h-12');
  });

  it('renders with different colors', () => {
    const { container, rerender } = render(<LoadingSpinner color="secondary" />);
    expect(container.firstChild).toHaveClass('text-brand-secondary-text');

    rerender(<LoadingSpinner color="white" />);
    expect(container.firstChild).toHaveClass('text-white');
  });

  it('applies custom className', () => {
    const { container } = render(<LoadingSpinner className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });
});