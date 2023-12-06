const allowedOrigins = require('./allowedOrigins')
const corsOptions = {
  origin: (origin, callback) => {
    if(allowedOrigins.indexOf(origin) !== -1 || !origin){
      // 1 param = error object. null - because we dont have n error.
      // 2 param = allowed boolean. true. because its allowed boolean
      callback(null, true)
    }else{
      callback(new Error('Not allowed CORS!'))
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
}

module.exports = corsOptions