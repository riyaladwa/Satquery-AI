import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

interface LandCoverClass {
  name: string;
  percentage: number;
  area_ha: number;
  color: string;
}

interface LandCoverChartProps {
  classes: LandCoverClass[];
}

export const LandCoverChart: React.FC<LandCoverChartProps> = ({ classes }) => {
  if (!classes || classes.length === 0) return null;

  const data = classes.map((c) => ({
    name: c.name.split(' ')[0],
    percentage: c.percentage,
    area_ha: c.area_ha,
    color: c.color
  }));

  return (
    <div className="bg-gis-bg border border-gis-border rounded-md p-2.5">
      <div className="text-xs font-semibold text-gis-textBright mb-2">
        Land Cover Distribution (%)
      </div>
      <div className="h-32 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 2, right: 15, left: 20, bottom: 2 }}>
            <XAxis type="number" domain={[0, 50]} tick={{ fill: '#94A3B8', fontSize: 10 }} />
            <YAxis dataKey="name" type="category" tick={{ fill: '#F8FAFC', fontSize: 10 }} width={60} />
            <Tooltip
              contentStyle={{ backgroundColor: '#141D2E', borderColor: '#233047', borderRadius: '4px', fontSize: '11px' }}
              formatter={(val: any, name: any, item: any) => [`${val}% (${item.payload.area_ha} ha)`, 'Coverage']}
            />
            <Bar dataKey="percentage" radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
