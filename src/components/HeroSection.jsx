import React from "react";
import { RocketLaunchIcon } from "@heroicons/react/24/solid";

export default function HeroSection() {
  return (
    <section className="bg-gradient-to-b from-black to-gray-900 text-white py-20 px-6 md:px-12 text-center">
      <RocketLaunchIcon className="w-16 h-16 mx-auto mb-4 text-blue-500" />
      <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
        Welcome to <span className="text-blue-500">Web3Daily</span>
      </h1>
      <p className="mt-4 text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
        Your decentralized hub for curated crypto news and Web3 insights from X, YouTube, TikTok, Reddit, and X Spaces.
      </p>
      <div className="mt-8">
        <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-full text-lg font-medium transition">
          Explore Feeds
        </button>
      </div>
    </section>
  );
}
