const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const Student = require('../models/Student');
const { DepartmentHead, Lecturer } = require('../models/Admin');
const { generateToken } = require('../utils/jwt');
const { authMiddleware } = require('../middleware/auth');

// ============ STUDENT LOGIN (with JWT) ============
router.post('/student/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('1. Login attempt for:', email);

    const student = await Student.findOne({ email });
    console.log('2. Student found:', student ? 'Yes' : 'No');

    if (!student) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    console.log('3. Stored password hash:', student.password);
    console.log('4. Comparing with:', password);

    const isPasswordValid = await student.comparePassword(password);
    console.log('5. Password valid:', isPasswordValid);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(student._id, 'student', student.email);
    console.log('6. Token generated:', token ? 'Yes' : 'No');

    res.json({
      message: 'Student login successful',
      token,
      user: {
        id: student._id,
        name: student.name,
        email: student.email,
        role: 'student',
        batchYear: student.batchYear,
        department: student.department
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============ STUDENT REGISTRATION ============
router.post('/student/register', async (req, res) => {
  try {
    const { name, email, password, batchYear, department } = req.body;

    if (!name || !email || !password || !batchYear || !department) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (batchYear < 1 || batchYear > 5) {
      return res.status(400).json({ error: 'Batch year must be between 1 and 5' });
    }

    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return res.status(400).json({ error: 'Student already exists' });
    }

    const student = new Student({ name, email, password, batchYear, department });
    await student.save();

    // Generate JWT token
    const token = generateToken(student._id, 'student', student.email);

    res.status(201).json({
      message: 'Student registration successful',
      token,
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        batchYear: student.batchYear,
        department: student.department
      }
    });
  } catch (error) {
    console.error('Student registration error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============ DEPARTMENT HEAD LOGIN ============
router.post('/department-head/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const deptHead = await DepartmentHead.findOne({ email });
    if (!deptHead) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isPasswordValid = await deptHead.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(deptHead._id, 'department_head', deptHead.email);

    res.json({
      message: 'Department Head login successful',
      token,
      user: {
        id: deptHead._id,
        name: deptHead.name,
        email: deptHead.email,
        role: 'department_head',
        department: deptHead.department
      }
    });
  } catch (error) {
    console.error('Department Head login error:', error);
    res.status(500).json({ error: error.message });
  }
});
// ============ DEPARTMENT HEAD REGISTRATION ============
router.post('/department-head/register', async (req, res) => {
  try {
    const { name, email, password, department } = req.body;

    // Validate required fields
    if (!name || !email || !password || !department) {
      return res.status(400).json({ error: 'Name, email, password, and department are required' });
    }

    // Check if department head already exists
    const existingDeptHead = await DepartmentHead.findOne({ email });
    if (existingDeptHead) {
      return res.status(400).json({ error: 'Department head with this email already exists' });
    }

    // Create new department head
    const departmentHead = new DepartmentHead({
      name,
      email,
      password,
      department
    });

    await departmentHead.save();

    // Generate JWT token
    const token = generateToken(departmentHead._id, 'department_head', departmentHead.email);

    res.status(201).json({
      message: 'Department head registered successfully',
      token,
      user: {
        id: departmentHead._id,
        name: departmentHead.name,
        email: departmentHead.email,
        role: 'department_head',
        department: departmentHead.department
      }
    });
  } catch (error) {
    console.error('Department head registration error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============ LECTURER LOGIN ============
router.post('/lecturer/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const lecturer = await Lecturer.findOne({ email });
    if (!lecturer) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isPasswordValid = await lecturer.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(lecturer._id, 'lecturer', lecturer.email);

    res.json({
      message: 'Lecturer login successful',
      token,
      user: {
        id: lecturer._id,
        name: lecturer.name,
        email: lecturer.email,
        role: 'lecturer',
        department: lecturer.department,
        isPasswordChanged: lecturer.isPasswordChanged
      }
    });
  } catch (error) {
    console.error('Lecturer login error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Department Head registers a lecturer
router.post('/lecturer/register', async (req, res) => {
  try {
    const { departmentHeadEmail, lecturerName, lecturerEmail, lecturerDepartment, lecturerPassword } = req.body;

    if (!departmentHeadEmail || !lecturerName || !lecturerEmail || !lecturerDepartment || !lecturerPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const departmentHead = await DepartmentHead.findOne({ email: departmentHeadEmail });
    if (!departmentHead) {
      return res.status(403).json({ error: 'Only department heads can register lecturers' });
    }

    const existingLecturer = await Lecturer.findOne({ email: lecturerEmail });
    if (existingLecturer) {
      return res.status(400).json({ error: 'Lecturer already exists' });
    }

    // ✅ MANUALLY HASH THE PASSWORD
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(lecturerPassword, salt);

    const lecturer = new Lecturer({
      name: lecturerName,
      email: lecturerEmail,
      password: hashedPassword,  // Use hashed password
      department: lecturerDepartment,
      registeredBy: departmentHead._id,
      isPasswordChanged: false
    });

    await lecturer.save();

    res.status(201).json({
      message: 'Lecturer registered successfully',
      lecturer: {
        id: lecturer._id,
        name: lecturer.name,
        email: lecturer.email,
        role: 'lecturer',
        department: lecturer.department
      }
    });
  } catch (error) {
    console.error('Lecturer registration error:', error);
    res.status(500).json({ error: error.message });
  }
});
// Lecturer change password
router.post('/lecturer/change-password', authMiddleware, async (req, res) => {
  try {
    const { email, oldPassword, newPassword } = req.body;

    if (!email || !oldPassword || !newPassword) {
      return res.status(400).json({ error: 'Email, old password, and new password are required' });
    }

    if (!req.user || req.user.role !== 'lecturer' || req.user.email !== email) {
      return res.status(403).json({ error: 'Forbidden. Invalid token or unauthorized lecturer.' });
    }

    const lecturer = await Lecturer.findOne({ email });
    if (!lecturer) {
      return res.status(401).json({ error: 'Lecturer not found' });
    }

    const isPasswordValid = await lecturer.comparePassword(oldPassword);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Old password is incorrect' });
    }

    lecturer.password = newPassword;
    lecturer.isPasswordChanged = true;
    await lecturer.save();

    // Generate new token
    const token = generateToken(lecturer._id, 'lecturer', lecturer.email);

    res.json({
      message: 'Password changed successfully',
      token,
      isPasswordChanged: true
    });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;