import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Link, Outlet } from 'react-router-dom';
import './FooterPages.css';

function TermsOfService() {
  const navigate = useNavigate();

  return (
    <div className="footer-page-wrapper">
      <div className="fp-container">
        <button className="fp-back-btn" onClick={() => navigate('/')}>← Back to Home</button>
        
        <header className="fp-header">
          <h1>Terms of <span className="blue-glow">Service</span></h1>
          <p>Effective Date: June 2026 | Nex24 System User Agreement</p>
        </header>

        <div className="fp-card">
          <section className="fp-section">
            <h3>1. Acceptance of Terms</h3>
            <p>By logging into Nex24 portals (Admin, Examiner, or Student), you agree to comply fully with our automated proctoring regulations and server protocols.</p>
          </section>

          <section className="fp-section">
            <h3>2. User Account Integrity</h3>
            <p>Users are completely responsible for keeping their gatekeeper passwords safe. Any unauthorized portal access triggered by compromised credentials will result in an immediate suspension check.</p>
          </section>

          <section className="fp-section">
            <h3>3. Examination Conduct & Live Proctoring</h3>
            <p>Attempting to bypass browser locks, virtual machine blocking, or screen monitoring during a live session constitutes a direct violation of Nex24 terms, triggering an immediate red flag report to the chief examiner.</p>
          </section>

          <section className="fp-section">
            <h3>4. Service Modifications</h3>
            <p>DevSpire Studios reserves the authority to optimize security patches and update root configurations to protect system endpoints at any time.</p>
          </section>
        </div>
      </div>
    </div>
  );
}

export default TermsOfService;