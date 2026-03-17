import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Building2, Globe, Search, Filter, 
  TrendingUp, TrendingDown, MessageSquare, 
  ChevronDown, ChevronUp, Check, ExternalLink,
  Map as MapIcon, BarChart3, Users
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar, Cell,
  PieChart, Pie
} from 'recharts';

import StatCard from './components/StatCard';
import PolicyTag from './components/PolicyTag';
import ComparisonView from './components/ComparisonView';
import GeographicHeatmap from './components/GeographicHeatmap';
import PolicyWatchList from './components/PolicyWatchList';
import NewsWidget from './components/NewsWidget';
import { SentimentGauge, SentimentSparkline } from './components/SentimentVisuals';

// --- Main App ---

export default function App() {
  const [data, setData] = useState([]);
  const [sentimentData, setSentimentData] = useState({ companies: [] });
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sectorFilter, setSectorFilter] = useState('All');
  const [sentimentFilter, setSentimentFilter] = useState('All');
  const [view, setView] = useState('Tracker'); 
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [selectedCompanies, setSelectedCompanies] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12; // Increased for density
  
  useEffect(() => {
    const timestamp = Date.now();
    const baseUrl = import.meta.env.BASE_URL;
    
    Promise.all([
      fetch(`${baseUrl}data/rto_policies.json?t=${timestamp}`).then(r => r.json()),
      fetch(`${baseUrl}data/news.json?t=${timestamp}`).then(r => r.json()),
      fetch(`${baseUrl}data/meta.json?t=${timestamp}`).then(r => r.json()),
      fetch(`${baseUrl}data/sentiment-data.json?t=${timestamp}`).then(r => r.json()).catch(() => ({ companies: [] }))
    ]).then(([policies, newsItems, meta, sentiment]) => {
      // Phase 19: Default alphabetical sort
      const sortedPolicies = policies.sort((a, b) => a.company.localeCompare(b.company));
      setData(sortedPolicies);
      setNews(newsItems);
      setLastRefreshed(meta.lastRefreshed);
      setSentimentData(sentiment);
      setLoading(false);
    }).catch(err => console.error("Initialization error:", err));
  }, []);

  const sectors = useMemo(() => ['All', ...new Set(data.map(d => d.sector))].sort(), [data]);

  const filteredData = useMemo(() => {
    return data.filter(d => {
      const matchesSearch = d.company.toLowerCase().includes(search.toLowerCase());
      const matchesSector = sectorFilter === 'All' || d.sector === sectorFilter;
      const matchesSentiment = sentimentFilter === 'All' || 
        (sentimentFilter === 'Positive' && d.sentiment > 0) || 
        (sentimentFilter === 'Negative' && d.sentiment <= 0);
      return matchesSearch && matchesSector && matchesSentiment;
    });
  }, [data, search, sectorFilter, sentimentFilter]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage]);

  const totalPages = Math.ceil(filteredData.length / pageSize);

  const stats = useMemo(() => {
    if (!filteredData.length) return null;
    const total = filteredData.length;
    const hybrid = filteredData.filter(d => d.policy === 'Hybrid').length;
    const remote = filteredData.filter(d => d.policy === 'Remote-First').length;
    const office = filteredData.filter(d => d.policy === 'Full Office' || d.policy === 'Office-First').length;
    const avgSentiment = filteredData.reduce((acc, d) => acc + d.sentiment, 0) / total;
    
    return {
      total,
      hybridPercent: Math.round((hybrid / total) * 100),
      remotePercent: Math.round((remote / total) * 100),
      officePercent: Math.round((office / total) * 100),
      avgSentiment: parseFloat(avgSentiment.toFixed(2))
    };
  }, [filteredData]);

  const toggleExpand = (id) => {
    const next = new Set(expandedRows);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedRows(next);
  };

  const toggleSelect = (id) => {
    const next = new Set(selectedCompanies);
    if (next.has(id)) next.delete(id);
    else if (next.size < 3) next.add(id);
    setSelectedCompanies(next);
  };

  const compareList = useMemo(() => {
    return data.filter(d => selectedCompanies.has(d.id));
  }, [data, selectedCompanies]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background-gray flex items-center justify-center font-sans text-text-muted">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-purple border-t-transparent rounded-full animate-spin"></div>
          <p className="font-medium">Initializing Advanced Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background-gray flex flex-col overflow-hidden font-sans transition-all duration-500">
      
      {/* Header - Compact */}
      <header className="px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/20 glass-panel z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary-purple rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-purple/30 animate-in zoom-in duration-500">
            <Building2 size={18} />
          </div>
          <div>
            <h1 className="text-[18px] font-black text-text-primary leading-tight tracking-tight uppercase">Corporate RTO Dashboard</h1>
            <div className="flex items-center gap-1.5 text-text-light text-[9px] mt-0.5">
              <Globe size={11} className="text-primary-purple/60" />
              <span className="font-bold opacity-60 uppercase tracking-tighter text-text-muted">Live Tracker: Next-Gen Return-to-Office Intel</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {lastRefreshed && (
            <div className="bg-white/40 backdrop-blur-md border border-white/60 py-1.5 px-4 rounded-xl flex items-center gap-2 text-[9px] text-text-muted animate-in slide-in-from-right-4 duration-500">
              <div className="w-1.5 h-1.5 bg-positive rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
              <span className="font-black uppercase tracking-widest">Last Sync: {new Date(lastRefreshed).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area - Scrollable */}
      <main className="flex-1 overflow-y-auto px-6 py-4 scroll-smooth no-scrollbar">
        <div className="max-w-[1600px] mx-auto flex flex-col gap-4">
          
          {/* Stats Bar - Phase 17: Reduced whitespace */}
          {stats && view !== 'Compare' && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 animate-in fade-in slide-in-from-top-4 duration-700">
              <StatCard label="Total Tracking" value={stats.total} trend={12} icon={<Users />} />
              <StatCard label="Hybrid Policy" value={`${stats.hybridPercent}%`} trend={5} type="info" />
              <StatCard label="Remote Core" value={`${stats.remotePercent}%`} trend={-2} type="warning" />
              <StatCard label="Strict Office" value={`${stats.officePercent}%`} trend={8} type="danger" />
              <StatCard label="Avg Sentiment" value={stats.avgSentiment} trend={0.15} type="success" />
            </div>
          )}

          {/* Feature Header/Filter Bar - Phase 17: Reduced padding */}
          {view !== 'Compare' && (
            <div className="glass-panel rounded-2xl p-3 flex flex-col lg:flex-row items-center justify-between gap-4 animate-in fade-in duration-700">
              <div className="flex bg-white/40 p-1 rounded-xl border border-white/60 shadow-inner">
                <button 
                  onClick={() => setView('Tracker')}
                  className={`flex items-center gap-2 px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${view === 'Tracker' ? 'bg-primary-purple text-white shadow-lg' : 'text-text-light hover:bg-white/60'}`}
                >
                  <BarChart3 size={14} /> Tracker
                </button>
                <button 
                  onClick={() => setView('Map')}
                  className={`flex items-center gap-2 px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${view === 'Map' ? 'bg-primary-purple text-white shadow-lg' : 'text-text-light hover:bg-white/60'}`}
                >
                  <MapIcon size={14} /> Heatmap
                </button>
              </div>

              <div className="flex flex-1 items-center gap-3 w-full lg:max-w-xl">
                 <div className="relative flex-1 group">
                   <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-light/40 group-focus-within:text-primary-purple transition-colors">
                     <Search size={14} />
                   </div>
                   <input 
                    type="text" 
                    placeholder="Search high-impact organizations..." 
                    className="w-full bg-white/40 border border-white/60 focus:border-primary-purple/40 focus:bg-white rounded-xl pl-11 pr-4 py-2 text-[11px] font-bold outline-none transition-all shadow-sm"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                   />
                 </div>
                 
                 <div className="flex items-center gap-2">
                   <div className="relative group">
                     <select 
                      className="bg-white/40 border border-white/60 hover:border-primary-purple/40 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer appearance-none pr-10 shadow-sm"
                      value={sectorFilter}
                      onChange={(e) => { setSectorFilter(e.target.value); setCurrentPage(1); }}
                     >
                       {sectors.map(s => <option key={s} value={s}>{s === 'All' ? 'All Sectors' : s}</option>)}
                     </select>
                     <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-light/40 pointer-events-none">
                       <Filter size={12} />
                     </div>
                   </div>
                 </div>
              </div>
            </div>
          )}

          {/* Feature Grid - Phase 17: grid-cols-12 layout */}
          {view === 'Compare' ? (
            <ComparisonView 
              companies={compareList} 
              onBack={() => setView('Tracker')} 
              onRemove={(id) => toggleSelect(id)} 
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[600px]">
              
              {/* Left Column: Table & Pagination (8/12) */}
              <div className="lg:col-span-8 flex flex-col gap-4">
                <div className="glass-panel rounded-3xl flex-1 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="overflow-x-auto flex-1 custom-scrollbar">
                    <table className="w-full text-left border-collapse table-fixed">
                      <thead className="sticky top-0 z-10">
                        <tr className="bg-white/80 backdrop-blur-md border-b border-white/20">
                          <th className="p-4 w-12 text-center text-[8px] font-black text-text-muted uppercase tracking-tighter">Sel</th>
                          <th className="p-4 w-10"></th>
                          <th className="p-4 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] text-left">Company</th>
                          <th className="p-4 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] text-left">Policy</th>
                          <th className="p-4 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] text-left">Sentiment</th>
                          <th className="p-4 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] text-left w-24">Days</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {paginatedData.map((row, idx) => {
                          const sentimentDetail = sentimentData.companies.find(c => c.name === row.company);
                          const currentSentiment = sentimentDetail ? sentimentDetail.sentiment.overall_score : row.sentiment;
                          
                          return (
                            <React.Fragment key={row.id}>
                              <tr 
                                id={`row-${row.id}`}
                                className={`hover:bg-primary-purple/[0.04] transition-all duration-300 group cursor-pointer border-l-4 animate-in fade-in slide-in-from-left-2`}
                                style={{ 
                                  animationDelay: `${idx * 40}ms`, 
                                  borderLeftColor: expandedRows.has(row.id) ? '#7C5CFC' : 'transparent', 
                                  backgroundColor: expandedRows.has(row.id) ? 'rgba(124, 92, 252, 0.05)' : 'transparent' 
                                }}
                              >
                                <td className="p-3 border-transparent text-center" onClick={(e) => { e.stopPropagation(); toggleSelect(row.id); }}>
                                   <div className={`mx-auto w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${selectedCompanies.has(row.id) ? 'bg-primary-purple border-primary-purple shadow-lg shadow-primary-purple/20 scale-110' : 'border-text-light/20 group-hover:border-primary-purple/40 group-hover:bg-white'}`}>
                                      {selectedCompanies.has(row.id) && <Check size={12} className="text-white" strokeWidth={3} />}
                                   </div>
                                </td>
                                <td className="p-3 text-center" onClick={() => toggleExpand(row.id)}>
                                   <div className={`p-1.5 rounded-lg transition-all duration-300 ${expandedRows.has(row.id) ? 'bg-primary-purple/10' : 'group-hover:bg-primary-purple/10'}`}>
                                     {expandedRows.has(row.id) ? <ChevronUp size={16} className="text-primary-purple" /> : <ChevronDown size={16} className="text-text-light opacity-60 group-hover:opacity-100" />}
                                   </div>
                                </td>
                                <td className="p-3 truncate" onClick={() => toggleExpand(row.id)}>
                                  <div className="flex flex-col min-w-0">
                                    <span className="font-bold text-[13px] text-text-primary group-hover:text-primary-purple transition-all duration-300 truncate tracking-tight">{row.company}</span>
                                    <span className="text-[10px] font-bold text-text-light/60 truncate uppercase tracking-tighter">{row.sector}</span>
                                  </div>
                                </td>
                                <td className="p-3" onClick={() => toggleExpand(row.id)}><PolicyTag policy={row.policy} /></td>
                                <td className="p-3" onClick={() => toggleExpand(row.id)}>
                                  <div className="flex items-center gap-3">
                                    <SentimentGauge score={currentSentiment} />
                                    <div className="p-1 rounded bg-white/40 border border-white/60 shadow-sm">
                                      <SentimentSparkline data={sentimentDetail ? sentimentDetail.sparkline : (row.history ? row.history.map(h => h.sentiment) : [0])} />
                                    </div>
                                  </div>
                                </td>
                                <td className="p-3 font-bold text-[13px] text-text-primary" onClick={() => toggleExpand(row.id)}>{row.daysInOffice === 0 ? '—' : `${row.daysInOffice}d`}</td>
                              </tr>
                            
                              {expandedRows.has(row.id) && (
                                <tr key={`${row.id}-details`}>
                                  <td colSpan="6" className="bg-primary-purple/[0.01] p-6 border-b border-white/20 border-l-4 border-primary-purple shadow-inner">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
                                      
                                      <div className="glass-card rounded-2xl p-6">
                                        <h4 className="text-[10px] font-black text-text-muted uppercase tracking-[0.15em] mb-5 flex items-center gap-2">
                                          <div className="w-1.5 h-3.5 bg-primary-purple rounded-full" />
                                          VADER Intelligence
                                        </h4>
                                        <div className="space-y-4">
                                          {sentimentDetail ? Object.entries(sentimentDetail.sentiment.source_scores).map(([name, meta], i) => (
                                            <div key={i} className="flex flex-col gap-2">
                                              <div className="flex justify-between text-[10px] font-bold">
                                                <span className="text-text-primary/70 uppercase tracking-tighter">{name.replace('_', ' ')}</span>
                                                <span className={`flex items-center gap-1 ${meta.score > 0 ? 'text-positive' : 'text-negative'}`}>
                                                  {meta.score.toFixed(2)}
                                                </span>
                                              </div>
                                              <div className="h-2 bg-text-light/10 rounded-full overflow-hidden">
                                                <div 
                                                  className="h-full rounded-full transition-all duration-1000"
                                                  style={{ 
                                                    width: `${Math.min(100, Math.abs(meta.score) * 100)}%`,
                                                    backgroundColor: meta.score > 0 ? '#22C55E' : '#EF4444'
                                                  }}
                                                />
                                              </div>
                                            </div>
                                          )) : (
                                            <p className="text-[11px] text-text-light italic opacity-60">AI Analysis pending.</p>
                                          )}
                                        </div>
                                      </div>
       
                                      <div className="glass-card rounded-2xl p-6 flex flex-col">
                                        <h4 className="text-[10px] font-black text-text-muted uppercase tracking-[0.15em] mb-5 flex items-center gap-2">
                                           <div className="w-1.5 h-3.5 bg-blue-400 rounded-full" />
                                           Historical Trend
                                        </h4>
                                        <div className="flex-1 min-h-[120px]">
                                          <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={(sentimentDetail ? sentimentDetail.sparkline : row.history.map(h => h.sentiment)).map((s, i) => ({ val: s, idx: i }))}>
                                              <Line type="monotone" dataKey="val" stroke="#7C5CFC" strokeWidth={3} dot={false} />
                                              <YAxis hide domain={['auto', 'auto']} />
                                              <Tooltip 
                                                contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)', borderRadius: '16px', border: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.1)', fontSize: '11px' }}
                                                labelStyle={{ display: 'none' }}
                                              />
                                            </LineChart>
                                          </ResponsiveContainer>
                                        </div>
                                      </div>
       
                                      <div className="glass-card rounded-2xl p-6">
                                        <h4 className="text-[10px] font-black text-text-muted uppercase tracking-[0.15em] mb-5 flex items-center gap-2">
                                           <div className="w-1.5 h-3.5 bg-warning rounded-full" />
                                           Signal Sources
                                        </h4>
                                        <div className="space-y-2">
                                          {(sentimentDetail ? sentimentDetail.top_headlines : row.history.slice(0, 3).map(h => ({ title: `Shift in ${h.month}`, source: "Archive", url: "#" }))).map((head, i) => (
                                            <a key={i} href={head.url} target="_blank" rel="noopener noreferrer" className="block p-3 bg-white/40 border border-white/60 rounded-2xl text-[10px] hover:bg-white hover:border-primary-purple transition-all duration-300">
                                              <p className="font-bold text-text-primary line-clamp-2 leading-tight tracking-tight">{head.title}</p>
                                              <div className="flex justify-between mt-2 text-[8px] font-black text-text-light/60 uppercase tracking-tighter">
                                                <span className="flex items-center gap-1.5 "><Globe size={10} className="text-primary-purple/40" /> {head.source}</span>
                                              </div>
                                            </a>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Table Pagination - Phase 17: Moved to Left Column */}
                <div className="p-3 px-6 glass-panel rounded-2xl flex justify-between items-center shadow-sm">
                  <span className="text-[9px] text-text-light font-black uppercase tracking-[0.2em] opacity-60">
                    Page <span className="text-primary-purple">{currentPage}</span> of {totalPages} 
                    <span className="mx-3 opacity-20">/</span> 
                    {filteredData.length} Tracked Organizations
                  </span>
                  <div className="flex gap-2">
                    <button 
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(p => p - 1)}
                      className="px-4 py-1.5 bg-white/60 border border-white/80 rounded-xl text-[9px] font-black uppercase tracking-widest disabled:opacity-20 hover:bg-white hover:border-primary-purple hover:text-primary-purple transition-all active:scale-95 shadow-sm"
                    >
                      Prev
                    </button>
                    <button 
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(p => p + 1)}
                      className="px-4 py-1.5 bg-white/60 border border-white/80 rounded-xl text-[9px] font-black uppercase tracking-widest disabled:opacity-20 hover:bg-white hover:border-primary-purple hover:text-primary-purple transition-all active:scale-95 shadow-sm"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Widgets (4/12) */}
              <div className="lg:col-span-4 flex flex-col gap-5">
                {view === 'Map' ? (
                   <div className="h-full glass-panel rounded-3xl overflow-hidden p-2 flex flex-col">
                     <h3 className="p-4 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Geographic Density</h3>
                     <div className="flex-1">
                        <GeographicHeatmap data={filteredData} />
                     </div>
                   </div>
                ) : (
                  <>
                    <div className="h-[45%]">
                      <NewsWidget news={news} />
                    </div>
                    <div className="flex-1">
                      <PolicyWatchList data={data} />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Floating Compare Button */}
      {selectedCompanies.size >= 2 && view !== 'Compare' && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-12 duration-700">
          <button 
            onClick={() => setView('Compare')}
            className="flex items-center gap-3 bg-primary-purple text-white px-8 py-3.5 rounded-2xl shadow-[0_20px_50px_rgba(124,92,252,0.4)] font-black hover:scale-105 active:scale-95 transition-all text-[12px] uppercase tracking-widest"
          >
            <Users size={18} />
            Compare {selectedCompanies.size} Companies
          </button>
        </div>
      )}

      <footer className="py-2.5 glass-panel border-t border-white/20 text-center text-text-light/40 text-[9px] font-black uppercase tracking-[0.3em]">
        Built by Ram Srinivasan &copy; 2026 • AI Sentiment Engine v2.4
      </footer>
    </div>
  );
}
