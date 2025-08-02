import React from 'react';
import { useNavigate } from 'react-router-dom';

const Navigation = ({ userRole }) => {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 px-4 py-2">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex space-x-4">
          {/* Logo/Brand */}
          <h1 className="text-xl font-bold text-blue-600">Support System</h1>
          
          {/* Navigation Links based on role */}
          {userRole === 'end_user' && (
            <div className="flex space-x-4">
              <button 
                onClick={() => handleNavigation('/home')}
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Home
              </button>
              <button 
                onClick={() => handleNavigation('/ask')}
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Ask Question
              </button>
            </div>
          )}
          
          {(userRole === 'agent' || userRole === 'admin') && (
            <div className="flex space-x-4">
              <button 
                onClick={() => handleNavigation('/agent')}
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Dashboard
              </button>
              <button 
                onClick={() => handleNavigation('/ask')}
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Create Ticket
              </button>
            </div>
          )}
        </div>

        {/* Logout Button */}
        <button 
          onClick={() => handleNavigation('/logout')}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navigation;
