import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

interface VoiceAudioPlayerProps {
  textToSpeak: string;
  className?: string;
  langCode?: string;
}

export const VoiceAudioPlayer: React.FC<VoiceAudioPlayerProps> = ({
  textToSpeak,
  className = '',
  langCode
}) => {
  const {
    language,
    currentLanguageOption,
    languages,
    speechStatus,
    speak,
    pauseSpeech,
    resumeSpeech,
    replaySpeech
  } = useLanguage();

  const activeLang = langCode || language;
  const activeLangOption = languages.find((l) => l.code === activeLang) || currentLanguageOption;

  const handlePlayToggle = () => {
    if (speechStatus === 'playing') {
      pauseSpeech();
    } else if (speechStatus === 'paused') {
      resumeSpeech();
    } else {
      speak(textToSpeak, activeLang);
    }
  };

  const handleReplay = (e: React.MouseEvent) => {
    e.stopPropagation();
    speak(textToSpeak, activeLang);
  };

  return (
    <div
      className={`inline-flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50 text-xs font-semibold text-emerald-900 shadow-2xs transition-all ${className}`}
    >
      <button
        onClick={handlePlayToggle}
        className="flex items-center gap-1.5 font-bold text-emerald-800 hover:text-emerald-950 focus:outline-hidden transition-colors cursor-pointer"
        title={speechStatus === 'playing' ? 'Pause voice answer' : 'Play voice answer'}
        type="button"
      >
        {speechStatus === 'playing' ? (
          <>
            <svg className="w-4 h-4 fill-current text-emerald-700" viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
            <span>Pause Voice</span>
          </>
        ) : speechStatus === 'paused' ? (
          <>
            <svg className="w-4 h-4 fill-current text-emerald-700" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            <span>Resume Voice</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4 fill-current text-emerald-700" viewBox="0 0 24 24">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
            </svg>
            <span>Play Voice Answer</span>
          </>
        )}
      </button>

      {/* Pulsing audio activity indicator */}
      {speechStatus === 'playing' && (
        <div className="flex items-center gap-0.5 px-1 py-0.5 bg-emerald-100 rounded">
          <span className="w-1 h-3 bg-emerald-700 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
          <span className="w-1 h-4 bg-emerald-700 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
          <span className="w-1 h-2 bg-emerald-700 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
          <span className="w-1 h-3.5 bg-emerald-700 rounded-full animate-pulse" style={{ animationDelay: '100ms' }} />
        </div>
      )}

      {/* Replay button if active or paused */}
      {(speechStatus === 'playing' || speechStatus === 'paused') && (
        <button
          onClick={handleReplay}
          className="p-1 text-emerald-700 hover:text-emerald-950 focus:outline-hidden transition-colors cursor-pointer"
          title="Replay from start"
          type="button"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      )}

      <span className="text-[11px] font-bold text-emerald-900 border-l border-emerald-300 pl-2">
        {activeLangOption.nativeName}
      </span>
    </div>
  );
};
