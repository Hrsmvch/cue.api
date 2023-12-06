const mongoose = require('mongoose');

const ExchangesSchema = new mongoose.Schema({
  amount: {type: Number, required: true},
  fromCurrency: {type: String, required: true},
  toCurrency: {type: String, required: true}, 
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
},  {timestamps: true });

module.exports = mongoose.model('Exchanges', ExchangesSchema);