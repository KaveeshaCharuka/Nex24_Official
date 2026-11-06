import React, { useState } from 'react';

const ExaminerActivation = () => {
    const [formData, setFormData] = useState({ email: '', tempPassword: '', newPassword: '' });
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        const params = new URLSearchParams();
        params.append('email', formData.email);
        params.append('tempPassword', formData.tempPassword);
        params.append('newPassword', formData.newPassword);

        try {
            const response = await fetch('http://localhost:8080/api/auth/activate-examiner', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: params.toString(),
            });
            const result = await response.text();
            
            if (response.ok) {
                setMessage('✅ ' + result);
                setFormData({ email: '', tempPassword: '', newPassword: '' });
            } else {
                setMessage('❌ ' + result);
            }
        } catch (error) {
            setMessage('❌ Server Error!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '500px', margin: '40px auto', padding: '20px', backgroundColor: '#0f172a', color: 'white', borderRadius: '8px' }}>
            <h2 style={{ color: '#10b981', textAlign: 'center' }}>Examiner Activation</h2>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input type="email" name="email" placeholder="Your Email" onChange={handleInputChange} required style={inputStyle} />
                <input type="text" name="tempPassword" placeholder="Temp Password (from Email)" onChange={handleInputChange} required style={inputStyle} />
                <input type="password" name="newPassword" placeholder="Create New Password" onChange={handleInputChange} required style={inputStyle} />
                
                <button type="submit" disabled={loading} style={btnStyle('#10b981')}>{loading ? 'Activating...' : 'Activate Account'}</button>
            </form>
            {message && <div style={{ marginTop: '15px', padding: '10px', textAlign: 'center', backgroundColor: '#1e293b' }}>{message}</div>}
        </div>
    );
};

const inputStyle = { padding: '10px', borderRadius: '5px', border: 'none', backgroundColor: '#1e293b', color: 'white' };
const btnStyle = (color) => ({ padding: '10px', backgroundColor: color, color: 'white', border: 'none', cursor: 'pointer', width: '100%', borderRadius: '5px' });

export default ExaminerActivation;