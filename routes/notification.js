const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController')
const notificationController = require('../controllers/notificationController')

router.post('/notify', notificationController.sendNotification)

module.exports = router;