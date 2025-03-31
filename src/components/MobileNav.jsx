import React, { useState } from 'react';
import { HomeIcon, NewspaperIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { NavLink } from 'react-router-dom';

export default function MobileNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 bg-gray-900 border-t border-gray-700 shadow md:hidden">
      <ul className="flex justify-around">
        <li>
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? 'flex flex-col items-center py-2 text-indigo-400' : 'flex flex-col items-center py-2 text-gray-400'
            }
          >
            <HomeIcon className="w-6 h-6" />
            <span className="text-xs">Home</span>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/feed"
            className={({ isActive }) =>
              isActive ? 'flex flex-col items-center py-2 text-indigo-400' : 'flex flex-col items-center py-2 text-gray-400'
            }
          >
            <NewspaperIcon className="w-6 h-6" />
            <span className="text-xs">Feed</span>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/about"
            className={({ isActive }) =>
              isActive ? 'flex flex-col items-center py-2 text-indigo-400' : 'flex flex-col items-center py-2 text-gray-400'
            }
          >
            <InformationCircleIcon className="w-6 h-6" />
            <span className="text-xs">About</span>
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}
