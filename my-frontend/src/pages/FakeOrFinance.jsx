import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../game/CSS/index.css';
import fakeFinanceImage from '../assets/images/fakef.jpg';

const FakeOrFinance = () => {
  const navigate = useNavigate();
  const [gameStarted, setGameStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const [cardFlipped, setCardFlipped] = useState(false);
  const [answerSelected, setAnswerSelected] = useState('');
  const [scoreAnimation, setScoreAnimation] = useState(false);
  const [progressWidth, setProgressWidth] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  
  // Update progress bar when question changes
  useEffect(() => {
    if (gameStarted && !gameFinished) {
      const progress = ((currentQuestionIndex) / questions.length) * 100;
      setProgressWidth(progress);
    }
  }, [currentQuestionIndex, gameStarted, gameFinished]);
  
  // Questions array with real and fake financial terms
  const questions = [
    {
      term: "Contango",
      isReal: true,
      definition: "A market condition where futures prices are higher than the current spot price, often due to costs of carry.",
      fakeExplanation: null
    },
    {
      term: "Financial Osmosis",
      isReal: false,
      definition: null,
      fakeExplanation: "This is a fake term that might sound real. There's no financial concept called 'Financial Osmosis'."
    },
    {
      term: "Bollinger Bands",
      isReal: true,
      definition: "A technical analysis tool that creates a band of three lines which are calculated by using standard deviation and a simple moving average.",
      fakeExplanation: null
    },
    {
      term: "Hyperflation Resistance Index",
      isReal: false,
      definition: null,
      fakeExplanation: "This is a made-up term. While there's hyperinflation and inflation resistance, there's no such official index."
    },
    {
      term: "Dead Cat Bounce",
      isReal: true,
      definition: "A temporary recovery in stock prices after a substantial fall, caused by investors who buy at the low point thinking the worst is over.",
      fakeExplanation: null
    },
    {
      term: "Fiscal Velocity Transfer",
      isReal: false,
      definition: null,
      fakeExplanation: "This sounds technical but is a fake term. There's no concept in finance called 'Fiscal Velocity Transfer'."
    },
    {
      term: "Monte Carlo Simulation",
      isReal: true,
      definition: "A computerized mathematical technique that allows people to account for risk in quantitative analysis and decision making.",
      fakeExplanation: null
    },
    {
      term: "Quantum Finance Principle",
      isReal: false,
      definition: null,
      fakeExplanation: "While 'quantum finance' is an emerging field, there's no established 'Quantum Finance Principle'."
    },
    {
      term: "EBITDA",
      isReal: true,
      definition: "Earnings Before Interest, Taxes, Depreciation, and Amortization - a measure of a company's overall financial performance.",
      fakeExplanation: null
    },
    {
      term: "Triple Leverage Arbitrage",
      isReal: false,
      definition: null,
      fakeExplanation: "This term was made up. While there are leveraged investments and arbitrage strategies, this specific term isn't a standard financial concept."
    }
  ];
  
  // Functions to handle game logic
  const handleAnswer = (userAnswer) => {
    const currentQuestion = questions[currentQuestionIndex];
    const isAnswerCorrect = userAnswer === currentQuestion.isReal;
    
    setAnswerSelected(userAnswer ? 'real' : 'fake');
    setCardFlipped(true);
    
    setTimeout(() => {
      setIsCorrect(isAnswerCorrect);
      if (isAnswerCorrect) {
        setScore(score + 1);
        setScoreAnimation(true);
        setFeedbackMessage("Great job! You got it right!");
      } else {
        setFeedbackMessage("Oops! That's not correct.");
      }
      setShowFeedback(true);
      setTimeout(() => setShowFeedback(false), 2000);
      setTimeout(() => setScoreAnimation(false), 1000);
      setShowAnswer(true);
    }, 600);
  };
  
  const nextQuestion = () => {
    // Hide the answer explanation
    setShowAnswer(false);
    setCardFlipped(false);
    setAnswerSelected('');
    
    // Move to the next question or end game
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setGameFinished(true);
    }
  };
  
  const restartGame = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setShowAnswer(false);
    setIsCorrect(false);
    setGameFinished(false);
    setCardFlipped(false);
    setAnswerSelected('');
    setProgressWidth(0);
  };
  
  const getScoreMessage = () => {
    const percentage = (score / questions.length) * 100;
    if (percentage === 100) {
      return {
        text: "Perfect score! You're a financial expert!",
        emoji: "🏆",
        className: "perfect"
      };
    } else if (percentage >= 70) {
      return {
        text: "Great job! You know your financial terms well.",
        emoji: "🌟",
        className: "great"
      };
    } else if (percentage >= 50) {
      return {
        text: "Not bad! You have a decent understanding of finance.",
        emoji: "👍",
        className: "good"
      };
    } else {
      return {
        text: "Keep learning! Financial literacy is a journey.",
        emoji: "📚",
        className: "improve"
      };
    }
  };

  return (
    <div className="game-page fake-or-finance-game">
      <div className="game-header">
        <button className="back-button" onClick={() => navigate('/games')}>
          ← Back to Games
        </button>
        <h1>Fake or Finance</h1>
      </div>

      {!gameStarted ? (
        <div className="game-intro">
          <div className="game-intro-content">
            <h2>Test Your Financial Knowledge!</h2>
            <p>
              Can you distinguish real financial terms from fake ones? This game will 
              test your knowledge of financial terminology and help you spot potential 
              scams or misleading information.
            </p>
            <h3>How to Play:</h3>
            <ol>
              <li>You'll be shown a financial term or concept</li>
              <li>Decide if it's a legitimate finance term (Real) or made up (Fake)</li>
              <li>Get immediate feedback on your answers</li>
              <li>Learn about actual financial terms and common misconceptions</li>
              <li>Try to get the highest score possible out of 10 questions!</li>
            </ol>
            <button 
              className="start-game-button"
              onClick={() => setGameStarted(true)}
            >
              <span className="button-text">Start Quiz</span>
              <span className="button-icon">→</span>
            </button>
          </div>
          <div className="game-intro-image">
            <img src={fakeFinanceImage} alt="Fake or Finance" />
          </div>
        </div>
      ) : (
        <div className="game-content fake-finance-content">
          {showFeedback && (
            <div className={`feedback-message ${isCorrect ? 'correct' : 'incorrect'}`}>
              {feedbackMessage}
            </div>
          )}
        
          {!gameFinished ? (
            <div className="quiz-container">
              <div className="quiz-progress-container">
                <div className="quiz-progress-bar">
                  <div 
                    className="quiz-progress-fill" 
                    style={{width: `${progressWidth}%`}}
                  ></div>
                </div>
                <div className="quiz-progress-text">
                  <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
                  <span className={`quiz-score ${scoreAnimation ? 'animate' : ''}`}>
                    Score: {score}
                  </span>
                </div>
              </div>
              
              <div className="term-display">
                <div className={`term-card ${cardFlipped ? 'flipped' : ''}`}>
                  <div className="term-card-inner">
                    <div className="term-card-front">
                      <div className="term-content">
                        <h2>{questions[currentQuestionIndex].term}</h2>
                        <p>Is this a real financial term?</p>
                      </div>
                      
                      {!showAnswer && (
                        <div className="answer-buttons">
                          <button 
                            className={`real-button ${answerSelected === 'real' ? 'selected' : ''}`}
                            onClick={() => !cardFlipped && handleAnswer(true)}
                            disabled={cardFlipped}
                          >
                            <span className="button-icon">✓</span>
                            <span>Real</span>
                          </button>
                          <button 
                            className={`fake-button ${answerSelected === 'fake' ? 'selected' : ''}`}
                            onClick={() => !cardFlipped && handleAnswer(false)}
                            disabled={cardFlipped}
                          >
                            <span className="button-icon">✗</span>
                            <span>Fake</span>
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <div className="term-card-back">
                      {showAnswer && (
                        <div className={`answer-reveal ${isCorrect ? 'correct' : 'incorrect'}`}>
                          <div className="answer-icon">
                            {isCorrect ? '✓' : '✗'}
                          </div>
                          <h3>
                            {questions[currentQuestionIndex].term} is {questions[currentQuestionIndex].isReal ? 'REAL' : 'FAKE'}!
                          </h3>
                          <div className="term-explanation">
                            {questions[currentQuestionIndex].isReal ? 
                              questions[currentQuestionIndex].definition : 
                              questions[currentQuestionIndex].fakeExplanation
                            }
                          </div>
                          <button 
                            className="next-question-button"
                            onClick={nextQuestion}
                          >
                            {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'View Results'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="quiz-results">
              <h2>Quiz Complete!</h2>
              
              <div className="final-score-container">
                <div className="final-score">
                  <div className="score-circle">
                    <div className="score-circle-inner">
                      <span className="score-number">{score}</span>
                      <span className="score-total">/{questions.length}</span>
                    </div>
                  </div>
                </div>
                
                <div className={`score-message ${getScoreMessage().className}`}>
                  <div className="score-emoji">{getScoreMessage().emoji}</div>
                  <p>{getScoreMessage().text}</p>
                </div>
              </div>
              
              <div className="quiz-insights">
                <h3>Financial Literacy Insights</h3>
                <p>Being able to distinguish real financial terms from fake ones is an important skill in avoiding scams and making informed financial decisions.</p>
                
                <div className="terms-summary">
                  <div className="real-terms-list">
                    <h4>Real Financial Terms You Should Know:</h4>
                    <ul>
                      {questions.filter(q => q.isReal).map((q, index) => (
                        <li key={index}>
                          <strong>{q.term}</strong>: {q.definition}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="fake-terms-list">
                    <h4>Red Flag Terms To Watch Out For:</h4>
                    <p>Be cautious when you hear complex-sounding financial terms that aren't widely recognized, especially when someone is trying to sell you something.</p>
                  </div>
                </div>
              </div>
              
              <div className="game-actions">
                <button 
                  className="restart-game-button"
                  onClick={restartGame}
                >
                  Play Again
                </button>
                <button 
                  className="secondary-button"
                  onClick={() => navigate('/games')}
                >
                  Back to Games
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FakeOrFinance; 