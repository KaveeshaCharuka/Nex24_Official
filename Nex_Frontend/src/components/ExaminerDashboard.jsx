import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react'; 
import { Link, Outlet } from 'react-router-dom';
import api from '../services/api';
import NotificationDropdown from './NotificationDropdown';
import './ExaminerDashboard.css';

function ExaminerDashboard() {
  const navigate = useNavigate();
  const [statsData, setStatsData] = useState({
    activeCourses: 0,
    questionBankSize: 0,
    papersToGrade: 0,
    upcomingExams: 0
  });
  
  const examinerName = localStorage.getItem('userId') || "Examiner";

  useEffect(() => {
    // Assuming examinerId is 1 for now, or fetch based on logged in user
    api.get('/examiner/dashboard/stats?examinerId=1')
      .then(res => setStatsData(res.data))
      .catch(err => console.error("Error fetching stats:", err));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    navigate('/login', { replace: true });
  };

  const stats = [
    { label: "ACTIVE COURSES", value: statsData.activeCourses, color: "#3b82f6" },
    { label: "QUESTION BANK SIZE", value: statsData.questionBankSize, color: "#3b82f6" },
    { label: "PAPERS TO GRADE", value: statsData.papersToGrade, color: "#3b82f6" },
    { label: "UPCOMING EXAMS", value: statsData.upcomingExams, color: "#3b82f6" }
  ];

  return (
    <div className="ex-dash-wrapper">
      
      {/* ================= UPDATED MENU BAR ================= */}
      <nav className="ex-navbar">
        <div className="nav-brand" onClick={() => navigate('/')}>
          <span className="brand-n">N</span> Nex24
        </div>
        <div className="nav-menu-links">
          
          <span className="menu-item" onClick={() => navigate('/examiner-dashboard')}>Dashboard</span>
          <span className="menu-item" onClick={() => navigate('/examiner/courses')}>Courses</span>
          <span className="menu-item" onClick={() => navigate('/examiner/question-bank')}>Question Bank</span>
          <span className="menu-item" onClick={() => navigate('/examiner/exams')}>Exams</span>
          <span className="menu-item" onClick={() => navigate('/examiner/live-monitoring')}>Live Monitoring</span>
          <span className="menu-item" onClick={() => navigate('/examiner/profile')}>Profile</span>
        </div>
        
        {/* 💡 Examiner Portal Badge & Notifications & Logout */}
        <div className="nav-portal-badge" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <NotificationDropdown />
          <span className="portal-btn">Examiner Portal</span>
          
          <button 
            onClick={handleLogout} 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              padding: '6px 12px', 
              backgroundColor: 'rgba(239, 68, 68, 0.1)', 
              color: '#ef4444', 
              border: '1px solid #ef4444', 
              borderRadius: '6px', 
              cursor: 'pointer', 
              fontWeight: 'bold',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#ef4444'; e.currentTarget.style.color = '#fff'; }}
            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.color = '#ef4444'; }}
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </nav>

      {/* Main Content Container */}
      <div className="ex-dash-container">
        
        <header className="ex-dash-welcome">
          <h1>Welcome back, <span className="blue-glow-text">{examinerName}</span></h1>
          <p>Manage your courses, question banks, and monitor live examinations.</p>
        </header>

        <div className="ex-stats-grid">
          {stats.map((stat, idx) => (
            <div key={idx} className="stat-card">
              <span className="stat-label">{stat.label}</span>
              <h2 className="stat-value">{stat.value}</h2>
            </div>
          ))}
        </div>

        <div className="ex-content-layout">
          
          <div className="ex-left-pane">
            <div className="dash-card">
              <h3>Quick Actions ⚡</h3>
              <div className="action-buttons-stack">
                <button className="action-btn" onClick={() => navigate('/question-bank/add')}>
                  Add New Questions
                </button>
                <button className="action-btn" onClick={() => navigate('/live-monitoring')}>
                  Start Live Proctoring
                </button>
                <button className="action-btn secondary-action" onClick={() => navigate('/grades')}>
                  View Student Grades
                </button>
              </div>
            </div>

            <div className="dash-card m-top-25">
              <h3>Recent Notifications</h3>
              <div className="notify-list">
                <div className="notify-item">
                  <span className="notify-dot blue"></span>
                  <p>System update scheduled for tonight at 00:00 UTC.</p>
                </div>
                <div className="notify-item">
                  <span className="notify-dot green"></span>
                  <p>Student STU-084 successfully cleared biometric verification retry.</p>
                </div>
                <div className="notify-item">
                  <span className="notify-dot amber"></span>
                  <p>Review required: CS 2042 Question Bank encryption approval pending.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="ex-right-pane">
            <div className="dash-card performance-card">
              <h3>System Overview & Performance </h3>
              <div className="perf-metrics-container">
                <div className="perf-progress-row">
                  <div className="perf-info">
                    <span>Grading Progress (This Term)</span>
                    <strong>74%</strong>
                  </div>
                  <div className="progress-bar-bg">
                    <div className="progress-bar-fill" style={{ width: '74%' }}></div>
                  </div>
                </div>
                <div className="perf-progress-row">
                  <div className="perf-info">
                    <span>Question Bank Integrity Score</span>
                    <strong>98.5%</strong>
                  </div>
                  <div className="progress-bar-bg">
                    <div className="progress-bar-fill secure-fill" style={{ width: '98.5%' }}></div>
                  </div>
                </div>
                <div className="server-status-section">
                  <h4>Proctoring Node Status</h4>
                  <div className="server-grid">
                    <div className="server-node">
                      <span className="pulse-dot green"></span>
                      <div><h5>Main AI Proctor Node</h5><p>Operational (Ping: 14ms)</p></div>
                    </div>
                    <div className="server-node">
                      <span className="pulse-dot green"></span>
                      <div><h5>Biometric Secure Vault</h5><p>Encrypted & Active</p></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default ExaminerDashboard;