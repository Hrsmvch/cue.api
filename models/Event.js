const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
  title: {type: String, required: true},
  startDate: {type: Date, required: true},
  endDate: {type: Date, required: true},
  repeat: {
    type: String,
    enum: ['none', 'daily', 'weekly', 'monthly', 'yearly', 'custom'],
  },
  customRepeat: {
    interval: { type: Number },
    unit: { type: String },
    days: { type: [String] }
  }, 
  repeatEnds: {
    type: Date
  },
  type: {type: String, default: 'event'},
  link: {type: String, default: ''},
  address: {type: String, default: ''},
  description: { type: String, default: '' }
}, {timestamps: true })

module.exports = mongoose.model('Event', eventSchema)