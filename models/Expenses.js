const mongoose = require('mongoose');

const ExpensesSchema = new mongoose.Schema({
  amount: {type: Number, required: true},
  paymentDate: {type: Date}, 
  category: {type: Object},
  comment: { type: String, default: '' },
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
}, {timestamps: true });

module.exports = mongoose.model('Expenses', ExpensesSchema);