const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

const { authMiddleware, roleMiddleware } = require('../middleware/auth');

// Ensure uploads directory exists
const schedulesDir = path.join(__dirname, '..', 'uploads', 'schedules');
if (!fs.existsSync(schedulesDir)) {
  fs.mkdirSync(schedulesDir, { recursive: true });
}

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, schedulesDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, images, and Excel files are allowed'));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }
});

// In-memory storage for schedule metadata (in production, use database)
let schedules = [];
let nextId = 1;

// ============ UPLOAD SCHEDULE (FILE UPLOAD) ============
router.post('/upload', authMiddleware, roleMiddleware(['department_head']), upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { title, type, academicYear, semester, department, description } = req.body;

    if (!title || !type || !academicYear || !department) {
      return res.status(400).json({ 
        error: 'Title, type, academic year, and department are required' 
      });
    }

    const validTypes = ['yearly_calendar', 'semester_schedule', 'class_schedule', 'exam_schedule'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ 
        error: 'Invalid schedule type. Must be yearly_calendar, semester_schedule, class_schedule, or exam_schedule' 
      });
    }

    const schedule = {
      id: nextId++,
      title,
      type,
      academicYear,
      semester: semester || null,
      description: description || '',
      fileUrl: `/uploads/schedules/${req.file.filename}`,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      department,
      uploadedBy: req.user.email,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    schedules.push(schedule);

    res.status(201).json({
      message: `${type} uploaded successfully`,
      schedule
    });
  } catch (error) {
    console.error('Schedule upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============ GET ALL SCHEDULES ============
router.get('/', async (req, res) => {
  try {
    const { type, academicYear, semester, department } = req.query;
    let filteredSchedules = [...schedules];

    if (type) filteredSchedules = filteredSchedules.filter(s => s.type === type);
    if (academicYear) filteredSchedules = filteredSchedules.filter(s => s.academicYear === academicYear);
    if (semester) filteredSchedules = filteredSchedules.filter(s => s.semester === semester);
    if (department) filteredSchedules = filteredSchedules.filter(s => s.department === department);

    res.json({ schedules: filteredSchedules, total: filteredSchedules.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ GET SCHEDULES BY TYPE ============
router.get('/type/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const filteredSchedules = schedules.filter(s => s.type === type && s.isActive === true);
    res.json({ schedules: filteredSchedules, total: filteredSchedules.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ GET SINGLE SCHEDULE ============
router.get('/:id', async (req, res) => {
  try {
    const schedule = schedules.find(s => s.id === parseInt(req.params.id));
    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    res.json({ schedule });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ DELETE SCHEDULE ============
router.delete('/:id', authMiddleware, roleMiddleware(['department_head']), async (req, res) => {
  try {
    const scheduleIndex = schedules.findIndex(s => s.id === parseInt(req.params.id));
    if (scheduleIndex === -1) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    const schedule = schedules[scheduleIndex];
    const filePath = path.join(__dirname, '..', schedule.fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    schedules.splice(scheduleIndex, 1);
    res.json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;