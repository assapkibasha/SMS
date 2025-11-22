const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Admin Login
router.post('/login/admin', authController.loginAdmin);

// Admin Forgot Password
router.post('/admin/forgot-password', authController.requestAdminPasswordReset);
router.post('/admin/reset-password', authController.resetAdminPassword);

// Teacher Login
router.post('/login/teacher', authController.loginTeacher);

module.exports = router;