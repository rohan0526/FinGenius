import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AuthPage } from "./components/AuthPage";
import { HomePage } from "./components/HomePage";
import { Chat } from "./components/Chat";
import { TradingView } from "./components/TradingView";
import { MessageCircle, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import axios from "axios";
import "./styles/ChatPopup.css";
import NavBar from "./components/NAVBAR/NavBar";

// Import game pages
import GamesPage from "./pages/GamesPage";
import BudgetGame from "./pages/BudgetGame";
import EscapeRoom from "./pages/EscapeRoom";
import FakeOrFinance from "./pages/FakeOrFinance";

const ChatPopup = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [portfolio, setPortfolio] = useState([]);

  // Fetch portfolio data
  const fetchPortfolio = async () => {
    try {
      const response = await axios.get("https://rapid-grossly-raven.ngrok-free.app/trade/portfolio", {
        headers: {
          "ngrok-skip-browser-warning": "true",
          "Content-Type": "application/json",
        },
      });
      setPortfolio(response.data.portfolio || []);
    } catch (error) {
      console.error("Error fetching portfolio:", error);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const sendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage = { sender: "You", text: chatInput };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput("");
    setIsTyping(true);

    try {
      const response = await axios.post("https://rapid-grossly-raven.ngrok-free.app/gemini/ask", {
        query: chatInput,
        portfolio: portfolio
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

  return (
    <>
      <button 
        className="chat-toggle-button"
        onClick={() => setIsChatOpen(!isChatOpen)}
      >
        <MessageCircle size={24} />
      </button>

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
    </>
  );
};

// Function to render the profile page
const ProfilePage = () => {
  const navigate = useNavigate();
  
  // Effect to set profile tab
  useEffect(() => {
    // You could set a global state here to indicate profile tab should be active
    // For now, we'll just use localStorage as a simple approach
    localStorage.setItem('activeTab', 'profile');
  }, []);
  
  // Just redirect to homepage which will show profile content based on activeTab
  return <Navigate to="/" />;
};

const AppContent = () => {
  const { user } = useAuth();

  return (
    <>
      {user && <NavBar />}
      <div className="page-container" style={{ margin: 0, padding: 0 }}>
        <Routes>
          <Route path="/" element={user ? <HomePage /> : <Navigate to="/auth" />} />
          <Route path="/auth" element={user ? <Navigate to="/" /> : <AuthPage />} />
          <Route path="/chat" element={user ? <Chat /> : <Navigate to="/auth" />} />
          <Route path="/tradingview" element={user ? <TradingView /> : <Navigate to="/auth" />} />
          <Route path="/profile" element={user ? <ProfilePage /> : <Navigate to="/auth" />} />
          
          {/* Game Routes */}
          <Route path="/games" element={user ? <GamesPage /> : <Navigate to="/auth" />} />
          <Route path="/games/budget" element={user ? <BudgetGame /> : <Navigate to="/auth" />} />
          <Route path="/games/escape-room" element={user ? <EscapeRoom /> : <Navigate to="/auth" />} />
          <Route path="/games/fake-or-finance" element={user ? <FakeOrFinance /> : <Navigate to="/auth" />} />
        </Routes>
      </div>
      {user && <ChatPopup />}
    </>
  );
};

export const App = () => {
  return (
    <div className="app-wrapper" style={{ margin: 0, padding: 0 }}>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </div>
  );
};