const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { compareFaces } = require('../services/faceService');

const router = express.Router();

// Step 1: Normal registration (name and other basic info)
router.post('/register', async (req, res) => {
  try {
    const { name, email, role, department, password, address } = req.body;
    
    if (!name || !email || !department) {
      return res.status(400).json({ error: 'Name, email, and department are required' });
    }
    
    // Validate role
    const validRoles = ['student', 'lecturer', 'department_head'];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be student, lecturer, or department_head' });
    }
    
    // Check if user with same email already exists
    const existingEmailUser = await User.findOne({ email });
    if (existingEmailUser) {
      return res.status(400).json({ error: 'A user with this email already exists' });
    }
    
    // Hash password only if provided
    let hashedPassword;
    if (password) {
      const saltRounds = 10;
      hashedPassword = await bcrypt.hash(password, saltRounds);
    }
    
    // Create new user (auto-enrolled since no face recognition required)
    const user = new User({
      name,
      email,
      role: role || 'student', // Default to student if no role specified
      department,
      password: hashedPassword,
      address,
      isEnrolled: true // User is fully registered
    });
    
    await user.save();
    
    // Handle case where role field doesn't exist in schema for existing users
    let userRole = user.role || 'student';
    if (!['student', 'lecturer', 'department_head'].includes(userRole)) {
      userRole = 'student'; // Default fallback
    }
    
    res.status(201).json({
      message: 'Registration successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: userRole,
        department: user.department,
        phone: user.phone,
        address: user.address,
        isEnrolled: user.isEnrolled
      }
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Step 2: Face enrollment (after normal registration)
router.post('/enroll-face', async (req, res) => {
  try {
    const { userId, faceDescriptor } = req.body;
    
    if (!userId || !faceDescriptor) {
      return res.status(400).json({ error: 'User ID and face descriptor are required' });
    }
    
    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if user is already enrolled
    if (user.isEnrolled) {
      return res.status(400).json({ error: 'User is already enrolled with face recognition' });
    }
    
    // Update user with face descriptor (allow multiple users with same face)
    user.faceDescriptor = faceDescriptor;
    user.isEnrolled = true;
    user.enrolledAt = new Date();
    
    await user.save();
    
    res.json({
      message: 'Face enrollment successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isEnrolled: user.isEnrolled,
        enrolledAt: user.enrolledAt
      }
    });
    
  } catch (error) {
    console.error('Face enrollment error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Login with either face descriptor or email/password
router.post('/login', async (req, res) => {
  try {
    const { faceDescriptor, email, password } = req.body;
    
    // If face authentication
    if (faceDescriptor) {
      // Find all users with enrolled faces
      const enrolledUsers = await User.find({ isEnrolled: true, faceDescriptor: { $exists: true } });
      
      if (enrolledUsers.length === 0) {
        return res.status(404).json({ error: 'No users found with enrolled faces' });
      }
      
      // Compare with all enrolled users and find best match
      let bestMatch = null;
      let highestConfidence = 0;
      
      for (const user of enrolledUsers) {
        if (user.faceDescriptor && user.faceDescriptor.length > 0) {
          const comparison = compareFaces(faceDescriptor, user.faceDescriptor);
          
          if (comparison.isMatch && comparison.confidence > highestConfidence) {
            bestMatch = user;
            highestConfidence = comparison.confidence;
          }
        }
      }
      
      if (bestMatch) {
        let userRole = bestMatch.role || 'student';
        
        // Restrict login to registered lecturers only
        if (userRole !== 'lecturer') {
          return res.status(403).json({ 
            error: 'Access denied. Only registered lecturers are allowed to login.',
            method: 'face'
          });
        }
        
        res.json({
          message: 'Login successful',
          method: 'face',
          user: {
            id: bestMatch._id,
            name: bestMatch.name,
            email: bestMatch.email,
            role: userRole,
            department: bestMatch.department
          },
          confidence: highestConfidence
        });
      } else {
        res.status(401).json({ 
          error: 'Face not recognized',
          method: 'face'
        });
      }
    }
    
    // If email/password authentication
    else if (email && password) {
      const user = await User.findOne({ email });
      
      if (!user) {
        return res.status(401).json({ 
          error: 'Invalid email or password',
          method: 'email'
        });
      }
      
      // Check password only if user has password
      if (user.password) {
        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
          return res.status(401).json({ 
            error: 'Invalid email or password',
            method: 'email'
          });
        }
      }
      
      let userRole = user.role || 'student';
      
      // Restrict login to registered lecturers only
      if (userRole !== 'lecturer') {
        return res.status(403).json({ 
          error: 'Access denied. Only registered lecturers are allowed to login.',
          method: 'email'
        });
      }
      
      res.json({
        message: 'Login successful',
        method: 'email',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: userRole,
          department: user.department
        }
      });
    }
    
    else {
      return res.status(400).json({ 
        error: 'Either faceDescriptor or email/password required',
        details: 'Provide either faceDescriptor for face login OR email and password for email login'
      });
    }
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Login with email and password
router.post('/login-email', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Restrict login to registered lecturers only
    const userRole = user.role || 'student';
    if (userRole !== 'lecturer') {
      return res.status(403).json({ 
        error: 'Access denied. Only registered lecturers are allowed to login.' 
      });
    }
    
    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: userRole,
        department: user.department
      }
    });
    
  } catch (error) {
    console.error('Email login error:', error);
    res.status(500).json({ error: error.message });
  }
});


// Department Head registers lecturer endpoint
router.post('/admin/register-lecturer', async (req, res) => {
  try {
    const { departmentHeadEmail, lecturerName, lecturerEmail, lecturerDepartment, lecturerPassword, lecturerAddress } = req.body;
    
    if (!departmentHeadEmail || !lecturerName || !lecturerEmail || !lecturerDepartment || !lecturerPassword) {
      return res.status(400).json({ error: 'Department head email, lecturer name, email, department, and password are required' });
    }
    
    // Verify that the requester is a department head
    const departmentHead = await User.findOne({ email: departmentHeadEmail, role: 'department_head' });
    if (!departmentHead) {
      return res.status(403).json({ error: 'Only department heads can register lecturers' });
    }
    
    // Check if lecturer with same email already exists
    const existingLecturer = await User.findOne({ email: lecturerEmail });
    if (existingLecturer) {
      return res.status(400).json({ error: 'A lecturer with this email already exists' });
    }
    
    // Hash lecturer password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(lecturerPassword, saltRounds);
    
    // Create new lecturer user
    const lecturer = new User({
      name: lecturerName,
      email: lecturerEmail,
      role: 'lecturer',
    
      department: lecturerDepartment,
      password: hashedPassword,
      address: lecturerAddress,
      isEnrolled: true,
      registeredBy: departmentHead._id // Track who registered this lecturer
    });
    
    await lecturer.save();
    
    res.status(201).json({
      message: 'Lecturer registration successful',
      lecturer: {
        id: lecturer._id,
        name: lecturer.name,
        email: lecturer.email,
        role: lecturer.role,
        department: lecturer.department,
        phone: lecturer.phone,
        address: lecturer.address,
        isEnrolled: lecturer.isEnrolled,
        registeredBy: departmentHead.name
      }
    });
    
  } catch (error) {
    console.error('Lecturer registration error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Admin login endpoint (for admin portal usage)
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid email or password',
        method: 'admin_email'
      });
    }
    
    // Check if user is an admin (lecturer or department_head)
    if (!['lecturer', 'department_head'].includes(user.role)) {
      return res.status(403).json({ 
        error: 'Access denied. Admin access required.',
        method: 'admin_email'
      });
    }
    
    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: 'Invalid email or password',
        method: 'admin_email'
      });
    }
    
    res.json({
      message: 'Admin login successful',
      method: 'admin_email',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        permissions: getAdminPermissions(user.role)
      }
    });
    
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Helper function to get admin permissions based on role
function getAdminPermissions(role) {
  const lecturerPermissions = [
    'upload_assignments',
    'create_course_modules',
    'upload_materials',
    'view_student_progress',
    'send_notifications'
  ];
  
  const departmentHeadPermissions = [
    ...lecturerPermissions,
    'upload_academic_calendar',
    'manage_semester_schedules',
    'create_class_schedules',
    'set_exam_schedules',
    'manage_department_settings'
  ];
  
  return role === 'department_head' ? departmentHeadPermissions : lecturerPermissions;
}

// Get all users (for testing)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, '-faceDescriptor'); // Exclude face descriptor for security
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Debug endpoint to check face descriptors
router.get('/debug/faces', async (req, res) => {
  try {
    const users = await User.find({ isEnrolled: true }, 'name email faceDescriptor');
    const faceCount = users.length;
    res.json({ 
      message: `Found ${faceCount} users with enrolled faces`,
      users: users.map(u => ({
        name: u.name,
        email: u.email,
        hasFaceDescriptor: !!u.faceDescriptor,
        descriptorLength: u.faceDescriptor ? u.faceDescriptor.length : 0
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
