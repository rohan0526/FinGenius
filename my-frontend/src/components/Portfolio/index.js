import React, { useEffect, useState } from "react";
import axios from "axios";
import { Briefcase, TrendingUp, TrendingDown } from "lucide-react";
import "./CSS/index.css";

export const Portfolio = () => {
  const [usdStocks, setUsdStocks] = useState([]);
  const [inrStocks, setInrStocks] = useState([]);
  const [message, setMessage] = useState("");
  const [token, setToken] = useState("");
  const [userId, setUserId] = useState("");

  // Get token and userId from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    
    console.log("=== Portfolio Component Mounted ===");
    console.log("Token from localStorage:", storedToken ? storedToken.substring(0, 30) + "..." : "NOT FOUND");
    console.log("User from localStorage:", storedUser);
    
    if (storedToken) {
      setToken(storedToken);
      console.log("✅ Token set in state");
    } else {
      console.error("❌ No token found in localStorage");
      setMessage("Please login to access portfolio");
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

        // Convert object to array and separate by currency
        const portfolioArray = Object.entries(res.data.portfolio).map(([ticker, stock]) => ({
          ticker,
          ...stock,
        }));

        const usdHoldings = portfolioArray.filter(stock => stock.market === 'USD');
        const inrHoldings = portfolioArray.filter(stock => stock.market === 'INR');

        setUsdStocks(usdHoldings);
        setInrStocks(inrHoldings);
      })
      .catch((err) => {
        console.error("Error fetching portfolio:", err);
        if (err.response) {
          console.error("Response data:", err.response.data);
          if (err.response.status === 401) {
            setMessage("Session expired. Please login again.");
          } else if (err.response.status === 404) {
            console.log("No holdings found (404 response)");
            setUsdStocks([]);
            setInrStocks([]);
            setMessage(err.response.data.message || "No holdings found");
          }
        }
      });
  };

  // Separate calculations for USD and INR portfolios
  const calculateValues = (stocks) => ({
    totalValue: stocks.reduce((total, stock) => total + (stock.total_market_value || 0), 0),
    totalPL: stocks.reduce((total, stock) => total + (stock.unrealized_pl || 0), 0),
    totalCost: stocks.reduce((total, stock) => total + (stock.total_cost || 0), 0),
  });

  const usdValues = calculateValues(usdStocks);
  const inrValues = calculateValues(inrStocks);

  const getCurrencySymbol = (currency) => {
    return currency === 'USD' ? '$' : '₹';
  };

  const renderHoldingsSection = (stocks, currency) => (
    <div className="portfolio-holdings">
      <div className="section-header">
        <h2>{currency} Holdings</h2>
      </div>

      {stocks.length > 0 ? (
        <div className="holdings-grid">
          {stocks.map((stock, index) => (
            <div key={index} className="holding-card">
              <div className="holding-header">
                <div className="holding-ticker">
                  <strong>{stock.ticker}</strong>
                  <span className="holding-market">({stock.market})</span>
                </div>
                <div className={`holding-pl ${stock.unrealized_pl >= 0 ? 'positive' : 'negative'}`}>
                  {stock.unrealized_pl >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  {getCurrencySymbol(currency)}{Math.abs(stock.unrealized_pl?.toFixed(2))}
                </div>
              </div>

              <div className="holding-stats">
                <div className="stat-row">
                  <span className="stat-label">Shares</span>
                  <span className="stat-value">{stock.total_quantity}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Avg Cost</span>
                  <span className="stat-value">{getCurrencySymbol(currency)}{stock.average_cost?.toFixed(2)}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Current Price</span>
                  <span className="stat-value">{getCurrencySymbol(currency)}{stock.current_price?.toFixed(2)}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Total Cost</span>
                  <span className="stat-value">{getCurrencySymbol(currency)}{stock.total_cost?.toFixed(2)}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Market Value</span>
                  <span className="stat-value">{getCurrencySymbol(currency)}{stock.total_market_value?.toFixed(2)}</span>
                </div>
              </div>

              <div className="holding-lots">
                <h4 className="lots-header">Purchase History</h4>
                <div className="lots-list">
                  {stock.lots.map((lot) => (
                    <div key={lot.lot_id} className="lot-item">
                      <div className="lot-info">
                        <span className="lot-date">
                          📅 {new Date(lot.purchase_date).toLocaleDateString()}
                        </span>
                        <span className="lot-details">
                          {lot.quantity} shares @ {getCurrencySymbol(currency)}{lot.purchase_price?.toFixed(2)}
                        </span>
                      </div>
                      <span className="lot-cost">{getCurrencySymbol(currency)}{lot.cost_basis?.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="portfolio-empty">
          <Briefcase size={64} />
          <p>No {currency} stocks owned yet</p>
          <p className="empty-subtitle">Start trading to build your portfolio!</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="portfolio-page">
      <div className="portfolio-container">
        <div className="page-header">
          <div className="header-content">
            <div className="header-icon">
              <Briefcase size={32} />
            </div>
            <div>
              <h1>Your Portfolio</h1>
              <p className="header-subtitle">Track your investments and performance</p>
            </div>
          </div>
        </div>

        {/* Display message if exists */}
        {message && <div className="status-message">{message}</div>}

        {/* USD Portfolio Summary */}
        <h2 className="currency-header">USD Portfolio</h2>
        <div className="portfolio-summary">
          <div className="summary-card">
            <div className="summary-label">USD Market Value</div>
            <div className="summary-value">${usdValues.totalValue.toFixed(2)}</div>
          </div>
          <div className="summary-card">
            <div className="summary-label">USD Cost Basis</div>
            <div className="summary-value">${usdValues.totalCost.toFixed(2)}</div>
          </div>
          <div className="summary-card">
            <div className="summary-label">USD P&L</div>
            <div className={`summary-value ${usdValues.totalPL >= 0 ? 'positive' : 'negative'}`}>
              {usdValues.totalPL >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
              ${usdValues.totalPL.toFixed(2)}
            </div>
          </div>
        </div>

        {renderHoldingsSection(usdStocks, 'USD')}

        {/* INR Portfolio Summary */}
        <h2 className="currency-header">INR Portfolio</h2>
        <div className="portfolio-summary">
          <div className="summary-card">
            <div className="summary-label">INR Market Value</div>
            <div className="summary-value">₹{inrValues.totalValue.toFixed(2)}</div>
          </div>
          <div className="summary-card">
            <div className="summary-label">INR Cost Basis</div>
            <div className="summary-value">₹{inrValues.totalCost.toFixed(2)}</div>
          </div>
          <div className="summary-card">
            <div className="summary-label">INR P&L</div>
            <div className={`summary-value ${inrValues.totalPL >= 0 ? 'positive' : 'negative'}`}>
              {inrValues.totalPL >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
              ₹{inrValues.totalPL.toFixed(2)}
            </div>
          </div>
        </div>

        {renderHoldingsSection(inrStocks, 'INR')}
      </div>
    </div>
  );
};
