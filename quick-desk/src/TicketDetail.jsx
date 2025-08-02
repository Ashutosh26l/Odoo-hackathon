import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSave } from 'react-icons/fa';

const TicketDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [comments, setComments] = useState('');

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
      fetchTicketDetail(token);
    } else {
      navigate('/login');
    }
  }, [id, navigate]);

  const fetchTicketDetail = async (token) => {
    try {
      const response = await fetch(`http://localhost:5000/agent/tickets/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (response.ok) {
        setTicket(data);
      } else {
        console.error('Error fetching ticket details:', data.message);
        navigate('/agent');
      }
    } catch (error) {
      console.error('Error fetching ticket details:', error);
      navigate('/agent');
    }
    setLoading(false);
  };

  const updateTicketStatus = async (newStatus) => {
    setUpdating(true);
    const token = localStorage.getItem('auth_token');
    
    try {
      const response = await fetch(`http://localhost:5000/agent/tickets/${id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setTicket({ ...ticket, status: newStatus });
        alert('Ticket status updated successfully');
      } else {
        alert('Error updating ticket status');
      }
    } catch (error) {
      console.error('Error updating ticket status:', error);
      alert('Error updating ticket status');
    }
    
    setUpdating(false);
  };

  const addComment = async () => {
    if (!comments.trim()) return;
    
    const token = localStorage.getItem('auth_token');
    
    try {
      const response = await fetch(`http://localhost:5000/agent/tickets/${id}/comment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comment: comments }),
      });

      if (response.ok) {
        setComments('');
        alert('Comment added successfully');
        fetchTicketDetail(token); // Refresh ticket data
      } else {
        alert('Error adding comment');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Error adding comment');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <p className="text-lg">Loading ticket details...</p>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <p className="text-lg">Ticket not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/agent')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4"
          >
            <FaArrowLeft /> Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Ticket Details</h1>
        </div>

        {/* Ticket Information */}
        <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-semibold text-gray-800">{ticket.question}</h2>
            <span className={`text-sm font-medium px-3 py-1 rounded-md ${statusColors[ticket.status]}`}>
              {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
            </span>
          </div>

          <p className="text-gray-600 mb-4">{ticket.description}</p>

          {/* Tags */}
          <div className="mb-4 flex flex-wrap gap-2">
            {ticket.tags && ticket.tags.map((tag, index) => (
              <span key={index} className="text-xs text-white bg-indigo-500 px-3 py-1 rounded-full">
                {tag}
              </span>
            ))}
          </div>

          {/* Ticket Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500 mb-4">
            <p>Posted by: <span className="font-medium">{ticket.username}</span></p>
            <p>Conversations: <span className="font-medium">{ticket.conversation_count || 0}</span></p>
            <p>Upvotes: <span className="font-medium">{ticket.upvote_count || 0}</span></p>
          </div>

          {/* Status Update Buttons */}
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((status) => (
              <button
                key={status}
                onClick={() => updateTicketStatus(status)}
                disabled={updating || ticket.status === status}
                className={`px-4 py-2 text-sm rounded-md transition-colors ${
                  ticket.status === status 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                }`}
              >
                {updating ? 'Updating...' : status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Add Comment</h3>
          
          <div className="mb-4">
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Add your comments or solution here..."
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="4"
            />
          </div>

          <button
            onClick={addComment}
            className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <FaSave /> Add Comment
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketDetail;
