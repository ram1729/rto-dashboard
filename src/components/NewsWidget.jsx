import React, { useState, useEffect } from 'react';
import { Newspaper, ExternalLink } from 'lucide-react';

const NewsWidget = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Add cache-busting timestamp to prevent stale news
    const timestamp = Math.floor(Date.now() / 60000); // 1-minute cache window
    const url = `${import.meta.env.BASE_URL}data/news.json?v=${timestamp}`;
    
    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        setNews(data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("NewsWidget fetch error: ", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="panel news-panel">
      <h3 className="news-title">
        <Newspaper size={18} className="icon-accent" />
        Top RTO News of the Day
      </h3>
      
      {loading && <div className="news-loading">Scanning major journals...</div>}
      
      {error && (
        <div className="news-meta" style={{ padding: '0.5rem' }}>
          Could not load live news. Showing latest tracked policies below.
        </div>
      )}

      {!loading && !error && news.length === 0 && (
        <div className="news-meta" style={{ padding: '0.5rem' }}>
          No major news breakages in the last 24 hours.
        </div>
      )}

      {news.length > 0 && (
        <ul className="news-list">
          {news.slice(0, 5).map((item, index) => (
            <li key={item.id || index} className="news-item">
              <a href={item.link} target="_blank" rel="noopener noreferrer" className="news-link">
                <span className="news-text">{item.title}</span>
                <ExternalLink size={14} className="news-icon-external" />
              </a>
              <div className="news-meta">
                <span className="news-journal-tag">{item.source}</span>
                <span className="news-date">
                  {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NewsWidget;
