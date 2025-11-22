import React from 'react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function AdminDashboard() {
  const [totals, setTotals] = useState({ classes: 0, students: 0, teachers: 0 });
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);

  useEffect(() => {
    const fetchTotals = async () => {
      try {
        const [cls, std, tch] = await Promise.all([
          axios.get('http://localhost:5000/api/class'),
          axios.get('http://localhost:5000/api/students'),
          axios.get('http://localhost:5000/api/teacher'),
        ]);
        setTotals({ classes: cls.data.length, students: std.data.length, teachers: tch.data.length });
        setClasses(cls.data);
        setTeachers(tch.data);
      } catch (e) {
        console.error('Failed to load totals', e);
      }
    };
    fetchTotals();
  }, []);

  return (
    <div className="p-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-tealgrey-600">Admin Dashboard</h1>
        <p className="text-sm text-gray-600">Manage classes, teachers, students and reports</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-lg border p-4 bg-white">
          <div className="text-sm text-gray-600">Total Classes</div>
          <div className="text-3xl font-bold text-teal-700">{totals.classes}</div>
        </div>
        <div className="rounded-lg border p-4 bg-white">
          <div className="text-sm text-gray-600">Total Students</div>
          <div className="text-3xl font-bold text-teal-700">{totals.students}</div>
        </div>
        <div className="rounded-lg border p-4 bg-white">
          <div className="text-sm text-gray-600">Total Teachers</div>
          <div className="text-3xl font-bold text-teal-700">{totals.teachers}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-teal-700">Quick links</h2>
          <div className="flex gap-2 flex-wrap">
            <Link to="/admin/classes" className="px-4 py-2 rounded bg-teal-600 text-white">Create class</Link>
            <Link to="/admin/teachers" className="px-4 py-2 rounded bg-teal-600 text-white">Create teacher</Link>
            <Link to="/admin/laptops" className="px-4 py-2 rounded bg-teal-600 text-white">Manage laptops</Link>
            <Link to="/reports" className="px-4 py-2 rounded bg-tealgrey-600 text-white">View reports</Link>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-teal-700">Recent classes</h2>
            <Link to="/admin/classes" className="text-sm text-teal-700">View more</Link>
          </div>
          <div className="rounded border bg-white">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left p-2">Class</th>
                  <th className="text-left p-2">Assigned teacher</th>
                </tr>
              </thead>
              <tbody>
                {classes.slice(0,2).map(c => {
                  const teacher = teachers.find(t => String(t.class_id) === String(c.id));
                  return (
                    <tr key={c.id} className="border-t">
                      <td className="p-2">{c.name}</td>
                      <td className="p-2">{teacher?.name || '-'}</td>
                    </tr>
                  );
                })}
                {classes.length === 0 && (
                  <tr><td className="p-2" colSpan={2}>No classes yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;