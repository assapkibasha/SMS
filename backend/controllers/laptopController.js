const pool = require('../config/db');

// Get all laptops, optionally filtered by class, student, or status
exports.getLaptops = async (req, res) => {
  try {
    const { classId, studentId, status } = req.query;
    const where = [];
    const params = [];

    let sql = `
      SELECT l.*, s.studentName, s.studentIdNumber, c.name AS className
      FROM laptop l
      LEFT JOIN student s ON l.student_id = s.id
      LEFT JOIN class c ON s.class_id = c.id
    `;

    if (classId) { where.push('c.id = ?'); params.push(classId); }
    if (studentId) { where.push('s.id = ?'); params.push(studentId); }
    if (status) { where.push('l.status = ?'); params.push(status); }

    if (where.length) {
      sql += ' WHERE ' + where.join(' AND ');
    }

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching laptops:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create a new laptop (not yet assigned)
exports.createLaptop = async (req, res) => {
  const { serialNumber, model, cableNumber, sachetNumber, packageNumber } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO laptop (serialNumber, model, cableNumber, sachetNumber, packageNumber, status) VALUES (?, ?, ?, ?, ?, "available")',
      [serialNumber, model || null, cableNumber || null, sachetNumber || null, packageNumber || null]
    );
    res.status(201).json({
      id: result.insertId,
      serialNumber,
      model: model || null,
      cableNumber: cableNumber || null,
      sachetNumber: sachetNumber || null,
      packageNumber: packageNumber || null,
      status: 'available',
    });
  } catch (err) {
    console.error('Error creating laptop:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Laptop with this serial number already exists.' });
    }
    res.status(500).json({ error: 'Server error' });
  }
};

// Assign laptop to a student (one laptop per student)
exports.assignLaptop = async (req, res) => {
  const { laptopId } = req.params;
  const { studentId } = req.body;

  if (!studentId) {
    return res.status(400).json({ error: 'studentId is required' });
  }

  try {
    // Ensure student does not already have a laptop assigned
    const [existingForStudent] = await pool.query(
      'SELECT id, serialNumber FROM laptop WHERE student_id = ? AND status = "assigned"',
      [studentId]
    );
    if (existingForStudent.length > 0) {
      return res.status(409).json({ error: 'This student already has an assigned laptop.' });
    }

    // Ensure laptop exists and is not assigned to another student
    const [existingLaptop] = await pool.query(
      'SELECT * FROM laptop WHERE id = ?',
      [laptopId]
    );
    if (existingLaptop.length === 0) {
      return res.status(404).json({ error: 'Laptop not found' });
    }

    const laptop = existingLaptop[0];
    if (laptop.status === 'assigned' && laptop.student_id && laptop.student_id !== Number(studentId)) {
      return res.status(409).json({ error: 'Laptop is already assigned to another student.' });
    }

    const now = new Date();

    await pool.query(
      'UPDATE laptop SET student_id = ?, status = "assigned", assigned_at = ?, returned_at = NULL WHERE id = ?',
      [studentId, now, laptopId]
    );

    await pool.query(
      'INSERT INTO laptop_history (laptop_id, student_id, action, action_at) VALUES (?, ?, "assigned", ?)',
      [laptopId, studentId, now]
    );

    res.json({ message: 'Laptop assigned successfully.' });
  } catch (err) {
    console.error('Error assigning laptop:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Mark laptop as returned
exports.returnLaptop = async (req, res) => {
  const { laptopId } = req.params;

  try {
    const [existingLaptop] = await pool.query(
      'SELECT * FROM laptop WHERE id = ?',
      [laptopId]
    );
    if (existingLaptop.length === 0) {
      return res.status(404).json({ error: 'Laptop not found' });
    }

    const laptop = existingLaptop[0];
    if (!laptop.student_id || laptop.status !== 'assigned') {
      return res.status(400).json({ error: 'Laptop is not currently assigned to a student.' });
    }

    const now = new Date();
    const studentId = laptop.student_id;

    await pool.query(
      'UPDATE laptop SET status = "returned", returned_at = ?, student_id = NULL WHERE id = ?',
      [now, laptopId]
    );

    await pool.query(
      'INSERT INTO laptop_history (laptop_id, student_id, action, action_at) VALUES (?, ?, "returned", ?)',
      [laptopId, studentId, now]
    );

    res.json({ message: 'Laptop marked as returned.' });
  } catch (err) {
    console.error('Error returning laptop:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get laptop history for a given laptop
exports.getLaptopHistory = async (req, res) => {
  const { laptopId } = req.params;

  try {
    const [rows] = await pool.query(
      `SELECT lh.*, s.studentName, s.studentIdNumber
       FROM laptop_history lh
       JOIN student s ON lh.student_id = s.id
       WHERE lh.laptop_id = ?
       ORDER BY lh.action_at DESC`,
      [laptopId]
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching laptop history:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
