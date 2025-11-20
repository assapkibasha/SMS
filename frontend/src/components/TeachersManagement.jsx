import React, { useEffect, useState } from 'react';
import axios from 'axios';

function TeachersManagement() {
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [form, setForm] = useState({ name: '', password: '', class_id: '' });
  const admin_id = 1; // seed admin

  const load = async () => {
    try {
      const [tch, cls] = await Promise.all([
        axios.get('http://localhost:5000/api/teacher'),
        axios.get('http://localhost:5000/api/class'),
      ]);
      setTeachers(tch.data);
      setClasses(cls.data);
    } catch (e) {
      console.error('Failed loading data', e);
    }
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!form.name || !form.password) return;
    try {
      await axios.post('http://localhost:5000/api/teacher', {
        name: form.name,
        password: form.password,
        admin_id,
        class_id: form.class_id ? Number(form.class_id) : null,
      });
      setForm({ name: '', password: '', class_id: '' });
      await load();
    } catch (e) {
      console.error('Create teacher failed', e);
    }
  };

  const update = async (id, patch) => {
    try {
      await axios.put(`http://localhost:5000/api/teacher/${id}`, patch);
      await load();
    } catch (e) {
      console.error('Update teacher failed', e);
    }
  };

  const removeT = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/teacher/${id}`);
      await load();
    } catch (e) {
      console.error('Delete teacher failed', e);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-teal-700">Teachers</h2>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
        <input className="border rounded px-3 py-2" placeholder="Name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} />
        <input className="border rounded px-3 py-2" placeholder="Password" type="password" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} />
        <select className="border rounded px-3 py-2" value={form.class_id} onChange={e=>setForm({...form, class_id:e.target.value})}>
          <option value="">Assign class (optional)</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <button onClick={create} className="bg-teal-600 text-white px-4 py-2 rounded">Create</button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="text-left p-2">Name</th>
              <th className="text-left p-2">Class</th>
              <th className="text-left p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map(t => (
              <tr key={t.id} className="border-b">
                <td className="p-2">{t.name}</td>
                <td className="p-2">{t.className || '-'}</td>
                <td className="p-2 flex gap-2">
                  <select className="border rounded px-2 py-1" value={t.class_id || ''} onChange={e=>update(t.id, { name: t.name, password: t.password, class_id: e.target.value || null })}>
                    <option value="">Unassigned</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <button onClick={()=>removeT(t.id)} className="px-3 py-1 bg-red-50 text-red-700 border border-red-200 rounded">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TeachersManagement;
