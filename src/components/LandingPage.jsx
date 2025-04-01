import React from "react";
import { useMediaQuery } from 'react-responsive';
import SolarSystem from "./SolarSystem";
import { SolarSystemMobile } from "./SolarSystemMobile"; // Ensure this is a named export

export default function LandingPage({ onEnter }) {
  const isMobile = useMediaQuery({ maxDeviceWidth: 767 });

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50">
      {isMobile ? <SolarSystemMobile /> : <SolarSystem />}
      <div className="absolute bottom-10 z-50">
        <button
          onClick={onEnter}
          className="px-8 py-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-full text-2xl font-bold hover:from-purple-600 hover:to-indigo-600 transition"
        >
          Enter Web3Daily
        </button>
      </div>
    </div>
  );
}
