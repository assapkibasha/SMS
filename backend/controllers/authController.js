const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

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

// Admin Forgot Password - Request reset code
exports.requestAdminPasswordReset = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM admin WHERE email = ? LIMIT 1', [email]);

    // Respond with success even if not found to avoid leaking which emails exist
    if (rows.length === 0) {
      return res.json({ message: 'If an admin with this email exists, a reset code has been sent.' });
    }

    const admin = rows[0];
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await pool.query('UPDATE admin SET reset_code = ?, reset_code_expires = ? WHERE id = ?', [code, expires, admin.id]);

    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: email,
        subject: 'Student Management System - Admin Password Reset Code',
        text: `Your password reset verification code is: ${code}. It is valid for 10 minutes.`,
        html: `<p>Your password reset verification code is:</p><h2>${code}</h2><p>This code is valid for 10 minutes.</p>`,
      });
    } catch (mailErr) {
      console.error('Failed to send reset email', mailErr);
      return res.status(500).json({ error: 'Failed to send reset email. Please check mail server configuration.' });
    }

    res.json({ message: 'If an admin with this email exists, a reset code has been sent.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};


// Admin Reset Password using code
exports.resetAdminPassword = async (req, res) => {
  const { email, code, newPassword } = req.body;

  if (!email || !code || !newPassword) {
    return res.status(400).json({ error: 'Email, code and new password are required' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT * FROM admin WHERE email = ? AND reset_code = ? LIMIT 1',
      [email, code]
    );

    if (rows.length === 0) {
      return res.status(400).json({ error: 'Invalid code or email' });
    }

    const admin = rows[0];

    if (!admin.reset_code_expires || new Date(admin.reset_code_expires) < new Date()) {
      return res.status(400).json({ error: 'Reset code has expired' });
    }

    await pool.query(
      'UPDATE admin SET password = ?, reset_code = NULL, reset_code_expires = NULL WHERE id = ?',
      [newPassword, admin.id]
    );

    res.json({ message: 'Password has been reset successfully. You can now log in with the new password.' });
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