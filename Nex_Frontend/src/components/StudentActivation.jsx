import React, { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';

const StudentActivation = () => {
    const [formData, setFormData] = useState({
        tempUsername: '',
        otp: '',
        newPassword: ''
    });
    const [capturedImage, setCapturedImage] = useState(null);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    
    const webcamRef = useRef(null);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // වෙබ් කැම් එකෙන් ෆොටෝ එකක් කැප්චර් කරන ෆන්ක්ෂන් එක
    const capture = useCallback(() => {
        const imageSrc = webcamRef.current.getScreenshot();
        setCapturedImage(imageSrc);
    }, [webcamRef]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!capturedImage) {
            setMessage('❌ කරුණාකර ඔබගේ මුහුණ ස්කෑන් (Capture) කරන්න.');
            return;
        }

        setLoading(true);
        setMessage('');

        // Base64 ෆොටෝ එක File එකක් (Blob) බවට පත් කිරීම
        const fetchRes = await fetch(capturedImage);
        const blob = await fetchRes.blob();

        const data = new FormData();
        data.append('tempUsername', formData.tempUsername);
        data.append('otp', formData.otp);
        data.append('newPassword', formData.newPassword);
        data.append('faceImage', blob, 'face.jpg');

        try {
            // ඔයාගේ Phase 2 Backend API Endpoint එක මෙතනට දාන්න
            const response = await fetch('http://localhost:8080/api/auth/activate-student', {
                method: 'POST',
                body: data, 
            });

            const result = await response.text();

            if (response.ok) {
                setMessage('✅ Account Activated Successfully!');
                setFormData({ tempUsername: '', otp: '', newPassword: '' });
                setCapturedImage(null);
            } else {
                setMessage('! Error: ' + result);
            }
        } catch (error) {
            setMessage('!! Server Error! ');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', fontFamily: 'sans-serif', backgroundColor: '#0f172a', color: 'white' }}>
            <h2 style={{ color: '#38bdf8', textAlign: 'center' }}>Activate Your Account</h2>
            <p style={{ textAlign: 'center', fontSize: '14px', color: '#cbd5e1', marginBottom: '20px' }}>
                ඊමේල් එකට ආපු Temp Username එක සහ OTP එක ලබා දී ඔබගේ මුහුණ ස්කෑන් කරන්න.
            </p>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input type="text" name="tempUsername" placeholder="Temporary Username" value={formData.tempUsername} onChange={handleInputChange} required style={inputStyle} />
                <input type="text" name="otp" placeholder="OTP (e.g. 123456)" value={formData.otp} onChange={handleInputChange} required style={inputStyle} />
                <input type="password" name="newPassword" placeholder="Enter New Password" value={formData.newPassword} onChange={handleInputChange} required style={inputStyle} />
                
                <div style={{ padding: '10px', border: '1px dashed #475569', textAlign: 'center' }}>
                    <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>Face Verification:</label>
                    
                    {!capturedImage ? (
                        <>
                            <Webcam 
                                audio={false} 
                                ref={webcamRef} 
                                screenshotFormat="image/jpeg" 
                                width="100%" 
                                style={{ borderRadius: '8px' }}
                            />
                            <button type="button" onClick={capture} style={{...btnStyle, backgroundColor: '#ea580c', marginTop: '10px'}}>
                                📸 Capture Face
                            </button>
                        </>
                    ) : (
                        <>
                            <img src={capturedImage} alt="Captured Face" style={{ width: '100%', borderRadius: '8px' }} />
                            <button type="button" onClick={() => setCapturedImage(null)} style={{...btnStyle, backgroundColor: '#dc2626', marginTop: '10px'}}>
                                🔄 Retake Photo
                            </button>
                        </>
                    )}
                </div>

                <button type="submit" disabled={loading} style={{...btnStyle, backgroundColor: '#2563eb', fontSize: '16px'}}>
                    {loading ? 'Activating Account...' : 'Activate & Save Password'}
                </button>
            </form>

            {message && (
                <div style={{ marginTop: '20px', padding: '15px', borderRadius: '5px', textAlign: 'center', backgroundColor: message.includes('Error') ? '#7f1d1d' : '#14532d', color: 'white', fontWeight: 'bold' }}>
                    {message}
                </div>
            )}
        </div>
    );
};

const inputStyle = { padding: '10px', borderRadius: '5px', border: 'none', outline: 'none', backgroundColor: '#1e293b', color: 'white' };
const btnStyle = { padding: '12px', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', width: '100%' };

export default StudentActivation;