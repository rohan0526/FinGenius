import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, AlertCircle, Award, ArrowRight, RotateCcw, Home } from 'lucide-react';
import './BudgetGame.css';

const BudgetGame = () => {
  // Game state management
  const [gamePhase, setGamePhase] = useState('profile'); // profile, intro, playing, result
  const [userProfile, setUserProfile] = useState(null);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  
  // Budget state
  const [income, setIncome] = useState(0);
  const [customIncome, setCustomIncome] = useState('');
  const [budget, setBudget] = useState({
    housing: 0,
    food: 0,
    transportation: 0,
    entertainment: 0,
    savings: 0,
    other: 0
  });
  
  // Life events
  const [lifeEvent, setLifeEvent] = useState(null);
  const [showLifeEvent, setShowLifeEvent] = useState(false);
  const [lifeEventHandled, setLifeEventHandled] = useState(false);
  
  // Feedback
  const [feedback, setFeedback] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);

  // Profile configurations
  const profiles = {
    student: {
      name: 'Student',
      icon: '🎓',
      defaultIncomes: [500, 1000, 1500, 2000],
      categories: ['housing', 'food', 'transportation', 'entertainment', 'savings', 'other'],
      requirements: {
        1: { housing: 0.25, food: 0.15, transportation: 0.05, savings: 0.10 },
        2: { housing: 0.25, food: 0.15, transportation: 0.10, savings: 0.15 },
        3: { housing: 0.30, food: 0.15, transportation: 0.10, savings: 0.20 }
      },
      lifeEvents: [
        { type: 'expense', title: 'Textbook Emergency!', description: 'You need to buy expensive textbooks', amount: 200, category: 'other' },
        { type: 'expense', title: 'Laptop Repair', description: 'Your laptop needs urgent repairs', amount: 150, category: 'other' },
        { type: 'income', title: 'Part-time Bonus!', description: 'You got a bonus from your part-time job', amount: 100 },
        { type: 'expense', title: 'Medical Visit', description: 'Unexpected doctor visit', amount: 80, category: 'other' }
      ]
    },
    adult: {
      name: 'Working Adult',
      icon: '💼',
      defaultIncomes: [2500, 3500, 5000, 7000],
      categories: ['housing', 'food', 'transportation', 'entertainment', 'savings', 'other'],
      requirements: {
        1: { housing: 0.25, food: 0.12, transportation: 0.15, savings: 0.15 },
        2: { housing: 0.28, food: 0.12, transportation: 0.15, savings: 0.20 },
        3: { housing: 0.30, food: 0.12, transportation: 0.15, savings: 0.25 }
      },
      lifeEvents: [
        { type: 'expense', title: 'Car Repair', description: 'Your car needs immediate repairs', amount: 500, category: 'transportation' },
        { type: 'expense', title: 'Medical Emergency', description: 'Unexpected medical bill', amount: 400, category: 'other' },
        { type: 'income', title: 'Work Bonus!', description: 'You received a performance bonus', amount: 300 },
        { type: 'expense', title: 'Home Repair', description: 'Plumbing issue needs fixing', amount: 250, category: 'housing' },
        { type: 'income', title: 'Tax Refund!', description: 'You got a tax refund', amount: 200 }
      ]
    },
    freelancer: {
      name: 'Freelancer',
      icon: '💻',
      defaultIncomes: [2000, 3000, 4500, 6000],
      categories: ['housing', 'food', 'transportation', 'entertainment', 'savings', 'other'],
      requirements: {
        1: { housing: 0.25, food: 0.12, transportation: 0.10, savings: 0.20 },
        2: { housing: 0.25, food: 0.12, transportation: 0.10, savings: 0.25 },
        3: { housing: 0.28, food: 0.12, transportation: 0.10, savings: 0.30 }
      },
      lifeEvents: [
        { type: 'expense', title: 'Equipment Upgrade', description: 'Need to upgrade work equipment', amount: 400, category: 'other' },
        { type: 'expense', title: 'Slow Month', description: 'Client payments delayed', amount: 300, category: 'savings' },
        { type: 'income', title: 'Big Project!', description: 'Landed a major client', amount: 500 },
        { type: 'expense', title: 'Software Subscription', description: 'Annual software renewal', amount: 200, category: 'other' }
      ]
    }
  };

  const categoryLabels = {
    housing: { label: 'Housing/Rent', color: '#3b82f6', icon: '🏠' },
    food: { label: 'Food & Groceries', color: '#22c55e', icon: '🍕' },
    transportation: { label: 'Transportation', color: '#eab308', icon: '🚗' },
    entertainment: { label: 'Entertainment', color: '#a855f7', icon: '🎮' },
    savings: { label: 'Savings', color: '#10b981', icon: '💰' },
    other: { label: 'Other/Bills', color: '#6b7280', icon: '📋' }
  };

  const remaining = income - Object.values(budget).reduce((a, b) => a + b, 0);

  const handleProfileSelect = (profileKey) => {
    setUserProfile(profileKey);
    setGamePhase('income');
  };

  const handleIncomeSelect = (amount) => {
    setIncome(amount);
    setGamePhase('intro');
  };

  const handleCustomIncome = () => {
    const amount = parseInt(customIncome);
    if (amount > 0) {
      setIncome(amount);
      setGamePhase('intro');
    }
  };

  const startLevel = () => {
    setBudget({
      housing: 0,
      food: 0,
      transportation: 0,
      entertainment: 0,
      savings: 0,
      other: 0
    });
    setLifeEventHandled(false);
    setShowLifeEvent(false);
    setGamePhase('playing');
  };

  const handleBudgetChange = (category, value) => {
    const newValue = Math.max(0, parseInt(value) || 0);
    const currentTotal = Object.values(budget).reduce((a, b) => a + b, 0);
    const newTotal = currentTotal - budget[category] + newValue;
    
    if (newTotal > income) {
      showFeedbackMessage("⚠️ You don't have enough budget for that!");
      return;
    }
    
    setBudget({ ...budget, [category]: newValue });
    
    // Check if allocation is good
    const percentage = (newValue / income) * 100;
    const requirements = profiles[userProfile].requirements[currentLevel];
    const requiredPercentage = (requirements[category] || 0) * 100;
    
    if (requiredPercentage > 0 && percentage >= requiredPercentage) {
      showFeedbackMessage(`✅ Great! ${categoryLabels[category].label} is well allocated!`);
    }
  };

  const showFeedbackMessage = (message) => {
    setFeedback(message);
    setShowFeedback(true);
    setTimeout(() => setShowFeedback(false), 2500);
  };

  useEffect(() => {
    if (gamePhase === 'playing' && !lifeEventHandled && !showLifeEvent) {
      const timer = setTimeout(() => {
        const events = profiles[userProfile].lifeEvents;
        const randomEvent = events[Math.floor(Math.random() * events.length)];
        setLifeEvent(randomEvent);
        setShowLifeEvent(true);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [gamePhase, lifeEventHandled, showLifeEvent, userProfile]);

  const handleLifeEventChoice = (choice) => {
    if (choice === 'savings' && budget.savings >= lifeEvent.amount) {
      setBudget({ ...budget, savings: budget.savings - lifeEvent.amount });
      showFeedbackMessage('✅ Good! You used your emergency savings wisely!');
    } else if (choice === 'savings') {
      showFeedbackMessage('❌ Not enough savings! Adding to other expenses.');
      setBudget({ ...budget, other: budget.other + lifeEvent.amount });
    } else if (choice === 'income') {
      setIncome(income + lifeEvent.amount);
      showFeedbackMessage('🎉 Great news! Your income increased!');
    } else {
      setBudget({ ...budget, [lifeEvent.category]: budget[lifeEvent.category] + lifeEvent.amount });
      showFeedbackMessage('Added to your expenses.');
    }
    setShowLifeEvent(false);
    setLifeEventHandled(true);
  };

  const submitBudget = () => {
    if (remaining !== 0) {
      showFeedbackMessage('⚠️ You must allocate all your income!');
      return;
    }

    const requirements = profiles[userProfile].requirements[currentLevel];
    let levelScore = 100;
    let issues = [];

    Object.entries(requirements).forEach(([category, minPercent]) => {
      const allocated = budget[category];
      const required = income * minPercent;
      if (allocated < required) {
        levelScore -= 20;
        issues.push(`${categoryLabels[category].label}: Need at least $${required.toFixed(0)} (${(minPercent * 100).toFixed(0)}%)`);
      }
    });

    // Bonus for balanced budget
    if (budget.entertainment > 0 && budget.entertainment <= income * 0.1) {
      levelScore += 10;
    }

    setScore(Math.max(0, levelScore));
    setTotalScore(totalScore + Math.max(0, levelScore));
    setGamePhase('result');
  };

  const nextLevel = () => {
    if (currentLevel < 3) {
      setCurrentLevel(currentLevel + 1);
      setGamePhase('intro');
    } else {
      setGamePhase('final');
    }
  };

  const resetGame = () => {
    setCurrentLevel(1);
    setScore(0);
    setTotalScore(0);
    setGamePhase('profile');
    setUserProfile(null);
  };

  // Profile Selection Screen
  if (gamePhase === 'profile') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-4">💰 Budget Master Challenge</h1>
            <p className="text-xl text-purple-200">Choose your profile to begin your financial journey</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(profiles).map(([key, profile]) => (
              <button
                key={key}
                onClick={() => handleProfileSelect(key)}
                className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 hover:bg-white/20 transition-all transform hover:scale-105 border-2 border-white/20"
              >
                <div className="text-6xl mb-4">{profile.icon}</div>
                <h3 className="text-2xl font-bold text-white mb-2">{profile.name}</h3>
                <p className="text-purple-200 text-sm">
                  {key === 'student' && 'Manage your pocket money and part-time income'}
                  {key === 'adult' && 'Handle your monthly salary and expenses'}
                  {key === 'freelancer' && 'Balance variable income and business costs'}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Income Selection Screen
  if (gamePhase === 'income') {
    const profile = profiles[userProfile];
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-8">
        <div className="max-w-3xl mx-auto">
          <button onClick={() => setGamePhase('profile')} className="text-white mb-6 flex items-center gap-2">
            ← Back
          </button>
          
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">{profile.icon}</div>
            <h2 className="text-4xl font-bold text-white mb-2">
              What's your {userProfile === 'student' ? 'monthly pocket money' : 'monthly income'}?
            </h2>
            <p className="text-purple-200">Choose a preset amount or enter your own</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            {profile.defaultIncomes.map(amount => (
              <button
                key={amount}
                onClick={() => handleIncomeSelect(amount)}
                className="bg-white/10 backdrop-blur-lg rounded-xl p-6 hover:bg-white/20 transition-all border-2 border-white/20 text-white text-2xl font-bold"
              >
                ${amount}
              </button>
            ))}
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border-2 border-white/20">
            <label className="block text-white mb-2 font-semibold">Or enter custom amount:</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={customIncome}
                onChange={(e) => setCustomIncome(e.target.value)}
                placeholder="Enter amount"
                className="flex-1 px-4 py-3 rounded-lg bg-white/20 text-white placeholder-purple-300 border-2 border-white/30 focus:outline-none focus:border-white"
              />
              <button
                onClick={handleCustomIncome}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg text-white font-bold hover:from-green-600 hover:to-emerald-600 transition-all"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Level Intro Screen
  if (gamePhase === 'intro') {
    const requirements = profiles[userProfile].requirements[currentLevel];
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border-2 border-white/20">
            <div className="text-center mb-8">
              <div className="text-5xl mb-4">🎯</div>
              <h2 className="text-4xl font-bold text-white mb-2">Level {currentLevel}</h2>
              <p className="text-xl text-purple-200">Income: ${income}/month</p>
            </div>

            <div className="bg-white/5 rounded-xl p-6 mb-6">
              <h3 className="text-xl font-bold text-white mb-4">Your Goals:</h3>
              <ul className="space-y-2">
                {Object.entries(requirements).map(([category, percent]) => (
                  <li key={category} className="text-purple-200 flex items-center gap-2">
                    <span>{categoryLabels[category].icon}</span>
                    <span>{categoryLabels[category].label}: At least {(percent * 100).toFixed(0)}%</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-yellow-500/20 border-2 border-yellow-500/50 rounded-xl p-4 mb-6">
              <p className="text-yellow-200 text-center">⚠️ Be prepared for unexpected events!</p>
            </div>

            <button
              onClick={startLevel}
              className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl text-white text-xl font-bold hover:from-green-600 hover:to-emerald-600 transition-all flex items-center justify-center gap-2"
            >
              Start Level {currentLevel} <ArrowRight />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Playing Screen
  if (gamePhase === 'playing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <div className="text-4xl">{profiles[userProfile].icon}</div>
              <div>
                <h2 className="text-2xl font-bold text-white">Level {currentLevel}</h2>
                <p className="text-purple-200">Total Score: {totalScore}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-white">${income}</div>
              <div className="text-purple-200">Monthly Income</div>
            </div>
          </div>

          {/* Feedback Message */}
          {showFeedback && (
            <div className="mb-4 p-4 bg-blue-500/20 border-2 border-blue-500 rounded-xl backdrop-blur-lg feedback-pulse fade-in">
              <p className="text-white text-center font-semibold">{feedback}</p>
            </div>
          )}

          {/* Remaining Budget */}
          <div className={`mb-6 p-4 rounded-xl backdrop-blur-lg border-2 smooth-transition ${remaining === 0 ? 'bg-green-500/20 border-green-500' : 'bg-white/10 border-white/20'}`}>
            <div className="flex justify-between items-center">
              <span className="text-white text-lg">Remaining to Allocate:</span>
              <span className={`text-3xl font-bold smooth-transition ${remaining === 0 ? 'text-green-400' : 'text-white'}`}>
                ${remaining}
              </span>
            </div>
          </div>

          {/* Budget Categories */}
          <div className="space-y-4 mb-6">
            {Object.entries(budget).map(([category, amount]) => {
              const percentage = income > 0 ? (amount / income) * 100 : 0;
              const requirements = profiles[userProfile].requirements[currentLevel];
              const required = requirements[category] ? requirements[category] * 100 : 0;
              const isGood = percentage >= required;
              
              return (
                <div key={category} className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border-2 border-white/20">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{categoryLabels[category].icon}</span>
                      <span className="text-white font-semibold">{categoryLabels[category].label}</span>
                      {required > 0 && (
                        <span className="text-xs text-purple-300">(Min: {required.toFixed(0)}%)</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-white font-bold">${amount}</span>
                      <span className={`text-sm font-semibold ${isGood && required > 0 ? 'text-green-400' : 'text-purple-300'}`}>
                        {percentage.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  
                  <input
                    type="range"
                    min="0"
                    max={income}
                    step="50"
                    value={amount}
                    onChange={(e) => handleBudgetChange(category, e.target.value)}
                    className="w-full"
                    style={{
                      background: `linear-gradient(to right, ${categoryLabels[category].color} 0%, ${categoryLabels[category].color} ${percentage}%, rgba(255,255,255,0.2) ${percentage}%, rgba(255,255,255,0.2) 100%)`
                    }}
                  />
                </div>
              );
            })}
          </div>

          {/* Submit Button */}
          <button
            onClick={submitBudget}
            disabled={remaining !== 0}
            className={`w-full py-4 rounded-xl text-white text-xl font-bold transition-all flex items-center justify-center gap-2 ${
              remaining === 0
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
                : 'bg-gray-500 cursor-not-allowed opacity-50'
            }`}
          >
            Submit Budget <Award />
          </button>

          {/* Life Event Modal */}
          {showLifeEvent && lifeEvent && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-8 max-w-md border-4 border-white/30 life-event-modal">
                <div className="text-center">
                  <div className="text-6xl mb-4">⚠️</div>
                  <h3 className="text-3xl font-bold text-white mb-2">{lifeEvent.title}</h3>
                  <p className="text-white text-lg mb-6">{lifeEvent.description}</p>
                  <div className="text-4xl font-bold text-white mb-6">
                    {lifeEvent.type === 'income' ? '+' : '-'}${lifeEvent.amount}
                  </div>
                  
                  {lifeEvent.type === 'expense' ? (
                    <div className="space-y-3">
                      <button
                        onClick={() => handleLifeEventChoice('savings')}
                        className="w-full py-3 bg-green-600 hover:bg-green-700 rounded-xl text-white font-bold transition-all"
                      >
                        Use Emergency Savings
                      </button>
                      <button
                        onClick={() => handleLifeEventChoice('expense')}
                        className="w-full py-3 bg-red-600 hover:bg-red-700 rounded-xl text-white font-bold transition-all"
                      >
                        Add to Expenses
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleLifeEventChoice('income')}
                      className="w-full py-3 bg-green-600 hover:bg-green-700 rounded-xl text-white font-bold transition-all"
                    >
                      Accept Bonus! 🎉
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Result Screen
  if (gamePhase === 'result') {
    const requirements = profiles[userProfile].requirements[currentLevel];
    const isPassed = score >= 60;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-8">
        <div className="max-w-3xl mx-auto">
          <div className={`backdrop-blur-lg rounded-2xl p-8 border-4 ${isPassed ? 'bg-green-500/20 border-green-500' : 'bg-red-500/20 border-red-500'}`}>
            <div className="text-center mb-8">
              <div className="text-7xl mb-4">{isPassed ? '🎉' : '😅'}</div>
              <h2 className="text-4xl font-bold text-white mb-2">
                {isPassed ? 'Level Complete!' : 'Keep Trying!'}
              </h2>
              <div className="text-6xl font-bold text-white mb-2">{score}/100</div>
              <p className="text-xl text-purple-200">Total Score: {totalScore}</p>
            </div>

            {/* Budget Breakdown */}
            <div className="bg-white/10 rounded-xl p-6 mb-6">
              <h3 className="text-xl font-bold text-white mb-4">Your Budget:</h3>
              <div className="space-y-2">
                {Object.entries(budget).map(([category, amount]) => {
                  const percentage = (amount / income) * 100;
                  const required = requirements[category] ? requirements[category] * 100 : 0;
                  const isGood = percentage >= required;
                  
                  return (
                    <div key={category} className="flex justify-between items-center text-white">
                      <span className="flex items-center gap-2">
                        {categoryLabels[category].icon} {categoryLabels[category].label}
                        {required > 0 && !isGood && <span className="text-red-400 text-sm">(Need {required}%)</span>}
                        {required > 0 && isGood && <span className="text-green-400 text-sm">✓</span>}
                      </span>
                      <span className="font-bold">${amount} ({percentage.toFixed(0)}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-4">
              {isPassed && currentLevel < 3 ? (
                <button
                  onClick={nextLevel}
                  className="flex-1 py-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl text-white text-xl font-bold hover:from-green-600 hover:to-emerald-600 transition-all flex items-center justify-center gap-2"
                >
                  Next Level <ArrowRight />
                </button>
              ) : isPassed ? (
                <button
                  onClick={() => setGamePhase('final')}
                  className="flex-1 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl text-white text-xl font-bold hover:from-yellow-600 hover:to-orange-600 transition-all flex items-center justify-center gap-2"
                >
                  See Final Results <Award />
                </button>
              ) : null}
              
              <button
                onClick={startLevel}
                className="flex-1 py-4 bg-white/20 hover:bg-white/30 rounded-xl text-white text-xl font-bold transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw /> Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Final Results Screen
  if (gamePhase === 'final') {
    let rank = 'Beginner';
    let rankIcon = '🥉';
    if (totalScore >= 240) { rank = 'Budget Master'; rankIcon = '👑'; }
    else if (totalScore >= 200) { rank = 'Finance Guru'; rankIcon = '🥇'; }
    else if (totalScore >= 150) { rank = 'Money Manager'; rankIcon = '🥈'; }
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-lg rounded-2xl p-8 border-4 border-yellow-500">
            <div className="text-center mb-8">
              <div className="text-8xl mb-4">{rankIcon}</div>
              <h2 className="text-5xl font-bold text-white mb-2">Congratulations!</h2>
              <div className="text-6xl font-bold text-yellow-400 mb-2">{totalScore}/300</div>
              <p className="text-2xl text-white font-bold">{rank}</p>
            </div>

            <div className="bg-white/10 rounded-xl p-6 mb-6">
              <h3 className="text-xl font-bold text-white mb-4">What You've Learned:</h3>
              <ul className="space-y-2 text-purple-200">
                <li>✓ How to prioritize essential expenses</li>
                <li>✓ The importance of emergency savings</li>
                <li>✓ Handling unexpected financial events</li>
                <li>✓ Balancing needs vs wants</li>
                <li>✓ Creating sustainable spending habits</li>
              </ul>
            </div>

            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-2 border-green-500 rounded-xl p-6 mb-6">
              <p className="text-white text-center text-lg">
                💡 <span className="font-bold">Pro Tip:</span> Apply these budgeting skills to your real life! 
                Start tracking your expenses and set savings goals.
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={resetGame}
                className="flex-1 py-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl text-white text-xl font-bold hover:from-blue-600 hover:to-purple-600 transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw /> Play Again
              </button>
              <button
                onClick={() => window.location.href = '/games'}
                className="flex-1 py-4 bg-white/20 hover:bg-white/30 rounded-xl text-white text-xl font-bold transition-all flex items-center justify-center gap-2"
              >
                <Home /> Main Menu
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default BudgetGame;