import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaMicrophone,
  FaVolumeUp,
  FaRobot,
  FaBell,
  FaBook,
  FaCalendarAlt,
  FaSignOutAlt,
  FaHeadphones,
  FaSmile,
  FaClock,
  FaChevronRight,
  FaCheckCircle,
  FaUserGraduate,
  FaChartLine,
  FaBrain,
  FaComments,
  FaTasks,
  FaArrowRight,
  FaSpinner,
  FaRegKeyboard
} from "react-icons/fa";
import "./HomeDashboard.css";
import type { LecturerExamBlockAnnouncement } from "../types";

const LECTURER_EXAM_KEY = "lecturerExamBlockAnnouncements";

function readLecturerExamNotices(): LecturerExamBlockAnnouncement[] {
  try {
    const raw = localStorage.getItem(LECTURER_EXAM_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

const HomeDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [voiceGuide, setVoiceGuide] = useState<boolean>(true);
  const [listening, setListening] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [greeting, setGreeting] = useState<string>("");
  const [showCommands, setShowCommands] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>("Student");
  const [examNotices, setExamNotices] = useState<LecturerExamBlockAnnouncement[]>([]);

  // Reminders data
  const [reminders, setReminders] = useState([
    { id: 1, text: "Math assignment due tomorrow", time: "9:00 AM", completed: false },
    { id: 2, text: "Study group meeting", time: "2:30 PM", completed: false },
    { id: 3, text: "Physics quiz preparation", time: "5:00 PM", completed: false }
  ]);

  // Modules data
  const [modules] = useState([
    { id: 1, name: "Mathematics 101", progress: 75, nextClass: "Today 10:30 AM", icon: "📐" },
    { id: 2, name: "Physics Fundamentals", progress: 45, nextClass: "Today 2:00 PM", icon: "⚛️" },
    { id: 3, name: "Computer Science", progress: 30, nextClass: "Tomorrow 9:00 AM", icon: "💻" },
    { id: 4, name: "Literature", progress: 90, nextClass: "Tomorrow 11:00 AM", icon: "📖" }
  ]);

  // Get user name from localStorage
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        if (userData.name) setUserName(userData.name.split(' ')[0]);
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    const refresh = () => setExamNotices(readLecturerExamNotices());
    refresh();
    const onStorage = (e: StorageEvent) => {
      if (e.key === LECTURER_EXAM_KEY) refresh();
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("lecturerExamNoticesUpdated", refresh);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("lecturerExamNoticesUpdated", refresh);
    };
  }, []);

  // Set greeting based on time
  useEffect(() => {
    const hour = currentTime.getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 17) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, [currentTime]);

  // Welcome message when dashboard loads
  useEffect(() => {
    speak(`Welcome back, ${userName}! ${greeting}. I'm your AI assistant.`);
  }, [greeting, userName]);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const speak = useCallback((text: string): void => {
    if (!voiceGuide) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.85;
    utterance.pitch = 1.1;
    window.speechSynthesis.speak(utterance);
  }, [voiceGuide]);

  // Navigation functions - Go to Dashboard with hash
  const navigateToChat = useCallback(() => {
    speak("Opening AI Chat Assistant");
    navigate("/dashboard#chat");
  }, [navigate, speak]);

  const navigateToModules = useCallback(() => {
    speak("Opening Learning Modules");
    navigate("/dashboard#modules");
  }, [navigate, speak]);

  const navigateToReminders = useCallback(() => {
    speak("Opening Reminders");
    navigate("/dashboard#reminders");
  }, [navigate, speak]);

  const navigateToCommands = useCallback(() => {
    speak("Opening Voice Commands");
    navigate("/dashboard#commands");
  }, [navigate, speak]);

  const handleLogout = useCallback((): void => {
    speak("Logging out. Goodbye!");
    localStorage.removeItem('user');
    localStorage.removeItem('activeTab');
    setTimeout(() => navigate("/"), 1500);
  }, [navigate, speak]);

  const toggleReminder = useCallback((id: number): void => {
    setReminders(prev => prev.map(r => 
      r.id === id ? { ...r, completed: !r.completed } : r
    ));
    const reminder = reminders.find(r => r.id === id);
    speak(reminder?.completed ? "Reminder marked incomplete" : "Reminder completed! Good job!");
  }, [reminders, speak]);

  const formatTime = useCallback((date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, []);

  const formatDate = useCallback((date: Date): string => {
    return date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
  }, []);

  const pendingRemindersCount = reminders.filter(r => !r.completed).length;
  const totalProgress = Math.round(modules.reduce((acc, m) => acc + m.progress, 0) / modules.length);

  return (
    <div className="dashboard-modern">
      {/* Voice Assistant Bar */}
      <div className="voice-bar-modern">
        <div className="voice-info-modern">
          <div className="voice-icon-wrapper">
            <FaRobot className="voice-icon-modern" />
            <span className="voice-pulse"></span>
          </div>
          <div>
            <span className="voice-label">AI Assistant Active</span>
            <span className="voice-status-text">{listening ? "Listening..." : "Ready"}</span>
          </div>
        </div>
        
        <div className="voice-controls-modern">
          <button 
            className={`voice-toggle-modern ${voiceGuide ? 'active' : ''}`}
            onClick={() => setVoiceGuide(prev => !prev)}
          >
            <FaVolumeUp />
            <span>Voice {voiceGuide ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {/* Logout Button */}
      <button className="logout-btn-modern" onClick={handleLogout}>
        <FaSignOutAlt /> Logout
      </button>

      {/* Main Content */}
      <div className="dashboard-content-modern">
        
        {/* Welcome Header */}
        <div className="welcome-section-modern">
          <div className="welcome-text-modern">
            <div className="greeting-badge">
              <FaSmile className="greeting-icon" />
              <span>{greeting}</span>
            </div>
            <h1>
              Welcome back, <span className="user-name">{userName}</span>
              <span className="wave-emoji">👋</span>
            </h1>
            <p className="date-time-modern">
              <FaClock /> {formatDate(currentTime)} • {formatTime(currentTime)}
            </p>
          </div>
          
          <div className="stats-badge">
            <div className="stat-item-badge">
              <span className="stat-value-badge">{modules.length}</span>
              <span className="stat-label-badge">Modules</span>
            </div>
            <div className="stat-item-badge">
              <span className="stat-value-badge">{pendingRemindersCount}</span>
              <span className="stat-label-badge">Tasks</span>
            </div>
            <div className="stat-item-badge">
              <span className="stat-value-badge">{totalProgress}%</span>
              <span className="stat-label-badge">Progress</span>
            </div>
          </div>
        </div>

        {examNotices.length > 0 && (
          <section className="exam-notices-banner" aria-label="Exam block notices from lecturers">
            <div className="exam-notices-header">
              <FaCalendarAlt aria-hidden />
              <h2>Exam block notices</h2>
            </div>
            <ul className="exam-notices-list">
              {examNotices.map((n) => (
                <li key={n.id} className="exam-notice-item">
                  <p className="exam-notice-title">{n.title}</p>
                  <p className="exam-notice-dates">
                    {new Date(n.startDate).toLocaleDateString()} — {new Date(n.endDate).toLocaleDateString()}
                  </p>
                  <p className="exam-notice-body">{n.messageToStudents}</p>
                  {n.attachmentFileName && (
                    <p className="exam-notice-attachment">Attachment: {n.attachmentFileName}</p>
                  )}
                  <p className="exam-notice-meta">From {n.postedBy}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Quick Command Cards */}
        <div className="quick-cards-modern">
          <div className="quick-card chat-card" onClick={navigateToChat}>
            <div className="card-icon-bg">
              <FaComments />
            </div>
            <div className="card-info">
              <h3>AI Chat Assistant</h3>
              <p>Ask questions, get help with your studies</p>
            </div>
            <FaChevronRight className="card-arrow" />
          </div>

          <div className="quick-card reminders-card" onClick={navigateToReminders}>
            <div className="card-icon-bg">
              <FaBell />
            </div>
            <div className="card-info">
              <h3>Reminders</h3>
              <p>{pendingRemindersCount} pending tasks</p>
            </div>
            <FaChevronRight className="card-arrow" />
          </div>

          <div className="quick-card modules-card" onClick={navigateToModules}>
            <div className="card-icon-bg">
              <FaBook />
            </div>
            <div className="card-info">
              <h3>Learning Modules</h3>
              <p>{modules.length} modules available</p>
            </div>
            <FaChevronRight className="card-arrow" />
          </div>

          <div className="quick-card commands-card" onClick={navigateToCommands}>
            <div className="card-icon-bg">
              <FaRegKeyboard />
            </div>
            <div className="card-info">
              <h3>Voice Commands</h3>
              <p>Control everything with your voice</p>
            </div>
            <FaChevronRight className="card-arrow" />
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="dashboard-grid-modern">
          
          {/* AI Chat Assistant Card */}
          <div className="dashboard-card large-card" onClick={navigateToChat}>
            <div className="card-header-modern">
              <div className="card-icon-large">
                <FaRobot />
              </div>
              <div className="card-header-text">
                <h3>AI Assistant</h3>
                <p>Your intelligent study companion</p>
              </div>
            </div>
            <div className="card-preview">
              <div className="preview-message">
                <FaBrain className="preview-icon" />
                <span>Ask me anything about your studies...</span>
              </div>
            </div>
            <div className="card-footer-modern">
              <button className="card-button">Start Chatting →</button>
            </div>
          </div>

          {/* Reminders Card */}
          <div className="dashboard-card" onClick={navigateToReminders}>
            <div className="card-header-modern">
              <div className="card-icon-medium">
                <FaBell />
              </div>
              <h3>Reminders</h3>
            </div>
            <div className="reminders-list-preview">
              {reminders.slice(0, 2).map(reminder => (
                <div key={reminder.id} className={`preview-reminder ${reminder.completed ? 'completed' : ''}`}>
                  <div 
                    className="reminder-check-small"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleReminder(reminder.id);
                    }}
                  >
                    {reminder.completed ? <FaCheckCircle /> : '○'}
                  </div>
                  <span className="reminder-text">{reminder.text}</span>
                </div>
              ))}
              {reminders.length > 2 && (
                <div className="more-reminders">+{reminders.length - 2} more</div>
              )}
            </div>
            <div className="card-footer-modern">
              <span className="card-link">View all reminders →</span>
            </div>
          </div>

          {/* Learning Progress Card */}
          <div className="dashboard-card" onClick={navigateToModules}>
            <div className="card-header-modern">
              <div className="card-icon-medium">
                <FaChartLine />
              </div>
              <h3>Learning Progress</h3>
            </div>
            <div className="progress-summary">
              <div className="overall-progress">
                <span className="progress-percent">{totalProgress}%</span>
                <span className="progress-label">Overall Completion</span>
              </div>
              <div className="progress-bar-large">
                <div className="progress-fill-large" style={{ width: `${totalProgress}%` }}></div>
              </div>
            </div>
            <div className="top-module">
              <span className="top-module-label">Best progress:</span>
              <span className="top-module-name">{modules.reduce((a, b) => a.progress > b.progress ? a : b).name}</span>
            </div>
            <div className="card-footer-modern">
              <span className="card-link">Browse all modules →</span>
            </div>
          </div>

          {/* Voice Commands Card */}
          <div className="dashboard-card" onClick={navigateToCommands}>
            <div className="card-header-modern">
              <div className="card-icon-medium">
                <FaHeadphones />
              </div>
              <h3>Voice Commands</h3>
            </div>
            <div className="commands-preview">
              <div className="command-chip">"Open Chat"</div>
              <div className="command-chip">"Show Reminders"</div>
              <div className="command-chip">"Open Modules"</div>
              <div className="command-chip">"Help"</div>
            </div>
            <div className="card-footer-modern">
              <span className="card-link">View all commands →</span>
            </div>
          </div>
        </div>

        {/* Quick Stats Section */}
        <div className="stats-section-modern">
          <div className="stat-card-modern" onClick={navigateToModules}>
            <div className="stat-icon-circle">
              <FaBook />
            </div>
            <div className="stat-details">
              <span className="stat-number">{modules.length}</span>
              <span className="stat-name">Active Modules</span>
            </div>
          </div>
          <div className="stat-card-modern" onClick={navigateToReminders}>
            <div className="stat-icon-circle">
              <FaTasks />
            </div>
            <div className="stat-details">
              <span className="stat-number">{pendingRemindersCount}</span>
              <span className="stat-name">Pending Tasks</span>
            </div>
          </div>
          <div className="stat-card-modern" onClick={navigateToChat}>
            <div className="stat-icon-circle">
              <FaComments />
            </div>
            <div className="stat-details">
              <span className="stat-number">24/7</span>
              <span className="stat-name">AI Support</span>
            </div>
          </div>
        </div>
      </div>

      {/* Voice Listening Indicator */}
      {listening && (
        <div className="listening-indicator-modern">
          <div className="listening-wave">
            <span></span><span></span><span></span><span></span>
          </div>
          <span>Listening for commands...</span>
        </div>
      )}
    </div>
  );
};

export default HomeDashboard;