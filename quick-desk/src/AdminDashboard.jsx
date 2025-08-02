import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const [upgradeRequests, setUpgradeRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
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

    fetchUpgradeRequests();
  }, [navigate]);

  const fetchUpgradeRequests = async () => {
    setLoading(true);
    const token = localStorage.getItem("auth_token");

    try {
      const response = await fetch(
        "http://localhost:5000/admin/upgrade-requests",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setUpgradeRequests(data);
      } else {
        console.error("Error fetching requests:", data.message);
      }
    } catch (error) {
      console.error("Network error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async (requestId, action) => {
    setProcessing(requestId);
    const token = localStorage.getItem("auth_token");

    try {
      const response = await fetch(
        `http://localhost:5000/admin/upgrade-requests/${requestId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: action }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert(`Request ${action} successfully!`);
        fetchUpgradeRequests(); // Refresh the list
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      alert("Network error. Please try again.");
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <p className="text-lg text-gray-600">Loading requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">Manage upgrade requests and users</p>
        </div>

        {/* Navigation */}
        <div className="mb-6 flex gap-4">
          <button
            onClick={() => navigate("/admin/manage-users")}
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
          >
            Manage Users
          </button>
          <button
            onClick={() => navigate("/admin")}
            className="bg-gray-600 text-white px-6 py-3 rounded-md hover:bg-gray-700 transition-colors"
          >
            Upgrade Requests
          </button>
        </div>

        {/* Upgrade Requests */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Pending Upgrade Requests
          </h2>

          {upgradeRequests.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">
                No pending upgrade requests found.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {upgradeRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border"
                >
                  <div>
                    <p className="font-medium text-gray-800">
                      {request.users?.name || "Unknown User"}
                    </p>
                    <p className="text-sm text-gray-600">
                      {request.users?.email}
                    </p>
                    <p className="text-xs text-gray-500">
                      Requested:{" "}
                      {new Date(request.created_at).toLocaleDateString()}
                    </p>
                    <div className="mt-1">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {request.current_role} → {request.requested_role}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRequest(request.id, "approved")}
                      disabled={processing === request.id}
                      className={`px-4 py-2 rounded text-white transition-colors ${
                        processing === request.id
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-green-600 hover:bg-green-700"
                      }`}
                    >
                      {processing === request.id ? "Processing..." : "Approve"}
                    </button>

                    <button
                      onClick={() => handleRequest(request.id, "rejected")}
                      disabled={processing === request.id}
                      className={`px-4 py-2 rounded text-white transition-colors ${
                        processing === request.id
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-red-600 hover:bg-red-700"
                      }`}
                    >
                      {processing === request.id ? "Processing..." : "Reject"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
