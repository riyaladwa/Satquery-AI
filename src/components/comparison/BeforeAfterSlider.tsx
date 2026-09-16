import React, { useState, useRef, useCallback, useEffect } from 'react';
import { resolveAssetUrl } from '../../services/api';
import { Zap, Eye, SplitSquareVertical, Columns, Flame } from 'lucide-react';

interface BeforeAfterSliderProps {
  imageAUrl: string;
  imageBUrl: string;
  labelA?: string;
  labelB?: string;
  showHeatmap?: boolean;
  sliderPosition?: number;
  onSliderChange?: (val: number) => void;
  viewMode?: 'slider' | 'side_by_side';
  onViewModeChange?: (mode: 'slider' | 'side_by_side') => void;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  imageAUrl,
  imageBUrl,
  labelA = 'Baseline (2023)',
  labelB = 'Target (2026)',
  showHeatmap = false,
  sliderPosition: controlledPos,
  onSliderChange,
  viewMode: controlledMode,
  onViewModeChange
}) => {
  const [internalPos, setInternalPos] = useState(50);
  const [internalMode, setInternalMode] = useState<'slider' | 'side_by_side'>('slider');
  const [isDragging, setIsDragging] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);
  const [blinkShowA, setBlinkShowA] = useState(false);
  const blinkIntervalRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const sliderPos = controlledPos !== undefined ? controlledPos : internalPos;
  const mode = controlledMode !== undefined ? controlledMode : internalMode;

  const updatePos = useCallback((val: number) => {
    const clamped = Math.max(0, Math.min(100, Math.round(val * 10) / 10));
    if (onSliderChange) {
      onSliderChange(clamped);
    } else {
      setInternalPos(clamped);
    }
  }, [onSliderChange]);

  const setMode = (newMode: 'slider' | 'side_by_side') => {
    if (onViewModeChange) {
      onViewModeChange(newMode);
    } else {
      setInternalMode(newMode);
    }
  };

  // Pointer-based Drag Engine (Eliminates invisible <input> overlay and click interception)
  const calculatePositionFromPointer = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width <= 0) return;
    const rawPos = ((clientX - rect.left) / rect.width) * 100;
    updatePos(rawPos);
  }, [updatePos]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only respond to primary button (left click or single touch)
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    setIsDragging(true);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (err) {
      // Graceful fallback if pointer capture unsupported
    }
    calculatePositionFromPointer(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    e.preventDefault();
    calculatePositionFromPointer(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch (err) {}
    }
  };

  // Toggle blinking / flickering to spot differences visually
  const handleToggleBlink = () => {
    if (isBlinking) {
      if (blinkIntervalRef.current) clearInterval(blinkIntervalRef.current);
      setIsBlinking(false);
      setBlinkShowA(false);
    } else {
      setIsBlinking(true);
      blinkIntervalRef.current = setInterval(() => {
        setBlinkShowA((prev) => !prev);
      }, 500);
    }
  };

  useEffect(() => {
    return () => {
      if (blinkIntervalRef.current) clearInterval(blinkIntervalRef.current);
    };
  }, []);

  const resolvedA = resolveAssetUrl(imageAUrl);
  const resolvedB = resolveAssetUrl(imageBUrl);

  // If user selected Side-by-Side mode, render stable two-column view
  if (mode === 'side_by_side') {
    return (
      <div className="space-y-3 select-none">
        {/* View Mode Toggle Bar */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#17201B]">View Format:</span>
            <div className="inline-flex rounded-lg border border-[#E3EAE5] bg-[#F4F6F5] p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setMode('slider')}
                className="px-2.5 py-1 rounded-md text-xs font-medium text-[#66736B] hover:text-[#17201B] flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <SplitSquareVertical className="w-3.5 h-3.5" />
                <span>Swipe Slider</span>
              </button>
              <button
                type="button"
                onClick={() => setMode('side_by_side')}
                className="px-2.5 py-1 rounded-md text-xs font-bold bg-white text-[#167A4A] shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                <Columns className="w-3.5 h-3.5" />
                <span>Side-by-Side</span>
              </button>
            </div>
          </div>
          <span className="text-xs text-[#66736B]">Side-by-side comparison view (Zero-drag stable mode)</span>
        </div>

        {/* Side-by-Side Viewports */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Baseline Scene (A) */}
          <div className="relative rounded-2xl overflow-hidden border border-[#E3EAE5] bg-[#F4F6F5] shadow-xs group">
            <div className="absolute top-3 left-3 z-20 flex items-center gap-2 bg-white/95 backdrop-blur-md border border-[#E3EAE5] px-3 py-1.5 rounded-lg text-xs font-semibold text-[#17201B] shadow-2xs pointer-events-none">
              <span className="w-2 h-2 rounded-full bg-[#167A4A]" />
              <span>BEFORE: {labelA}</span>
            </div>
            <img
              src={resolvedA}
              alt={labelA}
              className="w-full h-[360px] sm:h-[420px] object-cover"
              loading="eager"
            />
          </div>

          {/* Target Scene (B) with optional heatmap */}
          <div className="relative rounded-2xl overflow-hidden border border-[#E3EAE5] bg-[#F4F6F5] shadow-xs group">
            <div className="absolute top-3 left-3 z-20 flex items-center gap-2 bg-white/95 backdrop-blur-md border border-[#E3EAE5] px-3 py-1.5 rounded-lg text-xs font-semibold text-[#17201B] shadow-2xs pointer-events-none">
              <span className="w-2 h-2 rounded-full bg-[#DC2626]" />
              <span>AFTER: {labelB}</span>
            </div>

            <img
              src={resolvedB}
              alt={labelB}
              className="w-full h-[360px] sm:h-[420px] object-cover"
              loading="eager"
            />

            {/* Heatmap overlay if enabled */}
            {showHeatmap && (
              <div
                className="absolute inset-0 pointer-events-none transition-opacity duration-300 z-10 mix-blend-multiply"
                style={{
                  background: 'radial-gradient(ellipse at 65% 45%, rgba(220,38,38,0.55) 0%, rgba(245,158,11,0.35) 40%, rgba(22,122,74,0.1) 70%, transparent 85%)'
                }}
              >
                <div className="absolute top-[32%] left-[55%] px-2.5 py-1 rounded-md bg-red-600 text-white font-mono text-[10px] font-bold shadow-md">
                  +34% Difference
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Interactive Swipe Slider Mode
  return (
    <div className="space-y-2 select-none">
      {/* View Mode Toggle Bar above the canvas */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#17201B]">View Format:</span>
          <div className="inline-flex rounded-lg border border-[#E3EAE5] bg-[#F4F6F5] p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setMode('slider')}
              className="px-2.5 py-1 rounded-md text-xs font-bold bg-white text-[#167A4A] shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <SplitSquareVertical className="w-3.5 h-3.5" />
              <span>Swipe Slider</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('side_by_side')}
              className="px-2.5 py-1 rounded-md text-xs font-medium text-[#66736B] hover:text-[#17201B] flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Side-by-Side</span>
            </button>
          </div>
        </div>
        <span className="text-xs text-[#66736B] hidden sm:inline">
          Drag anywhere or use percentage presets below
        </span>
      </div>

      {/* Main Interactive Slider Canvas */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`relative w-full h-[400px] sm:h-[480px] lg:h-[520px] overflow-hidden rounded-2xl border border-[#E3EAE5] bg-[#F4F6F5] shadow-xs cursor-ew-resize touch-none ${
          isDragging ? 'ring-2 ring-[#167A4A]/30' : ''
        }`}
        role="slider"
        aria-valuenow={sliderPos}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Satellite Before/After Comparison Slider"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') updatePos(sliderPos - 5);
          if (e.key === 'ArrowRight') updatePos(sliderPos + 5);
          if (e.key === 'Home') updatePos(0);
          if (e.key === 'End') updatePos(100);
        }}
      >
        {/* 1. Base Layer (Image B / Target / Right) */}
        <img
          src={resolvedB}
          alt={labelB}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-150"
          style={{
            opacity: isBlinking && blinkShowA ? 0 : 1
          }}
          loading="eager"
        />

        {/* 2. Foreground Layer (Image A / Baseline / Left) with exact clip path */}
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
            loading="eager"
          />
        </div>

        {/* 3. AI Change Heatmap Overlay (when toggled ON) */}
        {showHeatmap && (() => {
          const isSarComparison = (labelA + labelB).toLowerCase().includes('sar') || (labelA + labelB).toLowerCase().includes('radar');
          return (
            <div
              className="absolute inset-0 pointer-events-none transition-opacity duration-300 z-10 mix-blend-multiply"
              style={{
                background: 'radial-gradient(ellipse at 65% 45%, rgba(220,38,38,0.55) 0%, rgba(245,158,11,0.35) 40%, rgba(22,122,74,0.1) 70%, transparent 85%)'
              }}
            >
              {/* Hotspot markers */}
              <div className="absolute top-[42%] left-[62%] w-14 h-14 rounded-full border-2 border-red-600 bg-red-600/20 animate-ping pointer-events-none" />
              <div className="absolute top-[32%] left-[55%] px-2.5 py-1 rounded-md bg-red-600 text-white font-mono text-[10px] font-bold shadow-md">
                {isSarComparison ? 'SAR Water Penetration (VV: -23.5 dB)' : '+34% Built-up Cluster'}
              </div>
              <div className="absolute top-[65%] left-[70%] px-2.5 py-1 rounded-md bg-amber-600 text-white font-mono text-[10px] font-bold shadow-md">
                {isSarComparison ? 'Double-Bounce Scatter' : '+18% Transit Corridor'}
              </div>
              <div className="absolute bottom-12 right-3 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold text-[#66736B] border border-[#E3EAE5]">
                Demo / Simulated Result
              </div>
            </div>
          );
        })()}

        {/* 4. Divider Line & Interactive Handle */}
        {!isBlinking && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-[#167A4A] shadow-[0_0_10px_rgba(22,122,74,0.7)] pointer-events-none z-20"
            style={{ left: `${sliderPos}%` }}
          >
            <div
              className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-white border-2 border-[#167A4A] text-[#167A4A] flex items-center justify-center text-xs font-bold shadow-lg transition-transform ${
                isDragging ? 'scale-115 shadow-xl bg-[#EAF7F0]' : 'hover:scale-110'
              }`}
            >
              ⇄
            </div>
          </div>
        )}

        {/* 5. Clean Top Corner Badges */}
        <div className="absolute top-3 left-3 z-30 flex items-center gap-2 bg-white/95 backdrop-blur-md border border-[#E3EAE5] px-3 py-1.5 rounded-lg text-xs font-semibold text-[#17201B] shadow-2xs pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-[#167A4A]" />
          <span>{labelA}</span>
        </div>

        <div className="absolute top-3 right-3 z-30 flex items-center gap-2 bg-white/95 backdrop-blur-md border border-[#E3EAE5] px-3 py-1.5 rounded-lg text-xs font-semibold text-[#17201B] shadow-2xs pointer-events-none">
          <span>{labelB}</span>
          <span className="w-2 h-2 rounded-full bg-[#DC2626]" />
        </div>

        {/* 6. Quick Controls Floating Bar (Z-Index 40, explicitly pointer-events-auto) */}
        <div
          onPointerDown={(e) => e.stopPropagation()}
          className="absolute bottom-3 left-1/2 -translate-x-1/2 z-40 bg-white/95 backdrop-blur-md border border-[#E3EAE5] rounded-xl px-3 py-1.5 flex items-center gap-2 shadow-sm text-xs pointer-events-auto"
        >
          <span className="text-[11px] text-[#66736B] font-semibold hidden sm:inline">Split:</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              updatePos(25);
            }}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
              sliderPos === 25 ? 'bg-[#EAF7F0] text-[#167A4A] font-bold' : 'text-[#66736B] hover:text-[#17201B] hover:bg-[#F4F6F5]'
            }`}
          >
            25%
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              updatePos(50);
            }}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
              sliderPos === 50 ? 'bg-[#EAF7F0] text-[#167A4A] font-bold' : 'text-[#66736B] hover:text-[#17201B] hover:bg-[#F4F6F5]'
            }`}
          >
            50%
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              updatePos(75);
            }}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
              sliderPos === 75 ? 'bg-[#EAF7F0] text-[#167A4A] font-bold' : 'text-[#66736B] hover:text-[#17201B] hover:bg-[#F4F6F5]'
            }`}
          >
            75%
          </button>
          <span className="text-[#E3EAE5]">|</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleToggleBlink();
            }}
            className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 text-xs font-bold transition cursor-pointer ${
              isBlinking ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'text-[#167A4A] hover:bg-[#EAF7F0]'
            }`}
            title="Rapidly toggle between Before and After scenes to spot differences visually"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{isBlinking ? 'Stop Blink' : 'Auto Blink'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

