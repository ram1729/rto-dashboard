import React from 'react';
import { ResponsiveContainer, LineChart, Line } from 'recharts';
import PolicyTag from './PolicyTag';
import { SentimentGauge } from './SentimentVisuals';

const ComparisonView = ({ companies, onBack, onRemove }) => {
  if (!companies.length) return null;
  
  return (
    <div className="glass-panel rounded-3xl p-10 min-h-[600px] animate-in fade-in duration-700">
      <div className="flex justify-between items-center mb-12">
        <button onClick={onBack} className="flex items-center gap-2 text-primary-purple font-black uppercase tracking-widest text-[12px] hover:scale-105 transition-transform">
          ← Back to Tracker
        </button>
        <h3 className="text-2xl font-black text-text-primary tracking-tight">Side-by-Side Comparison</h3>
        <div className="text-[11px] font-bold text-text-light uppercase tracking-widest opacity-60">{companies.length}/3 selected</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.map((c, idx) => (
          <div key={idx} className="glass-card rounded-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
            {/* Header */}
            <div className="p-8 border-b border-white/20 relative bg-white/20 backdrop-blur-sm">
              <button onClick={() => onRemove(c.id)} className="absolute top-5 right-5 w-6 h-6 flex items-center justify-center rounded-full bg-black/5 hover:bg-black/10 transition-colors text-text-light font-bold">×</button>
              <h4 className="text-xl font-black text-text-primary leading-tight mb-1 tracking-tight">{c.company}</h4>
              <p className="text-[11px] font-bold text-text-light uppercase tracking-wider opacity-60">{c.sector}</p>
            </div>

            {/* Basic Info */}
            <div className="p-6 border-b border-[#E8E8EC] flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold uppercase text-text-muted">Policy</span>
                <PolicyTag policy={c.policy} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold uppercase text-text-muted">Days in Office</span>
                <span className="font-bold text-text-primary">{c.daysInOffice || 'Flexible'}</span>
              </div>
            </div>

            {/* Sentiment */}
            <div className="p-6 border-b border-[#E8E8EC]">
               <div className="flex justify-between items-center mb-2">
                 <span className="text-[11px] font-bold uppercase text-text-muted">Sentiment</span>
                 <SentimentGauge score={c.sentiment} />
               </div>
               <div className="h-[40px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                   <LineChart data={c.history}>
                     <Line type="monotone" dataKey="sentiment" stroke="#7C5CFC" strokeWidth={2} dot={false} />
                   </LineChart>
                 </ResponsiveContainer>
               </div>
            </div>

            {/* Timeline (Critical Visual) */}
            <div className="p-6 border-b border-[#E8E8EC] bg-[#F8F8FA]/30 flex-1">
               <span className="text-[11px] font-bold uppercase text-text-muted mb-6 block">Policy Roadmap</span>
               <div className="relative pl-6 space-y-8 before:absolute before:left-[11px] before:top-0 before:bottom-0 before:w-[2px] before:bg-primary-purple/20">
                  <div className="relative">
                    <div className="absolute -left-[19px] top-1.5 w-4 h-4 rounded-full bg-primary-purple border-4 border-white shadow-sm" />
                    <p className="text-[11px] font-bold text-text-muted">{c.lastUpdate}</p>
                    <p className="text-[13px] font-bold text-text-primary">Current: {c.policy}</p>
                  </div>
                  {c.prediction && (
                    <div className="relative">
                      <div className="absolute -left-[19px] top-1.5 w-4 h-4 rounded-full bg-warning border-4 border-white shadow-sm" />
                      <p className="text-[11px] font-bold text-text-muted">{c.prediction.timeframe}</p>
                      <p className="text-[13px] font-bold text-text-primary italic">Predicted: {c.prediction.nextPolicy}</p>
                      <p className="text-[10px] text-text-light">Confidence: {c.prediction.probability}%</p>
                    </div>
                  )}
               </div>
            </div>

            {/* Benchmark */}
            <div className="p-6 border-b border-[#E8E8EC]">
              <span className="text-[11px] font-bold uppercase text-text-muted mb-2 block">vs Sector Average</span>
              <div className="h-4 bg-background-gray rounded-full overflow-hidden flex">
                 <div className="h-full bg-primary-purple" style={{ width: `${(c.daysInOffice / 5) * 100}%` }} />
              </div>
              <div className="flex justify-between mt-1 text-[10px] font-bold text-text-light uppercase">
                 <span>{c.daysInOffice}d</span>
                 <span>Industry Avg: 2.8d</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ComparisonView;
