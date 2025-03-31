import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import Web3DailyFeed from "./components/Web3DailyFeed";
import XFeed from "./components/XFeed";
import MobileNav from "./components/MobileNav";

function App() {
  const [showLanding, setShowLanding] = useState(true);

  return (
    <>
      {showLanding && <LandingPage onEnter={() => setShowLanding(false)} />}
      {!showLanding && (
        <div className="min-h-screen bg-gray-900">
          <Navbar />
          <Routes>
            <Route path="/" element={<HeroSection />} />
            <Route path="/feed" element={<Web3DailyFeed />} />
            <Route path="/about" element={<div className="p-4 text-white">About Page Coming Soon!</div>} />
            <Route path="/xfeed" element={<XFeed />} />
          </Routes>
          <MobileNav />
        </div>
      )}
    </>
  );
}

export default App;
