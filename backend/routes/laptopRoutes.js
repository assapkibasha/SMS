const express = require('express');
const router = express.Router();
const laptopController = require('../controllers/laptopController');

// List laptops
router.get('/', laptopController.getLaptops);

// Create laptop
router.post('/', laptopController.createLaptop);

// Assign laptop to a student
router.post('/:laptopId/assign', laptopController.assignLaptop);

// Mark laptop as returned
router.post('/:laptopId/return', laptopController.returnLaptop);

// Get laptop history
router.get('/:laptopId/history', laptopController.getLaptopHistory);

module.exports = router;
