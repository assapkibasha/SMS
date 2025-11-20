import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Settings() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [role, setRole] = useState(null);

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
    if (!role || !userId || !username || !password) {
      alert('Please fill in username and password.');
      return;
    }

    try {
      setLoading(true);
      if (role === 'admin') {
        await axios.put(`http://localhost:5000/api/admin/admins/${userId}`, {
          name: username,
          password,
        });
      } else if (role === 'teacher') {
        await axios.put(`http://localhost:5000/api/teacher/${userId}`, {
          name: username,
          password,
        });
      }
      localStorage.setItem('username', username);
      alert('Settings saved successfully.');
      setPassword('');
    } catch (e) {
      console.error('Failed to save settings', e);
      alert('Failed to save settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-teal-700">Account Settings</h2>
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
