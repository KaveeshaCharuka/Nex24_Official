import React from 'react';
import { useNavigate } from 'react-router-dom';
import './SchedulePage.css';

function SchedulePage() {
  const navigate = useNavigate();
  
  const scheduleItems = [
    { id: 1, day: "Monday", time: "09:00 AM - 11:00 AM", subject: "Data Structures", type: "Lecture", room: "Lab 03", status: "Upcoming" },
    { id: 2, day: "Tuesday", time: "01:00 PM - 03:00 PM", subject: "Advanced Web Dev", type: "Practical", room: "Tech Center", status: "Upcoming" },
    { id: 3, day: "Wednesday", time: "10:30 AM - 12:30 PM", subject: "Database Systems", type: "Lecture", room: "Hall B", status: "Upcoming" },
    { id: 4, day: "Thursday", time: "09:00 AM - 11:00 AM", subject: "Algorithms", type: "Tutorial", room: "Room 402", status: "Upcoming" }
  ];

  return (
    <div className="schedule-page-wrapper">
      <div className="st-top-bar" style={{ padding: '0 0 25px 0' }}>
        <button className="back-dash-btn" onClick={() => navigate('/student-dashboard')}>
          ← Back to Dashboard
        </button>
        <div className="st-brand-title">
          <span className="brand-n">N</span> Nex24 <span className="divider">|</span> <span className="sub-title">Timetable</span>
        </div>
      </div>

      <div className="schedule-header">
        <h2>My <span className="text-gradient">Schedule</span></h2>
        <p>View your weekly class timetables and academic sessions.</p>
      </div>

      <div className="schedule-card">
        <div className="schedule-card-title">Weekly Timetable Overview</div>
        
        <div className="schedule-list">
          {scheduleItems.map(item => (
            <div key={item.id} className="schedule-item">
              <div className="schedule-day-box">
                <span className="day-name">{item.day}</span>
                <span className="time-text">{item.time}</span>
              </div>
              
              <div className="schedule-details">
                <h4>{item.subject}</h4>
                <p>{item.type} • {item.room}</p>
              </div>
              
              <div className="schedule-status">
                <span className="status-indicator">{item.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SchedulePage;