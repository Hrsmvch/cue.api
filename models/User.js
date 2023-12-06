const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {type: String, require: true},
  email: {type: String, require: true, uniq: true},
  password: {type: String, require: true},
  avatar: {type: String, require: false, default: ''},
  active: {type: Boolean, default: true}
})

module.exports = mongoose.model('user', userSchema)