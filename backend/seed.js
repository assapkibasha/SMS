const fs = require('fs');
const path = require('path');
require('dotenv').config();
const pool = require('./config/db');

async function run() {
  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    const statements = schemaSql
      .split(/;\s*\n/)
      .map(s => s.trim())
      .filter(Boolean);

    for (const stmt of statements) {
      await pool.query(stmt);
    }

    // Seed admin
    await pool.query("INSERT IGNORE INTO admin (id, name, password) VALUES (1, 'admin', 'admin123')");

    // Seed classes
    const [classCount] = await pool.query('SELECT COUNT(*) as cnt FROM class');
    if (classCount[0].cnt === 0) {
      await pool.query("INSERT INTO class (name, admin_id) VALUES ('Class 1', 1), ('Class 2', 1)");
    }

    // Seed teachers
    const [teacherCount] = await pool.query('SELECT COUNT(*) as cnt FROM teacher');
    if (teacherCount[0].cnt === 0) {
      // Assign first teacher to Class 1, second teacher unassigned initially
      const [[c1]] = await pool.query('SELECT id FROM class WHERE name=? LIMIT 1', ['Class 1']);
      await pool.query(
        'INSERT INTO teacher (name, password, admin_id, class_id) VALUES (?, ?, 1, ?), (?, ?, 1, NULL)',
        ['teacher1', 'teach123', c1?.id || null, 'teacher2', 'teach123']
      );
    }

    // Seed students
    const [studentCount] = await pool.query('SELECT COUNT(*) as cnt FROM student');
    if (studentCount[0].cnt === 0) {
      const [[c1]] = await pool.query('SELECT id FROM class WHERE name=? LIMIT 1', ['Class 1']);
      const [[c2]] = await pool.query('SELECT id FROM class WHERE name=? LIMIT 1', ['Class 2']);
      await pool.query(
        `INSERT INTO student 
        (studentName, studentIdNumber, studentDistrict, studentSector, studentPhoneNumber, studentStatus, class_id)
        VALUES 
        ('Aline Grace', 'ID1001', 'Gasabo', 'Kimironko', '0780000001', 'present', ?),
        ('Eric N', 'ID1002', 'Kicukiro', 'Kagarama', '0780000002', 'absent', ?),
        ('Jane Doe', 'ID2001', 'Nyarugenge', 'Nyamirambo', '0780000003', 'present', ?)`,
        [c1?.id || null, c1?.id || null, c2?.id || null]
      );
    }

    console.log('Database seeded successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

run();
