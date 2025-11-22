import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AttendanceManagement() {
  const [teacher, setTeacher] = useState(null);
  const [classId, setClassId] = useState(null);
  const [className, setClassName] = useState('');
  const [attendanceDate, setAttendanceDate] = useState('');
  const [session, setSession] = useState('morning');
  const [students, setStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [selectedStudents, setSelectedStudents] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [notification, setNotification] = useState(null);

  // Load teacher and their assigned class + students
  useEffect(() => {
    const init = async () => {
      try {
        const username = localStorage.getItem('username');
        const { data: tch } = await axios.get(`http://localhost:5000/api/teacher?name=${encodeURIComponent(username || '')}`);
        const t = tch[0] || null;
        setTeacher(t);

        if (!t?.class_id) {
          return;
        }

        setClassId(t.class_id);
        setClassName(t.className || '');

        const { data: stds } = await axios.get(`http://localhost:5000/api/students?classId=${t.class_id}`);
        setStudents(stds);

        const initialSelected = {};
        stds.forEach((s) => {
          initialSelected[s.id] = true;
        });
        setSelectedStudents(initialSelected);
        setAttendanceData({});
      } catch (error) {
        console.error('Error initializing attendance management:', error);
      }
    };

    init();
  }, []);

  // Handle student attendance change
  const handleAttendanceChange = (studentId, status) => {
    setAttendanceData({
      ...attendanceData,
      [studentId]: status,
    });
  };

  // Mark all students as a given status (present/absent)
  const handleMarkAll = (status) => {
    if (!students.length) return;

    const allMarked = {};
    students.forEach((student) => {
      if (selectedStudents[student.id] !== false) {
        allMarked[student.id] = status;
      }
    });
    setAttendanceData(allMarked);
  };

  // Submit attendance
  const handleSubmitAttendance = async () => {
    if (!classId || !attendanceDate || Object.keys(attendanceData).length === 0) {
      setNotification({ type: 'error', message: 'Please select a date and mark attendance for at least one student.' });
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/attendance/submit', {
        classId: Number(classId),
        teacherId: teacher?.id || null,
        attendanceDate,
        session,
        attendanceData,
      });
      setSubmitted(true);
      setNotification({ type: 'success', message: 'Attendance submitted successfully.' });
    } catch (error) {
      console.error('Error submitting attendance:', error);
      if (error.response && error.response.status === 409) {
        setNotification({ type: 'error', message: error.response.data?.error || 'Attendance for this class, date and session is already recorded.' });
      } else {
        setNotification({ type: 'error', message: 'Failed to submit attendance. Please try again.' });
      }
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-teal-700">Attendance Management</h2>
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
      <div className="flex items-end gap-3">
        <div className="flex flex-col">
          <label className="text-sm text-gray-700">Class</label>
          <input
            type="text"
            value={className || (teacher?.className || 'No class assigned')}
            disabled
            className="border rounded px-3 py-2 w-64 bg-gray-100 text-gray-700"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm text-gray-700">Session</label>
          <select value={session} onChange={(e) => setSession(e.target.value)} className="border rounded px-3 py-2 w-40">
            <option value="morning">Morning</option>
            <option value="evening">Evening</option>
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-sm text-gray-700">Attendance Date</label>
          <input type="date" value={attendanceDate} onChange={(e) => setAttendanceDate(e.target.value)} className="border rounded px-3 py-2" />
        </div>
      </div>

      {students.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-medium">Students in: {className || teacher?.className || '-'}</h3>
          <div className="flex gap-2 mb-2">
            <button
              type="button"
              onClick={() => handleMarkAll('present')}
              className="px-3 py-1 rounded border bg-teal-600 text-white border-teal-700 text-sm"
            >
              Mark all present
            </button>
            <button
              type="button"
              onClick={() => handleMarkAll('absent')}
              className="px-3 py-1 rounded border bg-tealgrey-600 text-white border-tealgrey-700 text-sm"
            >
              Mark all absent
            </button>
          </div>
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left p-2">Include</th>
                <th className="text-left p-2">Student Name</th>
                <th className="text-left p-2">ID Number</th>
                <th className="text-left p-2">Mark</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id} className="border-b">
                  <td className="p-2">
                    <input
                      type="checkbox"
                      checked={selectedStudents[student.id] !== false}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setSelectedStudents((prev) => ({
                          ...prev,
                          [student.id]: checked,
                        }));

                        if (!checked) {
                          setAttendanceData((prev) => {
                            const updated = { ...prev };
                            delete updated[student.id];
                            return updated;
                          });
                        }
                      }}
                    />
                  </td>
                  <td className="p-2">{student.studentName}</td>
                  <td className="p-2">{student.studentIdNumber}</td>
                  <td className="p-2">
                    <div className="flex gap-2">
                      <button onClick={() => handleAttendanceChange(student.id, 'present')} className={`px-3 py-1 rounded border ${attendanceData[student.id] === 'present' ? 'bg-green-600 text-white border-green-700' : 'bg-white text-gray-700 border-gray-300'}`}>Present</button>
                      <button onClick={() => handleAttendanceChange(student.id, 'absent')} className={`px-3 py-1 rounded border ${attendanceData[student.id] === 'absent' ? 'bg-red-600 text-white border-red-700' : 'bg-white text-gray-700 border-gray-300'}`}>Absent</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <button onClick={handleSubmitAttendance} disabled={submitted} className={`px-4 py-2 rounded ${submitted ? 'bg-gray-300 text-gray-600' : 'bg-teal-600 text-white hover:bg-teal-700'}`}>
        {submitted ? 'Submitted' : 'Submit Attendance'}
      </button>
    </div>
  );
}

export default AttendanceManagement;