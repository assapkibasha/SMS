const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// Admin Login
exports.loginAdmin = async (req, res) => {
  const { username, password } = req.body;

  try {
    const [rows] = await pool.query(
      'SELECT * FROM admin WHERE name = ?',
      [username]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Admin not found' });
    }

    const admin = rows[0];

    if (admin.password !== password) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    const token = jwt.sign(
      { id: admin.id, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token, role: 'admin' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Teacher Login
exports.loginTeacher = async (req, res) => {
  const { username, password } = req.body;

  try {
    const [rows] = await pool.query(
      'SELECT * FROM teacher WHERE name = ?',
      [username]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Teacher not found' });
    }

    const teacher = rows[0];

    if (teacher.password !== password) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    const token = jwt.sign(
      { id: teacher.id, role: 'teacher' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token, role: 'teacher' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};