import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [upgradeRequests, setUpgradeRequests] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUpgradeRequests();
  }, []);

  const fetchUpgradeRequests = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('id, email')
      .eq('upgrade_requested', true);

    if (error) {
      console.error('Error fetching upgrade requests:', error);
    } else {
      setUpgradeRequests(data);
    }
  };

  const approveRequest = async (userId) => {
    const { error } = await supabase
      .from('users')
      .update({ role: 'agent', upgrade_requested: false })
      .eq('id', userId);

    if (error) {
      alert('Error approving upgrade.');
    } else {
      fetchUpgradeRequests(); // Refresh list
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-semibold mb-6">Upgrade Requests</h2>
      {upgradeRequests.length === 0 ? (
        <p>No upgrade requests found.</p>
      ) : (
        <ul className="space-y-4">
          {upgradeRequests.map((user) => (
            <li key={user.id} className="flex justify-between items-center p-4 bg-white shadow rounded">
              <span>{user.email}</span>
              <button
                onClick={() => approveRequest(user.id)}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Approve Upgrade
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-8">
        <button
          onClick={() => navigate('/admin/manage-users')}
          className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
        >
          Manage Users
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;
