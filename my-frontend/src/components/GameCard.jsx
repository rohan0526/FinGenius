import React from 'react';
import { useNavigate } from 'react-router-dom';
import './GameCard.css';

const GameCard = ({ title, description, image, path, difficulty }) => {
  const navigate = useNavigate();

  const handlePlayClick = () => {
    navigate(path);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return '#10b981';
      case 'intermediate':
        return '#f59e0b';
      case 'advanced':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  return (
    <div className="game-card">
      <div className="game-card-image">
        <img src={image} alt={title} />
        <div className="game-card-overlay">
          <button className="play-button" onClick={handlePlayClick}>
            Play Now
          </button>
        </div>
      </div>
      <div className="game-card-content">
        <div className="game-card-header">
          <h3>{title}</h3>
          <span 
            className="difficulty-badge" 
            style={{ backgroundColor: getDifficultyColor(difficulty) }}
          >
            {difficulty}
          </span>
        </div>
        <p className="game-card-description">{description}</p>
      </div>
    </div>
  );
};

export default GameCard;
