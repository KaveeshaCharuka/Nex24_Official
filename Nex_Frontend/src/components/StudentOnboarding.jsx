import React, { useState } from 'react';

const StudentOnboarding = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        indexNumber: '',
        email: '',
        courseId: ''
    });
    const [image, setImage] = useState(null);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setImage(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        // ෆොටෝ එකක් යවන නිසා JSON වෙනුවට FormData පාවිච්චි කරනවා
        const data = new FormData();
        data.append('fullName', formData.fullName);
        data.append('indexNumber', formData.indexNumber);
        data.append('email', formData.email);
        data.append('courseId', formData.courseId);
        data.append('image', image);

        try {
            const response = await fetch('http://localhost:8080/api/admin/invite-student', {
                method: 'POST',
                body: data, 
            });

            const result = await response.text();

            if (response.ok) {
                setMessage('✅ ' + result);
                setFormData({ fullName: '', indexNumber: '', email: '', courseId: '' });
                setImage(null);
            } else {
                setMessage('❌ Error: ' + result);
            }
        } catch (error) {
            setMessage('❌ Server Error! Backend එක රන් වෙනවද බලන්න.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '500px', margin: '40px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', fontFamily: 'sans-serif' }}>
            <h2 style={{ color: '#0f766e', textAlign: 'center' }}>Admin - Register New Student</h2>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input type="text" name="fullName" placeholder="Full Name (e.g. Kaveen)" value={formData.fullName} onChange={handleInputChange} required style={{ padding: '10px' }} />
                <input type="text" name="indexNumber" placeholder="Index Number" value={formData.indexNumber} onChange={handleInputChange} required style={{ padding: '10px' }} />
                <input type="email" name="email" placeholder="Student Email (ඔයාගේ ඇත්ත ඊමේල් එක දෙන්න)" value={formData.email} onChange={handleInputChange} required style={{ padding: '10px' }} />
                <input type="number" name="courseId" placeholder="Course ID (e.g. 1)" value={formData.courseId} onChange={handleInputChange} required style={{ padding: '10px' }} />
                
                <div style={{ padding: '10px', border: '1px dashed #ccc' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Reference Image (Face):</label>
                    <input type="file" accept="image/*" onChange={handleFileChange} required />
                </div>

                <button type="submit" disabled={loading} style={{ padding: '12px', backgroundColor: '#0f766e', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px' }}>
                    {loading ? 'Registering & Sending Email...' : 'Register Student'}
                </button>
            </form>

            {message && (
                <div style={{ marginTop: '20px', padding: '15px', borderRadius: '5px', textAlign: 'center', backgroundColor: message.includes('Error') ? '#fee2e2' : '#dcfce7', color: message.includes('Error') ? '#991b1b' : '#166534', fontWeight: 'bold' }}>
                    {message}
                </div>
            )}
        </div>
    );
};

export default StudentOnboarding;