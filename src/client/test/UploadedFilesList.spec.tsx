import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import UploadedFilesList from '../components/UploadedFilesList';
import { formatBytes } from '../components/UploadedFilesList'; 


describe('UploadedFilesList', () => {
  it('should show empty state message when no files are present', () => {
    render(<UploadedFilesList files={[]} loading={false} error={null} />);
    expect(screen.getByText(/Oh, seems like you haven't got any files yet/)).toBeInTheDocument();
  });

  it('should show loading message when loading is true', () => {
    render(<UploadedFilesList files={[]} loading={true} error={null} />);
    expect(screen.getByText('Loading files...')).toBeInTheDocument();
  });

  it('should show error message when error is present', () => {
    const errorMessage = 'Failed to load files';
    render(<UploadedFilesList files={[]} loading={false} error={errorMessage} />);
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('should render files when available', () => {
    const files = [
      { name: 'file1.pdf', size: 1024 },
      { name: 'image.jpg', size: 2048 }
    ];
    render(<UploadedFilesList files={files} loading={false} error={null} />);
    
    expect(screen.getByText('file1.pdf')).toBeInTheDocument();
    expect(screen.getByText('image.jpg')).toBeInTheDocument();
    expect(screen.getByText('1 KB')).toBeInTheDocument();
    expect(screen.getByText('2 KB')).toBeInTheDocument();
  });

});

describe('formatBytes', () => {
  it('should return "0 Bytes" for 0', () => {
    expect(formatBytes(0)).toBe('0 Bytes');
  });

  it('should format bytes correctly', () => {
    expect(formatBytes(1024)).toBe('1 KB');
    expect(formatBytes(1536)).toBe('1.5 KB');
    expect(formatBytes(1048576)).toBe('1 MB');
    expect(formatBytes(1073741824)).toBe('1 GB');
  });

  it('should handle decimal places correctly', () => {
    expect(formatBytes(2500)).toBe('2.44 KB');
    expect(formatBytes(2621440)).toBe('2.5 MB');
  });
});