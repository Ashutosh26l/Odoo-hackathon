import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [filter, setFilter] = useState("all"); // all, end-user, agent
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is admin
    const token = localStorage.getItem("auth_token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload.role !== "admin") {
        navigate("/home");
        return;
      }
    } catch (error) {
      navigate("/login");
      return;
    }

    fetchUsers();
  }, [navigate]);

  const fetchUsers = async () => {
    setLoading(true);
    const token = localStorage.getItem("auth_token");

    try {
      const response = await fetch("http://localhost:5000/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setUsers(data);
      } else {
        console.error("Error fetching users:", data.message);
      }
    } catch (error) {
      console.error("Network error:", error);
    } finally {
      setLoading(false);
    }
  };

  const demoteUser = async (userId) => {
    const confirmed = window.confirm(
      "Are you sure you want to demote this user to end-user?"
    );
    if (!confirmed) return;

    setProcessing(userId);
    const token = localStorage.getItem("auth_token");

    try {
      const response = await fetch(
        `http://localhost:5000/admin/users/${userId}/role`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ role: "end-user" }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert("User demoted successfully!");
        fetchUsers(); // Refresh the list
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      alert("Network error. Please try again.");
    } finally {
      setProcessing(null);
    }
  };

  const promoteUser = async (userId) => {
    const confirmed = window.confirm(
      "Are you sure you want to promote this user to agent?"
    );
    if (!confirmed) return;

    setProcessing(userId);
    const token = localStorage.getItem("auth_token");

    try {
      const response = await fetch(
        `http://localhost:5000/admin/users/${userId}/role`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ role: "agent" }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert("User promoted successfully!");
        fetchUsers(); // Refresh the list
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      alert("Network error. Please try again.");
    } finally {
      setProcessing(null);
    }
  };

  const filteredUsers = users.filter((user) => {
    if (filter === "all") return user.role !== "admin";
    return user.role === filter;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <p className="text-lg text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/admin")}
            className="text-blue-600 hover:text-blue-800 mb-4"
          >
            ← Back to Admin Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Manage Users
          </h1>
          <p className="text-gray-600">View and manage user roles</p>
        </div>

        {/* Filter */}
        <div className="mb-6">
          <div className="flex gap-2">
            {[
              { key: "all", label: "All Users" },
              { key: "end-user", label: "End Users" },
              { key: "agent", label: "Agents" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-4 py-2 rounded-md transition-colors ${
                  filter === key
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Users List */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <h2 className="text-xl font-semibold text-gray-800">
              Users ({filteredUsers.length})
            </h2>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">
                No users found for the selected filter.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            user.role === "agent"
                              ? "bg-green-100 text-green-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {user.role === "agent" ? (
                          <button
                            onClick={() => demoteUser(user.id)}
                            disabled={processing === user.id}
                            className={`px-3 py-1 rounded text-white transition-colors ${
                              processing === user.id
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-red-600 hover:bg-red-700"
                            }`}
                          >
                            {processing === user.id
                              ? "Processing..."
                              : "Demote"}
                          </button>
                        ) : user.role === "end-user" ? (
                          <button
                            onClick={() => promoteUser(user.id)}
                            disabled={processing === user.id}
                            className={`px-3 py-1 rounded text-white transition-colors ${
                              processing === user.id
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-green-600 hover:bg-green-700"
                            }`}
                          >
                            {processing === user.id
                              ? "Processing..."
                              : "Promote"}
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageUsers;
