
const pool = require('../config/db');

// Submit attendance for a class and session (morning/evening)
exports.submitAttendance = async (req, res) => {
  const { classId, teacherId, attendanceDate, session, attendanceData } = req.body;

  if (!['morning', 'evening'].includes(session)) {
    return res.status(400).json({ error: 'Invalid session, expected "morning" or "evening"' });
  }

  try {
    if (!teacherId) {
      return res.status(400).json({ error: 'teacherId is required' });
    }

    // First, check if attendance already exists for this class/date/session
    const [existing] = await pool.query(
      'SELECT id FROM attendance WHERE class_id = ? AND attendance_date = ? AND session = ? LIMIT 1',
      [classId, attendanceDate, session]
    );

    if (existing.length > 0) {
      return res
        .status(409)
        .json({ error: 'Attendance for this class, date and session is already recorded.' });
    }

    // Insert attendance header for the session
    const [result] = await pool.query(
      'INSERT INTO attendance (class_id, teacher_id, attendance_date, session) VALUES (?, ?, ?, ?)',
      [classId, teacherId, attendanceDate, session]
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

    // Gracefully handle duplicate key errors if DB enforces uniqueness
    if (err.code === 'ER_DUP_ENTRY') {
      return res
        .status(409)
        .json({ error: 'Attendance for this class, date and session is already recorded.' });
    }

    res.status(500).json({ error: 'Server error' });
  }
};

// Generate attendance reports with filters
// Query params: startDate, endDate, date, session (morning|evening|all), classId, studentId, idNumber
// When no date/startDate/endDate are provided, defaults to today's date.
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

    // Compute total string 0/2, 1/2, 2/2 while keeping numeric flags
    const mapped = rows.map(r => {
      const morningPresent = Number(r.morning_present) > 0;
      const eveningPresent = Number(r.evening_present) > 0;
      const morning = morningPresent ? 1 : 0;
      const evening = eveningPresent ? 1 : 0;
      const totalNum = morning + evening;
      return {
        ...r,
        morning: morning ? '1/2' : '0/2',
        evening: evening ? '1/2' : '0/2',
        total: `${totalNum}/2`,
        morningPresent,
        eveningPresent,
      };
    });

    res.json(mapped);
  } catch (err) {
    console.error('Error generating report:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Per-student ordered attendance history for drilldown
// Route param: studentId, optional query: classId
exports.getStudentHistory = async (req, res) => {
  const { studentId } = req.params;
  const { classId } = req.query;

  if (!studentId) {
    return res.status(400).json({ error: 'studentId is required' });
  }

  try {
    const params = [studentId];
    let sql = `
      SELECT 
        a.attendance_date AS date,
        a.session,
        ad.status,
        c.name AS className
      FROM attendance a
      JOIN attendance_details ad ON ad.attendance_id = a.id
      JOIN class c ON c.id = a.class_id
      WHERE ad.student_id = ?
    `;

    if (classId) {
      sql += ' AND c.id = ?';
      params.push(classId);
    }

    sql += ' ORDER BY a.attendance_date DESC, a.session ASC';

    const [rows] = await pool.query(sql, params);

    res.json(rows);
  } catch (err) {
    console.error('Error fetching student history:', err);
    res.status(500).json({ error: 'Server error' });
  }
};