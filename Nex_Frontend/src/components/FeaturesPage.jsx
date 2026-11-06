import React from 'react';
import './FeaturesPage.css';
import { ShieldAlert, Fingerprint, Video, DatabaseZap, Clock3, BrainCircuit } from 'lucide-react';
import { Link, Outlet } from 'react-router-dom';
const FeaturesPage = () => {
  const allFeatures = [
    {
      icon: <Fingerprint size={36} className="text-cyan" />,
      title: "Biometric AI Authentication",
      desc: "Uses continuous face and fingerprint recognition to ensure only the real student takes the exam.",
      glow: "feat-glow-cyan"
    },
    {
      icon: <Video size={36} className="text-blue" />,
      title: "Automated Live Proctoring",
      desc: "AI-powered algorithms detect eye movement, second persons, and audio cues to prevent cheating.",
      glow: "feat-glow-blue"
    },
    {
      icon: <BrainCircuit size={36} className="text-purple" />,
      title: "Smart Integrity Checking",
      desc: "Evaluates screen activity and background noise patterns to maintain strict academic integrity.",
      glow: "feat-glow-purple"
    },
    {
      icon: <DatabaseZap size={36} className="text-blue" />,
      title: "Secure Question Bank",
      desc: "Centralized, encrypted question management system with role-based access for examiners.",
      glow: "feat-glow-blue"
    },
    {
      icon: <Clock3 size={36} className="text-cyan" />,
      title: "Time-Sensitive Controls",
      desc: "Precise exam window scheduling with automated starting, stopping, and submission management.",
      glow: "feat-glow-cyan"
    },
    {
      icon: <ShieldAlert size={36} className="text-purple" />,
      title: "Full Privacy Controls",
      desc: "Built with student data privacy in mind, ensuring all monitoring data is handled securely.",
      glow: "feat-glow-purple"
    }
  ];

  return (
    <div className="feat-container">
      {/* Header with Navigation Placeholder */}
      <nav className="feat-nav">
        <div className="logo"><span className="logo-icon">N</span> Nex24</div>
        <div className="nav-links">
          <Link to="/">Home</Link>
           <Link to="/features" className="active">Features</Link>
          <Link to="/how-it-works">How it Works</Link>
        </div>
      </nav>

      {/* Page Hero */}
      <div className="feat-hero">
        <h1 className="hero-title">Cutting-Edge <span className="highlight-cyan">Technologies</span>.</h1>
        <p className="hero-subtitle">Exploring the core features that make Nex24 a leader in online academic integrity.</p>
      </div>

      {/* Main Features Grid */}
      <div className="feat-grid">
        {allFeatures.map((feat, index) => (
          <div key={index} className={`feat-card ${feat.glow}`}>
            <div className="feat-icon-container">{feat.icon}</div>
            <h3>{feat.title}</h3>
            <p>{feat.desc}</p>
          </div>
        ))}
      </div>

      {/* Call to Action Section */}
      <div className="feat-cta">
        <h2>Experience Secured Excellence.</h2>
        <button className="primary-btn-gradient">Get Started / Login</button>
      </div>

      {/* Footer Placeholder */}
      <footer className="footer-placeholder">
        <p>Developed by <span className="highlight-blue">DevSpire Studios</span></p>
      </footer>
    </div>
  );
};

export default FeaturesPage;