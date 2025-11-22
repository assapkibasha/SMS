import React, { useEffect, useState } from 'react';
import axios from 'axios';

function LaptopManagement() {
  const [laptops, setLaptops] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [form, setForm] = useState({
    serialNumber: '',
    model: '',
    cableNumber: '',
    sachetNumber: '',
    packageNumber: '',
  });
  const [assigningId, setAssigningId] = useState(null);
  const [assignStudentId, setAssignStudentId] = useState('');
  const [historyLaptopId, setHistoryLaptopId] = useState(null);
  const [history, setHistory] = useState([]);

  const loadLaptops = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('http://localhost:5000/api/laptops');
      setLaptops(data || []);
    } catch (e) {
      console.error('Failed to load laptops', e);
      setNotification({ type: 'error', message: 'Failed to load laptops.' });
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/students');
      setStudents(data || []);
    } catch (e) {
      console.error('Failed to load students', e);
    }
  };

  useEffect(() => {
    loadLaptops();
    loadStudents();
  }, []);

  const handleCreateLaptop = async () => {
    if (!form.serialNumber) {
      setNotification({ type: 'error', message: 'Serial number is required.' });
      return;
    }
    try {
      await axios.post('http://localhost:5000/api/laptops', form);
      setForm({ serialNumber: '', model: '', cableNumber: '', sachetNumber: '', packageNumber: '' });
      setNotification({ type: 'success', message: 'Laptop saved successfully.' });
      await loadLaptops();
    } catch (e) {
      console.error('Failed to create laptop', e);
      setNotification({ type: 'error', message: e.response?.data?.error || 'Failed to create laptop.' });
    }
  };

  const openAssign = (id) => {
    setAssigningId(id);
    setAssignStudentId('');
  };

  const handleAssign = async () => {
    if (!assigningId || !assignStudentId) {
      setNotification({ type: 'error', message: 'Select a student to assign.' });
      return;
    }
    try {
      await axios.post(`http://localhost:5000/api/laptops/${assigningId}/assign`, {
        studentId: Number(assignStudentId),
      });
      setAssigningId(null);
      setAssignStudentId('');
      setNotification({ type: 'success', message: 'Laptop assigned successfully.' });
      await loadLaptops();
    } catch (e) {
      console.error('Failed to assign laptop', e);
      setNotification({ type: 'error', message: e.response?.data?.error || 'Failed to assign laptop.' });
    }
  };

  const handleReturn = async (id) => {
    if (!window.confirm('Mark this laptop as returned?')) return;
    try {
      await axios.post(`http://localhost:5000/api/laptops/${id}/return`);
      setNotification({ type: 'success', message: 'Laptop marked as returned.' });
      await loadLaptops();
    } catch (e) {
      console.error('Failed to return laptop', e);
      setNotification({ type: 'error', message: e.response?.data?.error || 'Failed to return laptop.' });
    }
  };

  const openHistory = async (id) => {
    try {
      setHistoryLaptopId(id);
      const { data } = await axios.get(`http://localhost:5000/api/laptops/${id}/history`);
      setHistory(data || []);
    } catch (e) {
      console.error('Failed to load history', e);
      setNotification({ type: 'error', message: 'Failed to load history.' });
    }
  };

  const closeHistory = () => {
    setHistoryLaptopId(null);
    setHistory([]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-teal-700">Laptop Management</h2>
      </div>

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

      <div className="rounded border bg-white p-4 space-y-3">
        <h3 className="font-medium text-teal-700">Add new laptop</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            className="border rounded px-3 py-2"
            placeholder="Serial Number"
            value={form.serialNumber}
            onChange={(e) => setForm({ ...form, serialNumber: e.target.value })}
          />
          <input
            className="border rounded px-3 py-2"
            placeholder="Model (optional)"
            value={form.model}
            onChange={(e) => setForm({ ...form, model: e.target.value })}
          />
          <input
            className="border rounded px-3 py-2"
            placeholder="Cable Number"
            value={form.cableNumber}
            onChange={(e) => setForm({ ...form, cableNumber: e.target.value })}
          />
          <input
            className="border rounded px-3 py-2"
            placeholder="Sachet/Bag Number"
            value={form.sachetNumber}
            onChange={(e) => setForm({ ...form, sachetNumber: e.target.value })}
          />
          <input
            className="border rounded px-3 py-2"
            placeholder="Package Number"
            value={form.packageNumber}
            onChange={(e) => setForm({ ...form, packageNumber: e.target.value })}
          />
          <div className="flex items-center">
            <button
              onClick={handleCreateLaptop}
              className="px-4 py-2 rounded bg-teal-600 text-white"
            >
              Save Laptop
            </button>
          </div>
        </div>
      </div>

      <div className="rounded border bg-white overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="text-left p-2">Serial</th>
              <th className="text-left p-2">Model</th>
              <th className="text-left p-2">Cable</th>
              <th className="text-left p-2">Sachet</th>
              <th className="text-left p-2">Package</th>
              <th className="text-left p-2">Status</th>
              <th className="text-left p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {laptops.map((l) => (
              <tr key={l.id} className="border-t">
                <td className="p-2">{l.serialNumber}</td>
                <td className="p-2">{l.model || '-'}</td>
                <td className="p-2">{l.cableNumber || '-'}</td>
                <td className="p-2">{l.sachetNumber || '-'}</td>
                <td className="p-2">{l.packageNumber || '-'}</td>
                <td className="p-2 capitalize">{l.status}</td>
                <td className="p-2 space-x-2">
                  {localStorage.getItem('role') === 'teacher' && l.status !== 'assigned' && (
                    <button
                      onClick={() => openAssign(l.id)}
                      className="px-3 py-1 rounded bg-teal-600 text-white"
                    >
                      Assign
                    </button>
                  )}
                  {localStorage.getItem('role') === 'teacher' && l.status === 'assigned' && (
                    <button
                      onClick={() => handleReturn(l.id)}
                      className="px-3 py-1 rounded bg-tealgrey-600 text-white"
                    >
                      Return
                    </button>
                  )}
                  <button
                    onClick={() => openHistory(l.id)}
                    className="px-3 py-1 rounded bg-gray-200"
                  >
                    History
                  </button>
                </td>
              </tr>
            ))}
            {laptops.length === 0 && !loading && (
              <tr>
                <td className="p-2" colSpan={7}>No laptops yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {assigningId && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-20">
          <div className="bg-white rounded shadow-lg p-4 w-full max-w-md space-y-3">
            <h3 className="font-semibold text-teal-700">Assign laptop</h3>
            <select
              className="border rounded px-3 py-2 w-full"
              value={assignStudentId}
              onChange={(e) => setAssignStudentId(e.target.value)}
            >
              <option value="">-- Select student --</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.studentName} - {s.studentIdNumber}
                </option>
              ))}
            </select>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => { setAssigningId(null); setAssignStudentId(''); }}
                className="px-3 py-1 rounded bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleAssign}
                className="px-3 py-1 rounded bg-teal-600 text-white"
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}

      {historyLaptopId && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-20">
          <div className="bg-white rounded shadow-lg p-4 w-full max-w-lg space-y-3 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-teal-700">Laptop history</h3>
              <button onClick={closeHistory} className="text-sm text-gray-600">Close</button>
            </div>
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left p-2">Date & Time</th>
                  <th className="text-left p-2">Action</th>
                  <th className="text-left p-2">Student</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.id} className="border-t">
                    <td className="p-2">{new Date(h.action_at).toLocaleString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })}</td>
                    <td className="p-2 capitalize">{h.action}</td>
                    <td className="p-2">{h.studentName} - {h.studentIdNumber}</td>
                  </tr>
                ))}
                {history.length === 0 && (
                  <tr>
                    <td className="p-2" colSpan={3}>No history yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default LaptopManagement;
