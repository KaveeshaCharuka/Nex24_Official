import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, GraduationCap, Lock, Mail, ArrowRight } from 'lucide-react';
import api from '../services/api';
import './RoleLoginPage.css';
import { Link, Outlet } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

const RoleLoginPage = () => {
  const [role, setRole] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return; 
    }

    try {
      const response = await api.post('/auth/register', {
        username: username,
        email: email,
        password: password,
        role: role.toUpperCase()
      });

      toast.success('Account created successfully! Redirecting to login...', {
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });

  
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err) {
      if (!err.response) {
        setError('🔌 Server is offline. Please check your connection.');
      } else {
        setError(err.response.data.message || '❌ Registration failed. Try again.');
      }
    }
  };

  return (
    <div className="login-container">
      {/* 💡 මේක තමයි අඩුවෙලා තිබුණේ! (Toast එක එළියට පෙන්වන තැන) */}
      <Toaster position="top-center" reverseOrder={false} />

      <div className="login-glass-card">
        <div className="login-logo">
          <span className="logo-icon">N</span> Nex24
        </div>

        <h2>Create Account</h2>
        <p className="login-subtitle">Please select your role and sign up</p>

        {error && (
          <div style={{ color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '5px', marginBottom: '15px', fontSize: '14px', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <div className="role-tabs">
          <button
            type="button"
            className={`role-tab ${role === 'student' ? 'active-student' : ''}`}
            onClick={() => setRole('student')}
          >
            <GraduationCap size={18} />
            Student
          </button>
          <button
            type="button"
            className={`role-tab ${role === 'examiner' ? 'active-examiner' : ''}`}
            onClick={() => setRole('examiner')}
          >
            <User size={18} />
            Examiner
          </button>
        </div>

        <form onSubmit={handleRegister} className="login-form">
          <div className="input-group">
            <label>User Name</label>
            <div className="input-wrapper">
              <User size={16} className="input-icon" />
              <input 
                type="text" 
                placeholder="Enter your username" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                required 
              />
            </div>
          </div>

          <div className="input-group">
            <label>Email Address</label>
            <div className="input-wrapper">
              <Mail size={16} className="input-icon" />
              <input 
                type="email" 
                placeholder="name@example.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>
          </div>

          <div className="input-group">
            <label>Password</label>
            <div className="input-wrapper">
              <Lock size={16} className="input-icon" />
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>
          </div>

          <div className="input-group">
            <label>Confirm Password</label>
            <div className="input-wrapper">
              <Lock size={16} className="input-icon" />
              <input 
                type="password" 
                placeholder="••••••••" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                required 
              />
            </div>
          </div>

          <button 
            type="submit" 
            className={`login-submit-btn ${role === 'student' ? 'btn-blue' : 'btn-green'}`} 
            style={{ marginTop: '20px' }} 
          >
            Register as {role === 'student' ? 'Student' : 'Examiner'} <ArrowRight size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default RoleLoginPage;