import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Loader2, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

export const VoiceInput: React.FC<VoiceInputProps> = ({ onTranscript, disabled = false }) => {
  const { i18n } = useTranslation();
  const [state, setState] = useState<'idle' | 'listening' | 'processing' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMsg('Web Speech API not supported in this browser');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    // Set recognition language based on active UI language
    if (i18n.language === 'hi') {
      recognition.lang = 'hi-IN';
    } else if (i18n.language === 'kn') {
      recognition.lang = 'kn-IN';
    } else {
      recognition.lang = 'en-US';
    }

    recognition.onstart = () => {
      setState('listening');
      setErrorMsg(null);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setState('processing');
      onTranscript(transcript);
      setTimeout(() => setState('idle'), 1200);
    };

    recognition.onerror = (event: any) => {
      setState('error');
      setErrorMsg(`Voice input error: ${event.error}`);
      setTimeout(() => setState('idle'), 3000);
    };

    recognition.onend = () => {
      if (state === 'listening') {
        setState('idle');
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [i18n.language, onTranscript]);

  const toggleListening = () => {
    if (disabled) return;
    if (state === 'listening') {
      recognitionRef.current?.stop();
      setState('idle');
    } else {
      try {
        recognitionRef.current?.start();
      } catch (err) {
        console.error('Failed to start speech recognition', err);
      }
    }
  };

  return (
    <div className="relative flex items-center">
      <button
        type="button"
        onClick={toggleListening}
        disabled={disabled}
        className={`p-2 rounded-md transition border flex items-center justify-center ${
          state === 'listening'
            ? 'bg-gis-danger text-white border-gis-danger animate-pulse'
            : state === 'processing'
            ? 'bg-gis-accent text-white border-gis-accent'
            : 'bg-gis-panel border-gis-border text-gis-textMuted hover:text-gis-textBright hover:bg-gis-hover'
        }`}
        title={
          state === 'listening'
            ? 'Listening... Click to stop'
            : `Voice Input (${i18n.language.toUpperCase()})`
        }
      >
        {state === 'listening' ? (
          <Mic className="w-4 h-4 text-white" />
        ) : state === 'processing' ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Mic className="w-4 h-4" />
        )}
      </button>

      {errorMsg && (
        <div className="absolute bottom-full mb-1 right-0 bg-gis-danger text-white text-[10px] px-2 py-1 rounded shadow-gis whitespace-nowrap z-50 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
};
