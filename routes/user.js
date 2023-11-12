const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController')
const checkAuth = require('../middlewares/checkAuth')
const checkDate = require('../middlewares/checkDate')
const checkTime = require('../middlewares/checkTime')

router.post('/signup', userController.signup)
router.post('/login', userController.login)
router.post('/schedule/clean', checkAuth, checkDate, checkTime, userController.scheduleCleaning)

router.patch('/schedule/update', checkAuth, checkDate, checkTime, userController.updateCleaningSchedule)
router.delete('/schedule/delete', checkAuth, checkDate, userController.deleteSchedule)

module.exports = router;