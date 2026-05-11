# Academic Assistant - Backend & Frontend Integration

## Project Structure

```
AVB/
├── backend/                 # Node.js/Express backend with MongoDB
│   ├── models/             # User model with face recognition
│   ├── routes/             # Authentication routes
│   ├── services/           # Face recognition service
│   ├── config/             # Database configuration
│   └── server.js           # Main server file
├── frontend/               # React TypeScript frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API service layer
│   │   ├── hooks/          # Custom React hooks
│   │   └── types/          # TypeScript definitions
│   └── package.json        # Frontend dependencies
├── start-backend.bat       # Backend startup script
├── start-frontend.bat      # Frontend startup script
└── README.md              # This file
```

## Connected Features

### Authentication (✅ Connected)
- **User Registration**: `POST /api/auth/register`
  - Basic info collection (name, email, department, password)
  - Face recognition enrollment (optional)
- **User Login**: `POST /api/auth/login`
  - Face recognition login
  - Email/password login
- **Face Enrollment**: `POST /api/auth/enroll-face`
  - Store face descriptors for biometric login

### Frontend Components Connected to Backend

1. **Login.tsx** → `/api/auth/login` & `/api/auth/login-email`
2. **Register.tsx** → `/api/auth/register` & `/api/auth/enroll-face`

## Getting Started

### Prerequisites
- Node.js 16+ installed
- MongoDB running locally or connection string in .env
- Modern web browser with camera access for face recognition

### Backend Setup
1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables in `.env`:
   ```
   MONGODB_URI=mongodb://localhost:27017/academic-assistant
   PORT=3000
   JWT_SECRET=your-secret-key
   ```

4. Start the backend server:
   ```bash
   node server.js
   ```
   Or run: `start-backend.bat`

### Frontend Setup
1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the frontend development server:
   ```bash
   npm start
   ```
   Or run: `start-frontend.bat`

### Access Points
- **Backend API**: http://localhost:3000/api
- **Frontend App**: http://localhost:3001 (React dev server)
- **Authentication Endpoints**:
  - Register: http://localhost:3000/api/auth/register
  - Login: http://localhost:3000/api/auth/login
  - Face Enrollment: http://localhost:3000/api/auth/enroll-face

## Backend Features Ready

### Authentication Routes
- `POST /api/auth/register` - User registration with optional face enrollment
- `POST /api/auth/login` - Login with face or email/password
- `POST /api/auth/login-email` - Email/password only login
- `POST /api/auth/enroll-face` - Face recognition enrollment
- `GET /api/auth/users` - Get all users (admin/debug)
- `GET /api/auth/debug/faces` - Debug enrolled faces

### User Model
```javascript
{
  name: String (required),
  email: String (required, unique),
  role: String ('student' | 'admin', default: 'student'),
  department: String (required),
  phone: String (optional),
  password: String (hashed),
  address: String (optional),
  faceDescriptor: [Number] (face recognition features),
  isEnrolled: Boolean (default: true),
  enrolledAt: Date
}
```

## Frontend Features Ready

### Accessibility Features
- Voice-controlled navigation
- Text-to-speech feedback
- Screen reader support
- Keyboard navigation
- High contrast mode
- Adjustable font sizes

### Authentication Flow
1. **Registration**: 2-step process
   - Step 1: Basic information (name, email, department, password)
   - Step 2: Face capture (optional)
2. **Login**: Dual methods
   - Face recognition (camera-based)
   - Email/password (traditional)

## Next Steps for Backend Development

Based on the frontend features, here are the endpoints you'll need to build next:

### 1. Module Management
- `GET /api/modules` - Get all modules
- `POST /api/modules` - Create new module
- `PUT /api/modules/:id` - Update module
- `DELETE /api/modules/:id` - Delete module

### 2. Reminder System
- `GET /api/reminders` - Get user reminders
- `POST /api/reminders` - Create new reminder
- `PUT /api/reminders/:id` - Update reminder
- `DELETE /api/reminders/:id` - Delete reminder

### 3. Chat/AI Interface
- `POST /api/chat` - Send message to AI assistant
- `GET /api/chat/history` - Get chat history

### 4. Admin Dashboard
- `GET /api/admin/users` - User management
- `GET /api/admin/analytics` - System analytics
- `PUT /api/admin/users/:id` - Update user

## Development Notes

- Frontend runs on port 3001 (React dev server)
- Backend runs on port 3000 (Express)
- API proxy configured in frontend package.json
- Face recognition uses mock data for now (integrate face-api.js for real implementation)
- All authentication endpoints are fully connected and functional

## Testing the Connection

1. Start both backend and frontend servers
2. Navigate to http://localhost:3001
3. Try registering a new user
4. Test login with both email/password and face recognition
5. Check browser console and backend logs for API calls

The frontend is now fully connected to your backend authentication system!
