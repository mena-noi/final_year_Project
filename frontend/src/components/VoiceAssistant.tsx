import React, { useState, useEffect } from 'react';
import { FaMicrophone, FaVolumeUp, FaTimes, FaRobot } from 'react-icons/fa';
import { useWebSpeech } from '../hooks/useWebSpeech';
import './VoiceAssistant.css';

interface VoiceAssistantProps {
  onClose: () => void;
}

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ onClose }) => {
  const { isListening, transcript, startListening, stopListening, speak, isSupported } = useWebSpeech();
  const [isMinimized, setIsMinimized] = useState(false);
  const [voiceCommands, setVoiceCommands] = useState<string[]>([]);

  // Voice command processing
  useEffect(() => {
    if (!transcript) return;

    const command = transcript.toLowerCase();
    console.log('Voice command detected:', command);

    // Process voice commands
    if (command.includes('open chat')) {
      speak('Opening chat assistant');
      window.location.hash = '#chat';
    } else if (command.includes('open modules')) {
      speak('Opening learning modules');
      window.location.hash = '#modules';
    } else if (command.includes('open reminders')) {
      speak('Opening reminders');
      window.location.hash = '#reminders';
    } else if (command.includes('help')) {
      speak('Available commands: open chat, open modules, open reminders, stop listening, close assistant');
    } else if (command.includes('stop listening')) {
      stopListening();
      speak('Voice assistant stopped');
    } else if (command.includes('close assistant')) {
      onClose();
    } else {
      // Add unrecognized commands to list
      setVoiceCommands(prev => [...prev.slice(-4), command]);
    }
  }, [transcript, speak, stopListening, onClose]);

  // Auto-response based on listening state
  useEffect(() => {
    if (isListening) {
      const messages = [
        'Listening for your commands...',
        'I\'m ready to help',
        'What can I do for you?'
      ];
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      
      const timer = setTimeout(() => {
        if (isListening) {
          speak(randomMessage);
        }
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isListening, speak]);

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

  return (
    <div className={`voice-assistant ${isMinimized ? 'minimized' : 'expanded'}`}>
      {/* Minimized State */}
      {isMinimized && (
        <div className="voice-assistant-minimized" onClick={() => setIsMinimized(false)}>
          <FaMicrophone className={isListening ? 'listening' : ''} />
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
              >
                {isListening ? <FaTimes /> : <FaMicrophone />}
              </button>
              <button 
                className="voice-btn minimize-btn"
                onClick={() => setIsMinimized(true)}
              >
                <FaVolumeUp />
              </button>
            </div>
          </div>

          <div className="voice-assistant-content">
            {/* Status Display */}
            <div className="voice-status">
              <div className={`status-indicator ${isListening ? 'listening' : 'idle'}`}>
                <div className="pulse-dot"></div>
                <span>{isListening ? 'Listening...' : 'Ready'}</span>
              </div>
            </div>

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
              <h4>Voice Commands:</h4>
              <ul>
                <li>"Open chat" - Open AI chat</li>
                <li>"Open modules" - View learning materials</li>
                <li>"Open reminders" - Check reminders</li>
                <li>"Help" - Show all commands</li>
                <li>"Stop listening" - Stop voice recognition</li>
                <li>"Close assistant" - Close voice panel</li>
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default VoiceAssistant;
