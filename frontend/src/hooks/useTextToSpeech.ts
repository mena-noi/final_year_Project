import { useState, useCallback, useRef } from 'react';
import i18n from '../i18n';
import { useVoiceInteraction } from '../contexts/VoiceInteractionContext';

export const useTextToSpeech = () => {
  const { enabled } = useVoiceInteraction();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const loadVoices = useCallback(() => {
    const availableVoices = window.speechSynthesis.getVoices();
    setVoices(availableVoices);
  }, []);

  const speak = useCallback(async (text: string, options?: {
    rate?: number;
    pitch?: number;
    volume?: number;
    voice?: SpeechSynthesisVoice;
    lang?: 'en' | 'am' | 'or';
  }) => {
    if (!enabled) return;
    const lang = options?.lang || (i18n.language as any) || 'en';

    // Stop any currently playing audio/utterances
    window.speechSynthesis?.cancel?.();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }

    // For Amharic + Oromo, prefer server TTS (MMS) for consistent support.
    if (lang === 'am' || lang === 'or') {
      try {
        setIsSpeaking(true);
        setIsPaused(false);

        const resp = await fetch('http://localhost:3000/api/tts/speak', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, lang })
        });

        if (!resp.ok) {
          const err = await resp.json().catch(() => null);
          throw new Error(err?.error || `TTS failed (${resp.status})`);
        }

        const blob = await resp.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audioRef.current = audio;

        audio.onended = () => {
          URL.revokeObjectURL(url);
          setIsSpeaking(false);
          setIsPaused(false);
        };
        audio.onerror = () => {
          URL.revokeObjectURL(url);
          setIsSpeaking(false);
          setIsPaused(false);
        };

        await audio.play();
        return;
      } catch (e) {
        console.error('Server TTS failed, falling back to browser TTS:', e);
        setIsSpeaking(false);
        setIsPaused(false);
        // fall through to browser TTS
      }
    }

    if (!('speechSynthesis' in window)) {
      console.error('Text-to-speech is not supported in this browser.');
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    utterance.rate = options?.rate || 1;
    utterance.pitch = options?.pitch || 1;
    utterance.volume = options?.volume || 1;
    
    if (options?.voice) {
      utterance.voice = options.voice;
    } else {
      const preferredVoice = voices.find(voice => 
        voice.lang.includes('en') && voice.name.includes('Female')
      ) || voices[0];
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsSpeaking(false);
      setIsPaused(false);
    };

    speechRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [enabled, voices]);

  const pause = useCallback(() => {
    if (audioRef.current && !audioRef.current.paused && !isPaused) {
      audioRef.current.pause();
      setIsPaused(true);
      return;
    }
    if (window.speechSynthesis.speaking && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  }, [isPaused]);

  const resume = useCallback(() => {
    if (audioRef.current && audioRef.current.paused) {
      audioRef.current.play().catch(() => undefined);
      setIsPaused(false);
      return;
    }
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  }, []);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
    setIsSpeaking(false);
    setIsPaused(false);
  }, []);

  const getPreferredVoice = useCallback(() => {
    return voices.find(voice => 
      voice.lang.includes('en') && voice.name.includes('Female')
    ) || voices[0];
  }, [voices]);

  return {
    isSpeaking,
    isPaused,
    voices,
    speak,
    pause,
    resume,
    stop,
    loadVoices,
    getPreferredVoice,
    isSupported: 'speechSynthesis' in window
  };
};
