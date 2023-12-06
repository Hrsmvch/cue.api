const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  categories: [
    {
      name: { type: String, required: true },
      noteCount: { type: Number, default: 0 },
    }
  ]
});
 
module.exports = mongoose.model('Notes categories', CategorySchema);
