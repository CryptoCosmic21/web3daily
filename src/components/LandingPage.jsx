import React from "react";
import SolarSystem from "./SolarSystem";

export default function LandingPage({ onEnter }) {
  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50">
      <SolarSystem />
      <div className="absolute bottom-10">
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
