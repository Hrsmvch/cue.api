const mongoose = require('mongoose');

const ExpenseCatSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  categories: [ 
    { name: { type: String, required: true },
      limit: { type: Number }  }
  ]
});
 
module.exports = mongoose.model('Expense categories', ExpenseCatSchema);
