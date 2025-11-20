import React, { useState } from 'react';
import axios from 'axios';

function ReportGenerator() {
  const [date, setDate] = useState('');
  const [session, setSession] = useState('all');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleGenerateReport = async () => {
    if (!date) {
      alert('Please select a date.');
      return;
    }

    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('date', date);
      if (session !== 'all') {
        params.append('session', session);
      }

      const res = await axios.get(`http://localhost:5000/api/attendance/report?${params.toString()}`);
      setReports(res.data || []);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-teal-700">Attendance Reports</h2>
      </div>

      <div className="rounded border bg-white p-4 flex flex-col sm:flex-row gap-3 items-end">
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
        <button
          onClick={handleGenerateReport}
          disabled={loading}
          className={`px-4 py-2 rounded text-white ${loading ? 'bg-teal-300' : 'bg-teal-600 hover:bg-teal-700'}`}
        >
          {loading ? 'Generating...' : 'Generate Report'}
        </button>
      </div>

      <div className="rounded border bg-white overflow-x-auto">
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
              <tr key={idx} className="border-t">
                <td className="p-2">{r.date}</td>
                <td className="p-2">{r.studentName}</td>
                <td className="p-2">{r.studentIdNumber}</td>
                <td className="p-2">{r.studentPhoneNumber || '-'}</td>
                <td className="p-2">{r.studentDistrict || '-'}</td>
                <td className="p-2">{r.className}</td>
                <td className="p-2">{r.morning}</td>
                <td className="p-2">{r.evening}</td>
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
      </div>
    </div>
  );
}

export default ReportGenerator;