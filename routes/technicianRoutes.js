const express = require('express');
const router = express.Router();
const technicianController = require('../controllers/technicianController');

router.get('/achievements', technicianController.getAllUserAchievements);

module.exports = router;