import React from "react";
import { GiPlanetCore } from "react-icons/gi";
import { useNavigate } from "react-router-dom";

export default function HeroSection() {
  const navigate = useNavigate();

  const handleExplore = () => {
    navigate("/feed");
  };

  return (
    <section className="bg-gradient-to-b from-black to-gray-900 text-white py-20 px-6 md:px-12 text-center">
      <GiPlanetCore className="w-20 h-20 mx-auto mb-4 text-indigo-400" />
      <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
        Welcome to <span className="text-indigo-400">Web3Daily</span>
      </h1>
      <p className="mt-4 text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
        Your decentralized hub for curated crypto news and Web3 insights from X, YouTube, TikTok, Reddit, and X Spaces.
      </p>
      <div className="mt-8">
        <button
          onClick={handleExplore}
          className="px-8 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 rounded-full text-lg font-medium transition"
        >
          Explore Feeds
        </button>
      </div>
    </section>
  );
}
