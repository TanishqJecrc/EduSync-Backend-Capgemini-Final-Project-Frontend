import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import Icon from '@mdi/react';
import {
  mdiArrowLeft, mdiImageArea, mdiVideo, mdiFileDocument, mdiNote
} from '@mdi/js';
import { formatDate, areDatesDifferent } from '../../utils/dates';

function ViewContent() {
  const { contentId } = useParams();
  const navigate = useNavigate();

  const [content, setContent] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(true);

  useEffect(() => {
    setContent(null);
    setPreviewLoading(true);
    axiosInstance.get(`/Content/${contentId}`)
      .then(res => setContent(res.data))
      .catch(() => setContent(null));
  }, [contentId]);

  // Helper: choose icon based on content type
  const renderTypeIcon = (type) => {
    const t = (type || '').toLowerCase();
    if (t === 'img' || t === 'image') return <Icon path={mdiImageArea} size={1.4} />;
    if (t === 'video') return <Icon path={mdiVideo} size={1.4} />;
    if (t === 'docs' || t === 'document' || t === 'pdf') return <Icon path={mdiFileDocument} size={1.4} />;
    return <Icon path={mdiNote} size={1.4} />;
  };

  // File preview for student (with preview loading)
  const renderContentFile = () => {
    if (!content) return null;
    const t = (content.contentType || '').toLowerCase();
    const f = (content.fileFormat || '').toLowerCase();

    // Image
    if (t === 'img' || t === 'image' || ['png','jpg','jpeg','gif','bmp','webp'].includes(f)) {
      return (
        <img
          src={content.mediaUrl}
          alt={content.title}
          style={{ maxWidth: '100%', maxHeight: 500, margin: 'auto', display: 'block' }}
          onLoad={() => setPreviewLoading(false)}
          onError={() => setPreviewLoading(false)}
        />
      );
    }

    // Video
    if (t === 'video' || ['mp4','webm','ogg'].includes(f)) {
      return (
        <video
          src={content.mediaUrl}
          controls
          style={{ maxWidth: '100%', maxHeight: 500, margin: 'auto', display: 'block' }}
          onLoadedData={() => setPreviewLoading(false)}
          onError={() => setPreviewLoading(false)}
        />
      );
    }

    // PDF/Document
    if (
      t === 'docs' ||
      t === 'document' ||
      t === 'pdf' ||
      ['pdf','doc','docx','ppt','pptx'].includes(f)
    ) {
      return (
        <iframe
          src={content.mediaUrl}
          title={content.title}
          width="100%"
          height="600px"
          style={{ border: 'none' }}
          onLoad={() => setPreviewLoading(false)}
          onError={() => setPreviewLoading(false)}
        />
      );
    }

    // Fallback: preview in iframe
    return (
      <iframe
        src={content.mediaUrl}
        title={content.title}
        width="100%"
        height="600px"
        style={{ border: 'none' }}
        onLoad={() => setPreviewLoading(false)}
        onError={() => setPreviewLoading(false)}
      />
    );
  };

  if (!content) {
    return (
      <div className="container mt-4">
        <button className="btn btn-outline-secondary mb-3" onClick={() => navigate(-1)}>
          <Icon path={mdiArrowLeft} size={0.8} /> Back
        </button>
        <div className="alert alert-warning">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          Loading or content not found.
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      {/* Back Button */}
      <div className="mb-4">
        <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
          <Icon path={mdiArrowLeft} size={0.8} /> Back
        </button>
      </div>

      {/* Content Header */}
      <div className="card mb-4">
        <div className="card-body">
          <h4 className="card-title m-0">
            {renderTypeIcon(content.contentType)}{' '}
            <span className="ms-2">{content.title}</span>
          </h4>
          <div className="mt-2">
            {content.shortDescription && (
              <div className="alert alert-light mb-2">
                <strong>Description:</strong> {content.shortDescription}
              </div>
            )}
            <span className="badge bg-primary">{content.contentType}</span>
          </div>
          <div className="mt-2 small text-muted">
            <div>
              <strong>Posted on:</strong>{" "}
              {formatDate(content.createdOn)}
            </div>
            {areDatesDifferent(content.createdOn, content.updatedOn) && (
              <div>
                <strong>Last Updated on:</strong>{" "}
                {formatDate(content.updatedOn)}
              </div>
            )}
          </div>
        </div>

        {/* File Preview/Viewer with loading spinner */}
        <div className="card-footer">
          <h5 className="card-title">Module Content:</h5>
          {previewLoading && (
            <div className="text-center my-3">
              <div className="spinner-border text-primary" role="status" />
              <div className="text-muted mt-2">Loading content preview...</div>
            </div>
          )}
          <div style={previewLoading ? { opacity: 0.3, pointerEvents: 'none' } : {}}>
            {renderContentFile()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewContent;
