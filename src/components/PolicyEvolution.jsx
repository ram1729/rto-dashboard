import React from 'react';
import { Sparkles, History, MapPin, ExternalLink } from 'lucide-react';

const PolicyEvolution = ({ currentPolicy, lastUpdate, enforcement, history = [] }) => {
  return (
    <div className="glass-card rounded-2xl p-4 flex flex-col h-full">
      <h4 className="text-[9px] font-black text-text-muted uppercase tracking-[0.15em] mb-4 flex items-center gap-2">
        <div className="w-1 h-3 bg-positive rounded-full" />
        Policy Evolution
      </h4>
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <div className="relative pl-6 border-l-2 border-primary-purple/20 space-y-5 py-2">
          {/* Current Policy */}
          <div className="relative group/curr">
             <div className="absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-full bg-primary-purple border-4 border-white shadow-[0_0_10px_rgba(124,92,252,0.3)] z-10" />
             <div className="p-2.5 bg-primary-purple/[0.03] border border-primary-purple/10 rounded-xl group-hover/curr:bg-primary-purple/5 transition-colors">
               <p className="text-[9px] font-black text-primary-purple uppercase tracking-widest flex items-center gap-1.5">
                 <Sparkles size={10} /> {new Date(lastUpdate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
               </p>
               <p className="text-[11px] font-black text-text-primary mt-1">Current: {currentPolicy}</p>
               <p className="text-[9px] text-text-light/70 font-bold leading-tight mt-1">{enforcement}</p>
             </div>
          </div>

          {/* Historical Items */}
          {history.length > 0 ? history.map((item, idx) => (
            <div key={idx} className="relative group/hist opacity-70 hover:opacity-100 transition-opacity">
              <div className="absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-full bg-text-light/30 border-4 border-white shadow-sm z-10 group-hover/hist:bg-primary-purple/40" />
              <div className="p-2.5 hover:bg-white/40 rounded-xl transition-all border border-transparent hover:border-white/60">
                <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest flex items-center gap-1.5">
                  <History size={10} /> {new Date(item.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-[10px] font-bold text-text-primary">{item.policy} ({item.daysInOffice}d)</p>
                  {item.source && item.source !== '#' && (
                    <a href={item.source} target="_blank" rel="noopener noreferrer" className="text-primary-purple hover:scale-110 transition-transform">
                      <ExternalLink size={10} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          )) : (
            <div className="relative opacity-40">
              <div className="absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-full bg-text-light/20 border-4 border-white shadow-sm" />
              <p className="text-[9px] font-black uppercase tracking-widest ml-2.5">Initial Setup</p>
              <p className="text-[10px] font-bold text-text-primary mt-1 ml-2.5">Historical verification pending</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PolicyEvolution;
