import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Alert from "../components/ui/Alert";

const Dashboard = () => {
  const { user } = useAuth();
  const [greeting, setGreeting] = useState("");
  const [securityScore, setSecurityScore] = useState(0);
  const [securityTips, setSecurityTips] = useState([]);

  useEffect(() => {
    const hour = new Date().getHours();
    let newGreeting;

    if (hour < 12) {
      newGreeting = "Good morning";
    } else if (hour < 18) {
      newGreeting = "Good afternoon";
    } else {
      newGreeting = "Good evening";
    }

    setGreeting(newGreeting);

    // Calculate security score
    if (user) {
      let score = 50; // Base score
      if (user.twoFactorEnabled) score += 30;
      if (user.passwordUpdatedAt) {
        // Check if password was updated in the last 90 days
        const lastUpdate = new Date(user.passwordUpdatedAt);
        const now = new Date();
        const daysSinceUpdate = Math.floor((now - lastUpdate) / (1000 * 60 * 60 * 24));
        if (daysSinceUpdate < 90) score += 20;
      }
      setSecurityScore(Math.min(score, 100));

      // Set security tips
      const tips = [];
      if (!user.twoFactorEnabled) {
        tips.push({
          text: "Enable two-factor authentication for enhanced security",
          link: "/settings/security/two-factor",
          linkText: "Enable 2FA"
        });
      }
      if (!user.passwordUpdatedAt || new Date(user.passwordUpdatedAt) < new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)) {
        tips.push({
          text: "Change your password regularly (at least every 90 days)",
          link: "/settings/security/password",
          linkText: "Change Password"
        });
      }
      setSecurityTips(tips);
    }
  }, [user]);

  const getScoreColor = () => {
    if (securityScore >= 80) return "text-green-500";
    if (securityScore >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <Layout title="Dashboard" requireAuth={true}>
      <div className="space-y-6">
        <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-xl">
          <div className="flex items-center">
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-2">
                {greeting}, {user?.name?.split(" ")[0] || "User"}!
              </h2>
              <p className="opacity-90">Welcome to your secure dashboard.</p>
            </div>
            <div className="hidden sm:block">
              <div className="bg-white bg-opacity-20 rounded-full p-4">
                <svg
                  className="h-14 w-14 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
                  />
                </svg>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card 
            title="Account Status" 
            className="transition-transform hover:translate-y-[-5px]"
          >
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-500">Role:</span>
                <span className="font-semibold capitalize">{user?.role || "User"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">2FA Status:</span>
                <span
                  className={`font-semibold ${
                    user?.twoFactorEnabled ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {user?.twoFactorEnabled ? "Enabled" : "Disabled"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Last Login:</span>
                <span className="font-semibold">
                  {user?.lastLogin
                    ? new Date(user.lastLogin).toLocaleString()
                    : "N/A"}
                </span>
              </div>
              <div className="pt-2">
                <Button href="/profile" variant="secondary" size="sm">
                  View Profile
                </Button>
              </div>
            </div>
          </Card>

          <Card 
            title="Security Score" 
            className="transition-transform hover:translate-y-[-5px]"
          >
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-gray-50 mb-4">
                <span className={`text-3xl font-bold ${getScoreColor()}`}>
                  {securityScore}%
                </span>
              </div>
              <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${
                    securityScore >= 80 ? 'bg-green-500' : 
                    securityScore >= 60 ? 'bg-yellow-500' : 
                    'bg-red-500'
                  }`}
                  style={{ width: `${securityScore}%` }}
                ></div>
              </div>
            </div>
            
            {securityScore < 100 && securityTips.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Security Recommendations:</h4>
                <ul className="space-y-2">
                  {securityTips.map((tip, index) => (
                    <li key={index} className="text-xs text-gray-600 flex justify-between items-center">
                      <span>{tip.text}</span>
                      <Button href={tip.link} variant="primary" size="xs">
                        {tip.linkText}
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {securityScore === 100 && (
              <Alert type="success" message="Great job! Your account has excellent security." />
            )}
          </Card>

          <Card 
            title="Quick Actions" 
            className="transition-transform hover:translate-y-[-5px]"
          >
            <div className="space-y-3">
              <div>
                <Button href="/settings/security" variant="primary" className="w-full mb-3">
                  Security Settings
                </Button>
                
                <Button href="/profile" variant="secondary" className="w-full mb-3">
                  Update Profile
                </Button>
                
                {user?.twoFactorEnabled ? (
                  <Button href="/settings/security/two-factor" variant="secondary" className="w-full">
                    Manage 2FA
                  </Button>
                ) : (
                  <Button href="/settings/security/two-factor" variant="outline" className="w-full">
                    Setup 2FA
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>
        
        <Card
          title="Recent Activity"
          subtitle="Your account activity in the last 30 days"
          footer={
            <div className="text-right">
              <Button variant="secondary" size="sm">
                View All Activity
              </Button>
            </div>
          }
        >
          <div className="overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {user?.lastLogin && (
                <li className="py-3 flex justify-between">
                  <div className="flex items-center">
                    <div className="bg-blue-100 rounded-full p-2 mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Successful login</p>
                      <p className="text-xs text-gray-500">From IP: {user.lastLoginIP || 'Unknown'}</p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(user.lastLogin).toLocaleDateString()}
                  </div>
                </li>
              )}
              
              {user?.passwordUpdatedAt && (
                <li className="py-3 flex justify-between">
                  <div className="flex items-center">
                    <div className="bg-green-100 rounded-full p-2 mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Password updated</p>
                      <p className="text-xs text-gray-500">Updated by you</p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(user.passwordUpdatedAt).toLocaleDateString()}
                  </div>
                </li>
              )}
              
              {(!user?.lastLogin && !user?.passwordUpdatedAt) && (
                <li className="py-4 text-center text-gray-500">
                  No recent activity to display
                </li>
              )}
            </ul>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;
