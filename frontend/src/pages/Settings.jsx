import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Settings() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [role, setRole] = useState(null);
  const [email, setEmail] = useState('');
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const storedRole = localStorage.getItem('role');
    const storedUsername = localStorage.getItem('username');
    setRole(storedRole);
    if (storedUsername) {
      setUsername(storedUsername);
    }

    const loadUser = async () => {
      if (!storedRole || !storedUsername) return;
      try {
        if (storedRole === 'admin') {
          const { data } = await axios.get('http://localhost:5000/api/admin/admins');
          const current = data.find((a) => a.name === storedUsername);
          if (current) {
            setUserId(current.id);
            setEmail(current.email || '');
          }
        } else if (storedRole === 'teacher') {
          const { data } = await axios.get(`http://localhost:5000/api/teacher?name=${encodeURIComponent(storedUsername)}`);
          const current = data[0];
          if (current) {
            setUserId(current.id);
          }
        }
      } catch (e) {
        console.error('Failed to load user for settings', e);
      }
    };

    loadUser();
  }, []);

  const handleSave = async () => {
    if (!role || !userId || !username || !password || (role === 'admin' && !email)) {
      setNotification({ type: 'error', message: 'Please fill in all required fields.' });
      return;
    }

    try {
      setLoading(true);
      if (role === 'admin') {
        await axios.put(`http://localhost:5000/api/admin/admins/${userId}`, {
          name: username,
          password,
          email,
        });
      } else if (role === 'teacher') {
        await axios.put(`http://localhost:5000/api/teacher/${userId}`, {
          name: username,
          password,
        });
      }
      localStorage.setItem('username', username);
      setNotification({ type: 'success', message: 'Settings saved successfully.' });
      setPassword('');
    } catch (e) {
      console.error('Failed to save settings', e);
      setNotification({ type: 'error', message: 'Failed to save settings. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-teal-700">Account Settings</h2>
      {notification && (
        <div
          className={`rounded px-4 py-2 text-sm ${
            notification.type === 'error'
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-green-50 text-green-700 border border-green-200'
          }`}
        >
          <div className="flex justify-between items-center">
            <span>{notification.message}</span>
            <button
              type="button"
              onClick={() => setNotification(null)}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
      <div className="rounded border bg-white p-4 max-w-md space-y-3">
        <div className="text-sm text-gray-600">Role: <span className="font-medium capitalize">{role || 'Unknown'}</span></div>
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-700">Username</label>
          <input
            className="border rounded px-3 py-2"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
          />
        </div>
        {role === 'admin' && (
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-700">Email (for password reset)</label>
            <input
              type="email"
              className="border rounded px-3 py-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter admin email"
            />
          </div>
        )}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-700">Password</label>
          <input
            type="password"
            className="border rounded px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter new password"
          />
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className={`px-4 py-2 rounded text-white ${loading ? 'bg-teal-300' : 'bg-teal-600 hover:bg-teal-700'}`}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}

export default Settings;
