import React, { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import Icon from '@mdi/react';
import { mdiBookOpenPageVariant, mdiAccountGroup, mdiFileDocumentEdit, mdiStarCircle } from '@mdi/js';

export default function InstructorAnalytics() {
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    axiosInstance.get('/Instructor/Analytics')
      .then(res => {
        setAnalytics(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load analytics.');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="container my-5 text-center">
        <div className="spinner-border text-primary" role="status" />
        <div className="mt-2">Loading analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container my-5">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  if (!analytics.length) {
    return (
      <div className="container my-5 text-center text-muted">
        <Icon path={mdiBookOpenPageVariant} size={1.5} className="mb-2 text-secondary" />
        <div>No courses found.</div>
      </div>
    );
  }

  return (
    <div className="container my-4">
      <h3 className="mb-4 d-flex align-items-center">
        <Icon path={mdiStarCircle} size={1.1} className="me-2 text-warning" />
        My Course Analytics
      </h3>
      <div className="table-responsive">
        <table className="table table-striped align-middle">
          <thead className="table-light">
            <tr>
              <th><Icon path={mdiBookOpenPageVariant} size={0.8} className="me-1" />Course</th>
              <th><Icon path={mdiAccountGroup} size={0.8} className="me-1" />Students</th>
              <th><Icon path={mdiFileDocumentEdit} size={0.8} className="me-1" />Assessments</th>
              <th><Icon path={mdiStarCircle} size={0.8} className="me-1" />Avg. Score</th>
            </tr>
          </thead>
          <tbody>
            {analytics.map(course => (
              <tr key={course.courseId}>
                <td>{course.title}</td>
                <td>{course.totalStudents}</td>
                <td>{course.totalAssessments}</td>
                <td>
                  <span className="badge bg-success">
                    {course.averageScore ? course.averageScore.toFixed(2) : '0.00'}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
