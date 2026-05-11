const express = require('express');
const router = express.Router();
const ExamNotice = require('../models/ExamNotice');
const Student = require('../models/Student');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

router.post('/notice', authMiddleware, roleMiddleware(['lecturer', 'department_head']), async (req, res) => {
  try {
    const { title, examDate, examMessage, courseCode, targetBatchYears, department } = req.body;
    if (!title || !examDate || !courseCode) {
      return res.status(400).json({ error: 'Title, exam date, and course code are required' });
    }
    let parsedBatchYear = null;
    try {
      const value = targetBatchYears;
      if (value !== undefined && value !== null && value !== '') {
        if (typeof value === 'string' && /^\d+$/.test(value.trim())) {
          parsedBatchYear = Number(value.trim());
        } else if (typeof value === 'number') {
          parsedBatchYear = value;
        } else {
          const parsed = JSON.parse(value);
          if (Array.isArray(parsed)) {
            if (parsed.length !== 1) throw new Error();
            parsedBatchYear = Number(parsed[0]);
          } else {
            parsedBatchYear = Number(parsed);
          }
        }
      }
    } catch (err) {
      return res.status(400).json({ error: 'targetBatchYears must be an integer from 1 to 4' });
    }
    if (parsedBatchYear !== null && (!Number.isInteger(parsedBatchYear) || parsedBatchYear < 1 || parsedBatchYear > 4)) {
      return res.status(400).json({ error: 'targetBatchYears must be an integer from 1 to 4' });
    }
    const examNotice = new ExamNotice({
      title,
      examDate: new Date(examDate),
      examMessage: examMessage || null,
      courseCode,
      targetBatchYears: parsedBatchYear,
      department,
      createdBy: req.user?.id
    });
    await examNotice.save();
    res.status(201).json({ message: 'Exam notice created successfully', examNotice });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/student', async (req, res) => {
  try {
    const { studentId } = req.query;
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    const examNotices = await ExamNotice.find({
      targetBatchYears: student.batchYear,
      isActive: true
    }).sort({ examDate: 1 });
    res.json({ examNotices });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;