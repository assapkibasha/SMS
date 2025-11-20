import React, { useEffect, useState } from 'react';
import axios from 'axios';

function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [classId, setClassId] = useState(null);
  const [form, setForm] = useState({
    studentName: '',
    studentIdNumber: '',
    studentPhoneNumber: '',
    studentDistrict: '',
    studentSector: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [editingData, setEditingData] = useState(null);

  const load = async (cid) => {
    try {
      const url = cid ? `http://localhost:5000/api/students?classId=${cid}` : 'http://localhost:5000/api/students';
      const { data } = await axios.get(url);
      setStudents(data);
    } catch (e) {
      console.error('Failed to fetch students', e);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const username = localStorage.getItem('username');
        // Get teacher to know assigned class (if any)
        const { data: tch } = await axios.get(`http://localhost:5000/api/teacher?name=${encodeURIComponent(username || '')}`);
        const t = tch[0] || null;
        const cid = t?.class_id || null;
        setClassId(cid);
        await load(cid);
      } catch (e) {
        await load(null);
      }
    };
    init();
  }, []);

  const resetForm = () => setForm({ studentName: '', studentIdNumber: '', studentPhoneNumber: '', studentDistrict: '', studentSector: '' });

  const addStudent = async () => {
    if (!form.studentName || !form.studentIdNumber || !classId) return;
    try {
      const payload = { ...form, studentStatus: 'present', class_id: classId };
      const { data } = await axios.post('http://localhost:5000/api/students', payload);
      setStudents(prev => [...prev, data]);
      resetForm();
      setShowForm(false);
    } catch (e) {
      console.error('Add student failed', e);
    }
  };

  const removeStudent = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/students/${id}`);
      setStudents(prev => prev.filter(s => s.id !== id));
    } catch (e) {
      console.error('Delete student failed', e);
    }
  };

  const saveEdit = async () => {
    if (!editingId || !editingData) return;
    try {
      const payload = { ...editingData, class_id: classId };
      await axios.put(`http://localhost:5000/api/students/${editingId}`, payload);
      setStudents(prev => prev.map(s => s.id === editingId ? { ...s, ...editingData } : s));
      setEditingId(null);
      setEditingData(null);
    } catch (e) {
      console.error('Update student failed', e);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-teal-700">Students</h2>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-teal-600 text-white rounded">{showForm ? 'Close' : 'Add Student'}</button>
      </div>

      {showForm && (
        <div className="rounded border p-4 bg-white grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input className="border rounded px-3 py-2" placeholder="Student Name" value={form.studentName} onChange={e=>setForm({...form, studentName:e.target.value})} />
          <input className="border rounded px-3 py-2" placeholder="ID Number" value={form.studentIdNumber} onChange={e=>setForm({...form, studentIdNumber:e.target.value})} />
          <input className="border rounded px-3 py-2" placeholder="Phone Number" value={form.studentPhoneNumber} onChange={e=>setForm({...form, studentPhoneNumber:e.target.value})} />
          <input className="border rounded px-3 py-2" placeholder="District" value={form.studentDistrict} onChange={e=>setForm({...form, studentDistrict:e.target.value})} />
          <input className="border rounded px-3 py-2" placeholder="Sector" value={form.studentSector} onChange={e=>setForm({...form, studentSector:e.target.value})} />
          <div className="flex items-center">
            <button onClick={addStudent} className="px-4 py-2 bg-teal-600 text-white rounded">Save</button>
          </div>
        </div>
      )}

      <div className="rounded border bg-white overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="text-left p-2">Name</th>
              <th className="text-left p-2">ID Number</th>
              <th className="text-left p-2">Phone</th>
              <th className="text-left p-2">District</th>
              <th className="text-left p-2">Sector</th>
              <th className="text-left p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map(std => (
              <tr key={std.id} className="border-t">
                {editingId === std.id ? (
                  <>
                    <td className="p-2"><input className="border rounded px-2 py-1 w-full" value={editingData.studentName} onChange={e=>setEditingData({...editingData, studentName:e.target.value})} /></td>
                    <td className="p-2"><input className="border rounded px-2 py-1 w-full" value={editingData.studentIdNumber} onChange={e=>setEditingData({...editingData, studentIdNumber:e.target.value})} /></td>
                    <td className="p-2"><input className="border rounded px-2 py-1 w-full" value={editingData.studentPhoneNumber || ''} onChange={e=>setEditingData({...editingData, studentPhoneNumber:e.target.value})} /></td>
                    <td className="p-2"><input className="border rounded px-2 py-1 w-full" value={editingData.studentDistrict || ''} onChange={e=>setEditingData({...editingData, studentDistrict:e.target.value})} /></td>
                    <td className="p-2"><input className="border rounded px-2 py-1 w-full" value={editingData.studentSector || ''} onChange={e=>setEditingData({...editingData, studentSector:e.target.value})} /></td>
                    <td className="p-2 flex gap-2">
                      <button onClick={saveEdit} className="px-3 py-1 bg-teal-600 text-white rounded">Save</button>
                      <button onClick={()=>{setEditingId(null); setEditingData(null);}} className="px-3 py-1 bg-gray-200 rounded">Cancel</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="p-2">{std.studentName}</td>
                    <td className="p-2">{std.studentIdNumber}</td>
                    <td className="p-2">{std.studentPhoneNumber || '-'}</td>
                    <td className="p-2">{std.studentDistrict || '-'}</td>
                    <td className="p-2">{std.studentSector || '-'}</td>
                    <td className="p-2 flex gap-2">
                      <button onClick={()=>{setEditingId(std.id); setEditingData(std);}} className="px-3 py-1 bg-teal-50 text-teal-700 border border-teal-200 rounded">Edit</button>
                      <button onClick={()=>removeStudent(std.id)} className="px-3 py-1 bg-red-50 text-red-700 border border-red-200 rounded">Delete</button>
                    </td>
                  </>
                )}
              </tr>
            ))}
            {students.length === 0 && (
              <tr><td className="p-2" colSpan={6}>No students yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default StudentManagement;