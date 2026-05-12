import React, { useState, useEffect } from 'react';
import { FaTimes, FaDownload, FaFilePdf, FaFileAlt, FaSpinner } from 'react-icons/fa';
import './MaterialViewer.css';

interface MaterialViewerProps {
  material: {
    _id: string;
    title: string;
    fileName: string;
    fileUrl: string;
    mimeType: string;
    fileSize: number;
    description: string;
  };
  onClose: () => void;
}

const MaterialViewer: React.FC<MaterialViewerProps> = ({ material, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fileContent, setFileContent] = useState<string | null>(null);

  useEffect(() => {
    loadFile();
  }, [material]);

  const loadFile = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`http://localhost:3000${material.fileUrl}`);
      
      if (!response.ok) {
        throw new Error('Failed to load file');
      }

      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('application/pdf')) {
        // For PDFs, create blob URL for iframe
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setFileContent(url);
      } else if (contentType?.includes('text/') || contentType?.includes('application/json')) {
        // For text files, read content
        const text = await response.text();
        setFileContent(text);
      } else {
        // For other files, just show download option
        setFileContent('binary');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load file');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = `http://localhost:3000${material.fileUrl}`;
    link.download = material.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getFileIcon = () => {
    if (material.mimeType?.includes('pdf')) return <FaFilePdf />;
    return <FaFileAlt />;
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="viewer-loading">
          <FaSpinner className="spinner" />
          <p>Loading file...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="viewer-error">
          <p>Error: {error}</p>
          <button onClick={loadFile} className="retry-btn">Retry</button>
        </div>
      );
    }

    if (!fileContent) {
      return (
        <div className="viewer-empty">
          <p>Unable to preview this file type</p>
          <button onClick={handleDownload} className="download-btn">
            <FaDownload /> Download File
          </button>
        </div>
      );
    }

    if (fileContent === 'binary') {
      return (
        <div className="viewer-binary">
          <div className="binary-info">
            {getFileIcon()}
            <h3>{material.fileName}</h3>
            <p>Size: {(material.fileSize / 1024 / 1024).toFixed(2)} MB</p>
            <p>This file cannot be previewed in the browser</p>
          </div>
          <button onClick={handleDownload} className="download-btn">
            <FaDownload /> Download File
          </button>
        </div>
      );
    }

    if (material.mimeType?.includes('pdf')) {
      return (
        <div className="viewer-pdf">
          <iframe
            src={fileContent}
            className="pdf-iframe"
            title={material.title}
            width="100%"
            height="600px"
          />
        </div>
      );
    }

    if (material.mimeType?.includes('text/')) {
      return (
        <div className="viewer-text">
          <pre className="text-content">{fileContent}</pre>
        </div>
      );
    }

    return (
      <div className="viewer-empty">
        <p>Preview not available</p>
        <button onClick={handleDownload} className="download-btn">
          <FaDownload /> Download
        </button>
      </div>
    );
  };

  return (
    <div className="material-viewer-overlay">
      <div className="material-viewer-modal">
        <div className="viewer-header">
          <div className="viewer-title">
            {getFileIcon()}
            <h2>{material.title}</h2>
          </div>
          <div className="viewer-actions">
            <button onClick={handleDownload} className="download-header-btn">
              <FaDownload />
            </button>
            <button onClick={onClose} className="close-btn">
              <FaTimes />
            </button>
          </div>
        </div>
        
        <div className="viewer-meta">
          <span className="file-name">{material.fileName}</span>
          <span className="file-size">
            {(material.fileSize / 1024 / 1024).toFixed(2)} MB
          </span>
        </div>

        {material.description && (
          <div className="viewer-description">
            <p>{material.description}</p>
          </div>
        )}

        <div className="viewer-content">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default MaterialViewer;
