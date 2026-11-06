import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, AlertTriangle, AlertOctagon, Info, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import './NotificationDropdown.css';

function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const [listRes, countRes] = await Promise.all([
        api.get('/notifications'),
        api.get('/notifications/unread-count')
      ]);

      setNotifications(listRes.data || []);
      setUnreadCount(countRes.data?.unreadCount || 0);
    } catch (err) {
      // Quiet fail on network or transient auth refresh
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000); // 20s auto poll
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    if (!isOpen) {
      fetchNotifications();
    }
    setIsOpen(!isOpen);
  };

  const handleMarkAsRead = async (id, actionUrl) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      if (actionUrl) {
        setIsOpen(false);
        navigate(actionUrl);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error(e);
    }
  };

  const renderIcon = (type) => {
    switch (type) {
      case 'ALERT':
        return <AlertOctagon size={18} className="notif-icon alert" />;
      case 'WARNING':
        return <AlertTriangle size={18} className="notif-icon warning" />;
      case 'SUCCESS':
        return <CheckCircle2 size={18} className="notif-icon success" />;
      default:
        return <Info size={18} className="notif-icon info" />;
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffSec = Math.floor((now - date) / 1000);

    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="notif-dropdown-wrapper" ref={dropdownRef}>
      <button 
        className={`notif-bell-btn ${isOpen ? 'active' : ''}`} 
        onClick={handleToggle}
        aria-label="Notifications"
        type="button"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="notif-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="notif-popover">
          <div className="notif-popover-header">
            <div className="notif-popover-title">
              Notifications
              {unreadCount > 0 && <span className="notif-unread-pill">{unreadCount} new</span>}
            </div>
            {unreadCount > 0 && (
              <button 
                className="notif-mark-all-btn" 
                onClick={handleMarkAllRead}
                type="button"
              >
                <CheckCheck size={14} /> Mark all read
              </button>
            )}
          </div>

          <div className="notif-list-container">
            {notifications.length === 0 ? (
              <div className="notif-empty-state">
                <Bell size={32} className="empty-bell" />
                <p className="empty-title">No notifications yet</p>
                <p className="empty-subtitle">You are all caught up!</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div 
                  key={n.id} 
                  className={`notif-item ${!n.read ? 'unread' : 'read'} ${n.actionUrl ? 'clickable' : ''}`}
                  onClick={() => handleMarkAsRead(n.id, n.actionUrl)}
                >
                  <div className="notif-icon-col">
                    {renderIcon(n.type)}
                  </div>
                  <div className="notif-content-col">
                    <div className="notif-item-header">
                      <span className="notif-item-title">{n.title}</span>
                      <span className="notif-item-time">{formatTime(n.createdAt)}</span>
                    </div>
                    <p className="notif-item-msg">{n.message}</p>
                  </div>
                  {!n.read && <div className="notif-unread-dot" title="Unread"></div>}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationDropdown;
