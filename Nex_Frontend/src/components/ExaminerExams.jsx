import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './ExaminerExams.css';

function ExaminerExams() {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [showModal, setShowModal] = useState(false);
  const [newExam, setNewExam] = useState({
    examTitle: '',
    courseId: '',
    examinerId: 1,
    totalMarks: 100,
    durationMinutes: 60,
    examDate: '',
    status: 'ACTIVE',
    questionIds: []
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const examsRes = await api.get('/exams');
      setExams(examsRes.data || []);
      const qRes = await api.get('/questions');
      setQuestions(qRes.data || []);
      const cRes = await api.get('/courses');
      setCourses(cRes.data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load examinations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleQuestion = (id) => {
    const isSelected = newExam.questionIds.includes(id);
    if (isSelected) {
      setNewExam({ ...newExam, questionIds: newExam.questionIds.filter(qid => qid !== id) });
    } else {
      setNewExam({ ...newExam, questionIds: [...newExam.questionIds, id] });
    }
  };

  const handleCreateExam = async (e) => {
    e.preventDefault();
    if (newExam.questionIds.length === 0) {
      alert("Please select at least one question from the bank!");
      return;
    }
    
    try {
      await api.post('/exams/create', newExam);
      alert("Exam Created and Linked Successfully!");
      setShowModal(false);
      setNewExam({
        examTitle: '',
        courseId: '',
        examinerId: 1,
        totalMarks: 100,
        durationMinutes: 60,
        examDate: '',
        status: 'ACTIVE',
        questionIds: []
      });
      fetchData();
    } catch (err) {
      console.error("Error creating exam:", err);
      alert("Failed to create exam: " + (err.response?.data || err.message));
    }
  };

  const handleStatusChange = async (examId, newStatus) => {
    try {
      await api.put(`/exams/${examId}/status`, { status: newStatus });
      fetchData();
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update status.");
    }
  };

  const handleDeleteExam = async (examId) => {
    if (window.confirm(`Are you sure you want to delete exam #${examId}?`)) {
      try {
        await api.delete(`/exams/${examId}`);
        fetchData();
      } catch (err) {
        console.error("Error deleting exam:", err);
        alert("Failed to delete exam.");
      }
    }
  };

  const getCourseName = (courseId) => {
    const c = courses.find(item => item.courseId === courseId || item.id === courseId);
    return c ? `${c.courseCode} - ${c.courseName}` : `Course #${courseId}`;
  };

  if (loading) return <div className="exams-page-wrapper"><h3>Loading Examinations... ⏳</h3></div>;
  if (error) return <div className="exams-page-wrapper"><h3 style={{color: 'red'}}>{error}</h3></div>;

  return (
    <div className="exams-page-wrapper">
      <div className="st-top-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <button className="back-dash-btn" style={{ background: '#111c32', color: '#94a3b8', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '8px 18px', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }} onClick={() => navigate('/examiner-dashboard')}>
          ← Back to Dashboard
        </button>
        <div className="st-brand-title" style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff' }}>
          <span className="brand-n" style={{ color: '#3b82f6' }}>N</span> Nex24 <span className="divider" style={{ color: '#334155', margin: '0 8px' }}>|</span> <span className="sub-title" style={{ color: '#3b82f6' }}>Examiner Portal</span>
        </div>
      </div>

      <div className="exams-header">
        <h2>Manage <span className="text-gradient">Examinations</span></h2>
        <p>Create exams linked to courses, control active sessions, and oversee student eligibility.</p>
      </div>

      <div className="exams-stats-grid">
        <div className="exam-stat-box">
          <span className="stat-label">Total Exams</span>
          <span className="stat-count">{exams.length}</span>
        </div>
        <div className="exam-stat-box">
          <span className="stat-label">🟢 Live / Active</span>
          <span className="stat-count-active" style={{ color: '#22c55e' }}>
            {exams.filter(e => e.status === 'ACTIVE').length}
          </span>
        </div>
        <div className="exam-stat-box">
          <span className="stat-label">📅 Scheduled</span>
          <span className="stat-count" style={{ color: '#f59e0b' }}>
            {exams.filter(e => e.status === 'SCHEDULED').length}
          </span>
        </div>
        <div className="exam-stat-box">
          <span className="stat-label">🏁 Completed</span>
          <span className="stat-count">
            {exams.filter(e => e.status === 'COMPLETED').length}
          </span>
        </div>
      </div>

      <div className="exams-main-card">
        <div className="exams-action-bar">
          <h3>Examinations Overview</h3>
          <button className="create-exam-btn" onClick={() => setShowModal(true)}>+ Create New Exam</button>
        </div>

        <div className="exams-table-container">
          <table className="exams-custom-table">
            <thead>
              <tr>
                <th>Exam ID</th>
                <th>Exam Title</th>
                <th>Course</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {exams.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                    No examinations created yet. Click "+ Create New Exam" to link an exam to a course.
                  </td>
                </tr>
              ) : (
                exams.map(exam => (
                  <tr key={exam.examId}>
                    <td className="exam-code">EX-{exam.examId}</td>
                    <td className="exam-title">
                      <strong>{exam.examTitle}</strong>
                    </td>
                    <td>{getCourseName(exam.courseId)}</td>
                    <td>{exam.durationMinutes} mins</td>
                    <td>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        display: 'inline-block',
                        backgroundColor: exam.status === 'ACTIVE' ? 'rgba(34, 197, 94, 0.2)' : exam.status === 'SCHEDULED' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(148, 163, 184, 0.2)',
                        color: exam.status === 'ACTIVE' ? '#4ade80' : exam.status === 'SCHEDULED' ? '#fbbf24' : '#94a3b8',
                        border: `1px solid ${exam.status === 'ACTIVE' ? '#22c55e' : exam.status === 'SCHEDULED' ? '#f59e0b' : '#64748b'}`
                      }}>
                        {exam.status === 'ACTIVE' ? '🟢 LIVE / ACTIVE' : exam.status === 'SCHEDULED' ? '📅 SCHEDULED' : '🏁 COMPLETED'}
                      </span>
                    </td>
                    <td>
                      <div className="exam-actions" style={{ display: 'flex', gap: '8px' }}>
                        {exam.status === 'SCHEDULED' && (
                          <button 
                            className="exam-btn" 
                            style={{ backgroundColor: '#22c55e', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                            onClick={() => handleStatusChange(exam.examId, 'ACTIVE')}
                            title="Start this exam session for enrolled students"
                          >
                            ▶️ Start Exam
                          </button>
                        )}
                        {exam.status === 'ACTIVE' && (
                          <button 
                            className="exam-btn" 
                            style={{ backgroundColor: '#f97316', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                            onClick={() => handleStatusChange(exam.examId, 'COMPLETED')}
                            title="End this exam session"
                          >
                            ⏹️ End Exam
                          </button>
                        )}
                        <button 
                          className="exam-btn" 
                          style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
                          onClick={() => handleDeleteExam(exam.examId)}
                          title="Delete Exam"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content large-modal">
            <h3>Create New Examination</h3>
            <form onSubmit={handleCreateExam}>
              <div className="form-group">
                <label>Select Target Course (Only enrolled students can enter)</label>
                <select 
                  required 
                  value={newExam.courseId} 
                  onChange={e => setNewExam({...newExam, courseId: parseInt(e.target.value)})}
                >
                  <option value="" disabled>Select a Course</option>
                  {courses.map(c => (
                    <option key={c.courseId || c.id} value={c.courseId || c.id}>
                      {c.courseCode} - {c.courseName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Exam Title</label>
                <input 
                  type="text" 
                  placeholder="e.g. Midterm Examination - Data Structures"
                  required 
                  value={newExam.examTitle} 
                  onChange={e => setNewExam({...newExam, examTitle: e.target.value})} 
                />
              </div>

              <div className="form-group-row">
                <div className="form-group">
                  <label>Duration (Minutes)</label>
                  <input type="number" required min="1" value={newExam.durationMinutes} onChange={e => setNewExam({...newExam, durationMinutes: parseInt(e.target.value)})} />
                </div>
                <div className="form-group">
                  <label>Total Marks</label>
                  <input type="number" required min="1" value={newExam.totalMarks} onChange={e => setNewExam({...newExam, totalMarks: parseInt(e.target.value)})} />
                </div>
              </div>

              <div className="form-group-row">
                <div className="form-group">
                  <label>Initial Status</label>
                  <select 
                    value={newExam.status} 
                    onChange={e => setNewExam({...newExam, status: e.target.value})}
                  >
                    <option value="ACTIVE">🟢 ACTIVE (Students can take it now)</option>
                    <option value="SCHEDULED">📅 SCHEDULED (Start later)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Exam Date & Time</label>
                  <input 
                    type="datetime-local" 
                    value={newExam.examDate} 
                    onChange={e => setNewExam({...newExam, examDate: e.target.value})} 
                  />
                </div>
              </div>
              
              <div className="form-group question-selector">
                <label>Select Questions from Bank ({newExam.questionIds.length} Selected)</label>
                <div className="questions-list-scroll">
                  {questions.length === 0 ? (
                    <p className="no-questions">No questions available in Question Bank. Please add questions first.</p>
                  ) : (
                    questions.map(q => (
                      <label key={q.id} className="question-checkbox-item">
                        <input 
                          type="checkbox" 
                          checked={newExam.questionIds.includes(q.id)}
                          onChange={() => handleToggleQuestion(q.id)}
                        />
                        <span className="q-text-preview">Q-{q.id}: {q.questionText}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="cancel-btn">Cancel</button>
                <button type="submit" className="save-btn">Publish & Link Exam</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExaminerExams;