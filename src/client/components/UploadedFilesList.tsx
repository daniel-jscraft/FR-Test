import React from 'react';
import { UploadedFile } from '../App';

interface UploadedFilesListProps {
  files: UploadedFile[];
  loading: boolean;
  error: string | null;
}

export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
};

const UploadedFilesList: React.FC<UploadedFilesListProps> = ({ files, loading, error }) => {
  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Uploaded Files</h2>

      {loading && <p>Loading files...</p>}
      {error && <p style={styles.error}>{error}</p>}
      {!loading && !error && files?.length === 0 && <p>👋 Oh, seems like you haven't got any files yet. Let's change that!</p>}

      {!loading && !error && files?.length > 0 && (
        <ul style={styles.fileList}>
          {files.map((file) => (
            <li key={file.name} style={styles.fileItem}>
              <span style={styles.fileName}>{file.name}</span>
              <span style={styles.fileSize}>{formatBytes(file.size)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: '500px',
    margin: '30px auto',
    padding: '20px',
    border: '1px solid #ccc',
    borderRadius: '10px',
    fontFamily: 'Arial, sans-serif',
  },
  heading: {
    fontSize: '1.25rem',
    marginBottom: '16px',
  },
  error: {
    color: 'red',
  },
  fileList: {
    listStyleType: 'none',
    padding: 0,
    marginTop: '12px',
  },
  fileItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 12px',
    borderBottom: '1px solid #eee',
  },
  fileName: {
    fontWeight: 500,
  },
  fileSize: {
    fontSize: '0.9rem',
    color: '#666',
  },
};

export default UploadedFilesList;
