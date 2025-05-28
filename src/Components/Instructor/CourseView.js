import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import Icon from '@mdi/react';
import { mdiEye, mdiDeleteForever, mdiContentSavePlus, mdiArrowLeft, mdiPencil, mdiCheck, mdiClose, mdiUpload, mdiNote, mdiImageArea, mdiVideo, mdiFileDocument, mdiHeadQuestion } from '@mdi/js';
import { formatDate, areDatesDifferent } from '../../utils/dates';

function CourseView() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [courseDetails, setCourseDetails] = useState(null);
  const [contents, setContents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contentType, setContentType] = useState('Video');
  const [selectedFile, setSelectedFile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showContentDeleteModal, setShowContentDeleteModal] = useState(false);
  const [selectedContentId, setSelectedContentId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    axiosInstance.get(`/Course/${courseId}`)
      .then(res => setCourseDetails(res.data))
      .catch(() => setCourseDetails(null));

    axiosInstance.get(`/Course/${courseId}/GetCourseAllMedia`)
      .then(res => setContents(Array.isArray(res.data) ? res.data : []))
      .catch(() => setContents([]));
  }, [courseId]);

  const handleCreateContent = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsUploading(true);
    try {
      // 1. Create content entry
      const contentRes = await axiosInstance.post(
        `/Course/${courseId}/CreateContent`,
        { title, shortDescription: description, contentType }
      );

      // 2. Upload file if selected
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        await axiosInstance.post(
          `/Course/${courseId}/${contentRes.data}/UploadContentFile`,
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
      }

      // 3. Refresh content list
      const updated = await axiosInstance.get(`/Course/${courseId}/GetCourseAllMedia`);
      setContents(Array.isArray(updated.data) ? updated.data : []);

      // 4. Reset form and show success
      setTitle('');
      setDescription('');
      setSelectedFile(null);
      alert('Content uploaded successfully!');
    } catch (error) {
      console.error('Creation failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  // Edit handlers
  const startEditing = () => {
    setEditTitle(courseDetails.title);
    setEditDescription(courseDetails.description);
    setEditing(true);
  };
  const cancelEditing = () => setEditing(false);
  const saveEditing = () => {
    axiosInstance.put(`/UpdateCourse/${courseId}`, {
      title: editTitle,
      description: editDescription
    })
    .then(res => {
      setEditing(false);
      window.location.reload(); // Hard refresh after edit
    })
    .catch(() => alert('Failed to update course'));
  };

  // Delete handler
  const deleteCourse = () => {
    axiosInstance.delete(`/DeleteCourse/${courseId}`)
      .then(() => {
        setShowDeleteModal(false);
        alert('Course deleted successfully');
        navigate(-1);
      })
      .catch(() => alert('Failed to delete course'));
  };

  const handleDeleteContent = (contentId) => {
    axiosInstance.delete(`/CourseContent/${contentId}`)
      .then(() => {
        setShowContentDeleteModal(false);
        return axiosInstance.get(`/Course/${courseId}/GetCourseAllMedia`);
      })
      .then(res => setContents(Array.isArray(res.data) ? res.data : []))
      .catch(() => alert('Failed to delete content'));
  };

  const filteredContents = Array.isArray(contents)
    ? contents.filter(content =>
        (content.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (content.shortDescription?.toLowerCase() || '').includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <div className="container mt-4">
      {/* Back Button */}
      <div className="mb-4">
        <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
          <Icon path={mdiArrowLeft} size={0.8} /> Back
        </button>
      </div>

      {/* Course Header with Actions */}
      {courseDetails && (
        <div className="card mb-4">
          <div className="card-body">
            <div className="row align-items-end">
              <div className="col-md-8">
                {editing ? (
                  <>
                    <label htmlFor="editTitle" className="form-label">Course Title</label>
                    <input
                      id="editTitle"
                      type="text"
                      className="form-control mb-2"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                    />
                    <label htmlFor="editDescription" className="form-label">Course Description</label>
                    <input
                      id="editDescription"
                      type="text"
                      className="form-control"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                    />
                  </>
                ) : (
                  <>
                    <h2 className="mb-2">{courseDetails.title}</h2>
                    <div className="alert alert-light mb-2">
                      <strong>Description:</strong> {courseDetails.description}
                    </div>
                     <br />
                  </>
                )}
                <div className="small text-muted">
                  Created: {formatDate(courseDetails.createdOn)}
                  {areDatesDifferent(courseDetails.createdOn, courseDetails.updatedOn) && (
                    <span> | Updated: {formatDate(courseDetails.updatedOn)}</span>
                  )}
                </div>
              </div>
              <div className="col-md-4 text-end">
                {editing ? (
                  <>
                    <button className="btn btn-success me-2" onClick={saveEditing}>
                      <Icon path={mdiCheck} size={0.7} /> Save
                    </button>
                    <button className="btn btn-secondary" onClick={cancelEditing}>
                      <Icon path={mdiClose} size={0.7} /> Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button className="btn btn-primary me-2" onClick={() => navigate(`/Course/${courseId}/Assessment`)}>
                      <Icon path={mdiHeadQuestion} size={0.9} /> Assessment
                    </button>
                    <button className="btn btn-warning me-2" onClick={startEditing}>
                      <Icon path={mdiPencil} size={0.9} /> Edit
                    </button>
                    <button className="btn btn-danger" onClick={() => setShowDeleteModal(true)}>
                      <Icon path={mdiDeleteForever} size={0.9} /> Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

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
              Are you sure you want to delete this course? This action cannot be undone.
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>
                <Icon path={mdiClose} size={0.8} /> Cancel
              </button>
              <button className="btn btn-danger" onClick={deleteCourse}>
                <Icon path={mdiDeleteForever} size={0.8} /> Delete Permanently
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Creation Form */}
      <form onSubmit={handleCreateContent} className="mb-4">
        <div className="row g-2 align-items-end">
          <div className="col-md-3">
            <label className="form-label">Content Title</label>
            <input
              type="text"
              className="form-control"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">Content Description</label>
            <input
              type="text"
              className="form-control"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <div className="col-md-2">
            <label className="form-label">Type</label>
            <select 
              className="form-select"
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
            >
              <option>Video</option>
              <option>Img</option>
              <option>Docs</option>
              <option>Others</option>
            </select>
          </div>
          <div className="col-md-2">
            <label className="form-label">File</label>
            <div className="input-group">
              <input
                type="file"
                className="form-control d-none"
                id="fileInput"
                onChange={(e) => setSelectedFile(e.target.files[0])}
              />
              <label 
                htmlFor="fileInput" 
                className="btn btn-outline-secondary"
                style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
              >
                <Icon path={mdiUpload} size={0.8} className="me-1" />
                {selectedFile ? selectedFile.name : 'Choose File'}
              </label>
            </div>
          </div>
          <div className="col-md-1">
            <button
              type="submit"
              className="btn btn-success w-100"
              style={{ borderRadius: '25px' }}
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status"></span>
                  Uploading...
                </>
              ) : (
                <>
                <Icon path={mdiContentSavePlus} size={1} /> Create</>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Search Bar */}
      <div className="mb-1 d-flex align-items-center">
        <label htmlFor="searchContents" className="form-label mb-0 me-2">Search Contents:</label>
        <input
          id="searchContents"
          type="text"
          className="form-control"
          style={{ maxWidth: '90%' }}
          placeholder="Search contents..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="d-flex justify-content-end mb-3" style={{marginTop: '5px'}}>
        <span className="badge rounded-pill text-bg-primary">
          Total Contents: {filteredContents.length}
        </span>
      </div>

      {/* Content Delete Confirmation Modal */}
      <div
        className={`modal fade ${showContentDeleteModal ? 'show d-block' : ''}`}
        tabIndex="-1"
        style={{ backgroundColor: showContentDeleteModal ? 'rgba(0,0,0,0.5)' : 'transparent' }}
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Delete Content</h5>
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={() => setShowContentDeleteModal(false)}
              />
            </div>
            <div className="modal-body">
              Are you sure you want to delete this content? This action cannot be undone.
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-secondary" 
                onClick={() => setShowContentDeleteModal(false)}
              >
                <Icon path={mdiClose} size={0.8}/> Cancel
              </button>
              <button 
                className="btn btn-danger"
                onClick={() => handleDeleteContent(selectedContentId)}
              >
               <Icon path={mdiDeleteForever} size={0.8} /> Delete Permanently
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Cards Grid */}
      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
        {filteredContents.map(content => (
          <div key={content.courseContentId} className="col">
            <div className="card h-100">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h4 className="card-title m-0"> 
                  {(content.contentType === 'Img' || content.contentType === 'image') && (
                    <Icon path={mdiImageArea} size={1.4} />
                  )}
                  {content.contentType === 'Video' && (
                    <Icon path={mdiVideo} size={1.4} />
                  )}
                  {(content.contentType === 'Docs' || content.contentType === 'document' || content.contentType === 'pdf') && (
                    <Icon path={mdiFileDocument} size={1.4} />
                  )}
                  {content.contentType === 'Others' && (
                    <Icon path={mdiNote} size={1.4} />
                  )}
                </h4>
                <span className="badge bg-primary">{content.contentType}</span>
              </div>
              <div className="card-body d-flex flex-column">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <h5 className="card-title m-0">{content.title}</h5>
                </div>
                <p className="card-text text-muted">{content.shortDescription}</p>
                <div className="mt-auto d-flex justify-content-between">
                  <Link 
                    to={`/content/${content.courseContentId}`}
                    className="btn btn-sm btn-outline-primary"
                  >
                    <Icon path={mdiEye} size={0.7} className="me-1" />
                    View Content
                  </Link>
                  <button 
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => {
                      setSelectedContentId(content.courseContentId);
                      setShowContentDeleteModal(true);
                    }}
                    style={{ marginLeft: '15px' }}
                  >
                    <Icon path={mdiDeleteForever} size={0.8} /> Delete
                  </button>
                </div>
              </div>
              <div className="card-footer text-muted small">
                <div>
                  Created: {formatDate(content.createdOn)}
                  {areDatesDifferent(content.createdOn, content.updatedOn) && (
                    <span><br/> Updated: {formatDate(content.updatedOn)}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredContents.length === 0 && (
        <div className="text-center my-5 text-muted">
          No contents found matching your search
        </div>
      )}
    </div>
  );
}

export default CourseView;
