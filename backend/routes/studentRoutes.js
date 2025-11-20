const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

// Get students (optionally by classId, id, idNumber)
router.get('/', studentController.getStudents);

// Create student
router.post('/', studentController.createStudent);

// Update student
router.put('/:id', studentController.updateStudent);

// Delete student
router.delete('/:id', studentController.deleteStudent);

module.exports = router;