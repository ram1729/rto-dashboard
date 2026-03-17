import os
import json
import time
import requests
import feedparser
from datetime import datetime, timedelta
from bs4 import BeautifulSoup
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

# Configuration
COMPANIES = [
    "Amazon", "Apple", "Google", "Meta", "Microsoft", 
    "JPMorgan Chase", "Goldman Sachs", "Bank of America", 
    "Salesforce", "AT&T", "Disney", "Dell", "Tesla", 
    "Caterpillar", "Cisco"
]

USER_AGENT = "RTO-Dashboard-Bot/1.0 (github.com/ram1729/rto-dashboard; research project)"
HEADERS = {"User-Agent": USER_AGENT}
DATA_FILE = "data/sentiment-data.json"

analyzer = SentimentIntensityAnalyzer()

def get_google_news_sentiment(company):
    articles = []
    query = f"{company} return to office"
    url = f"https://news.google.com/rss/search?q={query}&hl=en-US&gl=US&ceid=US:en"
    
    try:
        feed = feedparser.parse(url)
        for entry in feed.entries[:20]:
            text = f"{entry.title} {getattr(entry, 'summary', '')}"
            score = analyzer.polarity_scores(text)['compound']
            articles.append({
                "title": entry.title,
                "source": getattr(entry, 'source', {}).get('title', 'Google News'),
                "url": entry.link,
                "date": datetime(*entry.published_parsed[:6]).strftime("%Y-%m-%d") if hasattr(entry, 'published_parsed') else datetime.now().strftime("%Y-%m-%d"),
                "sentiment_score": score
            })
    except Exception as e:
        print(f"  [Error] Google News for {company}: {e}")
    
    return articles

def get_hn_sentiment(company):
    articles = []
    thirty_days_ago = int((datetime.now() - timedelta(days=30)).timestamp())
    url = f"https://hn.algolia.com/api/v1/search?query={company}+RTO&tags=story&numericFilters=created_at_i>{thirty_days_ago}"
    
    try:
        response = requests.get(url, headers=HEADERS, timeout=10)
        data = response.json()
        for hit in data.get('hits', [])[:15]:
            text = f"{hit['title']}"
            score = analyzer.polarity_scores(text)['compound']
            articles.append({
                "title": hit['title'],
                "source": "Hacker News",
                "url": f"https://news.ycombinator.com/item?id={hit['objectID']}",
                "date": datetime.fromtimestamp(hit['created_at_i']).strftime("%Y-%m-%d"),
                "sentiment_score": score
            })
    except Exception as e:
        print(f"  [Error] HN for {company}: {e}")
    
    return articles

def get_reddit_sentiment(company):
    articles = []
    url = f"https://www.reddit.com/search.rss?q={company}+return+to+office&t=month&sort=relevance"
    
    try:
        feed = feedparser.parse(url)
        for entry in feed.entries[:15]:
            text = f"{entry.title} {getattr(entry, 'summary', '')}"
            score = analyzer.polarity_scores(text)['compound']
            articles.append({
                "title": entry.title,
                "source": "Reddit",
                "url": entry.link,
                "date": datetime(*entry.published_parsed[:6]).strftime("%Y-%m-%d") if hasattr(entry, 'published_parsed') else datetime.now().strftime("%Y-%m-%d"),
                "sentiment_score": score
            })
        time.sleep(2) # Respect Reddit rate limits
    except Exception as e:
        print(f"  [Error] Reddit for {company}: {e}")
    
    return articles

def get_gdelt_sentiment(company):
    articles = []
    url = f"https://api.gdeltproject.org/api/v2/doc/doc?query={company} return to office&mode=artlist&maxrecords=20&format=json&timespan=30d"
    
    try:
        response = requests.get(url, headers=HEADERS, timeout=15)
        data = response.json()
        for art in data.get('articles', []):
            # GDELT tone is -100 to 100, normalize to -1 to 1
            tone = float(art.get('tone', 0)) / 100.0
            articles.append({
                "title": art['title'],
                "source": art['sourcecommon'],
                "url": art['url'],
                "date": art['seendate'][:10],
                "sentiment_score": tone
            })
    except Exception as e:
        print(f"  [Error] GDELT for {company}: {e}")
    
    return articles

def run():
    print(f"Starting RTO Sentiment Scraper at {datetime.now().isoformat()}")
    
    existing_data = {"companies": []}
    if os.path.exists(DATA_FILE):
        try:
            with open(DATA_FILE, 'r') as f:
                existing_data = json.load(f)
        except:
            pass

    results = []
    log = {"errors": [], "total_scraped": 0}
    start_time = time.time()

    for company in COMPANIES:
        print(f"Analyzing {company}...")
        
        sources = {
            "google_news": get_google_news_sentiment(company),
            "hackernews": get_hn_sentiment(company),
            "reddit": get_reddit_sentiment(company),
            "gdelt": get_gdelt_sentiment(company)
        }

        # Weighted calculation
        # GDELT (30%), Google (30%), Reddit (25%), HN (15%)
        source_scores = {}
        total_articles = 0
        weighted_sum = 0
        weights_used = 0
        
        weights = {"gdelt": 0.3, "google_news": 0.3, "reddit": 0.25, "hackernews": 0.15}
        
        for name, articles in sources.items():
            count = len(articles)
            if count > 0:
                avg = sum(a['sentiment_score'] for a in articles) / count
                source_scores[name] = {"score": round(avg, 2), "count": count}
                weighted_sum += avg * weights[name]
                weights_used += weights[name]
                total_articles += count
            else:
                source_scores[name] = {"score": 0, "count": 0}

        score = weighted_sum / weights_used if weights_used > 0 else 0
        
        # History & Trend
        prev_score = 0
        sparkline = [round(score, 2)]
        for c in existing_data.get('companies', []):
            if c['name'] == company:
                prev_score = c['sentiment'].get('overall_score', 0)
                sparkline = (c.get('sparkline', []) + [round(score, 2)])[-30:]
                break

        trend = "stable"
        if score > prev_score + 0.05: trend = "improving"
        elif score < prev_score - 0.05: trend = "declining"

        confidence = "low"
        if total_articles >= 10: confidence = "high"
        elif total_articles >= 5: confidence = "medium"

        # Top Headlines
        all_headlines = sorted([a for s in sources.values() for a in s], key=lambda x: x['date'], reverse=True)[:5]

        results.append({
            "name": company,
            "sentiment": {
                "overall_score": round(score, 2),
                "trend": trend,
                "previous_score": round(prev_score, 2),
                "confidence": confidence,
                "sample_size": total_articles,
                "source_scores": source_scores
            },
            "top_headlines": all_headlines,
            "sparkline": sparkline
        })
        
        log["total_scraped"] += total_articles
        time.sleep(2) # Inter-company delay

    output = {
        "last_updated": datetime.now().isoformat() + "Z",
        "scraper_log": {
            "duration_sec": round(time.time() - start_time, 2),
            "total_articles": log["total_scraped"],
            "errors": log["errors"]
        },
        "companies": results
    }

    with open(DATA_FILE, 'w') as f:
        json.dump(output, f, indent=2)
    
    print(f"Done. Processed {len(results)} companies.")

if __name__ == "__main__":
    run()
