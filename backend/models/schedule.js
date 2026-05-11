const mongoose = require('mongoose');
const { DepartmentHead } = require('../models/Admin');

const scheduleSchema = new mongoose.Schema({
  title: { type: String, required: true },          // e.g., "2025 Yearly Calendar"
  type: { 
    type: String, 
    enum: ['yearly_calendar', 'semester_schedule', 'class_schedule', 'exam_schedule'],
    required: true 
  },
  academicYear: { type: String },                   // e.g., "2024-2025"
  semester: { type: String },                       // e.g., "Fall", "Spring", "Summer"
  fileUrl: { type: String, required: true },        // path or cloud URL
  fileName: String,
  fileSize: Number,
  mimeType: String,
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'DepartmentHead', required: true },
  department: { type: String, required: true },     // which department this schedule belongs to
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Schedule', scheduleSchema);