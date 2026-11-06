import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api'; // API එක අනිවාර්යයෙන්ම import කළ යුතුය
import './InstituteRegister.css';

function InstituteRegister() {
  const navigate = useNavigate();

  // Form States
  const [instituteName, setInstituteName] = useState('');
  const [officialEmail, setOfficialEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [adminName, setAdminName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      // Backend එකට දත්ත යැවීම
      const response = await api.post('/api/auth/register-institute', {
        instituteName,
        officialEmail,
        phone,
        adminName, // මේකෙන් තමයි Login වෙන්න ඕනේ
        password
      });

      alert(`✅ ${response.data}`);
      // Redirect to Institute Dashboard
      navigate('/institute-admin');
    } catch (error) {
      alert(`❌ Error: ${error.response?.data || error.message}`);
    }
  };

  return (
    <div className="ir-wrapper">
      
      {/* Top Navbar */}
      <nav className="ir-topbar">
        <div className="ir-brand">
          <span className="brand-n">N</span> Nex24 <span className="title-divider">|</span> Institute Onboarding Portal
        </div>
        <div>
          {/* Dashboard එකට යන බටන් එක */}
          <button className="ir-secondary-btn" onClick={() => navigate('/institute-admin')}>
            Institute Dashboard →
          </button>
        </div>
      </nav>

      <div className="ir-container">
        
        <div className="ir-card">
          <div className="ir-header">
            <h2>Institute Registration </h2>
            <p className="ir-sub">Register your Educational Institute / University on the Nex24 Examination System.</p>
          </div>

          <form onSubmit={handleRegister} className="ir-form">
            
            {/* Institute Name */}
            <div className="ir-input-group">
              <label>Institute Name</label>
              <input 
                type="text" 
                placeholder="e.g. Rajarata Campus /  Mihinthale" 
                value={instituteName}
                onChange={(e) => setInstituteName(e.target.value)}
                className="ir-input"
                required 
              />
            </div>

            {/* Email & Phone */}
            <div className="ir-form-row">
              <div className="ir-input-group">
                <label>Official Email Address</label>
                <input 
                  type="email" 
                  placeholder="admin@institute.ac.lk" 
                  value={officialEmail}
                  onChange={(e) => setOfficialEmail(e.target.value)}
                  className="ir-input"
                  required 
                />
              </div>

              <div className="ir-input-group">
                <label>Contact Phone Number</label>
                <input 
                  type="tel" 
                  placeholder="+94 11 234 5678" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="ir-input"
                  required 
                />
              </div>
            </div>

            {/* Admin Name */}
            <div className="ir-input-group">
              <label>Authorized Admin Name</label>
              <input 
                type="text" 
                placeholder="e.g. shanil (Use this to login)" 
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                className="ir-input"
                required 
              />
            </div>

            {/* Passwords */}
            <div className="ir-form-row">
              <div className="ir-input-group">
                <label>Create Admin Password</label>
                <input 
                  type="password" 
                  placeholder="Create strong password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="ir-input"
                  required 
                />
              </div>

              <div className="ir-input-group">
                <label>Confirm Password</label>
                <input 
                  type="password" 
                  placeholder="Re-enter password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="ir-input"
                  required 
                />
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="ir-terms-box">
              <input type="checkbox" id="terms" required />
              <label htmlFor="terms">
                I agree to Nex24 AI Proctoring Data Privacy and Security Policies.
              </label>
            </div>

            {/* Submit Button */}
            <button type="submit" className="ir-btn-primary">
              Register Institute & Open Dashboard 
            </button>

          </form>
        </div>

      </div>
    </div>
  );
}

export default InstituteRegister;