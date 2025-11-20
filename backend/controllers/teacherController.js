const pool = require('../config/db');

// Get teachers (optionally by admin or class)
exports.getTeachers = async (req, res) => {
  try {
    const { adminId, classId, name } = req.query;
    let sql = 'SELECT t.*, c.name AS className FROM teacher t LEFT JOIN class c ON t.class_id=c.id';
    const params = [];
    const where = [];
    if (adminId) { where.push('t.admin_id = ?'); params.push(adminId); }
    if (classId) { where.push('t.class_id = ?'); params.push(classId); }
    if (name) { where.push('t.name = ?'); params.push(name); }
    if (where.length) sql += ' WHERE ' + where.join(' AND ');
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create teacher
exports.createTeacher = async (req, res) => {
  const { name, password, admin_id, class_id = null } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO teacher (name, password, admin_id, class_id) VALUES (?, ?, ?, ?)',
      [name, password, admin_id, class_id]
    );
    res.status(201).json({ id: result.insertId, name, admin_id, class_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update teacher
exports.updateTeacher = async (req, res) => {
  const { id } = req.params;
  const { name, password, class_id } = req.body;
  try {
    await pool.query('UPDATE teacher SET name=?, password=?, class_id=? WHERE id=?', [name, password, class_id, id]);
    res.json({ id: Number(id), name, class_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete teacher (cascades attendance via FK)
exports.deleteTeacher = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM teacher WHERE id=?', [id]);
    res.json({ message: 'Teacher deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

