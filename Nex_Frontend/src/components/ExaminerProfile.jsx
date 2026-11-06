import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './StudentProfile.css';

function ExaminerProfile() {
  const navigate = useNavigate();
  const username = localStorage.getItem('userId');

  const [examiner, setExaminer] = useState({
    name: "Loading...",
    role: "Examiner",
    email: "loading...",
    phone: "",
    profileImage: null
  });

  const [passwords, setPasswords] = useState({ current: "", newPass: "", confirmPass: "" });
  const [message, setMessage] = useState('');
  const [passMessage, setPassMessage] = useState('');

  useEffect(() => {
    api.get(`/user/profile/${username}`)
      .then(res => {
        if(res.data) setExaminer(res.data);
      })
      .catch(err => console.error(err));
  }, [username]);

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwords.newPass !== passwords.confirmPass) {
      setPassMessage("❌ Passwords do not match!");
      return;
    }
    try {
      await api.put(`/user/password/${username}`, {
        currentPass: passwords.current,
        newPass: passwords.newPass
      });
      setPassMessage("✅ Password updated successfully!");
      setPasswords({ current: "", newPass: "", confirmPass: "" });
    } catch(err) {
      setPassMessage("❌ " + (err.response?.data || "Failed to update password."));
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/user/profile/${username}`, {
        phone: examiner.phone
      });
      setMessage("✅ Profile updated successfully!");
    } catch(err) {
      setMessage("❌ Failed to update profile.");
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result;
        setExaminer({...examiner, profileImage: base64String});
        try {
          await api.put(`/user/profile/${username}`, {
            profileImage: base64String
          });
          setMessage("✅ Profile image updated!");
        } catch(err) {
          setMessage("❌ Failed to update image.");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="st-account-page">
      <div className="st-top-bar">
        <button className="back-dash-btn" onClick={() => navigate('/examiner-dashboard')}>
          ← Back to Dashboard
        </button>
        <div className="st-brand-title">
          <span className="brand-n">N</span> Nex24 <span className="divider">|</span> <span className="sub-title">Examiner Settings</span>
        </div>
      </div>

      <div className="st-account-container">
        <div className="st-account-heading">
          <h1>Examiner <span className="blue-highlight">Account</span></h1>
          <p>Manage your examiner account details and security credentials.</p>
        </div>

        <div className="st-account-grid">
          <div className="st-left-column">
            <div className="st-card st-profile-card">
              
              <div className="st-avatar-circle-glow" style={{ position: 'relative' }}>
                {examiner.profileImage ? (
                  <img src={examiner.profileImage} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div className="st-avatar-inside">{examiner.name.charAt(0).toUpperCase()}</div>
                )}
                <label style={{ position: 'absolute', bottom: 0, right: 0, background: '#3b82f6', padding: '5px', borderRadius: '50%', cursor: 'pointer' }}>
                  ✏️
                  <input type="file" accept="image/*" hidden onChange={handleImageUpload} />
                </label>
              </div>

              <h2 className="st-user-display-name">{examiner.name}</h2>
              <span className="st-role-badge" style={{background: '#8b5cf6', color: '#fff'}}>Official Examiner</span>

              <form onSubmit={handleProfileUpdate} className="st-info-fields-list" style={{width: '100%', textAlign: 'left', marginTop: '20px'}}>
                <div className="st-field-item">
                  <label>Email Address</label>
                  <p>{examiner.email}</p>
                </div>
                <div className="st-field-item" style={{display: 'flex', flexDirection: 'column'}}>
                  <label>Phone Number</label>
                  <input 
                    type="text" 
                    value={examiner.phone} 
                    onChange={e => setExaminer({...examiner, phone: e.target.value})}
                    style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc', background: 'rgba(255,255,255,0.1)', color: 'white', marginTop: '5px' }}
                  />
                </div>
                {message && <div style={{ color: message.includes('✅') ? '#4ade80' : '#f87171', fontSize: '14px', marginTop: '10px' }}>{message}</div>}
                <button type="submit" className="st-edit-profile-btn" style={{marginTop: '15px'}}>
                  Save Profile Info
                </button>
              </form>
            </div>
          </div>

          <div className="st-right-column">
            <div className="st-card st-security-card">
              <h3>Security & Password</h3>
              <form onSubmit={handlePasswordUpdate} className="st-form-inputs">
                <div className="st-input-box">
                  <label>Current Password</label>
                  <input type="password" value={passwords.current} onChange={(e) => setPasswords({...passwords, current: e.target.value})} required />
                </div>
                <div className="st-input-box">
                  <label>New Password</label>
                  <input type="password" value={passwords.newPass} onChange={(e) => setPasswords({...passwords, newPass: e.target.value})} required />
                </div>
                <div className="st-input-box">
                  <label>Confirm New Password</label>
                  <input type="password" value={passwords.confirmPass} onChange={(e) => setPasswords({...passwords, confirmPass: e.target.value})} required />
                </div>
                {passMessage && <div style={{ color: passMessage.includes('✅') ? '#4ade80' : '#f87171', fontSize: '14px', marginBottom: '10px' }}>{passMessage}</div>}
                <button type="submit" className="st-submit-password-btn">Update Password</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExaminerProfile;
