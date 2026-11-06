import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Link, Outlet } from 'react-router-dom';
import './FooterPages.css';

function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="footer-page-wrapper">
      <div className="fp-container">
        <button className="fp-back-btn" onClick={() => navigate('/')}>← Back to Home</button>
        
        <header className="fp-header">
          <h1>Privacy <span className="blue-glow">Policy</span></h1>
          <p>Last Updated: June 2026 | Nex24 Examination Privacy Framework</p>
        </header>

        <div className="fp-card">
          <section className="fp-section">
            <h3>1. Data We Collect</h3>
            <p>To ensure academic integrity, Nex24 collects institutional identification, registration data, and technical logs required during examination sessions.</p>
          </section>

          <section className="fp-section">
            <h3>2. Biometric & Identity Verification</h3>
            <p>In accordance with our <strong>Biometric Security</strong> protocol, face templates and verification hashes are processed locally or securely encrypted. Nex24 does not store raw biometric data longer than the verification timeframe.</p>
          </section>

          <section className="fp-section">
            <h3>3. Live Proctoring & Monitoring</h3>
            <p>During live examinations, automated system checks, screen recordings, and webcam feeds are actively analyzed by authorized proctors to prevent plagiarism. All recordings are securely archived using root-level security tokens.</p>
          </section>

          <section className="fp-section">
            <h3>4. Data Security</h3>
            <p>All transmitted user tokens are wrapped under end-to-end encryption protocols to ensure zero leaks to unauthorized third-party platforms.</p>
          </section>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicy;