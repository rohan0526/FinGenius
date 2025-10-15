import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

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
      
      const response = await fetch(`${API_BASE_URL}/trade/portfolio`, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include',
        mode: 'cors'
      });

      const data = await response.json();
      console.log("Portfolio API Response:", data);

      if (!response.ok) {
        if (response.status === 401) {
          setError('Session expired. Please login again.');
          return;
        }
        throw new Error(data.error || 'Failed to fetch portfolio');
      }

      if (data.portfolio) {
        setPortfolio(data.portfolio);
        setBalances(data.balances || { balance_usd: 0, balance_inr: 0 });
      } else {
        setPortfolio({});
        setMessage(data.message || "No holdings found");
      }
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
      
      const response = await fetch(`${API_BASE_URL}/trade/buy`, {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        mode: 'cors',
        body: JSON.stringify(buyForm),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 401) {
          setError('Session expired. Please login again.');
          return;
        }
        throw new Error(data.error || 'Failed to buy stock');
      }
      
      setMessage(data.message || 'Stock bought successfully!');
      await fetchPortfolio();
      setBuyForm({ ticker: '', quantity: '', market: 'USD' });
    } catch (error) {
      console.error('Error buying stock:', error);
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
      
      const response = await fetch(`${API_BASE_URL}/trade/sell`, {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        mode: 'cors',
        body: JSON.stringify(sellForm),
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

  // Check if user is authenticated
  if (!user) {
    return (
      <div className="p-4">
        <h2 className="text-2xl font-bold">📈 Paper Trading Platform</h2>
        <p className="text-red-600 mt-4">Please login to access paper trading.</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold">📈 Paper Trading Platform</h2>

      {/* Balances Display */}
      <div className="mt-4 p-4 bg-gray-100 rounded">
        <h3 className="text-lg font-semibold">Account Balances</h3>
        <p>USD Balance: <strong>${balances.balance_usd?.toFixed(2) || 0}</strong></p>
        <p>INR Balance: <strong>₹{balances.balance_inr?.toFixed(2) || 0}</strong></p>
      </div>

      {error && <p className="text-red-600 mt-2 p-2 bg-red-100 rounded">{error}</p>}
      {message && <p className="text-green-600 mt-2 p-2 bg-green-100 rounded">{message}</p>}

      {/* Buy Form */}
      <form onSubmit={handleBuy} className="mt-4">
        <h3 className="text-xl font-semibold">Buy Stocks</h3>
        <input 
          type="text" 
          placeholder="Ticker" 
          value={buyForm.ticker} 
          onChange={(e) => setBuyForm({ ...buyForm, ticker: e.target.value.toUpperCase() })} 
          required 
        />
        <input 
          type="number" 
          placeholder="Quantity" 
          value={buyForm.quantity} 
          onChange={(e) => setBuyForm({ ...buyForm, quantity: e.target.value })} 
          required 
        />
        <select value={buyForm.market} onChange={(e) => setBuyForm({ ...buyForm, market: e.target.value })}>
          <option value="USD">USD</option>
          <option value="INR">INR</option>
        </select>
        <button type="submit">Buy Stock</button>
      </form>

      {/* Sell Form */}
      <form onSubmit={handleSell} className="mt-4">
        <h3 className="text-xl font-semibold">Sell Stocks</h3>
        <input 
          type="text" 
          placeholder="Ticker" 
          value={sellForm.ticker} 
          onChange={(e) => setSellForm({ ...sellForm, ticker: e.target.value.toUpperCase() })} 
          required 
        />
        <input 
          type="number" 
          placeholder="Quantity" 
          value={sellForm.quantity} 
          onChange={(e) => setSellForm({ ...sellForm, quantity: e.target.value })} 
          required 
        />
        <button type="submit">Sell Stock</button>
      </form>

      {/* View Portfolio Button */}
      <button 
        onClick={() => setShowPortfolio(!showPortfolio)} 
        className="mt-4 bg-blue-500 text-white px-4 py-2"
      >
        {showPortfolio ? 'Hide Portfolio' : 'View My Portfolio'}
      </button>

      {/* Portfolio */}
      {showPortfolio && (
        <div className="mt-4">
          <h3 className="text-xl font-semibold">📊 Portfolio</h3>
          
          {/* Show holdings count */}
          <p className="text-gray-700">Total Holdings: <strong>{Object.keys(portfolio).length}</strong></p>
          {loading && <p className="text-blue-600">Loading portfolio...</p>}

          {Object.keys(portfolio).length > 0 ? (
            <table className="w-full border-collapse border border-gray-500 mt-2">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border p-2">Ticker</th>
                  <th className="border p-2">Market</th>
                  <th className="border p-2">Total Quantity</th>
                  <th className="border p-2">Avg Cost</th>
                  <th className="border p-2">Current Price</th>
                  <th className="border p-2">Market Value</th>
                  <th className="border p-2">Unrealized P/L</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(portfolio).map(([ticker, data]) => (
                  <tr key={ticker} className="border">
                    <td className="border p-2 font-semibold">{ticker}</td>
                    <td className="border p-2">{data.market}</td>
                    <td className="border p-2">{data.total_quantity}</td>
                    <td className="border p-2">
                      {data.market === 'USD' ? '$' : '₹'}{data.average_cost?.toFixed(2) || 'N/A'}
                    </td>
                    <td className="border p-2">
                      {data.current_price ? `${data.market === 'USD' ? '$' : '₹'}${data.current_price.toFixed(2)}` : 'N/A'}
                    </td>
                    <td className="border p-2">
                      {typeof data.total_market_value === 'number' 
                        ? `${data.market === 'USD' ? '$' : '₹'}${data.total_market_value.toFixed(2)}` 
                        : data.total_market_value}
                    </td>
                    <td className={`border p-2 font-semibold ${
                      typeof data.unrealized_pl === 'number' 
                        ? (data.unrealized_pl >= 0 ? 'text-green-600' : 'text-red-600')
                        : ''
                    }`}>
                      {typeof data.unrealized_pl === 'number'
                        ? `${data.market === 'USD' ? '$' : '₹'}${data.unrealized_pl.toFixed(2)}`
                        : data.unrealized_pl}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-600 mt-2">No holdings found. Start trading to build your portfolio!</p>
          )}
        </div>
      )}
    </div>
  );
};
