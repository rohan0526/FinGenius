import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import './CSS/LoginForm.css';

export const LoginForm = ({ onToggleMode }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const [focusedField, setFocusedField] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const result = await login(formData.email, formData.password);
    if (!result.success) {
      setError(result.error);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleFocus = (field) => {
    setFocusedField(field);
  };

  const handleBlur = () => {
    setFocusedField(null);
  };

  return (
    <div className="login-form-container">
      <div className="form-header">
        <h2 className="login-form-heading">Welcome Back</h2>
        <p className="form-subtitle">Sign in to continue to FinGenius</p>
      </div>

      {error && <div className="login-form-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="email">Email Address</label>
          <div className="input-wrapper">
            <Mail size={20} className="input-icon" />
            <input
              type="email"
              id="email"
              name="email"
              placeholder="you@example.com"
              required
              className={`login-form-input ${focusedField === 'email' ? 'focused' : ''}`}
              value={formData.email}
              onChange={handleChange}
              onFocus={() => handleFocus('email')}
              onBlur={handleBlur}
            />
          </div>
        </div>
        
        <div className="input-group">
          <label htmlFor="password">Password</label>
          <div className="input-wrapper">
            <Lock size={20} className="input-icon" />
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter your password"
              required
              className={`login-form-input ${focusedField === 'password' ? 'focused' : ''}`}
              value={formData.password}
              onChange={handleChange}
              onFocus={() => handleFocus('password')}
              onBlur={handleBlur}
            />
          </div>
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="login-form-button"
        >
          <span>{loading ? 'Logging in...' : 'Login'}</span>
          <ArrowRight size={20} />
        </button>
      </form>

      <div className="form-footer">
        <p>
          Don't have an account?{' '}
          <a onClick={onToggleMode} className="login-form-toggle">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
};