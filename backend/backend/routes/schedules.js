const express = require('express');
const router = express.Router();

// In-memory storage for schedules (in production, use a database)
let schedules = [];
let nextId = 1;

// Helper function to validate department head access
const validateDepartmentHead = (req, res, next) => {
  // This would typically check authentication middleware
  // For now, we'll assume the middleware has validated the user
  next();
};

// Create a new schedule
router.post('/department-head', validateDepartmentHead, async (req, res) => {
  try {
    const {
      title,
      description,
      type, // 'exam', 'class', 'event', 'meeting'
      startDate,
      endDate,
      startTime,
      endTime,
      location,
      department,
      participants,
      priority // 'low', 'medium', 'high'
    } = req.body;

    // Validation
    if (!title || !type || !startDate || !department) {
      return res.status(400).json({ 
        error: 'Title, type, start date, and department are required' 
      });
    }

    // Validate schedule type
    const validTypes = ['exam', 'class', 'event', 'meeting'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ 
        error: 'Invalid schedule type. Must be exam, class, event, or meeting' 
      });
    }

    // Validate priority
    const validPriorities = ['low', 'medium', 'high'];
    if (priority && !validPriorities.includes(priority)) {
      return res.status(400).json({ 
        error: 'Invalid priority. Must be low, medium, or high' 
      });
    }

    const schedule = {
      id: nextId++,
      title,
      description: description || '',
      type,
      startDate,
      endDate: endDate || startDate,
      startTime,
      endTime,
      location: location || '',
      department,
      participants: participants || [],
      priority: priority || 'medium',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'department_head' // Would come from authenticated user
    };

    schedules.push(schedule);

    res.status(201).json({
      message: 'Schedule created successfully',
      schedule
    });
  } catch (error) {
    console.error('Create schedule error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all schedules (with optional filtering)
router.get('/department-head', validateDepartmentHead, async (req, res) => {
  try {
    const { 
      type, 
      department, 
      startDate, 
      endDate, 
      priority,
      status 
    } = req.query;

    let filteredSchedules = [...schedules];

    // Apply filters
    if (type) {
      filteredSchedules = filteredSchedules.filter(s => s.type === type);
    }
    if (department) {
      filteredSchedules = filteredSchedules.filter(s => s.department === department);
    }
    if (startDate) {
      filteredSchedules = filteredSchedules.filter(s => s.startDate >= startDate);
    }
    if (endDate) {
      filteredSchedules = filteredSchedules.filter(s => s.endDate <= endDate);
    }
    if (priority) {
      filteredSchedules = filteredSchedules.filter(s => s.priority === priority);
    }
    if (status) {
      filteredSchedules = filteredSchedules.filter(s => s.status === status);
    }

    // Sort by start date and time
    filteredSchedules.sort((a, b) => {
      const dateA = new Date(`${a.startDate} ${a.startTime || '00:00'}`);
      const dateB = new Date(`${b.startDate} ${b.startTime || '00:00'}`);
      return dateA - dateB;
    });

    res.json({
      message: 'Schedules retrieved successfully',
      schedules: filteredSchedules,
      total: filteredSchedules.length
    });
  } catch (error) {
    console.error('Get schedules error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get a specific schedule by ID
router.get('/department-head/:id', validateDepartmentHead, async (req, res) => {
  try {
    const { id } = req.params;
    const schedule = schedules.find(s => s.id === parseInt(id));

    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    res.json({
      message: 'Schedule retrieved successfully',
      schedule
    });
  } catch (error) {
    console.error('Get schedule error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update a schedule
router.put('/department-head/:id', validateDepartmentHead, async (req, res) => {
  try {
    const { id } = req.params;
    const scheduleIndex = schedules.findIndex(s => s.id === parseInt(id));

    if (scheduleIndex === -1) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    const updatedSchedule = {
      ...schedules[scheduleIndex],
      ...req.body,
      updatedAt: new Date()
    };

    schedules[scheduleIndex] = updatedSchedule;

    res.json({
      message: 'Schedule updated successfully',
      schedule: updatedSchedule
    });
  } catch (error) {
    console.error('Update schedule error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete a schedule
router.delete('/department-head/:id', validateDepartmentHead, async (req, res) => {
  try {
    const { id } = req.params;
    const scheduleIndex = schedules.findIndex(s => s.id === parseInt(id));

    if (scheduleIndex === -1) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    const deletedSchedule = schedules.splice(scheduleIndex, 1)[0];

    res.json({
      message: 'Schedule deleted successfully',
      schedule: deletedSchedule
    });
  } catch (error) {
    console.error('Delete schedule error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get schedules by date range
router.get('/department-head/range/:startDate/:endDate', validateDepartmentHead, async (req, res) => {
  try {
    const { startDate, endDate } = req.params;

    const filteredSchedules = schedules.filter(s => 
      s.startDate >= startDate && s.endDate <= endDate
    );

    // Sort by start date and time
    filteredSchedules.sort((a, b) => {
      const dateA = new Date(`${a.startDate} ${a.startTime || '00:00'}`);
      const dateB = new Date(`${b.startDate} ${b.startTime || '00:00'}`);
      return dateA - dateB;
    });

    res.json({
      message: 'Schedules retrieved successfully',
      schedules: filteredSchedules,
      total: filteredSchedules
    });
  } catch (error) {
    console.error('Get schedules by range error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get schedule statistics
router.get('/department-head/stats', validateDepartmentHead, async (req, res) => {
  try {
    const stats = {
      total: schedules.length,
      byType: {
        exam: schedules.filter(s => s.type === 'exam').length,
        class: schedules.filter(s => s.type === 'class').length,
        event: schedules.filter(s => s.type === 'event').length,
        meeting: schedules.filter(s => s.type === 'meeting').length
      },
      byPriority: {
        low: schedules.filter(s => s.priority === 'low').length,
        medium: schedules.filter(s => s.priority === 'medium').length,
        high: schedules.filter(s => s.priority === 'high').length
      },
      byStatus: {
        active: schedules.filter(s => s.status === 'active').length,
        completed: schedules.filter(s => s.status === 'completed').length,
        cancelled: schedules.filter(s => s.status === 'cancelled').length
      },
      upcoming: schedules.filter(s => s.startDate >= new Date().toISOString().split('T')[0]).length,
      overdue: schedules.filter(s => s.endDate < new Date().toISOString().split('T')[0]).length
    };

    res.json({
      message: 'Schedule statistics retrieved successfully',
      stats
    });
  } catch (error) {
    console.error('Get schedule stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Bulk operations - Create multiple schedules
router.post('/department-head/bulk', validateDepartmentHead, async (req, res) => {
  try {
    const { schedules: newSchedules } = req.body;

    if (!Array.isArray(newSchedules) || newSchedules.length === 0) {
      return res.status(400).json({ 
        error: 'Schedules array is required and cannot be empty' 
      });
    }

    const createdSchedules = [];
    const errors = [];

    for (const scheduleData of newSchedules) {
      try {
        const schedule = {
          id: nextId++,
          ...scheduleData,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'department_head'
        };
        schedules.push(schedule);
        createdSchedules.push(schedule);
      } catch (error) {
        errors.push({ 
          schedule: scheduleData, 
          error: error.message 
        });
      }
    }

    res.status(201).json({
      message: `Created ${createdSchedules.length} schedules successfully`,
      created: createdSchedules,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Bulk create schedules error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Helper function to validate student access
const validateStudent = (req, res, next) => {
  // This would typically check authentication middleware
  // For now, we'll assume the middleware has validated the user
  next();
};

// Student endpoints - View schedules (read-only access)

// Get all schedules for students (filtered by student's department)
router.get('/student', validateStudent, async (req, res) => {
  try {
    const { 
      type, 
      startDate, 
      endDate, 
      priority 
    } = req.query;

    // In a real app, student's department would come from authentication
    const studentDepartment = req.query.department || 'Computer Science'; // Default for testing

    let filteredSchedules = schedules.filter(s => 
      s.status === 'active' && s.department === studentDepartment
    );

    // Apply additional filters
    if (type) {
      filteredSchedules = filteredSchedules.filter(s => s.type === type);
    }
    if (startDate) {
      filteredSchedules = filteredSchedules.filter(s => s.startDate >= startDate);
    }
    if (endDate) {
      filteredSchedules = filteredSchedules.filter(s => s.endDate <= endDate);
    }
    if (priority) {
      filteredSchedules = filteredSchedules.filter(s => s.priority === priority);
    }

    // Sort by start date and time
    filteredSchedules.sort((a, b) => {
      const dateA = new Date(`${a.startDate} ${a.startTime || '00:00'}`);
      const dateB = new Date(`${b.startDate} ${b.startTime || '00:00'}`);
      return dateA - dateB;
    });

    res.json({
      message: 'Student schedules retrieved successfully',
      schedules: filteredSchedules,
      total: filteredSchedules.length
    });
  } catch (error) {
    console.error('Get student schedules error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get student's schedule for specific date
router.get('/student/date/:date', validateStudent, async (req, res) => {
  try {
    const { date } = req.params;
    const studentDepartment = req.query.department || 'Computer Science';

    const daySchedules = schedules.filter(s => 
      s.status === 'active' && 
      s.department === studentDepartment &&
      s.startDate <= date && 
      s.endDate >= date
    );

    // Sort by start time
    daySchedules.sort((a, b) => {
      const timeA = a.startTime || '00:00';
      const timeB = b.startTime || '00:00';
      return timeA.localeCompare(timeB);
    });

    res.json({
      message: 'Student daily schedule retrieved successfully',
      date: date,
      schedules: daySchedules,
      total: daySchedules.length
    });
  } catch (error) {
    console.error('Get student daily schedule error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get student's upcoming schedules
router.get('/student/upcoming', validateStudent, async (req, res) => {
  try {
    const studentDepartment = req.query.department || 'Computer Science';
    const today = new Date().toISOString().split('T')[0];

    const upcomingSchedules = schedules.filter(s => 
      s.status === 'active' && 
      s.department === studentDepartment &&
      s.startDate >= today
    );

    // Sort by start date and time
    upcomingSchedules.sort((a, b) => {
      const dateA = new Date(`${a.startDate} ${a.startTime || '00:00'}`);
      const dateB = new Date(`${b.startDate} ${b.startTime || '00:00'}`);
      return dateA - dateB;
    });

    res.json({
      message: 'Upcoming schedules retrieved successfully',
      schedules: upcomingSchedules,
      total: upcomingSchedules.length
    });
  } catch (error) {
    console.error('Get upcoming schedules error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get student's exam schedules
router.get('/student/exams', validateStudent, async (req, res) => {
  try {
    const studentDepartment = req.query.department || 'Computer Science';

    const examSchedules = schedules.filter(s => 
      s.status === 'active' && 
      s.type === 'exam' && 
      s.department === studentDepartment
    );

    // Sort by exam date
    examSchedules.sort((a, b) => {
      const dateA = new Date(`${a.startDate} ${a.startTime || '00:00'}`);
      const dateB = new Date(`${b.startDate} ${b.startTime || '00:00'}`);
      return dateA - dateB;
    });

    res.json({
      message: 'Exam schedules retrieved successfully',
      schedules: examSchedules,
      total: examSchedules.length
    });
  } catch (error) {
    console.error('Get exam schedules error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get student's class schedules
router.get('/student/classes', validateStudent, async (req, res) => {
  try {
    const studentDepartment = req.query.department || 'Computer Science';

    const classSchedules = schedules.filter(s => 
      s.status === 'active' && 
      s.type === 'class' && 
      s.department === studentDepartment
    );

    // Sort by day and time
    classSchedules.sort((a, b) => {
      const dateA = new Date(`${a.startDate} ${a.startTime || '00:00'}`);
      const dateB = new Date(`${b.startDate} ${b.startTime || '00:00'}`);
      return dateA - dateB;
    });

    res.json({
      message: 'Class schedules retrieved successfully',
      schedules: classSchedules,
      total: classSchedules.length
    });
  } catch (error) {
    console.error('Get class schedules error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get student's weekly schedule
router.get('/student/week/:startDate', validateStudent, async (req, res) => {
  try {
    const { startDate } = req.params;
    const studentDepartment = req.query.department || 'Computer Science';

    // Calculate end date (7 days from start)
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    const endDateStr = end.toISOString().split('T')[0];

    const weeklySchedules = schedules.filter(s => 
      s.status === 'active' && 
      s.department === studentDepartment &&
      s.startDate >= startDate && 
      s.startDate <= endDateStr
    );

    // Group by day of week
    const weeklySchedule = {};
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(start);
      currentDate.setDate(currentDate.getDate() + i);
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
      
      weeklySchedule[dayName] = weeklySchedules.filter(s => s.startDate === dateStr);
      // Sort each day by start time
      weeklySchedule[dayName].sort((a, b) => {
        const timeA = a.startTime || '00:00';
        const timeB = b.startTime || '00:00';
        return timeA.localeCompare(timeB);
      });
    }

    res.json({
      message: 'Weekly schedule retrieved successfully',
      weekStart: startDate,
      weekEnd: endDateStr,
      schedule: weeklySchedule,
      total: weeklySchedules.length
    });
  } catch (error) {
    console.error('Get weekly schedule error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get student's important schedules (high priority)
router.get('/student/important', validateStudent, async (req, res) => {
  try {
    const studentDepartment = req.query.department || 'Computer Science';

    const importantSchedules = schedules.filter(s => 
      s.status === 'active' && 
      s.department === studentDepartment &&
      (s.priority === 'high' || s.type === 'exam')
    );

    // Sort by start date and priority
    importantSchedules.sort((a, b) => {
      const dateA = new Date(`${a.startDate} ${a.startTime || '00:00'}`);
      const dateB = new Date(`${b.startDate} ${b.startTime || '00:00'}`);
      if (a.priority === 'high' && b.priority !== 'high') return -1;
      if (a.priority !== 'high' && b.priority === 'high') return 1;
      return dateA - dateB;
    });

    res.json({
      message: 'Important schedules retrieved successfully',
      schedules: importantSchedules,
      total: importantSchedules.length
    });
  } catch (error) {
    console.error('Get important schedules error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get student's schedule summary
router.get('/student/summary', validateStudent, async (req, res) => {
  try {
    const studentDepartment = req.query.department || 'Computer Science';
    const today = new Date().toISOString().split('T')[0];

    const studentSchedules = schedules.filter(s => 
      s.status === 'active' && 
      s.department === studentDepartment
    );

    const summary = {
      total: studentSchedules.length,
      today: studentSchedules.filter(s => s.startDate === today).length,
      thisWeek: studentSchedules.filter(s => {
        const scheduleDate = new Date(s.startDate);
        const weekFromNow = new Date();
        weekFromNow.setDate(weekFromNow.getDate() + 7);
        return scheduleDate >= new Date() && scheduleDate <= weekFromNow;
      }).length,
      upcoming: studentSchedules.filter(s => s.startDate >= today).length,
      byType: {
        exams: studentSchedules.filter(s => s.type === 'exam').length,
        classes: studentSchedules.filter(s => s.type === 'class').length,
        events: studentSchedules.filter(s => s.type === 'event').length,
        meetings: studentSchedules.filter(s => s.type === 'meeting').length
      },
      byPriority: {
        high: studentSchedules.filter(s => s.priority === 'high').length,
        medium: studentSchedules.filter(s => s.priority === 'medium').length,
        low: studentSchedules.filter(s => s.priority === 'low').length
      },
      nextSchedule: studentSchedules
        .filter(s => s.startDate >= today)
        .sort((a, b) => new Date(`${a.startDate} ${a.startTime || '00:00'}`) - new Date(`${b.startDate} ${b.startTime || '00:00'}`))[0] || null
    };

    res.json({
      message: 'Student schedule summary retrieved successfully',
      summary
    });
  } catch (error) {
    console.error('Get student summary error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
