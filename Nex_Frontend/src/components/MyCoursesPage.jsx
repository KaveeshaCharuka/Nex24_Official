import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './MyCoursesPage.css';

function MyCoursesPage() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/courses')
      .then(response => {
        setCourses(response.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching student courses:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div className="courses-page-wrapper">
      <div className="st-top-bar" style={{ padding: '0 0 25px 0' }}>
        <button className="back-dash-btn" onClick={() => navigate('/student-dashboard')}>
          ← Back to Dashboard
        </button>
      </div>
      <h3>Loading Your Courses... ⏳</h3>
    </div>
  );

  return (
    <div className="courses-page-wrapper">
      <div className="st-top-bar" style={{ padding: '0 0 25px 0' }}>
        <button className="back-dash-btn" onClick={() => navigate('/student-dashboard')}>
          ← Back to Dashboard
        </button>
        <div className="st-brand-title">
          <span className="brand-n">N</span> Nex24 <span className="divider">|</span> <span className="sub-title">Enrolled Courses</span>
        </div>
      </div>

      <div className="courses-header">
        <h2>My <span className="text-gradient">Courses</span></h2>
        <p>Access your ongoing academic courses and learning materials.</p>
      </div>

      <div className="courses-grid">
        {courses.length === 0 ? (
          <p>You are not enrolled in any courses yet.</p>
        ) : (
          courses.map((course, idx) => (
            <div key={course.courseId || course.id || idx} className="course-card">
              <div className="course-top">
                <div>
                  <span className="course-label">COURSE CODE: {course.courseCode}</span>
                  <h3 className="course-title">{course.courseName}</h3>
                  <p className="instructor-name">Status: Ongoing</p>
                </div>
              </div>

              <div className="progress-section">
                <div className="progress-bar-track">
                  <div className="progress-bar-fill bg-blue" style={{ width: '100%' }}></div>
                </div>
                <div className="progress-footer">
                  <span>Registered</span>
                  <button className="continue-btn">Enter Course &gt;</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default MyCoursesPage;