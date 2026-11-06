import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import './FaceRecognition.css';

function FaceRecognition() {
  const navigate = useNavigate();
  
  // URL එකේ තියෙන Token එක ලබාගැනීම (උදා: ?token=abc123xyz)
  const [searchParams] = useSearchParams();
  const enrollToken = searchParams.get('token'); 

  // States: 'idle', 'initializing', 'scanning', 'success', 'failed'
  const [scanStatus, setScanStatus] = useState('idle');
  const [statusMessage, setStatusMessage] = useState('Ready to Scan');

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  const startBiometricScan = async () => {
    setScanStatus('initializing');
    setStatusMessage('Connecting to Camera...');
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      setScanStatus('scanning');
      setStatusMessage('Analyzing Facial Biometrics...');
      
      setTimeout(() => {
        captureAndVerify();
      }, 2000);

    } catch (err) {
      console.error("Camera error:", err);
      setScanStatus('failed');
      stopCamera(); 

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setStatusMessage('🚫 Camera access denied! Please allow camera permissions in your browser.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setStatusMessage('💻 No webcam found! Please connect a camera to continue.');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setStatusMessage('⚠️ Camera is being used by another application (e.g., Zoom/Skype).');
      } else {
        setStatusMessage('❌ An unknown camera error occurred. Please refresh the page.');
      }
    }
  };

  const captureAndVerify = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (!video || !canvas) return;

    // URL එකේ ටෝකන් එක නැත්නම් එරර් එකක් පෙන්වීම
    if (!enrollToken) {
      setScanStatus('failed');
      setStatusMessage('Invalid Enrollment Link! Please check your email.');
      stopCamera();
      return;
    }

    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
      data[i] = avg;     // Red
      data[i + 1] = avg; // Green
      data[i + 2] = avg; // Blue
    }
    context.putImageData(imageData, 0, 0);

    const base64Image = canvas.toDataURL('image/jpeg');

    try {
      // Backend එකට Token එක සහ Image එක යැවීම
      const response = await api.post('/face/verify-enrollment', {
        token: enrollToken,
        image: base64Image
      });

      setScanStatus('success');
      setStatusMessage(response.data.message || '✅ Face Verified Successfully!'); 

      // තත්පර 2කට පසු Set Password පේජ් එකට යැවීම
      setTimeout(() => {
        stopCamera();
        navigate(`/set-password?token=${enrollToken}`); 
      }, 2000);

    } catch (error) {
      setScanStatus('failed');
      setStatusMessage(error.response?.data?.message || '❌ Face does not match. Try again.');
      stopCamera(); 
    }
  };

  return (
    <div className="fr-wrapper">
      
      <nav className="fr-topbar">
        <div className="fr-brand">
          <span className="brand-n">N</span> Nex24 <span className="title-divider">|</span> Biometric Security
        </div>
        <button className="fr-cancel-btn" onClick={() => { stopCamera(); navigate('/login'); }}>
          Cancel & Return
        </button>
      </nav>

      <div className="fr-container">
        
        <div className="fr-header">
          <h1>Identity <span className="blue-text">Verification</span></h1>
          <p>Please position your face within the frame to authenticate your enrollment.</p>
        </div>

        <div className="fr-scanner-section">
          
          <div className={`fr-camera-box ${scanStatus}`}>
            
            <div className="bracket top-left"></div>
            <div className="bracket top-right"></div>
            <div className="bracket bottom-left"></div>
            <div className="bracket bottom-right"></div>

            <div className="fr-video-placeholder" style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
              
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
              
              {scanStatus === 'idle' && <span className="cam-icon"><br></br><br></br>📷<br/>Camera Ready</span>}
              {scanStatus === 'initializing' && <span className="cam-icon blink"><br></br><br></br><br></br>Connecting to Camera...</span>}
              {scanStatus === 'failed' && <span className="cam-icon" style={{color: '#ef4444'}}>❌<br/>Verification Failed</span>}
              
              {scanStatus === 'success' && (
                <div style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <span className="cam-icon success-icon">✅</span>
                </div>
              )}
            </div>

            {scanStatus === 'scanning' && <div className="fr-scanner-laser"></div>}
            {scanStatus === 'success' && <div className="fr-success-overlay"></div>}
          </div>

          <canvas ref={canvasRef} width="640" height="480" style={{ display: 'none' }}></canvas>

          <div className="fr-status-display">
            <h3 className={scanStatus === 'success' ? 'success-text' : scanStatus === 'failed' ? 'error-text' : 'scanning-text'}>
              {statusMessage}
            </h3>
          </div>

          <div className="fr-actions">
            {scanStatus === 'idle' || scanStatus === 'failed' ? (
              <button className="fr-start-btn" onClick={startBiometricScan}>
                {scanStatus === 'failed' ? 'Retry Facial Scan' : 'Start Facial Scan'}
              </button>
            ) : scanStatus === 'success' ? (
              <button className="fr-start-btn success-btn" disabled>
                Redirecting to Setup...
              </button>
            ) : (
              <button className="fr-start-btn scanning-btn" disabled>
                Please wait...
              </button>
            )}
          </div>

        </div>

        <div className="fr-instructions">
          <h3>Guidelines for a successful scan:</h3>
          <ul>
            <li>💡 Ensure you are in a well-lit room.</li>
            <li>🕶️ Remove glasses, masks, or hats.</li>
            <li>📸 Look directly into the camera lens.</li>
            <li>👤 Keep your face entirely within the guided frame.</li>
          </ul>
        </div>

      </div>
    </div>
  );
}

export default FaceRecognition;