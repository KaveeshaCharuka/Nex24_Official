import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link, Outlet } from 'react-router-dom';
import './ManageUsers.css';

function ManageUsers() {
  const navigate = useNavigate();

  // Mock Database for Users
  const [users, setUsers] = useState([
    { id: "STU-001", name: "Sahan Fernando", email: "sahan@student.com", role: "Student", status: "Active", joined: "2026-01-12" },
    { id: "EXM-042", name: "Charuka Karunarathna", email: "nimali@examiner.com", role: "Examiner", status: "Active", joined: "2025-11-05" },
    { id: "STU-002", name: "Kasun Perera", email: "kasun@student.com", role: "Student", status: "Suspended", joined: "2026-02-20" },
    { id: "EXM-045", name: "Prof. Kamal Silva", email: "kamal.s@nex24.com", role: "Examiner", status: "Active", joined: "2026-06-15" },
    { id: "STU-003", name: "Amali Perera", email: "amali@student.com", role: "Student", status: "Active", joined: "2026-03-10" },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('All');

  // Toggle Suspend / Activate User
  const toggleStatus = (id) => {
    setUsers(users.map(user => 
      user.id === id 
        ? { ...user, status: user.status === "Active" ? "Suspended" : "Active" } 
        : user
    ));
  };

  // Delete User
  const deleteUser = (id) => {
    if(window.confirm("Are you sure you want to permanently delete this user?")) {
      setUsers(users.filter(user => user.id !== id));
    }
  };

  // Filtering Logic
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'All' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="manage-users-wrapper">
      {/* Top Navigation */}
      <div className="mu-top-bar">
        <button className="mu-back-btn" onClick={() => navigate('/admin-dashboard')}>
          ⬅ Back to Dashboard
        </button>
        <div className="mu-title">N <span className="logo-text">Nex24</span> | User Management</div>
      </div>

      <div className="mu-container">
        <div className="mu-header">
          <h2>Manage <span className="neon-blue">System Users</span> 👥</h2>
          <p>Search, filter, edit, or suspend student and examiner accounts.</p>
        </div>

        {/* Controls Section (Search & Filters) */}
        <div className="mu-controls">
          <div className="mu-search-box">
            <input 
              type="text" 
              placeholder="🔍 Search by Name, Email, or ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mu-search-input"
            />
          </div>
          
          <div className="mu-filter-box">
            <select 
              value={filterRole} 
              onChange={(e) => setFilterRole(e.target.value)}
              className="mu-select"
            >
              <option value="All">All Roles</option>
              <option value="Student">Students Only</option>
              <option value="Examiner">Examiners Only</option>
            </select>
            <button className="mu-add-btn">+ Add New User</button>
          </div>
        </div>

        {/* Data Table */}
        <div className="mu-table-card">
          <div className="mu-table-responsive">
            <table className="mu-table">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>User Details</th>
                  <th>Role</th>
                  <th>Joined Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map(user => (
                    <tr key={user.id}>
                      <td className="mu-id-col">{user.id}</td>
                      <td>
                        <div className="mu-user-name">{user.name}</div>
                        <div className="mu-user-email">{user.email}</div>
                      </td>
                      <td><span className={`mu-role-tag ${user.role.toLowerCase()}`}>{user.role}</span></td>
                      <td className="mu-date-col">{user.joined}</td>
                      <td>
                        <span className={`mu-status-badge ${user.status.toLowerCase()}`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="mu-actions-col">
                        <button 
                          className={`mu-action-btn ${user.status === 'Active' ? 'suspend' : 'activate'}`}
                          onClick={() => toggleStatus(user.id)}
                        >
                          {user.status === 'Active' ? '⏸ Suspend' : '▶ Activate'}
                        </button>
                        <button className="mu-action-btn delete" onClick={() => deleteUser(user.id)}>
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="mu-no-data">No users found matching your criteria.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ManageUsers;