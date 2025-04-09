import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import FileUploader from '../components/FileUploader';

vi.mock('axios');
const mockedAxios = axios as unknown as {
  post: vi.Mock;
};

describe('FileUploader Component', () => {
  const mockOnUploadSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders initial state correctly', () => {
    render(<FileUploader onUploadSuccess={mockOnUploadSuccess} />);
    
    expect(screen.getByText('Upload a File')).toBeInTheDocument();
    expect(screen.getByText(/Please select a file to upload/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Select file/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Upload' })).toBeDisabled();
  });


  it('uploads small file as single upload', async () => {
    mockedAxios.post = vi.fn().mockResolvedValueOnce({ data: { success: true } });
    
    render(<FileUploader onUploadSuccess={mockOnUploadSuccess} />);
    
    const file = new File(['small file content'], 'small.pdf', { type: 'application/pdf' });
    const fileInput = screen.getByLabelText(/Select file/);
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    fireEvent.click(screen.getByRole('button', { name: 'Upload' }));
    
    expect(screen.getByText('Upload started...')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
      expect(mockedAxios.post).toHaveBeenCalledWith('/api/upload-single', expect.any(FormData), expect.any(Object));
      expect(screen.getByText('Upload complete.')).toBeInTheDocument();
    });
    
    expect(mockOnUploadSuccess).toHaveBeenCalledTimes(1);
  });

  it('uploads large file in chunks', async () => {
    mockedAxios.post = vi.fn().mockResolvedValue({ data: { success: true } });
    
    render(<FileUploader onUploadSuccess={mockOnUploadSuccess} />);
    
    const originalFile = new File(['large file content'], 'large.pdf', { 
      type: 'application/pdf',
    });
    
    Object.defineProperty(originalFile, 'size', {
      value: 10 * 1024 * 1024
    });
    
    const fileInput = screen.getByLabelText(/Select file/);
    
    fireEvent.change(fileInput, { target: { files: [originalFile] } });
    fireEvent.click(screen.getByRole('button', { name: 'Upload' }));
    
    expect(screen.getByText('Upload started...')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledTimes(2);
      expect(mockedAxios.post).toHaveBeenCalledWith('/api/upload-chunk', expect.any(FormData), expect.any(Object));
      expect(screen.getByText('Upload complete.')).toBeInTheDocument();
    });
    
    expect(mockOnUploadSuccess).toHaveBeenCalledTimes(1);
  });

  it('updates progress during chunked upload', async () => {
    const resolvedPromises = [
      Promise.resolve({ data: { success: true } }),
      Promise.resolve({ data: { success: true } })
    ];
    
    let callCount = 0;
    mockedAxios.post = vi.fn().mockImplementation(() => {
      return resolvedPromises[callCount++];
    });
    
    render(<FileUploader onUploadSuccess={mockOnUploadSuccess} />);
    
    const originalFile = new File(['large file content'], 'large.pdf', { 
      type: 'application/pdf',
    });
    
    Object.defineProperty(originalFile, 'size', {
      value: 10 * 1024 * 1024
    });
    
    const fileInput = screen.getByLabelText(/Select file/);
    
    fireEvent.change(fileInput, { target: { files: [originalFile] } });
    fireEvent.click(screen.getByRole('button', { name: 'Upload' }));
    
    await waitFor(() => {
      expect(screen.getByText('Uploading: 50%')).toBeInTheDocument();
    });
    
    await waitFor(() => {
      expect(screen.getByText('Upload complete.')).toBeInTheDocument();
    });
  });
});