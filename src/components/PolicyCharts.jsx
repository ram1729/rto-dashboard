import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

const COLORS = {
  'Remote-First': '#3B82F6', // Blue
  'Hybrid': '#8B5CF6',       // Electric Purple
  'Office-First': '#9CA3AF', // Gray
  'Full Office': '#000000'   // Black
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="tooltip-custom">
        <p className="tooltip-title">{payload[0].name || payload[0].payload.name}</p>
        <p className="tooltip-value">Count: <span className="text-bold" style={{color: '#000'}}>{payload[0].value}</span> companies</p>
      </div>
    );
  }
  return null;
};

const PolicyCharts = ({ data }) => {
  const chartData = useMemo(() => {
    const counts = { 'Remote-First': 0, 'Hybrid': 0, 'Office-First': 0, 'Full Office': 0 };
    data.forEach(d => {
      if (counts[d.policy] !== undefined) {
        counts[d.policy]++;
      }
    });
    
    return Object.keys(counts).map(key => ({
      name: key,
      value: counts[key]
    }));
  }, [data]);

  const barData = useMemo(() => {
    // Top 5 sectors
    const sectorCounts = {};
    data.forEach(d => {
      if (!sectorCounts[d.sector]) sectorCounts[d.sector] = { Remote: 0, Hybrid: 0, Office: 0 };
      if (d.policy === 'Remote-First') sectorCounts[d.sector].Remote++;
      else if (d.policy === 'Hybrid') sectorCounts[d.sector].Hybrid++;
      else sectorCounts[d.sector].Office++;
    });

    return Object.keys(sectorCounts)
      .map(k => ({ name: k, ...sectorCounts[k], total: sectorCounts[k].Remote + sectorCounts[k].Hybrid + sectorCounts[k].Office }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [data]);

  if (!data.length) return null;

  return (
    <div className="charts-grid">
      {/* Pie Chart */}
      <div className="panel chart-card">
        <h3 className="chart-title">Overall Policy Distribution</h3>
        <div className="chart-container" style={{ minHeight: '170px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="45%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={5}
                dataKey="value"
                stroke="#FFFFFF"
                strokeWidth={2}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
              <Legend verticalAlign="bottom" height={24} iconType="circle" wrapperStyle={{color: '#9CA3AF', fontSize: '11px', fontWeight: 500}} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="panel chart-card" style={{ paddingBottom: '0.25rem' }}>
        <h3 className="chart-title">RTO Trends by Top Sectors</h3>
        <div className="chart-container" style={{ minHeight: '160px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart layout="vertical" data={barData} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" horizontal={true} vertical={false} />
              <XAxis type="number" stroke="#E5E5E5" tick={{fill: '#9CA3AF', fontSize: 10, fontWeight: 500}} />
              <YAxis dataKey="name" type="category" stroke="#E5E5E5" width={110} tick={{fill: '#9CA3AF', fontSize: 10, fontWeight: 500}} />
              <Tooltip content={<CustomTooltip />} cursor={{fill: '#FAFAFA'}} />
              <Legend iconType="circle" wrapperStyle={{paddingTop: '5px', color: '#9CA3AF', fontSize: '12px', fontWeight: 500}} />
              <Bar dataKey="Remote" stackId="a" fill={COLORS['Remote-First']} />
              <Bar dataKey="Hybrid" stackId="a" fill={COLORS['Hybrid']} />
              <Bar dataKey="Office" stackId="a" fill={COLORS['Office-First']} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default PolicyCharts;
