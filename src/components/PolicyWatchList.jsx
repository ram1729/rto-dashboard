import React, { useMemo } from 'react';
import PolicyTag from './PolicyTag';

const PolicyWatchList = ({ data }) => {
  const predictions = useMemo(() => {
    return data.filter(d => d.prediction).sort((a,b) => b.prediction.probability - a.prediction.probability).slice(0, 5);
  }, [data]);

  return (
    <div className="glass-panel rounded-2xl p-6 relative overflow-hidden h-full">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-8 h-8 bg-warning/20 rounded-xl flex items-center justify-center text-warning">
          <span className="text-lg">🔮</span>
        </div>
        <h3 className="text-base font-bold text-text-primary tracking-tight">Policy Shift Watch List</h3>
      </div>
      <div className="space-y-8">
        {predictions.map((item, idx) => (
          <div key={idx} className="flex flex-col gap-3 group cursor-pointer animate-in fade-in slide-in-from-right-4" style={{ animationDelay: `${idx * 100}ms` }}>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-black text-text-primary group-hover:text-primary-purple transition-all duration-300 tracking-tight">{item.company}</p>
                <p className="text-[10px] font-bold text-text-light uppercase tracking-wider opacity-60">{item.sector}</p>
              </div>
              <div className="flex items-center gap-2">
                <PolicyTag policy={item.policy} />
                <span className="text-text-muted font-bold">→</span>
                <PolicyTag policy={item.prediction.nextPolicy} />
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex-1 h-2 bg-text-light/10 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 shadow-[0_0_12px_currentColor] ${item.prediction.probability > 65 ? 'bg-primary-purple' : item.prediction.probability > 40 ? 'bg-warning' : 'bg-text-light'}`}
                  style={{ width: `${item.prediction.probability}%`, color: item.prediction.probability > 65 ? 'rgba(124, 92, 252, 0.4)' : item.prediction.probability > 40 ? 'rgba(245, 158, 11, 0.4)' : 'rgba(152, 152, 171, 0.4)' }}
                />
              </div>
              <span className="text-xs font-black text-primary-purple">{item.prediction.probability}%</span>
              <span className="text-[9px] font-black px-2 py-1 bg-white/60 border border-white/80 text-text-muted rounded-lg uppercase tracking-widest">{item.prediction.timeframe}</span>
            </div>

            <div className="flex flex-wrap gap-2 mt-1">
              {item.prediction.signals.map((sig, i) => (
                <span key={i} className="text-[9px] font-bold bg-white/40 border border-white/60 px-2.5 py-1 rounded-lg text-text-light hover:border-primary-purple/30 transition-colors">
                  {sig}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-6 pt-4 border-t border-[#F8F8FA] text-[10px] text-text-light italic text-center">
        Predictions are AI-generated estimates and may not reflect actual plans.
      </p>
    </div>
  );
};

export default PolicyWatchList;
