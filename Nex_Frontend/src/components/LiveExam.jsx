import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import './LiveExam.css';

function LiveExam() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const screenVideoRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const [cameraError, setCameraError] = useState(false);
  const [screenShareActive, setScreenShareActive] = useState(false);

  // States
  const [examInfo, setExamInfo] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0); 
  const [proctorStatus, setProctorStatus] = useState('active'); // active, warning
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [violationCount, setViolationCount] = useState(0);
  const [fullscreenExited, setFullscreenExited] = useState(false);

  // Industry-Standard Continuous Biometric Verification States
  const [biometricStatus, setBiometricStatus] = useState({
    verified: true,
    score: 95,
    msg: "Candidate Verified"
  });
  const [showImpersonationModal, setShowImpersonationModal] = useState(false);
  const [ecoMode] = useState(true);

  // Persistent Off-screen Canvas Refs (Eliminates GC Churn & Boosts Frame Rate Smoothness)
  const offscreenCanvasRef = useRef(null);
  const screenCanvasRef = useRef(null);

  // Anomaly persistence counter to prevent single-frame flickering false alarms
  const anomalyCounters = useRef({ lookingAway: 0, noFace: 0, impersonation: 0 });
  const cycleCounter = useRef(0);
  const lastFaceDetected = useRef(true);

  // Dynamic Proctor Logs
  const [proctorLogs, setProctorLogs] = useState([
    { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), msg: "Exam Started - Secure Proctoring Active", type: "normal" }
  ]);

  const username = localStorage.getItem('username') || localStorage.getItem('userId') || "Student"; 

  // Centralized Alert Logger with Maximum Violation Lockdown
  const logAlert = useCallback(async (issueMsg) => {
    setProctorStatus('warning');
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setProctorLogs(prev => [{ time: timeNow, msg: issueMsg, type: "alert" }, ...prev].slice(0, 8));

    setViolationCount(prev => {
      const nextCount = prev + 1;
      if (nextCount >= 5) {
        alert("🚨 EXAM TERMINATED: You have reached 5 proctoring violations (Tab switching / DevTools / Screen sharing failure). Your exam is being automatically submitted.");
        submitExamData();
      }
      return nextCount;
    });

    try {
      await api.post(`/exams/${examId}/log`, { 
        username: username, 
        severity: "ALERT", 
        issueDetails: issueMsg 
      });
    } catch (err) { 
      console.error("Failed to log proctor alert:", err); 
    }
  }, [examId, username]);

  // 1. Fetch Exam Data
  useEffect(() => {
    const fetchExam = async () => {
      try {
        const response = await api.get(`/exams/${examId}`);
        const data = response.data;
        
        setExamInfo(data);
        setTimeLeft(data.durationMinutes * 60);

        const formattedQuestions = data.questions.map(q => {
          const count = q.optionCount || 4;
          const options = [
            { label: 'A', text: q.optionA },
            { label: 'B', text: q.optionB }
          ];
          if (count >= 3 && q.optionC) options.push({ label: 'C', text: q.optionC });
          if (count >= 4 && q.optionD) options.push({ label: 'D', text: q.optionD });
          if (count >= 5 && q.optionE) options.push({ label: 'E', text: q.optionE });

          return {
            id: q.id,
            text: q.questionText,
            options: options
          };
        });
        
        setQuestions(formattedQuestions);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching exam:", err);
        alert("Failed to load exam. Please try again.");
        navigate('/student-dashboard');
      }
    };
    
    if (examId) {
      fetchExam();
      api.post(`/exams/${examId}/log`, { username: username, severity: "INFO", issueDetails: "Exam Started - Secure Environment Initialized" }).catch(() => {});
    }
  }, [examId, navigate, username]);

  // 2. Timer Countdown Effect
  useEffect(() => {
    if (loading) return;

    if (timeLeft <= 0) {
      handleAutoSubmit(); 
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeLeft, loading]);

  // 3. Automated Screen Sharing with "Entire Screen" Pre-selection
  const startScreenShare = useCallback(async () => {
    try {
      // Constraints to automate "Entire Screen" selection:
      // displaySurface: "monitor" directs Chrome/Edge directly to the "Entire Screen" tab
      // selfBrowserSurface: "exclude" prevents accidental tab selection
      const screenConstraints = {
        video: {
          displaySurface: "monitor",
        },
        audio: false,
        preferCurrentTab: false,
        selfBrowserSurface: "exclude",
        systemAudio: "exclude",
        surfaceSwitching: "exclude",
        monitorTypeSurfaces: "include"
      };

      const stream = await navigator.mediaDevices.getDisplayMedia(screenConstraints);
      if (screenVideoRef.current) {
        screenVideoRef.current.srcObject = stream;
      }
      setScreenShareActive(true);

      const videoTrack = stream.getVideoTracks()[0];
      const settings = videoTrack.getSettings ? videoTrack.getSettings() : {};
      if (settings.displaySurface && settings.displaySurface !== 'monitor') {
        logAlert("Notice: You shared a window/tab. Exam policy requires sharing your Entire Screen.");
      }

      videoTrack.onended = () => {
        setScreenShareActive(false);
        logAlert("CRITICAL: Screen sharing was closed by the candidate!");
      };

    } catch (err) {
      console.warn("Screen share request:", err);
      setScreenShareActive(false);
      logAlert("Notice: Screen sharing is required. Please click 'Auto-Share Screen' and select your Entire Screen.");
    }
  }, [logAlert]);

  // 4. Security: Mid-Exam Token Expiration Defense
  useEffect(() => {
    const refreshInterval = setInterval(async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const res = await api.post('/auth/refresh-token');
          if (res.data?.token) {
            localStorage.setItem('token', res.data.token);
          }
        }
      } catch (e) {
        console.warn("Silent token refresh heartbeat:", e);
      }
    }, 15 * 60 * 1000);

    return () => clearInterval(refreshInterval);
  }, []);

  // 5. Security: DevTools & Shortcut Manipulation Defense
  useEffect(() => {
    const handleContextMenu = (e) => {
      e.preventDefault();
      logAlert("Security Violation: Right-click context menu is disabled!");
    };

    const handleKeyDown = (e) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && ['I', 'i', 'J', 'j', 'C', 'c'].includes(e.key)) ||
        (e.ctrlKey && ['U', 'u', 'S', 's', 'p', 'P'].includes(e.key))
      ) {
        e.preventDefault();
        logAlert("Security Violation: Developer Tools / Source Inspection shortcut blocked!");
      }
    };

    const checkDevTools = setInterval(() => {
      const threshold = 160;
      const widthDiff = window.outerWidth - window.innerWidth > threshold;
      const heightDiff = window.outerHeight - window.innerHeight > threshold;
      if (widthDiff || heightDiff) {
        logAlert("Security Violation: Developer Console dock detected!");
      }
    }, 3000);

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
      clearInterval(checkDevTools);
    };
  }, [logAlert]);

  // 6. Security: Fullscreen Enforcement & Tab Switching Defense
  useEffect(() => {
    const enterFullscreen = async () => {
      try {
        if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
      } catch (err) {
        // Browser gesture policy may require manual click
      }
    };
    enterFullscreen();

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setFullscreenExited(true);
        logAlert("Security Warning: Fullscreen mode exited! Return to fullscreen immediately.");
      } else {
        setFullscreenExited(false);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        logAlert("Security Violation: Browser tab switched or minimized!");
      }
    };

    const handleWindowBlur = () => {
      logAlert("Security Warning: Window lost focus (Application switched)!");
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, [logAlert]);

  // 7. Live Proctoring Camera, Audio, & Auto-Start Screen Share
  useEffect(() => {
    let currentStream = null;

    const startProctorCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        currentStream = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // Auto-prompt screen share on launch
        startScreenShare();

        // Audio Detection Setup
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        audioContextRef.current = audioCtx;
        const analyser = audioCtx.createAnalyser();
        analyserRef.current = analyser;
        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);
        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        let loudCount = 0;
        const checkAudio = setInterval(() => {
          if (!analyserRef.current) return;
          analyserRef.current.getByteFrequencyData(dataArray);
          const avg = dataArray.reduce((a, b) => a + b, 0) / bufferLength;
          if (avg > 52) {
            loudCount++;
            if (loudCount > 3) {
              logAlert("Audio detected! Possible unauthorized speech.");
              loudCount = 0;
            }
          } else {
            loudCount = 0;
          }
        }, 1000);

        setProctorStatus('active');
        return () => clearInterval(checkAudio);

      } catch (err) {
        console.error("Proctor camera error:", err);
        setCameraError(true);
        logAlert("Camera/Microphone access denied!");
      }
    };

    let cleanupAudio = () => {};
    startProctorCamera().then(cleanup => { if (cleanup) cleanupAudio = cleanup; });

    return () => {
      cleanupAudio();
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, [logAlert, startScreenShare]);

  // 8. AI Proctoring: Calibrated Rules Engine & Consecutive Violation Filter
  useEffect(() => {
    // Initialize persistent offscreen canvases once to avoid GC churn & frame drops
    if (!offscreenCanvasRef.current) {
      const c = document.createElement('canvas');
      c.width = 480;
      c.height = 360;
      offscreenCanvasRef.current = c;
    }
    if (!screenCanvasRef.current) {
      const sc = document.createElement('canvas');
      sc.width = 640;
      sc.height = 360;
      screenCanvasRef.current = sc;
    }

    const monitorInterval = setInterval(() => {
      let camBase64 = "";
      let screenBase64 = "";
      
      cycleCounter.current++;
      // Dual-cadence scheduling:
      // YOLO runs every cycle (3s).
      // ArcFace Biometrics runs every 4 cycles (~12s), or immediately if face re-emerges or anomaly counter > 0
      const shouldCheckIdentity = (cycleCounter.current % 4 === 0) || (!lastFaceDetected.current) || (anomalyCounters.current.impersonation > 0);

      // 1. Grab Cam Frame via persistent canvas
      if (videoRef.current && videoRef.current.readyState === 4 && !cameraError) {
        const canvas = offscreenCanvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        camBase64 = canvas.toDataURL('image/jpeg', 0.6);
        
        canvas.toBlob(async (blob) => {
          if (!blob) return;
          const formData = new FormData();
          formData.append('frame', blob, 'frame.jpg');
          formData.append('username', username);
          formData.append('check_identity', shouldCheckIdentity ? 'true' : 'false');

          try {
            const response = await fetch('http://127.0.0.1:5000/monitor-frame', {
              method: 'POST',
              body: formData,
            });
            const data = await response.json();

            // Calibrated AI Proctoring Rules:
            // 1. Impersonation / Biometric Identity Check
            if (data.biometric_confidence !== undefined) {
              const isMatch = !data.impersonation_detected;
              setBiometricStatus({
                verified: isMatch,
                score: data.biometric_confidence,
                msg: isMatch ? "Identity Verified" : "Identity Mismatch"
              });

              if (data.impersonation_detected) {
                anomalyCounters.current.impersonation++;
                if (anomalyCounters.current.impersonation >= 2) {
                  setShowImpersonationModal(true);
                  logAlert("CRITICAL: Candidate Impersonation Detected! Facial biometrics mismatch with registered student.");
                }
              } else {
                anomalyCounters.current.impersonation = 0;
                setShowImpersonationModal(false);
              }
            }

            // Update face detection state
            lastFaceDetected.current = !!data.face_detected;

            // 2. Critical violations -> Alert immediately
            if (data.phone_detected) {
              logAlert("Unauthorized mobile phone detected in candidate hand/view!");
            } else if (data.multiple_persons) {
              logAlert("Multiple individuals detected in webcam feed!");
            } else if (data.unauthorized_object_detected) {
              logAlert("Unauthorized study material / secondary screen detected!");
            } else if (data.spoof_detected) {
              logAlert(`Presentation Attack Warning: ${data.liveness_reason || 'Photo/Screen spoof'}`);
            } 
            // 3. Posture & Gaze checks -> Apply consecutive cycle filter (2 checks = 6 seconds) to avoid reading false alarms
            else if (data.looking_away) {
              anomalyCounters.current.lookingAway++;
              if (anomalyCounters.current.lookingAway >= 2) {
                logAlert("Candidate looking away from the exam screen!");
                anomalyCounters.current.lookingAway = 0;
              }
            } else if (!data.face_detected) {
              anomalyCounters.current.noFace++;
              if (anomalyCounters.current.noFace >= 2) {
                logAlert("No candidate face detected! Please face the webcam.");
                anomalyCounters.current.noFace = 0;
              }
            } else {
              // Candidate is clean and compliant
              anomalyCounters.current.lookingAway = 0;
              anomalyCounters.current.noFace = 0;
              if (!data.impersonation_detected) {
                setProctorStatus('active');
              }
            }

          } catch (error) {
            // Ignore temporary AI server polling blips
          }
        }, 'image/jpeg', 0.6);
      }

      // 2. Grab Screen Frame via persistent canvas (Zero GC churn)
      if (screenVideoRef.current && screenVideoRef.current.readyState === 4) {
        const sCanvas = screenCanvasRef.current;
        const sCtx = sCanvas.getContext('2d');
        sCtx.drawImage(screenVideoRef.current, 0, 0, sCanvas.width, sCanvas.height);
        screenBase64 = sCanvas.toDataURL('image/jpeg', 0.5);
      }

      // 3. Send Streams to Java Backend
      if (camBase64 || screenBase64) {
        try {
          api.post(`/exams/live-stream/${username}`, {
            camBase64: camBase64,
            screenBase64: screenBase64
          }).catch(() => {});
        } catch (e) { /* ignore */ }
      }

    }, 3000);

    return () => clearInterval(monitorInterval);
  }, [cameraError, examId, username, logAlert]);

  // Format Time
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleOptionSelect = (qId, optionLabel) => {
    setAnswers({ ...answers, [qId]: optionLabel });
  };

  // 9. Submit Exam (Race Condition & Thundering Herd Defense)
  const handleSubmit = async () => {
    if (isSubmitting) return;
    if (window.confirm("Are you sure you want to submit the exam? You cannot undo this action.")) {
      await submitExamData();
    }
  };

  const handleAutoSubmit = async () => {
    if (isSubmitting) return;
    alert("Time is up! Your exam will be automatically submitted.");
    await submitExamData();
  };

  const submitExamData = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const payload = {
        username: username,
        answers: answers
      };
      
      const response = await api.post(`/exams/${examId}/submit`, payload);
      const message = response.data;
      const scoreMatch = message.match(/Score: (.+)/);
      const score = scoreMatch ? scoreMatch[1] : 'Submitted';
      
      navigate('/student/exam-result', { state: { score: score, examTitle: examInfo?.examTitle } }); 
    } catch (error) {
      console.error("Error submitting exam:", error);
      alert(error.response?.data || "Error submitting exam. Please check your submission.");
      setIsSubmitting(false);
    }
  };

  const requestFullscreenAgain = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20%' }}><h2>Loading Exam...</h2></div>;
  }

  return (
    <div className="live-exam-wrapper">
      
      {/* Fullscreen Warning Modal Overlay */}
      {fullscreenExited && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.85)',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          textAlign: 'center',
          padding: '20px'
        }}>
          <h2 style={{ color: '#ef4444', fontSize: '28px', marginBottom: '15px' }}>⚠️ Fullscreen Mode Required</h2>
          <p style={{ maxWidth: '500px', fontSize: '16px', lineHeight: '1.6', marginBottom: '25px' }}>
            You have exited fullscreen mode. Leaving fullscreen or switching windows is a proctoring violation ({violationCount}/5 violations).
          </p>
          <button 
            onClick={requestFullscreenAgain}
            style={{
              padding: '12px 28px',
              backgroundColor: '#3b82f6',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Re-enter Fullscreen Mode
          </button>
        </div>
      )}

      {/* Impersonation Warning Overlay Modal */}
      {showImpersonationModal && (
        <div className="impersonation-warning-overlay">
          <div className="impersonation-warning-box">
            <span className="warn-icon">🚨</span>
            <div>
              <h4>Candidate Identity Verification Warning</h4>
              <p>
                Current facial biometrics do not match registered candidate <strong>{username}</strong> (Match: {biometricStatus.score}%). Please face the camera directly in a well-lit environment.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <nav className="le-topbar">
        <div className="le-brand">
          <span className="brand-n">N</span> Nex24 <span className="title-divider">|</span> {examInfo?.examTitle}
        </div>
        <div className="le-timer-box">
          <span className="timer-icon">⏳</span> Time Remaining: 
          <span className={`timer-text ${timeLeft < 300 ? 'danger' : ''}`}>
            {formatTime(timeLeft)}
          </span>
        </div>
        <button 
          className="le-submit-btn-top" 
          onClick={handleSubmit}
          disabled={isSubmitting}
          style={{ opacity: isSubmitting ? 0.6 : 1, cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Exam'}
        </button>
      </nav>

      <div className="le-container">
        
        {/* LEFT COLUMN: Questions Area */}
        <div className="le-main-content">
          <div className="le-question-card">
            
            <div className="le-q-header">
              <h3>Question {currentQIndex + 1} of {questions.length}</h3>
              {violationCount > 0 && (
                <span style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '13px' }}>
                  Violations: {violationCount}/5
                </span>
              )}
            </div>

            <div className="le-q-body">
              <p className="le-question-text">{questions[currentQIndex]?.text}</p>
              
              <div className="le-options-list">
                {questions[currentQIndex]?.options.map((opt, idx) => (
                  <label 
                    key={idx} 
                    className={`le-option-item ${answers[questions[currentQIndex].id] === opt.label ? 'selected' : ''}`}
                  >
                    <input 
                      type="radio" 
                      name={`q-${questions[currentQIndex].id}`} 
                      value={opt.label}
                      checked={answers[questions[currentQIndex].id] === opt.label}
                      onChange={() => handleOptionSelect(questions[currentQIndex].id, opt.label)}
                      hidden
                    />
                    <div className="le-custom-radio"></div>
                    <span className="le-opt-text">{opt.text}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="le-q-footer">
              <button 
                className="le-nav-btn" 
                disabled={currentQIndex === 0}
                onClick={() => setCurrentQIndex(prev => prev - 1)}
              >
                ← Previous
              </button>
              
              {currentQIndex === questions.length - 1 ? (
                <button 
                  className="le-nav-btn finish-btn" 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Finish & Submit ✔️'}
                </button>
              ) : (
                <button 
                  className="le-nav-btn next-btn" 
                  onClick={() => setCurrentQIndex(prev => prev + 1)}
                >
                  Next Question →
                </button>
              )}
            </div>
          </div>

          {/* Navigator Panel */}
          <div className="le-navigator-card">
            <h4>Question Navigator</h4>
            <div className="le-nav-grid">
              {questions.map((q, idx) => (
                <button 
                  key={q.id}
                  className={`le-nav-bubble ${answers[q.id] ? 'answered' : ''} ${currentQIndex === idx ? 'current' : ''}`}
                  onClick={() => setCurrentQIndex(idx)}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
            <div className="le-nav-legend">
              <span><div className="legend-box answered"></div> Answered</span>
              <span><div className="legend-box unanswered"></div> Unanswered</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Proctoring Panel */}
        <div className="le-sidebar">
          
          <div className="le-proctor-card">
            <div className="proctor-header">
              <h3>Live Proctoring</h3>
              <span className="live-badge"><span className="pulse-dot"></span> LIVE</span>
            </div>

            <div className={`le-camera-feed ${proctorStatus === 'warning' ? 'warning-border' : ''}`}>
              <div className="proctor-brackets">
                <div className="p-bracket p-tl"></div>
                <div className="p-bracket p-tr"></div>
                <div className="p-bracket p-bl"></div>
                <div className="p-bracket p-br"></div>
              </div>

              {!cameraError ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: 'inherit'
                  }}
                />
              ) : (
                <div className="cam-placeholder">
                  <span className="face-silhouette">👤</span>
                </div>
              )}
              <video
                ref={screenVideoRef}
                autoPlay
                playsInline
                muted
                style={{ display: 'none' }}
              />
              <div className="face-scan-line"></div>
            </div>

            {/* Biometric Integrity HUD Badge */}
            <div className={`biometric-hud ${biometricStatus.verified ? 'bio-verified' : 'bio-alert'}`}>
              <span className="bio-icon">{biometricStatus.verified ? '🛡️' : '🚨'}</span>
              <div className="bio-info">
                <span className="bio-title">{biometricStatus.msg}</span>
                <span className="bio-score">Biometric Match: {biometricStatus.score}%</span>
              </div>
            </div>

            {/* Screen Share Status Bar & Quick Automation Button */}
            <div style={{
              marginTop: '12px',
              padding: '8px 12px',
              borderRadius: '6px',
              backgroundColor: screenShareActive ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              border: screenShareActive ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid rgba(239, 68, 68, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px'
            }}>
              <span style={{ fontSize: '12px', color: screenShareActive ? '#4ade80' : '#f87171', fontWeight: 'bold' }}>
                {screenShareActive ? "🖥️ Entire Screen Active" : "⚠️ Screen Share Offline"}
              </span>
              {!screenShareActive && (
                <button 
                  onClick={startScreenShare}
                  style={{
                    padding: '4px 10px',
                    fontSize: '11px',
                    backgroundColor: '#3b82f6',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    boxShadow: '0 0 10px rgba(59, 130, 246, 0.5)'
                  }}
                >
                  🚀 Auto-Share Screen
                </button>
              )}
            </div>

            <div className="proctor-status-info">
              <p className="status-label">AI Proctor Status:</p>
              {proctorStatus === 'active' ? (
                <p className="status-val success">✔️ Candidate Verified & Clean</p>
              ) : (
                <p className="status-val error">⚠️ Warning: Suspicious Activity Detected!</p>
              )}
            </div>

            <div className="proctor-warnings">
              <h4>System Security Logs</h4>
              <ul className="log-list">
                {proctorLogs.map((log, idx) => (
                  <li key={idx} className={`log-item ${log.type === 'alert' ? 'alert' : 'normal'}`}>
                    {log.time} - {log.msg}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="le-info-card">
            <h4>Candidate Details</h4>
            <p><strong>Name:</strong> {username}</p>
            <p className="warning-text">Anti-cheat active: Tab switching, DevTools, and exiting fullscreen are strictly monitored.</p>
          </div>

        </div>

      </div>
    </div>
  );
}

export default LiveExam;