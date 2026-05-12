import React, { useState } from 'react';
import { FaMicrophone, FaVolumeUp, FaTimes, FaRobot, FaGlobe, FaSpinner } from 'react-icons/fa';
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
    startListening, 
    stopListening, 
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

    // Language-specific commands
    if (currentLanguage === 'am-ET') {
      if (normalizedCommand.includes('ተር ምኛ ተር ም')) {
        speak('የአትተር ይልተር', currentLanguage);
        window.location.hash = '#chat';
      } else if (normalizedCommand.includes('ሞርልትትትንንማክትን')) {
        speak('የትማልትትትንንማክትን', currentLanguage);
        window.location.hash = '#modules';
      } else if (normalizedCommand.includes('ማድግትትንንን')) {
        speak('ማድግትትንንን', currentLanguage);
        window.location.hash = '#reminders';
      } else if (normalizedCommand.includes('እምኛት')) {
        speak('የሚውተር እምኛት', currentLanguage);
      } else if (normalizedCommand.includes('የሚውተር እምኛት')) {
        speak('የሚውተር እምኛት', currentLanguage);
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
                onClick={isListening ? stopListening : startListening}
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

            {/* Error Display */}
            {error && (
              <div className="voice-error">
                <p>Error: {error}</p>
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

            {/* Help Section */}
            <div className="voice-help">
              <h4>Voice Commands ({getCurrentLanguageInfo().name}):</h4>
              <ul>
                <li>"Open chat" / "ተር ምኛ ተር ም" / "ወረተር አትማክ" - Open AI chat</li>
                <li>"Open modules" / "ሞርልቅታትን ማክትን" / "ማድግቅታትን" - View learning materials</li>
                <li>"Open reminders" / "ማድግቅታትን" / "ማድግቅታትን" - Check reminders</li>
                <li>"Help" / "እምኛት" - Show all commands</li>
                <li>"Stop listening" / "አትማክ" - Stop voice recognition</li>
                <li>"Close assistant" / "የሚውተር እኝኛት" - Close voice panel</li>
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default HuggingFaceVoiceAssistant;
