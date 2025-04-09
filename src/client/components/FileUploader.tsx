import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const CHUNK_SIZE = 5 * 1024 * 1024;

interface FileUploaderProps {
  onUploadSuccess: () => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onUploadSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);
  const messageRef = useRef<HTMLDivElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      setStatus('idle');
      setMessage('');
      setProgress(0);
    }
  };

  const uploadSingleFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return axios.post('/api/upload-single', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  };

  const uploadChunkedFile = async (file: File) => {
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

    for (let i = 0; i < totalChunks; i++) {
      const start = i * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, file.size);
      const chunk = file.slice(start, end);

      const formData = new FormData();
      formData.append('file', chunk, file.name);
      formData.append('currentChunkIndex', i.toString());
      formData.append('totalChunks', totalChunks.toString());

      await axios.post('/api/upload-chunk', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setProgress(Math.round(((i + 1) / totalChunks) * 100));
      setMessage(`Uploading: ${Math.round(((i + 1) / totalChunks) * 100)}%`);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setStatus('uploading');
    setMessage('Upload started...');
    setProgress(0);

    try {
      if (file.size <= CHUNK_SIZE) {
        await uploadSingleFile(file);
      } else {
        await uploadChunkedFile(file);
      }

      setStatus('success');
      setMessage('Upload complete.');
      onUploadSuccess();
    } catch (err: any) {
      setStatus('error');
      setMessage(err.response?.data?.error || 'Upload failed.');
    }
  };

  // accessibility move focus to message region when upload finishes or fails
  useEffect(() => {
    if (status === 'success' || status === 'error') {
      messageRef.current?.focus();
    }
  }, [status]);

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Upload a File</h2>

      <p id="file-instructions" style={styles.instructions}>
        Please select a file to upload. Supported file types: PDF, PNG, JPEG, DOCX. 
      </p>

      <label htmlFor="file-input" style={styles.label}>
        Select file:
      </label>
      <input
        type="file"
        id="file-input"
        onChange={handleFileChange}
        aria-describedby="file-instructions"
        aria-required="true"
        style={styles.input}
        accept=".pdf,.png,.jpeg,.jpg,.docx" 
      />

      <button
        onClick={handleUpload}
        disabled={!file || status === 'uploading'}
        aria-disabled={!file || status === 'uploading'}
        aria-busy={status === 'uploading'}
        style={{
          ...styles.button,
          ...(status === 'uploading' ? styles.buttonDisabled : {}),
        }}
      >
        {status === 'uploading' ? 'Uploading...' : 'Upload'}
      </button>

      {status === 'uploading' && (
        <div
          style={styles.progressBarContainer}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div style={{ ...styles.progressBar, width: `${progress}%` }} />
        </div>
      )}

      <div
        ref={messageRef}
        tabIndex={-1}
        aria-live="polite"
        aria-atomic="true"
        style={{
          ...styles.message,
          color: status === 'success' ? 'green' : status === 'error' ? 'red' : '#333',
        }}
      >
        {message}
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: '400px',
    margin: '50px auto',
    padding: '20px',
    border: '1px solid #ccc',
    borderRadius: '10px',
    fontFamily: 'Arial, sans-serif',
    textAlign: 'left',
  },
  heading: {
    marginBottom: '16px',
  },
  instructions: {
    fontSize: '0.9rem',
    marginBottom: '8px',
    color: '#555',
  },
  label: {
    display: 'block',
    marginBottom: '4px',
    fontWeight: 'bold',
  },
  input: {
    display: 'block',
    marginBottom: '16px',
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    border: 'none',
    color: '#fff',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  buttonDisabled: {
    backgroundColor: '#7da6d9',
    cursor: 'not-allowed',
  },
  progressBarContainer: {
    height: '8px',
    backgroundColor: '#eee',
    borderRadius: '4px',
    marginTop: '12px',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#007bff',
    transition: 'width 0.3s ease',
  },
  message: {
    marginTop: '15px',
    fontSize: '14px',
    outline: 'none',
  },
};

export default FileUploader;
