import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  FaDesktop,
  FaMobile,
  FaTablet,
  FaWindows,
  FaApple,
  FaLinux,
  FaAndroid,
} from "react-icons/fa";

const SessionsManager = () => {
  const { getUserSessions, revokeSession, revokeAllOtherSessions } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const response = await getUserSessions();
      setSessions(response.data || []);
    } catch (err) {
      setError("Failed to load sessions");
      console.error("Error loading sessions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleRevokeSession = async (sessionId) => {
    try {
      await revokeSession(sessionId);
      // Filter out the revoked session from the state
      setSessions(sessions.filter((session) => session.id !== sessionId));
      setSuccess("Session revoked successfully");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError("Failed to revoke session");
      console.error("Error revoking session:", err);
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleRevokeAllSessions = async () => {
    try {
      await revokeAllOtherSessions();
      // Keep only the current session
      setSessions(sessions.filter((session) => session.isCurrentSession));
      setSuccess("All other sessions revoked successfully");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError("Failed to revoke all sessions");
      console.error("Error revoking all sessions:", err);
      setTimeout(() => setError(null), 3000);
    }
  };

  const getDeviceIcon = (session) => {
    const { userAgent } = session;

    // Device type
    if (userAgent?.device === "Mobile")
      return <FaMobile className="text-gray-700" />;
    if (userAgent?.device === "Tablet")
      return <FaTablet className="text-gray-700" />;

    // OS
    if (userAgent?.os === "Windows")
      return <FaWindows className="text-gray-700" />;
    if (userAgent?.os === "MacOS") return <FaApple className="text-gray-700" />;
    if (userAgent?.os === "Linux") return <FaLinux className="text-gray-700" />;
    if (userAgent?.os === "Android")
      return <FaAndroid className="text-gray-700" />;
    if (userAgent?.os === "iOS") return <FaApple className="text-gray-700" />;

    // Default
    return <FaDesktop className="text-gray-700" />;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-6">Active Sessions</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <div className="mb-4 flex justify-end">
        <button
          onClick={handleRevokeAllSessions}
          className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          Revoke All Other Sessions
        </button>
      </div>

      {sessions.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          No active sessions found.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Device
                </th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Active
                </th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP Address
                </th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sessions.map((session) => (
                <tr
                  key={session.id}
                  className={session.isCurrentSession ? "bg-blue-50" : ""}
                >
                  <td className="py-4 px-6 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center">
                        {getDeviceIcon(session)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {session.userAgent?.browser || "Unknown Browser"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {session.userAgent?.os || "Unknown OS"}
                          {session.isCurrentSession && (
                            <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded">
                              Current Session
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {session.location?.city
                        ? `${session.location.city}, ${session.location.country}`
                        : "Location unknown"}
                    </div>
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDate(session.lastActive || session.createdAt)}
                    </div>
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-500">
                    {session.ipAddress || "Unknown IP"}
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap text-right text-sm font-medium">
                    {!session.isCurrentSession && (
                      <button
                        onClick={() => handleRevokeSession(session.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Revoke
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SessionsManager;
