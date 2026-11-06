import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Link, Outlet } from 'react-router-dom';
import './FooterPages.css';

function HelpCenter() {
  const navigate = useNavigate();

  return (
    <div className="footer-page-wrapper">
      <div className="fp-container">
        <button className="fp-back-btn" onClick={() => navigate('/')}>← Back to Home</button>
        
        <header className="fp-header">
          <h1>Help <span className="blue-glow">Center</span></h1>
          <p>Nex24 Knowledge Base & Technical Diagnostics Support Desk</p>
        </header>

        {/* Support Options Grid */}
        <div className="fp-help-grid">
          <div className="help-box">
            <h4>Student Support</h4>
            <p>Issues regarding examination access keys, camera setup errors, or submission timeouts during active tests.</p>
          </div>
          <div className="help-box">
            <h4>Examiner Support</h4>
            <p>Guidelines for question bank encryption, paper approval workflows, and unlocking live monitoring streams.</p>
          </div>
          <div className="help-box">
            <h4>Biometric Troubleshoot</h4>
            <p>Fixing identity validation drops, facial lighting issues, or verification failures on low-end hardware devices.</p>
          </div>
        </div>

        {/* Quick FAQs */}
        <div className="fp-card m-top">
          <h3>Frequently Asked Questions (FAQ)</h3>
          
          <div className="faq-item">
            <h5>Q: What should I do if my proctoring screen freezes?</h5>
            <p>A: Do not close your browser. Ensure your camera is active, wait 10 seconds for the node socket to reconnect, or use the emergency backup token provided by your registry.</p>
          </div>

          <div className="faq-item">
            <h5>Q: Can I access the examiner workspace from two terminals simultaneously?</h5>
            <p>A: No. Due to secure role-based portals, logging into an administrator or examiner instance will immediately terminate older security sessions on other network IPs.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HelpCenter;