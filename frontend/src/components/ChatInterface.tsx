import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { 
  FaMicrophone,
  FaVolumeUp,
  FaRobot,
  FaUser,
  FaPlus,
  FaSearch,
  FaEllipsisH,
  FaChevronRight,
  FaChevronLeft,
  FaArrowUp,
  FaMoon,
  FaSun,
  FaSpinner
} from "react-icons/fa";
import { apiClient } from "../api/client";
import "./AIChat.css";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

interface ChatHistory {
  id: string;
  title: string;
}

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isTyping?: boolean;
  historySessions?: ChatHistory[];
  activeSessionId?: string;
  onSelectSession?: (id: string) => void;
  onCreateSession?: () => void;
  onRenameSession?: (id: string, title: string) => void;
  onDeleteSession?: (id: string) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  messages, 
  onSendMessage, 
  isTyping = false,
  historySessions = [],
  activeSessionId = "",
  onSelectSession = () => {},
  onCreateSession = () => {},
  onRenameSession = () => {},
  onDeleteSession = () => {}
}) => {
  const { t, i18n } = useTranslation();
  const [inputText, setInputText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [isLightMode, setIsLightMode] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);

  // Cleanup MediaRecorder on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 🔊 Text-to-Speech
  const speak = (text: string) => {
    window.speechSynthesis.cancel();
    const speech = new SpeechSynthesisUtterance(text);
    speech.rate = 0.9;
    window.speechSynthesis.speak(speech);
  };

  const handleSendMessage = (text: string = inputText) => {
    if (!text.trim()) return;
    onSendMessage(text);
    setInputText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (value: string) => {
    setInputText(value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const startListening = async () => {
    if (isListening) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
        setIsListening(false);
      }
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        // Release stream tracks
        stream.getTracks().forEach(track => track.stop());
        
        setIsTranscribing(true);
        try {
          const lang = i18n.resolvedLanguage || 'amh';
          const response = await apiClient.uploadAudioForTranscription(audioBlob, lang);
          if (response.transcription) {
            setInputText((prev) => (prev ? prev + ' ' + response.transcription : response.transcription));
            if (textareaRef.current) {
              textareaRef.current.style.height = "auto";
            }
          }
        } catch (error) {
          console.error("Transcription error:", error);
        } finally {
          setIsTranscribing(false);
        }
      };

      mediaRecorder.start();
      setIsListening(true);
    } catch (err) {
      console.error("Microphone access denied:", err);
    }
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  const newChat = () => {
    setInputText("");
    onCreateSession();
    speak("Starting new chat");
  };

  const loadHistoryChat = (chat: ChatHistory) => {
    onSelectSession(chat.id);
    speak(`Opening ${chat.title}`);
  };

  const filteredHistory = historySessions.filter((session) =>
    session.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const startRename = (session: ChatHistory) => {
    setEditingId(session.id);
    setEditingTitle(session.title);
    setMenuOpenId(null);
  };

  const saveRename = () => {
    if (!editingId || !editingTitle.trim()) return;
    onRenameSession(editingId, editingTitle.trim());
    setEditingId(null);
    setEditingTitle("");
  };

  return (
    <div className={`ds-chat-interface ${isLightMode ? "light-theme" : "dark-theme"}`}>
      {!sidebarOpen && (
        <button className="ds-sidebar-toggle" onClick={toggleSidebar}>
          <FaChevronRight />
          <span>History</span>
        </button>
      )}

      <aside className={`ds-chat-sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="ds-sidebar-header">
          <button className="ds-sidebar-close" onClick={toggleSidebar}>
            <FaChevronLeft />
          </button>
        </div>
        <div className="ds-history-list">
          <button className="ds-new-chat-btn" onClick={newChat}>
            <FaPlus />
            <span>{t("newChat")}</span>
          </button>
          <div className="ds-search-wrap">
            <FaSearch />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("searchChats")}
            />
          </div>
          <div className="ds-history-group-title">{t("yourChats")}</div>
          {filteredHistory.map((chat) => (
            <div
              key={chat.id}
              className={`ds-history-item ${activeSessionId === chat.id ? "active" : ""}`}
            >
              {editingId === chat.id ? (
                <div className="ds-rename-row">
                  <input
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    autoFocus
                  />
                  <button onClick={saveRename}>{t("save")}</button>
                </div>
              ) : (
                <>
                  <button className="ds-history-select" onClick={() => loadHistoryChat(chat)}>
                    <div className="ds-history-title">{chat.title}</div>
                  </button>
                  <button className="ds-history-menu" onClick={() => setMenuOpenId(menuOpenId === chat.id ? null : chat.id)}>
                    <FaEllipsisH />
                  </button>
                  {menuOpenId === chat.id && (
                    <div className="ds-history-popover">
                      <button onClick={() => startRename(chat)}>{t("rename")}</button>
                      <button onClick={() => onDeleteSession(chat.id)}>{t("delete")}</button>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </aside>

      <div className="ds-chat-main">
        <div className="ds-chat-header">
          <h2 className="ds-conversation-title">{t("chatTitle")}</h2>
          <div className="ds-header-actions">
            <button
              type="button"
              className="ds-theme-toggle"
              onClick={() => setIsLightMode((prev) => !prev)}
              title={isLightMode ? "Switch to dark mode" : "Switch to light mode"}
              aria-label={isLightMode ? "Switch to dark mode" : "Switch to light mode"}
            >
              {isLightMode ? <FaMoon /> : <FaSun />}
            </button>
          </div>
        </div>

        <div className="ds-messages-container">
          {messages.map(msg => (
            <div key={msg.id} className={`ds-message-row ${msg.sender}`}>
              <div className="ds-message-avatar">
                {msg.sender === "assistant" ? <FaRobot /> : <FaUser />}
              </div>
              <div className="ds-message-bubble">
                <div className="ds-message-header">
                  <span className="ds-message-sender">
                    {msg.sender === "assistant" ? "AI Assistant" : "You"}
                  </span>
                  <span className="ds-message-time">{formatTime(msg.timestamp)}</span>
                </div>
                <div className="ds-message-text">{msg.text}</div>
                <button
                  className="ds-message-speak"
                  onClick={() => speak(msg.text)}
                  title="Read aloud"
                >
                  <FaVolumeUp />
                </button>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="ds-typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="ds-input-area">
          <div className="ds-input-lang-row">
            <label htmlFor="chat-lang" className="ds-input-lang-label">Language</label>
            <select
              id="chat-lang"
              value={i18n.resolvedLanguage || "en"}
              onChange={(e) => i18n.changeLanguage(e.target.value)}
              className="ds-lang-select"
            >
              <option value="en">English</option>
              <option value="am">Amharic</option>
              <option value="or">Oromo</option>
            </select>
          </div>
          <div className="ds-input-wrapper">
            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t("messagePlaceholder")}
              rows={1}
            />
            <div className="ds-input-actions">
              <button
                className={`ds-voice-btn ${isListening ? "listening" : ""}`}
                onClick={startListening}
                title={isListening ? "Listening..." : "Voice input"}
                disabled={isTranscribing}
              >
                {isTranscribing ? <FaSpinner className="fa-spin" /> : <FaMicrophone />}
              </button>
              <button
                className="ds-send-btn"
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim()}
              >
                <FaArrowUp />
              </button>
            </div>
          </div>
          <div className="ds-input-hint">
            {isListening ? t("listeningNow") : isTranscribing ? "Transcribing with Simba-M..." : t("sendHint")}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;