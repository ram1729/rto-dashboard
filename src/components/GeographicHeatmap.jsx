import React, { useState } from 'react';

const GeographicHeatmap = ({ data }) => {
  // Simplified US SVG Path (proportional outline)
  const usPath = "M 50,290 C 20,290 0,260 0,230 C 0,160 30,130 60,110 C 90,90 130,80 180,90 C 230,100 270,110 320,110 C 370,110 420,100 470,90 C 520,80 570,90 610,110 C 650,130 680,150 700,180 C 720,210 720,240 700,270 C 680,300 640,320 600,340 C 560,360 520,380 480,400 C 440,420 400,430 350,430 C 300,430 250,420 200,400 C 150,380 100,340 70,320 Z";
  
  // Mapping coords to SVG space (roughly)
  const getPos = (lat, lng) => ({
    x: ((lng + 125) / 60) * 650 + 50,
    y: 430 - ((lat - 25) / 25) * 340
  });

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
