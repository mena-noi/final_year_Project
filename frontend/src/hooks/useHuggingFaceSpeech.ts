import { useState, useEffect, useCallback, useRef } from 'react';

interface UseHuggingFaceSpeechReturn {
  isListening: boolean;
  transcript: string;
  isSpeaking: boolean;
  currentLanguage: string;
  supportedLanguages: Array<{code: string; name: string; flag: string; huggingCode: string}>;
  startListening: () => void;
  stopListening: () => void;
  speak: (text: string, language?: string) => void;
  setLanguage: (lang: string) => void;
  isSupported: boolean;
  isLoading: boolean;
  error: string | null;
}

const LANGUAGES = [
  { code: 'en-US', name: 'English', flag: '🇺🇸', huggingCode: 'en' },
  { code: 'am-ET', name: 'Amharic', flag: '🇪🇹', huggingCode: 'am' },
  { code: 'es-ES', name: 'Español', flag: '🇪🇸', huggingCode: 'es' },
  { code: 'fr-FR', name: 'Français', flag: '🇫🇷', huggingCode: 'fr' },
  { code: 'de-DE', name: 'Deutsch', flag: '🇩🇪', huggingCode: 'de' },
  { code: 'zh-CN', name: '中文', flag: '🇨🇳', huggingCode: 'zh' },
  { code: 'hi-IN', name: 'हिंदी', flag: '🇮🇳', huggingCode: 'hi' },
  { code: 'ar-SA', name: 'العربية', flag: '🇸🇦', huggingCode: 'ar' },
  { code: 'ja-JP', name: '日本語', flag: '🇯🇵', huggingCode: 'ja' },
  { code: 'pt-BR', name: 'Português', flag: '🇧🇷', huggingCode: 'pt' }
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

  const speak = useCallback((text: string, language?: string) => {
    const targetLanguage = language || currentLanguage;
    
    // Use Web Speech API for common languages, Hugging Face for Amharic/Afaan
    if (['am-ET', 'om-ET'].includes(targetLanguage)) {
      // For now, use Web Speech API as fallback for Amharic/Afaan
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
  }, [currentLanguage, isWebSpeechSupported]);

  const transcribeWithHuggingFace = useCallback(async (audioBlob: Blob) => {
    setIsLoading(true);
    setError(null);

    try {
      const languageCode = currentLanguage.split('-')[0];
      
      // Use Simba-S for Amharic, Whisper for other languages
      const modelName = languageCode === 'am' ? 'UBC-NLP/Simba-S' : 'openai/whisper-large-v3';
      
      const formData = new FormData();
      formData.append('file', audioBlob);
      formData.append('language', languageCode);

      const response = await fetch(`https://api-inference.huggingface.co/models/${modelName}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HF_API_KEY}`,
          'Accept': 'application/json'
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Transcription failed');
      }

      const result = await response.json();
      const transcribedText = result.text?.[0]?.text || '';
      
      setTranscript(transcribedText);
      console.log(`STT (${currentLanguage}) using ${modelName}:`, transcribedText);
      
      // Speak confirmation in selected language
      if (transcribedText) {
        const confirmationMessages = {
          'am-ET': 'ተር ምኛ ተር',
          'en-US': 'Transcription complete',
          'es-ES': 'Transcripción completa',
          'fr-FR': 'Transcription terminée',
          'de-DE': 'Transkription abgeschlossen',
          'zh-CN': '转录完成',
          'hi-IN': 'ट्रांस्क्रिप्शन पूर्ण',
          'ar-SA': 'اكتمل التسجيل',
          'ja-JP': '文字起こし完了',
          'pt-BR': 'Transcrição concluída'
        };
        
        speak(confirmationMessages[currentLanguage as keyof typeof confirmationMessages] || 'Transcription complete', currentLanguage);
      }
      
      return transcribedText;
    } catch (err: any) {
      console.error('STT error:', err);
      setError(err.message || 'Transcription failed');
    } finally {
      setIsLoading(false);
    }
  }, [currentLanguage, speak]);

  const synthesizeWithHuggingFace = useCallback(async (text: string) => {
    setIsSpeaking(true);
    setError(null);

    try {
      const languageCode = currentLanguage.split('-')[0];
      
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
        const audioBlob = new Blob([result.audio], { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        // Play the synthesized speech
        const audio = new Audio(audioUrl);
        audio.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
        };
        audio.play();
        
        console.log(`Hugging Face synthesis (${currentLanguage}):`, text);
      }
    } catch (err: any) {
      console.error('TTS error:', err);
      setError(err.message || 'Speech synthesis failed');
    } finally {
      setIsSpeaking(false);
    }
  }, [currentLanguage]);

  const startListening = useCallback(() => {
    if (!isWebSpeechSupported) return;
    
    setTranscript('');
    setError(null);
    
    // Request microphone access
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        const mediaRecorder = new MediaRecorder(stream);
        const audioChunks: Blob[] = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunks.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          setIsListening(false);
          const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
          
          // Send to Hugging Face for transcription
          await transcribeWithHuggingFace(audioBlob);
        };

        mediaRecorder.start();
        setIsListening(true);
        console.log(`Recording started in ${currentLanguage}`);
      })
      .catch(err => {
        console.error('Microphone access denied:', err);
        setError('Microphone access denied');
      });
  }, [isWebSpeechSupported, currentLanguage, transcribeWithHuggingFace]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, [isWebSpeechSupported]);

  const setLanguage = useCallback((lang: string) => {
    setCurrentLanguage(lang);
    console.log(`Language changed to:`, lang);
  }, []);

  return {
    isListening,
    transcript,
    isSpeaking,
    currentLanguage,
    supportedLanguages: LANGUAGES,
    startListening,
    stopListening,
    speak,
    setLanguage,
    isSupported: isWebSpeechSupported || true, // Always true since we have Hugging Face fallback
    isLoading,
    error
  };
};
