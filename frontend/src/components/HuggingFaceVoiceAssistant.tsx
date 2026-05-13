import React, { useState, useEffect } from 'react';
import { FaRobot, FaTimes, FaMicrophone, FaGlobe, FaVolumeUp, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';
import { useHuggingFaceSpeech } from '../hooks/useHuggingFaceSpeech';
import './HuggingFaceVoiceAssistant.css';

interface HuggingFaceVoiceAssistantProps {
  onClose: () => void;
}

const HuggingFaceVoiceAssistant: React.FC<HuggingFaceVoiceAssistantProps> = ({ onClose }) => {
  const { 
    isListening, 
    transcript, 
    isSpeaking, 
    currentLanguage, 
    supportedLanguages, 
    speak,
    setLanguage,
    isSupported,
    isLoading,
    error
  } = useHuggingFaceSpeech();
  
  const [isMinimized, setIsMinimized] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [voiceCommands, setVoiceCommands] = useState<string[]>([]);

  // Multilingual voice command processing
  const processVoiceCommand = (command: string) => {
    const normalizedCommand = command.toLowerCase();
    console.log(`Voice command detected (${currentLanguage}):`, command);

    // Enhanced navigation commands with comprehensive guidance
    if (currentLanguage === 'am-ET') {
      if (normalizedCommand.includes('ተር ምኛ ተር ም')) {
        speak('የአስተር ተር ምኛ ተር ም ክፍትል ነው', currentLanguage);
        window.location.hash = '#chat';
      } else if (normalizedCommand.includes('ሞድዮሎች') || normalizedCommand.includes('ሞድዮሎችን')) {
        speak('የሞድዮሎች ክፍትል ነው', currentLanguage);
        window.location.hash = '#modules';
      } else if (normalizedCommand.includes('ማስታወሻዎች') || normalizedCommand.includes('ማስታወሻ')) {
        speak('የማስታወሻዎች ክፍትል ነው', currentLanguage);
        window.location.hash = '#reminders';
      } else if (normalizedCommand.includes('እምኛት')) {
        speak('የትእዛዝ እምኛት ክፍትል ነው', currentLanguage);
      } else if (normalizedCommand.includes('መማክት') || normalizedCommand.includes('መምርት')) {
        speak('ዋና መማክት ወደሚገባበት ይመለሳል', currentLanguage);
        window.location.href = 'http://localhost:5173/dashboard';
      } else if (normalizedCommand.includes('ቤትር') || normalizedCommand.includes('ቤትርን')) {
        speak('የመግቢያ ገጽ ይክፈታል', currentLanguage);
        window.location.href = 'http://localhost:5173/login';
      } else if (normalizedCommand.includes('ስትም') || normalizedCommand.includes('ስትምን')) {
        speak('የምዝገባ ገጽ ይክፈታል', currentLanguage);
        window.location.href = 'http://localhost:5173/register';
      }
    } else {
      // Enhanced English commands with comprehensive guidance
      if (normalizedCommand.includes('open chat') || normalizedCommand.includes('ai chat') || normalizedCommand.includes('assistant')) {
        speak('Opening AI chat assistant. You can ask me questions about your studies and get help with your coursework.', currentLanguage);
        window.location.hash = '#chat';
      } else if (normalizedCommand.includes('open modules') || normalizedCommand.includes('learning') || normalizedCommand.includes('materials')) {
        speak('Opening learning modules. Here you can access all your course materials and study resources.', currentLanguage);
        window.location.hash = '#modules';
      } else if (normalizedCommand.includes('open reminders') || normalizedCommand.includes('reminders') || normalizedCommand.includes('tasks')) {
        speak('Opening reminders. You can manage your study schedule and important deadlines here.', currentLanguage);
        window.location.hash = '#reminders';
      } else if (normalizedCommand.includes('home') || normalizedCommand.includes('dashboard') || normalizedCommand.includes('main')) {
        speak('Returning to main dashboard. This is your central hub for all learning activities.', currentLanguage);
        window.location.href = 'http://localhost:5173/dashboard';
      } else if (normalizedCommand.includes('login') || normalizedCommand.includes('sign in')) {
        speak('Opening login page. Please enter your credentials to access your account.', currentLanguage);
        window.location.href = 'http://localhost:5173/login';
      } else if (normalizedCommand.includes('register') || normalizedCommand.includes('sign up') || normalizedCommand.includes('create account')) {
        speak('Opening registration page. Create your account to get started with your learning journey.', currentLanguage);
        window.location.href = 'http://localhost:5173/register';
      } else if (normalizedCommand.includes('profile') || normalizedCommand.includes('account') || normalizedCommand.includes('settings')) {
        speak('Opening profile settings. Here you can manage your personal information and preferences.', currentLanguage);
        window.location.href = 'http://localhost:5173/profile';
      } else if (normalizedCommand.includes('explore') || normalizedCommand.includes('discover') || normalizedCommand.includes('search')) {
        speak('Opening explore section. Discover new learning materials and resources.', currentLanguage);
        window.location.hash = '#explore';
      } else if (normalizedCommand.includes('progress') || normalizedCommand.includes('stats') || normalizedCommand.includes('analytics')) {
        speak('Opening progress tracking. View your learning statistics and achievements.', currentLanguage);
        window.location.hash = '#progress';
      } else if (normalizedCommand.includes('help') || normalizedCommand.includes('commands') || normalizedCommand.includes('what can i do')) {
        speak('Available voice commands: Open chat, Open modules, Open reminders, Home, Login, Register, Profile, Explore, Progress, Help, Stop listening, Close assistant. Try saying any of these to navigate.', currentLanguage);
      } else if (normalizedCommand.includes('stop listening') || normalizedCommand.includes('stop') || normalizedCommand.includes('pause')) {
        speak('Voice recognition stopped. Click the microphone button to resume.', currentLanguage);
      } else if (normalizedCommand.includes('close assistant') || normalizedCommand.includes('minimize') || normalizedCommand.includes('hide')) {
        setIsMinimized(true);
        speak('Voice assistant minimized. Click the microphone icon to expand.', currentLanguage);
      } else if (normalizedCommand.includes('where am i') || normalizedCommand.includes('current page')) {
        speak(`You are currently on the dashboard page. Available sections include chat, modules, reminders, and more.`, currentLanguage);
      } else if (normalizedCommand.includes('navigate to') || normalizedCommand.includes('go to')) {
        // Extract destination from command
        const destination = normalizedCommand.replace(/navigate to|go to/i, '').trim();
        if (destination.includes('chat')) {
          speak('Navigating to AI chat assistant.', currentLanguage);
          window.location.hash = '#chat';
        } else if (destination.includes('module') || destination.includes('material')) {
          speak('Navigating to learning modules.', currentLanguage);
          window.location.hash = '#modules';
        } else if (destination.includes('reminder') || destination.includes('task')) {
          speak('Navigating to reminders.', currentLanguage);
          window.location.hash = '#reminders';
        } else if (destination.includes('home') || destination.includes('dashboard')) {
          speak('Navigating to main dashboard.', currentLanguage);
          window.location.href = 'http://localhost:5173/dashboard';
        }
      } else {
        // Default response for unrecognized commands
        speak('I didn\'t understand that command. Try saying "help" to see all available commands.', currentLanguage);
      }
    }

    // Default: add unrecognized commands to list
    setVoiceCommands(prev => [...prev.slice(-4), command]);
  };

  // Auto-response based on listening state
  React.useEffect(() => {
    if (isListening) {
      const messages = {
        'en-US': ['Listening for your commands...', 'I\'m ready to help', 'What can I do for you?'],
        'am-ET': ['ተር ምኛ ተር ም...', 'ዝአትተር...', 'ምርኛ እምኛት?'],
        'om-ET': ['ወረተር አትማክ...', 'ዝአትተር...', 'ምርኛ እምኛት?'],
        'es-ES': ['Escuchando tus comandos...', 'Estoy listo para ayudar', '¿Qué puedo hacer por ti?'],
        'fr-FR': ['Écoute de vos commandes...', 'Je suis prêt à aider', 'Que puis-je faire pour vous?'],
        'de-DE': ['Ich höre auf Ihre Befehle...', 'Ich bin bereit zu helfen', 'Was kann ich für Sie tun?'],
        'zh-CN': ['正在听您的命令...', '我准备好帮助您', '我能为您做什么？'],
        'hi-IN': ['आपके आदेशों सुन रहा हूं...', 'मैं आपकी मददद के लिए तैयार हूं', 'मैं आपके लिए क्या कर सकता हूं?'],
        'ar-SA': ['أستمع إلى أوامرك...', 'أنا مستعد للمساعدة', 'ماذا يمكنني أن أفعل لك؟'],
        'ja-JP': ['あなたのコマンドを聞いています...', 'あなたの助けをする準備ができています', 'あなたのために何ができますか？'],
        'pt-BR': ['Ouvindo seus comandos...', 'Estou pronto para ajudar', 'O que posso fazer por você?']
      };
      
      const randomMessage = messages[currentLanguage as keyof typeof messages]?.[
        Math.floor(Math.random() * 3)
      ] || 'Listening...';
      
      const timer = setTimeout(() => {
        if (isListening) {
          speak(randomMessage, currentLanguage);
        }
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isListening, speak, currentLanguage]);

  if (!isSupported) {
    return (
      <div className="voice-assistant-unsupported">
        <div className="unsupported-content">
          <FaRobot />
          <h3>Voice Assistant Not Supported</h3>
          <p>Your browser doesn't support voice recognition.</p>
          <p>Please use Chrome, Edge, or Firefox for voice features.</p>
        </div>
      </div>
    );
  }

  const getCurrentLanguageInfo = () => {
    return supportedLanguages.find(lang => lang.code === currentLanguage) || supportedLanguages[0];
  };

  return (
    <div className={`voice-assistant ${isMinimized ? 'minimized' : 'expanded'}`}>
      {/* Minimized State */}
      {isMinimized && (
        <div className="voice-assistant-minimized" onClick={() => setIsMinimized(false)}>
          <FaMicrophone className={isListening ? 'listening' : ''} />
          <span className="minimized-flag">{getCurrentLanguageInfo().flag}</span>
        </div>
      )}

      {/* Expanded State */}
      {!isMinimized && (
        <>
          <div className="voice-assistant-header">
            <div className="voice-assistant-title">
              <FaRobot />
              <span>Voice Assistant</span>
            </div>
            <div className="voice-assistant-controls">
              <button 
                className={`voice-btn ${isListening ? 'listening' : ''}`}
                onClick={() => speak('Voice recognition is currently disabled. Please use text commands instead.', currentLanguage)}
                disabled={isLoading}
              >
                {isLoading ? <FaSpinner className="spinner-icon" /> : (isListening ? <FaTimes /> : <FaMicrophone />)}
              </button>
              <button 
                className="language-btn"
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
              >
                <FaGlobe />
                <span>{getCurrentLanguageInfo().flag}</span>
              </button>
              <button 
                className="voice-btn minimize-btn"
                onClick={() => setIsMinimized(true)}
              >
                <FaVolumeUp />
              </button>
            </div>
          </div>

          {/* Language Menu */}
          {showLanguageMenu && (
            <div className="language-menu">
              <h4>Select Language</h4>
              <div className="language-options">
                {supportedLanguages.map((lang) => (
                  <button
                    key={lang.code}
                    className={`language-option ${currentLanguage === lang.code ? 'active' : ''}`}
                    onClick={() => {
                      setLanguage(lang.code);
                      setShowLanguageMenu(false);
                      speak(lang.name, lang.code);
                    }}
                  >
                    <span className="language-flag">{lang.flag}</span>
                    <span className="language-name">{lang.name} ({lang.huggingCode})</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="voice-assistant-content">
            {/* Status Display */}
            <div className="voice-status">
              <div className={`status-indicator ${isListening ? 'listening' : 'idle'}`}>
                <div className="pulse-dot"></div>
                <span>{isSpeaking ? 'Speaking...' : isListening ? 'Listening...' : 'Ready'}</span>
              </div>
            </div>

            {/* Text Input for Commands */}
            <div className="voice-text-input">
              <input
                type="text"
                placeholder={`Type a command (${currentLanguage === 'am-ET' ? 'እምኛት' : 'help'})...`}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const target = e.target as HTMLInputElement;
                    processVoiceCommand(target.value);
                    target.value = '';
                  }
                }}
                className="command-input"
              />
            </div>

            {/* Error Display */}
            {error && (
              <div className="voice-error">
                <FaExclamationTriangle />
                <span>{error}</span>
              </div>
            )}

            {/* Transcript Display */}
            {transcript && (
              <div className="voice-transcript">
                <div className="transcript-text">
                  <strong>You said:</strong> {transcript}
                </div>
              </div>
            )}

            {/* Recent Commands */}
            {voiceCommands.length > 0 && (
              <div className="voice-commands">
                <h4>Recent Commands:</h4>
                <ul>
                  {voiceCommands.slice(-3).reverse().map((cmd, index) => (
                    <li key={index}>{cmd}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Enhanced Help Section */}
            <div className="voice-help">
              <h4>Voice Commands ({getCurrentLanguageInfo().name}):</h4>
              <ul>
                <li>"Open chat" / "AI chat" / "Assistant" / "ተር ምኛ ተር ም" - Open AI chat assistant</li>
                <li>"Open modules" / "Learning" / "Materials" / "ሞርልቅታትን ማክትን" - Access course materials</li>
                <li>"Open reminders" / "Tasks" / "ማድግቅታትን" - Manage study schedule</li>
                <li>"Home" / "Dashboard" / "Main" / "መማክት" - Return to main dashboard</li>
                <li>"Login" / "Sign in" / "ቤትር" - Access your account</li>
                <li>"Register" / "Sign up" / "ስትም" - Create new account</li>
                <li>"Profile" / "Account" / "Settings" - Manage personal info</li>
                <li>"Explore" / "Discover" / "Search" - Find new resources</li>
                <li>"Progress" / "Stats" / "Analytics" - View learning stats</li>
                <li>"Navigate to [page]" / "Go to [page]" - Jump to specific section</li>
                <li>"Where am I" / "Current page" - Know your location</li>
                <li>"Help" / "Commands" / "እምኛት" - Show all commands</li>
                <li>"Stop listening" / "Stop" / "Pause" / "አትማክ" - Stop voice input</li>
                <li>"Close assistant" / "Minimize" / "Hide" / "የሚውተር እምኛት" - Minimize voice panel</li>
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default HuggingFaceVoiceAssistant;
