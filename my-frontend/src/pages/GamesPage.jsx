import React, { useState, useEffect } from 'react';
import GameCard from '../components/GameCard';
import '../game/CSS/index.css';
import budgetGameImage from '../assets/images/budgetgame.jpg';
import escapeRoomImage from '../assets/images/escape room.jpg';
import fakeFinanceImage from '../assets/images/fakef.jpg';

const GamesPage = () => {
  const [animateCards, setAnimateCards] = useState(false);
  
  useEffect(() => {
    // Trigger card animations after component mounts
    setTimeout(() => {
      setAnimateCards(true);
    }, 100);
  }, []);
  
  const games = [
    {
      id: 1,
      title: 'Budget Challenge',
      description: 'Learn to manage your finances by making budget decisions in different scenarios.',
      image: budgetGameImage,
      path: '/games/budget',
      difficulty: 'Beginner'
    },
    {
      id: 2,
      title: 'Financial Escape Room',
      description: 'Solve puzzles and financial riddles to escape the room and master investment concepts.',
      image: escapeRoomImage,
      path: '/games/escape-room',
      difficulty: 'Intermediate'
    },
    {
      id: 3,
      title: 'Fake or Finance',
      description: 'Test your knowledge of financial terms and spot financial scams in this quiz game.',
      image: fakeFinanceImage,
      path: '/games/fake-or-finance',
      difficulty: 'Advanced'
    }
  ];

  return (
    <div className="games-page">
      <div className="games-header">
        <h1>Financial Education Games</h1>
        <p>Master financial concepts through interactive, engaging games</p>
      </div>
      
      <div className="games-intro">
        <p>Each game provides a unique way to improve your financial literacy while having fun. Choose a game to start your learning journey!</p>
      </div>
      
      <div className={`games-container ${animateCards ? 'animate' : ''}`}>
        {games.map((game, index) => (
          <div 
            className="game-card-wrapper" 
            key={game.id}
            style={{ animationDelay: `${index * 0.2}s` }}
          >
            <GameCard
              title={game.title}
              description={game.description}
              image={game.image}
              path={game.path}
              difficulty={game.difficulty}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default GamesPage; 