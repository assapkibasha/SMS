const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Get all admins
router.get('/admins', adminController.getAllAdmins);

// Create a new admin
router.post('/admins', adminController.createAdmin);

// Update admin
router.put('/admins/:id', adminController.updateAdmin);

module.exports = router;