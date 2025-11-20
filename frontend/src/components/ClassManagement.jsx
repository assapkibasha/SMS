import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ClassManagement() {
  const [classes, setClasses] = useState([]);
  const [name, setName] = useState('');
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const adminId = 1; // seed admin

  // Fetch classes from backend
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/class');
        setClasses(res.data);
      } catch (error) {
        console.error('Error fetching classes:', error);
      }
    };
    const fetchTeachers = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/teacher');
        setTeachers(res.data);
      } catch (e) {
        console.error('Error fetching teachers', e);
      }
    };

    fetchClasses();
    fetchTeachers();
  }, []);

  // Add a new class
  const handleAddClass = async () => {
    if (!name) return;

    try {
      const res = await axios.post('http://localhost:5000/api/class', { name, admin_id: adminId });
      const created = res.data;
      setClasses([...classes, created]);
      setName('');
      if (selectedTeacher) {
        await axios.post('http://localhost:5000/api/class/assign-teacher', {
          class_id: created.id,
          teacher_id: Number(selectedTeacher),
        });
        setSelectedTeacher('');
      }
    } catch (error) {
      console.error('Error adding class:', error);
    }
  };

  // Delete a class
  const handleDeleteClass = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/class/${id}`);
      setClasses(classes.filter((cls) => cls.id !== id));
    } catch (error) {
      console.error('Error deleting class:', error);
    }
  };

  // Start editing a class
  const handleEditClass = (id, name) => {
    setEditingId(id);
    setEditingName(name);
  };

  // Save edited class
  const handleSaveEdit = async () => {
    if (!editingId || !editingName) return;

    try {
      await axios.put(`http://localhost:5000/api/class/${editingId}`, { name: editingName });
      setClasses(
        classes.map((cls) =>
          cls.id === editingId ? { ...cls, name: editingName } : cls
        )
      );
      setEditingId(null);
      setEditingName('');
    } catch (error) {
      console.error('Error updating class:', error);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-teal-700">Class Management</h2>
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Enter class name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border rounded px-3 py-2 w-64"
        />
        <select value={selectedTeacher} onChange={(e)=>setSelectedTeacher(e.target.value)} className="border rounded px-3 py-2 w-64">
          <option value="">Assign teacher (optional)</option>
          {teachers.map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
        <button onClick={handleAddClass} className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700">Add Class</button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="text-left p-2">Class Name</th>
              <th className="text-left p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {classes.map((cls) => (
              <tr key={cls.id} className="border-b">
                {editingId === cls.id ? (
                  <>
                    <td className="p-2">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="border rounded px-2 py-1 w-full"
                      />
                    </td>
                    <td className="p-2 flex gap-2">
                      <button onClick={handleSaveEdit} className="px-3 py-1 bg-teal-600 text-white rounded">Save</button>
                      <button onClick={() => setEditingId(null)} className="px-3 py-1 bg-gray-200 rounded">Cancel</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="p-2">{cls.name}</td>
                    <td className="p-2 flex gap-2">
                      <button onClick={() => handleEditClass(cls.id, cls.name)} className="px-3 py-1 bg-teal-50 text-teal-700 border border-teal-200 rounded">Edit</button>
                      <button onClick={() => handleDeleteClass(cls.id)} className="px-3 py-1 bg-red-50 text-red-700 border border-red-200 rounded">Delete</button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ClassManagement;