import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../game/CSS/index.css';
import budgetGameImage from '../assets/images/budgetgame.jpg';

const BudgetGame = () => {
  const navigate = useNavigate();
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [showLifeEvent, setShowLifeEvent] = useState(false);
  const [lifeEventHandled, setLifeEventHandled] = useState(false);
  const [income] = useState(3000);
  const [success, setSuccess] = useState(false);
  const [budget, setBudget] = useState({
    housing: 0,
    food: 0,
    transportation: 0,
    savings: 0
  });
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [animateLifeEvent, setAnimateLifeEvent] = useState(false);
  
  const [remaining, setRemaining] = useState(income);

  // Function to update budget allocation
  const handleBudgetChange = (category, value) => {
    const newValue = parseInt(value) || 0;
    const oldValue = budget[category];
    const difference = newValue - oldValue;
    
    // Check if we have enough remaining budget
    if (remaining - difference < 0) {
      setFeedbackMessage("You don't have enough remaining budget for that allocation!");
      setShowFeedback(true);
      setTimeout(() => setShowFeedback(false), 3000);
      return;
    }
    
    // Provide feedback based on recommended percentages
    if (category === 'housing' && newValue >= income * 0.2) {
      setFeedbackMessage("Good choice! Housing is typically 20-30% of income.");
      setShowFeedback(true);
      setTimeout(() => setShowFeedback(false), 3000);
    } else if (category === 'savings' && newValue >= income * 0.2) {
      setFeedbackMessage("Excellent! Saving 20% or more is a great financial habit.");
      setShowFeedback(true);
      setTimeout(() => setShowFeedback(false), 3000);
    }
    
    const newBudget = { ...budget, [category]: newValue };
    setBudget(newBudget);
    setRemaining(remaining - difference);
  };

  // Function to trigger life event after some time in the game
  useEffect(() => {
    if (gameStarted && !showLifeEvent && !lifeEventHandled) {
      const timer = setTimeout(() => {
        setShowLifeEvent(true);
        setTimeout(() => setAnimateLifeEvent(true), 100);
      }, 10000); // Show life event after 10 seconds
      
      return () => clearTimeout(timer);
    }
  }, [gameStarted, showLifeEvent, lifeEventHandled]);

  // Function to handle life event
  const handleLifeEvent = (choice) => {
    setAnimateLifeEvent(false);
    setTimeout(() => {
      if (choice === 'pay') {
        // Pay from emergency savings
        const newBudget = { 
          ...budget, 
          savings: Math.max(0, budget.savings - 300) 
        };
        setBudget(newBudget);
        setFeedbackMessage("You used your emergency savings - that's what it's for!");
      } else {
        // Add to existing expenses (transportation)
        const newBudget = { 
          ...budget, 
          transportation: budget.transportation + 300 
        };
        setBudget(newBudget);
        setFeedbackMessage("Transportation costs increased - this affects your monthly budget.");
      }
      
      setShowLifeEvent(false);
      setLifeEventHandled(true);
      setShowFeedback(true);
      setTimeout(() => setShowFeedback(false), 3000);
    }, 300);
  };

  // Function to submit and check the budget
  const submitBudget = () => {
    // Basic budget check rules:
    // 1. Must allocate all money
    // 2. At least 20% of income for housing
    // 3. At least 10% for food
    // 4. At least 5% for transportation
    // 5. At least 10% for savings (if life event hasn't depleted it)
    
    const isHousingEnough = budget.housing >= income * 0.2;
    const isFoodEnough = budget.food >= income * 0.1;
    const isTransportationEnough = budget.transportation >= income * 0.05;
    const isSavingsEnough = lifeEventHandled ? true : budget.savings >= income * 0.1;
    const isFullyAllocated = remaining === 0;
    
    const isSuccessful = isHousingEnough && isFoodEnough && 
                         isTransportationEnough && isSavingsEnough && 
                         isFullyAllocated;
    
    setSuccess(isSuccessful);
    setGameEnded(true);
  };

  // Reset the game
  const resetGame = () => {
    setBudget({
      housing: 0,
      food: 0,
      transportation: 0,
      savings: 0
    });
    setRemaining(income);
    setGameEnded(false);
    setShowLifeEvent(false);
    setLifeEventHandled(false);
    setGameStarted(true);
    setShowFeedback(false);
  };

  return (
    <div className="game-page budget-game">
      <div className="game-header">
        <button className="back-button" onClick={() => navigate('/games')}>
          ← Back to Games
        </button>
        <h1>Budget Challenge</h1>
      </div>

      {!gameStarted ? (
        <div className="game-intro">
          <div className="game-intro-content">
            <h2>Master Your Money!</h2>
            <p>
              In this game, you'll be given a monthly income of $3,000 and will need to make 
              budget decisions to reach your financial goals. Make smart choices about 
              spending, saving, and investing to win!
            </p>
            <h3>How to Play:</h3>
            <ol>
              <li>Allocate your $3,000 income to different expense categories.</li>
              <li>Be prepared for unexpected financial events!</li>
              <li>Submit your budget when you're ready.</li>
              <li>You'll need to allocate enough for basics: housing (20%), food (10%), 
              transportation (5%), and savings (10%).</li>
            </ol>
            <button 
              className="start-game-button"
              onClick={() => setGameStarted(true)}
            >
              <span className="button-text">Start Game</span>
              <span className="button-icon">→</span>
            </button>
          </div>
          <div className="game-intro-image">
            <img src={budgetGameImage} alt="Budget Game" />
          </div>
        </div>
      ) : (
        <div className="game-content">
          {showFeedback && (
            <div className="feedback-message">
              {feedbackMessage}
            </div>
          )}
          
          {gameEnded ? (
            <div className="budget-result">
              <h2 className={success ? "success-title" : "failure-title"}>
                {success ? "Success! Your Budget is Balanced!" : "Budget Needs Improvement"}
              </h2>
              <div className="budget-feedback">
                {!success && (
                  <div className="budget-issues">
                    <p>Here's what to fix:</p>
                    <ul className="issues-list">
                      {budget.housing < income * 0.2 && (
                        <li className="issue-item">Housing allocation should be at least ${income * 0.2} (20% of income)</li>
                      )}
                      {budget.food < income * 0.1 && (
                        <li className="issue-item">Food allocation should be at least ${income * 0.1} (10% of income)</li>
                      )}
                      {budget.transportation < income * 0.05 && (
                        <li className="issue-item">Transportation allocation should be at least ${income * 0.05} (5% of income)</li>
                      )}
                      {!lifeEventHandled && budget.savings < income * 0.1 && (
                        <li className="issue-item">Savings allocation should be at least ${income * 0.1} (10% of income)</li>
                      )}
                      {remaining !== 0 && (
                        <li className="issue-item">You must allocate all of your income (${remaining} remaining)</li>
                      )}
                    </ul>
                  </div>
                )}
                {success && (
                  <div className="success-message">
                    <p>You've created a balanced budget that covers all your necessities and includes savings!</p>
                    <p>This is a great foundation for financial stability and future wealth building.</p>
                  </div>
                )}
              </div>
              <div className="budget-summary">
                <h3>Your Budget Allocation:</h3>
                <div className="budget-chart">
                  {Object.entries(budget).map(([category, amount]) => {
                    const percentage = (amount / income) * 100;
                    return (
                      <div className="budget-bar-container" key={category}>
                        <div className="budget-label">
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </div>
                        <div className="budget-bar-wrapper">
                          <div 
                            className={`budget-bar ${category}`} 
                            style={{width: `${percentage}%`}}
                          ></div>
                        </div>
                        <div className="budget-amount">
                          ${amount} ({percentage.toFixed(1)}%)
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="action-buttons">
                <button 
                  className="start-game-button"
                  onClick={resetGame}
                >
                  Try Again
                </button>
                <button 
                  className="secondary-button"
                  onClick={() => navigate('/games')}
                >
                  Back to Games
                </button>
              </div>
            </div>
          ) : (
            <>
              {showLifeEvent && (
                <div className={`life-event-overlay ${animateLifeEvent ? 'active' : ''}`}>
                  <div className="life-event-popup">
                    <div className="life-event-icon">⚠️</div>
                    <h3>Unexpected Life Event!</h3>
                    <p>You have a sudden medical bill of $300.</p>
                    <p>How will you handle this expense?</p>
                    <div className="life-event-choices">
                      <button 
                        className="event-choice savings-choice"
                        onClick={() => handleLifeEvent('pay')}
                      >
                        Pay from Emergency Savings
                      </button>
                      <button 
                        className="event-choice expense-choice"
                        onClick={() => handleLifeEvent('add')}
                      >
                        Add to Transportation Expenses<br/>
                        <small>(e.g., Uber to hospital)</small>
                      </button>
                    </div>
                  </div>
                </div>
              )}
              <h2 className="budget-title">Create Your Monthly Budget</h2>
              <div className="budget-stats">
                <div className="budget-income">
                  <span>Total Income:</span> <b>${income}</b>
                </div>
                <div className={remaining === 0 ? "budget-remaining zero" : "budget-remaining"}>
                  <span>Remaining:</span> <b>${remaining}</b>
                </div>
              </div>
              <div className="budget-form">
                <div className="budget-categories">
                  <div className="budget-category housing">
                    <label htmlFor="housing">Rent/Housing:</label>
                    <div className="budget-input-group">
                      <span className="currency-symbol">$</span>
                      <input 
                        type="number" 
                        id="housing" 
                        value={budget.housing} 
                        onChange={(e) => handleBudgetChange('housing', e.target.value)}
                        min="0"
                        max={income}
                      />
                      <div className="budget-slider-container">
                        <input
                          type="range"
                          min="0"
                          max={income}
                          value={budget.housing}
                          onChange={(e) => handleBudgetChange('housing', e.target.value)}
                          className="budget-slider"
                        />
                      </div>
                    </div>
                    <div className="budget-hint">Recommended: at least 20% of income</div>
                  </div>
                  <div className="budget-category food">
                    <label htmlFor="food">Food:</label>
                    <div className="budget-input-group">
                      <span className="currency-symbol">$</span>
                      <input 
                        type="number" 
                        id="food" 
                        value={budget.food} 
                        onChange={(e) => handleBudgetChange('food', e.target.value)}
                        min="0"
                        max={income}
                      />
                      <div className="budget-slider-container">
                        <input
                          type="range"
                          min="0"
                          max={income}
                          value={budget.food}
                          onChange={(e) => handleBudgetChange('food', e.target.value)}
                          className="budget-slider"
                        />
                      </div>
                    </div>
                    <div className="budget-hint">Recommended: at least 10% of income</div>
                  </div>
                  <div className="budget-category transportation">
                    <label htmlFor="transportation">Transportation:</label>
                    <div className="budget-input-group">
                      <span className="currency-symbol">$</span>
                      <input 
                        type="number" 
                        id="transportation" 
                        value={budget.transportation} 
                        onChange={(e) => handleBudgetChange('transportation', e.target.value)}
                        min="0"
                        max={income}
                      />
                      <div className="budget-slider-container">
                        <input
                          type="range"
                          min="0"
                          max={income}
                          value={budget.transportation}
                          onChange={(e) => handleBudgetChange('transportation', e.target.value)}
                          className="budget-slider"
                        />
                      </div>
                    </div>
                    <div className="budget-hint">Recommended: at least 5% of income</div>
                  </div>
                  <div className="budget-category savings">
                    <label htmlFor="savings">Emergency Savings:</label>
                    <div className="budget-input-group">
                      <span className="currency-symbol">$</span>
                      <input 
                        type="number" 
                        id="savings" 
                        value={budget.savings} 
                        onChange={(e) => handleBudgetChange('savings', e.target.value)}
                        min="0"
                        max={income}
                      />
                      <div className="budget-slider-container">
                        <input
                          type="range"
                          min="0"
                          max={income}
                          value={budget.savings}
                          onChange={(e) => handleBudgetChange('savings', e.target.value)}
                          className="budget-slider"
                        />
                      </div>
                    </div>
                    <div className="budget-hint">Recommended: at least 10% of income</div>
                  </div>
                </div>
                <button 
                  className={`submit-budget-button ${remaining === 0 ? 'ready' : 'disabled'}`}
                  onClick={submitBudget}
                  disabled={remaining > 0}
                >
                  Submit Budget
                </button>
                {remaining > 0 && (
                  <p className="budget-warning">You still have ${remaining} to allocate.</p>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default BudgetGame; 