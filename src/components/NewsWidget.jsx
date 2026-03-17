import React from 'react';
import { ExternalLink, Newspaper, Calendar } from 'lucide-react';

const NewsWidget = ({ news }) => {
  return (
    <div className="glass-panel rounded-3xl p-6 flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-700">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-warning/20 rounded-lg flex items-center justify-center text-warning">
          <Newspaper size={18} />
        </div>
        <div>
          <h3 className="text-[14px] font-black text-text-primary uppercase tracking-widest">Global RTO News</h3>
          <p className="text-[10px] font-bold text-text-light/60 uppercase tracking-tighter">Real-time Policy Intelligence</p>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto no-scrollbar pr-1">
        {news.map((item, i) => (
          <a 
            key={item.id} 
            href={item.link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="block p-4 bg-white/40 border border-white/60 rounded-2xl group transition-all duration-300 hover:bg-white hover:border-primary-purple hover:shadow-lg hover:shadow-primary-purple/5"
          >
            <div className="flex justify-between items-start gap-4 mb-2">
              <span className="text-[9px] font-black text-primary-purple/60 uppercase tracking-widest bg-primary-purple/5 px-2 py-0.5 rounded-md">
                {item.source}
              </span>
              <div className="text-text-light/40 group-hover:text-primary-purple transition-colors">
                <ExternalLink size={12} />
              </div>
            </div>
            <h4 className="text-[12px] font-bold text-text-primary leading-snug group-hover:text-primary-purple transition-colors line-clamp-2 mb-2">
              {item.title}
            </h4>
            <div className="flex items-center gap-1.5 text-[9px] font-black text-text-light/60 uppercase tracking-tighter">
              <Calendar size={10} />
              {new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </a>
        ))}
      </div>
      
      <div className="mt-6 pt-4 border-t border-white/20 text-center">
        <p className="text-[9px] font-black text-text-light/40 uppercase tracking-[0.2em]">Data provided by AI Scraper v2</p>
      </div>
    </div>
  );
};

export default NewsWidget;
