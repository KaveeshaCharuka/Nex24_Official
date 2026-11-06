import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Security Component
import ProtectedRoute from './components/ProtectedRoute';

// ==========================================
// 1. PUBLIC & AUTH PAGES
// ==========================================
import FaceRegister from './pages/FaceRegister'; 
import HomePage from './components/HomePage';
import FeaturesPage from './components/FeaturesPage';
import HowItWorksPage from './components/HowItWorksPage';
import SupportPage from './components/SupportPage';
import LoginPage from './components/LoginPage';
import RoleLoginPage from './components/RoleLoginPage';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import HelpCenter from './components/HelpCenter';
import ForgotPassword from './components/ForgotPassword';
import NotFound from './components/NotFound';
import StudentOnboarding from './components/StudentOnboarding';
import ExaminerOnboarding from './components/ExaminerOnboarding';
import StudentActivation from './components/StudentActivation';
import ExaminerActivation from './components/ExaminerActivation';
import InstituteAdminPanel from './components/InstituteAdminPanel';
import InstituteRegistration from './components/InstituteRegistration'; // 💡 අලුත් එක මෙතන import කරලා තියෙන්නේ

// ==========================================
// 2. MAIN DASHBOARDS & PROFILES
// ==========================================
import StudentDashboard from './components/StudentDashboard';
import StudentProfile from './components/StudentProfile';
import ExaminerDashboard from './components/ExaminerDashboard'; 
import ExaminerProfile from './components/ExaminerProfile';
import AdminDashboard from './components/AdminDashboard';
import AdminProfile from './components/AdminProfile'; 
import ExaminerSetup from './components/ExaminerSetup';

// ==========================================
// 3. STUDENT SUB-PAGES
// ==========================================
import FaceRecognition from './components/FaceRecognition';
import GradesPage from './components/GradesPage';
import MyCoursesPage from './components/MyCoursesPage';
import SchedulePage from './components/SchedulePage';
import StudyPlanPage from './components/StudyPlanPage';
import FaceRegistration from './components/FaceRegistration';
import LiveExam from './components/LiveExam';
import ExamResultPage from './components/ExamResultPage';

// ==========================================
// 4. EXAMINER SUB-PAGES
// ==========================================
import ExaminerCourses from './components/ExaminerCourses';
import QuestionBank from './components/QuestionBank';
import ExaminerExams from './components/ExaminerExams';
import LiveMonitoring from './components/LiveMonitoring';


import InstituteRegister from './components/InstituteRegister';
import InstituteDashboard from './components/InstituteDashboard';
import AccountActivation from './components/AccountActivation';

        
// ==========================================
// 5. ADMIN SUB-PAGES
// ==========================================
import ManageUsers from './components/ManageUsers';
import FaceIdConfig from './components/FaceIdConfig';
import DatabaseManagement from './components/DatabaseManagement';

function App() {
  return (
    
    <Router> 
      <Routes>
        
        
        <Route path="/" element={<HomePage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/simple-login" element={<RoleLoginPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/help-center" element={<HelpCenter />} />
        <Route path="/register" element={<RoleLoginPage />} />
        <Route path="/exam/:examId" element={<LiveExam />} />
        
        <Route path="/register-institute" element={<InstituteRegistration />} />
        
        <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['INSTITUTE_ADMIN', 'ADMIN']}><InstituteDashboard /></ProtectedRoute>} />
        <Route path="/activate" element={<AccountActivation />} />

        <Route path="/face-register" element={<FaceRegister />} /> 
        <Route path="/student-activation" element={<StudentActivation />} />
        <Route path="/examiner-activate" element={<ExaminerActivation />} />

        
        <Route path="/student-dashboard" element={<ProtectedRoute allowedRoles={['STUDENT']} requireLoginFace={true}><StudentDashboard /></ProtectedRoute>} />
        <Route path="/student/profile" element={<ProtectedRoute allowedRoles={['STUDENT']} requireLoginFace={true}><StudentProfile /></ProtectedRoute>} />
        <Route path="/student/grades" element={<ProtectedRoute allowedRoles={['STUDENT']} requireLoginFace={true}><GradesPage /></ProtectedRoute>} />
        <Route path="/student/courses" element={<ProtectedRoute allowedRoles={['STUDENT']} requireLoginFace={true}><MyCoursesPage /></ProtectedRoute>} />
        <Route path="/student/schedule" element={<ProtectedRoute allowedRoles={['STUDENT']} requireLoginFace={true}><SchedulePage /></ProtectedRoute>} />
        <Route path="/student/study-plan" element={<ProtectedRoute allowedRoles={['STUDENT']} requireLoginFace={true}><StudyPlanPage /></ProtectedRoute>} />
        <Route path="/student/face-registration" element={<ProtectedRoute allowedRoles={['STUDENT']}><FaceRegistration /></ProtectedRoute>} />
        <Route path="/student/LiveExam/:examId" element={<ProtectedRoute allowedRoles={['STUDENT']} requireExamFace={true}><LiveExam /></ProtectedRoute>} />
        <Route path="/student/exam-result" element={<ProtectedRoute allowedRoles={['STUDENT']} requireLoginFace={true}><ExamResultPage /></ProtectedRoute>} />
        <Route path="/examiner-setup" element={<ExaminerSetup />} />
       
        <Route path="/examiner-dashboard" element={<ProtectedRoute allowedRoles={['EXAMINER']}><ExaminerDashboard /></ProtectedRoute>} />
        <Route path="/examiner/courses" element={<ProtectedRoute allowedRoles={['EXAMINER']}><ExaminerCourses /></ProtectedRoute>} />
        <Route path="/examiner/question-bank" element={<ProtectedRoute allowedRoles={['EXAMINER']}><QuestionBank /></ProtectedRoute>} />
        <Route path="/examiner/exams" element={<ProtectedRoute allowedRoles={['EXAMINER']}><ExaminerExams /></ProtectedRoute>} />
        <Route path="/examiner/live-monitoring" element={<ProtectedRoute allowedRoles={['EXAMINER']}><LiveMonitoring /></ProtectedRoute>} />
        <Route path="/examiner/profile" element={<ProtectedRoute allowedRoles={['EXAMINER']}><ExaminerProfile /></ProtectedRoute>} />
        
        
        <Route path="/institute-admin" element={<InstituteAdminPanel />} /> 
        <Route path="/admin-dashboard" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin-profile" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminProfile /></ProtectedRoute>} />
        <Route path="/admin/manage-users" element={<ProtectedRoute allowedRoles={['ADMIN']}><ManageUsers /></ProtectedRoute>} />
        <Route path="/admin/face-id-config" element={<ProtectedRoute allowedRoles={['ADMIN']}><FaceIdConfig /></ProtectedRoute>} />
        <Route path="/admin/database" element={<ProtectedRoute allowedRoles={['ADMIN']}><DatabaseManagement /></ProtectedRoute>} />

        
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </Router>

  
  );
}

export default App;