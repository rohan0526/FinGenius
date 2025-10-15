import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import "./CSS/index.css";
import { User, Settings, Home, HelpCircle, LogOut, Trash2, PenLine, Cpu, X, MessageCircle, TrendingUp, Sparkles, Zap, Shield, BarChart3, Newspaper, Gamepad2, ArrowRight, Star } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import StockNews from "../StockNews";

const QueryApp = () => {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");
  const [userId, setUserId] = useState("");
  const navigate = useNavigate();

  // Get token and userId from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
    }
    
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        if (userData.user_id) {
          setUserId(userData.user_id);
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  const sendQuery = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResponse("");

    try {
      const res = await fetch("https://rapid-grossly-raven.ngrok-free.app/gemini/ask", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify({ 
          query,
          user_id: userId // Include user ID in the request body
        }),
      });

      const data = await res.json();
      setResponse(data.response || "No response received.");
    } catch (error) {
      setResponse("Error fetching response.");
    }

    setLoading(false);
  };

  return (
    <div className="query-container">
      <h1 className="query-title">AI Assistant</h1>
      <textarea
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Type your question here..."
        className="query-textarea"
      />
      <button onClick={sendQuery} disabled={loading}>
        {loading ? "Loading..." : "Submit"}
      </button>
      {response && (
        <div className="query-response">
          <ReactMarkdown>{response}</ReactMarkdown>
        </div>
      )}
    </div>
  );
};

export const HomePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check for query parameter first, then localStorage
  const [activeTab, setActiveTab] = useState(() => {
    // First check URL query params
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    
    if (tabParam === 'stock-news') {
      return 'stock-news';
    }
    
    // Then check localStorage
    const savedTab = localStorage.getItem('activeTab');
    if (savedTab) {
      return savedTab;
    }
    
    return "home";
  });
  
  // Update activeTab when URL changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    
    if (tabParam === 'stock-news') {
      setActiveTab('stock-news');
    } else {
      const savedTab = localStorage.getItem('activeTab');
      if (savedTab) {
        setActiveTab(savedTab);
        // Clear localStorage after using it
        localStorage.removeItem('activeTab');
      }
    }
  }, [location.search]);
  
  const [isWriting, setIsWriting] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [portfolio, setPortfolio] = useState([]);
  const [token, setToken] = useState("");
  const [userId, setUserId] = useState("");

  // Get token and userId from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    
    if (storedToken) {
      setToken(storedToken);
    }
    
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        if (userData.user_id) {
          setUserId(userData.user_id);
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  // Fetch portfolio data
  const fetchPortfolio = async () => {
    try {
      const response = await axios.get("https://rapid-grossly-raven.ngrok-free.app/trade/portfolio", {
        headers: {
          "ngrok-skip-browser-warning": "true",
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // Include token in requests
        },
        params: {
          user_id: userId // Include user ID in the request query params
        }
      });
      setPortfolio(response.data.portfolio || []);
    } catch (error) {
      console.error("Error fetching portfolio:", error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchPortfolio();
    }
  }, [token]);

  const sendMessage = async () => {
    if (!chatInput.trim()) return;

    // Add user message to chat
    const userMessage = { sender: "You", text: chatInput };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput("");
    setIsTyping(true);

    try {
      // Include portfolio data in the query
      const response = await axios.post("https://rapid-grossly-raven.ngrok-free.app/gemini/ask", {
        query: chatInput,
        portfolio: portfolio,
        user_id: userId // Include user ID in the request body
      }, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // Include token in requests
        }
      });

      setIsTyping(false);
      if (response.data.response) {
        setChatMessages(prev => [...prev, { sender: "Bot", text: response.data.response }]);
      }
    } catch (error) {
      setIsTyping(false);
      setChatMessages(prev => [...prev, { sender: "Bot", text: "Sorry, I encountered an error." }]);
    }
  };

  useEffect(() => {
    // Check for active tab after component mounts or activeTab changes
    if (activeTab === "ai-assistant") {
      navigate("/chat");
    } else if (activeTab === "trading-view") {
      navigate("/tradingview");
    } else if (activeTab === "finance-games") {
      navigate("/games");
    } else if (activeTab === "stock-news") {
      // Just stay on the homepage and render StockNews
      console.log("Showing Stock News Component");
    }
  }, [activeTab, navigate]);

  const renderFinGeniusHomepage = () => {
    return (
      <div className="fingenius-homepage">
        {/* Enhanced Hero Section with Animation */}
        <section className="hero-section">
          <div className="hero-background-shapes">
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
            <div className="shape shape-3"></div>
          </div>
          <div className="hero-content">
            <div className="hero-badge">
              <Sparkles size={16} />
              <span>AI-Powered Financial Intelligence</span>
            </div>
            <h1 className="animated-gradient">Transform Your Financial Future</h1>
            <p className="subtitle">Smart Investing Starts Here</p>
            <p className="description">
              Harness the power of AI to make data-driven investment decisions. 
              Get real-time market insights, personalized recommendations, and 
              professional-grade trading tools—all in one platform.
            </p>
            <div className="hero-buttons">
              <button className="primary-button pulse-animation" onClick={() => setActiveTab("ai-assistant")}>
                <Zap size={20} />
                <span>Get Started Free</span>
                <ArrowRight size={18} />
              </button>
              <button className="secondary-button" onClick={() => setActiveTab("trading-view")}>
                <TrendingUp size={20} />
                <span>Explore Trading</span>
              </button>
            </div>
            {/* Interactive market indicators */}
            <div className="market-indicators">
              <div className="indicator up">
                <TrendingUp size={16} className="indicator-icon" />
                <div className="indicator-content">
                  <span className="symbol">NASDAQ</span>
                  <span className="value">+1.2%</span>
                </div>
              </div>
              <div className="indicator up">
                <TrendingUp size={16} className="indicator-icon" />
                <div className="indicator-content">
                  <span className="symbol">S&P 500</span>
                  <span className="value">+0.8%</span>
                </div>
              </div>
              <div className="indicator down">
                <TrendingUp size={16} className="indicator-icon down-icon" />
                <div className="indicator-content">
                  <span className="symbol">DOW</span>
                  <span className="value">-0.3%</span>
                </div>
              </div>
            </div>
          </div>
          <div className="hero-image">
            <div className="hero-image-wrapper">
              <img src={require("../../assets/images/financial-ai.png")} alt="Financial AI" className="floating-animation" />
              <div className="glowing-orb"></div>
              <div className="floating-elements">
                <div className="floating-element element-1">
                  <BarChart3 size={24} />
                </div>
                <div className="floating-element element-2">
                  <Shield size={24} />
                </div>
                <div className="floating-element element-3">
                  <Star size={24} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Animated Stats Section */}
        <section className="stats-section">
          <div className="stat-card purple">
            <div className="stat-icon">
              <User size={32} />
            </div>
            <h3>10,000+</h3>
            <p>Active Investors</p>
            <div className="stat-trend">↑ 23% this month</div>
          </div>
          <div className="stat-card blue">
            <div className="stat-icon">
              <TrendingUp size={32} />
            </div>
            <h3>$500M+</h3>
            <p>Assets Under Analysis</p>
            <div className="stat-trend">↑ Growing daily</div>
          </div>
          <div className="stat-card teal">
            <div className="stat-icon">
              <Star size={32} />
            </div>
            <h3>95%</h3>
            <p>Satisfaction Rate</p>
            <div className="stat-trend">★★★★★ 4.8/5</div>
          </div>
          <div className="stat-card orange">
            <div className="stat-icon">
              <Zap size={32} />
            </div>
            <h3>24/7</h3>
            <p>AI-Powered Support</p>
            <div className="stat-trend">Always available</div>
          </div>
        </section>

        {/* Enhanced Features Section with Interactions */}
        <section className="features-section">
          <div className="section-header">
            <h2 className="section-title">Powerful Features for Smart Investing</h2>
            <p className="section-subtitle">Everything you need to succeed in the financial markets</p>
          </div>
          <div className="features-grid">
            <div className="feature-card featured">
              <div className="feature-badge">Most Popular</div>
              <div className="feature-icon ai-icon">
                <Cpu size={40} />
              </div>
              <h3>AI Financial Assistant</h3>
              <p>Get personalized financial advice powered by advanced machine learning algorithms. Ask questions, get insights, and make informed decisions.</p>
              <ul className="feature-list">
                <li>✓ Real-time market analysis</li>
                <li>✓ Personalized recommendations</li>
                <li>✓ Portfolio optimization</li>
              </ul>
              <button className="feature-button" onClick={() => setActiveTab("ai-assistant")}>
                <span>Try Now</span>
                <ArrowRight size={16} />
              </button>
            </div>
            <div className="feature-card">
              <div className="feature-icon trading-icon">
                <BarChart3 size={40} />
              </div>
              <h3>Advanced Trading View</h3>
              <p>Professional-grade charting tools with real-time data. Technical indicators, drawing tools, and multi-timeframe analysis.</p>
              <ul className="feature-list">
                <li>✓ Live market data</li>
                <li>✓ Technical indicators</li>
                <li>✓ Custom alerts</li>
              </ul>
              <button className="feature-button" onClick={() => setActiveTab("trading-view")}>
                <span>Start Trading</span>
                <ArrowRight size={16} />
              </button>
            </div>
            <div className="feature-card">
              <div className="feature-icon news-icon">
                <Newspaper size={40} />
              </div>
              <h3>Market News & Insights</h3>
              <p>Stay ahead with curated financial news, market updates, and expert analysis delivered in real-time.</p>
              <ul className="feature-list">
                <li>✓ Breaking news alerts</li>
                <li>✓ Expert analysis</li>
                <li>✓ Sector insights</li>
              </ul>
              <button className="feature-button" onClick={() => setActiveTab("stock-news")}>
                <span>Read News</span>
                <ArrowRight size={16} />
              </button>
            </div>
            <div className="feature-card">
              <div className="feature-icon games-icon">
                <Gamepad2 size={40} />
              </div>
              <h3>Interactive Learning</h3>
              <p>Master financial concepts through engaging games and simulations. Learn by doing in a risk-free environment.</p>
              <ul className="feature-list">
                <li>✓ Trading simulations</li>
                <li>✓ Risk management</li>
                <li>✓ Strategy building</li>
              </ul>
              <button className="feature-button" onClick={() => setActiveTab("finance-games")}>
                <span>Play Now</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </section>

        {/* Dynamic How It Works Section */}
        <section className="how-it-works-section">
          <h2 className="section-title">How FinGenius Works</h2>
          <div className="steps-container">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3>Sign Up</h3>
              <p>Create your account in seconds and set your financial goals.</p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <h3>Connect</h3>
              <p>Link your financial accounts or explore market data.</p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <h3>Get Insights</h3>
              <p>Receive AI-powered financial advice tailored to your needs.</p>
            </div>
            <div className="step-card">
              <div className="step-number">4</div>
              <h3>Take Action</h3>
              <p>Make informed decisions based on data-driven recommendations.</p>
            </div>
          </div>
        </section>

        {/* Enhanced Interactive Testimonials */}
        <section className="testimonials-section">
          <h2 className="section-title">What Our Users Say</h2>
          <div className="testimonial-card highlighted">
            <div className="quote-mark">"</div>
            <p className="testimonial-text">
              FinGenius has completely transformed how I manage my investments. The AI
              recommendations have been spot on!
            </p>
            <div className="testimonial-author-box">
              <div className="testimonial-avatar"></div>
              <p className="testimonial-author">Sarah J., Investor</p>
            </div>
          </div>
          <div className="testimonial-navigation">
            <div className="nav-dot active"></div>
            <div className="nav-dot"></div>
            <div className="nav-dot"></div>
            <div className="nav-dot"></div>
          </div>
        </section>

        {/* Enhanced Footer with Animation */}
        <footer className="fingenius-footer">
          <div className="footer-column">
            <h3>FinGenius</h3>
            <p>Your AI-powered financial assistant that helps you make smarter financial decisions.</p>
            <div className="social-icons">
              <div className="social-icon"></div>
              <div className="social-icon"></div>
              <div className="social-icon"></div>
            </div>
          </div>
          <div className="footer-column">
            <h3>Quick Links</h3>
            <ul>
              <li onClick={() => setActiveTab("home")}>Home</li>
              <li onClick={() => setActiveTab("ai-assistant")}>AI Assistant</li>
              <li onClick={() => setActiveTab("trading-view")}>Trading View</li>
              <li onClick={() => setActiveTab("stock-news")}>Stock News</li>
              <li onClick={() => setActiveTab("finance-games")}>Finance Games</li>
            </ul>
          </div>
          <div className="footer-column">
            <h3>Contact Us</h3>
            <p>support@fingenius.com</p>
            <p>+1 (123) 456-7890</p>
            <p>123 Finance Street, New York, NY</p>
          </div>
          <div className="footer-bottom">
            <p>© 2023 FinGenius. All rights reserved.</p>
          </div>
        </footer>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return renderFinGeniusHomepage();
      case "profile":
        return (
          <div className="welcome-card">
            <div className="flex items-center mb-4">
              <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mr-4">
                <User size={32} />
              </div>
              <div>
                <h2 className="text-xl font-bold">{user?.email}</h2>
                <p>Registered Email</p>
                {userId && <p className="user-id-display">User ID: {userId}</p>}
              </div>
            </div>
            {token && (
              <div className="token-section">
                <h3 className="text-lg font-semibold mb-2">Your Access Token</h3>
                <div className="token-container">
                  <p className="token-text">{token}</p>
                </div>
                <p className="token-info">This token is used for authenticating your API requests.</p>
              </div>
            )}
          </div>
        );
      case "settings":
        return (
          <div className="welcome-card">
            <h2 className="text-xl font-bold mb-4">Account Settings</h2>
            <div className="space-y-3">
              <div className="settings-option">
                <HelpCircle className="settings-icon" />
                <span>Help</span>
              </div>
              <div className="settings-option">
                <Settings className="settings-icon" />
                <span>About</span>
              </div>
              <div 
                className="settings-option text-red-600"
                onClick={() => {
                  console.log("Logging out user:", userId);
                  logout();
                }}
              >
                <LogOut className="settings-icon" />
                <span>Logout</span>
              </div>
              <div className="settings-option text-red-600">
                <Trash2 className="settings-icon" />
                <span>Delete Profile</span>
              </div>
            </div>
          </div>
        );
      case "stock-news":
        return <StockNews />;
      default:
        return null;
    }
  };

  return (
    <div className="dashboard-container no-sidebar">
      <div className="main-content full-width">
        <div className="content-area">{renderContent()}</div>

        {/* Chat Popup Button */}
        <button 
          className="chat-toggle-button"
          onClick={() => setIsChatOpen(!isChatOpen)}
        >
          <MessageCircle size={24} />
        </button>

        {/* Chat Popup Window */}
        {isChatOpen && (
          <div className="chat-popup">
            <div className="chat-popup-header">
              <h3>Financial Assistant</h3>
              <button onClick={() => setIsChatOpen(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="chat-popup-messages">
              {chatMessages.length === 0 && (
                <div className="welcome-message">
                  <p>👋 Hello! I'm your AI Financial Assistant. I can help you with:</p>
                  <ul>
                    <li>Portfolio analysis</li>
                    <li>Stock market insights</li>
                    <li>Trading strategies</li>
                    <li>Financial concepts</li>
                  </ul>
                </div>
              )}
              
              {chatMessages.map((msg, index) => (
                <div key={index} className={`chat-message ${msg.sender.toLowerCase()}`}>
                  <div className="message-content">
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              )}
            </div>

            <div className="chat-popup-input">
              <textarea
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask me anything about your portfolio or finances..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
              />
              <button onClick={sendMessage}>Send</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
