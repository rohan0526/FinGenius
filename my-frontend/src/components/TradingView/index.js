import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { BarChart3 } from "lucide-react";
import "./CSS/index.css";

export const TradingView = () => {
  const [ticker, setTicker] = useState("");
  const [quantity, setQuantity] = useState("");
  const [market, setMarket] = useState("USD");
  const [message, setMessage] = useState("");
  const [watchlist, setWatchlist] = useState([
    // US Market stocks
    "NASDAQ:AAPL",
    "NASDAQ:GOOGL",
    "NASDAQ:MSFT",
    "NASDAQ:TSLA",
    "NASDAQ:META",
    "NASDAQ:AMZN",
    "NASDAQ:NFLX",
    "NASDAQ:NVDA",
    "NASDAQ:AMD",
    "NASDAQ:INTC",
    "NYSE:BAC",
    "NYSE:JPM",
    "NYSE:GS",
    "NYSE:MS",
    "NYSE:V",
    "NYSE:MA",
    "NYSE:DIS",
    "NYSE:KO",
    "NYSE:WMT",
    "NYSE:PG",
    // Indian Market stocks
    "NSE:RELIANCE",
    "NSE:TCS",
    "NSE:INFY",
    "NSE:HDFC",
    "NSE:SBIN",
    "NSE:ICICI",
    "NSE:TATAMOTORS",
    "NSE:WIPRO"
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
    
    if (!storedToken) {
      console.error("❌ No token found in localStorage");
      setMessage("Please login to access trading");
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
      symbol: "NASDAQ:TSLA",
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
        "NASDAQ:META",
        "NASDAQ:AMZN",
        "NASDAQ:NFLX",
        "NASDAQ:NVDA",
        "NASDAQ:AMD",
        "NASDAQ:INTC",
        "NYSE:BAC",
        "NYSE:JPM",
        "NYSE:GS",
        "NYSE:MS",
        "NYSE:V",
        "NYSE:MA",
        "NYSE:DIS",
        "NYSE:KO",
        "NYSE:WMT",
        "NYSE:PG",
        "NSE:RELIANCE",
        "NSE:TCS",
        "NSE:INFY",
        "NSE:HDFC",
        "NSE:SBIN",
        "NSE:ICICI",
        "NSE:TATAMOTORS",
        "NSE:WIPRO"
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
                    const exchangeSymbol = data.data[0];
                    const [exchange, symbol] = exchangeSymbol.split(':');
                    setTicker(symbol);
                    
                    // Determine market based on exchange
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
  

  // Buy Stock
  const buyStock = () => {
    if (!ticker || !quantity) {
      setMessage("Please enter ticker and quantity");
      return;
    }
    
    const currentToken = localStorage.getItem('token');
    if (!currentToken) {
      setMessage("Unauthorized - Please login again");
      return;
    }
    
    // Format ticker for Indian market
    const formattedTicker = market === 'INR' ? ticker.replace('.NS', '') : ticker;
    const endpoint = market === 'INR' ? '/tradeINR/buy' : '/trade/buy';  // Updated endpoint
    
    console.log("Buying stock:", { ticker: formattedTicker, quantity, market });
    
    axios.post(
      `https://rapid-grossly-raven.ngrok-free.app${endpoint}`,
      { 
        ticker: formattedTicker, 
        quantity: parseInt(quantity), 
        cache_duration: 60,
        force_refresh: false
      },
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
      const currency = market === 'INR' ? '₹' : '$';
      setMessage(`${res.data.message} | Price: ${currency}${res.data.price_per_share} | Total Cost: ${currency}${res.data.total_cost}`);
    })
    .catch((err) => {
      console.error("Error buying stock:", err);
      if (err.response?.status === 401) {
        setMessage("Unauthorized - Session expired. Please login again.");
      } else {
        setMessage(err.response?.data?.error || "Purchase failed");
      }
    });
  };

  // Sell Stock
  const sellStock = () => {
    const currentToken = localStorage.getItem('token');
    if (!currentToken) {
      setMessage("Unauthorized - Please login again");
      return;
    }
    
    // Format ticker for Indian market
    const formattedTicker = market === 'INR' ? ticker.replace('.NS', '') : ticker;
    const endpoint = market === 'INR' ? '/tradeINR/sell' : '/trade/sell';  // Updated endpoint
    
    console.log("Selling stock:", { ticker: formattedTicker, quantity, market });
    
    axios.post(
      `https://rapid-grossly-raven.ngrok-free.app${endpoint}`,
      { 
        ticker: formattedTicker, 
        quantity: parseInt(quantity), 
        cache_duration: 60,
        force_refresh: false
      },
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
      const currency = market === 'INR' ? '₹' : '$';
      setMessage(`${res.data.message} | Price: ${currency}${res.data.price_per_share} | Revenue: ${currency}${res.data.total_revenue} | P/L: ${currency}${res.data.realized_pl}`);
    })
    .catch((err) => {
      console.error("Error selling stock:", err);
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
      // Add appropriate exchange prefix based on market
      formattedItem = market === 'USD' ? `NASDAQ:${formattedItem}` : `NSE:${formattedItem}`;
    }
    
    if (!watchlist.includes(formattedItem)) {
      const newWatchlist = [...watchlist, formattedItem];
      setWatchlist(newWatchlist);
      reinitializeTradingViewWidget(newWatchlist);
    }
    setNewWatchlistItem("");
  }, [newWatchlistItem, watchlist, market, reinitializeTradingViewWidget]);

  // Function to remove stock from watchlist
  const removeFromWatchlist = useCallback((itemToRemove) => {
    const newWatchlist = watchlist.filter(item => item !== itemToRemove);
    setWatchlist(newWatchlist);
    reinitializeTradingViewWidget(newWatchlist);
  }, [watchlist, reinitializeTradingViewWidget]);


  return (
    <div className="trading-page">
      <div className="trading-container">
        {/* Page Header */}
        <div className="page-header">
          <div className="header-content">
            <div className="header-icon">
              <BarChart3 size={36} />
            </div>
            <div>
              <h1>Paper Trading Platform</h1>
              <p className="header-subtitle">
                Practice trading with real-time market data and advanced analytics
              </p>
            </div>
          </div>
        </div>
        
        {/* Trading Layout */}
        <div className="trading-layout">
          {/* Left side - Chart */}
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

          {/* Right side - Trading Form */}
          <div className="trading-layout-right">
            <div className="trading-form">
              <h2>Trade Stocks</h2>
              
              <div className="form-group">
                <label htmlFor="ticker">Stock Symbol</label>
                <input
                  type="text"
                  id="ticker"
                  value={ticker}
                  onChange={(e) => setTicker(e.target.value)}
                  placeholder="Enter stock symbol (e.g., AAPL)"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="quantity">Quantity</label>
                <input
                  type="number"
                  id="quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="Enter number of shares"
                  min="1"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="market">Market</label>
                <select 
                  id="market"
                  value={market}
                  onChange={(e) => setMarket(e.target.value)}
                >
                  <option value="USD">US Market (USD)</option>
                  <option value="INR">Indian Market (INR)</option>
                </select>
              </div>
              
              <div className="trading-buttons">
                <button className="buy-button" onClick={buyStock}>
                  Buy Stock
                </button>
                <button className="sell-button" onClick={sellStock}>
                  Sell Stock
                </button>
              </div>

              {message && (
                <div className="status-message">
                  {message}
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