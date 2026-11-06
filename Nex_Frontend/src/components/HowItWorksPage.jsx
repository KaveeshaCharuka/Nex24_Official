import React from 'react';
import './HowItWorksPage.css';
import { Target, ChartPie, UserPlus, ClipboardList, PenTool, CheckCircle } from 'lucide-react';
import { Link, Outlet } from 'react-router-dom';
const HowItWorksPage = () => {
  const steps = [
    {
      number: "1",
      icon: <UserPlus className="how-icon" />,
      title: "Register & Login",
      desc: "Complete biometric registration. Login via face recognition or fingerprint to access your personalized portal."
    },
    {
      number: "2",
      icon: <ClipboardList className="how-icon" />,
      title: "Access Exams",
      desc: "View your scheduled exams, courses, and pending tasks in the intuitive dashboard."
    },
    {
      number: "3",
      icon: <PenTool className="how-icon" />,
      title: "Take Secure Exam",
      desc: "Complete integrity verification (e.g., face, audio) before starting. Complete the exam under AI proctoring."
    },
    {
      number: "4",
      icon: <ChartPie className="how-icon" />,
      title: "View Results",
      desc: "AI automatically grades multiple-choice questions. Essay questions are pending examiner review."
    }
  ];

  return (
    <div className="how-container">
      {/* Header Placeholder */}
      <nav className="feat-nav">
        <div className="logo"><span className="logo-icon">N</span> Nex24</div>
        <div className="nav-links">
          <Link to="/">Home</Link>
           <Link to="/features">Features</Link>
          <Link to="/how-it-works" className="active">How it Works</Link>
        </div>
      </nav>

      {/* Page Hero */}
      <div className="feat-hero">
        <h1 className="hero-title">A <span className="highlight-cyan">Simpler</span> Process.</h1>
        <p className="hero-subtitle">Seamless integration of technology ensures a transparent and straightforward examination experience for everyone.</p>
      </div>

      {/* Timeline of Steps */}
      <div className="timeline-container">
        {steps.map((step, index) => (
          <div key={index} className="timeline-step">
            <div className="step-number-container">
              <span className="step-number">{step.number}</span>
              <span className="step-circle green-glow">
                <CheckCircle size={10} color="#34d399" />
              </span>
            </div>
            
            <div className="glass-card timeline-card">
              <div className="card-header-flex">
                <div className="icon-wrapper cyan-glow">{step.icon}</div>
                <h3>{step.title}</h3>
              </div>
              <p>{step.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom CTA with Icon */}
      <div className="feat-cta">
        <Target size={40} className="text-cyan cursor-pointer" />
        <h2 className="mt-15">Ensuring Academic Excellence.</h2>
        <button className="primary-btn-gradient">Register Now</button>
      </div>

      {/* Footer Placeholder */}
      <footer className="footer-placeholder">
        <p>Developed by <span className="highlight-blue">DevSpire Studios</span></p>
      </footer>
    </div>
  );
};

export default HowItWorksPage;