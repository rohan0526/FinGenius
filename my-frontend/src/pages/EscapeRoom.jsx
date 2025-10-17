import React, { useState, useEffect, useCallback } from 'react';
import { Clock, Lightbulb, Lock, Unlock, Trophy, AlertCircle } from 'lucide-react';
import './EscapeRoom.css';

const EscapeRoom = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [showFormula, setShowFormula] = useState(false);
  const [doorShaking, setDoorShaking] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(300);
  const [timerActive, setTimerActive] = useState(false);
  const [lockDigits, setLockDigits] = useState([0, 0, 0, 0, 0, 0]);
  const [attempts, setAttempts] = useState(0);
  const [hintUsed, setHintUsed] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [totalScore, setTotalScore] = useState(0);
  
  // Define levels with different problems
  const levels = {
    1: {
      question: "If you invest $1,000 at 5% interest compounded annually for 3 years, what will be the final amount?",
      answer: 1157.63,
      hint: "Use the formula: A = P(1 + r)^t where P=$1000, r=0.05, t=3",
      steps: [
        "A = $1000 × (1 + 0.05)³",
        "A = $1000 × (1.05)³",
        "A = $1000 × 1.157625",
        "A = $1157.63"
      ]
    },
    2: {
      question: "You deposit $2,000 at 6% annual compound interest for 4 years. What's the final amount?",
      answer: 2524.95,
      hint: "Use the formula: A = P(1 + r)^t where P=$2000, r=0.06, t=4",
      steps: [
        "A = $2000 × (1 + 0.06)⁴",
        "A = $2000 × (1.06)⁴",
        "A = $2000 × 1.26247696",
        "A = $2524.95"
      ]
    },
    3: {
      question: "An investment of $5,000 grows at 8% compound interest annually for 5 years. Calculate the final value.",
      answer: 7346.64,
      hint: "Use the formula: A = P(1 + r)^t where P=$5000, r=0.08, t=5",
      steps: [
        "A = $5000 × (1 + 0.08)⁵",
        "A = $5000 × (1.08)⁵",
        "A = $5000 × 1.469328",
        "A = $7346.64"
      ]
    }
  };
  
  const currentLevelData = levels[currentLevel];
  const correctAnswer = currentLevelData.answer;
  
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
  
  const calculateScore = useCallback(() => {
    const baseScore = 1000;
    const timeBonus = Math.floor(timeRemaining * 2);
    const hintPenalty = hintUsed ? 200 : 0;
    const attemptPenalty = Math.min(attempts * 50, 300);
    return Math.max(baseScore + timeBonus - hintPenalty - attemptPenalty, 100);
  }, [timeRemaining, hintUsed, attempts]);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    const parsedAnswer = parseFloat(userAnswer);
    
    console.log('User entered:', userAnswer);
    console.log('Parsed answer:', parsedAnswer);
    console.log('Correct answer:', correctAnswer);
    console.log('Difference:', Math.abs(parsedAnswer - correctAnswer));
    
    if (isNaN(parsedAnswer)) {
      setHasError(true);
      setDoorShaking(true);
      setTimeout(() => {
        setDoorShaking(false);
        setHasError(false);
      }, 820);
      return;
    }
    
    setAttempts(prev => prev + 1);
    
    // Check if answer is correct (within 1 cent tolerance)
    if (Math.abs(parsedAnswer - correctAnswer) < 0.02) {
      console.log('Answer is CORRECT!');
      const levelScore = calculateScore();
      setTotalScore(prev => prev + levelScore);
      setIsSuccess(true);
      setHasError(false);
      setTimerActive(false);
      
      const answerString = correctAnswer.toFixed(2).replace('.', '');
      const newLockDigits = answerString.split('').map(d => parseInt(d));
      setLockDigits(newLockDigits);
    } else {
      console.log('Answer is WRONG');
      setHasError(true);
      setDoorShaking(true);
      setTimeout(() => {
        setDoorShaking(false);
        setHasError(false);
      }, 820);
    }
  };
  
  const startGame = () => {
    setGameStarted(true);
    setTimerActive(true);
    setTimeRemaining(300);
  };
  
  const nextLevel = () => {
    if (currentLevel < 3) {
      setCurrentLevel(prev => prev + 1);
      setUserAnswer('');
      setShowHint(false);
      setIsSuccess(false);
      setHasError(false);
      setShowFormula(false);
      setDoorShaking(false);
      setTimerActive(true);
      setTimeRemaining(300);
      setAttempts(0);
      setHintUsed(false);
      setLockDigits([0, 0, 0, 0, 0, 0]);
    }
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
    setAttempts(0);
    setHintUsed(false);
    setCurrentLevel(1);
    setTotalScore(0);
    setLockDigits([0, 0, 0, 0, 0, 0]);
  };

  const handleHintClick = () => {
    setShowHint(!showHint);
    if (!hintUsed && !showHint) {
      setHintUsed(true);
    }
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-purple-500/20 overflow-hidden">
          <div className="p-8 md:p-12">
            <div className="text-center mb-8">
              <div className="inline-block p-4 bg-purple-500/20 rounded-full mb-4">
                <Lock className="w-16 h-16 text-purple-400" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Financial Escape Room
              </h1>
              <p className="text-xl text-purple-200">
                Unlock the vault by solving the compound interest puzzle!
              </p>
            </div>
            
            <div className="bg-slate-900/50 rounded-xl p-6 mb-8 border border-purple-500/20">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <AlertCircle className="w-6 h-6 text-purple-400" />
                How to Play
              </h2>
              <ul className="space-y-3 text-purple-100">
                <li className="flex items-start gap-3">
                  <span className="text-purple-400 font-bold mt-1">1.</span>
                  <span>Solve the compound interest calculation puzzle</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-400 font-bold mt-1">2.</span>
                  <span>You have 5 minutes to escape before time runs out</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-400 font-bold mt-1">3.</span>
                  <span>Enter your calculated answer to unlock the door</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-400 font-bold mt-1">4.</span>
                  <span>Use hints if needed, but your score will be affected</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-400 font-bold mt-1">5.</span>
                  <span>Fewer attempts and faster completion = higher score!</span>
                </li>
              </ul>
            </div>
            
            <button
              onClick={startGame}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xl font-bold py-4 px-8 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Enter the Vault →
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    const score = calculateScore();
    const isLastLevel = currentLevel === 3;
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-emerald-500/20 p-8 md:p-12">
          <div className="text-center mb-8">
            <div className="inline-block p-4 bg-emerald-500/20 rounded-full mb-4 animate-bounce">
              <Trophy className="w-20 h-20 text-emerald-400" />
            </div>
            <h1 className="text-5xl font-bold text-white mb-4">
              {isLastLevel ? '🎉 All Vaults Unlocked! 🎉' : `🎉 Level ${currentLevel} Complete! 🎉`}
            </h1>
            <p className="text-2xl text-emerald-200 mb-2">
              Escaped with {formatTime(timeRemaining)} remaining
            </p>
            <div className="text-6xl font-bold text-emerald-400 mb-2">
              {score} Points
            </div>
            <p className="text-emerald-300 mb-2">
              Attempts: {attempts} | Hints Used: {hintUsed ? 'Yes' : 'No'}
            </p>
            {isLastLevel && (
              <p className="text-3xl font-bold text-white mt-4">
                Total Score: {totalScore} Points
              </p>
            )}
          </div>

          <div className="bg-slate-900/50 rounded-xl p-6 mb-8 border border-emerald-500/20">
            <h2 className="text-2xl font-bold text-white mb-4">💡 Financial Learning</h2>
            <div className="space-y-4 text-purple-100">
              <p>
                <strong className="text-emerald-400">Compound interest</strong> is the process where interest is earned on both the initial principal and accumulated interest from previous periods.
              </p>
              <p>
                Einstein allegedly called it the "eighth wonder of the world" because your money grows exponentially over time, not linearly.
              </p>
              
              <div className="bg-slate-800/50 rounded-lg p-4 mt-4">
                <h3 className="font-bold text-emerald-400 mb-3">Year-by-Year Breakdown:</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center p-2 bg-slate-700/30 rounded">
                    <span>Start (Year 0)</span>
                    <span className="font-mono font-bold">$1,000.00</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-slate-700/30 rounded">
                    <span>After Year 1</span>
                    <span className="font-mono font-bold">$1,050.00 <span className="text-emerald-400 text-xs">(+$50.00)</span></span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-slate-700/30 rounded">
                    <span>After Year 2</span>
                    <span className="font-mono font-bold">$1,102.50 <span className="text-emerald-400 text-xs">(+$52.50)</span></span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-emerald-900/30 rounded border border-emerald-500/30">
                    <span className="font-bold">After Year 3</span>
                    <span className="font-mono font-bold text-emerald-400">$1,157.63 <span className="text-xs">(+$55.13)</span></span>
                  </div>
                </div>
                <p className="text-xs text-purple-300 mt-3">
                  Notice how each year's interest increases? That's the power of compounding!
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            {!isLastLevel ? (
              <>
                <button
                  onClick={nextLevel}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold py-3 px-6 rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-300"
                >
                  Next Level →
                </button>
                <button
                  onClick={resetGame}
                  className="flex-1 bg-slate-700 text-white font-bold py-3 px-6 rounded-xl hover:bg-slate-600 transition-all duration-300"
                >
                  Restart Game
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={resetGame}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 px-6 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
                >
                  Play Again
                </button>
                <button
                  onClick={() => window.location.href = '/games'}
                  className="flex-1 bg-slate-700 text-white font-bold py-3 px-6 rounded-xl hover:bg-slate-600 transition-all duration-300"
                >
                  Back to Games
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        {timeRemaining === 0 && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-2xl p-8 max-w-md w-full text-center border-2 border-red-500">
              <div className="text-6xl mb-4">⏰</div>
              <h2 className="text-3xl font-bold text-white mb-4">Time's Up!</h2>
              <p className="text-xl text-red-300 mb-6">
                The vault security system has locked you out.
              </p>
              <button
                onClick={resetGame}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 px-6 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-purple-500/20 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 p-4 border-b border-purple-500/20">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div>
                  <div className="text-sm text-purple-200">Level</div>
                  <div className="text-2xl font-bold text-white">{currentLevel}/3</div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className={`w-6 h-6 ${timeRemaining < 60 ? 'text-red-400 animate-pulse' : 'text-purple-400'}`} />
                  <span className={`text-2xl font-mono font-bold ${timeRemaining < 60 ? 'text-red-400' : 'text-white'}`}>
                    {formatTime(timeRemaining)}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-purple-200">Attempts</div>
                <div className="text-xl font-bold text-white">{attempts}</div>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="mb-8 text-center">
              <div className={`inline-block p-6 rounded-full mb-4 transition-all duration-300 ${doorShaking ? 'animate-bounce' : ''}`}>
                {isSuccess ? (
                  <Unlock className="w-16 h-16 text-emerald-400" />
                ) : (
                  <Lock className="w-16 h-16 text-purple-400" />
                )}
              </div>
              
              <div className="flex justify-center gap-2 mb-4">
                {lockDigits.map((digit, index) => (
                  <div
                    key={index}
                    className="w-12 h-16 bg-slate-900/50 border-2 border-purple-500/30 rounded-lg flex items-center justify-center font-mono text-2xl font-bold text-purple-300"
                  >
                    {digit}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900/50 rounded-xl p-6 mb-6 border border-purple-500/20">
              <h2 className="text-2xl font-bold text-white mb-4">Level {currentLevel} - Compound Interest Problem</h2>
              <p className="text-lg text-white leading-relaxed">
                {currentLevelData.question}
              </p>
              <p className="text-sm text-purple-200 mt-3">
                (Round to 2 decimal places, e.g., 1234.56)
              </p>
              <p className="text-xs text-yellow-300 mt-2 font-semibold">
                💡 Tip: Enter just the number without the $ sign
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mb-6">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <input
                    type="number"
                    value={userAnswer}
                    onChange={(e) => {
                      setUserAnswer(e.target.value);
                      setHasError(false);
                    }}
                    placeholder="1234.56"
                    step="0.01"
                    className={`w-full px-4 py-4 bg-slate-900/50 border-2 rounded-xl text-white text-lg font-mono focus:outline-none focus:ring-2 transition-all ${
                      hasError
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-purple-500/30 focus:ring-purple-500'
                    }`}
                  />
                </div>
                <button
                  type="submit"
                  className="px-8 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105"
                >
                  Unlock
                </button>
              </div>
              {hasError && (
                <p className="text-red-400 mt-2 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Incorrect! The lock won't budge. Try again.
                </p>
              )}
            </form>

            <div className="bg-slate-900/50 rounded-xl p-6 border border-purple-500/20">
              <button
                onClick={handleHintClick}
                className="w-full flex items-center justify-between text-left group"
                type="button"
              >
                <span className="flex items-center gap-2 text-lg font-bold text-white group-hover:text-emerald-300">
                  <Lightbulb className="w-5 h-5" />
                  {showHint ? 'Hide Hint' : 'Need a Hint?'}
                  {hintUsed && !showHint && <span className="text-sm text-yellow-300">(Used)</span>}
                </span>
                <span className="text-white text-2xl">
                  {showHint ? '−' : '+'}
                </span>
              </button>

              {showHint && (
                <div className="mt-4 space-y-4 animate-fadeIn">
                  <div className="bg-slate-800/50 rounded-lg p-4 border border-emerald-500/30">
                    <h3 className="font-bold text-emerald-300 mb-2">Hint:</h3>
                    <p className="text-white text-sm mb-3">
                      {currentLevelData.hint}
                    </p>
                  </div>

                  <button
                    onClick={() => setShowFormula(!showFormula)}
                    className="text-white hover:text-emerald-300 text-sm underline font-semibold"
                    type="button"
                  >
                    {showFormula ? 'Hide' : 'Show'} step-by-step calculation
                  </button>

                  {showFormula && (
                    <div className="bg-slate-800/50 rounded-lg p-4 space-y-2 text-sm animate-fadeIn border border-emerald-500/30">
                      {currentLevelData.steps.map((step, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <span className="text-emerald-400 font-bold">{index + 1}.</span>
                          <span className="font-mono text-white">{step}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EscapeRoom; 