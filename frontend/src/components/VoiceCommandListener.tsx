import React, { useEffect, useRef } from 'react';
import { useVoiceInteraction } from '../contexts/VoiceInteractionContext';
import { useTextToSpeech } from '../hooks/useTextToSpeech';

const getRecognition = (): any | null => {
  const w = window as any;
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
};

// Always-on listener for the literal commands: "start" and "stop".
// - "start": enables voice interaction (TTS + STT features in-app)
// - "stop": disables voice interaction and stops any ongoing speech
const VoiceCommandListener: React.FC = () => {
  const { enabled, enable, disable } = useVoiceInteraction();
  const { speak, stop } = useTextToSpeech();
  const recognitionRef = useRef<any>(null);
  const lastFiredAtRef = useRef<number>(0);

  useEffect(() => {
    const Recognition = getRecognition();
    if (!Recognition) return;

    const recognition = new Recognition();
    recognitionRef.current = recognition;

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    const maybeFire = (cmd: 'start' | 'stop') => {
      const now = Date.now();
      // prevent rapid duplicate triggers
      if (now - lastFiredAtRef.current < 1200) return;
      lastFiredAtRef.current = now;

      if (cmd === 'stop') {
        stop();
        disable();
        return;
      }

      // cmd === 'start'
      enable();
      // Speak confirmation (will be allowed after enabling)
      speak('Voice interaction enabled.', { rate: 0.95, lang: 'en' });
    };

    recognition.onresult = (event: any) => {
      let combined = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        combined += `${event.results[i][0].transcript} `;
      }

      const text = combined.trim().toLowerCase();
      if (!text) return;

      // If disabled, only allow "start" to re-enable.
      if (!enabled) {
        if (text.includes('start')) maybeFire('start');
        return;
      }

      if (text.includes('stop')) maybeFire('stop');
      else if (text.includes('start')) maybeFire('start');
    };

    recognition.onerror = () => {
      // Try to restart after transient errors
      try {
        recognition.stop();
      } catch {}
    };

    recognition.onend = () => {
      // Keep it alive
      try {
        recognition.start();
      } catch {}
    };

    try {
      recognition.start();
    } catch {}

    return () => {
      try {
        recognition.onresult = null;
        recognition.onerror = null;
        recognition.onend = null;
        recognition.stop();
      } catch {}
    };
  }, [disable, enable, enabled, speak, stop]);

  return null;
};

export default VoiceCommandListener;

