import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const InstituteRegistration = () => {
    const [formData, setFormData] = useState({
        instituteName: '',
        adminName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.password !== formData.confirmPassword) {
            setMessage('❌ Passwords do not match!');
            return;
        }

        setLoading(true);
        setMessage('');

        try {
            const response = await fetch('http://localhost:8080/api/auth/register-institute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    instituteName: formData.instituteName,
                    adminName: formData.adminName,
                    email: formData.email,
                    password: formData.password
                })
            });

            const result = await response.text();

            if (response.ok) {
                setMessage('✅ ' + result);
                setTimeout(() => navigate('/login'), 2000);
            } else {
                setMessage('❌ ' + result);
            }
        } catch (error) {
            setMessage('❌ Server Error. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#020617' }}>
            <div style={{ maxWidth: '450px', width: '100%', padding: '30px', backgroundColor: '#0f172a', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.3)', color: 'white' }}>
                <h2 style={{ color: '#38bdf8', textAlign: 'center', marginBottom: '10px' }}>Register Institute</h2>
                <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '14px', marginBottom: '25px' }}>
                    Create an admin account to manage your Nex24 system.
                </p>
                
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <input type="text" name="instituteName" placeholder="Institute Name" onChange={handleInputChange} required style={inputStyle} />
                    <input type="text" name="adminName" placeholder="Admin Full Name" onChange={handleInputChange} required style={inputStyle} />
                    <input type="email" name="email" placeholder="Admin Email" onChange={handleInputChange} required style={inputStyle} />
                    <input type="password" name="password" placeholder="Create Password" onChange={handleInputChange} required style={inputStyle} />
                    <input type="password" name="confirmPassword" placeholder="Confirm Password" onChange={handleInputChange} required style={inputStyle} />
                    
                    <button type="submit" disabled={loading} style={{...btnStyle, opacity: loading ? 0.7 : 1}}>
                        {loading ? 'Registering...' : 'Register as Admin'}
                    </button>
                </form>

                {message && (
                    <div style={{ marginTop: '20px', padding: '12px', borderRadius: '5px', textAlign: 'center', backgroundColor: message.includes('❌') ? '#7f1d1d' : '#14532d', fontSize: '14px' }}>
                        {message}
                    </div>
                )}
            </div>
        </div>
    );
};

const inputStyle = { padding: '12px', borderRadius: '5px', border: '1px solid #334155', backgroundColor: '#1e293b', color: 'white', outline: 'none' };
const btnStyle = { padding: '14px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' };

export default InstituteRegistration;