import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import './CSS/SignupForm.css';

export const SignupForm = ({ onToggleMode }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const { signup, loading } = useAuth();
  const [focusedField, setFocusedField] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const result = await signup(formData.email, formData.password);
    if (result.success) {
      onToggleMode(); // Switch to login form after successful signup
    } else {
      setError(result.error);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };
  
  const handleFocus = (field) => {
    setFocusedField(field);
  };

  const handleBlur = () => {
    setFocusedField(null);
  };

  return (
    <div className="signup-form-container">
      <div className="form-header">
        <h2 className="signup-form-heading">Create Account</h2>
        <p className="form-subtitle">Join FinGenius and start investing smarter</p>
      </div>
      
      {error && <div className="signup-form-error">{error}</div>}
      
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
              className={`signup-form-input ${focusedField === 'email' ? 'focused' : ''}`}
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
              placeholder="Create a password"
              required
              className={`signup-form-input ${focusedField === 'password' ? 'focused' : ''}`}
              value={formData.password}
              onChange={handleChange}
              onFocus={() => handleFocus('password')}
              onBlur={handleBlur}
            />
          </div>
        </div>
        
        <div className="input-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <div className="input-wrapper">
            <Lock size={20} className="input-icon" />
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Confirm your password"
              required
              className={`signup-form-input ${focusedField === 'confirmPassword' ? 'focused' : ''}`}
              value={formData.confirmPassword}
              onChange={handleChange}
              onFocus={() => handleFocus('confirmPassword')}
              onBlur={handleBlur}
            />
          </div>
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="signup-form-button"
        >
          <span>{loading ? 'Creating account...' : 'Sign Up'}</span>
          <ArrowRight size={20} />
        </button>
      </form>
      
      <div className="form-footer">
        <p>
          Already have an account?{' '}
          <a onClick={onToggleMode} className="signup-form-toggle">
            Login
          </a>
        </p>
      </div>
    </div>
  );
};
