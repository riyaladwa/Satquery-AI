import React from 'react';

export const MapLegend: React.FC = () => {
  const classes = [
    { label: 'Built-up / Urban', color: '#E11D48' },
    { label: 'Vegetation / Forest', color: '#10B981' },
    { label: 'Cropland / Agriculture', color: '#F59E0B' },
    { label: 'Water Bodies', color: '#0EA5E9' },
    { label: 'Bare Soil / Sand', color: '#8B5CF6' },
    { label: 'Detected Expansion', color: '#F43F5E' }
  ];

  return (
    <div className="bg-gis-panel/90 backdrop-blur-sm border border-gis-border rounded-md p-2.5 shadow-gis select-none">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-gis-textMuted mb-1.5 pb-1 border-b border-gis-border">
        Classification Legend
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px]">
        {classes.map((c) => (
          <div key={c.label} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm shrink-0 shadow-sm" style={{ backgroundColor: c.color }} />
            <span className="text-gis-textBright truncate">{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
