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

// pre-save middleware for Department Head
departmentHeadSchema.pre('save', function (next) {
  if (!this.isModified('password')) return next();

  const user = this;
  bcrypt.genSalt(10, function (err, salt) {
    if (err) return next(err);
    bcrypt.hash(user.password, salt, function (err, hash) {
      if (err) return next(err);
      user.password = hash;
      next();
    });
  });
});

// ✅ FIXED: async/await comparePassword for Department Head
departmentHeadSchema.methods.comparePassword = async function (candidatePassword) {
  if (!candidatePassword || !this.password) return false;
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

// pre-save middleware for Lecturer
lecturerSchema.pre('save', function (next) {
  if (!this.isModified('password')) return next();

  const user = this;
  bcrypt.genSalt(10, function (err, salt) {
    if (err) return next(err);
    bcrypt.hash(user.password, salt, function (err, hash) {
      if (err) return next(err);
      user.password = hash;
      next();
    });
  });
});

// ✅ FIXED: async/await comparePassword for Lecturer
lecturerSchema.methods.comparePassword = async function (candidatePassword) {
  if (!candidatePassword || !this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

const DepartmentHead = mongoose.model('DepartmentHead', departmentHeadSchema);
const Lecturer = mongoose.model('Lecturer', lecturerSchema);

module.exports = { DepartmentHead, Lecturer };