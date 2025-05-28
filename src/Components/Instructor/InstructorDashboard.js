import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import Icon from '@mdi/react';
import { mdiEye, mdiDeleteForever, mdiBookPlusMultiple } from '@mdi/js';
import { formatDate, areDatesDifferent } from '../../utils/dates';

function InstructorDashboard() {
  const [courses, setCourses] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [search, setSearch] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    axiosInstance.get("/MyCourses")
      .then((response) => {
        if (response.status === 200) {
          setCourses(response.data);
        }
        if (response.status === 404) {
          setCourses([]);
        }
      })
      .catch((error) => {
        if (error.response && error.response.status === 404) {
          setCourses([]);
        } 
        else {
        console.error("Error fetching courses:", error);
        alert("Failed to load courses");
      }});
  }, []);

  // Create new course
  const handleCreate = (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    axiosInstance.post("/CreateCourse", { title, description })
      .then((response) => {
        if (response.status === 200 || response.status === 201) {
          setCourses([...courses, response.data]);
          setTitle('');
          setDescription('');
          alert("Course created successfully");
        }
      })
      .catch((error) => {
        console.error("Error creating course:", error);
        alert("Failed to create course");
      });
  };

  // Delete course with confirmation
  const handleDelete = (id) => {
    setCourseToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    axiosInstance.delete(`/DeleteCourse/${courseToDelete}`)
      .then((response) => {
        if (response.status === 200) {
          setCourses(courses.filter(course => course.courseId !== courseToDelete));
          alert("Course deleted successfully");
        }
      })
      .catch((error) => {
        console.error("Error deleting course:", error);
        alert("Failed to delete course");
      })
      .finally(() => {
        setShowDeleteModal(false);
        setCourseToDelete(null);
      });
  };

  // View handler
  const handleView = (id) => {
    navigate(`/course/${id}`);
  };

  // Filter courses based on search query
  const filteredCourses = courses.filter(course =>
    (course.title?.toLowerCase().includes(search.toLowerCase()) ||
      course.description?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="container mt-4">
      <h2>Instructor Dashboard</h2>
      
      {/* Course Creation Form */}
      <form className="mb-3" onSubmit={handleCreate}>
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
             <Icon path={mdiBookPlusMultiple} size={1} /> Create
            </button>
          </div>
        </div>
      </form>

      {/* Search Bar */}
      <div className="mb-1">
        <input
          type="text"
          className="form-control"
          placeholder="Search courses..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Pill showing total number of courses */}
      <div className="d-flex justify-content-end mb-3">
        <span
          className="badge rounded-pill text-bg-primary"
          style={{ fontSize: "0.85rem" }}
        >
          Total Courses: {filteredCourses.length}
        </span>
      </div>

      {/* Courses List */}
      <ul className="list-group">
        {filteredCourses.map(course => (
          <li
            key={course.courseId}
            className="list-group-item d-flex justify-content-between align-items-center"
          >
            <div>
              <strong>{course.title}</strong>
              <div className="text-muted small">
                Created: {formatDate(course.createdOn)}
                {areDatesDifferent(course.createdOn, course.updatedOn) && (
                  <span> &nbsp;|&nbsp; Updated: {formatDate(course.updatedOn)}</span>
                )}
              </div>
            </div>
            <div>
              <button
                className="btn btn-primary btn-sm me-2"
                style={{ borderRadius: '25px' }}
                onClick={() => handleView(course.courseId)}
              >
                <Icon path={mdiEye} size={0.6} /> View
              </button>
              <button
                className="btn btn-danger btn-sm"
                style={{ borderRadius: '25px' }}
                onClick={() => handleDelete(course.courseId)}
              >
                <Icon path={mdiDeleteForever} size={0.6} /> Delete
              </button>
            </div>
          </li>
        ))}
        {filteredCourses.length === 0 && (
          <li className="list-group-item text-center text-muted">
            No courses found.
          </li>
        )}
      </ul>

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
                Cancel
              </button>
              <button className="btn btn-danger" onClick={confirmDelete}>
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InstructorDashboard;
