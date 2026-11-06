import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './StudyPlanPage.css';

function StudyPlanPage() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([
    { id: 1, text: "Complete Algorithms Assignment", completed: false },
    { id: 2, text: "Read Chapter 4 of Database Book", completed: false },
    { id: 3, text: "Review Web Dev lecture notes", completed: true }
  ]);

  const toggleTask = (id) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  return (
    <div className="study-plan-wrapper">
      <div className="st-top-bar" style={{ padding: '0 0 25px 0' }}>
        <button className="back-dash-btn" onClick={() => navigate('/student-dashboard')}>
          ← Back to Dashboard
        </button>
        <div className="st-brand-title">
          <span className="brand-n">N</span> Nex24 <span className="divider">|</span> <span className="sub-title">Study Plan</span>
        </div>
      </div>

      <div className="study-plan-header">
        <h2>My <span className="text-gradient">Study Plan</span></h2>
        <p>Keep track of your daily academic goals and progress.</p>
      </div>

      <div className="study-plan-card">
        <div className="task-list">
          {tasks.map(task => (
            <div key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
              <button className="checkbox" onClick={() => toggleTask(task.id)}>
                {task.completed ? "✓" : ""}
              </button>
              <span className="task-text">{task.text}</span>
            </div>
          ))}
        </div>
        <button className="add-task-btn">+ Add New Goal</button>
      </div>
    </div>
  );
}

export default StudyPlanPage;