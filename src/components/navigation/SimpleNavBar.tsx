import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Radio, Sliders, Settings as SettingsIcon, ShieldCheck } from 'lucide-react';
import { useAdvancedMode } from '../../context/AdvancedModeContext';

export const SimpleNavBar: React.FC = () => {
  const navigate = useNavigate();
  const { advancedMode, toggleAdvancedMode } = useAdvancedMode();

  const navItems = [
    { to: '/', label: 'Home' },
    { to: '/explore', label: 'Explore' },
    { to: '/analyze', label: 'Analyze' },
    { to: '/monitor', label: 'Monitor' },
    { to: '/my-work', label: 'My Work' },
  ];

  return (
    <header className="h-14 bg-[#0D1117] border-b border-[#283541] px-4 md:px-6 flex items-center justify-between z-30 select-none shrink-0 sticky top-0 backdrop-blur">
      {/* Left: Brand Identity */}
      <div className="flex items-center gap-3">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 group text-left hover:opacity-90 transition-opacity"
        >
          <div className="w-8 h-8 rounded-lg bg-[#121A22] border border-[#38D9D1]/40 flex items-center justify-center text-[#38D9D1] shadow-sm shadow-[#38D9D1]/20">
            <Radio className="w-4 h-4 text-[#38D9D1] animate-pulse" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm tracking-wider text-[#F5F7FA]">SATQUERY</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#38D9D1]/15 text-[#38D9D1] border border-[#38D9D1]/30 font-semibold">
                AI
              </span>
            </div>
            <span className="text-[10px] text-[#9AA6B2] tracking-tight hidden lg:inline">
              Understand Earth from satellite imagery
            </span>
          </div>
        </button>
      </div>

      {/* Center: Exactly 5 Primary Navigation Links */}
      <nav className="flex items-center gap-1 sm:gap-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-[#17212B] text-[#38D9D1] border border-[#38D9D1]/30 font-semibold shadow-sm'
                  : 'text-[#9AA6B2] hover:text-[#F5F7FA] hover:bg-[#121A22] border border-transparent'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Right: Progressive Disclosure Advanced Mode Toggle & Settings */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={toggleAdvancedMode}
          className={`flex items-center gap-2 px-2.5 py-1 rounded-lg border text-xs transition-all ${
            advancedMode
              ? 'bg-[#38D9D1]/15 border-[#38D9D1] text-[#38D9D1] font-semibold shadow-sm'
              : 'bg-[#121A22] border-[#283541] text-[#9AA6B2] hover:text-[#F5F7FA]'
          }`}
          title={
            advancedMode
              ? 'Advanced GIS mode is ON: Raw bands, pixel curves, and polarizations visible.'
              : 'Simple mode is ON: SatQuery handles bands automatically. Click to reveal advanced GIS tools.'
          }
        >
          <Sliders className="w-3.5 h-3.5" />
          <span className="text-[11px] font-mono">
            Advanced: <strong className={advancedMode ? 'text-[#38D9D1]' : 'text-[#F5F7FA]'}>{advancedMode ? 'ON' : 'OFF'}</strong>
          </span>
        </button>

        <button
          onClick={() => navigate('/settings')}
          className="p-1.5 rounded-lg text-[#9AA6B2] hover:text-[#F5F7FA] hover:bg-[#121A22] border border-transparent hover:border-[#283541] transition-colors"
          title="Settings & System Status"
        >
          <SettingsIcon className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
