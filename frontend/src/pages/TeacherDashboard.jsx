import React, { useEffect, useState } from 'react';
import axios from 'axios';

function TeacherDashboard() {
  const [teacher, setTeacher] = useState(null);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const username = localStorage.getItem('username');
        const { data: tch } = await axios.get(`http://localhost:5000/api/teacher?name=${encodeURIComponent(username || '')}`);
        const t = tch[0] || null;
        setTeacher(t);
        if (t?.class_id) {
          const { data: stds } = await axios.get(`http://localhost:5000/api/students?classId=${t.class_id}`);
          setStudents(stds);
        }
      } catch (e) {
        console.error('Failed loading teacher dashboard', e);
      }
    };
    load();
  }, []);

  const className = teacher?.className || '-';
  const totalStudents = students.length;
  const topTwo = students.slice(0, 2);

  return (
    <div className="p-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-tealgrey-600">Teacher Dashboard</h1>
        <p className="text-sm text-gray-600">Overview of your class and quick actions</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-lg border p-4 bg-white">
          <div className="text-sm text-gray-600">Total Students</div>
          <div className="text-3xl font-bold text-teal-700">{totalStudents}</div>
        </div>
        <div className="rounded-lg border p-4 bg-white">
          <div className="text-sm text-gray-600">Assigned Class</div>
          <div className="text-xl font-semibold text-teal-700">{className}</div>
        </div>
        <div className="rounded-lg border p-4 bg-white">
          <div className="text-sm text-gray-600">Top Students</div>
          <div className="text-sm text-gray-800">
            {topTwo.length === 0 ? 'No students yet' : (
              <ul className="list-disc pl-4">
                {topTwo.map(s => (
                  <li key={s.id}>{s.studentName} — {s.studentIdNumber}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-teal-700">Quick links</h2>
          <div className="flex gap-2 flex-wrap">
            <a href="/teacher/students" className="px-4 py-2 rounded bg-teal-600 text-white">Manage students</a>
            <a href="/teacher/attendance" className="px-4 py-2 rounded bg-tealgrey-600 text-white">Make attendance</a>
            <a href="/reports" className="px-4 py-2 rounded bg-teal-600 text-white">View reports</a>
          </div>
        </div>
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-teal-700">Recent students</h2>
          <div className="rounded border bg-white">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left p-2">Name</th>
                  <th className="text-left p-2">ID Number</th>
                </tr>
              </thead>
              <tbody>
                {topTwo.map(s => (
                  <tr key={s.id} className="border-t">
                    <td className="p-2">{s.studentName}</td>
                    <td className="p-2">{s.studentIdNumber}</td>
                  </tr>
                ))}
                {topTwo.length === 0 && (
                  <tr><td className="p-2" colSpan={2}>No students yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeacherDashboard;