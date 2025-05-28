import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import Icon from '@mdi/react';
import {
  mdiArrowLeft, mdiDeleteForever, mdiClose,
  mdiImageArea, mdiVideo, mdiFileDocument, mdiNote
} from '@mdi/js';
import { formatDate, areDatesDifferent } from '../../utils/dates';

function ContentView() {
  const { courseContentId } = useParams();
  const navigate = useNavigate();

  const [content, setContent] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    axiosInstance.get(`/Content/${courseContentId}`)
      .then(res => setContent(res.data))
      .catch(() => setContent(null));
  }, [courseContentId]);

  const deleteContent = () => {
    axiosInstance.delete(`/CourseContent/${courseContentId}`)
      .then(() => {
        setShowDeleteModal(false);
        alert('Content deleted successfully');
        navigate(-1);
      })
      .catch(() => alert('Failed to delete content'));
  };

  // Helper: choose icon based on content type
  const renderTypeIcon = (type) => {
    const t = (type || '').toLowerCase();
    if (t === 'img' || t === 'image') return <Icon path={mdiImageArea} size={1.4} />;
    if (t === 'video') return <Icon path={mdiVideo} size={1.4} />;
    if (t === 'docs' || t === 'document' || t === 'pdf') return <Icon path={mdiFileDocument} size={1.4} />;
    return <Icon path={mdiNote} size={1.4} />;
  };

  // Show the file directly (image, video, document, pdf, or fallback)
  const renderContentFile = () => {
    if (!content) return null;
    const t = (content.contentType || '').toLowerCase();
    const f = (content.fileFormat || '').toLowerCase();

   if (t === 'img' || t === 'image' || ['png','jpg','jpeg','gif','bmp','webp'].includes(f)) {
    return (
      <img
        src={content.mediaUrl}
        alt={content.title}
        style={{ maxWidth: '100%', maxHeight: 500, margin: 'auto', display: 'block' }}
      />
    );
  }

  // Video preview
  if (t === 'video' || ['mp4','webm','ogg'].includes(f)) {
    return (
      <video
        src={content.mediaUrl}
        controls
        style={{ maxWidth: '100%', maxHeight: 500, margin: 'auto', display: 'block' }}
      />
    );
  }

  // PDF/Document preview in iframe
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

      {/* Content Header with Actions */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row align-items-end">
            <div className="col-md-8">
              <h4 className="card-title m-0">
                {renderTypeIcon(content.contentType)}{' '}
                <span className="ms-2">{content.title}</span>
              </h4>
              <div className="mt-2">
                <p className="mb-2">
                  <span style={{ visibility: 'hidden' }}>
                    {renderTypeIcon(content.contentType)}{"  "}
                  </span>
                   <div className="alert alert-light mb-2 w-100">
                      <strong>Description:</strong>   {content.shortDescription}
                    </div>
                </p>
                <span className="badge bg-primary">{content.contentType}</span>
                {' '}
                {content.fileFormat && (
                  <span className="badge bg-secondary ms-2">{content.fileFormat.toUpperCase()}</span>
                )}
              </div>
              <div className="mt-2 small text-muted">
                <div>
                  <strong>Created on:</strong>{" "}
                  {formatDate(content.createdOn)}
                </div>
                {areDatesDifferent(content.createdOn, content.updatedOn) && (
                  <div>
                    <strong>Updated on:</strong>{" "}
                    {formatDate(content.updatedOn)}
                  </div>
                )}
              </div>
            </div>
            <div className="col-md-4 text-end">
              <button className="btn btn-danger" onClick={() => setShowDeleteModal(true)}>
                <Icon path={mdiDeleteForever} size={0.8} /> Delete
              </button>
            </div>
          </div>
        </div>

        {/* File Preview/Viewer */}
        <div className="card-footer">
          <h5 className="card-title">File Preview</h5>
          {renderContentFile()}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <div
        className={`modal fade ${showDeleteModal ? 'show d-block' : ''}`}
        tabIndex="-1"
        style={{ backgroundColor: showDeleteModal ? 'rgba(0,0,0,0.5)' : 'transparent' }}
        aria-modal={showDeleteModal ? 'true' : 'false'}
        role="dialog"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Confirm Delete</h5>
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={() => setShowDeleteModal(false)}
              />
            </div>
            <div className="modal-body">
              Are you sure you want to delete this content? This action cannot be undone.
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>
                <Icon path={mdiClose} size={0.8} /> Cancel
              </button>
              <button className="btn btn-danger" onClick={deleteContent}>
                <Icon path={mdiDeleteForever} size={0.8} /> Delete Permanently
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContentView;
