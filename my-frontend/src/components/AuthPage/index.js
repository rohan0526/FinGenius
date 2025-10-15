import React, { useState } from 'react';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';
import { TrendingUp, Shield, Zap, Users } from 'lucide-react';
import './CSS/AuthPage.css';

export const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        {/* Left Side - Form */}
        <div className="auth-left">
          <div className="auth-header">
            <div className="auth-logo">
              <TrendingUp size={32} />
              <span>FinGenius</span>
            </div>
          </div>
          
          <div className="auth-forms-wrapper">
            {isLogin ? (
              <LoginForm onToggleMode={() => setIsLogin(false)} />
            ) : (
              <SignupForm onToggleMode={() => setIsLogin(true)} />
            )}
          </div>
        </div>

        {/* Right Side - Illustration */}
        <div className="auth-right">
          <div className="auth-illustration">
            <div className="illustration-badge">
              <Zap size={20} />
              <span>AI-Powered Platform</span>
            </div>
            
            <h2 className="illustration-title">
              Start Your Financial Journey Today
            </h2>
            <p className="illustration-subtitle">
              Join thousands of investors making smarter decisions with AI-powered insights
            </p>

            <div className="feature-highlights">
              <div className="highlight-item">
                <div className="highlight-icon">
                  <TrendingUp size={24} />
                </div>
                <div>
                  <h4>Real-time Analytics</h4>
                  <p>Track market trends instantly</p>
                </div>
              </div>
              
              <div className="highlight-item">
                <div className="highlight-icon">
                  <Shield size={24} />
                </div>
                <div>
                  <h4>Secure & Reliable</h4>
                  <p>Bank-level security for your data</p>
                </div>
              </div>
              
              <div className="highlight-item">
                <div className="highlight-icon">
                  <Users size={24} />
                </div>
                <div>
                  <h4>Expert Community</h4>
                  <p>Learn from experienced traders</p>
                </div>
              </div>
            </div>

            <div className="stats-row">
              <div className="stat-item">
                <h3>10K+</h3>
                <p>Active Users</p>
              </div>
              <div className="stat-item">
                <h3>$500M+</h3>
                <p>Assets Tracked</p>
              </div>
              <div className="stat-item">
                <h3>95%</h3>
                <p>Satisfaction</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 
