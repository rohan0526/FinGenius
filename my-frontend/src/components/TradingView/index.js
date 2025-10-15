import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import "./CSS/index.css";

export const TradingView = () => {
  const [portfolio, setPortfolio] = useState([]);
  const [ticker, setTicker] = useState("");
  const [quantity, setQuantity] = useState("");
  const [market, setMarket] = useState("USD");
  const [message, setMessage] = useState("");
  const [token, setToken] = useState("");
  const [userId, setUserId] = useState("");
  const [watchlist, setWatchlist] = useState([
    "NASDAQ:AAPL",
    "NASDAQ:GOOGL",
    "NASDAQ:MSFT",
    "NASDAQ:TSLA",
    "NYSE:BAC",
    "NYSE:JPM"
  ]);
  const [newWatchlistItem, setNewWatchlistItem] = useState("");
  const [showWatchlistModal, setShowWatchlistModal] = useState(false);
  const [activeChartTab, setActiveChartTab] = useState("Monthly");

  // Get token and userId from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    
    console.log("=== TradingView Component Mounted ===");
    console.log("Token from localStorage:", storedToken ? storedToken.substring(0, 30) + "..." : "NOT FOUND");
    console.log("User from localStorage:", storedUser);
    
    if (storedToken) {
      setToken(storedToken);
      console.log("✅ Token set in state");
    } else {
      console.error("❌ No token found in localStorage");
      setMessage("Please login to access trading");
    }
    
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        console.log("User data parsed:", userData);
        if (userData.user_id) {
          setUserId(userData.user_id);
          console.log("✅ User ID set:", userData.user_id);
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    } else {
      console.error("❌ No user data found in localStorage");
    }
  }, []);

  useEffect(() => {
    if (document.getElementById("tradingview-script")) return; // Prevent duplicate script injection
  
    const script = document.createElement("script");
    script.id = "tradingview-script";
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.async = true;
    
    // Create widget options with adjusted height
    const widgetOptions = {
      width: "100%",
      height: "100%",
      autosize: true,
      symbol: "NASDAQ:AAPL",
      interval: "D",
      timezone: "exchange",
      theme: "light",
      style: "1",
      locale: "en",
      enable_publishing: false,
      allow_symbol_change: true,
      container_id: "tradingview-widget",
      studies: [
        "MASimple@tv-basicstudies",
        "RSI@tv-basicstudies",
        "Volume@tv-basicstudies"
      ],
      watchlist: [
        "NASDAQ:AAPL",
        "NASDAQ:GOOGL",
        "NASDAQ:MSFT",
        "NASDAQ:TSLA",
        "NYSE:BAC",
        "NYSE:JPM"
      ]
    };

    script.innerHTML = JSON.stringify(widgetOptions);
    document.getElementById("tradingview-widget").appendChild(script);

    // Add TradingView event listener
    window.addEventListener('DOMContentLoaded', () => {
      const interval = setInterval(() => {
        if (window.TradingView && document.querySelector('iframe')) {
          const iframe = document.querySelector('iframe');
          iframe.addEventListener('load', () => {
            window.addEventListener('message', (event) => {
              if (event.data && typeof event.data === 'string') {
                try {
                  const data = JSON.parse(event.data);
                  if (data.name === 'symbolChange') {
                    const symbol = data.data[0].split(':')[1]; // Extract ticker from "NASDAQ:AAPL" format
                    setTicker(symbol);
                    
                    // Determine market based on exchange
                    const exchange = data.data[0].split(':')[0];
                    if (exchange === 'NSE' || exchange === 'BSE') {
                      setMarket('INR');
                    } else {
                      setMarket('USD');
                    }
                  }
                } catch (e) {
                  // Ignore parsing errors for non-relevant messages
                }
              }
            });
          });
          clearInterval(interval);
        }
      }, 500);
    });

    return () => {
      // Cleanup event listeners if needed
      window.removeEventListener('message', () => {});
    };
  }, []);
  
  // Call fetchPortfolio when token and userId are available
  useEffect(() => {
    if (token && userId) {
      fetchPortfolio();
    }
  }, [token, userId]);

  // Fetch Portfolio
  const fetchPortfolio = () => {
    const currentToken = localStorage.getItem('token');
    console.log("Fetching portfolio...");
    console.log("Token available:", currentToken ? "Yes" : "No");
    
    if (!currentToken) {
      console.error("No token available for portfolio fetch");
      setMessage("Please login to view portfolio");
      return;
    }
    
    axios
      .get("https://rapid-grossly-raven.ngrok-free.app/trade/portfolio", {
        headers: {
          "ngrok-skip-browser-warning": "true",
          "Content-Type": "application/json",
          "Authorization": `Bearer ${currentToken}`
        }
      })
      .then((res) => {
        console.log("Portfolio response:", res.data);

        if (!res.data || !res.data.portfolio) {
          console.warn("Empty or invalid portfolio response");
          return;
        }

        // Convert object to array
        const portfolioArray = Object.entries(res.data.portfolio).map(([ticker, stock]) => ({
          ticker,
          ...stock,
        }));

        console.log("Formatted Portfolio Array:", portfolioArray);
        setPortfolio(portfolioArray);
      })
      .catch((err) => {
        console.error("Error fetching portfolio:", err);
        if (err.response) {
          console.error("Response data:", err.response.data);
          if (err.response.status === 401) {
            setMessage("Session expired. Please login again.");
          } else if (err.response.status === 404) {
            // 404 with message means no holdings, not endpoint error
            console.log("No holdings found (404 response)");
            setPortfolio([]);
            setMessage(err.response.data.message || "No holdings found");
          }
        }
      });
  };

  // Buy Stock
  const buyStock = () => {
    // Validate inputs
    if (!ticker || !quantity) {
      setMessage("Please enter ticker and quantity");
      return;
    }
    
    // Validate token exists
    const currentToken = localStorage.getItem('token');
    console.log("Current token:", currentToken ? "Token exists" : "No token found");
    
    if (!currentToken) {
      setMessage("Unauthorized - Please login again");
      return;
    }
    
    console.log("Buying stock:", { ticker, quantity, market });
    console.log("Using token:", currentToken.substring(0, 20) + "...");
    console.log("Full request body:", JSON.stringify({ ticker, quantity, market }));
    
    axios
      .post(
        "https://rapid-grossly-raven.ngrok-free.app/trade/buy",
        { ticker, quantity, market },
        {
          headers: {
            "ngrok-skip-browser-warning": "true",
            "Content-Type": "application/json",
            "Authorization": `Bearer ${currentToken}`
          },
        }
      )
      .then((res) => {
        console.log("Buy response:", res.data);
        setMessage(res.data.message);
        fetchPortfolio(); // Refresh portfolio
      })
      .catch((err) => {
        console.error("Error buying stock:", err);
        console.error("Error response:", err.response?.data);
        if (err.response?.status === 401) {
          setMessage("Unauthorized - Session expired. Please login again.");
        } else {
          setMessage(err.response?.data?.error || "Purchase failed");
        }
      });
  };

  // Sell Stock
  const sellStock = () => {
    // Validate token exists
    const currentToken = localStorage.getItem('token');
    console.log("Current token:", currentToken ? "Token exists" : "No token found");
    
    if (!currentToken) {
      setMessage("Unauthorized - Please login again");
      return;
    }
    
    console.log("Selling stock:", { ticker, quantity, market });
    console.log("Using token:", currentToken.substring(0, 20) + "...");
    
    axios
      .post(
        "https://rapid-grossly-raven.ngrok-free.app/trade/sell",
        { ticker, quantity, market },
        {
          headers: {
            "ngrok-skip-browser-warning": "true",
            "Content-Type": "application/json",
            "Authorization": `Bearer ${currentToken}`
          },
        }
      )
      .then((res) => {
        console.log("Sell response:", res.data);
        setMessage(res.data.message);
        fetchPortfolio(); // Refresh portfolio
      })
      .catch((err) => {
        console.error("Error selling stock:", err);
        console.error("Error response:", err.response?.data);
        if (err.response?.status === 401) {
          setMessage("Unauthorized - Session expired. Please login again.");
        } else {
          setMessage(err.response?.data?.error || "Sale failed");
        }
      });
  };

  // Function to reinitialize the TradingView widget
  const reinitializeTradingViewWidget = useCallback((newWatchlist) => {
    // Remove existing widget
    const container = document.getElementById("tradingview-widget");
    container.innerHTML = "";

    // Create new widget with updated watchlist
    const script = document.createElement("script");
    script.id = "tradingview-script";
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.async = true;

    const widgetOptions = {
      width: "100%",
      height: 800,
      autosize: false,
      symbol: "NASDAQ:AAPL",
      interval: "D",
      timezone: "exchange",
      theme: "light",
      style: "1",
      locale: "en",
      enable_publishing: false,
      allow_symbol_change: true,
      container_id: "tradingview-widget",
      studies: [
        "MASimple@tv-basicstudies",
        "RSI@tv-basicstudies",
        "Volume@tv-basicstudies"
      ],
      watchlist: newWatchlist
    };

    script.innerHTML = JSON.stringify(widgetOptions);
    container.appendChild(script);
  }, []);

  // Function to add stock to watchlist
  const addToWatchlist = useCallback(() => {
    if (!newWatchlistItem) return;
    
    // Format the input to match TradingView format
    let formattedItem = newWatchlistItem.toUpperCase();
    if (!formattedItem.includes(':')) {
      formattedItem = `NASDAQ:${formattedItem}`; // Default to NASDAQ if no exchange specified
    }
    
    if (!watchlist.includes(formattedItem)) {
      const newWatchlist = [...watchlist, formattedItem];
      setWatchlist(newWatchlist);
      // Reinitialize TradingView widget with new watchlist
      reinitializeTradingViewWidget(newWatchlist);
    }
    setNewWatchlistItem("");
  }, [newWatchlistItem, watchlist, reinitializeTradingViewWidget]);

  // Function to remove stock from watchlist
  const removeFromWatchlist = useCallback((itemToRemove) => {
    const newWatchlist = watchlist.filter(item => item !== itemToRemove);
    setWatchlist(newWatchlist);
    // Reinitialize TradingView widget with new watchlist
    reinitializeTradingViewWidget(newWatchlist);
  }, [watchlist, reinitializeTradingViewWidget]);


  return (
    <div className="trading-page">
      <div className="trading-container">
        <div className="page-header">
          <div className="header-content">
            <div className="header-icon">
              <BarChart3 size={32} />
            </div>
            <div>
              <h1>Paper Trading Platform</h1>
              <p className="header-subtitle">Practice trading with real-time market data</p>
            </div>
          </div>
        </div>
        
        <div className="trading-layout">
          <div className="trading-layout-left">
            <div className="chart-section">
              <div className="chart-header">
                <h2>Market Chart</h2>
                <div className="chart-tabs">
                  <button 
                    className={`chart-tab ${activeChartTab === "Daily" ? "active" : ""}`}
                    onClick={() => setActiveChartTab("Daily")}
                  >
                    Daily
                  </button>
                  <button 
                    className={`chart-tab ${activeChartTab === "Weekly" ? "active" : ""}`}
                    onClick={() => setActiveChartTab("Weekly")}
                  >
                    Weekly
                  </button>
                  <button 
                    className={`chart-tab ${activeChartTab === "Monthly" ? "active" : ""}`}
                    onClick={() => setActiveChartTab("Monthly")}
                  >
                    Monthly
                  </button>
                </div>
              </div>
              <div id="tradingview-widget"></div>
            </div>
          </div>
          
          <div className="trading-layout-right">
          {/* Trading Form */}
          <div className="trading-form">
            <h2>Trade Stocks</h2>
            
            <div className="form-group">
              <label htmlFor="ticker">Ticker:</label>
              <input
                type="text"
                id="ticker"
                value={ticker}
                onChange={(e) => setTicker(e.target.value)}
                placeholder="Enter ticker (e.g., AAPL)"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="quantity">Quantity:</label>
              <input
                type="number"
                id="quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Enter quantity"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="market">Market:</label>
              <select 
                id="market"
                value={market}
                onChange={(e) => setMarket(e.target.value)}
              >
                <option value="USD">USD</option>
                <option value="INR">INR</option>
              </select>
            </div>
            
            <div className="trading-buttons">
              <button className="buy-button" onClick={buyStock}>
                Buy
              </button>
              <button className="sell-button" onClick={sellStock}>
                Sell
              </button>
            </div>

            {/* Status Message */}
            {message && <div className="status-message">{message}</div>}
          </div>
          
          {/* Portfolio Section */}
          <div className="portfolio-section">
            <div className="section-header">
              <h2>Your Portfolio</h2>
              <button className="refresh-button" onClick={fetchPortfolio}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2z"/>
                  <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
                </svg>
                Refresh Portfolio
              </button>
            </div>

            {portfolio.length > 0 ? (
              <ul className="portfolio-list">
                {portfolio.map((stock, index) => (
                  <li key={index} className="stock-item">
                    <div className="stock-header">
                      <strong>{stock.ticker}</strong> ({stock.market})
                    </div>
                    <div className="stock-details">
                      <div className="stock-detail-item">
                        <strong>Total Shares</strong>
                        <div className="stock-detail-value">{stock.total_quantity}</div>
                      </div>
                      <div className="stock-detail-item">
                        <strong>Average Cost</strong>
                        <div className="stock-detail-value">${stock.average_cost?.toFixed(2)}</div>
                      </div>
                      <div className="stock-detail-item">
                        <strong>Current Price</strong>
                        <div className="stock-detail-value">${stock.current_price?.toFixed(2)}</div>
                      </div>
                      <div className="stock-detail-item">
                        <strong>Total Cost</strong>
                        <div className="stock-detail-value">${stock.total_cost?.toFixed(2)}</div>
                      </div>
                      <div className="stock-detail-item">
                        <strong>Market Value</strong>
                        <div className="stock-detail-value">${stock.total_market_value?.toFixed(2)}</div>
                      </div>
                      <div className="stock-detail-item">
                        <strong>Unrealized P&L</strong>
                        <div className={`stock-detail-value ${stock.unrealized_pl >= 0 ? 'change-up' : 'change-down'}`}>
                          ${stock.unrealized_pl?.toFixed(2)}
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="lots-header">Lots Purchased:</h4>
                      <ul className="lots-list">
                        {stock.lots.map((lot) => (
                          <li key={lot.lot_id} className="lot-item">
                            <span className="lot-date">📅 {new Date(lot.purchase_date).toLocaleString()}</span> - 
                            <span className="lot-shares">{lot.quantity} shares</span> @ 
                            <span className="lot-price">${lot.purchase_price?.toFixed(2)}</span>
                            <span className="lot-cost">(Cost: ${lot.cost_basis?.toFixed(2)})</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="portfolio-empty">
                <p>No stocks owned yet. Start trading to build your portfolio!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Watchlist Modal */}
      {showWatchlistModal && (
        <div className="modal-overlay">
          <div className="watchlist-modal">
            <h3>Manage Watchlist</h3>
            
            <div className="add-watchlist-item">
              <input
                type="text"
                value={newWatchlistItem}
                onChange={(e) => setNewWatchlistItem(e.target.value)}
                placeholder="Enter stock symbol (e.g., NASDAQ:AAPL)"
              />
              <button onClick={addToWatchlist}>Add</button>
            </div>

            <ul className="watchlist-items">
              {watchlist.map((item, index) => (
                <li key={index}>
                  {item}
                  <button 
                    onClick={() => removeFromWatchlist(item)}
                    className="remove-button"
                  >
                    ❌
                  </button>
                </li>
              ))}
            </ul>

            <button 
              className="close-modal-button"
              onClick={() => setShowWatchlistModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};