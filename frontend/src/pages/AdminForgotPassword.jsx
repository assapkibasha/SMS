import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function AdminForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRequestCode = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      setLoading(true);
      const res = await axios.post('http://localhost:5000/api/auth/admin/forgot-password', { email });
      setMessage(res.data.message || 'If an admin with this email exists, a reset code has been sent.');
      setStep(2);
    } catch (err) {
      console.error('Failed to request reset code', err);
      setError(err.response?.data?.error || 'Failed to request reset code');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!code || !newPassword || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post('http://localhost:5000/api/auth/admin/reset-password', {
        email,
        code,
        newPassword,
      });
      setMessage(res.data.message || 'Password has been reset successfully.');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      console.error('Failed to reset password', err);
      setError(err.response?.data?.error || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-gray-50">
      <div className="w-full max-w-md bg-white rounded-xl shadow p-6 space-y-4">
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-bold text-tealgrey-600">Admin Password Reset</h2>
          <p className="text-sm text-gray-600">
            {step === 1 ? 'Enter your admin email to receive a verification code.' : 'Enter the code sent to your email and choose a new password.'}
          </p>
        </div>

        {message && <p className="text-green-600 text-sm text-center">{message}</p>}
        {error && <p className="text-red-600 text-sm text-center">{error}</p>}

        {step === 1 && (
          <form onSubmit={handleRequestCode} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Admin Email</label>
              <input
                type="email"
                placeholder="Enter your admin email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 rounded bg-tealgrey-600 text-white hover:bg-tealgrey-700"
            >
              {loading ? 'Sending code...' : 'Send verification code'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Admin Email</label>
              <input
                type="email"
                value={email}
                disabled
                className="border rounded px-3 py-2 w-full bg-gray-100 text-gray-600"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Verification Code</label>
              <input
                type="text"
                placeholder="Enter the 6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">New Password</label>
              <input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Confirm New Password</label>
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 rounded bg-tealgrey-600 text-white hover:bg-tealgrey-700"
            >
              {loading ? 'Resetting password...' : 'Reset password'}
            </button>
          </form>
        )}

        <div className="text-center text-xs text-gray-500 pt-2">
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="text-teal-700 hover:underline"
          >
            Back to login
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminForgotPassword;
