import Icon from '@mdi/react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { mdiArrowLeft, mdiEmoticonSadOutline } from '@mdi/js';

export default function NotFound() {
   const navigate = useNavigate();
  return (
    <div className="container mt-5 d-flex flex-column align-items-center justify-content-center" style={{ minHeight: "60vh" }}>
      <Icon path={mdiEmoticonSadOutline} size={4} color="#6c757d" />
      <h1 className="display-4 mt-3 mb-2 text-danger fw-bold">404</h1>
      <h2 className="mb-3 text-secondary">Page Not Found</h2>
      <p className="lead text-muted mb-4 text-center" style={{ maxWidth: 400 }}>
        Oops! The page you are looking for doesn't exist, has been moved, or is temporarily unavailable.
      </p>
      <button className="btn btn-primary btn-lg rounded-pill shadow" onClick={() => navigate(-1)}>
        <Icon path={mdiArrowLeft} size={1}  />Go Back
      </button>
    </div>
  );
}