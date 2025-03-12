import { useState } from "react";

const LoginActivity = ({ user }) => {
  const [showDetails, setShowDetails] = useState(false);

  if (!user) {
    return <div>Loading user data...</div>;
  }

  // Format the date nicely
  const formatDate = (dateString) => {
    if (!dateString) return "Not available";

    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  };

  // Get browser info from user agent (very simplified)
  const getBrowserInfo = (userAgent) => {
    if (!userAgent) return "Unknown";

    if (userAgent.includes("Firefox")) return "Firefox";
    if (userAgent.includes("Chrome")) return "Chrome";
    if (userAgent.includes("Safari")) return "Safari";
    if (userAgent.includes("Edge")) return "Edge";
    if (userAgent.includes("MSIE") || userAgent.includes("Trident/"))
      return "Internet Explorer";

    return "Unknown Browser";
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Recent Login Activity</h3>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-sm text-indigo-600 hover:text-indigo-500"
        >
          {showDetails ? "Show less" : "Show details"}
        </button>
      </div>

      <div className="bg-gray-50 rounded-md p-4">
        <div className="flex justify-between">
          <div>
            <div className="font-medium">Last login</div>
            <div className="text-sm text-gray-600">
              {formatDate(user.lastLogin)}
            </div>
          </div>
          <div>
            <div className="font-medium">From IP</div>
            <div className="text-sm text-gray-600">
              {user.lastLoginIP || "Not available"}
            </div>
          </div>
        </div>

        {showDetails && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="font-medium mb-2">Account Security Timeline</h4>
            <ul className="space-y-2 text-sm">
              {user.lastLogin && (
                <li className="flex space-x-2">
                  <div className="text-gray-500">
                    {formatDate(user.lastLogin)}
                  </div>
                  <div className="text-gray-600">
                    Successful login from {user.lastLoginIP || "unknown IP"}
                  </div>
                </li>
              )}

              {user.passwordUpdatedAt && (
                <li className="flex space-x-2">
                  <div className="text-gray-500">
                    {formatDate(user.passwordUpdatedAt)}
                  </div>
                  <div className="text-gray-600">Password was updated</div>
                </li>
              )}

              {user.lastTokenRefresh && (
                <li className="flex space-x-2">
                  <div className="text-gray-500">
                    {formatDate(user.lastTokenRefresh)}
                  </div>
                  <div className="text-gray-600">
                    Authentication token refreshed
                  </div>
                </li>
              )}

              <li className="flex space-x-2">
                <div className="text-gray-500">
                  {formatDate(user.createdAt)}
                </div>
                <div className="text-gray-600">Account created</div>
              </li>
            </ul>
          </div>
        )}

        <div className="mt-4 text-xs text-gray-500">
          <p>
            For security reasons, we keep a record of your login activity. If
            you see any suspicious activity, please change your password
            immediately and contact support.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginActivity;
