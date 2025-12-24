import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import FileUpload from './FileUpload';

describe('FileUpload Component', () => {
  const mockOnFileSelect = vi.fn();

  beforeEach(() => {
    mockOnFileSelect.mockClear();
  });

  it('renders with default props', () => {
    render(<FileUpload onFileSelect={mockOnFileSelect} />);
    
    expect(screen.getByText('Drop files here or click to browse')).toBeInTheDocument();
    expect(screen.getByText('All file types accepted')).toBeInTheDocument();
    expect(screen.getByText(/Max size: 50MB/)).toBeInTheDocument();
    // Since multiple defaults to false, the "(multiple files allowed)" text should not be present
    expect(screen.queryByText(/multiple files allowed/)).not.toBeInTheDocument();
  });

  it('renders with label', () => {
    render(<FileUpload label="Upload Documents" onFileSelect={mockOnFileSelect} />);
    
    expect(screen.getByText('Upload Documents')).toBeInTheDocument();
  });

  it('shows accepted file formats when provided', () => {
    render(<FileUpload accept=".pdf,.doc,.docx" onFileSelect={mockOnFileSelect} />);
    
    expect(screen.getByText('Accepted formats: .pdf,.doc,.docx')).toBeInTheDocument();
  });

  it('shows custom max size', () => {
    render(<FileUpload maxSize={10} onFileSelect={mockOnFileSelect} />);
    
    expect(screen.getByText(/Max size: 10MB/)).toBeInTheDocument();
  });

  it('shows single file mode when multiple is false', () => {
    render(<FileUpload multiple={false} onFileSelect={mockOnFileSelect} />);
    
    expect(screen.getByText(/Max size: 50MB/)).toBeInTheDocument();
    expect(screen.queryByText(/multiple files allowed/)).not.toBeInTheDocument();
  });

  it('shows multiple file mode when multiple is true', () => {
    render(<FileUpload multiple={true} onFileSelect={mockOnFileSelect} />);
    
    expect(screen.getByText(/Max size: 50MB/)).toBeInTheDocument();
    expect(screen.getByText(/multiple files allowed/)).toBeInTheDocument();
  });

  it('opens file dialog when clicked', () => {
    render(<FileUpload onFileSelect={mockOnFileSelect} />);
    
    const uploadArea = screen.getByText('Drop files here or click to browse').closest('div');
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    
    // Mock the click method
    const clickSpy = vi.spyOn(fileInput, 'click').mockImplementation(() => {});
    
    if (uploadArea) {
      fireEvent.click(uploadArea);
      expect(clickSpy).toHaveBeenCalled();
    }
    
    clickSpy.mockRestore();
  });

  it('handles file selection', () => {
    render(<FileUpload onFileSelect={mockOnFileSelect} />);
    
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
    
    Object.defineProperty(fileInput, 'files', {
      value: [file],
      writable: false,
    });
    
    fireEvent.change(fileInput);
    
    expect(mockOnFileSelect).toHaveBeenCalledWith([file]);
  });

  it('filters files by size', () => {
    render(<FileUpload maxSize={1} onFileSelect={mockOnFileSelect} />);
    
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    
    // Create a file larger than 1MB
    const largeFile = new File(['x'.repeat(2 * 1024 * 1024)], 'large.txt', { type: 'text/plain' });
    const smallFile = new File(['small content'], 'small.txt', { type: 'text/plain' });
    
    Object.defineProperty(fileInput, 'files', {
      value: [largeFile, smallFile],
      writable: false,
    });
    
    fireEvent.change(fileInput);
    
    // Should only include the small file
    expect(mockOnFileSelect).toHaveBeenCalledWith([smallFile]);
  });

  it('displays selected files', () => {
    render(<FileUpload onFileSelect={mockOnFileSelect} />);
    
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
    
    Object.defineProperty(fileInput, 'files', {
      value: [file],
      writable: false,
    });
    
    fireEvent.change(fileInput);
    
    expect(screen.getByText('test.txt')).toBeInTheDocument();
    expect(screen.getByText(/0\.00 MB/)).toBeInTheDocument();
  });

  it('removes files when remove button is clicked', () => {
    render(<FileUpload onFileSelect={mockOnFileSelect} />);
    
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
    
    Object.defineProperty(fileInput, 'files', {
      value: [file],
      writable: false,
    });
    
    fireEvent.change(fileInput);
    
    // File should be displayed
    expect(screen.getByText('test.txt')).toBeInTheDocument();
    
    // Click remove button
    const removeButton = screen.getByRole('button');
    fireEvent.click(removeButton);
    
    // File should be removed and onFileSelect called with empty array
    expect(mockOnFileSelect).toHaveBeenLastCalledWith([]);
    expect(screen.queryByText('test.txt')).not.toBeInTheDocument();
  });

  it('shows error message', () => {
    render(<FileUpload onFileSelect={mockOnFileSelect} error="File upload failed" />);
    
    expect(screen.getByText('File upload failed')).toBeInTheDocument();
  });

  it('shows helper text when no error', () => {
    render(<FileUpload onFileSelect={mockOnFileSelect} helperText="Upload your documents here" />);
    
    expect(screen.getByText('Upload your documents here')).toBeInTheDocument();
  });

  it('applies fullWidth class', () => {
    const { container } = render(<FileUpload fullWidth onFileSelect={mockOnFileSelect} />);
    
    // The fullWidth class is applied to the outermost div
    const outerDiv = container.firstChild as HTMLElement;
    expect(outerDiv).toHaveClass('w-full');
  });
});