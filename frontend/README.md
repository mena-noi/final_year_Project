# AI-Powered Academic Assistant for Visually Impaired Students

A comprehensive web application designed to assist visually impaired students at Haramaya University with their academic journey through voice-controlled interactions and AI-powered guidance.

## Key Features

### 🎤 Speech-to-Text and Text-to-Speech
- **Voice Input**: Convert spoken words to text for seamless interaction
- **Voice Output**: Text-to-speech capabilities for audio feedback
- **Real-time Transcription**: Live speech recognition with visual feedback
- **Multiple Voice Options**: Customizable voice settings for better accessibility

### 🤖 AI-Based Chat Interface
- **Academic Guidance**: Context-aware AI responses for academic queries
- **Course Information**: Access to course schedules, assignments, and deadlines
- **Study Assistance**: Personalized learning support and recommendations
- **24/7 Availability**: Always-on AI assistant for immediate help

### 🎯 Command-Level Voice Control
- **Voice Commands**: Hands-free control through natural language commands
- **Smart Recognition**: Intelligent command parsing and execution
- **Custom Commands**: Personalizable voice triggers for specific actions
- **Navigation Control**: Voice-based interface navigation

### ⏰ Smart Reminders System
- **Academic Deadlines**: Track assignment due dates and exam schedules
- **Priority Management**: Organize tasks by importance and urgency
- **Voice Notifications**: Audio alerts for upcoming deadlines
- **Category Organization**: Separate reminders for assignments, exams, and meetings

### ♿ Accessibility Features
- **Screen Reader Support**: Full compatibility with screen reading software
- **High Contrast Mode**: Enhanced visual contrast for better visibility
- **Adjustable Font Sizes**: Scalable text for comfortable reading
- **Keyboard Navigation**: Complete keyboard control for all features
- **Reduced Motion**: Optimized animations for users with vestibular disorders

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom accessibility components
- **Icons**: Heroicons for consistent, accessible iconography
- **Speech APIs**: Web Speech API for voice recognition and synthesis
- **Build Tool**: Create React App with modern development setup

## Getting Started

### Prerequisites
- Node.js 16+ installed
- Modern web browser with speech API support
- Microphone access for voice input

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd academic-assistant
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage Guide

### Voice Commands
- **"Open chat"** - Navigate to AI chat interface
- **"Show reminders"** - Display your reminders and tasks
- **"View schedule"** - Check your class schedule
- **"Add assignment"** - Create a new assignment reminder
- **"Increase font size"** - Make text larger for better visibility
- **"Read last message"** - Read the last chat message aloud

### Chat Interface
- Click the microphone button to start voice input
- Type messages for text-based interaction
- Enable auto-speak for automatic audio responses
- Use keyboard shortcuts for quick navigation

### Reminder Management
- Add reminders with voice or text input
- Set priority levels (High, Medium, Low)
- Categorize by type (Assignment, Exam, Meeting, Other)
- Track completion status and due dates

## Browser Compatibility

This application works best with modern browsers that support the Web Speech API:
- ✅ Chrome 25+
- ✅ Edge 79+
- ✅ Safari 14.1+
- ❌ Firefox (limited support)

## Accessibility Standards

The application follows WCAG 2.1 AA guidelines:
- Semantic HTML5 structure
- ARIA labels and roles
- Keyboard accessibility
- Screen reader compatibility
- High contrast support
- Focus management

## Development

### Project Structure
```
src/
├── components/          # React components
│   ├── ChatInterface.tsx
│   ├── CommandPanel.tsx
│   ├── ReminderSystem.tsx
│   └── VoiceButton.tsx
├── hooks/              # Custom React hooks
│   ├── useSpeechRecognition.ts
│   └── useTextToSpeech.ts
├── types/              # TypeScript type definitions
│   └── index.ts
├── App.tsx             # Main application component
├── index.tsx           # Application entry point
└── index.css           # Global styles with Tailwind
```

### Available Scripts
- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For technical support or accessibility inquiries, please contact:
- Email: support@haramaya.edu.et
- Phone: +251-XXX-XXXX-XXXX

## Acknowledgments

- Haramaya University for supporting accessible education
- The Web Speech API community for voice recognition tools
- Open source contributors making education more accessible

---

**Note**: This application is designed specifically for visually impaired students and incorporates extensive accessibility features. Please ensure microphone permissions are granted for full functionality.
