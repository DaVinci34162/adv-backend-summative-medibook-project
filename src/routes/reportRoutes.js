const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

router.get('/doctors', reportController.doctorsReport);
router.get('/busy-days', reportController.busyDays);
router.get('/doctor/:id/stats', reportController.doctorStats);

module.exports = router;