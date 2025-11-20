const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');

// Get teachers (optionally by adminId or classId)
router.get('/', teacherController.getTeachers);

// Create teacher
router.post('/', teacherController.createTeacher);

// Update teacher
router.put('/:id', teacherController.updateTeacher);

// Delete teacher
router.delete('/:id', teacherController.deleteTeacher);

module.exports = router;