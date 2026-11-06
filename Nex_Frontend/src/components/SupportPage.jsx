import React from 'react';
import './SupportPage.css';
import { Link, Outlet } from 'react-router-dom';
const SupportPage = () => {
  return (
    <div className="support-container">
      <div className="support-glass-card">
        
        {/* Header Section */}
        <div className="support-header">
          <div className="support-main-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </div>
          <h2>Nex24 Support Center</h2>
          <p>Let us know if you have any problems. We're ready to help!</p>
        </div>

        {/* Quick Contact Cards */}
        <div className="support-quick-cards">
          <div className="quick-card">
            <div className="card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
            </div>
            <h4>Email Us</h4>
            <p>support@nex24.com</p>
          </div>

          <div className="quick-card">
            <div className="card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
            </div>
            <h4>Call Us</h4>
            <p>+94 11 234 5678</p>
          </div>
        </div>

        {/* Contact Form */}
        <form className="support-form">
          <div className="support-input-group">
            <label>Your Name</label>
            <input type="text" placeholder="Enter your name" />
          </div>
          
          <div className="support-input-group">
            <label>Email Address</label>
            <input type="email" placeholder="name@example.com" />
          </div>
          
          <div className="support-input-group">
            <label>How can we help you?</label>
            <textarea rows="4" placeholder="Type your question or issue here..."></textarea>
          </div>
          
          <button type="button" className="support-submit-btn">
            Submit Request
          </button>
        </form>

      </div>
    </div>
  );
};

export default SupportPage;