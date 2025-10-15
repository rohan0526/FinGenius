import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../game/CSS/index.css';
import escapeRoomImage from '../assets/images/escape room.jpg';

const EscapeRoom = () => {
  const navigate = useNavigate();
  const [gameStarted, setGameStarted] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [showFormula, setShowFormula] = useState(false);
  const [doorShaking, setDoorShaking] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes in seconds
  const [timerActive, setTimerActive] = useState(false);
  const [lockDigits, setLockDigits] = useState([0, 0, 0, 0, 0, 0]);
  
  // Correct answer (calculated: $1000 * (1 + 0.05)^3 = $1157.63)
  const correctAnswer = 1157.63;
  
  useEffect(() => {
    if (gameStarted && timerActive && !isSuccess) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [gameStarted, timerActive, isSuccess]);
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    const parsedAnswer = parseFloat(userAnswer);
    
    if (Math.abs(parsedAnswer - correctAnswer) < 0.01) {
      // Answer is correct (within a small margin of error)
      setIsSuccess(true);
      setHasError(false);
      setTimerActive(false);
      
      // Update lock digits animation
      const answerString = correctAnswer.toFixed(2).replace('.', '');
      const newLockDigits = answerString.split('').map(d => parseInt(d));
      setLockDigits(newLockDigits);
      
    } else {
      // Answer is wrong
      setHasError(true);
      setDoorShaking(true);
      setTimeout(() => setDoorShaking(false), 820);
    }
  };
  
  const startGame = () => {
    setGameStarted(true);
    setTimerActive(true);
    setTimeRemaining(300);
  };
  
  const resetGame = () => {
    setUserAnswer('');
    setShowHint(false);
    setIsSuccess(false);
    setHasError(false);
    setShowFormula(false);
    setDoorShaking(false);
    setTimerActive(true);
    setTimeRemaining(300);
  };

  return (
    <div className="game-page escape-room-game">
      <div className="game-header">
        <button className="back-button" onClick={() => navigate('/games')}>
          ← Back to Games
        </button>
        <h1>Financial Escape Room</h1>
      </div>

      {!gameStarted ? (
        <div className="game-intro">
          <div className="game-intro-content">
            <h2>Enter the Financial Vault!</h2>
            <p>
              You've been locked in a virtual room with a sophisticated financial security system.
              Solve the investment puzzle to unlock the door and escape before time runs out!
            </p>
            <h3>How to Play:</h3>
            <ol>
              <li>You'll be presented with a financial calculation puzzle</li>
              <li>You have 5 minutes to solve it and escape</li>
              <li>Calculate the answer and enter it in the input field</li>
              <li>If you're correct, the door will unlock</li>
              <li>Use the hint button if you get stuck, but try to solve it on your own first!</li>
            </ol>
            <button 
              className="start-game-button"
              onClick={startGame}
            >
              <span className="button-text">Enter the Room</span>
              <span className="button-icon">→</span>
            </button>
          </div>
          <div className="game-intro-image">
            <img src={escapeRoomImage} alt="Escape Room" />
          </div>
        </div>
      ) : (
        <div className="game-content escape-room-content">
          {!isSuccess ? (
            <div className="puzzle-container">
              {timeRemaining === 0 && (
                <div className="time-up-overlay">
                  <div className="time-up-message">
                    <h2>Time's Up!</h2>
                    <p>You couldn't solve the puzzle in time.</p>
                    <button className="start-game-button" onClick={resetGame}>
                      Try Again
                    </button>
                  </div>
                </div>
              )}
              
              <div className="escape-room-timer">
                <div className="timer-label">Time Remaining:</div>
                <div className={`timer-display ${timeRemaining < 60 ? 'critical' : ''}`}>
                  {formatTime(timeRemaining)}
                </div>
              </div>
              
              <div className="escape-room-scene">
                <div className="room-background"></div>
                <div className="door-container">
                  <div className={`escape-door ${doorShaking ? 'shake' : ''} ${isSuccess ? 'unlocked' : ''}`}>
                    <div className="door-handle"></div>
                    <div className="door-lock">
                      <div className="lock-display">
                        {lockDigits.map((digit, index) => (
                          <div key={index} className="lock-digit">
                            {digit}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="puzzle-board">
                  <h2>Investment Vault Lock</h2>
                  <div className="puzzle-instructions">
                    <p>Calculate the correct answer to unlock the door:</p>
                  </div>
                  <div className="puzzle-question">
                    <div className="question-paper">
                      <h3>Compound Interest Problem</h3>
                      <p>
                        If you invest $1000 at 5% interest compounded annually for 3 years,
                        what will be the final amount? (Round to 2 decimal places)
                      </p>
                    </div>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="answer-form">
                    <div className="answer-input-group">
                      <span className="currency-symbol">$</span>
                      <input 
                        type="number" 
                        value={userAnswer} 
                        onChange={(e) => {
                          setUserAnswer(e.target.value);
                          setHasError(false);
                        }}
                        placeholder="Enter your answer"
                        step="0.01"
                        className={hasError ? 'error' : ''}
                      />
                    </div>
                    <button 
                      type="submit" 
                      className="submit-answer-button"
                    >
                      Unlock Door
                    </button>
                  </form>
                  
                  {hasError && (
                    <div className="error-message">
                      <div className="error-icon">❌</div>
                      <p>Incorrect code. The lock won't open.</p>
                    </div>
                  )}
                  
                  <div className="hint-section">
                    <button 
                      className="hint-button"
                      onClick={() => setShowHint(!showHint)}
                    >
                      {showHint ? "Hide Hint" : "Need a Hint?"}
                    </button>
                    
                    {showHint && (
                      <div className="hint-content">
                        <div className="hint-card">
                          <h3>Investment Formula</h3>
                          <p>
                            Use the compound interest formula: A = P(1 + r)^t
                          </p>
                          <div className="formula-variables">
                            <div className="variable">
                              <span className="variable-name">A</span>
                              <span className="variable-desc">Final amount</span>
                            </div>
                            <div className="variable">
                              <span className="variable-name">P</span>
                              <span className="variable-desc">Principal (initial investment)</span>
                            </div>
                            <div className="variable">
                              <span className="variable-name">r</span>
                              <span className="variable-desc">Interest rate (as a decimal)</span>
                            </div>
                            <div className="variable">
                              <span className="variable-name">t</span>
                              <span className="variable-desc">Time (in years)</span>
                            </div>
                          </div>
                          <button 
                            className="show-formula-button"
                            onClick={() => setShowFormula(!showFormula)}
                          >
                            {showFormula ? "Hide Calculation" : "Show Sample Calculation"}
                          </button>
                          
                          {showFormula && (
                            <div className="formula-calculation">
                              <div className="calc-step">
                                <div className="step-number">1</div>
                                <div className="step-formula">A = $1000 × (1 + 0.05)³</div>
                              </div>
                              <div className="calc-step">
                                <div className="step-number">2</div>
                                <div className="step-formula">A = $1000 × (1.05)³</div>
                              </div>
                              <div className="calc-step">
                                <div className="step-number">3</div>
                                <div className="step-formula">A = $1000 × 1.157625</div>
                              </div>
                              <div className="calc-step">
                                <div className="step-number">4</div>
                                <div className="step-formula">A = $1157.63</div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="success-container">
              <div className="success-animation">
                <div className="door-unlocked">
                  <div className="door-open"></div>
                  <div className="confetti"></div>
                </div>
                <h2 className="success-heading">Door Unlocked!</h2>
                <div className="escape-message">
                  <p>
                    Congratulations! You've solved the compound interest puzzle and escaped with {formatTime(timeRemaining)} to spare!
                  </p>
                </div>
                <div className="learning-note">
                  <h3>Financial Learning:</h3>
                  <div className="learning-content">
                    <p>
                      <strong>Compound interest</strong> is one of the most powerful concepts in finance. It's what Einstein allegedly called the "eighth wonder of the world."
                    </p>
                    <p>
                      When you invest money, you earn interest on your initial investment. With compound interest, you also earn interest on the interest you've already earned. This creates a snowball effect that accelerates your wealth growth over time.
                    </p>
                    <div className="compound-example">
                      <div className="example-year">
                        <div className="year-label">Year 1</div>
                        <div className="year-amount">$1000.00</div>
                        <div className="year-interest">+$50.00</div>
                      </div>
                      <div className="example-year">
                        <div className="year-label">Year 2</div>
                        <div className="year-amount">$1050.00</div>
                        <div className="year-interest">+$52.50</div>
                      </div>
                      <div className="example-year">
                        <div className="year-label">Year 3</div>
                        <div className="year-amount">$1102.50</div>
                        <div className="year-interest">+$55.13</div>
                      </div>
                      <div className="example-year result">
                        <div className="year-label">Final</div>
                        <div className="year-amount">$1157.63</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="next-level-section">
                  <p>Ready for another challenge?</p>
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
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EscapeRoom; 