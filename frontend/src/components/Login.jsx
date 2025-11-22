import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('admin');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post(
        `http://localhost:5000/api/auth/login/${role}`,
        { username, password }
      );
      const { token, role: userRole } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('role', userRole);
      localStorage.setItem('username', username);
      
      onLogin?.();
      
      // Redirect based on role
      if (userRole === 'admin') {
        navigate('/admin');
      } else if (userRole === 'teacher') {
        navigate('/teacher');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-gray-50">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white rounded-xl shadow p-6 space-y-4">
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-bold text-tealgrey-600">Student Management System</h2>
          <p className="text-sm text-gray-600">Please sign in to continue</p>
        </div>

        {error && <p className="text-red-600 text-sm text-center">{error}</p>}

        <div className="grid grid-cols-2 gap-3">
          <button type="button" onClick={() => setRole('admin')} className={`px-3 py-2 rounded border ${role==='admin' ? 'bg-teal-600 text-white border-teal-700' : 'bg-white text-gray-700 border-gray-300'}`}>Admin</button>
          <button type="button" onClick={() => setRole('teacher')} className={`px-3 py-2 rounded border ${role==='teacher' ? 'bg-teal-600 text-white border-teal-700' : 'bg-white text-gray-700 border-gray-300'}`}>Teacher</button>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Username</label>
          <input type="text" placeholder="Enter your username" value={username} onChange={(e) => setUsername(e.target.value)} required className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-teal-500" />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Password</label>
          <input type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-teal-500" />
        </div>

        {role === 'admin' && (
          <div className="text-right">
            <button
              type="button"
              onClick={() => navigate('/forgot-password')}
              className="text-xs text-teal-700 hover:underline"
            >
              Forgot admin password?
            </button>
          </div>
        )}

        <button type="submit" disabled={loading} className="w-full py-2 rounded bg-tealgrey-600 text-white hover:bg-tealgrey-700">
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}

export default Login;