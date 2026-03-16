import { useState, useEffect, useMemo } from 'react';
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

// --- Sub-Components ---

const StatCard = ({ label, value, subText, trend, icon: Icon }) => (
  <div className="bg-card-surface border border-[#E8E8EC] rounded-[12px] p-[24px] flex flex-col gap-1 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start">
      <span className="text-text-muted text-[12px] font-medium uppercase tracking-wider">{label}</span>
      {Icon && <Icon className="text-text-light" size={16} />}
    </div>
    <div className="flex items-baseline gap-2 mt-1">
      <span className="text-text-primary text-[32px] font-bold leading-none">{value}</span>
      {trend && (
        <span className={`text-[11px] font-bold flex items-center ${trend.includes('↗') ? 'text-positive' : 'text-negative'}`}>
          {trend}
        </span>
      )}
    </div>
    <span className="text-text-light text-[11px] font-medium">{subText}</span>
  </div>
);

const PolicyTag = ({ policy }) => {
  const styles = {
    'Hybrid': 'tag-hybrid',
    'Full Office': 'tag-office',
    'Remote-First': 'tag-remote',
    'Office-First': 'tag-office'
  };
  return <span className={`tag ${styles[policy] || 'tag-office'}`}>{policy}</span>;
};

const ComparisonView = ({ companies, onBack, onRemove }) => {
  if (!companies.length) return null;
  
  return (
    <div className="bg-white border border-[#E8E8EC] rounded-[12px] p-8 min-h-[600px] animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-12">
        <button onClick={onBack} className="flex items-center gap-2 text-primary-purple font-bold text-[14px] hover:underline">
          ← Back to Tracker
        </button>
        <h3 className="text-[20px] font-bold text-text-primary">Side-by-Side Comparison</h3>
        <div className="text-[12px] text-text-light">{companies.length}/3 selected</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border-x border-[#E8E8EC]">
        {companies.map((c, idx) => (
          <div key={idx} className={`flex flex-col border-r last:border-r-0 border-[#E8E8EC] ${idx === 0 ? 'border-l' : ''}`}>
            {/* Header */}
            <div className="p-6 border-b border-[#E8E8EC] relative bg-[#FCFCFD]">
              <button onClick={() => onRemove(c.id)} className="absolute top-4 right-4 text-text-light hover:text-negative transition-colors">×</button>
              <h4 className="text-[18px] font-bold text-text-primary leading-tight mb-1">{c.company}</h4>
              <p className="text-[12px] text-text-light">{c.sector}</p>
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

const SentimentSparkline = ({ data }) => (
  <svg width="40" height="16" className="overflow-visible">
    <polyline
      fill="none"
      stroke="#7C5CFC"
      strokeWidth="1.5"
      points={data.map((d, i) => `${(i * 3.5)},${8 - d * 8}`).join(' ')}
    />
  </svg>
);

const SentimentGauge = ({ score }) => {
  const color = score > 0 ? 'text-positive' : 'text-negative';
  return (
    <div className={`flex items-center gap-1 font-bold ${color}`}>
      {score > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
      {score > 0 ? '+' : ''}{score.toFixed(2)}
    </div>
  );
};

const GeographicHeatmap = ({ data }) => {
  // Simplified US SVG Path (proportional outline)
  const usPath = "M 50,290 C 20,290 0,260 0,230 C 0,160 30,130 60,110 C 90,90 130,80 180,90 C 230,100 270,110 320,110 C 370,110 420,100 470,90 C 520,80 570,90 610,110 C 650,130 680,150 700,180 C 720,210 720,240 700,270 C 680,300 640,320 600,340 C 560,360 520,380 480,400 C 440,420 400,430 350,430 C 300,430 250,420 200,400 C 150,380 100,340 70,320 Z";
  
  // Mapping coords to SVG space (roughly)
  // Lat: 25 to 50 -> 430 to 90
  // Lng: -125 to -65 -> 50 to 700
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
    <div className="bg-card-surface border border-[#E8E8EC] rounded-[12px] p-6 mb-8 relative overflow-hidden group">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-[18px] font-semibold text-text-primary">Geographic RTO Heatmap</h3>
          <p className="text-[12px] text-text-light">HQ concentrations and local policy pulses</p>
        </div>
      </div>
      
      <div className="relative h-[480px] w-full bg-[#fdfdfd] rounded-xl flex items-center justify-center border border-dashed border-[#E8E8EC] p-4">
        <svg viewBox="0 0 800 500" className="w-full h-full drop-shadow-sm">
          <path d={usPath} fill="#f8fafc" stroke="#e2e8f0" strokeWidth="2" />
          {data.map((company, idx) => {
            const pos = getPos(company.hq.lat, company.hq.lng);
            const color = company.policy === 'Full Office' ? '#374151' : company.policy === 'Hybrid' ? '#7C5CFC' : '#3B82F6';
            const size = company.mentionVolume > 4000 ? 12 : company.mentionVolume > 2000 ? 8 : 5;
            return (
              <circle 
                key={idx} 
                cx={pos.x} cy={pos.y} r={size} 
                fill={color} fillOpacity={hovered === company.id ? "1" : "0.6"} 
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
            className="absolute bg-white border border-[#E8E8EC] p-3 rounded-lg shadow-xl pointer-events-none z-50 animate-in fade-in zoom-in duration-200"
            style={{ 
              left: getPos(data.find(d => d.id === hovered).hq.lat, data.find(d => d.id === hovered).hq.lng).x - 50,
              top: getPos(data.find(d => d.id === hovered).hq.lat, data.find(d => d.id === hovered).hq.lng).y - 80
            }}
          >
            <p className="font-bold text-[13px] text-text-primary">{data.find(d => d.id === hovered).company}</p>
            <div className="flex items-center gap-2 mt-1">
              <PolicyTag policy={data.find(d => d.id === hovered).policy} />
              <span className="text-[11px] font-bold text-text-muted">{data.find(d => d.id === hovered).daysInOffice}d office</span>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="absolute bottom-6 right-6 flex gap-4 bg-white/80 backdrop-blur-sm p-3 rounded-lg border border-[#E8E8EC]">
        <div className="flex items-center gap-2 text-[10px] font-bold text-text-muted">
          <div className="w-3 h-3 rounded-full bg-policy-office opacity-60" /> Full Office
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold text-text-muted">
          <div className="w-3 h-3 rounded-full bg-policy-hybrid opacity-60" /> Hybrid
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold text-text-muted">
          <div className="w-3 h-3 rounded-full bg-policy-remote opacity-60" /> Remote
        </div>
      </div>
    </div>
  );
};

const PolicyWatchList = ({ data }) => {
  const predictions = useMemo(() => {
    return data.filter(d => d.prediction).sort((a,b) => b.prediction.probability - a.prediction.probability).slice(0, 5);
  }, [data]);

  return (
    <div className="bg-card-surface border border-[#E8E8EC] rounded-[12px] p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <h3 className="text-[18px] font-semibold text-text-primary">🔮 Policy Shift Watch List</h3>
      </div>
      <div className="space-y-6">
        {predictions.map((item, idx) => (
          <div key={idx} className="flex flex-col gap-2 group cursor-pointer">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[14px] font-bold text-text-primary group-hover:text-primary-purple transition-colors">{item.company}</p>
                <p className="text-[11px] text-text-light">{item.sector}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <PolicyTag policy={item.policy} />
                <span className="text-text-muted">→</span>
                <PolicyTag policy={item.prediction.nextPolicy} />
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex-1 h-1.5 bg-background-gray rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${item.prediction.probability > 65 ? 'bg-primary-purple' : item.prediction.probability > 40 ? 'bg-warning' : 'bg-text-light'}`}
                  style={{ width: `${item.prediction.probability}%` }}
                />
              </div>
              <span className="text-[11px] font-bold text-text-primary">{item.prediction.probability}%</span>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-background-gray text-text-muted rounded uppercase tracking-wider">{item.prediction.timeframe}</span>
            </div>

            <div className="flex flex-wrap gap-1.5 mt-1">
              {item.prediction.signals.map((sig, i) => (
                <span key={i} className="text-[10px] font-medium border border-[#E8E8EC] px-2 py-0.5 rounded text-text-light">
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

// --- Main App ---

export default function App() {
  const [data, setData] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sectorFilter, setSectorFilter] = useState('All');
  const [sentimentFilter, setSentimentFilter] = useState('All');
  const [view, setView] = useState('Tracker'); // Tracker | Compare | Map
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [selectedCompanies, setSelectedCompanies] = useState(new Set());
  
  useEffect(() => {
    const timestamp = Date.now();
    const baseUrl = import.meta.env.BASE_URL;
    
    Promise.all([
      fetch(`${baseUrl}data/rto_policies.json?t=${timestamp}`).then(r => r.json()),
      fetch(`${baseUrl}data/news.json?t=${timestamp}`).then(r => r.json()),
      fetch(`${baseUrl}data/meta.json?t=${timestamp}`).then(r => r.json())
    ]).then(([policies, newsItems, meta]) => {
      setData(policies);
      setNews(newsItems);
      setLastRefreshed(meta.lastRefreshed);
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
    <div className="min-h-screen bg-background-gray p-6 lg:p-8 font-sans transition-all duration-500">
      
      {/* Header */}
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary-purple rounded-[12px] flex items-center justify-center text-white shadow-lg shadow-primary-purple/20">
            <Building2 size={24} />
          </div>
          <div>
            <h1 className="text-[28px] font-bold text-text-primary leading-tight">Corporate RTO Dashboard</h1>
            <div className="flex items-center gap-2 text-text-light text-[12px] mt-0.5">
              <Globe size={14} />
              <span>Live tracker of Return-to-Office policies for top companies</span>
            </div>
          </div>
        </div>
        
        {lastRefreshed && (
          <div className="bg-white border border-[#E8E8EC] py-2 px-4 rounded-full flex items-center gap-3 text-[12px] text-text-muted">
            <div className="w-2 h-2 bg-positive rounded-full animate-pulse" />
            <span>Updated: {new Date(lastRefreshed).toLocaleDateString()} at {new Date(lastRefreshed).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
          </div>
        )}
      </header>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard label="Total Tracked" value={stats.total} subText="Companies analyzed" icon={Users} />
        <StatCard label="Hybrid" value={`${stats.hybridPercent}%`} subText="2-3 Days/Wk" icon={Check} />
        <StatCard label="Office-First" value={`${stats.officePercent}%`} subText="4+ Days/Wk" icon={Building2} />
        <StatCard label="Remote-First" value={`${stats.remotePercent}%`} subText="Fully Flexible" icon={Globe} />
        <StatCard 
          label="Sentiment Summary" 
          value={stats.avgSentiment} 
          trend={stats.avgSentiment > 0 ? "↗ Improving" : "↘ Declining"}
          subText="Industry Pulse Score" 
          icon={MessageSquare}
        />
      </div>

      {/* Full-width Map Section (Phase 12) */}
      {(view === 'Map' || view === 'Tracker') && <GeographicHeatmap data={filteredData} />}

      {/* Feature Toggles & Filters */}
      <div className="mb-6 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        <div className="flex items-center bg-white p-1 rounded-xl border border-[#E8E8EC]">
          {['Tracker', 'Compare', 'Map'].map(t => (
            <button
              key={t}
              onClick={() => setView(t)}
              className={`px-6 py-2 rounded-lg text-[13px] font-semibold transition-all ${
                view === t ? 'bg-primary-purple text-white shadow-md' : 'text-text-muted hover:text-text-primary'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light group-focus-within:text-primary-purple transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search companies..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-white border border-[#E8E8EC] pl-10 pr-4 py-2.5 rounded-xl text-[14px] w-64 focus:outline-none focus:border-primary-purple focus:ring-2 focus:ring-primary-purple/10 transition-all"
            />
          </div>
          <div className="flex items-center gap-2 bg-white border border-[#E8E8EC] p-1.5 rounded-xl">
            <Filter size={16} className="text-text-light ml-2" />
            <select
              value={sectorFilter}
              onChange={e => setSectorFilter(e.target.value)}
              className="bg-transparent text-[13px] font-medium text-text-muted border-none outline-none pr-4"
            >
              {sectors.map(s => <option key={s} value={s}>{s === 'All' ? 'All Sectors' : s}</option>)}
            </select>
            <div className="w-[1px] h-4 bg-[#E8E8EC]" />
            <select
              value={sentimentFilter}
              onChange={e => setSentimentFilter(e.target.value)}
              className="bg-transparent text-[13px] font-medium text-text-muted border-none outline-none pr-4"
            >
              <option value="All">All Sentiment</option>
              <option value="Positive">Positive Only</option>
              <option value="Negative">Negative Only</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* Left Col: Analytics */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          <div className="bg-card-surface border border-[#E8E8EC] rounded-[12px] p-[24px]">
            <h3 className="text-[18px] font-semibold text-text-primary mb-6">Overall Policy Distribution</h3>
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Full Office', value: stats.officePercent },
                      { name: 'Hybrid', value: stats.hybridPercent },
                      { name: 'Remote', value: stats.remotePercent },
                    ]}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    <Cell fill="#374151" />
                    <Cell fill="#7C5CFC" />
                    <Cell fill="#3B82F6" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-card-surface border border-[#E8E8EC] rounded-[12px] p-[24px]">
             <h3 className="text-[18px] font-semibold text-text-primary mb-2">Top RTO News of the Day</h3>
             <div className="space-y-4 mt-6">
               {news.slice(0, 5).map((item, idx) => (
                 <div key={idx} className="group cursor-pointer">
                    <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-[14px] font-semibold text-text-primary hover:text-primary-purple flex items-start gap-2 leading-snug">
                       {item.title}
                       <ExternalLink size={12} className="min-w-[12px] opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
                    </a>
                    <div className="flex items-center gap-2 mt-2">
                       <span className="text-[10px] font-bold uppercase bg-purple-light text-primary-purple px-2 py-0.5 rounded">
                         {item.source}
                       </span>
                       <span className="text-[10px] text-text-light">{new Date(item.date).toLocaleDateString()}</span>
                    </div>
                 </div>
               ))}
             </div>
          </div>

          <PolicyWatchList data={filteredData} />
        </div>

        {/* Right Col: Table / Comparison */}
        <div className="xl:col-span-8 flex flex-col gap-6 min-w-0">
          {view === 'Compare' ? (
            <ComparisonView 
              companies={compareList} 
              onBack={() => setView('Tracker')} 
              onRemove={(id) => toggleSelect(id)} 
            />
          ) : (
            <div className={`bg-card-surface border border-[#E8E8EC] rounded-[12px] p-0 overflow-hidden shadow-sm transition-opacity duration-300 ${view === 'Map' ? 'opacity-30 pointer-events-none' : ''}`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-background-gray border-b border-[#E8E8EC]">
                      <th className="p-4 w-10"></th>
                      <th className="p-4 w-10"></th>
                      <th className="p-4 text-[12px] font-bold text-text-muted uppercase tracking-wider">Company</th>
                      <th className="p-4 text-[12px] font-bold text-text-muted uppercase tracking-wider">Policy</th>
                      <th className="p-4 text-[12px] font-bold text-text-muted uppercase tracking-wider">Sentiment</th>
                      <th className="p-4 text-[12px] font-bold text-text-muted uppercase tracking-wider">Office Days</th>
                      <th className="p-4 text-[12px] font-bold text-text-muted uppercase tracking-wider">Updated</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F8F8FA]">
                    {filteredData.map(row => (
                      <span key={row.id} className="contents">
                        <tr 
                          id={`row-${row.id}`}
                          className={`hover:bg-purple-light/30 transition-colors group cursor-pointer ${expandedRows.has(row.id) ? 'bg-purple-light/20' : ''}`}
                        >
                          <td className="p-4 pl-6" onClick={(e) => { e.stopPropagation(); toggleSelect(row.id); }}>
                             <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${selectedCompanies.has(row.id) ? 'bg-primary-purple border-primary-purple shadow-sm' : 'border-[#E8E8EC]'}`}>
                                {selectedCompanies.has(row.id) && <Check size={14} className="text-white" />}
                             </div>
                          </td>
                          <td className="p-4" onClick={() => toggleExpand(row.id)}>
                             {expandedRows.has(row.id) ? <ChevronUp size={16} className="text-primary-purple" /> : <ChevronDown size={16} className="text-text-light" />}
                          </td>
                          <td className="p-4" onClick={() => toggleExpand(row.id)}>
                            <div className="flex flex-col">
                              <span className="font-bold text-text-primary group-hover:text-primary-purple transition-colors">{row.company}</span>
                              <span className="text-[11px] text-text-light">{row.sector}</span>
                            </div>
                          </td>
                          <td className="p-4" onClick={() => toggleExpand(row.id)}><PolicyTag policy={row.policy} /></td>
                          <td className="p-4" onClick={() => toggleExpand(row.id)}>
                            <div className="flex items-center gap-3">
                              <SentimentGauge score={row.sentiment} />
                              <SentimentSparkline data={row.history ? row.history.map(h => h.sentiment) : [0]} />
                            </div>
                          </td>
                          <td className="p-4 font-bold text-text-primary" onClick={() => toggleExpand(row.id)}>{row.daysInOffice === 0 ? '—' : row.daysInOffice}</td>
                          <td className="p-4 text-text-light text-[12px] whitespace-nowrap" onClick={() => toggleExpand(row.id)}>{row.lastUpdate}</td>
                        </tr>
                        
                        {expandedRows.has(row.id) && (
                          <tr>
                            <td colSpan="7" className="bg-[#FCFCFD] p-6 border-b border-[#E8E8EC]">
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-top-2 duration-300">
                                
                                {/* Sentiment Breakdown */}
                                <div>
                                  <h4 className="text-[12px] font-bold text-text-muted uppercase mb-4">Source Breakdown</h4>
                                  <div className="space-y-4">
                                    {[
                                      { name: 'Blind', score: row.sentiment * 0.8, color: '#374151' },
                                      { name: 'Glassdoor', score: row.sentiment * 1.2, color: '#22C55E' },
                                      { name: 'X/Twitter', score: row.sentiment * 0.9, color: '#000000' }
                                    ].map((source, i) => (
                                      <div key={i} className="flex flex-col gap-1.5">
                                        <div className="flex justify-between text-[11px] font-bold">
                                          <span className="text-text-primary">{source.name}</span>
                                          <span className={source.score > 0 ? 'text-positive' : 'text-negative'}>{source.score.toFixed(2)}</span>
                                        </div>
                                        <div className="h-2 bg-[#E8E8EC] rounded-full overflow-hidden">
                                          <div 
                                            className="h-full rounded-full transition-all duration-1000"
                                            style={{ 
                                              width: `${Math.abs(source.score) * 100}%`,
                                              backgroundColor: source.score > 0 ? '#22C55E' : '#EF4444'
                                            }}
                                          />
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Sentiment History */}
                                <div className="lg:col-span-1 h-[140px]">
                                  <h4 className="text-[12px] font-bold text-text-muted uppercase mb-4">12-Month Sentiment</h4>
                                  <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={row.history}>
                                      <Line type="monotone" dataKey="sentiment" stroke="#7C5CFC" strokeWidth={2} dot={false} />
                                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8E8EC" />
                                      <XAxis dataKey="month" hide />
                                      <YAxis hide domain={['auto', 'auto']} />
                                    </LineChart>
                                  </ResponsiveContainer>
                                </div>

                                {/* Pulse Quotes */}
                                <div>
                                  <h4 className="text-[12px] font-bold text-text-muted uppercase mb-4">Pulse Quotes</h4>
                                  <div className="space-y-3">
                                    {[
                                      "Company transparency regarding RTO could be better.",
                                      "Enjoying the hybrid flexibility while it lasts.",
                                      "The productivity impact of the office and commute is real."
                                    ].map((quote, i) => (
                                      <div key={i} className="p-3 bg-white border border-[#E8E8EC] rounded-lg text-[11px] italic text-text-muted">
                                        "{quote}"
                                      </div>
                                    ))}
                                  </div>
                                </div>

                              </div>
                            </td>
                          </tr>
                        )}
                      </span>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Floating Compare Button (Phase 13) */}
      {selectedCompanies.size >= 2 && view !== 'Compare' && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-8 duration-500">
          <button 
            onClick={() => setView('Compare')}
            className="flex items-center gap-3 bg-primary-purple text-white px-8 py-4 rounded-full shadow-2xl shadow-primary-purple/40 font-bold hover:scale-105 active:scale-95 transition-all text-[15px]"
          >
            <Users size={20} />
            Compare {selectedCompanies.size} Selected
          </button>
        </div>
      )}

      <footer className="mt-12 pt-8 border-t border-[#E8E8EC] text-center text-text-light text-[12px]">
        Built by Ram Srinivasan &copy; 2026 Corporate RTO Dashboard 2.0
      </footer>
    </div>
  );
}
