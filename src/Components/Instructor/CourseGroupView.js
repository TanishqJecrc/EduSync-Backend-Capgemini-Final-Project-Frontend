import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import Icon from '@mdi/react';
import { mdiEye, mdiDeleteForever, mdiBookPlus, mdiArrowLeft, mdiPencil, mdiCheck, mdiClose } from '@mdi/js';
import { formatDate, areDatesDifferent } from '../../utils/dates';  

function CourseGroupView() {
  const { courseGroupId } = useParams();
  const navigate = useNavigate();

  const [courseGroup, setCourseGroup] = useState(null);
  const [courses, setCourses] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [editingGroup, setEditingGroup] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');

  // For course delete confirmation
  const [showDeleteCourseModal, setShowDeleteCourseModal] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);

  // For course group delete confirmation
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    setLoading(true);
    setCourseGroup(null);
    setCourses([]);
    setEditingGroup(false);

    axiosInstance
      .get(`/CourseGroup/${courseGroupId}`)
      .then((response) => setCourseGroup(response.data))
      .catch(() => setCourseGroup(null));

    axiosInstance
      .get(`/CourseGroup/${courseGroupId}/Courses`)
      .then((response) => setCourses(Array.isArray(response.data) ? response.data : []))
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, [courseGroupId]);

  // Create new course
  const handleCreateCourse = (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    axiosInstance
      .post(`/CreateCourse`, { title, description, courseGroupId })
      .then((response) => {
        setCourses((prev) => [...prev, response.data]);
        setTitle('');
        setDescription('');
        alert('Course created successfully');
      })
      .catch(() => alert('Failed to create course'));
  };

  // Edit course group handlers
  const startEditingGroup = () => {
    setEditTitle(courseGroup.title);
    setEditDescription(courseGroup.description);
    setEditingGroup(true);
  };
  const cancelEditingGroup = () => setEditingGroup(false);
  const saveEditingGroup = () => {
    axiosInstance
      .put(`/UpdateCourseGroup/${courseGroupId}`, {
        title: editTitle,
        description: editDescription,
      })
      .then((response) => {
        setCourseGroup((prev) => ({ ...prev, ...response.data }));
        setEditingGroup(false);
        alert('Course group updated successfully');
        window.location.reload();
      })
      .catch(() => alert('Failed to update course group'));
  };

  // Delete course group handler
  const deleteGroup = () => {
    axiosInstance
      .delete(`/DeleteCourseGroup/${courseGroupId}`)
      .then(() => {
        setShowDeleteModal(false);
        alert('Course group deleted successfully');
        navigate(-1);
      })
      .catch(() => alert('Failed to delete course group'));
  };

  // Delete course handler (with confirmation)
  const confirmDeleteCourse = (courseId) => {
    setCourseToDelete(courseId);
    setShowDeleteCourseModal(true);
  };
  const handleDeleteCourse = () => {
    if (!courseToDelete) return;
    axiosInstance
      .delete(`/DeleteCourse/${courseToDelete}`)
      .then(() => {
        setCourses((prev) => prev.filter((c) => c.courseId !== courseToDelete));
        setShowDeleteCourseModal(false);
        setCourseToDelete(null);
        alert('Course deleted successfully');
      })
      .catch(() => {
        setShowDeleteCourseModal(false);
        setCourseToDelete(null);
        alert('Failed to delete course');
      });
  };

  // Filter courses
  const filteredCourses = Array.isArray(courses)
    ? courses.filter((course) =>
        course.title?.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  if (loading) {
  return (
    <div className="container mt-4 d-flex align-items-center">
      <span className="me-2 fw-semibold">Loading</span>
      <div className="spinner-border text-info" role="status" aria-hidden="true"></div>
    </div>
  );
}
  if (!courseGroup) return <div className="container mt-4 text-danger">Course group not found.</div>;

  return (
    <div className="container mt-4">
      {/* Back Button */}
      <div className="mb-4">
        <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
          <Icon path={mdiArrowLeft} size={0.8} /> Back
        </button>
      </div>

      {/* Course Group Header with Actions */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row align-items-end">
            <div className="col-md-8">
              {editingGroup ? (
                <>
                  <label htmlFor="editTitle" className="form-label">Course Group Title</label>
                  <input
                    id="editTitle"
                    type="text"
                    className="form-control mb-2"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                  />
                  <label htmlFor="editDescription" className="form-label">Course Group Description</label>
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
                  <h2 className="mb-2">{courseGroup.title}</h2>
                  <p className="mb-2">{courseGroup.description}</p>
                </>
              )}
              <div className="small text-muted">
                Created: {formatDate(courseGroup.createdOn)}
                {areDatesDifferent(courseGroup.createdOn, courseGroup.updatedOn) && (
                  <span> | Updated: {formatDate(courseGroup.updatedOn)}</span>
                )}
              </div>
            </div>
            <div className="col-md-4 text-end">
              {editingGroup ? (
                <>
                  <button className="btn btn-success me-2" onClick={saveEditingGroup}>
                    <Icon path={mdiCheck} size={0.7} /> Save
                  </button>
                  <button className="btn btn-secondary" onClick={cancelEditingGroup}>
                    <Icon path={mdiClose} size={0.7} /> Cancel
                  </button>
                </>
              ) : (
                <>
                  <button className="btn btn-warning me-2" onClick={startEditingGroup}>
                    <Icon path={mdiPencil} size={0.8} /> Edit Group
                  </button>
                  <button className="btn btn-danger" onClick={() => setShowDeleteModal(true)}>
                    <Icon path={mdiDeleteForever} size={0.8} /> Delete
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Course Group Delete Confirmation Modal */}
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
              Are you sure you want to delete this course group? This action cannot be undone.
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={deleteGroup}>
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Course Delete Confirmation Modal */}
      <div
        className={`modal fade ${showDeleteCourseModal ? 'show d-block' : ''}`}
        tabIndex="-1"
        style={{ backgroundColor: showDeleteCourseModal ? 'rgba(0,0,0,0.5)' : 'transparent' }}
        aria-modal={showDeleteCourseModal ? 'true' : 'false'}
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
                onClick={() => setShowDeleteCourseModal(false)}
              />
            </div>
            <div className="modal-body">
              Are you sure you want to delete this course? This action cannot be undone.
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowDeleteCourseModal(false)}>
                 <Icon path={mdiClose} size={0.8} /> Cancel
              </button>
              <button className="btn btn-danger" onClick={handleDeleteCourse}>
                 <Icon path={mdiDeleteForever} size={0.8} /> Delete Permanently
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Course Creation Form */}
      <form className="mb-3" onSubmit={handleCreateCourse}>
        <div className="row g-2 align-items-end">
          <div className="col-md-4">
            <label htmlFor="courseTitle" className="form-label">Course Title</label>
            <input
              id="courseTitle"
              type="text"
              className="form-control"
              placeholder="Course Title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="col-md-6">
            <label htmlFor="courseDescription" className="form-label">Description</label>
            <input
              id="courseDescription"
              type="text"
              className="form-control"
              placeholder="Description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
            />
          </div>
          <div className="col-md-2">
            <button
              type="submit"
              className="btn btn-success w-100"
              style={{ borderRadius: '25px' }}
            >
              <Icon path={mdiBookPlus} size={1} /> Create
            </button>
          </div>
        </div>
      </form>
     
      {/* Search Bar */}
      <div className="mb-1 d-flex align-items-center">
        <label htmlFor="searchCourses" className="form-label mb-0 me-2">Search Courses:</label>
        <input
          id="searchCourses"
          type="text"
          className="form-control"
          style={{ maxWidth: '90%' }}
          placeholder="Search courses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      {/* Pill showing total number of courses, right-aligned */}
      <div className="d-flex justify-content-end mb-3" style={{marginTop: '5px'}}>
       <span className="badge rounded-pill text-bg-primary" sstyle={{fontSize:"15px"}}>
          Total Courses: {filteredCourses.length}
        </span>
      </div>

      {/* Courses List */}
      <ul className="list-group">
        {filteredCourses.length > 0 ? (
          filteredCourses.map((course) => (
            <li
              key={course.courseId}
              className="list-group-item d-flex justify-content-between align-items-center"
            >
              <div style={{ flex: '1 1 300px', minWidth: '250px' }}>
                <strong>{course.title}</strong>
                <div className="text-muted small">
                  Created: {formatDate(course.createdOn)}
                  {areDatesDifferent(course.createdOn, course.updatedOn) && (
                    <span> | Updated: {formatDate(course.updatedOn)}</span>
                  )}
                </div>
              </div>
              <div className="d-flex gap-2 mt-2 mt-sm-0">
                <button
                  className="btn btn-primary btn-sm me-2"
                  style={{ borderRadius: '25px' }}
                  onClick={() => {
                    navigate(`/course/${course.courseId}`);
                  }}
                >
                  <Icon path={mdiEye} size={0.8} /> View
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  style={{ borderRadius: '25px' }}
                  onClick={() => confirmDeleteCourse(course.courseId)}
                >
                  <Icon path={mdiDeleteForever} size={0.8} /> Delete
                </button>
              </div>
            </li>
          ))
        ) : (
          <li className="list-group-item text-center text-muted">No courses found in this group.</li>
        )}
      </ul>
    </div>
  );
}

export default CourseGroupView;
