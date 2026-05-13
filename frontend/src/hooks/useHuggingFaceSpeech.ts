import { useState, useEffect, useCallback, useRef } from 'react';

interface UseHuggingFaceSpeechReturn {
  isListening: boolean;
  transcript: string;
  isSpeaking: boolean;
  currentLanguage: string;
  supportedLanguages: Array<{code: string; name: string; flag: string; huggingCode: string}>;
  speak: (text: string, language?: string) => void;
  setLanguage: (lang: string) => void;
  isSupported: boolean;
  isLoading: boolean;
  error: string | null;
}

const LANGUAGES = [
  { code: 'en-US', name: 'English', flag: '🇺🇸', huggingCode: 'en' },
  { code: 'am-ET', name: 'Amharic', flag: '🇪🇹', huggingCode: 'am' }
];

const HF_API_KEY = 'hf_xxx'; // Replace with your Hugging Face API key

export const useHuggingFaceSpeech = (): UseHuggingFaceSpeechReturn => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en-US');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);

  // Check browser support for Web Speech API (fallback)
  const isWebSpeechSupported = typeof window !== 'undefined' && 
    (('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) && 
     'speechSynthesis' in window);

  // Initialize speech synthesis
  useEffect(() => {
    if ('speechSynthesis' in window) {
      synthesisRef.current = window.speechSynthesis;
    }
  }, []);

  const synthesizeWithHuggingFace = useCallback(async (text: string, language?: string) => {
    setIsSpeaking(true);
    setError(null);

    try {
      const languageCode = language?.split('-')[0] || currentLanguage.split('-')[0];
      
      // Use Google TTS for Amharic, Hugging Face for other languages
      if (languageCode === 'am') {
        // Google TTS for Amharic
        const response = await fetch(`https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=am&client=tw-ob`, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0'
          }
        });

        if (!response.ok) {
          throw new Error('Google TTS failed');
        }

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        
        const audio = new Audio(audioUrl);
        audio.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
        };
        audio.play();
        
        console.log(`Google TTS (Amharic):`, text);
      } else {
        // Hugging Face Bark for other languages
        const response = await fetch(`https://api-inference.huggingface.co/models/suno/bark`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${HF_API_KEY}`,
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            inputs: text,
            parameters: {
              voice_preset: 'stable'
            }
          })
        });

        if (!response.ok) {
          throw new Error('Speech synthesis failed');
        }

        const result = await response.json();
        
        // Convert audio data to playable format
        const audioData = result[0]?.generated_audio;
        if (!audioData) {
          throw new Error('No audio data received');
        }

        // Convert base64 to binary
        const binaryString = atob(audioData);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        const audioBlob = new Blob([bytes], { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        const audio = new Audio(audioUrl);
        audio.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
        };
        audio.play();
        
        console.log(`Hugging Face Bark (${languageCode}):`, text);
      }
    } catch (err: any) {
      console.error('Speech synthesis error:', err);
      setError(err.message || 'Speech synthesis failed');
      setIsSpeaking(false);
    }
  }, [currentLanguage]);

  const speak = useCallback((text: string, language?: string) => {
    const targetLanguage = language || currentLanguage;
    
    // Use Google TTS for Amharic, Web Speech API for other languages
    if (['am-ET'].includes(targetLanguage)) {
      // Call Google TTS implementation for Amharic
      synthesizeWithHuggingFace(text, targetLanguage);
    } else if (isWebSpeechSupported) {
      // Fallback to Web Speech API for other languages
      if (!synthesisRef.current) return;

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = targetLanguage;
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onstart = () => {
        setIsSpeaking(true);
        console.log(`Speaking ${targetLanguage}:`, text);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
      };

      synthesisRef.current.speak(utterance);
    }
  }, [currentLanguage, isWebSpeechSupported, synthesizeWithHuggingFace]);

  const setLanguage = useCallback((lang: string) => {
    setCurrentLanguage(lang);
  }, []);

  return {
    isListening,
    transcript,
    isSpeaking,
    currentLanguage,
    supportedLanguages: LANGUAGES,
    speak,
    setLanguage,
    isSupported: isWebSpeechSupported,
    isLoading,
    error
  };
};
