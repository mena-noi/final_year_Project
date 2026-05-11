const mongoose = require('mongoose');

const examNoticeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  examDate: { type: Date, required: true },
  examMessage: { type: String, default: null },
  courseCode: { type: String, required: true },
  
  // Targeting students
  targetBatchYears: { type: Number },
  
  // Metadata
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Lecturer', required: true },
  department: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ExamNotice', examNoticeSchema);