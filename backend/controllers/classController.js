const pool = require('../config/db');

// Get all classes (optionally by admin)
exports.getClasses = async (req, res) => {
  try {
    const { adminId } = req.query;
    let sql = 'SELECT c.*, a.name as adminName FROM class c JOIN admin a ON c.admin_id=a.id';
    const params = [];
    if (adminId) {
      sql += ' WHERE c.admin_id = ?';
      params.push(adminId);
    }
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create class
exports.createClass = async (req, res) => {
  const { name, admin_id } = req.body;
  try {
    const [result] = await pool.query('INSERT INTO class (name, admin_id) VALUES (?, ?)', [name, admin_id]);
    res.status(201).json({ id: result.insertId, name, admin_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update class
exports.updateClass = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    await pool.query('UPDATE class SET name=? WHERE id=?', [name, id]);
    res.json({ id: Number(id), name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete class (cascades to students and attendance by FK)
exports.deleteClass = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM class WHERE id=?', [id]);
    res.json({ message: 'Class deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Assign teacher to class
exports.assignTeacher = async (req, res) => {
  const { class_id, teacher_id } = req.body;
  try {
    await pool.query('UPDATE teacher SET class_id=? WHERE id=?', [class_id, teacher_id]);
    res.json({ message: 'Teacher assigned to class' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

