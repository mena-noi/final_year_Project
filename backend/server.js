const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/database');

// ✅ FIRST: Create the app
const app = express();

// ✅ SECOND: Then use middleware
app.use(cors({
  origin: 'http://localhost:5173',  // Your React frontend port
  credentials: true
}));

app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to database
connectDB();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/schedules', require('./routes/schedules'));
app.use('/api/reminders', require('./routes/reminders'));
app.use('/api/exams', require('./routes/Exams'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/stt', require('./routes/stt'));
// Add after other route imports
app.use('/api/embeddings', require('./routes/embeddings'));
app.use('/api/rag', require('./routes/ragChat'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});