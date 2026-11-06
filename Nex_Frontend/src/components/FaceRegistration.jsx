import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import './FaceRegistration.css';

function FaceVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  const nextPath = location.state?.nextPath || '/student-dashboard';
  const context = location.state?.context || 'login';
  // States: 'idle', 'initializing', 'scanning', 'success', 'failed'
  const [scanStatus, setScanStatus] = useState('idle');
  const [statusMessage, setStatusMessage] = useState('Ready to Scan');

  // කැමරාව සහ පින්තූරය ගන්න අවශ්‍ය Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // 1. කැමරාව Off කරන Cleanup ෆන්ක්ෂන් එක
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
  };

  const handleCancel = () => {
    stopCamera();
    const token = localStorage.getItem('token');
    const role = (localStorage.getItem('role') || '').toUpperCase();
    if (token && role === 'STUDENT') {
      navigate('/student-dashboard');
    } else {
      navigate('/login');
    }
  };

  // පේජ් එකෙන් යද්දී කැමරාව Off කරන එක
  useEffect(() => {
    return () => stopCamera();
  }, []);

  // 2. කැමරාව ඔන් කරලා ස්කෑන් කිරීම පටන් ගැනීම
  const startBiometricScan = async () => {
    setScanStatus('initializing');
    setStatusMessage('Connecting to Camera...');
    
    try {
      // කැමරාවට අවසර ඉල්ලීම
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      setScanStatus('scanning');
      setStatusMessage('Analyzing Facial Biometrics...');
      
      // තත්පර 2කින් පින්තූරය අරගෙන Backend එකෙන් Verify කිරීම
      setTimeout(() => {
        captureAndVerify();
      }, 2000);

    } catch (err) {
      console.error("Camera error:", err);
      setScanStatus('failed');
      stopCamera(); 
      setStatusMessage('🚫 Camera access denied! Please allow camera permissions.');
    }
  };

  // 3. පින්තූරය අරගෙන Backend එක හරහා Python AI එකෙන් Verify කිරීම
  const captureAndVerify = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (!video || !canvas) return;

    const context2D = canvas.getContext('2d');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    context2D.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      const username = localStorage.getItem('username') || localStorage.getItem('userId');
      const formData = new FormData();
      formData.append('username', username);
      formData.append('faceImage', blob, 'live.jpg');

      try {
        const response = await api.post('/exams/verify-identity', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        if (response.status === 200) {
          setScanStatus('success');
          setStatusMessage('✅ Face Verified Successfully!');
          
          if (context === 'login') {
            sessionStorage.setItem('face_verified_login', 'true');
          } else if (context === 'exam') {
            sessionStorage.setItem('face_verified_exam', 'true');
          }
          
          setTimeout(() => {
            stopCamera();
            // window.location.href වෙනුවට React Router හරහා Redirect කිරීම
            navigate(nextPath); 
          }, 2000);
        }
      } catch (error) {
        console.error("Verification Error:", error);
        setScanStatus('failed');
        const errorMsg = error.response?.data || 'Server Error during verification.';
        setStatusMessage(`🚫 ${errorMsg}`);
        stopCamera();
      }
    }, 'image/jpeg');
  };

  return (
    <div className="fr-wrapper">
      
      {/* Top Navbar */}
      <nav className="fr-topbar">
        <div className="fr-brand">
          <span className="brand-n">N</span> Nex24 <span className="title-divider">|</span> Biometric Security
        </div>
        <button className="fr-cancel-btn" onClick={handleCancel}>
          Cancel & Return
        </button>
      </nav>

      <div className="fr-container">
        
        {/* Header Information */}
        <div className="fr-header">
          <h1>Identity <span className="blue-text">Verification</span></h1>
          <p>Please position your face within the frame to authenticate your account.</p>
        </div>

        {/* ================= CAMERA SCANNER UI ================= */}
        <div className="fr-scanner-section">
          
          <div className={`fr-camera-box ${scanStatus}`}>
            
            {/* The 4 corner brackets for targeting */}
            <div className="bracket top-left"></div>
            <div className="bracket top-right"></div>
            <div className="bracket bottom-left"></div>
            <div className="bracket bottom-right"></div>

            {/* Camera Feed */}
            <div className="fr-video-placeholder" style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
              
              {/* ඇත්තම කැමරාව පෙන්වන කොටස */}
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover',
                  display: (scanStatus === 'scanning' || scanStatus === 'success') ? 'block' : 'none' 
                }} 
              />
              
              {/* UI Icons */}
              {scanStatus === 'idle' && <span className="cam-icon"><br></br><br></br>📷<br/>Camera Ready</span>}
              {scanStatus === 'initializing' && <span className="cam-icon blink"><br></br><br></br><br></br>Connecting to Camera...</span>}
              {scanStatus === 'failed' && <span className="cam-icon" style={{color: '#ef4444'}}>❌<br/>Verification Failed</span>}
              
              {/* Success Icon over video */}
              {scanStatus === 'success' && (
                <div style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <span className="cam-icon success-icon" style={{ fontSize: '60px' }}>✅</span>
                </div>
              )}
            </div>

            {/* Scanning Laser Animation */}
            {scanStatus === 'scanning' && <div className="fr-scanner-laser"></div>}
            
            {/* Success Overlay Effect */}
            {scanStatus === 'success' && <div className="fr-success-overlay"></div>}
          </div>

          {/* පින්තූරය ගන්න නොපෙනෙන Canvas එක */}
          <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>

          {/* Dynamic Status Text */}
          <div className="fr-status-display">
            <h3 className={scanStatus === 'success' ? 'success-text' : scanStatus === 'failed' ? 'error-text' : 'scanning-text'}>
              {statusMessage}
            </h3>
          </div>

          {/* Action Button */}
          <div className="fr-actions">
            {scanStatus === 'idle' || scanStatus === 'failed' ? (
              <button className="fr-start-btn" onClick={startBiometricScan}>
                {scanStatus === 'failed' ? 'Retry Facial Scan' : 'Start Facial Scan'}
              </button>
            ) : scanStatus === 'success' ? (
              <button className="fr-start-btn success-btn" disabled>
                Redirecting...
              </button>
            ) : (
              <button className="fr-start-btn scanning-btn" disabled>
                Please wait...
              </button>
            )}
          </div>

        </div>

        {/* ================= INSTRUCTIONS PANEL ================= */}
        <div className="fr-instructions">
          <h3>Guidelines for a successful scan:</h3>
          <ul>
            <li>Ensure you are in a well-lit room.</li>
            <li>Remove glasses, masks, or hats.</li>
            <li>Look directly into the camera lens.</li>
            <li>Keep your face entirely within the guided frame.</li>
          </ul>
        </div>

      </div>
    </div>
  );
}

export default FaceVerification;