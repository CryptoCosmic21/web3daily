import React from "react";
import { NavLink } from "react-router-dom";
import { AiFillHome } from "react-icons/ai";
import { RiNewspaperFill } from "react-icons/ri";
import { MdInfoOutline } from "react-icons/md";

export default function MobileNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 bg-gray-900 border-t border-gray-700 shadow md:hidden z-40">
      <ul className="flex justify-around">
        <li>
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive
                ? "flex flex-col items-center py-2 text-indigo-400"
                : "flex flex-col items-center py-2 text-gray-400"
            }
          >
            <AiFillHome className="w-6 h-6" />
            <span className="text-xs mt-1">Home</span>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/feed"
            className={({ isActive }) =>
              isActive
                ? "flex flex-col items-center py-2 text-indigo-400"
                : "flex flex-col items-center py-2 text-gray-400"
            }
          >
            <RiNewspaperFill className="w-6 h-6" />
            <span className="text-xs mt-1">Feed</span>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/about"
            className={({ isActive }) =>
              isActive
                ? "flex flex-col items-center py-2 text-indigo-400"
                : "flex flex-col items-center py-2 text-gray-400"
            }
          >
            <MdInfoOutline className="w-6 h-6" />
            <span className="text-xs mt-1">About</span>
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}
