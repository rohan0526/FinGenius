"""
Backend News Proxy API for FinGenius
Fetches Google News RSS and performs sentiment analysis
Run with: python backend_news_proxy.py
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import feedparser
import re

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

MAX_NEWS_ITEMS = 25

def fetch_news_headlines(query, max_items=MAX_NEWS_ITEMS):
    """Fetch news headlines from Google News RSS"""
    print(f"Fetching news for: {query}")
    q = query.replace(" ", "+")
    url = f"https://news.google.com/rss/search?q={q}&hl=en-US&gl=US&ceid=US:en"
    
    try:
        feed = feedparser.parse(url)
        
        headlines = []
        sources = []
        dates = []
        links = []
        
        for i, entry in enumerate(feed.entries):
            if i >= max_items:
                break
            headlines.append(entry.title)
            sources.append(entry.get('source', {}).get('title', 'Unknown'))
            dates.append(entry.get('published', 'Unknown'))
            links.append(entry.get('link', ''))
        
        print(f"Found {len(headlines)} news articles for {query}")
        return {
            'headlines': headlines,
            'sources': sources,
            'dates': dates,
            'links': links,
            'count': len(headlines)
        }
    except Exception as e:
        print(f"Error fetching news for {query}: {e}")
        return {
            'headlines': [],
            'sources': [],
            'dates': [],
            'links': [],
            'count': 0,
            'error': str(e)
        }

@app.route('/api/news/<ticker>', methods=['GET'])
def get_news(ticker):
    """API endpoint to fetch news for a ticker"""
    max_items = request.args.get('limit', MAX_NEWS_ITEMS, type=int)
    
    # Remove .NS or .BO suffix for Indian stocks
    company_name = ticker.replace('.NS', '').replace('.BO', '')
    
    news_data = fetch_news_headlines(company_name, max_items)
    
    return jsonify({
        'ticker': ticker,
        'company_name': company_name,
        'news': news_data,
        'success': news_data['count'] > 0
    })

@app.route('/api/news/batch', methods=['POST'])
def get_batch_news():
    """API endpoint to fetch news for multiple tickers"""
    data = request.get_json()
    tickers = data.get('tickers', [])
    max_items = data.get('limit', MAX_NEWS_ITEMS)
    
    results = []
    for ticker in tickers:
        company_name = ticker.replace('.NS', '').replace('.BO', '')
        news_data = fetch_news_headlines(company_name, max_items)
        results.append({
            'ticker': ticker,
            'company_name': company_name,
            'news': news_data,
            'success': news_data['count'] > 0
        })
    
    return jsonify({
        'results': results,
        'total_tickers': len(tickers)
    })

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'ok', 'service': 'FinGenius News Proxy'})

if __name__ == '__main__':
    print("="*60)
    print("FinGenius News Proxy API")
    print("="*60)
    print("Starting server on http://localhost:5001")
    print("Endpoints:")
    print("  GET  /api/news/<ticker>        - Get news for single ticker")
    print("  POST /api/news/batch            - Get news for multiple tickers")
    print("  GET  /health                    - Health check")
    print("="*60)
    app.run(debug=True, port=5001)
