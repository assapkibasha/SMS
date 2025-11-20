import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AttendanceManagement() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [attendanceDate, setAttendanceDate] = useState('');
  const [session, setSession] = useState('morning');
  const [students, setStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [submitted, setSubmitted] = useState(false);

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

    fetchClasses();
  }, []);

  // Fetch students for selected class
  const fetchStudents = async () => {
    if (!selectedClass) return;

    try {
      const res = await axios.get(`http://localhost:5000/api/students?classId=${selectedClass}`);
      setStudents(res.data);
      setAttendanceData({});
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  // Handle student attendance change
  const handleAttendanceChange = (studentId, status) => {
    setAttendanceData({
      ...attendanceData,
      [studentId]: status,
    });
  };

  // Submit attendance
  const handleSubmitAttendance = async () => {
    if (!selectedClass || !attendanceDate || Object.keys(attendanceData).length === 0) {
      alert('Please select a class, date, and mark attendance for at least one student.');
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/attendance/submit', {
        classId: Number(selectedClass),
        attendanceDate,
        session,
        attendanceData,
      });
      setSubmitted(true);
      alert('Attendance submitted successfully!');
    } catch (error) {
      console.error('Error submitting attendance:', error);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-teal-700">Attendance Management</h2>
      <div className="flex items-end gap-3">
        <div className="flex flex-col">
          <label className="text-sm text-gray-700">Select Class</label>
          <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="border rounded px-3 py-2 w-64">
            <option value="">-- Select Class --</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>{cls.name}</option>
            ))}
          </select>
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
        <button onClick={fetchStudents} className="bg-teal-600 text-white px-4 py-2 rounded h-10">Load Students</button>
      </div>

      {students.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-medium">Students in: {classes.find((c) => String(c.id) === String(selectedClass))?.name}</h3>
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left p-2">Student Name</th>
                <th className="text-left p-2">ID Number</th>
                <th className="text-left p-2">Mark</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id} className="border-b">
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