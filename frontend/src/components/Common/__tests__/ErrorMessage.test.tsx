import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import ErrorMessage from '../ErrorMessage';

describe('ErrorMessage', () => {
  it('renders error message with default props', () => {
    const { container } = render(<ErrorMessage message="Test error message" />);
    
    expect(screen.getByText('Test error message')).toBeInTheDocument();
    expect(container.firstChild).toHaveClass('bg-brand-error', 'bg-opacity-10');
  });

  it('renders with title when provided', () => {
    render(
      <ErrorMessage 
        title="Error Title" 
        message="Test error message" 
      />
    );
    
    expect(screen.getByText('Error Title')).toBeInTheDocument();
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('renders retry button when onRetry is provided', () => {
    const onRetry = vi.fn();
    
    render(
      <ErrorMessage 
        message="Test error message" 
        onRetry={onRetry}
      />
    );
    
    const retryButton = screen.getByText('Try Again');
    expect(retryButton).toBeInTheDocument();
    
    fireEvent.click(retryButton);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('renders dismiss button when onDismiss is provided', () => {
    const onDismiss = vi.fn();
    
    render(
      <ErrorMessage 
        message="Test error message" 
        onDismiss={onDismiss}
      />
    );
    
    const dismissButton = screen.getByText('Dismiss');
    expect(dismissButton).toBeInTheDocument();
    
    fireEvent.click(dismissButton);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('renders different types correctly', () => {
    const { container, rerender } = render(
      <ErrorMessage message="Warning message" type="warning" />
    );
    expect(container.firstChild).toHaveClass('bg-brand-warning', 'bg-opacity-10');

    rerender(<ErrorMessage message="Info message" type="info" />);
    expect(container.firstChild).toHaveClass('bg-brand-accent', 'bg-opacity-10');
  });

  it('hides icon when showIcon is false', () => {
    render(
      <ErrorMessage 
        message="Test error message" 
        showIcon={false}
      />
    );
    
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});