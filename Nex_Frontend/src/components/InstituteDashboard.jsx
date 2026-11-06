import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import NotificationDropdown from './NotificationDropdown';
import './InstituteDashboard.css';

function InstituteDashboard() {
  const navigate = useNavigate();

  // 'dashboard', 'register-student', 'invite-examiner'
  const [activeTab, setActiveTab] = useState('invite-examiner'); 

  // Stats State
  const [stats, setStats] = useState({ studentCount: 0, examinerCount: 0 });

  // Student Form State
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentId, setStudentId] = useState('');
  const [studentPhoto, setStudentPhoto] = useState(null);
  const [studentCourse, setStudentCourse] = useState(''); 
  const [studentMessage, setStudentMessage] = useState({ type: '', text: '' });

  // Examiner Form State
  const [examinerName, setExaminerName] = useState('');
  const [examinerEmail, setExaminerEmail] = useState('');
  const [examinerMessage, setExaminerMessage] = useState({ type: '', text: '' });
  const [isLoading, setIsLoading] = useState(false);
  
  const [courses, setCourses] = useState([]);

  // Course Form State
  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');
  const [semester, setSemester] = useState(1);
  const [courseMessage, setCourseMessage] = useState({ type: '', text: '' });

  // Load Dashboard Stats & Courses
  useEffect(() => {
    if (activeTab === 'dashboard') {
      api.get('/admin/dashboard-stats')
        .then(res => setStats(res.data))
        .catch(err => console.error("Stats Error:", err));
    }
    if (activeTab === 'register-student' || activeTab === 'add-course') {
      api.get('/courses')
        .then(res => setCourses(res.data))
        .catch(err => console.error("Courses Error:", err));
    }
  }, [activeTab]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handlePhotoUpload = (e) => {
    setStudentPhoto(e.target.files[0]);
  };

  // 1. API Call: Register Student
  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!studentPhoto) {
      setStudentMessage({ type: 'error', text: "❌ Reference photo is required!" });
      return;
    }
    if (!studentCourse) {
      setStudentMessage({ type: 'error', text: "❌ Please select a course!" });
      return;
    }
    
    setIsLoading(true);
    setStudentMessage({ type: '', text: '' });

    const formData = new FormData();
    formData.append('fullName', studentName);
    formData.append('indexNumber', studentId);
    formData.append('email', studentEmail);
    formData.append('courseId', studentCourse); 
    formData.append('image', studentPhoto);

    try {
      const response = await api.post('/admin/invite-student', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setStudentMessage({ type: 'success', text: `✅ ${response.data}` });
      setStudentName(''); setStudentEmail(''); setStudentId(''); setStudentPhoto(null); setStudentCourse('');
    } catch (error) {
      setStudentMessage({ type: 'error', text: `❌ ${error.response?.data || error.message}` });
    } finally {
      setIsLoading(false);
    }
  };

  // 2. API Call: Invite Examiner
  const handleAddExaminer = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setExaminerMessage({ type: '', text: '' });

    try {
      const response = await api.post('/admin/invite-examiner', {
        fullName: examinerName.trim(),
        email: examinerEmail.trim()
      });
      setExaminerMessage({ type: 'success', text: `✅ ${response.data}` });
      setExaminerName(''); setExaminerEmail('');
    } catch (error) {
      setExaminerMessage({ type: 'error', text: `❌ Error: ${error.response?.data?.message || error.response?.data || error.message}` });
    } finally {
      setIsLoading(false);
    }
  };

  // 3. API Call: Add Course
  const handleAddCourse = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setCourseMessage({ type: '', text: '' });

    try {
      const response = await api.post('/courses', {
        courseCode,
        courseName,
        semester,
        createdBy: 1 // Default admin ID
      });
      setCourseMessage({ type: 'success', text: `✅ Course ${response.data.courseCode} Added Successfully!` });
      setCourseCode(''); setCourseName(''); setSemester(1);
      // Refresh course list
      api.get('/courses').then(res => setCourses(res.data));
    } catch (error) {
      setCourseMessage({ type: 'error', text: `❌ Error: ${error.response?.data || error.message}` });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="id-wrapper">
      
      {/* ================= SIDEBAR ================= */}
      <div className="id-sidebar">
        <div>
          <div className="id-sidebar-brand">
            Institute Admin
          </div>
          
          <div className="id-nav-menu">
            <button 
              className={`id-nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              📊 Dashboard
            </button>
            <button 
              className={`id-nav-btn ${activeTab === 'add-course' ? 'active' : ''}`}
              onClick={() => setActiveTab('add-course')}
            >
              📚 Manage Courses
            </button>
            <button 
              className={`id-nav-btn ${activeTab === 'register-student' ? 'active' : ''}`}
              onClick={() => setActiveTab('register-student')}
            >
              👨‍🎓 Register Student
            </button>
            <button 
              className={`id-nav-btn ${activeTab === 'invite-examiner' ? 'active' : ''}`}
              onClick={() => setActiveTab('invite-examiner')}
            >
              👩‍🏫 Invite Examiner
            </button>
          </div>
        </div>

        <button className="id-logout-btn" onClick={handleLogout}>
          🚪 Logout
        </button>
      </div>

      {/* ================= MAIN CONTENT ================= */}
      <div className="id-main-content">
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
          <NotificationDropdown />
        </div>
        
        {activeTab === 'dashboard' && (
          <div>
            <div className="id-header">
              <h1>System <span className="blue-text">Overview</span></h1>
              <p>Real-time statistics of the Nex24 platform.</p>
            </div>
            <div className="id-stats-grid">
              <div className="id-stat-box">
                <span className="stat-num">{stats.studentCount}</span>
                <span className="stat-title">Total Students</span>
              </div>
              <div className="id-stat-box">
                <span className="stat-num">{stats.examinerCount}</span>
                <span className="stat-title">Total Examiners</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'register-student' && (
          <div>
            <div className="id-header">
              <h1>Student <span className="blue-text">Onboarding</span></h1>
            </div>
            <div className="id-card">
              <h3>Admin - Register New Student</h3>
              <p className="id-card-sub">Generate biometric profiles and send activation emails.</p>
              
              <form onSubmit={handleAddStudent}>
                <div className="id-input-group">
                  <input type="text" placeholder="Full Name" value={studentName} onChange={(e) => setStudentName(e.target.value)} className="id-input" required />
                </div>
                <div className="id-input-group">
                  <input type="email" placeholder="Email Address" value={studentEmail} onChange={(e) => setStudentEmail(e.target.value)} className="id-input" required />
                </div>
                <div className="id-input-group">
                  <input type="text" placeholder="Index Number" value={studentId} onChange={(e) => setStudentId(e.target.value)} className="id-input" required />
                </div>
                <div className="id-input-group">
                  <select value={studentCourse} onChange={(e) => setStudentCourse(e.target.value)} className="id-input" required>
                    <option value="" disabled>-- Select Course --</option>
                    {courses.map(c => (
                      <option key={c.id || c.courseId} value={c.id || c.courseId}>{c.courseCode} - {c.courseName}</option>
                    ))}
                  </select>
                </div>
                <div className="id-input-group">
                  <label className="id-file-upload-box">
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} hidden />
                    {studentPhoto ? `✔️ ${studentPhoto.name} selected` : '📁 Click to Upload AI Reference Photo'}
                  </label>
                </div>

                <button type="submit" className="id-btn-primary" disabled={isLoading}>
                  {isLoading ? 'Sending...' : 'Register Student'}
                </button>
              </form>

              {studentMessage.text && (
                <div className={studentMessage.type === 'error' ? 'error-box' : 'success-box'}>
                  {studentMessage.text}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'add-course' && (
          <div>
            <div className="id-header">
              <h1>Course <span className="blue-text">Management</span></h1>
            </div>
            <div className="id-card">
              <h3>Add New Semester Subject</h3>
              <form onSubmit={handleAddCourse}>
                <div className="id-input-group">
                  <input type="text" placeholder="Course Code (e.g. CS101)" value={courseCode} onChange={(e) => setCourseCode(e.target.value)} className="id-input" required />
                </div>
                <div className="id-input-group">
                  <input type="text" placeholder="Course Name (e.g. Data Structures)" value={courseName} onChange={(e) => setCourseName(e.target.value)} className="id-input" required />
                </div>
                <div className="id-input-group">
                  <select value={semester} onChange={(e) => setSemester(Number(e.target.value))} className="id-input" required>
                    <option value={1}>Semester 1</option>
                    <option value={2}>Semester 2</option>
                    <option value={3}>Semester 3</option>
                    <option value={4}>Semester 4</option>
                    <option value={5}>Semester 5</option>
                    <option value={6}>Semester 6</option>
                    <option value={7}>Semester 7</option>
                    <option value={8}>Semester 8</option>
                  </select>
                </div>
                <button type="submit" className="id-btn-primary" disabled={isLoading}>
                  {isLoading ? 'Adding...' : 'Add Course'}
                </button>
              </form>

              {courseMessage.text && (
                <div className={courseMessage.type === 'error' ? 'error-box' : 'success-box'}>
                  {courseMessage.text}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'invite-examiner' && (
          <div>
            <div className="id-header">
              <h1>Examiner <span className="blue-text">Onboarding</span></h1>
            </div>
            
            {/* මේක හරියටම ඔයාගේ Screenshot එකේ තියෙන UI එක වගේ */}
            <div className="id-card" style={{ margin: '0 auto' }}>
              <h3>Admin - Register New Examiner</h3>
              <br/>
              <form onSubmit={handleAddExaminer}>
                <div className="id-input-group">
                  <input 
                    type="text" 
                    placeholder="Examiner Name (e.g. kiz)" 
                    value={examinerName}
                    onChange={(e) => setExaminerName(e.target.value)}
                    className="id-input" 
                    required 
                  />
                </div>

                <div className="id-input-group">
                  <input 
                    type="email" 
                    placeholder="Email (e.g. funnygamerslive@gmail.com)" 
                    value={examinerEmail}
                    onChange={(e) => setExaminerEmail(e.target.value)}
                    className="id-input" 
                    required 
                  />
                </div>

                <button type="submit" className="id-btn-primary" disabled={isLoading}>
                  {isLoading ? 'Processing...' : 'Invite Examiner'}
                </button>
              </form>

              {/* ඔයාගේ පින්තූරයේ තියෙන Error / Success මැසේජ් පෙන්නන තැන */}
              {examinerMessage.text && (
                <div className={examinerMessage.type === 'error' ? 'error-box' : 'success-box'}>
                  {examinerMessage.text}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default InstituteDashboard;