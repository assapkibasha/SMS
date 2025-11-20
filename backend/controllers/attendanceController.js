const pool = require('../config/db');

// Submit attendance for a class and session (morning/evening)
exports.submitAttendance = async (req, res) => {
  const { classId, attendanceDate, session, attendanceData } = req.body;

  if (!['morning', 'evening'].includes(session)) {
    return res.status(400).json({ error: 'Invalid session, expected "morning" or "evening"' });
  }

  try {
    // Insert attendance header for the session
    // Note: we only store class_id, date and session here to match the DB schema
    const [result] = await pool.query(
      'INSERT INTO attendance (class_id, attendance_date, session) VALUES (?, ?, ?)',
      [classId, attendanceDate, session]
    );

    const attendanceId = result.insertId;

    // Insert student attendance details
    for (const [studentId, status] of Object.entries(attendanceData)) {
      await pool.query(
        'INSERT INTO attendance_details (attendance_id, student_id, status) VALUES (?, ?, ?)',
        [attendanceId, studentId, status]
      );
    }

    res.status(201).json({ message: 'Attendance submitted successfully!' });
  } catch (err) {
    console.error('Error submitting attendance:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Generate reports with filters
// Query params: startDate, endDate, date, session (morning|evening|all), classId, studentId, idNumber
exports.generateReport = async (req, res) => {
  const { startDate, endDate, date, session = 'all', classId, studentId, idNumber } = req.query;

  try {
    const params = [];
    const where = [];

    if (date) {
      where.push('a.attendance_date = ?');
      params.push(date);
    } else if (startDate && endDate) {
      where.push('a.attendance_date BETWEEN ? AND ?');
      params.push(startDate, endDate);
    }

    if (session !== 'all') {
      where.push('a.session = ?');
      params.push(session);
    }

    if (classId) { where.push('c.id = ?'); params.push(classId); }
    if (studentId) { where.push('s.id = ?'); params.push(studentId); }
    if (idNumber) { where.push('s.studentIdNumber = ?'); params.push(idNumber); }

    const whereSql = where.length ? 'WHERE ' + where.join(' AND ') : '';

    // Aggregate morning/evening presence per student per date
    const sql = `
      SELECT 
        a.attendance_date AS date,
        s.id AS studentId,
        s.studentName,
        s.studentIdNumber,
        s.studentPhoneNumber,
        s.studentDistrict,
        c.name AS className,
        SUM(CASE WHEN a.session='morning' AND ad.status='present' THEN 1 ELSE 0 END) AS morning_present,
        SUM(CASE WHEN a.session='evening' AND ad.status='present' THEN 1 ELSE 0 END) AS evening_present
      FROM attendance a
      JOIN attendance_details ad ON ad.attendance_id = a.id
      JOIN student s ON s.id = ad.student_id
      JOIN class c ON c.id = a.class_id
      ${whereSql}
      GROUP BY a.attendance_date, s.id
      ORDER BY a.attendance_date DESC, s.studentName ASC
    `;

    const [rows] = await pool.query(sql, params);

    // Compute total string 0/2, 1/2, 2/2
    const mapped = rows.map(r => {
      const morning = Number(r.morning_present) > 0 ? 1 : 0;
      const evening = Number(r.evening_present) > 0 ? 1 : 0;
      const totalNum = morning + evening;
      return {
        ...r,
        morning: morning ? '1/2' : '0/2',
        evening: evening ? '1/2' : '0/2',
        total: `${totalNum}/2`,
      };
    });

    res.json(mapped);
  } catch (err) {
    console.error('Error generating report:', err);
    res.status(500).json({ error: 'Server error' });
  }
};