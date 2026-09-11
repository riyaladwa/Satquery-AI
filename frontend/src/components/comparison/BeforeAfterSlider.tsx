import React, { useState } from 'react';

interface BeforeAfterSliderProps {
  imageAUrl: string;
  imageBUrl: string;
  labelA?: string;
  labelB?: string;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  imageAUrl,
  imageBUrl,
  labelA = 'Baseline (2023)',
  labelB = 'Target (2026)'
}) => {
  const [sliderPos, setSliderPos] = useState(50);

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-gis-bg rounded-md border border-gis-border">
      {/* Background Image (Image B / After) */}
      <img
        src={imageBUrl}
        alt="Image B"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
      />

      {/* Clipped Foreground Image (Image A / Before) */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{ width: `${sliderPos}%` }}
      >
        <img
          src={imageAUrl}
          alt="Image A"
          className="absolute inset-0 w-full h-full object-cover max-w-none"
          style={{ width: '100vw', height: '100%' }}
        />
      </div>

      {/* Divider Line */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-gis-accent cursor-ew-resize z-20"
        style={{ left: `${sliderPos}%` }}
      >
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-gis-accent text-white flex items-center justify-center text-[10px] font-bold shadow-gis">
          ⇄
        </div>
      </div>

      {/* Slider Input Controller */}
      <input
        type="range"
        min="0"
        max="100"
        value={sliderPos}
        onChange={(e) => setSliderPos(Number(e.target.value))}
        className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
      />

      {/* Labels */}
      <div className="absolute top-3 left-3 z-10 bg-gis-panel/85 backdrop-blur-sm border border-gis-border px-2.5 py-1 rounded text-xs font-semibold text-gis-textBright shadow-sm">
        {labelA}
      </div>
      <div className="absolute top-3 right-3 z-10 bg-gis-panel/85 backdrop-blur-sm border border-gis-border px-2.5 py-1 rounded text-xs font-semibold text-gis-accentCyan shadow-sm">
        {labelB}
      </div>
    </div>
  );
};
