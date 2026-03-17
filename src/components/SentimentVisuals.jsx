import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const SentimentSparkline = ({ data }) => (
  <svg width="40" height="16" className="overflow-visible">
    <polyline
      fill="none"
      stroke="#7C5CFC"
      strokeWidth="1.5"
      points={data.map((d, i) => `${(i * 3.5)},${8 - d * 8}`).join(' ')}
    />
  </svg>
);

export const SentimentGauge = ({ score }) => {
  const color = score > 0 ? 'text-positive' : 'text-negative';
  return (
    <div className={`flex items-center gap-1 font-bold ${color}`}>
      {score > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
      {score > 0 ? '+' : ''}{score.toFixed(2)}
    </div>
  );
};
