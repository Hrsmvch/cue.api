const mongoose = require('mongoose');

const CurrentBalanceSchema = new mongoose.Schema({
  currencies: [{
      currency: {type: String},
      symbol: {type: String},
      amount: {type: Number}
  }],
  majorCurrency: {
    currency: { type: String },
    symbol: { type: String }
  },
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
});

module.exports = mongoose.model('Current Balance', CurrentBalanceSchema);