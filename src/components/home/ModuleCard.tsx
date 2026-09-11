import React from 'react';
import { ArrowRight } from 'lucide-react';

export interface ModuleCardProps {
  id: string;
  icon: any;
  title: string;
  description: string;
  badge?: string;
  onClick: () => void;
}

export const ModuleCard: React.FC<ModuleCardProps> = ({
  icon: Icon,
  title,
  description,
  badge,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className="group relative text-left p-5 rounded-xl bg-[#121A22] border border-[#283541] hover:border-[#38D9D1] hover:bg-[#17212B] transition-all duration-200 flex flex-col justify-between shadow-lg shadow-black/40 hover:shadow-cyan-950/20 hover:-translate-y-0.5 select-none"
    >
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <div className="w-10 h-10 rounded-lg bg-[#0D1117] border border-[#283541] group-hover:border-[#38D9D1]/50 flex items-center justify-center text-[#38D9D1] transition-colors">
            <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
          </div>
          {badge && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#38D9D1]/10 text-[#38D9D1] border border-[#38D9D1]/30 font-semibold">
              {badge}
            </span>
          )}
        </div>

        <h3 className="text-base font-semibold text-[#F5F7FA] group-hover:text-[#38D9D1] transition-colors mb-1.5 flex items-center gap-1.5">
          {title}
        </h3>
        <p className="text-xs text-[#9AA6B2] leading-relaxed">
          {description}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-[#283541]/60 flex items-center justify-between text-xs text-[#9AA6B2] group-hover:text-[#38D9D1] transition-colors">
        <span className="text-[11px] font-medium">Start workflow</span>
        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
      </div>
    </button>
  );
};
