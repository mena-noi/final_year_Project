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
  FaRegKeyboard,
  FaClipboardList
} from "react-icons/fa";
import { fetchStudentMaterials, fetchSchedules, fetchReminders, createReminder } from "../api/api";
import MaterialViewer from "./MaterialViewer";
import HuggingFaceVoiceAssistant from "./HuggingFaceVoiceAssistant";
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

  // Schedules data
  const [schedules, setSchedules] = useState<any[]>([]);
  const [schedulesLoading, setSchedulesLoading] = useState(false);

  // Reminders data
  const [reminders, setReminders] = useState<any[]>([]);
  const [remindersLoading, setRemindersLoading] = useState(false);

  // Modules data - fetched from backend
  const [modules, setModules] = useState<any[]>([]);
  const [modulesLoading, setModulesLoading] = useState(false);
  const [modulesError, setModulesError] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState<any | null>(null);
  const [showMaterialViewer, setShowMaterialViewer] = useState(false);

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

  // Fetch schedules from backend
  useEffect(() => {
    const loadSchedules = async () => {
      setSchedulesLoading(true);
      try {
        const response = await fetchSchedules();
        setSchedules(response.schedules || []);
      } catch (error) {
        console.error('Failed to fetch schedules:', error);
      } finally {
        setSchedulesLoading(false);
      }
    };
    loadSchedules();
  }, []);

  // Fetch reminders from backend
  useEffect(() => {
    const loadReminders = async () => {
      setRemindersLoading(true);
      try {
        const response = await fetchReminders();
        setReminders(response.reminders || []);
      } catch (error) {
        console.error('Failed to fetch reminders:', error);
      } finally {
        setRemindersLoading(false);
      }
    };
    loadReminders();
  }, []);

  // Fetch modules from backend
  useEffect(() => {
    const loadModules = async () => {
      setModulesLoading(true);
      setModulesError('');
      try {
        console.log('Fetching student materials...');
        
        // Direct API call for debugging
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/api/upload/material', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Direct API response:', data);
        
        const mats = data.materials || [];
        console.log('Materials count:', mats.length);
        console.log('Materials data:', mats);
        
        setModules(mats);
      } catch (error: any) {
        console.error('Failed to fetch modules:', error);
        setModulesError(error?.message || 'Failed to load materials');
      } finally {
        setModulesLoading(false);
      }
    };
    loadModules();
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
  const navigateToChat = () => {
    // Navigate to chat section with hash
    window.location.href = 'http://localhost:5173/dashboard#chat';
  };
  const navigateToModules = () => {
    // Navigate to modules section with hash
    window.location.href = 'http://localhost:5173/dashboard#modules';
  };
  const navigateToReminders = () => {
    // Navigate to reminders section with hash
    window.location.href = 'http://localhost:5173/dashboard#reminders';
  };
  const navigateToCommands = useCallback(() => {
    speak("Opening Voice Commands");
    // Navigate to commands section with hash
    window.location.href = 'http://localhost:5173/dashboard#commands';
  }, [navigate, speak]);

  const handleAskAI = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/rag/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          question: "Can you help me understand my course materials better?"
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('RAG response:', data);
        navigate('/chat');
      } else {
        console.error('RAG request failed');
      }
    } catch (error) {
      console.error('Error asking AI:', error);
    }
  };

  const handleOpenVoiceCommands = useCallback(() => {
    speak("Opening Voice Commands");
    navigateToChat();
  }, [navigate, speak]);

  const handleLogout = useCallback((): void => {
    speak("Logging out. Goodbye!");
    localStorage.removeItem('user');
    localStorage.removeItem('activeTab');
    setTimeout(() => navigate("/"), 1500);
  }, [navigate, speak]);

  const toggleReminder = useCallback(async (id: number): Promise<void> => {
    setReminders(prev => prev.map(r => 
      r.id === id ? { ...r, completed: !r.completed } : r
    ));
    const reminder = reminders.find(r => r.id === id);
    speak(reminder?.completed ? "Reminder marked incomplete" : "Reminder completed! Good job!");
    
    // Update reminder in backend
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/reminders/student/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          isActive: !reminder?.completed
        })
      });
      
      if (!response.ok) {
        console.error('Failed to update reminder');
      }
    } catch (error) {
      console.error('Error updating reminder:', error);
    }
  }, [reminders, speak]);

  const addReminder = useCallback(async (reminderData: {
    title: string;
    description?: string;
    reminderTime?: string;
  }): Promise<void> => {
    console.log('Adding reminder with data:', reminderData);
    try {
      const response = await createReminder({
        title: reminderData.title,
        description: reminderData.description || '',
        reminderType: 'notification',
        reminderTime: reminderData.reminderTime || '30',
        repeatOption: 'once'
      });
      
      console.log('Create reminder response:', response);
      
      if (response.reminder) {
        setReminders(prev => [...prev, {
          id: response.reminder.id,
          text: response.reminder.title,
          time: response.reminder.reminderTime || '12:00 PM',
          completed: !response.reminder.isActive
        }]);
        speak(`Reminder added: ${reminderData.title}`);
      } else {
        console.log('No reminder in response:', response);
      }
    } catch (error) {
      console.error('Error adding reminder:', error);
      speak('Failed to add reminder');
    }
  }, []);

  const openMaterialViewer = useCallback((material: any) => {
    console.log('Opening material:', material);
    setSelectedMaterial(material);
    setShowMaterialViewer(true);
    speak(`Opening ${material.title}`);
  }, [speak]);

  const closeMaterialViewer = useCallback(() => {
    setShowMaterialViewer(false);
    setSelectedMaterial(null);
  }, []);

  const formatTime = useCallback((date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, []);

  const formatDate = useCallback((date: Date): string => {
    return date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
  }, []);

  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  const handleDownload = useCallback((material: any) => {
    const link = document.createElement('a');
    link.href = `http://localhost:3000${material.fileUrl}`;
    link.download = material.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    speak(`Downloading ${material.title}`);
  }, [speak]);

  const pendingRemindersCount = reminders.filter(r => !r.completed).length;
  const totalProgress = modules.length > 0 ? Math.round(100 / modules.length) : 0;

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

        {/* Schedules Section */}
        {schedules.length > 0 && (
          <section className="schedules-banner" aria-label="Department schedules">
            <div className="exam-notices-header">
              <FaClipboardList aria-hidden />
              <h2>Schedules & Calendars</h2>
            </div>
            <div className="exam-notices-list">
              {schedules.map((schedule: any) => (
                <div key={schedule._id} className="exam-notice-item">
                  <p className="exam-notice-title">{schedule.title}</p>
                  <p className="exam-notice-dates">
                    Type: {schedule.type?.replace('_', ' ')} | Department: {schedule.department}
                    {schedule.academicYear && ` | Year: ${schedule.academicYear}`}
                    {schedule.semester && ` | Semester: ${schedule.semester}`}
                  </p>
                  {schedule.fileUrl && (
                    <a
                      href={`http://localhost:3000${schedule.fileUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="exam-notice-attachment"
                      style={{ display: 'inline-block', marginTop: '8px', color: '#2563eb' }}
                    >
                      📎 Download {schedule.fileName || 'Schedule File'}
                    </a>
                  )}
                </div>
              ))}
            </div>
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
              <button 
                className="add-reminder-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  const title = prompt('Enter reminder title:');
                  if (title && title.trim()) {
                    addReminder({ title: title.trim(), reminderTime: '30' });
                  }
                }}
              >
                + Add Reminder
              </button>
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
            </div>

          {/* AI Assistant Card */}
          <div className="dashboard-card" onClick={navigateToChat}>
            <div className="card-header-modern">
              <div className="card-icon-medium">
                <FaBrain />
              </div>
              <h3>AI Assistant</h3>
            </div>
            <div className="card-content">
              <p>Ask questions about your course materials</p>
              <button 
                onClick={handleAskAI}
                style={{
                  background: '#10b981',
                  color: 'white',
                  padding: '12px 24px',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  width: '100%',
                  marginTop: '12px'
                }}
              >
                🤖 Ask AI
              </button>
            </div>
              <div className="progress-bar-large">
                <div className="progress-fill-large" style={{ width: `${totalProgress}%` }}></div>
              </div>
            </div>
            <div className="top-module">
              <span className="top-module-label">Latest material:</span>
              <span className="top-module-name">{modules.length > 0 ? modules[0].title : 'None yet'}</span>
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

        {/* Available Materials List - UPDATED WITH VIEW AND DOWNLOAD BUTTONS */}
        <div className="dashboard-section-modern">
          <div className="section-header-modern">
            <h3><FaBook /> Available Course Materials</h3>
            {modulesLoading && <span className="loading-text">Loading...</span>}
          </div>
          {modulesError && (
            <div className="empty-state-modern" style={{ color: '#ef4444' }}>
              <p>Error: {modulesError}</p>
            </div>
          )}
          {!modulesError && modules.length === 0 && !modulesLoading ? (
            <div className="empty-state-modern">
              <p>No materials available yet.</p>
            </div>
          ) : (
            <div className="materials-list-modern">
              {modules.map((material: any) => (
                <div key={material._id} className="material-item-modern">
                  <div className="material-info">
                    <h4 className="material-title">{material.title}</h4>
                    <p className="material-meta">
                      <span className="course-code">{material.courseCode}</span>
                      {material.materialType && (
                        <span className="material-type">{material.materialType.replace('_', ' ')}</span>
                      )}
                      {material.department && (
                        <span className="material-dept">{material.department}</span>
                      )}
                    </p>
                    {material.description && (
                      <p className="material-desc">{material.description}</p>
                    )}
                    <div className="material-file-info">
                      <span className="file-name">📄 {material.fileName}</span>
                      <span className="file-size">
                        {material.fileSize ? formatFileSize(material.fileSize) : 'Unknown size'}
                      </span>
                    </div>
                  </div>
                  <div className="material-buttons">
                    <button 
                      onClick={() => openMaterialViewer(material)}
                      style={{
                        background: '#10b981',
                        color: 'white',
                        padding: '10px 20px',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        marginRight: '10px'
                      }}
                    >
                      📖 View
                    </button>
                    <button 
                      onClick={() => handleDownload(material)}
                      style={{
                        background: '#3b82f6',
                        color: 'white',
                        padding: '10px 20px',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      ⬇️ Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
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

      {/* Material Viewer Modal */}
      {showMaterialViewer && selectedMaterial && (
        <MaterialViewer 
          material={selectedMaterial}
          onClose={closeMaterialViewer}
        />
      )}

      {/* Voice Assistant */}
      <HuggingFaceVoiceAssistant onClose={() => {}} />
    </div>
  );
};

export default HomeDashboard;