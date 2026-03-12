import React, { useState, useEffect } from 'react';
import { Newspaper, ExternalLink } from 'lucide-react';

const NewsWidget = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/news.json`)
      .then(res => res.json())
      .then(data => {
        setNews(data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching news: ", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="panel news-panel">
        <h3 className="news-title">
          <Newspaper size={18} className="icon-accent" />
          Latest RTO Headlines
        </h3>
        <div className="news-loading">Loading news...</div>
      </div>
    );
  }

  if (news.length === 0) {
    return null; /* Don't render if no news */
  }

  return (
    <div className="panel news-panel">
      <h3 className="news-title">
        <Newspaper size={18} className="icon-accent" />
        Latest RTO Headlines
      </h3>
      <ul className="news-list">
        {news.map((item, index) => (
          <li key={item.id || index} className="news-item">
            <a href={item.link} target="_blank" rel="noopener noreferrer" className="news-link">
              <span className="news-text">{item.title}</span>
              <ExternalLink size={14} className="news-icon-external" />
            </a>
            <div className="news-meta">
              <span>{item.source}</span>
              <span className="news-date">
                {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NewsWidget;
