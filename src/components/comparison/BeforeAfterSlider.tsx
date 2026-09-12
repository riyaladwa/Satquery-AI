import React, { useState, useRef, useCallback } from 'react';
import { resolveAssetUrl } from '../../services/api';
import { Eye, EyeOff, Layers, Zap } from 'lucide-react';

interface BeforeAfterSliderProps {
  imageAUrl: string;
  imageBUrl: string;
  labelA?: string;
  labelB?: string;
  showHeatmap?: boolean;
  sliderPosition?: number;
  onSliderChange?: (val: number) => void;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  imageAUrl,
  imageBUrl,
  labelA = 'Baseline (2023)',
  labelB = 'Target (2026)',
  showHeatmap = false,
  sliderPosition: controlledPos,
  onSliderChange
}) => {
  const [internalPos, setInternalPos] = useState(50);
  const [isBlinking, setIsBlinking] = useState(false);
  const [blinkShowA, setBlinkShowA] = useState(false);
  const blinkIntervalRef = useRef<any>(null);

  const sliderPos = controlledPos !== undefined ? controlledPos : internalPos;

  const updatePos = useCallback((val: number) => {
    const clamped = Math.max(0, Math.min(100, val));
    if (onSliderChange) {
      onSliderChange(clamped);
    } else {
      setInternalPos(clamped);
    }
  }, [onSliderChange]);

  // Toggle blinking / flickering to spot differences like real GIS analysts
  const handleToggleBlink = () => {
    if (isBlinking) {
      clearInterval(blinkIntervalRef.current);
      setIsBlinking(false);
      setBlinkShowA(false);
    } else {
      setIsBlinking(true);
      blinkIntervalRef.current = setInterval(() => {
        setBlinkShowA((prev) => !prev);
      }, 600);
    }
  };

  const resolvedA = resolveAssetUrl(imageAUrl);
  const resolvedB = resolveAssetUrl(imageBUrl);

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-[#080B10] rounded-xl border border-[#283541] shadow-2xl group">
      {/* 1. Base Layer (Image B / After / Target) */}
      <img
        src={resolvedB}
        alt={labelB}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-150"
        style={{
          opacity: isBlinking && blinkShowA ? 0 : 1
        }}
      />

      {/* 2. Clipped Foreground Layer (Image A / Before / Baseline) with 100% pixel alignment */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        style={{
          clipPath: isBlinking
            ? blinkShowA
              ? 'polygon(0 0, 100% 0, 100% 100%, 0 100%)'
              : 'polygon(0 0, 0 0, 0 100%, 0 100%)'
            : `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)`
        }}
      >
        <img
          src={resolvedA}
          alt={labelA}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />
      </div>

      {/* 3. AI Change Heatmap Overlay (when toggled ON) */}
      {showHeatmap && (
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300 z-10 mix-blend-screen"
          style={{
            background: 'radial-gradient(ellipse at 65% 45%, rgba(225,29,72,0.65) 0%, rgba(245,158,11,0.4) 40%, rgba(56,217,209,0.15) 70%, transparent 85%)'
          }}
        >
          {/* Animated hotspot markers */}
          <div className="absolute top-[42%] left-[62%] w-16 h-16 rounded-full border-2 border-red-500/80 bg-red-500/30 animate-ping pointer-events-none" />
          <div className="absolute top-[32%] left-[55%] px-2 py-0.5 rounded bg-red-600/90 text-white font-mono text-[10px] font-bold shadow-lg">
            +34% Built-up Delta
          </div>
          <div className="absolute top-[65%] left-[70%] px-2 py-0.5 rounded bg-amber-500/90 text-white font-mono text-[10px] font-bold shadow-lg">
            +18% Road Infill
          </div>
        </div>
      )}

      {/* 4. Draggable Divider Line & Handle */}
      {!isBlinking && (
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-[#38D9D1] shadow-[0_0_12px_rgba(56,217,209,0.8)] cursor-ew-resize z-20 transition-all duration-75"
          style={{ left: `${sliderPos}%` }}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#121A22] border-2 border-[#38D9D1] text-[#38D9D1] flex items-center justify-center text-xs font-bold shadow-lg shadow-cyan-500/30 hover:scale-110 active:scale-95 transition-transform">
            ⇄
          </div>
        </div>
      )}

      {/* 5. Invisible Full-size Range Slider Controller */}
      {!isBlinking && (
        <input
          type="range"
          min="0"
          max="100"
          value={sliderPos}
          onChange={(e) => updatePos(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30 m-0 p-0"
          aria-label="Before/After swipe comparison slider"
        />
      )}

      {/* 6. High-Contrast Informative Corner Badges */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-2 bg-[#0D1117]/85 backdrop-blur-md border border-[#283541] px-2.5 py-1 rounded-lg text-xs font-semibold text-[#F5F7FA] shadow-md pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-[#38D9D1]" />
        <span>{labelA}</span>
      </div>

      <div className="absolute top-3 right-3 z-20 flex items-center gap-2 bg-[#0D1117]/85 backdrop-blur-md border border-[#283541] px-2.5 py-1 rounded-lg text-xs font-semibold text-[#38D9D1] shadow-md pointer-events-none">
        <span>{labelB}</span>
        <span className="w-2 h-2 rounded-full bg-[#E11D48]" />
      </div>

      {/* 7. Bottom Quick Controls Floating Bar */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 bg-[#0D1117]/90 backdrop-blur-md border border-[#283541] rounded-lg px-2.5 py-1 flex items-center gap-2 shadow-xl text-[11px] font-mono">
        <button
          type="button"
          onClick={() => updatePos(25)}
          className={`px-2 py-0.5 rounded transition ${sliderPos === 25 ? 'bg-[#38D9D1] text-[#080B10] font-bold' : 'text-[#9AA6B2] hover:text-[#F5F7FA]'}`}
        >
          25%
        </button>
        <button
          type="button"
          onClick={() => updatePos(50)}
          className={`px-2 py-0.5 rounded transition ${sliderPos === 50 ? 'bg-[#38D9D1] text-[#080B10] font-bold' : 'text-[#9AA6B2] hover:text-[#F5F7FA]'}`}
        >
          50%
        </button>
        <button
          type="button"
          onClick={() => updatePos(75)}
          className={`px-2 py-0.5 rounded transition ${sliderPos === 75 ? 'bg-[#38D9D1] text-[#080B10] font-bold' : 'text-[#9AA6B2] hover:text-[#F5F7FA]'}`}
        >
          75%
        </button>
        <span className="text-[#283541]">|</span>
        <button
          type="button"
          onClick={handleToggleBlink}
          className={`px-2.5 py-0.5 rounded flex items-center gap-1 font-bold transition cursor-pointer ${
            isBlinking ? 'bg-amber-500 text-[#080B10] animate-pulse' : 'text-[#38D9D1] hover:bg-[#38D9D1]/10'
          }`}
          title="Rapidly toggle between Before and After scenes to spot differences visually"
        >
          <Zap className="w-3 h-3" />
          <span>{isBlinking ? 'Stop Blink' : 'Auto Blink'}</span>
        </button>
      </div>
    </div>
  );
};
