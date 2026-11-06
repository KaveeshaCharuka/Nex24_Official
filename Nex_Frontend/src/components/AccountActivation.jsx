import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AccountActivation.css';

function AccountActivation() {
  const navigate = useNavigate();

  // Role: 'student' or 'examiner'
  const [role, setRole] = useState('student');

  // Form States
  const [tempUsername, setTempUsername] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // AI Face Scan States (For Student)
  const [isScanning, setIsScanning] = useState(false);
  const [faceVerified, setFaceVerified] = useState(false);
  const [scanStatus, setScanStatus] = useState('Ready for Camera Scan');

  // Handle Face Scan Simulation with Camera View
  const handleFaceScan = () => {
    setIsScanning(true);
    setScanStatus("Accessing Web Camera...");

    setTimeout(() => {
      setScanStatus("Extracting Facial Biometrics...");
    }, 1500);

    setTimeout(() => {
      setScanStatus("Comparing with Institute Reference Photo...");
    }, 3000);

    setTimeout(() => {
      setIsScanning(false);
      setFaceVerified(true);
      setScanStatus("AI Face Match 100% Successful! ✅");
    }, 4500);
  };

  // Handle Form Submit
  const handleSubmit = (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    if (role === 'student' && !faceVerified) {
      alert("Please complete the AI Face Verification before activating your student account!");
      return;
    }

    setIsActivated(true);
  };

  const [isActivated, setIsActivated] = useState(false);

  return (
    <div className="aa-wrapper">
      
      {/* Top Navbar */}
      <nav className="aa-topbar">
        <div className="aa-brand">
          <span className="brand-n">N</span> Nex24 <span className="title-divider">|</span> Account Activation
        </div>
      </nav>

      <div className="aa-container">
        
        {!isActivated ? (
          <div className="aa-card">
            <h2>Account Activation </h2>
            <p className="aa-sub">Select your account type and fill in your activation details.</p>

            {/* Role Switcher */}
            <div className="role-switcher">
              <button 
                type="button" 
                className={`role-btn ${role === 'student' ? 'active' : ''}`}
                onClick={() => {
                  setRole('student');
                  setFaceVerified(false);
                }}
              >
                 Student Account
              </button>
              <button 
                type="button" 
                className={`role-btn ${role === 'examiner' ? 'active' : ''}`}
                onClick={() => {
                  setRole('examiner');
                }}
              >
                 Examiner Account
              </button>
            </div>

            <form onSubmit={handleSubmit} className="aa-form">
              
              {/* Row 1: Temp Username & OTP */}
              <div className="aa-form-row">
                <div className="aa-input-group">
                  <label>Temporary Username</label>
                  <input 
                    type="text" 
                    placeholder={role === 'student' ? "e.g. TEMP-STU-992" : "e.g. TEMP-EXM-102"} 
                    value={tempUsername}
                    onChange={(e) => setTempUsername(e.target.value)}
                    className="aa-input"
                    required 
                  />
                </div>

                <div className="aa-input-group">
                  <label>OTP Code (from Email)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 849201" 
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="aa-input"
                    required 
                  />
                </div>
              </div>

              {/* Student Only: Visual Camera & Face Scan Section */}
              {role === 'student' && (
                <div className="aa-camera-section">
                  <div className="camera-section-title">
                    <span>AI Biometric Identity Verification </span>
                    <small>Match live face with institute reference photo</small>
                  </div>

                  <div className="aa-webcam-box">
                    <div className="aa-camera-feed">
                      <div className="camera-avatar">👤</div>
                      {isScanning && <div className="aa-scan-line"></div>}
                    </div>

                    <div className="camera-controls">
                      <span className={`scan-status-text ${faceVerified ? 'verified' : ''}`}>
                        {scanStatus}
                      </span>

                      {!faceVerified ? (
                        <button 
                          type="button" 
                          onClick={handleFaceScan} 
                          className="aa-btn-scan"
                          disabled={isScanning}
                        >
                          {isScanning ? "Scanning..." : "Start Face Scan "}
                        </button>
                      ) : (
                        <span className="verified-tag">✔️ Verified</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Row 2: New Password & Confirm Password */}
              <div className="aa-form-row">
                <div className="aa-input-group">
                  <label>New Permanent Password</label>
                  <input 
                    type="password" 
                    placeholder="Enter new password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="aa-input"
                    required 
                  />
                </div>

                <div className="aa-input-group">
                  <label>Confirm Password</label>
                  <input 
                    type="password" 
                    placeholder="Re-enter new password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="aa-input"
                    required 
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button type="submit" className="aa-btn-primary">
                Activate {role === 'student' ? 'Student' : 'Examiner'} Account 
              </button>

            </form>
          </div>
        ) : (
          /* Success Screen */
          <div className="aa-card aa-success-card">
            <div className="success-icon"></div>
            <h2>Activation Complete!</h2>
            <p className="aa-sub">Your {role === 'student' ? 'Student' : 'Examiner'} account has been activated successfully.</p>
            
            <button onClick={() => navigate('/login')} className="aa-btn-primary">
              Proceed to Standard Login Page 
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

export default AccountActivation;