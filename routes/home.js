const express = require('express');
const router = express.Router();

router.use('/user', require('./user'))
router.use('/mail', require('../mail/mailRoutes'))
router.use('/notification', require('./notification'))

module.exports = router;