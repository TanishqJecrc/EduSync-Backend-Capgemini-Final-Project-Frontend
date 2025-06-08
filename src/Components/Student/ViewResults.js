import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import Icon from '@mdi/react';
import { mdiFileChart, mdiArrowLeft, mdiChartBox } from '@mdi/js';
import { formatDate } from '../../utils/dates';

function ViewResults() {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await axiosInstance.get('/student/results');
        setResults(response.data);
      } catch (err) {
        setError('Failed to load results');
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  if (loading) return <div className="text-center my-4"><div className="spinner-border" /></div>;
  if (error) return <div className="alert alert-danger my-4">{error}</div>;

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
          <Icon path={mdiArrowLeft} size={0.8} /> Back
        </button>
        <h3 className="mb-0">
          <Icon path={mdiChartBox} size={1} className="me-2 text-primary" />
          Assessment Results
        </h3>
        <div style={{ width: '100px' }} />
      </div>

      <div className="card shadow-sm">
        <div className="card-header bg-white">
          <Icon path={mdiFileChart} size={1} className="me-2 text-success" />
          <span className="fw-bold">All Attempts</span>
        </div>
        <div className="card-body p-0">
          <table className="table mb-0">
            <thead className="table-light">
              <tr>
                <th>Assessment</th>
                <th>Course</th>
                <th>Instructor</th>
                <th>Score</th>
                <th>Attempt</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {results.map(result => (
                <tr key={result.resultId}>
                  <td>{result.assessmentTitle}</td>
                  <td>{result.courseTitle}</td>
                  <td>{result.instructorName}</td>
                  <td>
                    <span className="badge bg-primary">
                      {result.score}/{result.maximumScore}
                    </span>
                  </td>
                  <td>#{result.attemptCount}</td>
                  <td>{formatDate(result.attemptedOn)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ViewResults;
