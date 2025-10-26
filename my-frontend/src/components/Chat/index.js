import React, { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { startChatSession, sendChatMessage, endChatSession } from "../../services/chatService";
import { Send, Bot, User, Sparkles, TrendingUp, Lightbulb, DollarSign, BarChart3, AlertCircle } from "lucide-react";
import "./CSS/index.css";

export const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [history, setHistory] = useState([]);
  const [isInitializing, setIsInitializing] = useState(true);
  const messagesEndRef = useRef(null);
  const sessionInitialized = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const initializeChat = async () => {
    try {
      setIsInitializing(true);
      setError(null);
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      console.log('Initializing chat with token:', token?.substring(0, 20) + '...'); // Debug log
      
      if (!token) {
        throw new Error('No authentication token found. Please login.');
      }

      // Get user_id from localStorage
      let userId = null;
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          userId = userData.user_id;
          console.log('User ID from localStorage:', userId);
        } catch (e) {
          console.error('Error parsing user data:', e);
        }
      }

      if (!userId) {
        throw new Error('User ID not found. Please login again.');
      }

      const data = await startChatSession(userId, token);
      console.log('Chat session started:', data); // Debug log
      
      if (data.session_id) {
        setSessionId(data.session_id);
        if (data.history) {
          setHistory(data.history);
          setMessages(data.history.map(msg => ({
            sender: msg.is_bot ? "Bot" : "You",
            text: msg.content
          })));
        }
      }
    } catch (err) {
      console.error('Chat initialization error:', err);
      setError(err.message || 'Failed to initialize chat. Please try again.');
    } finally {
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    if (!sessionInitialized.current) {
      initializeChat();
      sessionInitialized.current = true;
    }

    return () => {
      if (sessionId) {
        const token = localStorage.getItem('token');
        endChatSession(sessionId, token).catch(console.error);
      }
    };
  }, [sessionId]);

  const sendMessage = useCallback(async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || !sessionId) return;

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication required');
      return;
    }

    setMessages(prev => [...prev, { sender: "You", text: trimmedInput }]);
    setInput("");
    setIsTyping(true);
    setError(null);

    try {
      console.log('Sending message:', { sessionId, message: trimmedInput }); // Debug log
      const data = await sendChatMessage(sessionId, trimmedInput, token);
      console.log('Full response received:', JSON.stringify(data, null, 2)); // Detailed debug log

      // Check if response exists (could be 'response' or 'final_answer')
      const responseText = data?.response || data?.final_answer;
      
      if (responseText) {
        // Enhanced message with metadata
        const botMessage = {
          sender: "Bot",
          text: responseText,
          metadata: {
            sql_results: data.sql_results,
            rag_preview: data.rag_preview,
            session_memory: data.session_memory
          }
        };
        console.log('Adding bot message:', botMessage); // Debug log
        setMessages(prev => [...prev, botMessage]);
        if (data.session_memory) {
          setHistory(data.session_memory);
        }
      } else {
        console.error('No response text found in data:', data);
        throw new Error(`Invalid response structure. Received: ${JSON.stringify(data)}`);
      }
    } catch (err) {
      console.error("Error sending message:", err);
      console.error("Error stack:", err.stack);
      setError(err.message || "Failed to send message");
      // Remove the user's message if send failed
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsTyping(false);
    }
  }, [sessionId, input]);

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (isInitializing) {
    return (
      <div className="chat-page">
        <div className="chat-container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Initializing AI Assistant...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-page">
      <div className="chat-container">
        <div className="chat-header">
          <div className="header-content">
            <div className="header-icon">
              <Sparkles size={28} />
            </div>
            <div className="header-text">
              <h2>AI Financial Assistant</h2>
              <p className="header-subtitle">Powered by advanced AI technology</p>
            </div>
          </div>
          <div className="header-badge">
            <div className="status-dot"></div>
            <span>Online</span>
          </div>
        </div>

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        <div className="chat-messages">
          {messages.length === 0 && !history.length && (
            <div className="welcome-section">
              <div className="welcome-icon">
                <Bot size={48} />
              </div>
              <h3>Welcome to Your AI Financial Assistant</h3>
              <p className="welcome-text">
                I'm here to help you make smarter financial decisions. Ask me anything!
              </p>
              <div className="suggestion-cards">
                <div className="suggestion-card" onClick={() => setInput("Show me my portfolio with technical analysis")}>
                  <TrendingUp size={20} />
                  <span>Portfolio Analysis</span>
                </div>
                <div className="suggestion-card" onClick={() => setInput("Analyze my stocks and give recommendations")}>
                  <Lightbulb size={20} />
                  <span>Market Insights</span>
                </div>
                <div className="suggestion-card" onClick={() => setInput("Which stocks should I buy or sell based on technical indicators?")}>
                  <DollarSign size={20} />
                  <span>Trading Tips</span>
                </div>
              </div>
            </div>
          )}

          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.sender.toLowerCase()}`}>
              <div className="message-avatar">
                {msg.sender === "You" ? <User size={20} /> : <Bot size={20} />}
              </div>
              <div className="message-bubble">
                <div className="message-sender">{msg.sender === "You" ? "You" : "AI Assistant"}</div>
                <div className="message-content">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                    components={{
                      // Custom rendering for better structure
                      h1: ({node, ...props}) => <h1 className="markdown-h1" {...props} />,
                      h2: ({node, ...props}) => <h2 className="markdown-h2" {...props} />,
                      h3: ({node, ...props}) => <h3 className="markdown-h3" {...props} />,
                      h4: ({node, ...props}) => <h4 className="markdown-h4" {...props} />,
                      p: ({node, ...props}) => <p className="markdown-p" {...props} />,
                      ul: ({node, ...props}) => <ul className="markdown-ul" {...props} />,
                      ol: ({node, ...props}) => <ol className="markdown-ol" {...props} />,
                      li: ({node, ...props}) => <li className="markdown-li" {...props} />,
                      code: ({node, inline, ...props}) => 
                        inline ? 
                          <code className="markdown-inline-code" {...props} /> : 
                          <code className="markdown-code-block" {...props} />,
                      pre: ({node, ...props}) => <pre className="markdown-pre" {...props} />,
                      blockquote: ({node, ...props}) => <blockquote className="markdown-blockquote" {...props} />,
                      table: ({node, ...props}) => <table className="markdown-table" {...props} />,
                      thead: ({node, ...props}) => <thead className="markdown-thead" {...props} />,
                      tbody: ({node, ...props}) => <tbody className="markdown-tbody" {...props} />,
                      tr: ({node, ...props}) => <tr className="markdown-tr" {...props} />,
                      th: ({node, ...props}) => <th className="markdown-th" {...props} />,
                      td: ({node, ...props}) => <td className="markdown-td" {...props} />,
                      a: ({node, ...props}) => <a className="markdown-link" target="_blank" rel="noopener noreferrer" {...props} />,
                      strong: ({node, ...props}) => <strong className="markdown-strong" {...props} />,
                      em: ({node, ...props}) => <em className="markdown-em" {...props} />,
                      hr: ({node, ...props}) => <hr className="markdown-hr" {...props} />,
                    }}
                  >
                    {msg.text}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="message bot">
              <div className="message-avatar">
                <Bot size={20} />
              </div>
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-container">
          <div className="input-wrapper">
            <textarea
              className="chat-input"
              placeholder="Ask me anything about finance, stocks, or trading..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              rows={1}
            />
            <button
              className="send-button"
              onClick={sendMessage}
              disabled={!input.trim()}
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};