import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './styles.css';

const API_BASE_URL = 'https://rapid-grossly-raven.ngrok-free.app';

export const PaperTrading = () => {
  const { user } = useAuth();
  const [portfolio, setPortfolio] = useState({});
  const [balances, setBalances] = useState({ balance_usd: 0, balance_inr: 0 });
  const [buyForm, setBuyForm] = useState({ ticker: '', quantity: '', market: 'USD' });
  const [sellForm, setSellForm] = useState({ ticker: '', quantity: '', market: 'USD' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showPortfolio, setShowPortfolio] = useState(false);
  const [loading, setLoading] = useState(false);

  // Helper to get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    };
  };

  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch both US and Indian portfolios
      const [usResponse, indianResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/trade/portfolio?cache_duration=60&force_refresh=false`, {
          method: 'GET',
          headers: getAuthHeaders(),
          credentials: 'include',
          mode: 'cors'
        }),
        fetch(`${API_BASE_URL}/tradeINR/portfolio?cache_duration=60&force_refresh=false`, {  // Updated endpoint
          method: 'GET',
          headers: getAuthHeaders(),
          credentials: 'include',
          mode: 'cors'
        })
      ]);

      const usData = await usResponse.json();
      const indianData = await indianResponse.json();

      if (!usResponse.ok || !indianResponse.ok) {
        if (usResponse.status === 401 || indianResponse.status === 401) {
          setError('Session expired. Please login again.');
          return;
        }
        throw new Error('Failed to fetch portfolio');
      }

      // Merge portfolios and balances
      setPortfolio({
        ...usData.portfolio,
        ...indianData.portfolio
      });
      
      setBalances({
        balance_usd: usData.balance_usd || 0,
        balance_inr: indianData.balance_inr || 0
      });
      
    } catch (error) {
      console.error("Error fetching portfolio:", error);
      setError(error.message || 'Error fetching portfolio');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
    const interval = setInterval(fetchPortfolio, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const handleBuy = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    try {
      setLoading(true);
      
      const endpoint = buyForm.market === 'INR' ? '/tradeINR/buy' : '/trade/buy';  // Updated endpoint
      const formattedTicker = buyForm.market === 'INR' ? buyForm.ticker.replace('.NS', '') : buyForm.ticker;
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        mode: 'cors',
        body: JSON.stringify({
          ticker: formattedTicker,
          quantity: parseInt(buyForm.quantity),
          cache_duration: 60,
          force_refresh: false
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 401) {
          setError('Session expired. Please login again.');
          return;
        }
        throw new Error(data.error || 'Failed to buy stock');
      }
      
      setMessage(`${data.message} | Price: ${data.price_per_share} | Total: ${data.total_cost}`);
      await fetchPortfolio();
      setBuyForm({ ticker: '', quantity: '', market: 'USD' });
    } catch (error) {
      setError(error.message || 'Error buying stock');
    } finally {
      setLoading(false);
    }
  };

  const handleSell = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    try {
      setLoading(true);
      
      const endpoint = sellForm.market === 'INR' ? '/tradeINR/sell' : '/trade/sell';  // Updated endpoint
      const formattedTicker = sellForm.market === 'INR' ? sellForm.ticker.replace('.NS', '') : sellForm.ticker;
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        mode: 'cors',
        body: JSON.stringify({
          ticker: formattedTicker,
          quantity: parseInt(sellForm.quantity),
          cache_duration: 60,
          force_refresh: false
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 401) {
          setError('Session expired. Please login again.');
          return;
        }
        throw new Error(data.error || 'Failed to sell stock');
      }
      
      setMessage(`${data.message} | Realized P/L: $${data.realized_pl?.toFixed(2) || 0}`);
      await fetchPortfolio();
      setSellForm({ ticker: '', quantity: '', market: 'USD' });
    } catch (error) {
      console.error('Error selling stock:', error);
      setError(error.message || 'Error selling stock');
    } finally {
      setLoading(false);
    }
  };

  const formatTickerDisplay = (ticker) => {
    // Remove .NS or .BO suffix for display
    return ticker.replace('.NS', '').replace('.BO', '');
  };

  // Format currency based on market
  const formatCurrency = (amount, currency = 'USD') => {
    if (currency === 'INR') {
      return `₹${amount.toFixed(2)}`;
    }
    return `$${amount.toFixed(2)}`;
  };

  // Check if user is authenticated
  if (!user) {
    return (
      <div className="trading-page">
        <div className="trading-container">
          <div className="page-header">
            <div className="header-content">
              <div className="header-icon">📈</div>
              <div>
                <h1>Paper Trading Platform</h1>
                <p className="header-subtitle">Please login to access trading features</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="trading-page">
      <div className="trading-container">
        <div className="page-header">
          <div className="header-content">
            <div className="header-icon">📈</div>
            <div>
              <h1>Paper Trading Portfolio</h1>
              <p className="header-subtitle">Track your investments and performance</p>
            </div>
          </div>
        </div>

        {/* Account Summary Card */}
        <div className="account-summary">
          <div className="balance-card">
            <h3>USD Balance</h3>
            <div className="balance-amount">${balances.balance_usd?.toFixed(2) || 0}</div>
          </div>
          <div className="balance-card">
            <h3>INR Balance</h3>
            <div className="balance-amount">₹{balances.balance_inr?.toFixed(2) || 0}</div>
          </div>
        </div>

        {/* Status Messages */}
        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}
        {loading && <div className="loading-message">Processing your request...</div>}

        <div className="trading-layout">
          {/* Trading Forms Section */}
          <div className="trading-forms">
            {/* Buy Form */}
            <div className="trading-form">
              <h2>Buy Stocks</h2>
              <form onSubmit={handleBuy}>
                <div className="form-group">
                  <label htmlFor="buyTicker">Stock Symbol</label>
                  <input
                    id="buyTicker"
                    type="text"
                    placeholder="Enter stock symbol (e.g., AAPL)"
                    value={buyForm.ticker}
                    onChange={(e) => setBuyForm({ ...buyForm, ticker: e.target.value.toUpperCase() })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="buyQuantity">Quantity</label>
                  <input
                    id="buyQuantity"
                    type="number"
                    placeholder="Enter number of shares"
                    value={buyForm.quantity}
                    onChange={(e) => setBuyForm({ ...buyForm, quantity: e.target.value })}
                    required
                    min="1"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="buyMarket">Market</label>
                  <select
                    id="buyMarket"
                    value={buyForm.market}
                    onChange={(e) => setBuyForm({ ...buyForm, market: e.target.value })}
                  >
                    <option value="USD">US Market (USD)</option>
                    <option value="INR">Indian Market (INR)</option>
                  </select>
                </div>

                <button type="submit" className="buy-button">Buy Stock</button>
              </form>
            </div>

            {/* Sell Form */}
            <div className="trading-form">
              <h2>Sell Stocks</h2>
              <form onSubmit={handleSell}>
                <div className="form-group">
                  <label htmlFor="sellTicker">Stock Symbol</label>
                  <input
                    id="sellTicker"
                    type="text"
                    placeholder="Enter stock symbol (e.g., AAPL)"
                    value={sellForm.ticker}
                    onChange={(e) => setSellForm({ ...sellForm, ticker: e.target.value.toUpperCase() })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="sellQuantity">Quantity</label>
                  <input
                    id="sellQuantity"
                    type="number"
                    placeholder="Enter number of shares"
                    value={sellForm.quantity}
                    onChange={(e) => setSellForm({ ...sellForm, quantity: e.target.value })}
                    required
                    min="1"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="sellMarket">Market</label>
                  <select
                    id="sellMarket"
                    value={sellForm.market}
                    onChange={(e) => setSellForm({ ...sellForm, market: e.target.value })}
                  >
                    <option value="USD">US Market (USD)</option>
                    <option value="INR">Indian Market (INR)</option>
                  </select>
                </div>

                <button type="submit" className="sell-button">Sell Stock</button>
              </form>
            </div>
          </div>

          {/* Portfolio Section */}
          <div className="portfolio-section">
            <div className="section-header">
              <h2>Portfolio Overview</h2>
              <button onClick={() => setShowPortfolio(!showPortfolio)} className="view-toggle-button">
                {showPortfolio ? 'Hide Details' : 'Show Details'}
              </button>
            </div>

            {showPortfolio && (
              <div className="portfolio-content">
                <div className="portfolio-summary">
                  <p>Total Holdings: <strong>{Object.keys(portfolio).length}</strong></p>
                </div>

                {Object.keys(portfolio).length > 0 ? (
                  <div className="portfolio-table-wrapper">
                    <table className="portfolio-table">
                      <thead>
                        <tr>
                          <th>Symbol</th>
                          <th>Market</th>
                          <th>Quantity</th>
                          <th>Avg Cost</th>
                          <th>Current</th>
                          <th>Value</th>
                          <th>P/L</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(portfolio).map(([ticker, data]) => (
                          <tr key={ticker}>
                            <td>{formatTickerDisplay(ticker)}</td>
                            <td>{data.market}</td>
                            <td>{data.total_quantity}</td>
                            <td>{formatCurrency(data.average_cost, data.market)}</td>
                            <td>{formatCurrency(data.current_price, data.market)}</td>
                            <td>{formatCurrency(data.total_market_value, data.market)}</td>
                            <td className={data.unrealized_pl >= 0 ? 'profit' : 'loss'}>
                              {formatCurrency(data.unrealized_pl, data.market)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="empty-portfolio">
                    <p>Your portfolio is empty. Start trading to see your holdings here!</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
