const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Admin Login
router.post('/login/admin', authController.loginAdmin);

// Teacher Login
router.post('/login/teacher', authController.loginTeacher);

module.exports = router;