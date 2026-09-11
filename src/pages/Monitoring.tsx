import React from 'react';
import { Activity, Bell, Calendar, Clock, Satellite, AlertTriangle, ShieldCheck } from 'lucide-react';

export const Monitoring: React.FC = () => {
  const alerts = [
    {
      id: 'alt-1',
      title: 'Rapid Water Accumulation Detected',
      region: 'Periyar Basin, Kerala',
      severity: 'Critical',
      time: '2 hours ago',
      sensor: 'Sentinel-2 MSI'
    },
    {
      id: 'alt-2',
      title: 'Unplanned Construction Anomaly',
      region: 'Bengaluru East Corridor',
      severity: 'Moderate',
      time: '14 hours ago',
      sensor: 'Sentinel-1 C-SAR'
    },
    {
      id: 'alt-3',
      title: 'Vegetation Moisture Deficiency',
      region: 'Southwest Punjab Farm Tract',
      severity: 'Watch',
      time: '1 day ago',
      sensor: 'Sentinel-2 NDVI'
    }
  ];

  const upcomingPasses = [
    { sensor: 'Sentinel-2A', passTime: 'Tomorrow at 10:42 AM IST', bands: '13 Optical Bands (10-60m)' },
    { sensor: 'Sentinel-1B', passTime: 'Tomorrow at 06:15 PM IST', bands: 'C-SAR Radar (Dual Pol VV+VH)' },
    { sensor: 'Landsat-9', passTime: '14 Sept at 11:05 AM IST', bands: 'OLI-2 Multispectral & TIRS-2' }
  ];

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6 select-none bg-gis-bg">
      <div className="border-b border-gis-border pb-4">
        <h1 className="text-xl font-bold text-gis-textBright flex items-center gap-2">
          <Activity className="w-5 h-5 text-gis-accent" />
          <span>Regional Surveillance & Telemetry Monitoring</span>
        </h1>
        <p className="text-xs text-gis-textMuted mt-1">
          Automated multi-sensor change triggers, orbital pass schedules, and environmental threshold alerts
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Active Surveillance Alerts */}
        <div className="space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-gis-textMuted flex items-center gap-1.5">
            <Bell className="w-3.5 h-3.5 text-gis-danger" />
            <span>Active Trigger Alerts</span>
          </div>

          <div className="space-y-2.5">
            {alerts.map((a) => (
              <div
                key={a.id}
                className="p-3.5 rounded-lg bg-gis-surface border border-gis-border space-y-1.5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gis-textBright">{a.title}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      a.severity === 'Critical'
                        ? 'bg-gis-danger/10 text-gis-danger border-gis-danger/30'
                        : a.severity === 'Moderate'
                        ? 'bg-gis-warning/10 text-gis-warning border-gis-warning/30'
                        : 'bg-gis-accent/10 text-gis-accent border-gis-accent/30'
                    }`}
                  >
                    {a.severity}
                  </span>
                </div>
                <div className="text-[11px] text-gis-textMuted flex items-center justify-between">
                  <span>Region: <b className="text-gis-textBright font-normal">{a.region}</b></span>
                  <span className="flex items-center gap-1 font-mono text-[10px]">
                    <Clock className="w-2.5 h-2.5" />
                    {a.time}
                  </span>
                </div>
                <div className="text-[10px] text-gis-accentCyan flex items-center gap-1 pt-1 border-t border-gis-border/40">
                  <Satellite className="w-3 h-3" />
                  <span>Detected by {a.sensor}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scheduled Orbital Passes */}
        <div className="space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-gis-textMuted flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-gis-accent" />
            <span>Upcoming Orbital Satellite Passes</span>
          </div>

          <div className="space-y-2.5">
            {upcomingPasses.map((p, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-lg bg-gis-surface border border-gis-border space-y-1.5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gis-textBright flex items-center gap-1.5">
                    <Satellite className="w-3.5 h-3.5 text-gis-accent" />
                    {p.sensor}
                  </span>
                  <span className="text-[10px] font-mono text-gis-success font-medium bg-gis-success/10 px-2 py-0.5 rounded border border-gis-success/20">
                    Scheduled
                  </span>
                </div>
                <div className="text-[11px] text-gis-textBright font-mono">
                  {p.passTime}
                </div>
                <div className="text-[10px] text-gis-textMuted">
                  Payload: {p.bands}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
