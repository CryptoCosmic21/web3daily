import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { useMediaQuery } from 'react-responsive';

import LandingPage from "./components/LandingPage";
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import Web3DailyFeed from "./components/Web3DailyFeed";
import XFeed from "./components/XFeed";
import MobileNav from "./components/MobileNav";
import SolarSystem from "./components/SolarSystem";
import SolarSystemMobile from "./components/SolarSystemMobile";

function App() {
  const [showLanding, setShowLanding] = useState(true);
  const isMobile = useMediaQuery({ maxDeviceWidth: 767 });

  return (
    <>
      {showLanding && <LandingPage onEnter={() => setShowLanding(false)} />}

      {!showLanding && (
        <div className="min-h-screen bg-gray-900">
          <Navbar />
          <Routes>
            <Route path="/" element={isMobile ? <SolarSystemMobile /> : <SolarSystem />} />
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
