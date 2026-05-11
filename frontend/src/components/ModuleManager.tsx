import React, { useState, useEffect } from 'react';
import { 
  BookOpenIcon, 
  PlusIcon, 
  TrashIcon, 
  SpeakerWaveIcon, 
  SpeakerXMarkIcon,
  DocumentTextIcon,
  XMarkIcon,
  PauseIcon,
  PlayIcon
} from '@heroicons/react/24/outline';
import { Module } from '../types';
import { useTextToSpeech } from '../hooks/useTextToSpeech';

interface ModuleManagerProps {
  modules: Module[];
  onAddModule: (module: Omit<Module, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateModule: (id: string, module: Partial<Module>) => void;
  onDeleteModule: (id: string) => void;
  isAdmin: boolean;
  settings: {
    voiceSpeed: number;
    autoSpeak: boolean;
  };
  className?: string;
}

const ModuleManager: React.FC<ModuleManagerProps> = ({
  modules,
  onAddModule,
  onUpdateModule,
  onDeleteModule,
  isAdmin,
  settings,
  className = ''
}) => {
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [readingTimer, setReadingTimer] = useState<NodeJS.Timeout | null>(null);
  const [newModule, setNewModule] = useState({
    title: '',
    description: '',
    content: '',
    category: 'General',
    order: 0,
    isActive: true,
    voiceEnabled: true
  });

  const { speak, stop, isSupported } = useTextToSpeech();

  useEffect(() => {
    if (selectedModule && settings.autoSpeak) {
      const announcement = `Now viewing module: ${selectedModule.title}. ${selectedModule.description}`;
      speak(announcement, { rate: settings.voiceSpeed });
    }
  }, [selectedModule, settings.autoSpeak, settings.voiceSpeed, speak]);

  const handleAddModule = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newModule.title.trim() || !newModule.content.trim()) return;

    onAddModule({
      ...newModule,
      title: newModule.title.trim(),
      description: newModule.description.trim(),
      content: newModule.content.trim(),
      category: newModule.category.trim(),
      order: modules.length
    });

    setNewModule({
      title: '',
      description: '',
      content: '',
      category: 'General',
      order: 0,
      isActive: true,
      voiceEnabled: true
    });
    setShowAddForm(false);

    if (settings.autoSpeak) {
      speak(`Module "${newModule.title}" has been added successfully.`, { rate: settings.voiceSpeed });
    }
  };

  const handleReadModule = (module: Module) => {
    if (!isSupported) return;
    
    // Clear any existing timer
    if (readingTimer) {
      clearTimeout(readingTimer);
      setReadingTimer(null);
    }
    
    setIsReading(true);
    setReadingProgress(0);
    
    const fullText = `${module.title}. ${module.description}. ${module.content}`;
    const words = fullText.split(' ');
    const wordsPerMinute = settings.voiceSpeed * 150; // Base speed adjusted by user setting
    const totalReadingTime = (words.length / wordsPerMinute) * 60 * 1000; // in milliseconds
    
    // Start reading
    speak(fullText, { 
      rate: settings.voiceSpeed
    });
    
    // Update progress periodically
    const progressInterval = setInterval(() => {
      setReadingProgress(prev => {
        const newProgress = Math.min(prev + 10, 95); // Increment by 10%
        return newProgress;
      });
    }, totalReadingTime / 10);
    
    // Set timer to stop reading
    const timer = setTimeout(() => {
      setIsReading(false);
      setReadingProgress(100);
      clearInterval(progressInterval);
      setReadingTimer(null);
    }, totalReadingTime);
    
    setReadingTimer(timer);
  };

  const handleStopReading = () => {
    stop();
    setIsReading(false);
    setReadingProgress(0);
    
    // Clear any existing timer
    if (readingTimer) {
      clearTimeout(readingTimer);
      setReadingTimer(null);
    }
  };

  const handlePauseReading = () => {
    if (isReading) {
      stop();
      setIsReading(false);
      if (readingTimer) {
        clearTimeout(readingTimer);
        setReadingTimer(null);
      }
    } else if (selectedModule) {
      // Resume reading from current position
      handleReadModule(selectedModule);
    }
  };

  const handleSpeedChange = (newSpeed: number) => {
    // If currently reading, restart with new speed
    if (isReading && selectedModule) {
      handleStopReading();
      setTimeout(() => {
        // Update settings would need to be passed from parent
        handleReadModule(selectedModule);
      }, 100);
    }
  };

  const handleToggleVoice = (moduleId: string) => {
    const module = modules.find(m => m.id === moduleId);
    if (module) {
      onUpdateModule(moduleId, { voiceEnabled: !module.voiceEnabled });
      const status = !module.voiceEnabled ? 'enabled' : 'disabled';
      speak(`Voice reading ${status} for module "${module.title}"`, { rate: settings.voiceSpeed });
    }
  };

  const categories = Array.from(new Set(modules.map(m => m.category)));

  const activeModules = modules.filter(m => m.isActive).sort((a, b) => a.order - b.order);

  return (
    <div className={`glass-card ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-6 rounded-t-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center">
            <BookOpenIcon className="w-8 h-8 mr-3" />
            Learning Modules
          </h2>
          <div className="flex items-center space-x-3">
            {isAdmin && (
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="p-3 bg-white/20 backdrop-blur hover:bg-white/30 rounded-full transition-all duration-300 transform hover:scale-110"
                aria-label="Add new module"
              >
                <PlusIcon className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Add Module Form */}
      {showAddForm && isAdmin && (
        <div className="p-6 border-b-2 border-gray-200 bg-gray-50">
          <form onSubmit={handleAddModule} className="space-y-4">
            <div>
              <label className="block text-lg font-semibold text-gray-800 mb-2">
                Module Title *
              </label>
              <input
                type="text"
                value={newModule.title}
                onChange={(e) => setNewModule({...newModule, title: e.target.value})}
                className="input-field text-lg"
                placeholder="e.g., Introduction to Computer Science"
                required
              />
            </div>

            <div>
              <label className="block text-lg font-semibold text-gray-800 mb-2">
                Description
              </label>
              <textarea
                value={newModule.description}
                onChange={(e) => setNewModule({...newModule, description: e.target.value})}
                className="input-field text-lg"
                rows={2}
                placeholder="Brief description of the module content"
              />
            </div>

            <div>
              <label className="block text-lg font-semibold text-gray-800 mb-2">
                Content *
              </label>
              <textarea
                value={newModule.content}
                onChange={(e) => setNewModule({...newModule, content: e.target.value})}
                className="input-field text-lg"
                rows={6}
                placeholder="Full module content that will be read aloud..."
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-lg font-semibold text-gray-800 mb-2">
                  Category
                </label>
                <input
                  type="text"
                  value={newModule.category}
                  onChange={(e) => setNewModule({...newModule, category: e.target.value})}
                  className="input-field text-lg"
                  placeholder="e.g., Mathematics, Science, etc."
                />
              </div>

              <div className="flex items-center space-x-4 pt-6">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newModule.voiceEnabled}
                    onChange={(e) => setNewModule({...newModule, voiceEnabled: e.target.checked})}
                    className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                  />
                  <span className="text-lg font-medium text-gray-700">Voice Enabled</span>
                </label>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="btn-primary text-lg font-semibold"
              >
                Add Module
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-colors text-lg"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Module Content */}
      <div className="p-6">
        {selectedModule ? (
          <div className="space-y-6">
            {/* Module Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{selectedModule.title}</h3>
                <p className="text-gray-600 mt-2">{selectedModule.description}</p>
                <span className="inline-block mt-2 px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium">
                  {selectedModule.category}
                </span>
                
                {/* Reading Progress */}
                {isReading && (
                  <div className="mt-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-gray-600">Reading Progress:</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${readingProgress}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600">{readingProgress}%</span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                {selectedModule.voiceEnabled && (
                  <>
                    {/* Play/Pause Button */}
                    <button
                      onClick={handlePauseReading}
                      className={`p-3 rounded-full transition-all duration-300 transform hover:scale-110 ${
                        isReading 
                          ? 'bg-yellow-500 text-white hover:bg-yellow-600' 
                          : 'bg-primary-600 text-white hover:bg-primary-700'
                      }`}
                      aria-label={isReading ? 'Pause reading' : 'Resume reading'}
                    >
                      {isReading ? (
                        <PauseIcon className="w-6 h-6" />
                      ) : (
                        <PlayIcon className="w-6 h-6" />
                      )}
                    </button>
                    
                    {/* Stop Button */}
                    <button
                      onClick={handleStopReading}
                      className="p-3 bg-red-500 text-white rounded-full transition-all duration-300 transform hover:scale-110 hover:bg-red-600"
                      aria-label="Stop reading"
                    >
                      <SpeakerXMarkIcon className="w-6 h-6" />
                    </button>
                  </>
                )}
                
                {/* Speed Control */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Speed:</span>
                  <button
                    onClick={() => handleSpeedChange(Math.max(0.5, settings.voiceSpeed - 0.2))}
                    className="p-2 bg-gray-200 hover:bg-gray-300 rounded-full transition-colors"
                    aria-label="Decrease speed"
                  >
                    <span className="text-xs">-</span>
                  </button>
                  <span className="text-sm font-medium w-8 text-center">{settings.voiceSpeed.toFixed(1)}x</span>
                  <button
                    onClick={() => handleSpeedChange(Math.min(2.0, settings.voiceSpeed + 0.2))}
                    className="p-2 bg-gray-200 hover:bg-gray-300 rounded-full transition-colors"
                    aria-label="Increase speed"
                  >
                    <span className="text-xs">+</span>
                  </button>
                </div>
                
                <button
                  onClick={() => setSelectedModule(null)}
                  className="p-3 bg-gray-200 hover:bg-gray-300 rounded-full transition-all duration-300 transform hover:scale-110"
                  aria-label="Back to modules"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Module Content */}
            <div className="prose prose-lg max-w-none">
              <div className="bg-white/50 backdrop-blur rounded-xl p-6 border border-gray-200">
                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {selectedModule.content}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div>
            {/* Categories */}
            {categories.length > 1 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {categories.map(category => (
                    <button
                      key={category}
                      className="px-4 py-2 bg-primary-100 text-primary-800 rounded-lg hover:bg-primary-200 transition-colors font-medium"
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Module List */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900">Available Modules</h3>
              
              {activeModules.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpenIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No modules available</p>
                  {isAdmin && (
                    <button
                      onClick={() => setShowAddForm(true)}
                      className="mt-4 btn-primary"
                    >
                      Add First Module
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid gap-4">
                  {activeModules.map((module) => (
                    <div
                      key={module.id}
                      className="bg-white/70 backdrop-blur rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-[1.02]"
                      onClick={() => setSelectedModule(module)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <DocumentTextIcon className="w-6 h-6 text-primary-600" />
                            <h4 className="text-lg font-semibold text-gray-900">{module.title}</h4>
                            {module.voiceEnabled && (
                              <SpeakerWaveIcon className="w-5 h-5 text-green-600" />
                            )}
                          </div>
                          <p className="text-gray-600 mt-2 line-clamp-2">{module.description}</p>
                          <div className="flex items-center space-x-4 mt-3">
                            <span className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                              {module.category}
                            </span>
                            <span className="text-sm text-gray-500">
                              Click to open • {module.content.length} characters
                            </span>
                          </div>
                        </div>
                        
                        {isAdmin && (
                          <div className="flex items-center space-x-2 ml-4">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleVoice(module.id);
                              }}
                              className={`p-2 rounded-full transition-colors ${
                                module.voiceEnabled 
                                  ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                              aria-label={module.voiceEnabled ? 'Disable voice' : 'Enable voice'}
                            >
                              <SpeakerWaveIcon className="w-4 h-4" />
                            </button>
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteModule(module.id);
                              }}
                              className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"
                              aria-label="Delete module"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModuleManager;
