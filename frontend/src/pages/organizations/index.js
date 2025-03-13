import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Layout from "../../components/layout/Layout";
import { useAuth } from "../../context/AuthContext";
import OrganizationsList from "../../components/organizations/OrganizationsList";

const OrganizationsPage = () => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  
  // Wrap useAuth in try-catch to handle potential errors during initial render
  let authContext;
  try {
    authContext = useAuth();
  } catch (error) {
    console.error("Auth context not available yet:", error);
    // Return a loading state if auth isn't ready
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  const { user, loading, checkUserLoggedIn } = authContext;

  useEffect(() => {
    setMounted(true);
    checkUserLoggedIn();
  }, []);

  // Don't render anything on the server side
  if (!mounted) {
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Organizations</h1>

        {loading ? (
          <div className="flex justify-center items-center p-10">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <OrganizationsList />
        )}
      </div>
    </Layout>
  );
};

export default OrganizationsPage;
