import React, { useState } from 'react';
import api from '../services/api';

const ExaminerOnboarding = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: ''
    });
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const response = await api.post('/admin/invite-examiner', {
                fullName: formData.fullName.trim(),
                email: formData.email.trim()
            });

            const result = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
            setMessage('✅ ' + result);
            setFormData({ fullName: '', email: '' });
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.response?.data || error.message;
            setMessage('❌ Error: ' + errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '500px', margin: '40px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', fontFamily: 'sans-serif' }}>
            <h2 style={{ color: '#2563eb', textAlign: 'center' }}>Admin - Register New Examiner</h2>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input 
                    type="text" 
                    name="fullName" 
                    placeholder="Examiner Full Name" 
                    value={formData.fullName} 
                    onChange={handleInputChange} 
                    required 
                    style={{ padding: '10px' }} 
                />
                <input 
                    type="email" 
                    name="email" 
                    placeholder="Examiner Email" 
                    value={formData.email} 
                    onChange={handleInputChange} 
                    required 
                    style={{ padding: '10px' }} 
                />
                
                <button 
                    type="submit" 
                    disabled={loading} 
                    style={{ padding: '12px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px' }}
                >
                    {loading ? 'Sending Invitation...' : 'Invite Examiner'}
                </button>
            </form>

            {message && (
                <div style={{ marginTop: '20px', padding: '15px', borderRadius: '5px', textAlign: 'center', backgroundColor: message.includes('Error') ? '#fee2e2' : '#dbeafe', color: message.includes('Error') ? '#991b1b' : '#1e40af', fontWeight: 'bold' }}>
                    {message}
                </div>
            )}
        </div>
    );
};

export default ExaminerOnboarding;