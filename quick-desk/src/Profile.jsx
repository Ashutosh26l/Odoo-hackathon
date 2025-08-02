// src/Profile.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // ---------------- fetch profile ----------------
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("auth_token");
      if (!token) return navigate("/login");

      // optional expiry check
      try {
        const { exp } = JSON.parse(atob(token.split(".")[1]));
        if (exp * 1000 < Date.now()) {
          localStorage.removeItem("auth_token");
          return navigate("/login");
        }
      } catch {
        localStorage.removeItem("auth_token");
        return navigate("/login");
      }

      try {
        const res = await fetch("http://localhost:5000/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setUser(data.user);
        else {
          localStorage.removeItem("auth_token");
          navigate("/login");
        }
      } catch (err) {
        console.error("Profile fetch error:", err);
        localStorage.removeItem("auth_token");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  // ---------------- handle upgrade click ----------------
  const handleUpgrade = async () => {
    setSubmitLoading(true);
    setMessage("");
    const token = localStorage.getItem("auth_token");

    try {
      const res = await fetch("http://localhost:5000/upgrade-request", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (res.ok)
        setMessage(
          "Upgrade request submitted! We’ll notify you once approved."
        );
      else setMessage(data.message || "Error submitting request.");
    } catch {
      setMessage("Network error. Please try again later.");
    } finally {
      setSubmitLoading(false);
    }
  };

  // ---------------- loading state ----------------
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <p className="text-lg text-gray-600">Loading profile…</p>
        </div>
      </div>
    );
  }

  if (!user) return null; // safety

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex justify-center items-start py-12 px-4">
      <div className="w-full max-w-lg bg-white shadow-xl rounded-lg border border-gray-200 p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your account information</p>
        </div>

        {/* Profile Information */}
        <div className="space-y-4 mb-8">
          <ProfileRow label="Name" value={user.name} />
          <ProfileRow label="Gender" value={user.gender} />
          <ProfileRow label="Email" value={user.email} />
          <ProfileRow label="Category" value={user.category} />
          <ProfileRow label="Role" value={user.role} badge />
          <ProfileRow
            label="Member Since"
            value={new Date(user.created_at).toLocaleDateString()}
          />
        </div>

        {/* Upgrade Section for end-users */}
        {user.role === "end-user" /* <-- fixed check */ && (
          <div className="border-t border-gray-200 pt-6">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Want to help others?
              </h3>
              <p className="text-sm text-gray-600">
                Request to become a support agent and help resolve tickets
              </p>
            </div>

            <button
              onClick={handleUpgrade}
              disabled={submitLoading}
              className={`w-full py-3 px-4 rounded-md text-white font-medium transition-colors ${
                submitLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              }`}
            >
              {submitLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Submitting Request...
                </div>
              ) : (
                "Request Upgrade for Agent"
              )}
            </button>

            {/* Message Display */}
            {message && (
              <div
                className={`mt-4 p-3 rounded-md text-sm text-center ${
                  message.toLowerCase().includes("error")
                    ? "bg-red-100 text-red-700 border border-red-200"
                    : "bg-green-100 text-green-700 border border-green-200"
                }`}
              >
                {message}
              </div>
            )}
          </div>
        )}

        {/* Role-specific Information */}
        {user.role === "agent" && (
          <RoleBox
            color="blue"
            title="Support Agent"
            text="You can access the agent dashboard to manage tickets"
          />
        )}

        {user.role === "admin" && (
          <RoleBox
            color="purple"
            title="Administrator"
            text="You have full system access and can manage all users"
          />
        )}
      </div>
    </div>
  );
};

export default Profile;

/* ---------- helper sub-components ---------- */
const ProfileRow = ({ label, value, badge = false }) => (
  <div className="flex items-center justify-between py-2">
    <span className="text-sm font-medium text-gray-500">{label}</span>
    {badge ? (
      <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full capitalize">
        {value || "—"}
      </span>
    ) : (
      <span className="text-sm text-gray-800 font-medium">{value || "—"}</span>
    )}
  </div>
);

const RoleBox = ({ color, title, text }) => (
  <div className="border-t border-gray-200 pt-6">
    <div
      className={`bg-${color}-50 border border-${color}-200 rounded-md p-4 text-center`}
    >
      <h3 className={`text-lg font-semibold text-${color}-800 mb-1`}>
        {title}
      </h3>
      <p className={`text-sm text-${color}-600`}>{text}</p>
    </div>
  </div>
);
