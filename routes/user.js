const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController')
const checkAuth = require('../middlewares/checkAuth')

router.post('/signup', userController.signup)
router.post('/login', userController.login)
router.post('/schedule/clean', checkAuth, userController.scheduleCleaning)

module.exports = router;