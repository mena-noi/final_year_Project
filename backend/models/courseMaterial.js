const mongoose = require('mongoose');

const courseMaterialSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  fileUrl: { type: String, required: true },
  fileName: { type: String, required: true },
  fileSize: { type: Number, required: true },
  mimeType: { type: String, required: true },
  courseCode: { type: String, required: true },
  // Add this field to your existing schema
  embedding: { type: [Number], required: false } , // Store embeddings for search
  materialType: { 
    type: String, 
    enum: ['assignment', 'lecture_note', 'reference', 'other'],
    required: true 
  },
  
  // Student targeting
  targetBatchYears: { type: Number },
  targetStudentIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  
  // Metadata
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Lecturer', required: true },
  department: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
// Add this field to your existing schem
module.exports = mongoose.models.CourseMaterial || mongoose.model('CourseMaterial', courseMaterialSchema);