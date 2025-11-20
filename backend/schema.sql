-- Database: studentMS

SET FOREIGN_KEY_CHECKS = 0;

-- Drop existing tables (FK-safe order)
DROP TABLE IF EXISTS attendance_details;
DROP TABLE IF EXISTS attendance;
DROP TABLE IF EXISTS student;
DROP TABLE IF EXISTS teacher;
DROP TABLE IF EXISTS class;
DROP TABLE IF EXISTS admin;

CREATE TABLE IF NOT EXISTS admin (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS class (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  admin_id INT NOT NULL,
  FOREIGN KEY (admin_id) REFERENCES admin(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS teacher (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  class_id INT NULL,
  admin_id INT NOT NULL,
  FOREIGN KEY (class_id) REFERENCES class(id) ON DELETE SET NULL,
  FOREIGN KEY (admin_id) REFERENCES admin(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS student (
  id INT AUTO_INCREMENT PRIMARY KEY,
  studentName VARCHAR(150) NOT NULL,
  studentIdNumber VARCHAR(50) NOT NULL UNIQUE,
  studentDistrict VARCHAR(100) NOT NULL,
  studentSector VARCHAR(100) NOT NULL,
  studentPhoneNumber VARCHAR(30) NOT NULL,
  studentStatus ENUM('present','absent') DEFAULT 'present',
  class_id INT NOT NULL,
  FOREIGN KEY (class_id) REFERENCES class(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS attendance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  class_id INT NOT NULL,
  teacher_id INT NOT NULL,
  attendance_date DATE NOT NULL,
  session ENUM('morning','evening') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_class_date_session (class_id, attendance_date, session),
  FOREIGN KEY (class_id) REFERENCES class(id) ON DELETE CASCADE,
  FOREIGN KEY (teacher_id) REFERENCES teacher(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS attendance_details (
  id INT AUTO_INCREMENT PRIMARY KEY,
  attendance_id INT NOT NULL,
  student_id INT NOT NULL,
  status ENUM('present','absent') NOT NULL,
  FOREIGN KEY (attendance_id) REFERENCES attendance(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES student(id) ON DELETE CASCADE
);

SET FOREIGN_KEY_CHECKS = 1;
