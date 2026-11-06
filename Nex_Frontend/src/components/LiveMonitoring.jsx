import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './LiveMonitoring.css';

function LiveMonitoring() {
  const navigate = useNavigate();
  const [activeStudents, setActiveStudents] = useState([]);
  const [stats, setStats] = useState({ total: 0, flags: 0, exams: 0 });

  useEffect(() => {
    const fetchLive = async () => {
      try {
        const res = await api.get('/exams/live-sessions');
        const students = res.data;
        setActiveStudents(students);
        
        let flags = 0;
        let uniqueExams = new Set();
        students.forEach(s => {
          flags += s.flags;
          uniqueExams.add(s.examId);
        });
        setStats({ total: students.length, flags, exams: uniqueExams.size });
      } catch (err) {
        console.error("Live monitoring fetch error:", err);
      }
    };
    
    fetchLive();
    const interval = setInterval(fetchLive, 5000); // 5 seconds
    return () => clearInterval(interval);
  }, []);

  // Screen Modal States
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [streamData, setStreamData] = useState({ screenBase64: '', camBase64: '' });

  useEffect(() => {
    let interval = null;
    if (selectedStudent) {
      const fetchStream = async () => {
        try {
          const res = await api.get(`/exams/live-stream/${selectedStudent.index}`);
          setStreamData(res.data);
        } catch(e) { }
      };
      fetchStream();
      interval = setInterval(fetchStream, 1500); // Maximize speed, 1.5s refresh
    }
    return () => { if(interval) clearInterval(interval); };
  }, [selectedStudent]);

  return (
    <div className="live-monitor-wrapper">
      <div className="st-top-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <button className="back-dash-btn" style={{ background: '#111c32', color: '#94a3b8', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '8px 18px', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }} onClick={() => navigate('/examiner-dashboard')}>
          ← Back to Dashboard
        </button>
        <div className="st-brand-title" style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff' }}>
          <span className="brand-n" style={{ color: '#3b82f6' }}>N</span> Nex24 <span className="divider" style={{ color: '#334155', margin: '0 8px' }}>|</span> <span className="sub-title" style={{ color: '#3b82f6' }}>Examiner Portal</span>
        </div>
      </div>

      {/* Header Section */}
      <div className="monitor-header">
        <h2>
          Live <span className="text-gradient">Exam Monitoring</span> 
          <span className="live-indicator"><span className="dot"></span> LIVE</span>
        </h2>
        <p>Real-time proctoring, student status tracking, and academic integrity management.</p>
      </div>

      {/* Live Stats Row */}
      <div className="monitor-stats-grid">
        <div className="m-stat-box">
          <span className="m-label">Active Students</span>
          <span className="m-count blue">{stats.total}</span>
        </div>
        <div className="m-stat-box">
          <span className="m-label">Flagged Alerts</span>
          <span className="m-count orange">{stats.flags}</span>
        </div>
        <div className="m-stat-box">
          <span className="m-label">Ongoing Exams</span>
          <span className="m-count green">{stats.exams}</span>
        </div>
      </div>

      {/* Main Monitoring Card */}
      <div className="monitor-main-card">
        <div className="monitor-card-header">
          <h3>Active Candidate Stream</h3>
          <span className="refresh-tag">Auto-refreshing every 5s...</span>
        </div>

        {/* Live Students Table */}
        <div className="monitor-table-container">
          <table className="monitor-custom-table">
            <thead>
              <tr>
                <th>Student / Index</th>
                <th>Current Exam</th>
                <th>Time Remaining</th>
                <th>Biometric Identity</th>
                <th>Tab Switches / Flags</th>
                <th>Proctor Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {activeStudents.map(student => (
                <tr key={student.id} className={`row-status-${(student.status || '').toLowerCase().replace(/\s+/g, '-')}`}>
                  <td>
                    <div className="student-name-cell">{student.name}</div>
                    <span className="student-index-cell">{student.index}</span>
                  </td>
                  <td className="exam-cell">{student.exam}</td>
                  <td className="time-cell">{student.timeLeft}</td>
                  <td>
                    {student.impersonationDetected ? (
                      <span className="bio-status-badge bio-impersonation" title="Facial biometrics do not match registered student profile!">
                        🚨 Impersonation Alert
                      </span>
                    ) : (
                      <span className="bio-status-badge bio-verified" title="Biometric identity matches registered student profile">
                        🛡️ Verified Match
                      </span>
                    )}
                  </td>
                  <td>
                    <span className={`flag-count ${student.flags > 0 ? 'has-flags' : ''}`}>
                      {student.flags} Flags
                    </span>
                  </td>
                  <td>
                    <span className={`proctor-badge ${(student.status || '').toLowerCase().replace(/\s+/g, '-')}`}>
                      {student.status}
                    </span>
                  </td>
                  <td>
                    <div className="monitor-actions">
                      <button className="mon-btn view" title="View Student Screen" onClick={() => setSelectedStudent(student)}>🖥️ Screen</button>
                      <button className="mon-btn warn" title="Send Warning Route">⚠️ Warn</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Stream Modal */}
      {selectedStudent && (
        <div className="modal-overlay">
          <div className="modal-content large-modal">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ margin: 0 }}>Live Stream: {selectedStudent.name}</h3>
              {selectedStudent.impersonationDetected ? (
                <span className="bio-status-badge bio-impersonation">
                  🚨 Candidate Impersonation Detected
                </span>
              ) : (
                <span className="bio-status-badge bio-verified">
                  🛡️ Biometric Identity Verified
                </span>
              )}
            </div>
            
            <div style={{ display: 'flex', gap: '20px', marginTop: '15px' }}>
              <div style={{ flex: 2, background: '#111', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                <h4 style={{ color: '#fff', marginBottom: '10px' }}>Desktop Screen</h4>
                {streamData.screenBase64 ? (
                   <img src={streamData.screenBase64} alt="Screen" style={{ width: '100%', maxHeight: '400px', objectFit: 'contain' }} />
                ) : (
                   <p style={{ color: 'gray' }}>No Screen Signal...</p>
                )}
              </div>
              <div style={{ flex: 1, background: '#111', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                <h4 style={{ color: '#fff', marginBottom: '10px' }}>Webcam Feed</h4>
                {streamData.camBase64 ? (
                   <img src={streamData.camBase64} alt="Camera" style={{ width: '100%', borderRadius: '8px' }} />
                ) : (
                   <p style={{ color: 'gray' }}>No Cam Signal...</p>
                )}
              </div>
            </div>

            <div className="modal-actions" style={{ marginTop: '20px' }}>
              <button type="button" onClick={() => setSelectedStudent(null)} className="cancel-btn">Close View</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default LiveMonitoring;