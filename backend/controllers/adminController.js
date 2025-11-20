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
  const { name, password } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO admin (name, password) VALUES (?, ?)',
      [name, password]
    );
    res.status(201).json({ id: result.insertId, name, password });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update admin
exports.updateAdmin = async (req, res) => {
  const { id } = req.params;
  const { name, password } = req.body;
  try {
    await pool.query('UPDATE admin SET name=?, password=? WHERE id=?', [name, password, id]);
    res.json({ id: Number(id), name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};