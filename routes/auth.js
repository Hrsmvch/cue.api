const express = require('express')
const router = express.Router()
const auth = require('../controllers/auth')
const loginLimiter = require('../middleware/loginLimiter')

router.route('/').post(loginLimiter, auth.login)

module.exports = router