import React, { useEffect, useState } from 'react';
import { useTextToSpeech } from '../hooks/useTextToSpeech';

interface VoiceAnnouncerProps {
  children: React.ReactNode;
  announcements?: string[];
  settings: {
    autoSpeak: boolean;
    voiceSpeed: number;
    screenReader: boolean;
  };
}

const VoiceAnnouncer: React.FC<VoiceAnnouncerProps> = ({
  children,
  announcements = [],
  settings
}) => {
  const { speak, isSupported } = useTextToSpeech();
  const [lastAnnouncement, setLastAnnouncement] = useState('');

  useEffect(() => {
    if (announcements.length > 0 && announcements[announcements.length - 1] !== lastAnnouncement) {
      const newAnnouncement = announcements[announcements.length - 1];
      setLastAnnouncement(newAnnouncement);
      
      if (settings.autoSpeak && isSupported) {
        speak(newAnnouncement, { rate: settings.voiceSpeed });
      }
    }
  }, [announcements, lastAnnouncement, settings.autoSpeak, settings.voiceSpeed, speak, isSupported]);

  // Screen reader announcements
  useEffect(() => {
    if (settings.screenReader && lastAnnouncement) {
      // Create a live region for screen readers
      const liveRegion = document.createElement('div');
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.className = 'sr-only';
      liveRegion.textContent = lastAnnouncement;
      document.body.appendChild(liveRegion);
      
      setTimeout(() => {
        document.body.removeChild(liveRegion);
      }, 1000);
    }
  }, [lastAnnouncement, settings.screenReader]);

  return (
    <>
      {children}
      {/* Hidden live region for screen readers */}
      <div 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only"
        id="voice-announcer"
      >
        {lastAnnouncement}
      </div>
    </>
  );
};

export default VoiceAnnouncer;
