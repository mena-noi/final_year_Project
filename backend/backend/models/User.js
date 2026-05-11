
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  role: {
    type: String,
    enum: ['student', 'lecturer', 'department_head'],
    default: 'student',
    required: true
  },
  department: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: false
  },
  password: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: false
  },
  faceDescriptor: {
    type: [Number], // Array of numbers representing face features from face-api.js
    required: false
  },
  isEnrolled: {
    type: Boolean,
    default: true // Users are auto-enrolled since no face recognition required
  },
  enrolledAt: {
    type: Date,
    default: Date.now
  },
  registeredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
