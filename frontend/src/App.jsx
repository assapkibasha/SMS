import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import ClassManagement from './components/ClassManagement';
import TeachersManagement from './components/TeachersManagement';
import StudentManagement from './components/StudentManagement';
import AttendanceManagement from './components/AttendanceManagement';

function App() {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [userRole, setUserRole] = React.useState('');

  React.useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (token && role) {
      setIsLoggedIn(true);
      setUserRole(role);
    }
  }, []);

  const ProtectedRoute = ({ element: Element, role }) => {
    if (!isLoggedIn) {
      return <Navigate to="/login" replace />;
    }

    if (role && role !== userRole) {
      return <Navigate to="/login" replace />;
    }

    return <Element />;
  };

  return (
    <Router>
      <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
        {isLoggedIn && <Navbar activePage={userRole} />}
        <div className="flex flex-1 overflow-hidden">
          {isLoggedIn && <Sidebar />}
          <main className="flex-1 p-4 overflow-hidden">
            <Routes>
              <Route
                path="/login"
                element={
                  isLoggedIn
                    ? <Navigate to={userRole === 'admin' ? '/admin' : '/teacher'} replace />
                    : <Login onLogin={() => { setIsLoggedIn(true); setUserRole(localStorage.getItem('role')); }} />
                }
              />
              <Route path="/dashboard" element={<ProtectedRoute element={Dashboard} role={null} />} />
              <Route path="/admin" element={<ProtectedRoute element={AdminDashboard} role="admin" />} />
              <Route path="/admin/classes" element={<ProtectedRoute element={ClassManagement} role="admin" />} />
              <Route path="/admin/teachers" element={<ProtectedRoute element={TeachersManagement} role="admin" />} />
              <Route path="/teacher" element={<ProtectedRoute element={TeacherDashboard} role="teacher" />} />
              <Route path="/teacher/students" element={<ProtectedRoute element={StudentManagement} role="teacher" />} />
              <Route path="/teacher/attendance" element={<ProtectedRoute element={AttendanceManagement} role="teacher" />} />
              <Route path="/reports" element={<ProtectedRoute element={Reports} role={null} />} />
              <Route path="/settings" element={<ProtectedRoute element={Settings} role={null} />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;