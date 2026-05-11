# Academic Assistant - User Roles Documentation

## User Roles Overview

The system has two distinct user roles with specific permissions and responsibilities:

---

## 🎓 Student
**Default role** for all visually impaired students using the system.

### Permissions:
- View academic schedules (classes, exams, etc.)
- Set reminders based on schedules
- Access AI chat for assistance
- Request text-to-speech reading of modules and PowerPoints
- View uploaded materials by admins

### Limitations:
- Cannot upload content
- Cannot manage other users
- Cannot access administrative functions

---

## 👨‍🏫 Admin (Lecturer/Department Head)
**Academic staff** who manage content and schedules.

### Lecturer Permissions:
- Upload assignments
- Create and manage quizzes
- Upload PowerPoint presentations
- Create and manage course modules
- View student progress (if applicable)

### Department Head Permissions:
- All Lecturer permissions PLUS:
- Upload yearly academic calendar
- Manage semester schedules
- Create and update class schedules
- Set midterm and final exam schedules
- Manage department-level settings

### Limitations:
- Cannot create/delete other admins
- Cannot access system management functions

---

## 📋 Role Hierarchy

```
Admin (Level 2)
    ↓
Student (Level 1)
```

- Higher roles can access all lower role permissions
- Lower roles cannot access higher role functions

---

## 🔐 Role-Based Access Control (Future Implementation)

When JWT authentication is implemented, routes will be protected based on roles:

```javascript
// Examples of protected routes:
GET  /api/schedules          // All authenticated users
POST /api/assignments        // Admin only
GET  /api/analytics          // Admin only
```

---

## 📝 Registration with Roles

### Student Registration (Default):
```json
POST /api/auth/register
{
  "name": "John Doe",
  "email": "student@university.edu",
  "department": "Computer Science",
  "password": "password123"
}
// Role automatically set to "student"
```

### Admin Registration:
```json
POST /api/auth/register
{
  "name": "Dr. Jane Smith",
  "email": "lecturer@university.edu",
  "role": "admin",
  "department": "Computer Science",
  "password": "password123"
}
```

---

## 🚀 Current Status

- ✅ User model updated with roles
- ✅ Registration accepts role parameter
- ✅ Two-role system (student, admin)
- ⏳ JWT authentication (future)
- ⏳ Role-based route protection (future)
- ⏳ Admin management interface (future)

---

## 📊 Database Schema

```javascript
User Schema:
{
  name: String,
  email: String (unique),
  role: String (enum: ['student', 'admin']),
  department: String,
  phone: String,
  password: String (hashed),
  address: String,
  isEnrolled: Boolean,
  enrolledAt: Date,
  timestamps: true
}
```
