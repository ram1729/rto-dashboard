import React, { useState } from 'react';

const GeographicHeatmap = ({ data }) => {
  // Realistic US SVG Path (Multi-segment for better detail)
  const usPath = "M72.5,134.5c-0.8-0.3-1.6-0.6-2.4-1c-2.4-1.2-4.9-2.3-7.5-3.3c-2.1-0.8-4.3-1.6-6.4-2.2c-1.8-0.5-3.7-0.9-5.6-1.5c-4.4-1.3-9-2.8-13.6-4.5l-0.5-0.2c-0.4-0.1-0.8-0.2-1.2-0.3c-1.1-0.3-2.1-0.5-3-0.8l-1.2-0.3l-0.3,1.4c-0.2,0.9-0.4,1.7-0.7,2.5c-0.6,1.4-1.4,2.7-2.3,4c-0.9,1.3-1.9,2.4-3,3.5c-0.4,0.4-0.8,0.7-1.3,1.1c-0.8,0.7-1.1,1.1-1.3,1.5c-0.2,0.3-0.3,0.7-0.4,1.2c-0.2,1.3-0.3,2,0,3.3c0.3,1.3,0.8,2,1.7,3.1c0.9,1.1,1.5,1.7,1.8,2.7c0.4,1,0.5,1.8,1.2,3.3c1.7,3.5,2.6,5.3,4.4,9c1.4,2.9,2.1,4.3,3.5,7.2c1.4,2.9,2,3.9,2.6,5.3c0.5,1.1,0.9,1.8,1.5,3.1c1.5,3.3,2.2,4,3.1,4.8c0.9,0.9,1.3,1.1,2.5,2.4c1.2,1.2,1.8,1.8,2.8,2.9c1,1.1,1.5,1.7,1.9,3.2c0.4,1.5,0.4,2.2,0.8,4.3c0.4,2,0.5,3.1,0.9,4.3c0.4,1.2,0.9,2,1.7,3.1c0.8,1.1,1.2,1.7,1.8,3.1c0.6,1.3,0.8,2.1,1.3,4.2c1.2,5.2,1.8,7.8,2.3,13c0.3,3.1,0.4,4.7,0.7,7.8c0.3,3.1,0.3,4.6,0,7.8c-0.3,3.2-0.5,4.7-0.9,7.8c-0.4,3.1-0.6,4.7-0.3,7.8c0.3,3.1,0.8,4.7,1.7,7.8c0.9,3.1,1.3,4.6,1.9,7.8c0.5,3.1,0.6,4.7,1,7.8s1,4.7,1.9,7.8c0.9,3.1,1.4,4.6,2.2,7.8c0.8,3.2,1.4,4.7,2.2,7.9c0.7,3.1,1,4.7,1.2,7.8s0.3,4.7,0.8,7.8s1.1,4.6,1.9,7.8s1.2,4.7,1.2,7.9l12 3.5l24.4,7.1l15.2,4.4l24.4,7.1l11.6,3.4l24.4,7.1l7.8,2.3l24.4,7.1l12,3.5l24.4,7.1l11.4,3.3l24.4,7.1l15,4.4l24.4,7.1l7.8,2.3l24.4,7.1l12.4,3.6c3.2-1.2,4.8-1.8,8-3.1c3.2-1.2,4.8-2,8-3.5c3.2-1.6,4.8-2.5,8-4.3c3.2-1.8,4.8-2.8,8-4.6c2.4-1.4,3.5-2.2,5.5-3.6c5.5-4,8.3-6.1,11-10c2.7-4,4.1-5.9,5.5-10c1.3-4,2-6.1,2-10c0-3.9-0.5-5.9-1.5-10c-1-4.1-1.6-6.1-3.5-10c-1.8-3.9-2.8-5.7-5.3-9c-2.4-3.3-3.7-5.1-6.1-8c-2.4-2.9-3.7-4.4-6-6c-2.4-1.6-3.7-2.4-6.3-4c-3.1-1.9-4.7-2.9-7.8-4.3c-3-1.4-4.5-2-7.5-3c-3-1-4.6-1.5-7.8-2.2c-3.2-0.7-5-1-8.1-1.3c-3.1-0.3-4.7-0.5-7.8-1.2c-3.1-0.7-4.7-1.1-7.8-2.2c-3.1-1.1-4.7-1.7-7.8-3.2c-3-1.4-4.6-2.1-7.7-3.6c-3.1-1.5-4.6-2.3-7.7-4.1c-3.1-1.8-4.7-2.7-7.8-4.5c-3-1.8-4.6-2.7-7.7-4.3c-3.1-1.6-4.6-2.4-7.8-3.8c-3.2-1.4-4.8-2.1-8-3.2s-4.8-1.6-8-2.6s-4.8-1.5-8-2.3s-4.8-1.2-8-2s-4.8-1.2-8-1.9c-3.1-0.7-4.7-1.1-7.8-2c-3.1-1-4.7-1.5-7.8-2.4c-3.1-1-4.7-1.5-7.8-2.5s-4.8-1.5-8-2.4s-4.8-1.4-8-2.3c-3.2-0.8-4.8-1.3-8-2.2s-4.8-1.4-8-2.3c-3.2-0.9-4.8-1.5-8-2.3s-4.8-1.2-8-2s-4.8-1.2-8-1.9c-3.1-0.6-4.7-1-7.8-1.8c-3.1-0.8-4.7-1.2-7.8-2c-3.1-0.8-4.7-1.2-7.8-2s-4.8-1.2-8-1.9L72.5,134.5z";
  
  // Calibrated projection for accurate US marker placement
  const getPos = (lat, lng) => {
    // Albers-like projection mapping
    const mapWidth = 800;
    const mapHeight = 500;
    const centerLng = -96.5;
    const centerLat = 38.5;
    
    return {
      x: ((lng - centerLng) * 12) + (mapWidth / 2),
      y: (mapHeight / 2) - ((lat - centerLat) * 16)
    };
  };

  const [hovered, setHovered] = useState(null);

  const handleMarkerClick = (company) => {
    const el = document.getElementById(`row-${company.id}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div className="glass-panel rounded-2xl p-6 relative overflow-hidden h-full group">
      <div className="flex justify-between items-center mb-5">
        <div>
          <h3 className="text-base font-bold text-text-primary tracking-tight">Geographic Pulse Heatmap</h3>
          <p className="text-[10px] font-bold text-text-light/60 uppercase tracking-widest">Active HQ Concentration Clusters</p>
        </div>
        
        {/* Legend Inside Map Container */}
        <div className="flex gap-4 bg-white/40 backdrop-blur-md px-4 py-2 rounded-xl border border-white/60 shadow-sm">
          <div className="flex items-center gap-2 text-[9px] font-black text-text-muted uppercase tracking-tighter">
            <div className="w-2 h-2 rounded-full bg-slate-700 shadow-[0_0_8px_rgba(51,65,85,0.4)]" /> Office
          </div>
          <div className="flex items-center gap-2 text-[9px] font-black text-text-muted uppercase tracking-tighter">
            <div className="w-2 h-2 rounded-full bg-primary-purple shadow-[0_0_8px_rgba(124,92,252,0.4)]" /> Hybrid
          </div>
          <div className="flex items-center gap-2 text-[9px] font-black text-text-muted uppercase tracking-tighter">
            <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]" /> Remote
          </div>
        </div>
      </div>
      
      <div className="relative h-[240px] w-full bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-dashed border-white/40 p-2 overflow-hidden shadow-inner">
        <svg viewBox="0 0 800 500" className="w-full h-full drop-shadow-sm">
          <path d={usPath} fill="#f8fafc" stroke="#e2e8f0" strokeWidth="2" />
          {data.map((company, idx) => {
            const pos = getPos(company.hq.lat, company.hq.lng);
            const color = company.policy === 'Full Office' ? '#374151' : company.policy === 'Hybrid' ? '#7C5CFC' : '#3B82F6';
            const size = company.mentionVolume > 4000 ? 10 : company.mentionVolume > 2000 ? 7 : 4;
            return (
              <circle 
                key={idx} 
                cx={pos.x} cy={pos.y} r={size} 
                fill={color} fillOpacity={hovered === company.id ? "1" : "0.5"} 
                stroke={color} strokeWidth={hovered === company.id ? "3" : "1.5"}
                onMouseEnter={() => setHovered(company.id)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => handleMarkerClick(company)}
                className="cursor-pointer transition-all duration-300"
              />
            );
          })}
        </svg>

        {/* Custom Tooltip */}
        {hovered && (
          <div 
            className="absolute bg-white border border-[#E8E8EC] p-2 rounded-lg shadow-xl pointer-events-none z-50 animate-in fade-in zoom-in duration-200"
            style={{ 
              left: getPos(data.find(d => d.id === hovered).hq.lat, data.find(d => d.id === hovered).hq.lng).x - 40,
              top: getPos(data.find(d => d.id === hovered).hq.lat, data.find(d => d.id === hovered).hq.lng).y - 60
            }}
          >
            <p className="font-bold text-[11px] text-text-primary leading-tight">{data.find(d => d.id === hovered).company}</p>
            <p className="text-[9px] text-text-light mt-0.5">{data.find(d => d.id === hovered).hq.city}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GeographicHeatmap;
