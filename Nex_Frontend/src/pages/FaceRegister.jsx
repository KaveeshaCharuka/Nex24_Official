import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import './FaceRegister.css'; 

const FaceRegister = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('tempUsername'); // Using tempUsername from URL
  const navigate = useNavigate();
  
  const videoRef = useRef();
  const [isScanning, setIsScanning] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Loading Camera...");
  
  // Form fields
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // 1. Start Camera on Load
  useEffect(() => {
    startCamera();
    return () => {
      // Cleanup camera on unmount
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = () => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setStatusMessage("Position your face clearly in the camera and fill out the form.");
      })
      .catch((err) => {
        setStatusMessage("Camera access denied! Please allow camera permissions.");
        console.error(err);
      });
  };

  // 3. Scan and Register
  const scanAndRegisterFace = async (e) => {
    e.preventDefault();

    if (!token) {
      alert("Invalid or missing registration token (tempUsername)!");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    if (!otp || !newPassword) {
      alert("Please fill out all fields.");
      return;
    }

    setIsScanning(true);
    setStatusMessage("Capturing face and verifying with AI...");

    try {
      // Capture frame
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(async (blob) => {
        const formData = new FormData();
        formData.append('tempUsername', token);
        formData.append('otp', otp);
        formData.append('newPassword', newPassword);
        formData.append('faceImage', blob, 'live_scan.jpg');

        try {
          const response = await fetch('http://localhost:8080/api/auth/activate-student', {
            method: 'POST',
            body: formData, // Sending as multipart/form-data
          });

          if (response.ok) {
            const data = await response.text();
            alert(data || "Account Activated Successfully! Please login to continue.");
            
            // Stop camera
            if (videoRef.current && videoRef.current.srcObject) {
              const stream = videoRef.current.srcObject;
              const tracks = stream.getTracks();
              tracks.forEach(track => track.stop());
            }

            navigate('/login'); 
            
          } else {
            const errData = await response.text();
            setStatusMessage(`Failed: ${errData}`);
            setIsScanning(false);
          }
        } catch (err) {
          setStatusMessage("Failed to communicate with server.");
          setIsScanning(false);
        }
      }, 'image/jpeg');

    } catch (error) {
      setStatusMessage("An error occurred during scanning or saving.");
      setIsScanning(false);
      console.error(error);
    }
  };

  return (
    <div className="register-container">
      <div className="login-card" style={{ width: '600px', textAlign: 'center' }}>
        <h2>Nex<span>24</span> Identity Verification</h2>
        <p style={{ color: '#aaa', marginBottom: '20px' }}>
          Secure Biometric Enrollment
        </p>
        
        <div className="video-container" style={{ margin: '0 auto', background: '#000', borderRadius: '10px', overflow: 'hidden', width: '400px', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <video ref={videoRef} autoPlay playsInline muted width="400" height="300" style={{ objectFit: 'cover' }} />
        </div>

        <p style={{ margin: '20px 0', fontWeight: 'bold', color: '#3b82f6' }}>{statusMessage}</p>

        <form onSubmit={scanAndRegisterFace} style={{ display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center' }}>
          <input 
            type="text" 
            placeholder="Enter OTP from Email" 
            value={otp} 
            onChange={e => setOtp(e.target.value)}
            style={{ padding: '10px', width: '80%', borderRadius: '5px', border: '1px solid #ccc' }}
            required
          />
          <input 
            type="password" 
            placeholder="Create New Password" 
            value={newPassword} 
            onChange={e => setNewPassword(e.target.value)}
            style={{ padding: '10px', width: '80%', borderRadius: '5px', border: '1px solid #ccc' }}
            required
          />
          <input 
            type="password" 
            placeholder="Confirm Password" 
            value={confirmPassword} 
            onChange={e => setConfirmPassword(e.target.value)}
            style={{ padding: '10px', width: '80%', borderRadius: '5px', border: '1px solid #ccc' }}
            required
          />
          
          <button type="submit" disabled={isScanning} className="login-btn" style={{ width: 'auto', padding: '10px 20px', backgroundColor: '#10b981', marginTop: '10px' }}>
            {isScanning ? "Processing AI Match..." : "Verify & Activate Account"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FaceRegister;