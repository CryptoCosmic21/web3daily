import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import MobileNav from './components/MobileNav';
import HomePage from './pages/HomePage';
import FeedPage from './pages/FeedPage';
import AboutPage from './pages/AboutPage';

function App() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/feed" element={<FeedPage />} />
        <Route path="/about" element={<AboutPage />} />
      </Routes>
      <MobileNav />
    </div>
  );
}

export default App;
