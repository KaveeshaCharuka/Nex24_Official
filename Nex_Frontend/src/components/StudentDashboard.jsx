import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./StudentDashboard.css";
import NotificationDropdown from "./NotificationDropdown";
import {
  User,
  Bell,
  ChevronDown,
  ChevronRight,
  Star,
  Megaphone,
  GraduationCap,
  Search,
  BookOpen,
  LogOut,
} from "lucide-react";
import api from '../services/api';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const username = localStorage.getItem("userId");
        const response = await api.get(`/student/dashboard/data?username=${username}`);
        setDashboardData(response.data);
        
        const examsRes = await api.get('/exams');
        const allExams = examsRes.data || [];
        
        // Strict Linking: Only show exams for the student's enrolled courses that are not completed
        if (response.data && response.data.courses && response.data.courses.length > 0) {
            const myCourseIds = response.data.courses.map(c => c.courseId);
            const myExams = allExams.filter(exam => myCourseIds.includes(exam.courseId) && exam.status !== 'COMPLETED');
            setExams(myExams);
        } else {
            setExams([]);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("role");
    navigate("/login", { replace: true });
  };

  // Find the current active exam session created by an examiner
  const activeExam = exams.find(e => e.status === 'ACTIVE');

  const handleHeaderExamClick = () => {
    if (activeExam) {
      localStorage.setItem("role", "student");
      navigate("/student/face-registration", { 
        state: { nextPath: `/student/LiveExam/${activeExam.examId}`, context: 'exam' } 
      });
    } else if (exams.length > 0) {
      alert("⚠️ Your exam is scheduled, but your examiner has not activated the session yet. Please wait for your examiner to start the exam.");
    } else {
      alert("🔒 No active examinations found for your enrolled courses. You cannot enter the exam portal until an examiner creates and starts an exam.");
    }
  };

  return (
    <div className="student-container">
      {/* Top Navigation */}
      <nav className="student-nav">
        <div className="nav-logo">
          <span className="logo-icon"></span> Nex24
        </div>

        <div className="nav-center-links">
          <Link to="/student-dashboard">Dashboard (Home)</Link>
          <Link to="/student/courses">My Courses</Link>
          <Link to="/student/grades">Grades</Link>
          <Link to="/student/schedule">Schedule</Link>
          <Link to="/student/study-plan">Study Plan</Link>
          <Link to="/student/Profile">Profile</Link>
        </div>

        <div className="nav-right">
          <NotificationDropdown />
          <div className="nav-user-dropdown">
            <div className="user-avatar-micro student-avatar">
              <User size={14} color="#0f766e" />
            </div>
            <span>{dashboardData ? dashboardData.studentName : 'Student'}</span>
            <ChevronDown size={16} />
          </div>
          
          <button
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 12px",
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              color: "#ef4444",
              border: "1px solid #ef4444",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "bold",
              marginLeft: "15px",
              transition: "all 0.3s ease",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = "#ef4444";
              e.currentTarget.style.color = "#fff";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.1)";
              e.currentTarget.style.color = "#ef4444";
            }}
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </nav>

      {/* Header Section */}
      <div className="student-header">
        <div>
          <h1 className="cen">
            Welcome, <span className="highlight-blue">{dashboardData ? dashboardData.studentName : 'Student'}.</span>
          </h1>
          <p>Keep track of your academic progress.</p>
        </div>
        
        {/* Dynamic Exam Access Control - No direct entry without examiner exam */}
        <button
          className="primary-glow-btn"
          style={{
            background: activeExam 
              ? 'linear-gradient(90deg, #3b82f6, #06b6d4)' 
              : 'linear-gradient(90deg, #475569, #334155)',
            boxShadow: activeExam ? '0 0 15px rgba(59, 130, 246, 0.5)' : 'none',
            cursor: activeExam ? 'pointer' : 'not-allowed',
            opacity: activeExam ? 1 : 0.85
          }}
          onClick={handleHeaderExamClick}
        >
          {activeExam 
            ? `🚀 Enter Exam Portal (${activeExam.examTitle.length > 22 ? activeExam.examTitle.substring(0, 22) + '...' : activeExam.examTitle})` 
            : exams.length > 0 
              ? "📅 Exam Scheduled (Waiting for Examiner)" 
              : "🔒 No Active Exams Available"}
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '50px', textAlign: 'center', color: '#fff' }}>Loading dashboard data...</div>
      ) : (
        <div className="student-content-grid">
          {/* Left Column: My Courses */}
          <div className="grid-col col-courses">
            <div className="glass-card courses-card">
              <h2>My Courses</h2>
              
              {dashboardData?.courses?.length > 0 ? (
                dashboardData.courses.map((course, index) => (
                  <div className={`course-progress-item ${index > 0 ? 'mt-15' : ''}`} key={index}>
                    <div className="course-header">
                      <div>
                        <span className="course-label">Course Name</span>
                        <h3>{course.courseName}</h3>
                        <span className="instructor">Instructor: {course.instructor}</span>
                      </div>
                      <div className="course-icon">
                        <Search size={24} color="#0ea5e9" />
                      </div>
                    </div>
                    <div className="progress-bar-container">
                      <div
                        className={`progress-fill ${index % 2 === 0 ? 'fill-blue' : 'fill-green'}`}
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                    <div className="course-footer">
                      <span>{course.progress}% Complete</span>
                      {index % 2 === 0 ? (
                        <button className="action-btn">
                          Continue <ChevronRight size={14} />
                        </button>
                      ) : (
                        <button className="icon-only-btn">
                          <ChevronRight size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ color: 'rgba(255,255,255,0.7)', marginTop: '20px' }}>No courses enrolled yet.</p>
              )}
            </div>
          </div>

          {/* Middle Column: Grades & Announcements */}
          <div className="grid-col col-middle">
            <div className="glass-card grades-card">
              <h2>Recent Grades</h2>
              <div className="grade-list">
                {dashboardData?.recentGrades?.length > 0 ? (
                  dashboardData.recentGrades.map((grade, index) => (
                    <div className="grade-item" key={index}>
                      <Star size={16} className="text-cyan" />
                      <span>
                        {grade.title}: <strong>{grade.grade}</strong>
                      </span>
                    </div>
                  ))
                ) : (
                  <p style={{ color: 'rgba(255,255,255,0.7)' }}>No recent grades available.</p>
                )}
              </div>
            </div>
            
            {/* Real-time Linked Exams from Examiner */}
            <div className="glass-card mt-20" style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid #3b82f6' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ color: '#60a5fa' }}>Available Examinations 🚀</h2>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>Linked to your courses</span>
              </div>
              
              <div className="announcement-list" style={{ marginTop: '1rem' }}>
                {exams.length > 0 ? (
                  exams.map(exam => (
                    <div 
                      className="announcement-item" 
                      key={exam.examId} 
                      style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        padding: '12px',
                        marginBottom: '10px',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(255,255,255,0.03)',
                        border: exam.status === 'ACTIVE' ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid rgba(255,255,255,0.08)'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <strong style={{ color: 'white', fontSize: '15px' }}>{exam.examTitle}</strong>
                          <span style={{
                            fontSize: '11px',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontWeight: 'bold',
                            backgroundColor: exam.status === 'ACTIVE' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                            color: exam.status === 'ACTIVE' ? '#4ade80' : '#fbbf24',
                            border: `1px solid ${exam.status === 'ACTIVE' ? '#22c55e' : '#f59e0b'}`
                          }}>
                            {exam.status === 'ACTIVE' ? '🟢 LIVE NOW' : '📅 SCHEDULED'}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                          Duration: {exam.durationMinutes} Mins | Total Marks: {exam.totalMarks || 100}
                        </span>
                      </div>

                      {exam.status === 'ACTIVE' ? (
                        <button
                          style={{
                            background: 'linear-gradient(90deg, #22c55e, #06b6d4)',
                            color: 'white',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            boxShadow: '0 0 10px rgba(34, 197, 94, 0.4)'
                          }}
                          onClick={() => {
                            localStorage.setItem("role", "student");
                            navigate("/student/face-registration", { 
                              state: { nextPath: `/student/LiveExam/${exam.examId}`, context: 'exam' } 
                            }); 
                          }}
                        >
                          Start Exam 🚀
                        </button>
                      ) : (
                        <button
                          disabled
                          style={{
                            background: 'rgba(255, 255, 255, 0.08)',
                            color: '#94a3b8',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            padding: '8px 14px',
                            borderRadius: '6px',
                            cursor: 'not-allowed',
                            fontSize: '13px'
                          }}
                          title="Waiting for examiner to start the exam"
                        >
                          Starts Soon ⏳
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '20px 10px', textAlign: 'center', color: '#94a3b8' }}>
                    <p style={{ fontSize: '15px', color: '#cbd5e1' }}>🔒 No examinations scheduled right now.</p>
                    <span style={{ fontSize: '13px', color: '#64748b', display: 'block', marginTop: '4px' }}>
                      Examiners must create and activate an exam for your courses before you can take an exam.
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="glass-card announcements-card mt-20">
              <h2>Announcements</h2>
              <div className="announcement-list">
                <div className="announcement-item">
                  <Megaphone size={16} className="text-gray" />
                  <span>
                    <strong>System:</strong> Final exam security & proctoring policies updated.
                  </span>
                </div>
                <div className="announcement-item">
                  <Megaphone size={16} className="text-gray" />
                  <span>
                    <strong>Faculty:</strong> Please ensure your webcam and entire screen sharing are functional.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Overview & Completion */}
          <div className="grid-col col-stats">
            <div className="glass-card overview-card green-glow">
              <div className="card-header-flex">
                <h2>Academic Overview</h2>
                <GraduationCap size={20} className="text-green" />
              </div>
              <div className="gpa-display">
                <h3>Avg Score: {dashboardData?.gpa || 'N/A'}%</h3>
                <p>{dashboardData?.degreeProgram || 'General Course'}</p>
              </div>
            </div>

            <div className="glass-card completion-card green-glow mt-20">
              <h2>Overall Progress</h2>
              <div className="circular-progress-container">
                <div className="circular-chart">
                  <div className="inner-circle">
                    <span className="percentage">{dashboardData?.programCompletionPercentage || 0}%</span>
                    <span className="progress-label">
                      Course
                      <br />
                      Complete
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="student-footer">
        <div className="footer-left">
          Developed by <span className="highlight-blue">DevSpire Studios</span>
        </div>
        <div className="footer-links">
          <Link to="/privacy-policy">Privacy Policy</Link>
          <Link to="/terms-of-service">Terms of Service</Link>
          <Link to="/help-center">Help Center</Link>
        </div>
      </footer>
    </div>
  );
};

export default StudentDashboard;
