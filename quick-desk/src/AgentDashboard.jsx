import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaPlus, FaEye } from 'react-icons/fa';

const AgentDashboard = () => {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Status options
  const statusOptions = ['open', 'in-progress', 'resolved', 'closed'];
  const statusColors = {
    'open': 'bg-blue-100 text-blue-700',
    'in-progress': 'bg-yellow-100 text-yellow-700',
    'resolved': 'bg-green-100 text-green-700',
    'closed': 'bg-gray-100 text-gray-700'
  };

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      fetchUserData(token);
      fetchTickets(token);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const fetchUserData = async (token) => {
    try {
      const response = await fetch('http://localhost:5000/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setUser(data.user);
      } else {
        localStorage.removeItem('auth_token');
        navigate('/login');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      localStorage.removeItem('auth_token');
      navigate('/login');
    }
  };

  const fetchTickets = async (token) => {
    try {
      const response = await fetch('http://localhost:5000/agent/tickets', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (response.ok) {
        setTickets(data);
      } else {
        console.error('Error fetching tickets:', data.message);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
    }
  };

  useEffect(() => {
    let filtered = tickets.filter(ticket => {
      const searchQueryLower = searchQuery.toLowerCase();
      const matchesSearch = 
        ticket.question.toLowerCase().includes(searchQueryLower) || 
        ticket.tags.some(tag => tag.toLowerCase().includes(searchQueryLower)) ||
        ticket.description.toLowerCase().includes(searchQueryLower);
      
      const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
    setFilteredTickets(filtered);
  }, [searchQuery, tickets, statusFilter]);

  const updateTicketStatus = async (ticketId, newStatus) => {
    setLoading(true);
    const token = localStorage.getItem('auth_token');
    
    try {
      const response = await fetch(`http://localhost:5000/agent/tickets/${ticketId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        // Update local state
        setTickets(tickets.map(ticket => 
          ticket.id === ticketId ? { ...ticket, status: newStatus } : ticket
        ));
      } else {
        alert('Error updating ticket status');
      }
    } catch (error) {
      console.error('Error updating ticket status:', error);
      alert('Error updating ticket status');
    }
    
    setLoading(false);
  };

  const handleCreateTicket = () => {
    navigate('/ask');
  };

  const handleViewTicket = (ticketId) => {
    navigate(`/ticket/${ticketId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-8">
      {user ? (
        <>
          {/* Header */}
          <div className="w-full max-w-6xl text-center mb-6">
            <h2 className="text-sm text-gray-500">Support Agent Dashboard</h2>
            <h1 className="text-3xl font-semibold text-gray-800">{user.email}</h1>
          </div>

          {/* Search and Filter Section */}
          <div className="w-full max-w-6xl bg-white shadow-md rounded-lg mb-6 p-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Bar */}
              <div className="relative flex-grow">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tickets..."
                  className="w-full p-3 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  <FaSearch />
                </div>
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>

              {/* Create Ticket Button */}
              <button
                onClick={handleCreateTicket}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <FaPlus /> Create Ticket
              </button>
            </div>
          </div>

          {/* Tickets List */}
          {filteredTickets.length > 0 ? (
            <div className="w-full max-w-6xl bg-white shadow-lg rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">
                Tickets ({filteredTickets.length})
              </h2>
              <div className="space-y-4">
                {filteredTickets.map((ticket) => (
                  <div key={ticket.id} className="p-6 bg-white shadow-md rounded-md border border-gray-300 hover:shadow-lg transition-shadow duration-300">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-semibold text-gray-800">{ticket.question}</h3>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium px-3 py-1 rounded-md ${statusColors[ticket.status]}`}>
                          {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                        </span>
                        <button
                          onClick={() => handleViewTicket(ticket.id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                          title="View Details"
                        >
                          <FaEye />
                        </button>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-3">{ticket.description}</p>

                    {/* Tags */}
                    <div className="mb-3 flex flex-wrap gap-2">
                      {ticket.tags && ticket.tags.map((tag, index) => (
                        <span key={index} className="text-xs text-white bg-indigo-500 px-3 py-1 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Status Update Buttons */}
                    <div className="mb-3 flex flex-wrap gap-2">
                      {statusOptions.map((status) => (
                        <button
                          key={status}
                          onClick={() => updateTicketStatus(ticket.id, status)}
                          disabled={loading || ticket.status === status}
                          className={`px-3 py-1 text-xs rounded-md transition-colors ${
                            ticket.status === status 
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                        </button>
                      ))}
                    </div>

                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <p>Posted by {ticket.username}</p>
                      <div className="flex gap-4">
                        <p className="flex items-center">
                          <span className="mr-1">💬</span>{ticket.conversation_count || 0} Conversations
                        </p>
                        <p className="flex items-center">
                          <span className="mr-1">🔼</span>{ticket.upvote_count || 0} Votes
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="w-full max-w-6xl px-6 mt-4 text-center text-gray-500">
              <p>
                {searchQuery || statusFilter !== 'all' 
                  ? `No tickets found for current filters` 
                  : 'No tickets available'
                }
              </p>
            </div>
          )}
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default AgentDashboard;
