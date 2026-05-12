const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Department Head Schema
const departmentHeadSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, default: 'department_head', immutable: true },
  department: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

// ✅ FIXED: pre-save middleware for hashing password
departmentHeadSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    throw error;
  }
});

departmentHeadSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Lecturer Schema
const lecturerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, default: 'lecturer', immutable: true },
  department: { type: String, required: true },
  registeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'DepartmentHead', required: true },
  isPasswordChanged: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

// ✅ FIXED: pre-save middleware for hashing password
lecturerSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    throw error;
  }
});

lecturerSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const DepartmentHead = mongoose.model('DepartmentHead', departmentHeadSchema);
const Lecturer = mongoose.model('Lecturer', lecturerSchema);

module.exports = { DepartmentHead, Lecturer };