// src/components/NavBar.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const NavBar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Check authentication status
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      try {
        // Decode JWT to get user role
        const payload = JSON.parse(atob(token.split('.')[1]));
        const isTokenExpired = payload.exp * 1000 < Date.now();
        
        if (!isTokenExpired) {
          setIsAuthenticated(true);
          setUserRole(payload.role);
        } else {
          localStorage.removeItem('auth_token');
          setIsAuthenticated(false);
          setUserRole(null);
        }
      } catch (error) {
        localStorage.removeItem('auth_token');
        setIsAuthenticated(false);
        setUserRole(null);
      }
    } else {
      setIsAuthenticated(false);
      setUserRole(null);
    }
  }, [location]); // Re-check when location changes

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    setIsAuthenticated(false);
    setUserRole(null);
    navigate('/login');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (userRole === 'agent' || userRole === 'admin') {
      return '/agent';
    }
    return '/home';
  };

  return (
    <header className="w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left (brand) */}
          <Link
            to="/"
            className="text-xl font-bold tracking-wide text-blue-600 hover:text-blue-700"
          >
            Quick Desk
          </Link>

          {/* Right (navigation) */}
          <nav className="flex items-center gap-6 text-sm font-medium text-gray-700">
            {isAuthenticated ? (
              // Authenticated user navigation
              <>
                <Link
                  to="/profile"
                  className="hover:text-blue-600 transition-colors"
                >
                  Profile
                </Link>

                <Link
                  to={getDashboardLink()}
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
              </>
            ) : (
              // Non-authenticated user navigation
              <>
                <Link
                  to="/signup"
                  className="hover:text-blue-600 transition-colors"
                >
                  Sign Up
                </Link>

                <button
                  onClick={handleLogin}
                  className="rounded-md bg-blue-600 px-3 py-1.5 text-white hover:bg-blue-700 transition-colors"
                >
                  Login
                </button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default NavBar;
