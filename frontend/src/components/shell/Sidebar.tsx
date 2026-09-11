import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Compass,
  GitCompare,
  SearchAlert,
  Activity,
  History,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Satellite,
  ShieldCheck
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const { t } = useTranslation();
  const location = useLocation();

  const navItems = [
    { to: '/', label: 'Workflow Setup', icon: Compass },
    { to: '/workstation', label: 'GIS Workstation', icon: Satellite },
    { to: '/dashboard', label: 'Overview Dashboard', icon: LayoutDashboard },
    { to: '/compare', label: t('nav.compare'), icon: GitCompare },
    { to: '/investigate', label: t('nav.investigate'), icon: SearchAlert },
    { to: '/monitoring', label: t('nav.monitoring'), icon: Activity },
    { to: '/history', label: t('nav.history'), icon: History },
    { to: '/reports', label: t('nav.reports'), icon: FileText },
    { to: '/settings', label: t('nav.settings'), icon: Settings }
  ];

  return (
    <aside
      className={`relative flex flex-col bg-gis-surface border-r border-gis-border transition-all duration-300 z-30 select-none ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Brand Header */}
      <div className="h-14 flex items-center px-4 border-b border-gis-border gap-3 justify-between">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-md bg-gradient-to-tr from-gis-accent to-gis-accentCyan flex items-center justify-center shrink-0 shadow-sm">
            <Satellite className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col truncate">
              <span className="font-bold tracking-wider text-sm text-gis-textBright flex items-center gap-1.5">
                SATQUERY <span className="text-gis-accent font-extrabold text-xs px-1 bg-gis-accent/15 rounded border border-gis-accent/30">AI</span>
              </span>
              <span className="text-[10px] text-gis-textMuted tracking-tight uppercase">Geospatial Intelligence</span>
            </div>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded text-gis-textMuted hover:text-gis-textBright hover:bg-gis-hover transition"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav List */}
      <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to || location.pathname.startsWith(item.to + '/');
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-gis-accent/15 text-gis-accent border border-gis-accent/30'
                  : 'text-gis-textMuted hover:text-gis-textBright hover:bg-gis-hover'
              } ${collapsed ? 'justify-center px-0' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-gis-accent' : 'text-gis-textMuted'}`} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Status Indicator */}
      <div className="p-3 border-t border-gis-border text-[11px] text-gis-textMuted">
        {!collapsed ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-gis-success animate-pulse" />
              <span>SIH 2026 Ready</span>
            </div>
            <ShieldCheck className="w-3.5 h-3.5 text-gis-accent" />
          </div>
        ) : (
          <div className="flex justify-center" title="System Online">
            <span className="w-2 h-2 rounded-full bg-gis-success" />
          </div>
        )}
      </div>
    </aside>
  );
};
