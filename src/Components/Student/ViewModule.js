import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import Icon from '@mdi/react';
import {
  mdiAccountTie, mdiArrowLeft, mdiNote, mdiImageArea, mdiVideo, mdiFileDocument,
  mdiViewModule
} from '@mdi/js';
import { formatDate, areDatesDifferent } from '../../utils/dates';

function ViewModule() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [courseDetails, setCourseDetails] = useState(null);
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axiosInstance.get(`/Course/${courseId}`)
      .then(res => setCourseDetails(res.data))
      .catch(() => setCourseDetails(null));

    axiosInstance.get(`/Course/${courseId}/GetCourseAllMedia`)
      .then(res => setContents(Array.isArray(res.data) ? res.data : []))
      .catch(() => setContents([]))
      .finally(() => setLoading(false));
  }, [courseId]);

  // Helper to render icon by content type
  const renderTypeIcon = (type) => {
    const t = (type || '').toLowerCase();
    if (t === 'img' || t === 'image') return <Icon path={mdiImageArea} size={1.2} />;
    if (t === 'video') return <Icon path={mdiVideo} size={1.2} />;
    if (t === 'docs' || t === 'document' || t === 'pdf') return <Icon path={mdiFileDocument} size={1.2} />;
    return <Icon path={mdiNote} size={1.2} />;
  };

  if (loading) {
    return (
      <div className="container mt-4 d-flex align-items-center">
        <span className="me-2 fw-semibold">Loading</span>
        <div className="spinner-border text-info" role="status" aria-hidden="true"></div>
      </div>
    );
  }

  if (!courseDetails) {
    return <div className="container mt-4 text-danger">Course not found.</div>;
  }

  return (
    <div className="container mt-4">
      {/* Back Button */}
      <div className="mb-4">
        <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
          <Icon path={mdiArrowLeft} size={0.8} /> Back
        </button>
      </div>

      {/* Course Header */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="d-flex align-items-center mb-3">
            <Icon path={mdiViewModule} size={1.5} className="text-primary me-3" />
            <span className="fw-bold">Course Details</span>
          </div>
          <div className="d-flex justify-content-between mb-2">
          <h2 className="mb-2">{courseDetails.title}</h2>
          <div><Icon path={mdiAccountTie} size={0.8} />
                                  <span className="text-muted">Instructor:</span>{" "}
                                  {courseDetails.instructorName || "Unknown"}</div>
           
          </div>
          <div className="alert alert-light mb-2">
                <strong>Description:</strong> {courseDetails.description}
          </div>
          <div className="small text-muted">
            Created On: {formatDate(courseDetails.createdOn)}
            {areDatesDifferent(courseDetails.createdOn, courseDetails.updatedOn) && (
              <span> | Updated On: {formatDate(courseDetails.updatedOn)}</span>
            )}
          </div>
        </div>
        <div className="card-footer bg-white border-0">
          <span className="badge rounded-pill text-bg-primary" style={{ fontSize: "0.8rem" }}>
            {contents.length} Total Content
          </span>
        </div>
      </div>

      {/* Content List */}
      <ul className="list-group">
        {contents.length > 0 ? (
          contents.map(content => (
            <li
              key={content.courseContentId}
              className="list-group-item d-flex justify-content-between align-items-center"
            >
              <div className="d-flex align-items-center" style={{ flex: '1 1 300px', minWidth: '250px' }}>
                <span className="me-3">{renderTypeIcon(content.contentType)}</span>
                <div>
                  <div><strong>{content.title}</strong></div>
                  <div className="text-muted small">
                    Posted On: {formatDate(content.createdOn)}
                    {areDatesDifferent(content.createdOn, content.updatedOn) && (
                      <span> | Last Updated On: {formatDate(content.updatedOn)}</span>
                    )}
                  </div>
                </div>
              </div>
             
            </li>
          ))
        ) : (
          <li className="list-group-item text-center text-muted">
            No content found for this course.
          </li>
        )}
      </ul>
    </div>
  );
}

export default ViewModule;
