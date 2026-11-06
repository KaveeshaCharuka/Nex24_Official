import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Link, Outlet } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a', color: '#fff' }}>
      <h1 style={{ fontSize: '6rem', color: '#38bdf8', margin: '0' }}>404</h1>
      <h2>System Route Not Found! 🚫</h2>
      <p style={{ color: '#94a3b8', marginBottom: '30px' }}>The secure page you are looking for does not exist or you don't have access.</p>
      
      <button 
        onClick={() => navigate('/login', { replace: true })}
        style={{ padding: '10px 20px', backgroundColor: '#38bdf8', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
      >
        Return to Secure Login
      </button>
    </div>
  );
};

export default NotFound;