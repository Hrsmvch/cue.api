const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler');

// Login | POST /auth
// asyncHandler
const login = (async (req, res) => { 
  
  if (!req.body.email || !req.body.password) { 
    return res.status(400).json({ message: 'All fields are required.....', data: req.body })
  }

  const foundUser = await User.findOne({ email: req.body.email }).exec()  

  if (!foundUser || !foundUser.active) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  const match = await bcrypt.compare(req.body.password, foundUser.password)
  if (!match) return res.status(401).json({ message: 'Unauthorized' }) 

  const accessToken = jwt.sign(
    {id: foundUser._id}, 
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '15d' }
  )

  const { password, ...userData } = foundUser._doc
  res.status(200).json({...userData, accessToken})  

})

module.exports = { login }