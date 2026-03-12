import { useState, useEffect, useMemo } from 'react';
import { Building2, Globe, Search, Filter } from 'lucide-react';
import MetricsCards from './components/MetricsCards';
import PolicyCharts from './components/PolicyCharts';
import CompanyTable from './components/CompanyTable';
import './index.css';

function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sectorFilter, setSectorFilter] = useState('All');
  
  useEffect(() => {
    fetch('/data/rto_policies.json')
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => console.error("Error fetching data: ", err));
  }, []);

  const sectors = useMemo(() => {
    const s = new Set(data.map(d => d.sector));
    return ['All', ...Array.from(s)].sort();
  }, [data]);

  const filteredData = useMemo(() => {
    return data.filter(d => {
      const matchesSearch = d.company.toLowerCase().includes(search.toLowerCase());
      const matchesSector = sectorFilter === 'All' || d.sector === sectorFilter;
      return matchesSearch && matchesSector;
    });
  }, [data, search, sectorFilter]);

  if (loading) {
    return (
      <div className="loading-screen">
        Loading RTO Data...
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="title-group">
          <div className="header-icon-box">
            <Building2 size={28} className="icon-accent" />
          </div>
          <div>
            <h1>Corporate RTO Dashboard</h1>
            <p className="subtitle">
              <Globe size={16} /> Live tracker of Return-to-Office policies for top 100 companies
            </p>
          </div>
        </div>
      </header>

      {/* Main Layout Area: 2 Columns */}
      <main className="main-layout">
        
        {/* Left Column: Controls & Analytics */}
        <section className="left-column">
          {/* Controls */}
          <div className="panel controls-group">
            <div className="input-wrapper search-wrapper">
              <Search className="input-icon" size={20} />
              <input 
                type="text" 
                placeholder="Search companies..." 
                className="basic-input"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="input-wrapper filter-wrapper">
              <Filter className="input-icon" size={20} />
              <select 
                className="basic-input select-input"
                value={sectorFilter}
                onChange={e => setSectorFilter(e.target.value)}
              >
                {sectors.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <MetricsCards data={filteredData} />
          <PolicyCharts data={filteredData} />
        </section>

        {/* Right Column: Scrolling Table */}
        <section className="right-column panel">
           <CompanyTable data={filteredData} />
        </section>

      </main>

      <footer className="app-footer">
        Built by Ram Srinivasan
      </footer>
    </div>
  );
}

export default App;
