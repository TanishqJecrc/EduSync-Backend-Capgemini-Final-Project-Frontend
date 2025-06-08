import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import Icon from '@mdi/react';
import {
  mdiAccountCircle, mdiSchool, mdiEmail, mdiBookOpen, mdiFileChart, mdiStar, mdiArrowLeft
} from '@mdi/js';
import { formatDate } from '../../utils/dates';

function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    axiosInstance.get('/profile')
      .then(res => setProfile(res.data))
      .catch(() => setError('Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-info" role="status" />
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-secondary py-5 text-danger">{error}</div>;
  }

  return (
    <div className="container py-5">
      <div className="row g-4">
        {/* Sidebar */}
        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-body text-center">
              <div className="mb-3">
                <div className="rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center" style={{ width: 80, height: 80, fontSize: 40 }}>
                  <Icon path={mdiAccountCircle} size={2} />
                </div>
              </div>
              <h4 className="mb-1">{profile.name}</h4>
              <span className={`badge ${profile.role === 'Instructor' ? 'bg-warning' : 'bg-success'} mb-2`}>
                {profile.role}
              </span>
              <div className="mb-2">
                <Icon path={mdiEmail} size={0.8} className="me-1 text-secondary" />
                <span className="text-muted">{profile.email}</span>
              </div>
              <div className="mb-2">
                <Icon path={mdiSchool} size={0.8} className="me-1 text-secondary" />
                <span className="text-muted">
                  Member since: {formatDate(profile.joinDate || profile.createdAt || new Date())}
                </span>
              </div>
              <button className="btn btn-outline-secondary btn-sm mt-3" onClick={() => navigate(-1)}>
                <Icon path={mdiArrowLeft} size={0.8} /> Back
              </button>
            </div>
            <div className="card-footer bg-light">
              <div className="row text-center">
                <div className="col">
                  <div className="small text-muted">Courses</div>
                  <div className="fw-bold">{profile.role === 'Instructor' ? profile.totalCoursesCreated : profile.enrollments?.length || 0}</div>
                </div>
                <div className="col">
                  <div className="small text-muted">Assessments</div>
                  <div className="fw-bold">
                    {profile.role === 'Instructor'
                      ? profile.totalAssessments || (profile.courseStatistics?.reduce((sum, c) => sum + (c.totalAssessments || 0), 0))
                      : profile.recentResults?.length || 0}
                  </div>
                </div>
                <div className="col">
                  <div className="small text-muted">Enrolled</div>
                  <div className="fw-bold">
                    {profile.role === 'Instructor'
                      ? profile.totalEnrollments
                      : profile.enrollments?.length || 0}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-md-8">
          {profile.role === 'Student' ? (
            <StudentDashboard profile={profile} />
          ) : (
            <InstructorDashboard profile={profile} />
          )}
        </div>
      </div>
    </div>
  );
}

function StudentDashboard({ profile }) {
  return (
    <>
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-white">
          <Icon path={mdiBookOpen} size={1} className="me-2 text-primary" />
          <span className="fw-bold">My Enrollments</span>
        </div>
        <div className="card-body p-0">
          <table className="table mb-0">
            <thead className="table-light">
              <tr>
                <th>Course</th>
                <th>Avg. Score</th>
                <th>Enrolled On</th>
              </tr>
            </thead>
            <tbody>
              {profile.enrollments?.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-center text-muted">No enrollments yet.</td>
                </tr>
              )}
              {profile.enrollments?.map(e => (
                <tr key={e.courseId}>
                  <td>{e.courseTitle}</td>
                  <td>
                    <span className="badge bg-info">{e.averageScore ? Math.round(e.averageScore) : 'N/A'}%</span>
                  </td>
                  <td>{formatDate(e.enrollmentDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-header bg-white">
          <Icon path={mdiFileChart} size={1} className="me-2 text-primary" />
          <span className="fw-bold">Recent Results</span>
        </div>
        <div className="card-body p-0">
          <table className="table mb-0">
            <thead className="table-light">
              <tr>
                <th>Assessment</th>
                <th>Course</th>
                <th>Score</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {profile.recentResults?.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center text-muted">No results yet.</td>
                </tr>
              )}
              {profile.recentResults?.map(r => (
                <tr key={r.attemptDate + r.assessmentTitle}>
                  <td>{r.assessmentTitle}</td>
                  <td>{r.courseTitle}</td>
                  <td>
                    <span className="badge bg-success">{r.scorePercentage}%</span>
                  </td>
                  <td>{formatDate(r.attemptDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function InstructorDashboard({ profile }) {
  return (
    <>
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-white">
          <Icon path={mdiBookOpen} size={1} className="me-2 text-warning" />
          <span className="fw-bold">Courses Taught</span>
        </div>
        <div className="card-body p-0">
          <table className="table mb-0">
            <thead className="table-light">
              <tr>
                <th>Course</th>
                <th>Enrollments</th>
                <th>Assessments</th>
                <th>Attempts</th>
                <th>Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {profile.courseStatistics?.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-muted">No courses yet.</td>
                </tr>
              )}
              {profile.courseStatistics?.map(c => (
                <tr key={c.courseId}>
                  <td>{c.title}</td>
                  <td>
                    <span className="badge bg-primary">{c.totalEnrollments}</span>
                  </td>
                  <td>
                    <span className="badge bg-info">{c.totalAssessments}</span>
                  </td>
                  <td>
                    <span className="badge bg-success">{c.totalAttempts ?? '-'}</span>
                  </td>
                  <td>{formatDate(c.lastUpdated)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-header bg-white">
          <Icon path={mdiStar} size={1} className="me-2 text-warning" />
          <span className="fw-bold">Summary</span>
        </div>
        <div className="card-body">
          <div className="row text-center">
            <div className="col-md-4 mb-2">
              <div className="h5 mb-1">{profile.totalCoursesCreated}</div>
              <div className="text-muted small">Courses Created</div>
            </div>
            <div className="col-md-4 mb-2">
              <div className="h5 mb-1">{profile.totalEnrollments}</div>
              <div className="text-muted small">Total Enrollments</div>
            </div>
            <div className="col-md-4 mb-2">
              <div className="h5 mb-1">
                {profile.totalAssessments || (profile.courseStatistics?.reduce((sum, c) => sum + (c.totalAssessments || 0), 0))}
              </div>
              <div className="text-muted small">Total Assessments</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Profile;
