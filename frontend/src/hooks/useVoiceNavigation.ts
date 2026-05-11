import { useCallback, useEffect } from 'react';
import { useTextToSpeech } from './useTextToSpeech';

interface VoiceNavigationOptions {
  onNavigate: (destination: string) => void;
  getCurrentLocation: () => string;
  availableDestinations: string[];
  settings: {
    voiceSpeed: number;
    autoSpeak: boolean;
    voiceNavigation: boolean;
  };
}

export const useVoiceNavigation = ({
  onNavigate,
  getCurrentLocation,
  availableDestinations,
  settings
}: VoiceNavigationOptions) => {
  const { speak } = useTextToSpeech();

  const announceNavigation = useCallback((destination: string) => {
    const message = `Navigating to ${destination}. You are now on the ${destination} screen.`;
    if (settings.autoSpeak && settings.voiceNavigation) {
      speak(message, { rate: settings.voiceSpeed });
    }
  }, [speak, settings.autoSpeak, settings.voiceNavigation, settings.voiceSpeed]);

  const announceCurrentLocation = useCallback(() => {
    const location = getCurrentLocation();
    const message = `You are currently on the ${location} screen. Available destinations: ${availableDestinations.join(', ')}. Say "go to [destination]" to navigate.`;
    if (settings.voiceNavigation) {
      speak(message, { rate: settings.voiceSpeed });
    }
  }, [getCurrentLocation, availableDestinations, speak, settings.voiceNavigation, settings.voiceSpeed]);

  const handleVoiceNavigation = useCallback((command: string) => {
    if (!settings.voiceNavigation) return false;
    
    const lowerCommand = command.toLowerCase();
    
    // Check for navigation commands with various patterns
    const navigationPatterns = [
      'go to',
      'navigate to',
      'open',
      'show',
      'switch to',
      'take me to'
    ];
    
    for (const pattern of navigationPatterns) {
      if (lowerCommand.includes(pattern)) {
        for (const destination of availableDestinations) {
          if (lowerCommand.includes(destination.toLowerCase())) {
            onNavigate(destination);
            announceNavigation(destination);
            return true;
          }
        }
      }
    }
    
    // Handle specific navigation commands
    if (lowerCommand.includes('where am i') || lowerCommand.includes('current location')) {
      announceCurrentLocation();
      return true;
    }
    
    if (lowerCommand.includes('where can i go') || lowerCommand.includes('available destinations')) {
      const destinations = availableDestinations.join(', ');
      speak(`Available destinations: ${destinations}. Say "go to [destination]" to navigate.`, { rate: settings.voiceSpeed });
      return true;
    }
    
    // Handle button navigation
    if (lowerCommand.includes('next button') || lowerCommand.includes('next tab')) {
      const currentIndex = availableDestinations.indexOf(getCurrentLocation());
      const nextIndex = (currentIndex + 1) % availableDestinations.length;
      const nextDestination = availableDestinations[nextIndex];
      onNavigate(nextDestination);
      announceNavigation(nextDestination);
      return true;
    }
    
    if (lowerCommand.includes('previous button') || lowerCommand.includes('previous tab')) {
      const currentIndex = availableDestinations.indexOf(getCurrentLocation());
      const prevIndex = currentIndex === 0 ? availableDestinations.length - 1 : currentIndex - 1;
      const prevDestination = availableDestinations[prevIndex];
      onNavigate(prevDestination);
      announceNavigation(prevDestination);
      return true;
    }
    
    return false;
  }, [availableDestinations, onNavigate, announceNavigation, announceCurrentLocation, speak, settings.voiceSpeed, settings.voiceNavigation, getCurrentLocation]);

  // Announce location changes
  useEffect(() => {
    const location = getCurrentLocation();
    if (settings.autoSpeak && settings.voiceNavigation) {
      setTimeout(() => {
        speak(`Now on the ${location} screen. Say "help" for available commands or "where can I go" for destinations.`, { rate: settings.voiceSpeed });
      }, 500);
    }
  }, [getCurrentLocation, settings.autoSpeak, settings.voiceNavigation, speak, settings.voiceSpeed]);

  return {
    handleVoiceNavigation,
    announceCurrentLocation,
    announceNavigation
  };
};
