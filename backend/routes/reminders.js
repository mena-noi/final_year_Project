const express = require('express');
const router = express.Router();
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

// In-memory storage for reminders (in production, use a database)
let reminders = [];
let nextId = 1;

// Create a reminder based on a schedule
router.post('/student', authMiddleware, roleMiddleware('student'), async (req, res) => {
  try {
    const {
      scheduleId,
      reminderType, // 'notification', 'email', 'sms'
      reminderTime, // minutes/hours/days before the schedule
      title,
      description,
      repeatOption // 'once', 'daily', 'weekly'
    } = req.body;

    // Validation
    if (!title || !reminderType || !reminderTime) {
      return res.status(400).json({ 
        error: 'Title, reminder type, and reminder time are required' 
      });
    }

    // Validate reminder type
    const validTypes = ['notification', 'email', 'sms'];
    if (!validTypes.includes(reminderType)) {
      return res.status(400).json({ 
        error: 'Invalid reminder type. Must be notification, email, or sms' 
      });
    }

    // Validate repeat option
    const validRepeatOptions = ['once', 'daily', 'weekly'];
    if (repeatOption && !validRepeatOptions.includes(repeatOption)) {
      return res.status(400).json({ 
        error: 'Invalid repeat option. Must be once, daily, or weekly' 
      });
    }

    const reminder = {
      id: nextId++,
      scheduleId,
      reminderType,
      reminderTime,
      title: title || 'Schedule Reminder',
      description: description || '',
      repeatOption: repeatOption || 'once',
      isActive: true,
      isTriggered: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'student' // Would come from authenticated user
    };

    reminders.push(reminder);

    res.status(201).json({
      message: 'Reminder created successfully',
      reminder
    });
  } catch (error) {
    console.error('Create reminder error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all reminders for a student
router.get('/student', authMiddleware, roleMiddleware('student'), async (req, res) => {
  try {
    const { 
      reminderType, 
      isActive, 
      isTriggered,
      scheduleId 
    } = req.query;

    let filteredReminders = [...reminders];

    // Apply filters
    if (reminderType) {
      filteredReminders = filteredReminders.filter(r => r.reminderType === reminderType);
    }
    if (isActive !== undefined) {
      const activeFilter = isActive === 'true';
      filteredReminders = filteredReminders.filter(r => r.isActive === activeFilter);
    }
    if (isTriggered !== undefined) {
      const triggeredFilter = isTriggered === 'true';
      filteredReminders = filteredReminders.filter(r => r.isTriggered === triggeredFilter);
    }
    if (scheduleId) {
      filteredReminders = filteredReminders.filter(r => r.scheduleId === parseInt(scheduleId));
    }

    // Sort by creation date (newest first)
    filteredReminders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      message: 'Reminders retrieved successfully',
      reminders: filteredReminders,
      total: filteredReminders.length
    });
  } catch (error) {
    console.error('Get reminders error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get a specific reminder by ID
router.get('/student/:id', authMiddleware, roleMiddleware('student'), async (req, res) => {
  try {
    const { id } = req.params;
    const reminder = reminders.find(r => r.id === parseInt(id));

    if (!reminder) {
      return res.status(404).json({ error: 'Reminder not found' });
    }

    res.json({
      message: 'Reminder retrieved successfully',
      reminder
    });
  } catch (error) {
    console.error('Get reminder error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update a reminder
router.put('/student/:id', authMiddleware, roleMiddleware('student'), async (req, res) => {
  try {
    const { id } = req.params;
    const reminderIndex = reminders.findIndex(r => r.id === parseInt(id));

    if (reminderIndex === -1) {
      return res.status(404).json({ error: 'Reminder not found' });
    }

    const updatedReminder = {
      ...reminders[reminderIndex],
      ...req.body,
      updatedAt: new Date()
    };

    reminders[reminderIndex] = updatedReminder;

    res.json({
      message: 'Reminder updated successfully',
      reminder: updatedReminder
    });
  } catch (error) {
    console.error('Update reminder error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete a reminder
router.delete('/student/:id', authMiddleware, roleMiddleware('student'), async (req, res) => {
  try {
    const { id } = req.params;
    const reminderIndex = reminders.findIndex(r => r.id === parseInt(id));

    if (reminderIndex === -1) {
      return res.status(404).json({ error: 'Reminder not found' });
    }

    const deletedReminder = reminders.splice(reminderIndex, 1)[0];

    res.json({
      message: 'Reminder deleted successfully',
      reminder: deletedReminder
    });
  } catch (error) {
    console.error('Delete reminder error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Toggle reminder active status
router.patch('/student/:id/toggle', authMiddleware, roleMiddleware('student'), async (req, res) => {
  try {
    const { id } = req.params;
    const reminderIndex = reminders.findIndex(r => r.id === parseInt(id));

    if (reminderIndex === -1) {
      return res.status(404).json({ error: 'Reminder not found' });
    }

    reminders[reminderIndex].isActive = !reminders[reminderIndex].isActive;
    reminders[reminderIndex].updatedAt = new Date();

    res.json({
      message: 'Reminder status toggled successfully',
      reminder: reminders[reminderIndex]
    });
  } catch (error) {
    console.error('Toggle reminder error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get reminders for a specific schedule
router.get('/student/schedule/:scheduleId', authMiddleware, roleMiddleware('student'), async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const scheduleReminders = reminders.filter(r => r.scheduleId === parseInt(scheduleId));

    res.json({
      message: 'Schedule reminders retrieved successfully',
      reminders: scheduleReminders,
      total: scheduleReminders.length
    });
  } catch (error) {
    console.error('Get schedule reminders error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get upcoming reminders (next 7 days)
router.get('/student/upcoming', authMiddleware, roleMiddleware('student'), async (req, res) => {
  try {
    const today = new Date();
    const weekFromNow = new Date(today);
    weekFromNow.setDate(weekFromNow.getDate() + 7);

    // This would typically calculate based on schedule dates and reminder times
    // For now, we'll return all active reminders
    const upcomingReminders = reminders.filter(r => r.isActive && !r.isTriggered);

    // Sort by creation date
    upcomingReminders.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    res.json({
      message: 'Upcoming reminders retrieved successfully',
      reminders: upcomingReminders,
      total: upcomingReminders.length
    });
  } catch (error) {
    console.error('Get upcoming reminders error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Mark reminder as triggered
router.patch('/student/:id/trigger', authMiddleware, roleMiddleware('student'), async (req, res) => {
  try {
    const { id } = req.params;
    const reminderIndex = reminders.findIndex(r => r.id === parseInt(id));

    if (reminderIndex === -1) {
      return res.status(404).json({ error: 'Reminder not found' });
    }

    reminders[reminderIndex].isTriggered = true;
    reminders[reminderIndex].triggeredAt = new Date();
    reminders[reminderIndex].updatedAt = new Date();

    res.json({
      message: 'Reminder marked as triggered successfully',
      reminder: reminders[reminderIndex]
    });
  } catch (error) {
    console.error('Trigger reminder error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get reminder statistics
router.get('/student/stats', authMiddleware, roleMiddleware('student'), async (req, res) => {
  try {
    const stats = {
      total: reminders.length,
      active: reminders.filter(r => r.isActive).length,
      triggered: reminders.filter(r => r.isTriggered).length,
      byType: {
        notification: reminders.filter(r => r.reminderType === 'notification').length,
        email: reminders.filter(r => r.reminderType === 'email').length,
        sms: reminders.filter(r => r.reminderType === 'sms').length
      },
      byRepeatOption: {
        once: reminders.filter(r => r.repeatOption === 'once').length,
        daily: reminders.filter(r => r.repeatOption === 'daily').length,
        weekly: reminders.filter(r => r.repeatOption === 'weekly').length
      },
      recentlyCreated: reminders.filter(r => {
        const createdDate = new Date(r.createdAt);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return createdDate >= weekAgo;
      }).length
    };

    res.json({
      message: 'Reminder statistics retrieved successfully',
      stats
    });
  } catch (error) {
    console.error('Get reminder stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create multiple reminders at once
router.post('/student/bulk', authMiddleware, roleMiddleware('student'), async (req, res) => {
  try {
    const { reminders: newReminders } = req.body;

    if (!Array.isArray(newReminders) || newReminders.length === 0) {
      return res.status(400).json({ 
        error: 'Reminders array is required and cannot be empty' 
      });
    }

    const createdReminders = [];
    const errors = [];

    for (const reminderData of newReminders) {
      try {
        const reminder = {
          id: nextId++,
          ...reminderData,
          isActive: true,
          isTriggered: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'student'
        };
        reminders.push(reminder);
        createdReminders.push(reminder);
      } catch (error) {
        errors.push({ 
          reminder: reminderData, 
          error: error.message 
        });
      }
    }

    res.status(201).json({
      message: `Created ${createdReminders.length} reminders successfully`,
      created: createdReminders,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Bulk create reminders error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
