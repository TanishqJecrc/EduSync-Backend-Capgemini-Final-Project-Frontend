import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import Icon from "@mdi/react";
import { mdiAccountTie, mdiEye, mdiBookSearch, mdiPlayNetwork } from "@mdi/js";
import { useNavigate } from "react-router-dom";
import { formatDate, areDatesDifferent } from "../../utils/dates";

function StudentDashboard() {
  const [enrollments, setEnrollments] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    axiosInstance
      .get("/MyEnrollments")
      .then((res) => {
        if (res.data && Array.isArray(res.data)) {
          // Merge enrollment-level fields into course object for easier access
          const enrolledCourses = res.data.map(e => ({
            ...e.course,
            enrolledOn: e.enrolledOn,
            enrollmentId: e.enrollmentId,
            courseId: e.courseId, // Use the top-level courseId for navigation
          }));
          setEnrollments(enrolledCourses);
        }
      })
      .catch(() => setEnrollments([]))
      .finally(() => setLoading(false));
  }, []);

  const filteredCourses = enrollments.filter((course) =>
    course.title?.toLowerCase().includes(search.toLowerCase())
  );

  const chunkArray = (arr, size) =>
    arr.length > 0
      ? [arr.slice(0, size), ...chunkArray(arr.slice(size), size)]
      : [];

  return (
    <div className="container mt-4">
      <h2 className="mb-4">My Enrolled Courses</h2>

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
              placeholder="Search enrolled courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <span className="input-group-text bg-light">
              <span className="badge rounded-pill bg-primary">
                Enrolled Courses: {filteredCourses.length}
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
        <div className="text-center text-muted">No enrolled courses found.</div>
      )}

      {/* Courses Grid */}
      {!loading &&
        chunkArray(filteredCourses, 4).map((row, rowIdx) => (
          <div className="row mb-4" key={rowIdx}>
            {row.map((course) => (
              <div className="col-md-3 d-flex" key={course.enrollmentId}>
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
                      <div>
                        Enrolled On:{" "}
                        {course.enrolledOn
                          ? formatDate(course.enrolledOn)
                          : "Unknown"}
                      </div>
                      <div>
                        Last Updated:{" "}
                        {course.updatedOn
                          ? formatDate(course.updatedOn)
                          : "Unknown"}
                      </div>
                    </div>
                  </div>
                  <div className="card-footer text-body-secondary">
                    <button
                      className="btn btn-primary w-100"
                      onClick={() => navigate(`/${course.courseId}/ViewModule`)}
                    >
                      <Icon path={mdiEye} size={0.8} /> View Course
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
    </div>
  );
}

export default StudentDashboard;
