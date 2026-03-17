import React from 'react';

const StatCard = ({ label, value, subText, trend, icon: Icon, isUpdated }) => (
  <div className="glass-card rounded-2xl p-5 flex flex-col gap-1 transition-all duration-500 hover:-translate-y-1">
    <div className="flex justify-between items-start">
      <span className="text-text-muted text-[10px] font-bold uppercase tracking-[0.1em] opacity-80">{label}</span>
      <div className="flex items-center gap-2">
        {isUpdated && (
          <div className="w-1.5 h-1.5 bg-positive rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
        )}
        <div className="p-1.5 bg-primary-purple/10 rounded-lg text-primary-purple">
          {Icon && <Icon size={14} />}
        </div>
      </div>
    </div>
    <div className="flex items-baseline gap-2 mt-1">
      <span className="text-text-primary text-3xl font-black tracking-tight leading-none">{value}</span>
      {trend && (
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 ${trend.includes('↗') ? 'bg-positive/10 text-positive' : 'bg-negative/10 text-negative'}`}>
          {trend}
        </span>
      )}
    </div>
    <span className="text-text-light text-[11px] font-bold mt-1 opacity-70">{subText}</span>
  </div>
);

export default StatCard;
