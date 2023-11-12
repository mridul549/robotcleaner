const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController')
const checkAuth = require('../middlewares/checkAuth')
const checkDate = require('../middlewares/checkDate')
const checkTime = require('../middlewares/checkTime')

// Authentication functions
router.post('/signup', userController.signup)
router.post('/login', userController.login)

// Cleaning functions
router.post('/schedule/clean', checkAuth, checkDate, checkTime, userController.scheduleCleaning)
router.patch('/schedule/update', checkAuth, checkDate, checkTime, userController.updateCleaningSchedule)

module.exports = router;