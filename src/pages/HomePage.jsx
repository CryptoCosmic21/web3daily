import React from 'react';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <section
      className="relative min-h-screen bg-no-repeat bg-cover bg-center bg-[url('https://images.unsplash.com/photo-1648601392048-cd7dfac62a64?auto=format&fit=crop&w=1600&q=80')]"
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/80 backdrop-blur-sm"></div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center py-24 px-6 md:py-40">
        <h1 className="text-4xl md:text-6xl font-extrabold text-white drop-shadow-xl">
          Welcome to <span className="text-indigo-400">Web3Daily</span>
        </h1>
        <p className="mt-6 text-lg md:text-xl text-gray-300 max-w-2xl">
          Your decentralized hub for curated crypto news and Web3 insights. Stay updated with the latest from X, YouTube, TikTok, Reddit, and X Spaces.
        </p>
        <Link
          to="/feed"
          className="mt-8 inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-lg font-semibold transition-all shadow-lg"
        >
          Explore the Feed <ArrowRightIcon className="w-5 h-5" />
        </Link>
      </div>
    </section>
  );
}
