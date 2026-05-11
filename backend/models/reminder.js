// models/Reminder.js
const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  scheduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Schedule', required: true },
  reminderType: { type: String, enum: ['notification', 'email', 'sms'], required: true },
  reminderTime: { type: String, required: true }, // e.g., "30m", "1h", "2d"
  title: { type: String, default: 'Schedule Reminder' },
  description: { type: String, default: '' },
  repeatOption: { type: String, enum: ['once', 'daily', 'weekly'], default: 'once' },
  isActive: { type: Boolean, default: true },
  isTriggered: { type: Boolean, default: false },
  triggeredAt: Date,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Reminder', reminderSchema);