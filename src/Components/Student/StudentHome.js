import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import Icon from "@mdi/react";
import { mdiAccountTie, mdiEye, mdiBookSearch, mdiPlayNetwork, mdiNotebookPlus } from "@mdi/js";
import { useNavigate } from "react-router-dom";
import { formatDate, areDatesDifferent } from "../../utils/dates";

function StudentHome() {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    axiosInstance
      .get("/AllCourses")
      .then((res) => setCourses(Array.isArray(res.data) ? res.data : []))
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, []);

  const filteredCourses = courses.filter((course) =>
    course.title?.toLowerCase().includes(search.toLowerCase())
  );

  const chunkArray = (arr, size) =>
    arr.length > 0
      ? [arr.slice(0, size), ...chunkArray(arr.slice(size), size)]
      : [];

  const handleEnroll = (courseId) => {
    axiosInstance
      .post(`/Course/${courseId}/Enroll`)
      .then((response) => {
        if (response.status === 200 || response.status === 201) {
          alert("Enrolled successfully!");
        } else {
          alert("Enrollment failed. Please try again.");
        }
      })
      .catch((error) => {
        const message = error.response?.data?.message || "An error occurred during enrollment.";
        alert(`Error: ${message}`);
      });
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Explore Courses</h2>

      {/* Search Bar */}
      <div className="mb-4 row justify-content-center align-items-center">
        <div className="col-md-6">
          <div className="input-group">
            <label className="input-group-text bg-light">
              <Icon path={mdiBookSearch} size={0.8} /> Search
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <span className="input-group-text bg-light">
              <span className="badge rounded-pill bg-primary">
                Total Courses: {filteredCourses.length}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredCourses.length === 0 && (
        <div className="text-center text-muted">No courses found.</div>
      )}

      {/* Courses Grid */}
      {!loading &&
        chunkArray(filteredCourses, 4).map((row, rowIdx) => (
          <div className="row mb-4" key={rowIdx}>
            {row.map((course) => (
              <div className="col-md-3 d-flex" key={course.courseId}>
                <div className="card d-flex flex-column shadow-sm mb-4 w-100">
                  <div className="card-header d-flex justify-content-between">
                    <h5 className="card-title">{course.title}</h5>
                    <Icon path={mdiPlayNetwork} size={1} />
                  </div>
                  <div className="card-body d-flex flex-column">
                    <div className="mb-3">
                      <p className="card-text">
                        <Icon path={mdiAccountTie} size={0.8} />
                        <span className="text-muted">Instructor:</span>{" "}
                        {course.instructorName || "Unknown"}
                      </p>
                    </div>
                    <div className="mb-2">
                      <span className="badge rounded-pill bg-primary">
                        {course.courseContents?.length || 0} Modules
                      </span>
                    </div>
                    <div className="small text-muted mb-2">
                      <div>Created: {formatDate(course.createdOn)}</div>
                      {areDatesDifferent(course.createdOn, course.updatedOn) && (
                        <div>Updated: {formatDate(course.updatedOn)}</div>
                      )}
                    </div>
                  </div>
                  <div className="card-footer text-body-secondary">
                    <div className="d-flex justify-content-between">
                      <button
                        className="btn btn-outline-primary"
                        onClick={() => navigate(`/ViewModule/${course.courseId}`)}
                      >
                        <Icon path={mdiEye} size={0.8} /> View
                      </button>
                      <button
                        className="btn btn-success"
                        onClick={() => handleEnroll(course.courseId)}
                      >
                        <Icon path={mdiNotebookPlus} size={0.8} /> Enroll
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
    </div>
  );
}

export default StudentHome;
