import React, { useState, useCallback } from 'react';
import { 
  CommandLineIcon, 
  MicrophoneIcon,
  ChatBubbleLeftRightIcon,
  BellIcon,
  Cog6ToothIcon,
  AcademicCapIcon,
  CalendarIcon,
  DocumentTextIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { Command } from '../types';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

interface CommandPanelProps {
  commands: Command[];
  onExecuteCommand: (command: Command) => void;
  className?: string;
}

const CommandPanel: React.FC<CommandPanelProps> = ({
  commands,
  onExecuteCommand,
  className = ''
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [voiceCommand, setVoiceCommand] = useState('');
  const [isListening, setIsListening] = useState(false);

  const {
    transcript,
    startListening,
    stopListening,
    resetTranscript,
    isSupported: speechSupported
  } = useSpeechRecognition();

  const findMatchingCommand = useCallback((input: string): Command | null => {
    const lowerInput = input.toLowerCase();
    
    // Enhanced voice command matching for blind users
    for (const command of commands) {
      const triggers = [
        command.voiceTrigger.toLowerCase(),
        command.name.toLowerCase(),
        ...command.name.toLowerCase().split(' '),
        // Add common variations
        ...command.name.toLowerCase().split(' ').map(word => word + ' screen'),
        ...command.description.toLowerCase().split(' ').filter(word => word.length > 3)
      ];
      
      for (const trigger of triggers) {
        if (lowerInput.includes(trigger)) {
          return command;
        }
      }
    }
    
    return null;
  }, [commands]);

  React.useEffect(() => {
    if (transcript) {
      setVoiceCommand(transcript);
      const matchedCommand = findMatchingCommand(transcript);
      if (matchedCommand) {
        onExecuteCommand(matchedCommand);
      }
    }
  }, [transcript, findMatchingCommand, onExecuteCommand]);

  const categories = [
    { id: 'all', name: 'All Commands', icon: CommandLineIcon },
    { id: 'navigation', name: 'Navigation', icon: ChatBubbleLeftRightIcon },
    { id: 'academic', name: 'Academic', icon: AcademicCapIcon },
    { id: 'reminder', name: 'Reminders', icon: BellIcon },
    { id: 'accessibility', name: 'Accessibility', icon: Cog6ToothIcon }
  ];

  const filteredCommands = selectedCategory === 'all' 
    ? commands 
    : commands.filter(cmd => cmd.category === selectedCategory);

  const handleVoiceCommand = () => {
    if (isListening) {
      stopListening();
      setIsListening(false);
    } else {
      startListening();
      setIsListening(true);
    }
  };

  const executeCommand = (command: Command) => {
    onExecuteCommand(command);
    setVoiceCommand('');
    resetTranscript();
  };

  const getCommandIcon = (category: string) => {
    switch (category) {
      case 'navigation': return <ChatBubbleLeftRightIcon className="w-5 h-5" />;
      case 'academic': return <AcademicCapIcon className="w-5 h-5" />;
      case 'reminder': return <BellIcon className="w-5 h-5" />;
      case 'accessibility': return <Cog6ToothIcon className="w-5 h-5" />;
      default: return <CommandLineIcon className="w-5 h-5" />;
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="bg-primary-600 text-white p-4 rounded-t-lg">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center">
            <CommandLineIcon className="w-6 h-6 mr-2" />
            Voice Commands
          </h2>
        </div>
      </div>

      {/* Voice Command Input */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          {speechSupported && (
            <button
              onClick={handleVoiceCommand}
              className={`voice-button ${isListening ? 'active' : 'inactive'}`}
              aria-label={isListening ? 'Stop voice command' : 'Start voice command'}
            >
              <MicrophoneIcon className="w-5 h-5" />
            </button>
          )}
          
          <input
            type="text"
            value={voiceCommand || transcript}
            onChange={(e) => setVoiceCommand(e.target.value)}
            placeholder={isListening ? 'Listening for commands...' : 'Type or speak a command...'}
            className="flex-1 input-field"
            disabled={isListening}
          />
          
          <button
            onClick={() => {
              const matchedCommand = findMatchingCommand(voiceCommand);
              if (matchedCommand) {
                executeCommand(matchedCommand);
              }
            }}
            disabled={!voiceCommand.trim()}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Execute
          </button>
        </div>
        
        {isListening && (
          <div className="mt-2 text-sm text-gray-600">
            <span className="inline-flex items-center">
              <span className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></span>
              Listening for commands...
            </span>
          </div>
        )}
      </div>

      {/* Category Filter */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{category.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Commands List */}
      <div className="p-4 max-h-96 overflow-y-auto">
        <div className="grid gap-3">
          {filteredCommands.map((command) => (
            <div
              key={command.id}
              className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => executeCommand(command)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-primary-100 text-primary-600 rounded-lg">
                    {getCommandIcon(command.category)}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      {command.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {command.description}
                    </p>
                    <div className="mt-2">
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                        Say: "{command.voiceTrigger}"
                      </span>
                    </div>
                  </div>
                </div>
                
                <button
                  className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                  aria-label={`Execute ${command.name}`}
                >
                  <CommandLineIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {filteredCommands.length === 0 && (
          <div className="text-center py-8">
            <CommandLineIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No commands found in this category</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-2">
          <button className="flex items-center space-x-2 p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm">
            <CalendarIcon className="w-4 h-4 text-primary-600" />
            <span>View Schedule</span>
          </button>
          <button className="flex items-center space-x-2 p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm">
            <DocumentTextIcon className="w-4 h-4 text-primary-600" />
            <span>Assignments</span>
          </button>
          <button className="flex items-center space-x-2 p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm">
            <UserGroupIcon className="w-4 h-4 text-primary-600" />
            <span>Study Groups</span>
          </button>
          <button className="flex items-center space-x-2 p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm">
            <BellIcon className="w-4 h-4 text-primary-600" />
            <span>Reminders</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommandPanel;
