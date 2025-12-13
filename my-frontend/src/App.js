import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AuthPage } from "./components/AuthPage";
import { HomePage } from "./components/HomePage";
import { Chat } from "./components/Chat";
import { TradingView } from "./components/TradingView";
import { Portfolio } from "./components/Portfolio";
import NavBar from "./components/NAVBAR/NavBar";

// Import game pages
import GamesPage from "./pages/GamesPage";
import BudgetGame from "./pages/BudgetGame";
import EscapeRoom from "./pages/EscapeRoom";
import FakeOrFinance from "./pages/FakeOrFinance";

// Function to render the profile page
const ProfilePage = () => {
  const navigate = useNavigate();

  // Effect to set profile tab
  useEffect(() => {
    // You could set a global state here to indicate profile tab should be active
    // For now, we'll just use localStorage as a simple approach
    localStorage.setItem('activeTab', 'profile');
  }, []);

  // Just redirect to homepage which will show profile content based on activeTab
  return <Navigate to="/" />;
};

const AppContent = () => {
  const { user } = useAuth();

  return (
    <>
      {user && <NavBar />}
      <div className="page-container" style={{ margin: 0, padding: 0 }}>
        <Routes>
          <Route path="/" element={user ? <HomePage /> : <Navigate to="/auth" />} />
          <Route path="/auth" element={user ? <Navigate to="/" /> : <AuthPage />} />
          <Route path="/chat" element={user ? <Chat /> : <Navigate to="/auth" />} />
          <Route path="/tradingview" element={user ? <TradingView /> : <Navigate to="/auth" />} />
          <Route path="/portfolio" element={user ? <Portfolio /> : <Navigate to="/auth" />} />
          <Route path="/profile" element={user ? <ProfilePage /> : <Navigate to="/auth" />} />

          {/* Game Routes */}
          <Route path="/games" element={user ? <GamesPage /> : <Navigate to="/auth" />} />
          <Route path="/games/budget" element={user ? <BudgetGame /> : <Navigate to="/auth" />} />
          <Route path="/games/escape-room" element={user ? <EscapeRoom /> : <Navigate to="/auth" />} />
          <Route path="/games/fake-or-finance" element={user ? <FakeOrFinance /> : <Navigate to="/auth" />} />
        </Routes>
      </div>
    </>
  );
};

export const App = () => {
  return (
    <div className="app-wrapper" style={{ margin: 0, padding: 0 }}>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </div>
  );
};