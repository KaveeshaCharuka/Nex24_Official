import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './ExaminerCourses.css';

const ExaminerCourses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCourse, setNewCourse] = useState({ courseCode: '', courseName: '', semester: 1 });

  const fetchCourses = () => {
    setLoading(true);
    api.get('/courses')
      .then((response) => {
        setCourses(response.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching courses:", err);
        setError("Failed to load courses. Please check Backend!");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleAddCourse = async (e) => {
    e.preventDefault();
    try {
      await api.post('/courses', newCourse);
      alert('Course Added Successfully!');
      setNewCourse({ courseCode: '', courseName: '', semester: 1 });
      setShowAddForm(false);
      fetchCourses();
    } catch (err) {
      alert('Error adding course: ' + err.message);
    }
  };

  if (loading) return <div className="exam-courses-wrapper"><h3>Loading Courses... ⏳</h3></div>;
  if (error) return <div className="exam-courses-wrapper"><h3 style={{color: 'red'}}>{error}</h3></div>;

  return (
    <div className="exam-courses-wrapper">
      <div className="st-top-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <button className="back-dash-btn" style={{ background: '#111c32', color: '#94a3b8', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '8px 18px', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }} onClick={() => navigate('/examiner-dashboard')}>
          ← Back to Dashboard
        </button>
        <div className="st-brand-title" style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff' }}>
          <span className="brand-n" style={{ color: '#3b82f6' }}>N</span> Nex24 <span className="divider" style={{ color: '#334155', margin: '0 8px' }}>|</span> <span className="sub-title" style={{ color: '#3b82f6' }}>Examiner Portal</span>
        </div>
      </div>

      <div className="exam-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>My <span className="text-gradient">Teaching Courses</span> 🎓</h2>
          <p>Manage your ongoing and completed courses.</p>
        </div>
        <button className="view-btn" style={{ background: 'linear-gradient(90deg, #3b82f6, #0ea5e9)' }} onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? 'Close Form' : '+ Add New Subject'}
        </button>
      </div>

      {showAddForm && (
        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '12px', marginBottom: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <form onSubmit={handleAddCourse} style={{ display: 'flex', gap: '15px', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', marginBottom: '5px' }}>Subject Code</label>
              <input type="text" required value={newCourse.courseCode} onChange={e => setNewCourse({...newCourse, courseCode: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: 'none', background: 'rgba(0,0,0,0.5)', color: 'white' }} />
            </div>
            <div style={{ flex: 2 }}>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', marginBottom: '5px' }}>Subject Name</label>
              <input type="text" required value={newCourse.courseName} onChange={e => setNewCourse({...newCourse, courseName: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: 'none', background: 'rgba(0,0,0,0.5)', color: 'white' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', marginBottom: '5px' }}>Semester</label>
              <select required value={newCourse.semester} onChange={e => setNewCourse({...newCourse, semester: parseInt(e.target.value)})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: 'none', background: 'rgba(0,0,0,0.5)', color: 'white' }}>
                <option value="1">Semester 1</option>
                <option value="2">Semester 2</option>
                <option value="3">Semester 3</option>
                <option value="4">Semester 4</option>
                <option value="5">Semester 5</option>
                <option value="6">Semester 6</option>
                <option value="7">Semester 7</option>
                <option value="8">Semester 8</option>
              </select>
            </div>
            <button type="submit" className="view-btn" style={{ background: '#10b981', height: '39px', display: 'flex', alignItems: 'center' }}>Save Subject</button>
          </form>
        </div>
      )}

      <div className="exam-courses-grid">
        {courses.length === 0 ? (
          <p>No courses available. Add some courses to the Database!</p>
        ) : (
          courses.map((course) => (
            <div key={course.courseId || course.id} className="course-card">
              <div className="course-card-top">
                <h3>{course.courseName}</h3>
                <span className="status-badge active">
                  {course.courseCode}
                </span>
              </div>
              <div className="course-card-body">
                <p>Semester: <strong>{course.semester || 'N/A'}</strong></p>
                <p>Course Code: <strong>{course.courseCode}</strong></p>
              </div>
              <button className="view-btn">Manage Course</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ExaminerCourses;