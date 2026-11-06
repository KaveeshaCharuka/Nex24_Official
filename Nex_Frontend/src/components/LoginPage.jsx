import React, { useState } from 'react';
import './LoginPage.css';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  const validateInputs = () => {
    if (!username.trim()) {
      setError('⚠️ User Name / Email cannot be empty!');
      return false;
    }

    if (username.trim().length < 3) {
      setError('⚠️ User Name must be at least 3 characters long!');
      return false;
    }

    if (!password) {
      setError('⚠️ Password cannot be empty!');
      return false;
    }

    if (password.length < 6) {
      setError('⚠️ Password must be at least 6 characters long!');
      return false;
    }

    return true;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateInputs()) {
      return; 
    }

    setIsLoading(true);

    try {
      const response = await api.post('/auth/login', {
        username: username.trim(), 
        password: password
      });

      // 💡 Backend එකෙන් එන response එක (token, role, etc.)
      const data = response.data;
      
      // Response එක Map එකක් ලෙස හෝ direct object ලෙස ආවත් හැසිරෙන ආකාරයට
      const token = typeof data === 'string' ? data : data.token;
      const role = data.role || 'STUDENT';
      const isFaceRegistered = data.isFaceRegistered || false;
      const savedUsername = data.username || username.trim();

      localStorage.setItem('token', token);
      localStorage.setItem('userId', username.trim()); 
      localStorage.setItem('username', savedUsername);
      localStorage.setItem('role', role); 
      localStorage.setItem('isFaceRegistered', isFaceRegistered); 
      
      const userRole = String(role).toUpperCase(); 
      const isRegistered = isFaceRegistered === true || isFaceRegistered === "true"; 
      
      // 💡 රෝල් එක අනුව අදාළ ඩෑෂ්බෝඩ් එකට යැවීම
     if (userRole === 'INSTITUTE_ADMIN') {
  navigate('/dashboard'); // Use the new modern Institute Dashboard
} else if (userRole === 'ADMIN') {
  navigate('/admin-dashboard'); // සාමාන්‍ය Super Admin ඩෑෂ්බෝඩ් එක
} else if (userRole === 'STUDENT') {
  navigate('/student/face-registration', { state: { nextPath: '/student-dashboard', context: 'login' } });
} else if (userRole === 'EXAMINER') {
  navigate('/examiner-dashboard'); 
} else {
  navigate('/'); 
}
      
    } catch (err) {
      if (!err.response) {
        setError('🔌 Server is offline or unreachable. Please check your connection.');
      } else if (err.response.status === 401 || err.response.status === 403) {
        setError('❌ Invalid Username or Password!');
      } else {
        setError('❌ An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="background-pattern"></div>
      
      <div className="header">
        <h1>Nex<span>24</span></h1>
      </div>
      
      <div className="login-card">
        <h2>Secure Login</h2>
        
        {error && (
          <div style={{ 
            color: '#ef4444', 
            backgroundColor: 'rgba(239, 68, 68, 0.1)', 
            padding: '10px', 
            borderRadius: '5px', 
            marginBottom: '15px', 
            fontSize: '14px', 
            textAlign: 'center',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            fontWeight: '500'
          }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin} noValidate> 
          <div className="input-group">
            <input 
              type="text" 
              placeholder="User Name or Email" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required 
            />
          </div>
          
          <div className="input-group">
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          
          <div className="forgot-password">
            <Link to="/forgot-password">Forgot Password?</Link>
          </div>
          
          <button 
            type="submit" 
            className="login-btn" 
            disabled={isLoading}
            style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Authenticating...
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>
        
        <div className="register-link">
          New to Nex24? <Link to="/register">register here</Link>
        </div>
        
        <div className="shield-icon">
          <svg viewBox="0 0 24 24" fill="rgba(56, 189, 248, 0.1)" stroke="#38bdf8" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="M12 8v4" strokeWidth="1.5" />
            <circle cx="12" cy="15" r="1" fill="#38bdf8" />
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeWidth="0.5" strokeDasharray="2 2" />
          </svg>
        </div>
      </div>
      
      <div className="footer">
        Developed by <span>DevSpire Studios</span>
      </div>
    </div>
  );
};

export default LoginPage;