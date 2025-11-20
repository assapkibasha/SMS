const express = require('express');
const router = express.Router();
const classController = require('../controllers/classController');

// Get classes (optionally by adminId)
router.get('/', classController.getClasses);

// Create class
router.post('/', classController.createClass);

// Update class
router.put('/:id', classController.updateClass);

// Delete class
router.delete('/:id', classController.deleteClass);

// Assign teacher to class
router.post('/assign-teacher', classController.assignTeacher);

module.exports = router;