import React, { useState, useEffect } from 'react';
import { Volume2, Pause, Square, Play } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface VoiceOutputProps {
  text: string;
}

export const VoiceOutput: React.FC<VoiceOutputProps> = ({ text }) => {
  const { i18n } = useTranslation();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handlePlay = () => {
    if (!('speechSynthesis' in window)) return;

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPlaying(true);
      setIsPaused(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);

    // Map language
    if (i18n.language === 'hi') {
      utterance.lang = 'hi-IN';
    } else if (i18n.language === 'kn') {
      utterance.lang = 'kn-IN';
    } else {
      utterance.lang = 'en-US';
    }

    utterance.rate = 1.0;

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    if ('speechSynthesis' in window && isPlaying) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsPlaying(false);
    }
  };

  const handleStop = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setIsPaused(false);
    }
  };

  return (
    <div className="flex items-center gap-1 bg-gis-bg border border-gis-border rounded px-1.5 py-0.5 text-xs text-gis-textMuted">
      {!isPlaying ? (
        <button
          onClick={handlePlay}
          className="flex items-center gap-1 hover:text-gis-accent transition px-1 py-0.5"
          title="Play Voice Audio"
        >
          <Volume2 className="w-3.5 h-3.5 text-gis-accent" />
          <span className="text-[11px] font-medium">{isPaused ? 'Resume' : 'Listen'}</span>
        </button>
      ) : (
        <>
          <button
            onClick={handlePause}
            className="p-1 hover:text-gis-warning transition"
            title="Pause Voice"
          >
            <Pause className="w-3 h-3 text-gis-warning" />
          </button>
          <button
            onClick={handleStop}
            className="p-1 hover:text-gis-danger transition"
            title="Stop Voice"
          >
            <Square className="w-3 h-3 text-gis-danger" />
          </button>
        </>
      )}
    </div>
  );
};
