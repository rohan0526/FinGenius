import React, { useEffect, useState } from "react";
import axios from "axios";
import { Briefcase, TrendingUp, TrendingDown } from "lucide-react";
import "./CSS/index.css";

export const Portfolio = () => {
  const [portfolio, setPortfolio] = useState([]);
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

  // Calculate total portfolio value
  const calculateTotalValue = () => {
    return portfolio.reduce((total, stock) => total + (stock.total_market_value || 0), 0);
  };

  // Calculate total profit/loss
  const calculateTotalPL = () => {
    return portfolio.reduce((total, stock) => total + (stock.unrealized_pl || 0), 0);
  };

  // Calculate total cost
  const calculateTotalCost = () => {
    return portfolio.reduce((total, stock) => total + (stock.total_cost || 0), 0);
  };

  const totalValue = calculateTotalValue();
  const totalPL = calculateTotalPL();
  const totalCost = calculateTotalCost();
  const totalPLPercentage = totalCost > 0 ? ((totalPL / totalCost) * 100) : 0;

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

        {/* Portfolio Summary Cards */}
        <div className="portfolio-summary">
          <div className="summary-card">
            <div className="summary-label">Total Market Value</div>
            <div className="summary-value">${totalValue.toFixed(2)}</div>
          </div>
          <div className="summary-card">
            <div className="summary-label">Total Cost Basis</div>
            <div className="summary-value">${totalCost.toFixed(2)}</div>
          </div>
          <div className="summary-card">
            <div className="summary-label">Total P&L</div>
            <div className={`summary-value ${totalPL >= 0 ? 'positive' : 'negative'}`}>
              {totalPL >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
              ${totalPL.toFixed(2)} ({totalPLPercentage.toFixed(2)}%)
            </div>
          </div>
        </div>

        {/* Portfolio Holdings */}
        <div className="portfolio-holdings">
          <div className="section-header">
            <h2>Holdings</h2>
            <button className="refresh-button" onClick={fetchPortfolio}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2z"/>
                <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
              </svg>
              Refresh Portfolio
            </button>
          </div>

          {message && <div className="status-message">{message}</div>}

          {portfolio.length > 0 ? (
            <div className="holdings-grid">
              {portfolio.map((stock, index) => (
                <div key={index} className="holding-card">
                  <div className="holding-header">
                    <div className="holding-ticker">
                      <strong>{stock.ticker}</strong>
                      <span className="holding-market">({stock.market})</span>
                    </div>
                    <div className={`holding-pl ${stock.unrealized_pl >= 0 ? 'positive' : 'negative'}`}>
                      {stock.unrealized_pl >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                      ${stock.unrealized_pl?.toFixed(2)}
                    </div>
                  </div>

                  <div className="holding-stats">
                    <div className="stat-row">
                      <span className="stat-label">Shares</span>
                      <span className="stat-value">{stock.total_quantity}</span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-label">Avg Cost</span>
                      <span className="stat-value">${stock.average_cost?.toFixed(2)}</span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-label">Current Price</span>
                      <span className="stat-value">${stock.current_price?.toFixed(2)}</span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-label">Total Cost</span>
                      <span className="stat-value">${stock.total_cost?.toFixed(2)}</span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-label">Market Value</span>
                      <span className="stat-value">${stock.total_market_value?.toFixed(2)}</span>
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
                              {lot.quantity} shares @ ${lot.purchase_price?.toFixed(2)}
                            </span>
                          </div>
                          <span className="lot-cost">${lot.cost_basis?.toFixed(2)}</span>
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
              <p>No stocks owned yet</p>
              <p className="empty-subtitle">Start trading to build your portfolio!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
