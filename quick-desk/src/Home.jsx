import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Use useNavigate for redirect
import { FaSearch } from 'react-icons/fa'; // Importing search icon from react-icons

const Home = () => {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [tickets, setTickets] = useState([]); // Store all tickets
  const [filteredTickets, setFilteredTickets] = useState([]); // Filtered tickets based on search
  const navigate = useNavigate(); // Hook for redirect

  // Fetch user data and tickets from the backend when the component mounts
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      // Fetch user info from backend using the token
      const fetchUserData = async () => {
        try {
          const response = await fetch('http://localhost:5000/profile', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          
          const data = await response.json();
          
          if (response.ok) {
            setUser(data.user); // Set the user data
          } else {
            // If the token is invalid or expired, remove it and redirect to login
            localStorage.removeItem('auth_token');
            navigate('/login');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          localStorage.removeItem('auth_token');
          navigate('/login');
        }
      };

      fetchUserData();
    } else {
      // If no token, redirect to login
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    const fetchTickets = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          // Fetch tickets from the backend using the authorization token
          const response = await fetch('http://localhost:5000/tickets', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          const data = await response.json();
          
          if (response.ok) {
            setTickets(data); // Set fetched tickets to the state
          } else {
            console.error('Error fetching tickets:', data.message);
          }
        } catch (error) {
          console.error('Error fetching tickets:', error);
        }
      } else {
        console.error('No auth token found');
        navigate('/login');
      }
    };

    fetchTickets();
  }, [navigate]);

  useEffect(() => {
    const filtered = tickets.filter(ticket => {
      const searchQueryLower = searchQuery.toLowerCase();
      return (
        ticket.question.toLowerCase().includes(searchQueryLower) || 
        ticket.tags.some(tag => tag.toLowerCase().includes(searchQueryLower)) ||
        ticket.description.toLowerCase().includes(searchQueryLower)
      );
    });
    setFilteredTickets(filtered);
  }, [searchQuery, tickets]);

  // Handle the "Ask" button click
  const handleAskButtonClick = () => {
    navigate('/ask'); // Redirect to Ask page
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-8">
      {user ? (
        <>
          {/* Welcome message */}
          <div className="w-full max-w-4xl text-center mb-6">
            <h2 className="text-sm text-gray-500">Welcome back</h2>
            <h1 className="text-3xl font-semibold text-gray-800">{user.email}</h1>
          </div>

          {/* Search Bar and Ask Button */}
          <div className="flex w-full max-w-4xl bg-white shadow-md rounded-lg mb-6 p-4">
            <div className="relative flex-grow">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tickets..."
                className="w-full p-3 pl-10 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                <FaSearch />
              </div>
            </div>
            <button
              onClick={handleAskButtonClick}
              className="w-32 ml-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Ask
            </button>
          </div>

          {/* Filtered Tickets List */}
          {filteredTickets.length > 0 && (
            <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Tickets:</h2>
              <ul className="space-y-4">
                {filteredTickets.map((ticket) => (
                  <li key={ticket.id} className="p-6 bg-white shadow-md rounded-md border border-gray-300 hover:shadow-lg transition-shadow duration-300">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-semibold text-gray-800">{ticket.question}</h3>
                      <span className={`text-sm font-medium px-3 py-1 rounded-md ${ticket.status === 'Open' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {ticket.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{ticket.description}</p>

                    {/* Tags with distinct background */}
                    <div className="mt-2 flex flex-wrap gap-2">
                      {ticket.tags && ticket.tags.map((tag, index) => (
                        <span key={index} className="text-xs text-white bg-indigo-500 px-3 py-1 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
                      <p>Posted by {ticket.username}</p>
                      <p className="flex items-center">
                        <span className="mr-1">💬</span>{ticket.conversation_count || 0} Conversations
                      </p>
                      <p className="flex items-center">
                        <span className="mr-1">🔼</span>{ticket.upvote_count || 0} Votes
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* If no tickets found */}
          {searchQuery && filteredTickets.length === 0 && (
            <div className="w-full max-w-4xl px-6 mt-4 text-center text-gray-500">
              <p>No tickets found for "{searchQuery}"</p>
            </div>
          )}
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default Home;
