const pool = require('../config/db');

// Get students (optionally by class or individual by id or idNumber)
exports.getStudents = async (req, res) => {
  try {
    const { classId, id, idNumber } = req.query;
    let sql = 'SELECT s.*, c.name AS className FROM student s JOIN class c ON s.class_id=c.id';
    const where = [];
    const params = [];
    if (classId) { where.push('s.class_id = ?'); params.push(classId); }
    if (id) { where.push('s.id = ?'); params.push(id); }
    if (idNumber) { where.push('s.studentIdNumber = ?'); params.push(idNumber); }
    if (where.length) sql += ' WHERE ' + where.join(' AND ');
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create student
exports.createStudent = async (req, res) => {
  const { studentName, studentIdNumber, studentDistrict, studentSector, studentPhoneNumber, studentStatus = 'present', class_id } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO student (studentName, studentIdNumber, studentDistrict, studentSector, studentPhoneNumber, studentStatus, class_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [studentName, studentIdNumber, studentDistrict, studentSector, studentPhoneNumber, studentStatus, class_id]
    );
    res.status(201).json({
      id: result.insertId,
      studentName,
      studentIdNumber,
      studentDistrict,
      studentSector,
      studentPhoneNumber,
      studentStatus,
      class_id,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update student
exports.updateStudent = async (req, res) => {
  const { id } = req.params;
  const { studentName, studentIdNumber, studentDistrict, studentSector, studentPhoneNumber, studentStatus, class_id } = req.body;
  try {
    await pool.query(
      'UPDATE student SET studentName=?, studentIdNumber=?, studentDistrict=?, studentSector=?, studentPhoneNumber=?, studentStatus=?, class_id=? WHERE id=?',
      [studentName, studentIdNumber, studentDistrict, studentSector, studentPhoneNumber, studentStatus, class_id, id]
    );
    res.json({ id: Number(id) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete student (cascade deletes attendance_details)
exports.deleteStudent = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM student WHERE id=?', [id]);
    res.json({ message: 'Student deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

