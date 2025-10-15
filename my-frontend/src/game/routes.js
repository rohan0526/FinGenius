import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { HomePage } from '../components/HomePage';
import { AuthPage } from '../components/AuthPage';
import { Chat } from '../components/Chat';
import { TradingView } from '../components/TradingView';
import GamesPage from '../pages/GamesPage';
import BudgetGame from '../pages/BudgetGame';
import EscapeRoom from '../pages/EscapeRoom';
import FakeOrFinance from '../pages/FakeOrFinance';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/chat" element={<Chat />} />
      <Route path="/tradingview" element={<TradingView />} />
      <Route path="/games" element={<GamesPage />} />
      <Route path="/games/budget" element={<BudgetGame />} />
      <Route path="/games/escape-room" element={<EscapeRoom />} />
      <Route path="/games/fake-or-finance" element={<FakeOrFinance />} />
    </Routes>
  );
};

export default AppRoutes; 