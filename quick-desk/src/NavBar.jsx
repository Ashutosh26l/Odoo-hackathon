// src/components/NavBar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const NavBar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('auth_token');   // clear JWT
    navigate('/login');                      // go back to login
  };

  return (
    <header className="w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* flex container */}
        <div className="flex h-16 items-center justify-between">
          {/* ---------------  LEFT (brand) --------------- */}
          <Link
            to="/"
            className="text-xl font-bold tracking-wide text-blue-600 hover:text-blue-700"
          >
            Quick Desk
          </Link>

          {/* ---------------  RIGHT (links) --------------- */}
          <nav className="flex items-center gap-6 text-sm font-medium text-gray-700">
            <Link
              to="/profile"
              className="hover:text-blue-600 transition-colors"
            >
              Profile
            </Link>

            <Link
              to="/home"     /* or "/agent" if you want role-specific routing */
              className="hover:text-blue-600 transition-colors"
            >
              Dashboard
            </Link>

            <button
              onClick={handleLogout}
              className="rounded-md bg-red-600 px-3 py-1.5 text-white hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default NavBar;
