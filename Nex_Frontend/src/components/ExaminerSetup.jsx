import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import './InstituteRegister.css'; 

function ExaminerSetup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // URL එකෙන් එන username එක auto-fill කරගැනීම
  const urlUsername = searchParams.get('username') || '';

  const [tempUsername, setTempUsername] = useState(urlUsername);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (newPassword !== confirmPassword) {
      setMessage('❌ Passwords do not match!');
      return;
    }

    try {
      const response = await api.post('/auth/setup-examiner', {
        tempUsername,
        otp,
        newPassword
      });

      setMessage('✅ Account setup successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (error) {
      setMessage(`❌ ${error.response?.data || 'Setup failed. Check your OTP.'}`);
    }
  };

  return (
    <div className="ir-wrapper">
      <nav className="ir-topbar">
        <div className="ir-brand">
          <span className="brand-n">N</span> Nex24 <span className="title-divider">|</span> Examiner Setup
        </div>
      </nav>

      <div className="ir-container" style={{ marginTop: '60px' }}>
        <div className="ir-card">
          <div className="ir-header">
            <h2>Set Up Examiner Account </h2>
            <p className="ir-sub">Enter your temporary credentials and create a new permanent password.</p>
          </div>

          <form onSubmit={handleSubmit} className="ir-form">
            
            <div className="ir-form-row">
              <div className="ir-input-group">
                <label>Temporary Username</label>
                <input 
                  type="text" 
                  value={tempUsername}
                  onChange={(e) => setTempUsername(e.target.value)}
                  className="ir-input"
                  required 
                />
              </div>

              <div className="ir-input-group">
                <label>Activation OTP</label>
                <input 
                  type="text" 
                  placeholder="e.g. 123456" 
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="ir-input"
                  required 
                />
              </div>
            </div>

            <div className="ir-form-row">
              <div className="ir-input-group">
                <label>New Permanent Password</label>
                <input 
                  type="password" 
                  placeholder="Create strong password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="ir-input"
                  required 
                />
              </div>

              <div className="ir-input-group">
                <label>Confirm Password</label>
                <input 
                  type="password" 
                  placeholder="Re-enter password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="ir-input"
                  required 
                />
              </div>
            </div>

            {message && (
              <div style={{ padding: '10px', marginBottom: '15px', borderRadius: '5px', backgroundColor: message.includes('✅') ? '#d1fae5' : '#fee2e2', color: message.includes('✅') ? '#065f46' : '#991b1b', textAlign: 'center', fontWeight: 'bold' }}>
                {message}
              </div>
            )}

            <button type="submit" className="ir-btn-primary">
              Complete Setup & Go to Login
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}

export default ExaminerSetup;