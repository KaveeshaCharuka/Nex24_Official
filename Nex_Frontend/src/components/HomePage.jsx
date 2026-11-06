import React from 'react';
import './HomePage.css';
import { Link, Outlet } from 'react-router-dom';
import { Shield, Fingerprint, Video, Users } from 'lucide-react';

const HomePage = () => {
  return (
    <div className="home-container">
      {/* Navbar Section */}
      <nav className="navbar">
        <div className="logo">
          <span className="logo-icon">N</span> Nex24
        </div>
        <div className="nav-links">
          {/* 👈 a ටැග් වෙනුවට Link ටැග් යෙදුවා */}
          <Link to="/features">Features</Link>
          <Link to="/how-it-works">How it Works</Link>
          <Link to="/support">Support</Link> {/* Support පිටුවක් නැති නිසා ඒක එහෙමම තිබ්බා */}
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <Link to="/register-institute"><button className="nav-btn" style={{ background: 'transparent', border: '1px solid #38bdf8', color: '#fff' }}>Register Institute</button></Link>
          <Link to="/login"><button className="nav-btn">Login</button></Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <div className="shield-icon-container">
            <Shield size={80} className="shield-icon" />
          </div>
          <h1>Welcome to <span className="highlight">Nex24</span>:<br/>The Smart Online Examination System.</h1>
          <p>Secure, seamless, and intelligent testing environment built for academic integrity.</p>
          {/* 👈 Hero section එකේ බටන් එකත් Link එකකින් ආවරණය කළා */}
          <Link to="/login">
            <button className="cta-btn">Get Started / Login</button>
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="features-section">
        <div className="feature-card">
          <div className="feature-header">
             <Fingerprint className="feature-icon" size={24} />
             <h3>Biometric Security</h3>
          </div>
          <p>Biometric security to protect your precedent-level learning, and achieve biometric security.</p>
        </div>
        <div className="feature-card">
          <div className="feature-header">
             <Video className="feature-icon" size={24} />
             <h3>Live Proctoring</h3>
          </div>
          <p>Learning is enhanced in live proctoring and provide seamless learning for training organizations.</p>
        </div>
        <div className="feature-card">
          <div className="feature-header">
             <Users className="feature-icon" size={24} />
             <h3>Role-Based Portals</h3>
          </div>
          <p>Role-based portals, comprehensive evaluation experience environment to retain academic integrity.</p>
        </div>
      </div>

      {/* Footer Section */}
      <footer className="footer">
        <div className="footer-left">
          Developed by <span className="highlight-text">DevSpire Studios</span>
        </div>
        <div className="footer-links">
           <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms of Service</Link>
          <Link to="/help">Help Center</Link>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;