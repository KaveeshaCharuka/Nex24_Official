import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles, requireLoginFace = false, requireExamFace = false }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role') || '';
  const isLoginFaceVerified = sessionStorage.getItem('face_verified_login') === 'true';
  const isExamFaceVerified = sessionStorage.getItem('face_verified_exam') === 'true';

  // 1. ටෝකන් එකක් නැත්නම් කෙලින්ම ලොගින්
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 2. Role එක Case Insensitive විදිහට චෙක් කරනවා
  if (allowedRoles) {
    const upperRoles = allowedRoles.map(r => String(r).toUpperCase());
    if (!upperRoles.includes(String(userRole).toUpperCase())) {
       return <Navigate to="/login" replace />;
    }
  }

  // 3. Face Verify for Login
  if (requireLoginFace && String(userRole).toUpperCase() === 'STUDENT' && !isLoginFaceVerified) {
    return <Navigate to="/student/face-registration" state={{ nextPath: window.location.pathname, context: 'login' }} replace />;
  }

  // 4. Face Verify for Exam
  if (requireExamFace && String(userRole).toUpperCase() === 'STUDENT' && !isExamFaceVerified) {
    return <Navigate to="/student/face-registration" state={{ nextPath: window.location.pathname, context: 'exam' }} replace />;
  }

  return children;
};

export default ProtectedRoute;