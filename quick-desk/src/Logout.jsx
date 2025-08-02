import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Logout = () => {
  const navigate = useNavigate(); 

  useEffect(() => {
    localStorage.removeItem('auth_token');
    navigate('/login');
  }, [navigate]); 

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="p-4 bg-white shadow-md rounded-lg">
        <p className="text-lg font-semibold text-gray-800">Logging out...</p>
      </div>
    </div>
  );
};

export default Logout;