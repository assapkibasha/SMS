const pool = require('../config/db');

// Get all admins
exports.getAllAdmins = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM admin');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create a new admin
exports.createAdmin = async (req, res) => {
  const { name, password, email } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO admin (name, password, email) VALUES (?, ?, ?)',
      [name, password, email || null]
    );
    res.status(201).json({ id: result.insertId, name, password, email: email || null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update admin
exports.updateAdmin = async (req, res) => {
  const { id } = req.params;
  const { name, password, email } = req.body;
  try {
    await pool.query('UPDATE admin SET name=?, password=?, email=? WHERE id=?', [name, password, email || null, id]);
    res.json({ id: Number(id), name, email: email || null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};