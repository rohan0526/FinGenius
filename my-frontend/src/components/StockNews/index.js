import React, { useState, useEffect } from "react";
import "./CSS/index.css";
import { TrendingUp, TrendingDown, AlertCircle, BarChart3, ChevronDown, ChevronUp } from "lucide-react";
import axios from "axios";

const StockNews = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [portfolioStocks, setPortfolioStocks] = useState([]);
  const [stockAnalysis, setStockAnalysis] = useState([]); // Array of {ticker, analysis, news}
  const [expandedStocks, setExpandedStocks] = useState({}); // Track which stocks are expanded

  const MAX_NEWS_ITEMS = 25;
  const SENTIMENT_THRESHOLD_BUY = 0.15;
  const SENTIMENT_THRESHOLD_SELL = -0.15;

  // Fetch portfolio on component mount
  useEffect(() => {
    fetchPortfolio();
  }, []);

  // Get company name from ticker
  const getCompanyName = (ticker) => {
    // Remove .NS suffix for Indian stocks
    return ticker.replace('.NS', '').replace('.BO', '');
  };

  // Fetch news from backend proxy (to avoid CORS issues)
  const fetchNewsHeadlines = async (query, maxItems = MAX_NEWS_ITEMS) => {
    try {
      // Use backend proxy to fetch news
      const url = `http://localhost:5001/api/news/${encodeURIComponent(query)}?limit=${maxItems}`;
      
      console.log(`Fetching news from backend proxy: ${url}`);
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success && data.news) {
        return {
          headlines: data.news.headlines || [],
          sources: data.news.sources || [],
          dates: data.news.dates || [],
          links: data.news.links || []
        };
      } else {
        console.error(`No news found for ${query}`);
        return { headlines: [], sources: [], dates: [], links: [] };
      }
    } catch (error) {
      console.error(`Error fetching news for ${query}:`, error);
      return { headlines: [], sources: [], dates: [], links: [] };
    }
  };

  // Fetch user's portfolio
  const fetchPortfolio = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError("Please login to view portfolio news");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      console.log("Fetching portfolio...");
      const response = await axios.get("https://rapid-grossly-raven.ngrok-free.app/trade/portfolio", {
        headers: {
          "ngrok-skip-browser-warning": "true",
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      console.log("Portfolio response:", response.data);

      if (response.data && response.data.portfolio) {
        const portfolioArray = Object.entries(response.data.portfolio).map(([ticker, stock]) => ({
          ticker,
          ...stock,
        }));
        
        console.log("Portfolio stocks found:", portfolioArray.length, portfolioArray);
        
        if (portfolioArray.length === 0) {
          setError("No stocks found in your portfolio. Please add stocks first.");
          setLoading(false);
          return;
        }
        
        setPortfolioStocks(portfolioArray);
        
        // Fetch news and analyze for each stock separately
        await analyzeAllStocks(portfolioArray);
      } else {
        console.log("No portfolio data in response");
        setError("No stocks found in your portfolio. Please add stocks first.");
        setLoading(false);
      }
    } catch (err) {
      console.error("Error fetching portfolio:", err);
      if (err.response) {
        console.error("Error response:", err.response.data);
        console.error("Error status:", err.response.status);
      }
      setError("Failed to fetch portfolio. Please try again.");
      setLoading(false);
    }
  };

  // Analyze all stocks in portfolio
  const analyzeAllStocks = async (stocks) => {
    const analysisResults = [];
    
    for (const stock of stocks) {
      console.log(`Analyzing ${stock.ticker}...`);
      
      const companyName = getCompanyName(stock.ticker);
      const newsData = await fetchNewsHeadlines(companyName, MAX_NEWS_ITEMS);
      
      if (newsData.headlines.length > 0) {
        const analysis = analyzeSentimentDetailed(newsData.headlines, newsData.links, newsData.sources);
        const keywords = extractKeywords(newsData.headlines);
        const recommendation = makeRecommendation(analysis, keywords);
        
        analysisResults.push({
          ticker: stock.ticker,
          companyName,
          quantity: stock.quantity,
          avgPrice: stock.avg_price,
          currentPrice: stock.current_price,
          news: newsData,
          analysis,
          keywords,
          recommendation
        });
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setStockAnalysis(analysisResults);
    setLoading(false);
  };

  // VADER-like sentiment analysis for individual headline
  const analyzeSentiment = (text) => {
    const positiveWords = ['surge', 'gain', 'profit', 'growth', 'rise', 'up', 'high', 'boost', 'jump', 'rally', 'strong', 'beat', 'record', 'success', 'positive', 'bullish', 'upgrade', 'outperform'];
    const negativeWords = ['fall', 'drop', 'loss', 'decline', 'down', 'low', 'cut', 'crash', 'plunge', 'weak', 'miss', 'concern', 'risk', 'layoff', 'negative', 'bearish', 'downgrade', 'underperform'];
    
    const lowerText = text.toLowerCase();
    let score = 0;
    let posCount = 0;
    let negCount = 0;
    
    positiveWords.forEach(word => {
      const matches = (lowerText.match(new RegExp(`\\b${word}\\b`, 'g')) || []).length;
      posCount += matches;
      score += matches * 0.3;
    });
    
    negativeWords.forEach(word => {
      const matches = (lowerText.match(new RegExp(`\\b${word}\\b`, 'g')) || []).length;
      negCount += matches;
      score -= matches * 0.3;
    });
    
    const total = posCount + negCount;
    const compound = Math.max(-1, Math.min(1, score));
    
    return {
      compound,
      pos: total > 0 ? posCount / total : 0,
      neg: total > 0 ? negCount / total : 0,
      neu: total > 0 ? 0 : 1
    };
  };

  // Detailed sentiment analysis for all headlines
  const analyzeSentimentDetailed = (headlines, links = [], sources = []) => {
    if (!headlines || headlines.length === 0) {
      return {
        overall_sentiment: 0.0,
        positive_count: 0,
        negative_count: 0,
        neutral_count: 0,
        sentiment_scores: [],
        total_articles: 0
      };
    }

    const scores = [];
    let positiveCount = 0;
    let negativeCount = 0;
    let neutralCount = 0;

    headlines.forEach((headline, index) => {
      const vs = analyzeSentiment(headline);
      const compound = vs.compound;
      
      scores.push({
        headline,
        compound,
        positive: vs.pos,
        negative: vs.neg,
        neutral: vs.neu,
        url: links[index] || '#',
        source: sources[index] || 'Unknown'
      });

      if (compound >= 0.05) {
        positiveCount++;
      } else if (compound <= -0.05) {
        negativeCount++;
      } else {
        neutralCount++;
      }
    });

    const overallSentiment = scores.reduce((sum, s) => sum + s.compound, 0) / scores.length;

    return {
      overall_sentiment: overallSentiment,
      positive_count: positiveCount,
      negative_count: negativeCount,
      neutral_count: neutralCount,
      sentiment_scores: scores,
      total_articles: headlines.length
    };
  };

  // Extract keywords from headlines
  const extractKeywords = (headlines) => {
    const positiveKeywords = ['surge', 'gain', 'profit', 'growth', 'rise', 'up', 'high', 'boost', 'jump', 'rally', 'strong', 'beat', 'record', 'success'];
    const negativeKeywords = ['fall', 'drop', 'loss', 'decline', 'down', 'low', 'cut', 'crash', 'plunge', 'weak', 'miss', 'concern', 'risk', 'layoff'];

    const allText = headlines.join(' ').toLowerCase();
    
    const positiveFound = positiveKeywords.filter(kw => allText.includes(kw));
    const negativeFound = negativeKeywords.filter(kw => allText.includes(kw));

    return {
      positive_keywords: positiveFound,
      negative_keywords: negativeFound
    };
  };

  // Make recommendation based on sentiment analysis
  const makeRecommendation = (sentimentAnalysis, keywords) => {
    const overallSentiment = sentimentAnalysis.overall_sentiment;
    const positiveCount = sentimentAnalysis.positive_count;
    const negativeCount = sentimentAnalysis.negative_count;
    const total = sentimentAnalysis.total_articles;

    const positiveRatio = total > 0 ? positiveCount / total : 0;
    const negativeRatio = total > 0 ? negativeCount / total : 0;

    let action, confidence, reasoning;

    if (overallSentiment >= SENTIMENT_THRESHOLD_BUY && positiveRatio > 0.4) {
      action = "BUY";
      confidence = Math.min(0.95, 0.5 + (overallSentiment * 2) + (positiveRatio * 0.3));
      reasoning = `Strong positive sentiment (${overallSentiment.toFixed(3)}). ${positiveCount}/${total} articles are positive.`;
    } else if (overallSentiment <= SENTIMENT_THRESHOLD_SELL && negativeRatio > 0.4) {
      action = "SELL";
      confidence = Math.min(0.95, 0.5 + (Math.abs(overallSentiment) * 2) + (negativeRatio * 0.3));
      reasoning = `Strong negative sentiment (${overallSentiment.toFixed(3)}). ${negativeCount}/${total} articles are negative.`;
    } else {
      action = "HOLD";
      confidence = 0.6;
      reasoning = `Mixed or neutral sentiment (${overallSentiment.toFixed(3)}). Market sentiment unclear.`;
    }

    // Adjust confidence based on keywords
    if (keywords.positive_keywords.length > keywords.negative_keywords.length + 3 && action === "BUY") {
      confidence = Math.min(0.95, confidence + 0.1);
    } else if (keywords.negative_keywords.length > keywords.positive_keywords.length + 3 && action === "SELL") {
      confidence = Math.min(0.95, confidence + 0.1);
    }

    return {
      action,
      confidence,
      reasoning,
      sentiment_score: overallSentiment,
      positive_articles: positiveCount,
      negative_articles: negativeCount,
      neutral_articles: sentimentAnalysis.neutral_count,
      total_articles: total,
      positive_ratio: positiveRatio,
      negative_ratio: negativeRatio
    };
  };

  // Toggle stock expansion
  const toggleStockExpansion = (ticker) => {
    setExpandedStocks(prev => ({
      ...prev,
      [ticker]: !prev[ticker]
    }));
  };

  return (
    <div className="stock-news-container" style={{ background: '#f5f7fa', minHeight: '100vh', paddingBottom: '40px' }}>
      <div className="news-header" style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '30px 20px',
        marginBottom: '20px',
        boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)'
      }}>
        <h1 className="news-title" style={{ 
          color: '#fff', 
          fontSize: '28px', 
          fontWeight: '700',
          marginBottom: '6px',
          textAlign: 'center',
          letterSpacing: '-0.5px'
        }}>
          📰 Portfolio News Sentiment Analysis
        </h1>
        <p className="news-subtitle" style={{ 
          color: 'rgba(255,255,255,0.95)', 
          fontSize: '14px',
          textAlign: 'center',
          fontWeight: '400'
        }}>
          AI-powered news analysis for your portfolio stocks
        </p>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Analyzing your portfolio stocks...</p>
        </div>
      ) : error ? (
        <div className="error-state">
          <p>{error}</p>
        </div>
      ) : stockAnalysis.length === 0 ? (
        <div className="error-state">
          <p>No stocks found in your portfolio</p>
        </div>
      ) : (
        <div style={{ padding: '0 15px', maxWidth: '100%', margin: '0 auto' }}>
          {/* Portfolio Summary - Compact */}
          <div style={{ 
            marginBottom: '20px', 
            padding: '20px', 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '16px',
            boxShadow: '0 6px 20px rgba(102, 126, 234, 0.25)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '15px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <BarChart3 size={28} strokeWidth={2.5} />
              <div>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', letterSpacing: '-0.5px' }}>
                  Portfolio Overview
                </h2>
                <p style={{ fontSize: '13px', margin: '4px 0 0 0', opacity: 0.9, fontWeight: '400' }}>
                  {stockAnalysis.length} {stockAnalysis.length === 1 ? 'stock' : 'stocks'} analyzed
                </p>
              </div>
            </div>
          </div>

          {/* Individual Stock Cards - Grid Layout */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(450px, 1fr))',
            gap: '16px',
            marginBottom: '20px'
          }}>
          {stockAnalysis.map((stock, index) => {
            const isExpanded = expandedStocks[stock.ticker];
            const rec = stock.recommendation;
            const analysis = stock.analysis;
            
            return (
              <div key={stock.ticker} style={{
                border: 'none',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                background: '#fff',
                transform: isExpanded ? 'scale(1.02)' : 'scale(1)',
                gridColumn: isExpanded ? '1 / -1' : 'auto',
              }}>
                {/* Stock Header - Compact */}
                <div 
                  onClick={() => toggleStockExpansion(stock.ticker)}
                  style={{
                    padding: '18px 20px',
                    background: rec.action === 'BUY' 
                      ? 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)' 
                      : rec.action === 'SELL' 
                      ? 'linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%)' 
                      : 'linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)',
                    cursor: 'pointer',
                    borderBottom: isExpanded ? '1px solid rgba(0,0,0,0.08)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
                        {rec.action === 'BUY' && <TrendingUp size={22} color="#28a745" strokeWidth={2.5} />}
                        {rec.action === 'SELL' && <TrendingDown size={22} color="#dc3545" strokeWidth={2.5} />}
                        {rec.action === 'HOLD' && <AlertCircle size={22} color="#ffc107" strokeWidth={2.5} />}
                        <span style={{ fontSize: '18px', fontWeight: '800', color: '#1a202c', letterSpacing: '-0.3px' }}>
                          {stock.ticker}
                        </span>
                        <span style={{ 
                          fontSize: '12px', 
                          fontWeight: '700',
                          padding: '4px 12px',
                          borderRadius: '20px',
                          background: rec.action === 'BUY' 
                            ? 'linear-gradient(135deg, #28a745 0%, #20c997 100%)' 
                            : rec.action === 'SELL' 
                            ? 'linear-gradient(135deg, #dc3545 0%, #e74c3c 100%)' 
                            : 'linear-gradient(135deg, #ffc107 0%, #ffb300 100%)',
                          color: '#fff',
                          letterSpacing: '0.5px',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                          textTransform: 'uppercase'
                        }}>
                          {rec.action}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: '6px' }}>
                        <strong style={{ color: '#2c3e50' }}>Confidence:</strong> {(rec.confidence * 100).toFixed(1)}% • 
                        <strong style={{ color: '#2c3e50', marginLeft: '8px' }}>Sentiment:</strong> 
                        <span style={{ 
                          color: rec.sentiment_score > 0 ? '#28a745' : rec.sentiment_score < 0 ? '#dc3545' : '#6c757d',
                          fontWeight: '600',
                          marginLeft: '4px'
                        }}>
                          {rec.sentiment_score > 0 ? '+' : ''}{rec.sentiment_score.toFixed(3)}
                        </span>
                      </div>
                      <p style={{ margin: '0', fontSize: '12px', color: '#666', lineHeight: '1.4' }}>
                        {rec.reasoning}
                      </p>
                    </div>
                    
                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                      <div>
                        <div style={{ 
                          fontSize: '24px', 
                          fontWeight: '800', 
                          color: analysis.overall_sentiment > 0 ? '#28a745' : analysis.overall_sentiment < 0 ? '#dc3545' : '#6c757d',
                          lineHeight: 1
                        }}>
                          {analysis.overall_sentiment > 0 ? '+' : ''}{analysis.overall_sentiment.toFixed(3)}
                        </div>
                        <div style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.3px', fontWeight: '600', marginTop: '2px' }}>
                          Score
                        </div>
                      </div>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '4px', 
                        fontSize: '11px',
                        fontWeight: '600',
                        color: '#666',
                        cursor: 'pointer'
                      }}>
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        {isExpanded ? 'Hide' : 'View'}
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats - Compact */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginTop: '14px' }}>
                    <div style={{ 
                      padding: '12px', 
                      background: 'rgba(255,255,255,0.9)', 
                      borderRadius: '12px', 
                      textAlign: 'center',
                      border: '1px solid rgba(40, 167, 69, 0.2)',
                      transition: 'all 0.2s ease'
                    }}>
                      <div style={{ fontSize: '20px', fontWeight: '800', color: '#28a745', marginBottom: '4px' }}>
                        {analysis.positive_count}
                      </div>
                      <div style={{ fontSize: '10px', color: '#155724', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                        Positive
                      </div>
                      <div style={{ fontSize: '9px', color: '#155724', opacity: 0.7, marginTop: '2px' }}>
                        {(rec.positive_ratio * 100).toFixed(0)}%
                      </div>
                    </div>
                    <div style={{ 
                      padding: '12px', 
                      background: 'rgba(255,255,255,0.9)', 
                      borderRadius: '12px', 
                      textAlign: 'center',
                      border: '1px solid rgba(133, 100, 4, 0.2)',
                      transition: 'all 0.2s ease'
                    }}>
                      <div style={{ fontSize: '20px', fontWeight: '800', color: '#856404', marginBottom: '4px' }}>
                        {analysis.neutral_count}
                      </div>
                      <div style={{ fontSize: '10px', color: '#856404', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                        Neutral
                      </div>
                    </div>
                    <div style={{ 
                      padding: '12px', 
                      background: 'rgba(255,255,255,0.9)', 
                      borderRadius: '12px', 
                      textAlign: 'center',
                      border: '1px solid rgba(220, 53, 69, 0.2)',
                      transition: 'all 0.2s ease'
                    }}>
                      <div style={{ fontSize: '20px', fontWeight: '800', color: '#dc3545', marginBottom: '4px' }}>
                        {analysis.negative_count}
                      </div>
                      <div style={{ fontSize: '10px', color: '#721c24', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                        Negative
                      </div>
                      <div style={{ fontSize: '9px', color: '#721c24', opacity: 0.7, marginTop: '2px' }}>
                        {(rec.negative_ratio * 100).toFixed(0)}%
                      </div>
                    </div>
                    <div style={{ 
                      padding: '12px', 
                      background: 'rgba(255,255,255,0.9)', 
                      borderRadius: '12px', 
                      textAlign: 'center',
                      border: '1px solid rgba(0, 123, 255, 0.2)',
                      transition: 'all 0.2s ease'
                    }}>
                      <div style={{ fontSize: '20px', fontWeight: '800', color: '#007bff', marginBottom: '4px' }}>
                        {analysis.total_articles}
                      </div>
                      <div style={{ fontSize: '10px', color: '#004085', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                        Articles
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div style={{ padding: '20px', background: '#fff' }}>
                    {/* Keywords Section */}
                    {(stock.keywords.positive_keywords.length > 0 || stock.keywords.negative_keywords.length > 0) && (
                      <div style={{ 
                        marginBottom: '24px', 
                        padding: '18px', 
                        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', 
                        borderRadius: '12px',
                        border: '1px solid #dee2e6'
                      }}>
                        <h3 style={{ marginBottom: '14px', fontSize: '16px', fontWeight: '700', color: '#2c3e50', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          🔑 Key Themes
                        </h3>
                        {stock.keywords.positive_keywords.length > 0 && (
                          <div style={{ marginBottom: '12px', display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                            <strong style={{ color: '#28a745', fontSize: '14px' }}>Positive:</strong>
                            {stock.keywords.positive_keywords.map((kw, i) => (
                              <span key={i} style={{
                                padding: '4px 10px',
                                background: '#d4edda',
                                color: '#155724',
                                borderRadius: '12px',
                                fontSize: '12px',
                                fontWeight: '600',
                                border: '1px solid #c3e6cb'
                              }}>
                                {kw}
                              </span>
                            ))}
                          </div>
                        )}
                        {stock.keywords.negative_keywords.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                            <strong style={{ color: '#dc3545', fontSize: '14px' }}>Negative:</strong>
                            {stock.keywords.negative_keywords.map((kw, i) => (
                              <span key={i} style={{
                                padding: '4px 10px',
                                background: '#f8d7da',
                                color: '#721c24',
                                borderRadius: '12px',
                                fontSize: '12px',
                                fontWeight: '600',
                                border: '1px solid #f5c6cb'
                              }}>
                                {kw}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* All Headlines with Sentiment */}
                    <div>
                      <h3 style={{ marginBottom: '16px', fontSize: '17px', fontWeight: '700', color: '#2c3e50', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        📰 All {analysis.total_articles} Headlines
                      </h3>
                      <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                        {analysis.sentiment_scores
                          .sort((a, b) => b.compound - a.compound)
                          .map((item, idx) => {
                            let category, emoji, bgColor;
                            if (item.compound >= 0.5) {
                              category = "VERY POSITIVE";
                              emoji = "🚀";
                              bgColor = "#d4edda";
                            } else if (item.compound >= 0.05) {
                              category = "POSITIVE";
                              emoji = "✅";
                              bgColor = "#e7f5e7";
                            } else if (item.compound <= -0.5) {
                              category = "VERY NEGATIVE";
                              emoji = "📉";
                              bgColor = "#f8d7da";
                            } else if (item.compound <= -0.05) {
                              category = "NEGATIVE";
                              emoji = "❌";
                              bgColor = "#fce8e8";
                            } else {
                              category = "NEUTRAL";
                              emoji = "➖";
                              bgColor = "#fff3cd";
                            }

                            return (
                              <a 
                                key={idx} 
                                href={item.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                style={{
                                  display: 'block',
                                  padding: '14px',
                                  marginBottom: '12px',
                                  background: bgColor,
                                  borderRadius: '8px',
                                  borderLeft: `4px solid ${item.compound > 0 ? '#28a745' : item.compound < 0 ? '#dc3545' : '#ffc107'}`,
                                  textDecoration: 'none',
                                  color: 'inherit',
                                  transition: 'all 0.2s ease',
                                  cursor: 'pointer',
                                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.transform = 'translateX(4px)';
                                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.12)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.transform = 'translateX(0)';
                                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
                                }}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                                  <span style={{ fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    {emoji} {category}
                                  </span>
                                  <span style={{
                                    fontWeight: 'bold',
                                    fontSize: '14px',
                                    color: item.compound > 0 ? '#28a745' : item.compound < 0 ? '#dc3545' : '#6c757d'
                                  }}>
                                    {item.compound > 0 ? '+' : ''}{item.compound.toFixed(3)}
                                  </span>
                                </div>
                                <div style={{ 
                                  fontSize: '14px', 
                                  marginBottom: '8px', 
                                  lineHeight: '1.5',
                                  color: '#2c3e50',
                                  fontWeight: '500'
                                }}>
                                  {item.headline}
                                </div>
                                <div style={{ 
                                  fontSize: '11px', 
                                  color: '#666', 
                                  display: 'flex', 
                                  gap: '15px',
                                  flexWrap: 'wrap',
                                  alignItems: 'center'
                                }}>
                                  <span style={{ fontWeight: '600' }}>Pos: {item.positive.toFixed(2)}</span>
                                  <span style={{ fontWeight: '600' }}>Neg: {item.negative.toFixed(2)}</span>
                                  <span style={{ fontWeight: '600' }}>Neu: {item.neutral.toFixed(2)}</span>
                                  {item.source && item.source !== 'Unknown' && (
                                    <>
                                      <span style={{ color: '#ddd' }}>•</span>
                                      <span style={{ 
                                        color: '#007bff', 
                                        fontWeight: '600',
                                        fontSize: '10px',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.3px'
                                      }}>
                                        {item.source}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </a>
                            );
                          })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          </div>
        </div>
      )}
    </div>
  );
};

export default StockNews; 