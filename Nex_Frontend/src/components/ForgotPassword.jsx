import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link, Outlet } from 'react-router-dom';
import './ForgotPassword.css';

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isSent, setIsSent] = useState(false); 

  const handleResetSubmit = (e) => {
    e.preventDefault();
    
    console.log("Reset link requested for:", email);
    setIsSent(true); 
  };

  return (
    <div className="forgot-pass-page">
      
      {/* Top Floating Logo */}
      <div className="fp-logo-area" onClick={() => navigate('/')}>
        <span className="brand-n">N</span> Nex24
      </div>

      <div className="fp-card-container">
        
        {/* PHASE 1: ඊමේල් එක ඇතුළත් කරන පියවර */}
        {!isSent ? (
          <div className="fp-card animate-fade-in">
            <div className="fp-icon-header"></div>
            <h2>Forgot <span className="blue-glow-text">Password?</span></h2>
            <p className="fp-instruction">
              Enter your institutional email address below and we'll send you a secure link to reset your access token.
            </p>

            <form onSubmit={handleResetSubmit} className="fp-form">
              <div className="fp-input-group">
                <label>Institutional Email Address</label>
                <input 
                  type="email" 
                  placeholder="name@nex24.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>

              <button type="submit" className="fp-submit-btn">
                Send Reset Link
              </button>
            </form>

            <div className="fp-footer-link">
              <span className="back-link" onClick={() => navigate('/login')}>
                ← Back to Login
              </span>
            </div>
          </div>
        ) : (
          
          /* PHASE 2: ඊමේල් එක සාර්ථකව යැවූ පසු පෙන්වන පියවර (Success State) */
          <div className="fp-card animate-fade-in text-center">
            <div className="fp-success-icon"></div>
            <h2>Check Your <span className="blue-glow-text">Inbox</span></h2>
            <p className="fp-instruction">
              We have securely dispatched a password recovery token to <strong className="highlight-email">{email}</strong>. Please check your spam folder if you don't receive it within a few minutes.
            </p>

            <button className="fp-submit-btn secondary-btn" onClick={() => setIsSent(false)}>
              Resend Email
            </button>

            <div className="fp-footer-link">
              <span className="back-link" onClick={() => navigate('/login')}>
                ← Back to Login Page
              </span>
            </div>
          </div>
        )}

      </div>

      {/* DevSpire Footer (image_0c6c5c.jpg එකේ විදිහටම) */}
      <div className="fp-page-footer">
        Developed by <span className="devspire-text">DevSpire Studios</span>
      </div>
    </div>
  );
}

export default ForgotPassword;