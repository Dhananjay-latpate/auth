import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Layout from "../components/layout/Layout";
import { useAuth } from "../context/AuthContext";
import { FaKey, FaUsers, FaShieldAlt, FaUser } from "react-icons/fa";

const DashboardCard = ({ title, icon, description, linkText, linkHref, count }) => {
  const router = useRouter();
  
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="p-5">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-blue-100 text-blue-600">
            {icon}
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
          {count !== undefined && (
            <div className="ml-auto">
              <span className="bg-blue-50 text-blue-700 py-1 px-3 rounded-full font-medium text-sm">
                {count}
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="bg-gray-50 px-5 py-3">
        <button 
          onClick={() => router.push(linkHref)}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          {linkText} &rarr;
        </button>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user, loading, getUserOrganizations, getUserSessions, getUserApiKeys, checkUserLoggedIn } = useAuth();
  const router = useRouter();
  
  // State for dashboard data
  const [orgsCount, setOrgsCount] = useState(0);
  const [sessionsCount, setSessionsCount] = useState(0);
  const [apiKeysCount, setApiKeysCount] = useState(0);
  const [dataLoading, setDataLoading] = useState(true);
  
  useEffect(() => {
    checkUserLoggedIn();
  }, []);
  
  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) return;
      
      setDataLoading(true);
      try {
        // Load organizations count
        const orgsRes = await getUserOrganizations();
        setOrgsCount(orgsRes.data?.length || 0);
        
        // Load active sessions
        const sessionsRes = await getUserSessions();
        setSessionsCount(sessionsRes.data?.length || 0);
        
        // Load API keys
        const apiKeysRes = await getUserApiKeys();
        setApiKeysCount(apiKeysRes.data?.length || 0);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setDataLoading(false);
      }
    };
    
    loadDashboardData();
  }, [user]);
  
  if (loading || !user) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout title="Dashboard | Auth Platform">
      <div className="max-w-7xl mx-auto">
        <div className="pb-5 border-b border-gray-200 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Welcome back, {user.name}!
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <DashboardCard 
            title="My Profile"
            icon={<FaUser className="h-6 w-6" />}
            description="Update your personal information"
            linkText="Edit profile"
            linkHref="/profile/edit"
          />
          
          <DashboardCard 
            title="Organizations"
            icon={<FaUsers className="h-6 w-6" />}
            description="Manage your organizations and teams"
            linkText="View organizations"
            linkHref="/organizations"
            count={orgsCount}
          />
          
          <DashboardCard 
            title="Security"
            icon={<FaShieldAlt className="h-6 w-6" />}
            description="Active sessions and security settings"
            linkText="Manage security"
            linkHref="/profile/security"
            count={sessionsCount}
          />
          
          <DashboardCard 
            title="API Keys"
            icon={<FaKey className="h-6 w-6" />}
            description="Manage your API keys"
            linkText="Manage keys"
            linkHref="/profile/api-keys"
            count={apiKeysCount}
          />
        </div>
        
        {user.role === 'admin' && (
          <div className="mt-10">
            <h2 className="text-xl font-semibold mb-4">Admin Functions</h2>
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 text-indigo-700">
              <p>As an administrator, you have access to advanced functions.</p>
              <button
                onClick={() => router.push('/admin/dashboard')}
                className="mt-2 bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700"
              >
                Go to Admin Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
