import React, { useState, useEffect } from "react";
import "./CSS/index.css";
import { Search, Clock, ExternalLink, Bookmark } from "lucide-react";

const StockNews = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTicker, setSearchTicker] = useState("");
  const [inputTicker, setInputTicker] = useState("");
  const [lastFetchTime, setLastFetchTime] = useState(0);
  const [newsCache, setNewsCache] = useState({});

  useEffect(() => {
    fetchNews(searchTicker);
  }, [searchTicker]);

  const fetchNews = async (ticker) => {
    // Check if we have cached data for this ticker
    if (newsCache[ticker]) {
      setNews(newsCache[ticker]);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Using your Alpha Vantage API key directly
      const apiKey = ""; //UM0RU4SIK44X442C
      const url = `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=${ticker}&apikey=${apiKey}`;
      
      console.log("Fetching news from:", url);
      
      const response = await fetch(url);
      const data = await response.json();
      
      console.log("API response:", data);
      
      if (data.feed && data.feed.length > 0) {
        setNews(data.feed);
        // Cache the news data
        setNewsCache(prev => ({...prev, [ticker]: data.feed}));
        setError(null);
      } else if (data["Error Message"]) {
        setError(data["Error Message"]);
        setNews([]);
      } else if (data.Note) {
        // API call frequency limit reached
        setError(data.Note);
        setNews([]);
      } else {
        setError("No news found for this ticker or API limit reached");
        setNews([]);
      }
    } catch (err) {
      setError("Failed to fetch news. Please try again later.");
      console.error("News fetch error:", err);
      setNews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchTicker(inputTicker.toUpperCase());
  };

  // Format date for display
  const formatDate = (dateString) => {
    try {
      // Alpha Vantage uses format like: 20230215T120000
      const year = dateString.substring(0, 4);
      const month = dateString.substring(4, 6);
      const day = dateString.substring(6, 8);
      const hour = dateString.substring(9, 11);
      const minute = dateString.substring(11, 13);
      
      const date = new Date(`${year}-${month}-${day}T${hour}:${minute}:00`);
      
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString; // Return original if parsing fails
    }
  };

  return (
    <div className="stock-news-container">
      <div className="news-header">
        <h1 className="news-title">Stock Market News</h1>
        <p className="news-subtitle">Stay updated with the latest financial news and market insights</p>
        
        <form onSubmit={handleSearch} className="ticker-search">
          <div className="search-input-container">
            <input
              type="text"
              value={inputTicker}
              onChange={(e) => setInputTicker(e.target.value)}
              placeholder="Enter stock ticker (e.g., AAPL, MSFT)"
              className="search-input"
            />
            <button type="submit" className="search-button">
              <Search size={18} />
            </button>
          </div>
        </form>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading financial news...</p>
        </div>
      ) : error ? (
        <div className="error-state">
          <p>{error}</p>
          <p>Try searching for a different ticker symbol.</p>
        </div>
      ) : (
        <>
          <div className="current-ticker">
            Showing news for <span>{searchTicker}</span>
          </div>
          
          <div className="news-grid">
            {news.map((article, index) => (
              <div key={index} className="news-card">
                {article.banner_image && (
                  <div className="news-image">
                    <img src={article.banner_image} alt={article.title} />
                  </div>
                )}
                <div className="news-content">
                  <h3 className="news-article-title">{article.title}</h3>
                  
                  <div className="news-meta">
                    <span className="news-source">{article.source}</span>
                    <span className="news-time">
                      <Clock size={14} className="time-icon" />
                      {formatDate(article.time_published)}
                    </span>
                  </div>
                  
                  <p className="news-summary">{article.summary}</p>
                  
                  <div className="news-actions">
                    <a 
                      href={article.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="news-read-more"
                    >
                      Read More <ExternalLink size={14} />
                    </a>
                    <button className="news-save">
                      <Bookmark size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default StockNews; 