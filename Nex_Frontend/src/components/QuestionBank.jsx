import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './QuestionBank.css';

function QuestionBank() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [showModal, setShowModal] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    questionText: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    optionE: '',
    optionCount: 4,
    correctAnswer: 'A',
    questionType: 'MCQ'
  });

  const fetchQuestions = () => {
    setLoading(true);
    api.get('/questions') 
      .then((response) => {
        setQuestions(response.data); 
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching questions:", err);
        setError("Failed to load questions from Backend!");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    try {
      await api.post('/questions/add', newQuestion);
      alert("Question Added Successfully!");
      setShowModal(false);
      fetchQuestions(); // Refresh list
    } catch (err) {
      console.error("Error adding question:", err);
      alert("Error adding question!");
    }
  };

  if (loading) return <div className="qbank-page-wrapper"><h3>Loading Question Bank... ⏳</h3></div>;
  if (error) return <div className="qbank-page-wrapper"><h3 style={{color: 'red'}}>{error}</h3></div>;

  return (
    <div className="qbank-page-wrapper">
      <div className="st-top-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <button className="back-dash-btn" style={{ background: '#111c32', color: '#94a3b8', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '8px 18px', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }} onClick={() => navigate('/examiner-dashboard')}>
          ← Back to Dashboard
        </button>
        <div className="st-brand-title" style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff' }}>
          <span className="brand-n" style={{ color: '#3b82f6' }}>N</span> Nex24 <span className="divider" style={{ color: '#334155', margin: '0 8px' }}>|</span> <span className="sub-title" style={{ color: '#3b82f6' }}>Examiner Portal</span>
        </div>
      </div>

      <div className="qbank-header">
        <h2>Examiner <span className="text-gradient">Question Bank</span> 🗄️</h2>
        <p>Create, manage, and organize all your examination questions in one place.</p>
      </div>

      <div className="qbank-stats-grid">
        <div className="stat-box">
          <span className="stat-title">Total Questions</span>
          <span className="stat-number">{questions.length}</span>
        </div>
        <div className="stat-box">
          <span className="stat-title">MCQs</span>
          <span className="stat-number">{questions.filter(q => q.questionType === 'MCQ').length}</span>
        </div>
        <div className="stat-box">
          <span className="stat-title">Structured</span>
          <span className="stat-number">{questions.filter(q => q.questionType === 'STRUCTURED').length}</span>
        </div>
      </div>

      <div className="qbank-card">
        <div className="qbank-action-bar">
          <h3>Questions List</h3>
          <button className="add-q-btn" onClick={() => setShowModal(true)}>+ Add New Question</button>
        </div>

        <div className="table-responsive">
          <table className="qbank-table">
            <thead>
              <tr>
                <th>Q-ID</th>
                <th>Question Text</th>
                <th>Type</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {questions.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center' }}>No questions available in the bank.</td>
                </tr>
              ) : (
                questions.map(q => (
                  <tr key={q.id}>
                    <td className="q-code">Q-{q.id}</td>
                    <td className="q-text">{q.questionText}</td>
                    <td><span className="q-type">{q.questionType || 'MCQ'}</span></td>
                    <td>
                      <div className="action-buttons">
                        <button className="edit-action-btn">Edit</button>
                        <button className="delete-action-btn">Delete</button>
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
          <div className="modal-content">
            <h3>Add New Question</h3>
            <form onSubmit={handleAddQuestion}>
              <div className="form-group">
                <label>Question Type</label>
                <select value={newQuestion.questionType} onChange={e => setNewQuestion({...newQuestion, questionType: e.target.value})}>
                  <option value="MCQ">MCQ</option>
                  <option value="STRUCTURED">Structured</option>
                </select>
              </div>
              <div className="form-group">
                <label>Question Text</label>
                <textarea required value={newQuestion.questionText} onChange={e => setNewQuestion({...newQuestion, questionText: e.target.value})}></textarea>
              </div>
              
              {newQuestion.questionType === 'MCQ' && (
                <>
                  <div className="form-group">
                    <label>Number of Options</label>
                    <select 
                      value={newQuestion.optionCount} 
                      onChange={e => setNewQuestion({...newQuestion, optionCount: parseInt(e.target.value)})}
                    >
                      <option value="2">2 Options</option>
                      <option value="3">3 Options</option>
                      <option value="4">4 Options</option>
                      <option value="5">5 Options</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Option A</label>
                    <input type="text" required value={newQuestion.optionA} onChange={e => setNewQuestion({...newQuestion, optionA: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Option B</label>
                    <input type="text" required value={newQuestion.optionB} onChange={e => setNewQuestion({...newQuestion, optionB: e.target.value})} />
                  </div>
                  {newQuestion.optionCount >= 3 && (
                    <div className="form-group">
                      <label>Option C</label>
                      <input type="text" required value={newQuestion.optionC} onChange={e => setNewQuestion({...newQuestion, optionC: e.target.value})} />
                    </div>
                  )}
                  {newQuestion.optionCount >= 4 && (
                    <div className="form-group">
                      <label>Option D</label>
                      <input type="text" required value={newQuestion.optionD} onChange={e => setNewQuestion({...newQuestion, optionD: e.target.value})} />
                    </div>
                  )}
                  {newQuestion.optionCount >= 5 && (
                    <div className="form-group">
                      <label>Option E</label>
                      <input type="text" required value={newQuestion.optionE} onChange={e => setNewQuestion({...newQuestion, optionE: e.target.value})} />
                    </div>
                  )}

                  <div className="form-group">
                    <label>Correct Answer</label>
                    <select value={newQuestion.correctAnswer} onChange={e => setNewQuestion({...newQuestion, correctAnswer: e.target.value})}>
                      <option value="A">A</option>
                      <option value="B">B</option>
                      {newQuestion.optionCount >= 3 && <option value="C">C</option>}
                      {newQuestion.optionCount >= 4 && <option value="D">D</option>}
                      {newQuestion.optionCount >= 5 && <option value="E">E</option>}
                    </select>
                  </div>
                </>
              )}
              
              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="cancel-btn">Cancel</button>
                <button type="submit" className="save-btn">Save Question</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default QuestionBank;