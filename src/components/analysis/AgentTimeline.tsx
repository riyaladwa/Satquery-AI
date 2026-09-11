import React, { useState } from 'react';
import { TimelineStep } from '../../types';
import { CheckCircle2, ChevronDown, ChevronUp, Cpu, Clock } from 'lucide-react';

interface AgentTimelineProps {
  timeline: TimelineStep[];
  executionTimeMs: number;
}

export const AgentTimeline: React.FC<AgentTimelineProps> = ({
  timeline,
  executionTimeMs
}) => {
  const [expanded, setExpanded] = useState(false);

  if (!timeline || timeline.length === 0) return null;

  return (
    <div className="bg-gis-bg border border-gis-border rounded-md p-2.5">
      <div
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between cursor-pointer select-none"
      >
        <div className="flex items-center gap-2">
          <Cpu className="w-3.5 h-3.5 text-gis-accent" />
          <span className="text-xs font-semibold text-gis-textBright">
            Agent Execution Timeline
          </span>
          <span className="text-[10px] font-mono text-gis-textMuted flex items-center gap-1 bg-gis-surface px-1.5 py-0.5 rounded border border-gis-border">
            <Clock className="w-2.5 h-2.5" />
            {executionTimeMs} ms
          </span>
        </div>
        <button className="text-gis-textMuted hover:text-gis-textBright">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {expanded && (
        <div className="mt-2.5 pt-2 border-t border-gis-border space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {timeline.map((item, idx) => (
            <div key={idx} className="flex items-start gap-2 text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5 text-gis-success shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gis-textBright">{item.step}</span>
                  <span className="text-[10px] font-mono text-gis-textMuted">{item.timestamp_ms}ms</span>
                </div>
                <div className="text-[10px] text-gis-textMuted leading-tight">{item.details}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
