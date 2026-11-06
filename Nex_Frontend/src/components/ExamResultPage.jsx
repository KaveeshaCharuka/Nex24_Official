import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './ExamResultPage.css'; // We will create this CSS file next

function ExamResultPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Get score from location state, default to N/A if missing
  const { score, examTitle } = location.state || { score: 'N/A', examTitle: 'Exam' };

  const handleContinue = () => {
    navigate('/student-dashboard');
  };

  return (
    <div className="exam-result-wrapper">
      <div className="result-card">
        <div className="result-header">
          <span className="celebration-icon">🎉</span>
          <h2>Exam Completed!</h2>
        </div>
        
        <div className="result-body">
          <p className="exam-title-display">{examTitle}</p>
          <div className="score-circle">
            <span className="score-text">{score}</span>
            <span className="score-label">Final Score</span>
          </div>
          <p className="success-message">
            Your exam has been successfully submitted and recorded.
          </p>
        </div>

        <div className="result-footer">
          <button className="continue-btn" onClick={handleContinue}>
            Continue to Dashboard ➔
          </button>
        </div>
      </div>
    </div>
  );
}

export default ExamResultPage;
