const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

const Schedule = require('../models/schedule');
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

    const schedule = new Schedule({
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
      uploadedBy: req.user.id,
      isActive: true
    });

    await schedule.save();

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
    const query = {};

    if (type) query.type = type;
    if (academicYear) query.academicYear = academicYear;
    if (semester) query.semester = semester;
    if (department) query.department = department;

    const schedules = await Schedule.find(query).sort({ createdAt: -1 });

    res.json({ schedules, total: schedules.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ GET SCHEDULES BY TYPE ============
router.get('/type/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const schedules = await Schedule.find({ type, isActive: true }).sort({ createdAt: -1 });
    res.json({ schedules, total: schedules.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ GET SINGLE SCHEDULE ============
router.get('/:id', async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id);
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
    const schedule = await Schedule.findById(req.params.id);
    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    const filePath = path.join(__dirname, '..', schedule.fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await Schedule.deleteOne({ _id: req.params.id });
    res.json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;