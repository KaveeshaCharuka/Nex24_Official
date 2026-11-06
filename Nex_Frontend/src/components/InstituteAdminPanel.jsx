import React, { useState, useEffect } from 'react';
import StudentOnboarding from './StudentOnboarding';
import ExaminerOnboarding from './ExaminerOnboarding';

const InstituteAdminPanel = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [stats, setStats] = useState({ studentCount: 0, examinerCount: 0 });

    // Dashboard එකට එන හැමවෙලේම Backend එකෙන් Count එක ගන්නවා
    useEffect(() => {
        if (activeTab === 'dashboard') {
            fetch('http://localhost:8080/api/admin/dashboard-stats')
                .then(res => res.json())
                .then(data => setStats(data))
                .catch(err => console.error("Error fetching stats:", err));
        }
    }, [activeTab]);

    const renderContent = () => {
        switch (activeTab) {
            case 'addStudent':
                return <StudentOnboarding />;
            case 'addExaminer':
                return <ExaminerOnboarding />;
            case 'dashboard':
                return (
                    <div>
                        <h2 style={{ color: '#1e293b', marginBottom: '10px' }}>Welcome to Institute Admin Panel</h2>
                        <p style={{ color: '#64748b', fontSize: '16px', marginBottom: '40px' }}>
                            Here you can manage students and examiners, view statistics, and perform administrative tasks.
                        </p>

                        {/* Summary Cards */}
                        <div style={{ display: 'flex', gap: '20px' }}>
                            {/* Student Count Card */}
                            <div style={cardStyle('#3b82f6', '#dbeafe')}>
                                <h3 style={{ margin: 0, color: '#1e40af' }}>👨‍🎓 Registered Students</h3>
                                <p style={{ fontSize: '40px', fontWeight: 'bold', margin: '15px 0 0 0', color: '#1e3a8a' }}>
                                    {stats.studentCount}
                                </p>
                            </div>

                            {/* Examiner Count Card */}
                            <div style={cardStyle('#10b981', '#d1fae5')}>
                                <h3 style={{ margin: 0, color: '#065f46' }}>👨‍🏫 Registered Examiners</h3>
                                <p style={{ fontSize: '40px', fontWeight: 'bold', margin: '15px 0 0 0', color: '#064e3b' }}>
                                    {stats.examinerCount}
                                </p>
                            </div>
                        </div>
                    </div>
                );
            default:
                return <h3>Page Not Found</h3>;
        }
    };

    return (
        <div style={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif' }}>
            
            {/* Sidebar */}
            <div style={{ width: '260px', backgroundColor: '#0f172a', color: 'white', display: 'flex', flexDirection: 'column', padding: '20px' }}>
                <h2 style={{ marginBottom: '40px', color: '#38bdf8', textAlign: 'center', fontSize: '22px' }}>
                    Institute Admin
                </h2>
                
                <button onClick={() => setActiveTab('dashboard')} style={btnStyle(activeTab === 'dashboard')}>
                    📊 Dashboard
                </button>
                <button onClick={() => setActiveTab('addStudent')} style={btnStyle(activeTab === 'addStudent')}>
                    👨‍🎓 Register Student
                </button>
                <button onClick={() => setActiveTab('addExaminer')} style={btnStyle(activeTab === 'addExaminer')}>
                    👨‍🏫 Invite Examiner
                </button>
                
                <button style={{...btnStyle(false), marginTop: 'auto', backgroundColor: '#ef4444'}}>
                    🚪 Logout
                </button>
            </div>

            {/* Main Content */}
            <div style={{ flex: 1, padding: '40px', backgroundColor: '#f8fafc', overflowY: 'auto' }}>
                {renderContent()}
            </div>
            
        </div>
    );
};

const btnStyle = (isActive) => ({
    padding: '12px 15px',
    margin: '5px 0',
    backgroundColor: isActive ? '#3b82f6' : 'transparent',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    textAlign: 'left',
    cursor: 'pointer',
    fontSize: '16px',
    transition: '0.3s'
});

const cardStyle = (borderColor, bgColor) => ({
    flex: 1,
    padding: '25px',
    backgroundColor: bgColor,
    borderLeft: `5px solid ${borderColor}`,
    borderRadius: '8px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
});

export default InstituteAdminPanel;