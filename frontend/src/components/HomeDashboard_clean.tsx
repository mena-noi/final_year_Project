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
  FaChartLine,
  FaStar,
  FaTrophy,
  FaArrowUp,
  FaSpinner
} from "react-icons/fa";
import "./HomeDashboard.css";

const HomeDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [voiceGuide, setVoiceGuide] = useState<boolean>(true);
  const [listening, setListening] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [greeting, setGreeting] = useState<string>("");
  const [showCommands, setShowCommands] = useState<boolean>(false);
  
  // User progress data
  const [userLevel, setUserLevel] = useState({
    overall: 77,
    level: "C1",
    pronunciation: 85,
    vocabulary: 78,
    grammar: 82,
    fluency: 80
  });

  // Sample data
  const [reminders, setReminders] = useState([
    { id: 1, text: "Complete pronunciation module", time: "9:00 AM", completed: false, task: "Pronunciation Practice" },
    { id: 2, text: "Review vocabulary flashcards", time: "2:30 PM", completed: false, task: "Vocabulary Review" },
    { id: 3, text: "Grammar exercise session", time: "5:00 PM", completed: false, task: "Grammar Practice" }
  ]);

  const [modules, setModules] = useState([
    { id: 1, name: "Pronunciation", progress: 85, total: 12, completed: 12, nextClass: "Completed" },
    { id: 2, name: "Grammar", progress: 75, total: 20, completed: 15, nextClass: "In Progress" },
    { id: 3, name: "Vocabulary", progress: 65, total: 15, completed: 10, nextClass: "In Progress" }
  ]);

  // Set greeting based on time
  useEffect(() => {
    const hour = currentTime.getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 17) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, [currentTime]);

  // Welcome message
  useEffect(() => {
    speak(`Welcome back! ${greeting}. Your English level is C1 Advanced. Press 1 for modules, 2 for reminders, 3 for chat, 0 for help.`);
  }, [greeting]);

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

  // Navigation functions
  const navigateToModules = useCallback(() => {
    speak("Opening modules");
    navigate("/modules");
  }, [navigate, speak]);

  const navigateToChat = useCallback(() => {
    speak("Opening AI chat assistant");
    navigate("/chat");
  }, [navigate, speak]);

  const navigateToReminders = useCallback(() => {
    speak("Opening reminders");
    navigate("/reminders");
  }, [navigate, speak]);

  // Handle number key commands
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent): void => {
      if (!/^[0-9]$/.test(e.key)) return;
      const num = parseInt(e.key);
      
      switch(num) {
        case 1: navigateToModules(); break;
        case 2: navigateToReminders(); break;
        case 3: navigateToChat(); break;
        case 0: speak("Help menu. Press 1 for modules, 2 for reminders, 3 for chat.");
          setShowCommands(prev => !prev);
          break;
        default: speak("Option not recognized. Press 0 for help.");
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [speak, navigateToModules, navigateToReminders, navigateToChat]);

  const toggleListening = useCallback((): void => {
    setListening(prev => !prev);
    if (!listening) {
      speak("Listening for commands. Press 1 for modules, 2 for reminders, 3 for chat.");
      setTimeout(() => setListening(false), 5000);
    }
  }, [listening, speak]);

  const handleLogout = useCallback((): void => {
    speak("Logging out. Goodbye!");
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

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="modern-dashboard">
      {/* Voice Assistant Bar */}
      <div className="modern-voice-bar">
        <div className="voice-info">
          <FaRobot className="voice-icon" />
          <span>AI Assistant Active</span>
        </div>
        <div className="voice-controls">
          <button 
            className={`voice-button ${listening ? 'listening' : ''}`}
            onClick={toggleListening}
          >
            <FaMicrophone />
            <span>{listening ? 'Listening...' : 'Voice Commands'}</span>
          </button>
          <button 
            className={`voice-toggle ${voiceGuide ? 'active' : ''}`}
            onClick={() => setVoiceGuide(prev => !prev)}
          >
            <FaVolumeUp />
            <span>Voice {voiceGuide ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      <button className="modern-logout" onClick={handleLogout}>
        <FaSignOutAlt /> Logout
      </button>

      <div className="modern-content">
        {/* English Report Section */}
        <div className="report-section">
          <h2>Your English report</h2>
          <div className="skills-grid">
            <div className="skill-card">
              <span className="skill-label">Overall</span>
              <span className="skill-level" style={{ color: getScoreColor(userLevel.overall) }}>C1</span>
            </div>
            <div className="skill-card">
              <span className="skill-label">Pronunciation</span>
              <span className="skill-level">{userLevel.pronunciation}%</span>
            </div>
            <div className="skill-card">
              <span className="skill-label">Vocabulary</span>
              <span className="skill-level">{userLevel.vocabulary}%</span>
            </div>
            <div className="skill-card">
              <span className="skill-label">Grammar</span>
              <span className="skill-level">{userLevel.grammar}%</span>
            </div>
            <div className="skill-card">
              <span className="skill-label">Fluency</span>
              <span className="skill-level">{userLevel.fluency}%</span>
            </div>
          </div>
        </div>

        {/* Score Section */}
        <div className="score-section">
          <div className="score-card">
            <div className="score-header">
              <FaChartLine className="score-icon" />
              <h3>YOUR ENGLISH SCORE</h3>
            </div>
            <div className="score-value">
              <span className="score-number">{userLevel.overall}</span>
              <div className="score-level">
                <span className="level-badge">Advanced {userLevel.level}</span>
                <div className="level-scale">
                  <span>A1</span>
                  <span>B1</span>
                  <span>B2</span>
                  <span className="active">C1</span>
                  <span>C2</span>
                </div>
              </div>
            </div>
            <div className="score-footer">
              <FaTrophy className="trophy-icon" />
              <span>1 - beginner</span>
              <span>20</span>
              <span>40</span>
              <span>60</span>
              <span>80</span>
              <FaArrowUp className="arrow-icon" />
            </div>
          </div>

          <div className="tasks-card">
            <div className="tasks-header">
              <FaSpinner className="tasks-icon" />
              <h3>YOUR OVERALL SPEAKING LEVEL</h3>
            </div>
            <p className="tasks-text">COMPLETE TASKS TO IMPROVE</p>
            
            {modules.map(module => (
              <div key={module.id} className="task-item">
                <div className="task-info">
                  <span className="task-name">{module.name}</span>
                  <span className="task-progress">{module.progress}%</span>
                </div>
                <div className="task-progress-bar">
                  <div className="task-progress-fill" style={{ width: `${module.progress}%` }}></div>
                </div>
                <div className="task-stats">
                  <span>{module.completed}/{module.total} reviewed</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <button className="action-card chat-button" onClick={navigateToChat}>
            <div className="action-icon-wrapper chat-icon">
              <FaRobot />
            </div>
            <div className="action-info">
              <h4>Chat Interface</h4>
              <p>Start conversation with AI assistant</p>
            </div>
            <FaChevronRight className="action-arrow" />
          </button>

          <button className="action-card modules-button" onClick={navigateToModules}>
            <div className="action-icon-wrapper modules-icon">
              <FaBook />
            </div>
            <div className="action-info">
              <h4>Learning Modules</h4>
              <p>Access pronunciation, grammar & vocabulary</p>
            </div>
            <FaChevronRight className="action-arrow" />
          </button>

          <button className="action-card reminders-button" onClick={navigateToReminders}>
            <div className="action-icon-wrapper reminders-icon">
              <FaBell />
              {pendingRemindersCount > 0 && (
                <span className="notification-badge">{pendingRemindersCount}</span>
              )}
            </div>
            <div className="action-info">
              <h4>Reminders</h4>
              <p>{pendingRemindersCount} tasks scheduled today</p>
            </div>
            <FaChevronRight className="action-arrow" />
          </button>
        </div>
      </div>

      {/* Command Hint */}
      {showCommands && (
        <div className="command-hint-modern">
          <p>🎤 Voice commands: Press 1 for modules, 2 for reminders, 3 for chat, 0 for help</p>
        </div>
      )}
    </div>
  );
};

export default HomeDashboard;
