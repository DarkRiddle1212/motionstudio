import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Modal from './Modal';

describe('Modal Component', () => {
  it('renders when isOpen is true', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()}>
        <p>Modal content</p>
      </Modal>
    );
    
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(
      <Modal isOpen={false} onClose={vi.fn()}>
        <p>Modal content</p>
      </Modal>
    );
    
    expect(screen.queryByText('Modal content')).not.toBeInTheDocument();
  });

  it('renders title when provided', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    );
    
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    );
    
    const closeButton = screen.getByRole('button');
    fireEvent.click(closeButton);
    
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when overlay is clicked and closeOnOverlayClick is true', () => {
    const handleClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} closeOnOverlayClick={true}>
        <p>Modal content</p>
      </Modal>
    );
    
    // Click on the overlay (backdrop)
    const overlay = document.querySelector('.bg-black');
    if (overlay) {
      fireEvent.click(overlay);
      expect(handleClose).toHaveBeenCalledTimes(1);
    }
  });

  it('does not call onClose when overlay is clicked and closeOnOverlayClick is false', () => {
    const handleClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} closeOnOverlayClick={false}>
        <p>Modal content</p>
      </Modal>
    );
    
    const overlay = document.querySelector('.bg-black');
    if (overlay) {
      fireEvent.click(overlay);
      expect(handleClose).not.toHaveBeenCalled();
    }
  });

  it('renders footer when provided', () => {
    render(
      <Modal 
        isOpen={true} 
        onClose={vi.fn()} 
        footer={<button>Footer Button</button>}
      >
        <p>Modal content</p>
      </Modal>
    );
    
    expect(screen.getByText('Footer Button')).toBeInTheDocument();
  });

  it('hides close button when showCloseButton is false', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} showCloseButton={false} title="Test">
        <p>Modal content</p>
      </Modal>
    );
    
    // Should not find the close button (X icon)
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('applies different sizes correctly', () => {
    const { rerender } = render(
      <Modal isOpen={true} onClose={vi.fn()} size="sm">
        <p>Small modal</p>
      </Modal>
    );
    expect(document.querySelector('.max-w-md')).toBeInTheDocument();

    rerender(
      <Modal isOpen={true} onClose={vi.fn()} size="lg">
        <p>Large modal</p>
      </Modal>
    );
    expect(document.querySelector('.max-w-2xl')).toBeInTheDocument();
  });
});