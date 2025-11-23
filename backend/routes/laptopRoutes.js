const express = require('express');
const router = express.Router();
const laptopController = require('../controllers/laptopController');

// List laptops
router.get('/', laptopController.getLaptops);

// Create laptop
router.post('/', laptopController.createLaptop);

// Update laptop
router.put('/:laptopId', laptopController.updateLaptop);

// Delete laptop
router.delete('/:laptopId', laptopController.deleteLaptop);

// Assign laptop to a student
router.post('/:laptopId/assign', laptopController.assignLaptop);

// Mark laptop as returned
router.post('/:laptopId/return', laptopController.returnLaptop);

// Get laptop history
router.get('/:laptopId/history', laptopController.getLaptopHistory);

module.exports = router;
