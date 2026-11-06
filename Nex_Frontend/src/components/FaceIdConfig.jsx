import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link, Outlet } from 'react-router-dom';
import './FaceIdConfig.css';

function FaceIdConfig() {
  const navigate = useNavigate();

  // Settings State
  const [threshold, setThreshold] = useState(65);
  const [liveness, setLiveness] = useState(true);
  const [autoFlag, setAutoFlag] = useState(true);

  // Retrain State
  const [isRetraining, setIsRetraining] = useState(false);
  const [progress, setProgress] = useState(0);

  // Mock Logs Data
  const [logs] = useState([
    { id: "LOG-01", student: "Kasun Perera", exam: "Software Engineering", issue: "Face Mismatch", time: "10:24 AM", severity: "High" },
    { id: "LOG-02", student: "Amali Perera", exam: "Database Systems", issue: "Multiple Faces Detected", time: "09:15 AM", severity: "Critical" },
    { id: "LOG-03", student: "Sahan Fernando", exam: "Networking", issue: "No Face Detected", time: "08:45 AM", severity: "Medium" },
  ]);

  const handleRetrain = () => {
    setIsRetraining(true);
    setProgress(0);
    
    // Simulate training progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setIsRetraining(false), 500);
          return 100;
        }
        return prev + 5;
      });
    }, 200);
  };

  return (
    <div className="fic-wrapper">
      {/* Top Bar */}
      <div className="fic-top-bar">
        <button className="fic-back-btn" onClick={() => navigate('/admin-dashboard')}>
          ⬅ Back to Dashboard
        </button>
        <div className="fic-title">N <span className="logo-text">Nex24</span> | AI Face Config</div>
      </div>

      <div className="fic-container">
        <div className="fic-header">
          <h2>Face Recognition <span className="neon-blue">AI Settings</span></h2>
          <p>Configure anti-cheat strictness, retrain models, and monitor security logs.</p>
        </div>

        <div className="fic-grid">
          
          {/* Left Column: Controls & Retraining */}
          <div className="fic-left-col">
            
            {/* Core Settings */}
            <div className="fic-card">
              <h3>Security Parameters</h3>
              
              <div className="fic-setting-item">
                <div className="fic-setting-info">
                  <label>Match Accuracy Threshold ({threshold}%)</label>
                  <p>Lower values are stricter. Below 50% may cause false positives.</p>
                </div>
                <input 
                  type="range" 
                  min="40" max="95" step="5"
                  value={threshold} 
                  onChange={(e) => setThreshold(e.target.value)}
                  className="fic-slider"
                />
              </div>

              <div className="fic-setting-item toggle-row">
                <div className="fic-setting-info">
                  <label>Liveness Detection</label>
                  <p>Requires students to blink/move to prevent photo spoofing.</p>
                </div>
                <button 
                  className={`fic-toggle-btn ${liveness ? 'active' : ''}`}
                  onClick={() => setLiveness(!liveness)}
                >
                  {liveness ? 'ON' : 'OFF'}
                </button>
              </div>

              <div className="fic-setting-item toggle-row">
                <div className="fic-setting-info">
                  <label>Auto-Flagging</label>
                  <p>Automatically suspend exam if face is missing for &gt;30s.</p>
                </div>
                <button 
                  className={`fic-toggle-btn ${autoFlag ? 'active' : ''}`}
                  onClick={() => setAutoFlag(!autoFlag)}
                >
                  {autoFlag ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>

            {/* Retrain Model */}
            <div className="fic-card">
              <h3>Model Training</h3>
              <div className="fic-stats-row">
                <div className="fic-stat">
                  <span>Total Profiles Sync:</span>
                  <strong>1,245 / 1,245</strong>
                </div>
                <div className="fic-stat">
                  <span>Last Trained:</span>
                  <strong>Today, 02:00 AM</strong>
                </div>
              </div>

              {!isRetraining ? (
                <button className="fic-train-btn" onClick={handleRetrain}>
                  ⚙️ Retrain AI Model
                </button>
              ) : (
                <div className="fic-progress-container">
                  <div className="fic-progress-info">
                    <span>Extracting Face Embeddings...</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="fic-progress-bar-bg">
                    <div className="fic-progress-bar-fill" style={{ width: `${progress}%` }}></div>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Alert Logs */}
          <div className="fic-right-col">
            <div className="fic-card">
              <div className="fic-card-header">
                <h3>Live Security Alerts</h3>
                <button className="fic-clear-btn">Clear Logs</button>
              </div>
              <p className="fic-card-sub">Recent face recognition flags during active sessions.</p>

              <div className="fic-logs-list">
                {logs.map((log, index) => (
                  <div className="fic-log-item" key={index}>
                    <div className="fic-log-icon">
                      {log.severity === 'Critical' ? '🔴' : log.severity === 'High' ? '🟠' : '🟡'}
                    </div>
                    <div className="fic-log-details">
                      <div className="fic-log-title">{log.issue}</div>
                      <div className="fic-log-desc">{log.student} • {log.exam}</div>
                    </div>
                    <div className="fic-log-time">{log.time}</div>
                  </div>
                ))}
              </div>
              <button className="fic-view-all-btn">View All Historical Logs</button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default FaceIdConfig;