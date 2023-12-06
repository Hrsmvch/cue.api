const mongoose = require('mongoose');

const NotesSchema = new mongoose.Schema({
  title: {type: String, required: true, unique: false},
  content: {
    checkboxes: [{ type: Object }],
    images: [{ type: String }],
    text: { type: String }
  },
  category: {type: Object, required: true }, 
  pinned: {type: Boolean, default: false},
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true},
}, {timestamps: true });

module.exports = mongoose.model('Notes', NotesSchema);

