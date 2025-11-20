const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');

// Submit attendance
router.post('/submit', attendanceController.submitAttendance);

// Generate report
router.get('/report', attendanceController.generateReport);

module.exports = router;