const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const CourseMaterial = require('../models/courseMaterial');
const router = express.Router();

// Import models
const ExamNotice = require('../models/ExamNotice');
const Student = require('../models/Student');

// Ensure uploads directory exists

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'application/pdf',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain', 'application/zip', 'application/x-zip-compressed'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }
});

const parseBatchYear = (value) => {
  if (value === undefined || value === null || value === '') return null;

  let parsed = value;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (/^\d+$/.test(trimmed)) {
      parsed = Number(trimmed);
    } else {
      try {
        parsed = JSON.parse(trimmed);
      } catch (err) {
        throw new Error('targetBatchYears must be an integer from 1 to 4');
      }
    }
  }

  if (Array.isArray(parsed)) {
    if (parsed.length !== 1) {
      throw new Error('targetBatchYears must be a single integer from 1 to 4');
    }
    parsed = parsed[0];
  }

  const year = Number(parsed);
  if (!Number.isInteger(year) || year < 1 || year > 4) {
    throw new Error('targetBatchYears must be an integer from 1 to 4');
  }

  return year;
};

// ============ UPLOAD COURSE MATERIAL ============
router.post('/material', authMiddleware, roleMiddleware(['lecturer', 'department_head']), upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { title, description, courseCode, materialType, targetBatchYears, department } = req.body;

    if (!title || !courseCode || !materialType) {
      return res.status(400).json({ error: 'Title, course code, and material type are required' });
    }

    let parsedBatchYear = null;
    try {
      parsedBatchYear = parseBatchYear(targetBatchYears);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }

    const courseMaterial = new CourseMaterial({
      title,
      description,
      fileUrl: `/uploads/${req.file.filename}`,
      fileName: req.file.filename,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      courseCode,
      materialType,
      targetBatchYears: parsedBatchYear,
      uploadedBy: req.user?.id,
      department: department
    });

    await courseMaterial.save();
    // After await courseMaterial.save();
    const { generateEmbedding } = require('../services/ragService');
    const text = `${title} ${description || ''} ${courseCode}`;
    courseMaterial.embedding = await generateEmbedding(text);
    await courseMaterial.save();

    res.status(201).json({
      message: 'Module uploaded successfully',
      material: courseMaterial
    });
  } catch (error) {
    console.error('Material upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============ GET AVAILABLE COURSE MATERIALS FOR STUDENTS ============
router.get('/material', authMiddleware, roleMiddleware(['student']), async (req, res) => {
  try {
    const student = await Student.findById(req.user?.id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const query = {
      isActive: true,
      $or: [
        { targetBatchYears: student.batchYear },
        { targetBatchYears: { $exists: false } },
        { targetBatchYears: null }
      ]
    };

    if (student.department) {
      query.department = student.department;
    }

    const materials = await CourseMaterial.find(query).sort({ createdAt: -1 }).lean();

    res.json({ materials });
  } catch (error) {
    console.error('Student material fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============ GET COURSE MATERIALS FOR LECTURER ============
router.get('/material/lecturer', authMiddleware, roleMiddleware(['lecturer', 'department_head']), async (req, res) => {
  try {
    const materials = await CourseMaterial.find({ uploadedBy: req.user?.id }).sort({ createdAt: -1 }).lean();
    res.json({ materials });
  } catch (error) {
    console.error('Lecturer material fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update course material (description, title, etc.)
router.put('/material/:id', authMiddleware, roleMiddleware(['lecturer', 'department_head']), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, courseCode, materialType, targetBatchYears, department } = req.body;

    // Find the material
    const material = await CourseMaterial.findById(id);
    if (!material) {
      return res.status(404).json({ error: 'Material not found' });
    }

    // Update fields if provided
    if (title) material.title = title;
    if (description) material.description = description;
    if (courseCode) material.courseCode = courseCode;
    if (materialType) material.materialType = materialType;
    if (targetBatchYears) material.targetBatchYears = JSON.parse(targetBatchYears);
    if (department) material.department = department;

    material.updatedAt = new Date();

    await material.save();

    res.json({
      message: 'Material updated successfully',
      material
    });
  } catch (error) {
    console.error('Update material error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============ DELETE COURSE MATERIAL ============
router.delete('/material/:id', authMiddleware, roleMiddleware(['lecturer', 'department_head']), async (req, res) => {
  try {
    const { id } = req.params;
    const material = await CourseMaterial.findById(id);
    if (!material) {
      return res.status(404).json({ error: 'Material not found' });
    }

    if (material.uploadedBy && material.uploadedBy.toString() !== req.user?.id && req.user?.role !== 'department_head') {
      return res.status(403).json({ error: 'Not authorized to delete this material' });
    }

    await material.deleteOne();
    
    // Also remove the file from filesystem
    const filePath = path.join(__dirname, '..', material.fileUrl.replace(/^\//, ''));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({ message: 'Material deleted successfully' });
  } catch (error) {
    console.error('Delete material error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============ EXAM NOTICE (separate from file upload) ============
router.post('/exam-notice', authMiddleware, roleMiddleware(['lecturer', 'department_head']), async (req, res) => {
  try {
    const { title, examDate, examMessage, courseCode, targetBatchYears, department } = req.body;

    if (!title || !examDate || !courseCode) {
      return res.status(400).json({ error: 'Title, exam date, and course code are required' });
    }

    let parsedBatchYear = null;
    try {
      parsedBatchYear = parseBatchYear(targetBatchYears);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }

    // You need an ExamNotice model for this
    // For now, we'll assume it exists
    const examNotice = new ExamNotice({
      title,
      examDate: new Date(examDate),
      examMessage: examMessage || null,
      courseCode,
      targetBatchYears: parsedBatchYear,
      createdBy: req.user?.id,
      department: department
    });

    await examNotice.save();

    res.status(201).json({
      message: 'Exam notice created successfully',
      examNotice
    });
  } catch (error) {
    console.error('Exam notice error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============ SIMPLE FILE UPLOAD (legacy) ============
router.post('/lecturer', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    res.status(201).json({
      message: 'File uploaded successfully',
      file: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        uploadDate: new Date(),
        path: `/uploads/${req.file.filename}`
      }
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============ GET ALL FILES ============
router.get('/lecturer/files', async (req, res) => {
  try {
    const files = fs.readdirSync(uploadsDir).map(filename => {
      const filePath = path.join(uploadsDir, filename);
      const stats = fs.statSync(filePath);
      return {
        filename: filename,
        size: stats.size,
        uploadDate: stats.mtime,
        path: `/uploads/${filename}`
      };
    });

    res.json({ files });
  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============ DELETE FILE ============
router.delete('/lecturer/files/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(uploadsDir, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    fs.unlinkSync(filePath);
    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============ DOWNLOAD FILE ============
router.get('/lecturer/files/:filename/download', async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(uploadsDir, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.download(filePath, filename);
  } catch (error) {
    console.error('Download file error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;