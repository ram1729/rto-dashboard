import React, { useMemo } from 'react';
import { Building, MapPin, Monitor, Users } from 'lucide-react';

const MetricsCards = ({ data }) => {
  const stats = useMemo(() => {
    if (!data.length) return { remote: 0, hybrid: 0, office: 0, total: 0 };
    
    const total = data.length;
    let remote = 0, hybrid = 0, office = 0;
    
    data.forEach(d => {
      if (d.policy === 'Remote-First') remote++;
      else if (d.policy === 'Hybrid') hybrid++;
      else office++; // Office-First or Full Office
    });

    return {
      total,
      remote: Math.round((remote / total) * 100),
      hybrid: Math.round((hybrid / total) * 100),
      office: Math.round((office / total) * 100)
    };
  }, [data]);

  const cards = [
    { label: 'Total Tracked', value: stats.total, icon: Users },
    { label: 'Remote-First', value: `${stats.remote}%`, icon: Monitor, sub: 'Fully Flexible' },
    { label: 'Hybrid', value: `${stats.hybrid}%`, icon: MapPin, sub: '2-3 Days/Wk' },
    { label: 'Office-First', value: `${stats.office}%`, icon: Building, sub: '4+ Days/Wk' }
  ];

  return (
    <div className="metrics-grid">
      {cards.map((card, i) => (
        <div key={i} className="panel metric-card">
          <div className="metric-content">
            <p className="metric-label">{card.label}</p>
            <h3 className="metric-value text-bold">{card.value}</h3>
            {card.sub && <p className="metric-sub">{card.sub}</p>}
          </div>
          <div className="metric-icon-wrapper">
            <card.icon size={26} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default MetricsCards;
