import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ProgressBar from './ProgressBar';

describe('ProgressBar Component', () => {
  it('renders with default props', () => {
    render(<ProgressBar value={50} />);
    
    expect(screen.getByText('Progress')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('renders with custom label', () => {
    render(<ProgressBar value={75} label="Course Progress" />);
    
    expect(screen.getByText('Course Progress')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('hides label when showLabel is false', () => {
    render(<ProgressBar value={30} showLabel={false} />);
    
    expect(screen.queryByText('Progress')).not.toBeInTheDocument();
    expect(screen.queryByText('30%')).not.toBeInTheDocument();
  });

  it('calculates percentage correctly', () => {
    render(<ProgressBar value={25} max={50} />);
    
    expect(screen.getByText('50%')).toBeInTheDocument(); // 25/50 * 100 = 50%
  });

  it('clamps values between 0 and 100', () => {
    const { rerender } = render(<ProgressBar value={-10} />);
    expect(screen.getByText('0%')).toBeInTheDocument();

    rerender(<ProgressBar value={150} />);
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('renders different sizes', () => {
    const { rerender } = render(<ProgressBar value={50} size="sm" />);
    expect(document.querySelector('.h-2')).toBeInTheDocument();

    rerender(<ProgressBar value={50} size="md" />);
    expect(document.querySelector('.h-3')).toBeInTheDocument();

    rerender(<ProgressBar value={50} size="lg" />);
    expect(document.querySelector('.h-4')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<ProgressBar value={50} className="custom-progress" />);
    
    expect(document.querySelector('.custom-progress')).toBeInTheDocument();
  });
});