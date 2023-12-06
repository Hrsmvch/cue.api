const mongoose = require('mongoose');

const SalarySchema = new mongoose.Schema({
  amount: {type: Number, required: true},
  currency: {type: String, required: true}, 
  currencySymbol: {type: String},
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
}, {timestamps: true });

module.exports = mongoose.model('Salary', SalarySchema);