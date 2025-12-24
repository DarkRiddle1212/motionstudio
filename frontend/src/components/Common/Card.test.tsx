import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Card from './Card';

describe('Card Component', () => {
  it('renders children correctly', () => {
    render(
      <Card>
        <h2>Card Title</h2>
        <p>Card content</p>
      </Card>
    );
    
    expect(screen.getByText('Card Title')).toBeInTheDocument();
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('renders different variants correctly', () => {
    const { rerender } = render(
      <Card variant="default" data-testid="card">Default Card</Card>
    );
    expect(screen.getByTestId('card')).toHaveClass('bg-surface-card');
    expect(screen.getByTestId('card')).toHaveAttribute('data-variant', 'default');

    rerender(
      <Card variant="project" data-testid="card">Project Card</Card>
    );
    expect(screen.getByTestId('card')).toHaveClass('cursor-pointer');
    expect(screen.getByTestId('card')).toHaveAttribute('data-variant', 'project');

    rerender(
      <Card variant="elevated" data-testid="card">Elevated Card</Card>
    );
    expect(screen.getByTestId('card')).toHaveClass('shadow-card');
    expect(screen.getByTestId('card')).toHaveAttribute('data-variant', 'elevated');

    rerender(
      <Card variant="glass" data-testid="card">Glass Card</Card>
    );
    expect(screen.getByTestId('card')).toHaveClass('glass');
    expect(screen.getByTestId('card')).toHaveAttribute('data-variant', 'glass');
  });

  it('handles click events when onClick is provided', () => {
    const handleClick = vi.fn();
    render(
      <Card onClick={handleClick} data-testid="clickable-card">
        Clickable Card
      </Card>
    );
    
    fireEvent.click(screen.getByTestId('clickable-card'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies cursor-pointer when hoverable', () => {
    render(
      <Card hoverable data-testid="hoverable-card">Hoverable Card</Card>
    );
    
    expect(screen.getByTestId('hoverable-card')).toHaveClass('cursor-pointer');
  });

  it('applies custom className', () => {
    render(
      <Card className="custom-card-class" data-testid="custom-card">Custom Card</Card>
    );
    
    expect(screen.getByTestId('custom-card')).toHaveClass('custom-card-class');
  });

  it('applies padding variants correctly', () => {
    const { rerender } = render(
      <Card padding="none" data-testid="card">No Padding</Card>
    );
    expect(screen.getByTestId('card')).not.toHaveClass('p-4');
    expect(screen.getByTestId('card')).not.toHaveClass('p-6');
    expect(screen.getByTestId('card')).not.toHaveClass('p-8');

    rerender(
      <Card padding="sm" data-testid="card">Small Padding</Card>
    );
    expect(screen.getByTestId('card')).toHaveClass('p-4');

    rerender(
      <Card padding="md" data-testid="card">Medium Padding</Card>
    );
    expect(screen.getByTestId('card')).toHaveClass('p-6');

    rerender(
      <Card padding="lg" data-testid="card">Large Padding</Card>
    );
    expect(screen.getByTestId('card')).toHaveClass('p-8');
  });

  it('applies aspect ratio variants correctly', () => {
    const { rerender } = render(
      <Card aspectRatio="16/9" data-testid="card">Video Aspect</Card>
    );
    expect(screen.getByTestId('card')).toHaveClass('aspect-video');

    rerender(
      <Card aspectRatio="4/3" data-testid="card">4:3 Aspect</Card>
    );
    expect(screen.getByTestId('card')).toHaveClass('aspect-[4/3]');

    rerender(
      <Card aspectRatio="1/1" data-testid="card">Square Aspect</Card>
    );
    expect(screen.getByTestId('card')).toHaveClass('aspect-square');

    rerender(
      <Card aspectRatio="auto" data-testid="card">Auto Aspect</Card>
    );
    expect(screen.getByTestId('card')).not.toHaveClass('aspect-video');
    expect(screen.getByTestId('card')).not.toHaveClass('aspect-square');
  });

  it('applies hover effect data attribute', () => {
    const { rerender } = render(
      <Card hover="lift" data-testid="card">Lift Hover</Card>
    );
    expect(screen.getByTestId('card')).toHaveAttribute('data-hover', 'lift');

    rerender(
      <Card hover="glow" data-testid="card">Glow Hover</Card>
    );
    expect(screen.getByTestId('card')).toHaveAttribute('data-hover', 'glow');

    rerender(
      <Card hover="scale" data-testid="card">Scale Hover</Card>
    );
    expect(screen.getByTestId('card')).toHaveAttribute('data-hover', 'scale');

    rerender(
      <Card hover="none" data-testid="card">No Hover</Card>
    );
    expect(screen.getByTestId('card')).toHaveAttribute('data-hover', 'none');
  });

  it('has premium rounded corners', () => {
    render(
      <Card data-testid="card">Premium Card</Card>
    );
    expect(screen.getByTestId('card')).toHaveClass('rounded-xl');
  });

  it('has subtle border styling', () => {
    render(
      <Card variant="default" data-testid="card">Default Card</Card>
    );
    expect(screen.getByTestId('card')).toHaveClass('border-subtle');
  });
});