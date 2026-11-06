import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './GradesPage.css';

function GradesPage() {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/results/my-results')
      .then(response => {
        setResults(response.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching grades:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div className="nex-page-wrapper">
      <div className="st-top-bar">
        <button className="back-dash-btn" onClick={() => navigate('/student-dashboard')}>
          ← Back to Dashboard
        </button>
      </div>
      <h3>Loading Your Grades... ⏳</h3>
    </div>
  );

  return (
    <div className="nex-page-wrapper">
      <div className="st-top-bar" style={{ padding: '0 0 25px 0' }}>
        <button className="back-dash-btn" onClick={() => navigate('/student-dashboard')}>
          ← Back to Dashboard
        </button>
        <div className="st-brand-title">
          <span className="brand-n">N</span> Nex24 <span className="divider">|</span> <span className="sub-title">My Grades</span>
        </div>
      </div>

      <div className="nex-header">
        <h2>My <span className="text-gradient">Grades</span></h2>
        <p>Keep track of your academic performance and verified examination results.</p>
      </div>

      <div className="nex-card">
        <div className="card-header-title">Official Examination Results</div>
        <table className="nex-table">
          <thead>
            <tr>
              <th>Exam ID</th>
              <th>Score</th>
              <th>Submitted Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {results.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                  No graded examination results found yet.
                </td>
              </tr>
            ) : (
              results.map((res, idx) => (
                <tr key={res.id || idx}>
                  <td style={{ fontWeight: 'bold' }}>EX-{res.examId}</td>
                  <td style={{ fontSize: '15px', color: '#22c55e', fontWeight: 'bold' }}>
                    {res.score} / {res.totalQuestions || 100}
                  </td>
                  <td>{res.submittedAt ? new Date(res.submittedAt).toLocaleString() : 'N/A'}</td>
                  <td>
                    <span className="badge badge-green">
                      COMPLETED
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default GradesPage;