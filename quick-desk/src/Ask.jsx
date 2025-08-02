import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient'; // Your Supabase client
import { useNavigate } from 'react-router-dom'; // For navigation
import { FaSpinner } from 'react-icons/fa'; // Loading spinner icon
import { jwtDecode } from 'jwt-decode'; // Correct named import

const Ask = () => {
  const [question, setQuestion] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState([]); // Array to hold selected tags
  const [availableTags, setAvailableTags] = useState([]); // Available categories (tags)
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();

  // Fetch categories (tags) from the category table in Supabase
  useEffect(() => {
    const fetchTags = async () => {
      const { data, error } = await supabase.from('category').select('name');
      if (error) {
        console.error("Error fetching categories:", error);
      } else {
        setAvailableTags(data.map((category) => category.name));
      }
    };

    // Get user info from the token in localStorage
    const fetchUser = () => {
      const authToken = localStorage.getItem('auth_token'); // Get the auth_token from localStorage
      if (authToken) {
        try {
          const decoded = jwtDecode(authToken); // Using `jwtDecode` from the named import
          if (decoded && decoded.email) {
            setUserName(decoded.email); // Set the username (email) from the decoded token
          }
        } catch (err) {
          console.error('Error decoding token:', err);
          alert('Session expired. Please log in again.');
          navigate('/login'); // Redirect to login page if token is invalid
        }
      } else {
        console.log("No auth_token found in localStorage.");
        alert('You are not logged in.');
        navigate('/login'); // Redirect to login page if no token is found
      }
    };

    fetchTags();
    fetchUser();
  }, [navigate]);

  // Handle Post Question
  const handlePost = async () => {
    if (!question || !description || tags.length === 0) {
      alert("Please fill in all fields and select at least one tag");
      return;
    }

    setLoading(true);

    try {
      // Insert new ticket into tickets table
      const { data, error } = await supabase
        .from('tickets')
        .insert([
          {
            question,
            description,
            tags,
            username: userName, // Store the user's name who posted the question
            status: 'open', // Set the status to open by default
            upvote_count: 0, // Set initial upvote count to 0
            conversations: 0, // Set initial number of conversations to 0
          },
        ]);

      if (error) {
        throw error;
      }

      alert("Your question has been posted successfully!");
      navigate('/home'); // Redirect after posting the question

    } catch (error) {
      alert("Error posting your question: " + error.message);
    }

    setLoading(false);
  };

  // Handle the change in tags selection
  const handleTagChange = (tag) => {
    setTags((prevTags) => {
      if (prevTags.includes(tag)) {
        return prevTags.filter((t) => t !== tag); // Remove tag if already selected
      } else {
        return [...prevTags, tag]; // Add tag to selected tags
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-indigo-50 flex justify-center items-center py-12">
      <div className="w-full max-w-3xl p-8 bg-white shadow-xl rounded-lg border border-gray-300">
        <h2 className="text-3xl font-semibold text-center text-gray-800 mb-6">Ask Your Question</h2>

        <div className="space-y-6">
          {/* Question Field */}
          <div className="mb-4">
            <label htmlFor="question" className="block text-sm font-medium text-gray-700">Question</label>
            <input
              type="text"
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="mt-1 block w-full p-4 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Enter your question"
            />
          </div>

          {/* Description Field */}
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full p-4 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Describe your issue in more detail"
              rows="4"
            />
          </div>

          {/* Tags Field (Checkboxes for multiple selection) */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Tags</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {availableTags.map((tag, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={tag}
                    value={tag}
                    checked={tags.includes(tag)}
                    onChange={() => handleTagChange(tag)}
                    className="h-5 w-5 text-blue-600 border-gray-300 rounded-sm focus:ring-2 focus:ring-blue-500"
                  />
                  <label htmlFor={tag} className="text-sm text-gray-700">{tag}</label>
                </div>
              ))}
            </div>
          </div>

          {/* Display selected tags as chips */}
          <div className="mb-4">
            {tags.length > 0 && (
              <div className="flex flex-wrap space-x-2">
                {tags.map((tag, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm flex items-center space-x-1">
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleTagChange(tag)}
                      className="text-white hover:bg-blue-700 rounded-full p-1"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Post Button */}
          <div className="flex justify-center">
            <button
              onClick={handlePost}
              disabled={loading}
              className={`w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <FaSpinner className="animate-spin mx-auto" />
              ) : (
                'Post Question'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ask;
