import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

function ReportGenerator() {
  const [reportType, setReportType] = useState('attendance'); // 'attendance' | 'laptop'
  const [date, setDate] = useState('');
  const [session, setSession] = useState('all');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentHistory, setStudentHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const role = typeof window !== 'undefined' ? localStorage.getItem('role') : null;
  const username = typeof window !== 'undefined' ? localStorage.getItem('username') : null;

  // Today in yyyy-mm-dd for default filter
  const todayIso = useMemo(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }, []);

  // Helper to format date dd-mm-yyyy
  const formatDate = (isoDate) => {
    if (!isoDate) return '-';
    const d = new Date(isoDate);
    if (Number.isNaN(d.getTime())) return isoDate;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handleGenerateAttendanceReport = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      // If user selected a date, use it; otherwise rely on backend default (today)
      if (date) {
        params.append('date', date);
      }
      if (session !== 'all') {
        params.append('session', session);
      }

      const res = await axios.get(`http://localhost:5000/api/attendance/report?${params.toString()}`);
      setReports(res.data || []);
    } catch (error) {
      console.error('Error generating attendance report:', error);
      setNotification({ type: 'error', message: 'Failed to generate attendance report. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateLaptopReport = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      // For now we only filter by teacher's class or show all for admin
      if (role === 'teacher' && username) {
        try {
          const { data: tch } = await axios.get(`http://localhost:5000/api/teacher?name=${encodeURIComponent(username)}`);
          const t = tch[0];
          if (t?.class_id) {
            params.append('classId', t.class_id);
          }
        } catch (err) {
          console.error('Failed to resolve teacher class for laptop report', err);
        }
      }

      const query = params.toString();
      const url = query
        ? `http://localhost:5000/api/laptops?${query}`
        : 'http://localhost:5000/api/laptops';

      const { data } = await axios.get(url);
      setReports(data || []);
    } catch (error) {
      console.error('Error generating laptop report:', error);
      setNotification({ type: 'error', message: 'Failed to generate laptop report. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = () => {
    setNotification(null);
    if (reportType === 'attendance') {
      handleGenerateAttendanceReport();
    } else {
      handleGenerateLaptopReport();
    }
  };

  // Load default (today) attendance report on first mount
  useEffect(() => {
    setDate(todayIso);
    handleGenerateAttendanceReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openStudentHistory = async (row) => {
    if (!row?.studentId) return;
    setSelectedStudent(row);
    setStudentHistory([]);
    setHistoryLoading(true);
    try {
      const params = new URLSearchParams();
      if (row.classId) {
        params.append('classId', row.classId);
      }
      const q = params.toString();
      const url = q
        ? `http://localhost:5000/api/attendance/history/${row.studentId}?${q}`
        : `http://localhost:5000/api/attendance/history/${row.studentId}`;
      const { data } = await axios.get(url);
      setStudentHistory(data || []);
    } catch (error) {
      console.error('Error loading student history:', error);
      setNotification({ type: 'error', message: 'Failed to load student history.' });
    } finally {
      setHistoryLoading(false);
    }
  };

  const closeStudentHistory = () => {
    setSelectedStudent(null);
    setStudentHistory([]);
  };

  const handlePrint = () => {
    window.print();
  };

  const renderAttendanceTable = () => (
    <div className="rounded border bg-white overflow-x-auto print:bg-white" id="report-area">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="text-left p-2">Date</th>
            <th className="text-left p-2">Student Name</th>
            <th className="text-left p-2">ID Number</th>
            <th className="text-left p-2">Phone</th>
            <th className="text-left p-2">District</th>
            <th className="text-left p-2">Class</th>
            <th className="text-left p-2">Morning</th>
            <th className="text-left p-2">Evening</th>
            <th className="text-left p-2">Total</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((r, idx) => (
            <tr
              key={idx}
              className="border-t hover:bg-gray-50 cursor-pointer"
              onClick={() => openStudentHistory(r)}
            >
              <td className="p-2">{formatDate(r.date)}</td>
              <td className="p-2">{r.studentName}</td>
              <td className="p-2">{r.studentIdNumber}</td>
              <td className="p-2">{r.studentPhoneNumber || '-'}</td>
              <td className="p-2">{r.studentDistrict || '-'}</td>
              <td className="p-2">{r.className}</td>
              <td className="p-2">
                <span
                  className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                    r.morningPresent
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {r.morningPresent ? 'Present (AM)' : 'Absent (AM)'}
                </span>
              </td>
              <td className="p-2">
                <span
                  className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                    r.eveningPresent
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {r.eveningPresent ? 'Present (PM)' : 'Absent (PM)'}
                </span>
              </td>
              <td className="p-2">{r.total}</td>
            </tr>
          ))}
          {reports.length === 0 && !loading && (
            <tr>
              <td className="p-2" colSpan={9}>No data for the selected filters.</td>
            </tr>
          )}
        </tbody>
      </table>
      <div className="border-t mt-4 pt-2 px-4 text-xs text-gray-500 flex justify-between items-center print:text-black">
        <span>Printed by: {username || 'Unknown'}</span>
        <span>{`Generated at: ${new Date().toLocaleString(undefined, { hour12: false })}`}</span>
        <span className="italic opacity-70">Generated by Student Management</span>
      </div>
      <div className="mt-4 px-4 pb-4 text-xs text-gray-500 print:text-black">
        Signature: _____________________________
      </div>
    </div>
  );

  const renderLaptopTable = () => (
    <div className="rounded border bg-white overflow-x-auto print:bg-white" id="report-area">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="text-left p-2">Serial</th>
            <th className="text-left p-2">Model</th>
            <th className="text-left p-2">Cable</th>
            <th className="text-left p-2">Sachet</th>
            <th className="text-left p-2">Package</th>
            <th className="text-left p-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((l) => (
            <tr key={l.id} className="border-t">
              <td className="p-2">{l.serialNumber}</td>
              <td className="p-2">{l.model || '-'}</td>
              <td className="p-2">{l.cableNumber || '-'}</td>
              <td className="p-2">{l.sachetNumber || '-'}</td>
              <td className="p-2">{l.packageNumber || '-'}</td>
              <td className="p-2 capitalize">{l.status}</td>
            </tr>
          ))}
          {reports.length === 0 && !loading && (
            <tr>
              <td className="p-2" colSpan={6}>No laptop data for the selected filters.</td>
            </tr>
          )}
        </tbody>
      </table>
      <div className="border-t mt-4 pt-2 px-4 text-xs text-gray-500 flex justify-between items-center print:text-black">
        <span>Printed by: {username || 'Unknown'}</span>
        <span>{`Generated at: ${new Date().toLocaleString(undefined, { hour12: false })}`}</span>
        <span className="italic opacity-70">Generated by Student Management</span>
      </div>
      <div className="mt-4 px-4 pb-4 text-xs text-gray-500 print:text-black">
        Signature: _____________________________
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-teal-700">Reports</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="px-3 py-1.5 rounded border border-teal-600 text-teal-700 text-sm bg-white hover:bg-teal-50"
          >
            Print / Save as PDF
          </button>
        </div>
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
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-col">
            <label className="text-sm text-gray-700 mb-1">Report type</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setReportType('attendance')}
                className={`px-3 py-1.5 rounded border text-sm ${
                  reportType === 'attendance'
                    ? 'bg-teal-600 text-white border-teal-700'
                    : 'bg-white text-gray-700 border-gray-300'
                }`}
              >
                Attendance
              </button>
              <button
                type="button"
                onClick={() => setReportType('laptop')}
                className={`px-3 py-1.5 rounded border text-sm ${
                  reportType === 'laptop'
                    ? 'bg-teal-600 text-white border-teal-700'
                    : 'bg-white text-gray-700 border-gray-300'
                }`}
              >
                Laptop
              </button>
            </div>
          </div>

          {reportType === 'attendance' && (
            <>
              <div className="flex flex-col">
                <label className="text-sm text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="border rounded px-3 py-2 min-w-[200px]"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm text-gray-700 mb-1">Session</label>
                <select
                  value={session}
                  onChange={(e) => setSession(e.target.value)}
                  className="border rounded px-3 py-2 min-w-[150px]"
                >
                  <option value="all">All</option>
                  <option value="morning">Morning</option>
                  <option value="evening">Evening</option>
                </select>
              </div>
            </>
          )}

          <div className="ml-auto">
            <button
              onClick={handleGenerateReport}
              disabled={loading}
              className={`px-4 py-2 rounded text-white text-sm ${
                loading ? 'bg-teal-300' : 'bg-teal-600 hover:bg-teal-700'
              }`}
            >
              {loading ? 'Generating...' : 'Generate Report'}
            </button>
          </div>
        </div>
      </div>

      {reportType === 'attendance' ? renderAttendanceTable() : renderLaptopTable()}

      {selectedStudent && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-30">
          <div className="bg-white rounded shadow-lg p-4 w-full max-w-lg max-h-[80vh] overflow-y-auto space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-teal-700">Attendance history</h3>
                <p className="text-xs text-gray-600">
                  {selectedStudent.studentName} ({selectedStudent.studentIdNumber})
                </p>
              </div>
              <button
                type="button"
                onClick={closeStudentHistory}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Close
              </button>
            </div>
            {historyLoading ? (
              <p className="text-sm text-gray-600">Loading history...</p>
            ) : (
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left p-2">Date</th>
                    <th className="text-left p-2">Session</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Class</th>
                  </tr>
                </thead>
                <tbody>
                  {studentHistory.map((h, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="p-2">{formatDate(h.date)}</td>
                      <td className="p-2 capitalize">{h.session}</td>
                      <td className="p-2 capitalize">{h.status}</td>
                      <td className="p-2">{h.className}</td>
                    </tr>
                  ))}
                  {studentHistory.length === 0 && !historyLoading && (
                    <tr>
                      <td className="p-2" colSpan={4}>No history available.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ReportGenerator;