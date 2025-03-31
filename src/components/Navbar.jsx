import React from 'react';
import { Link, NavLink } from 'react-router-dom';

export default function Navbar() {
  return (
    <header className="bg-gray-900 shadow p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-extrabold text-indigo-500">
          Web3Daily
        </Link>
        <nav className="hidden md:flex space-x-6">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? 'text-indigo-400' : 'text-gray-400 hover:text-indigo-400'
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/feed"
            className={({ isActive }) =>
              isActive ? 'text-indigo-400' : 'text-gray-400 hover:text-indigo-400'
            }
          >
            Feed
          </NavLink>
          <NavLink
            to="/about"
            className={({ isActive }) =>
              isActive ? 'text-indigo-400' : 'text-gray-400 hover:text-indigo-400'
            }
          >
            About
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
