const rateLimit = require('express-rate-limit')
const { logEvents } = require('./logger')

const loginLimiter = rateLimit({
  windowMs : 60 * 1000, // 1 min
  max: 5, 
  message: {message: 'Too many request from this IP.. try again later..'},
  handler: (req, res, next, options) => {
    logEvents('Too many Requests.')
    res.status(options.statusCode).send(options.message)
  },
  standardHeaders: true,
  legacyHeaders: false,
})

module.exports = loginLimiter