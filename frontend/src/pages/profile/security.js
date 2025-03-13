import { useEffect } from "react";
import Layout from "../../components/layout/Layout";
import { useAuth } from "../../context/AuthContext";
import SessionsManager from "../../components/security/SessionsManager";
import ApiKeyManager from "../../components/security/ApiKeyManager";

const SecurityPage = () => {
  const { user, loading, checkUserLoggedIn } = useAuth();

  useEffect(() => {
    checkUserLoggedIn();
  }, []);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Security & Sessions</h1>

        <div className="space-y-8">
          {loading ? (
            <div className="flex justify-center items-center p-10">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              <section className="mb-12">
                <h2 className="text-2xl font-semibold mb-6">Active Sessions</h2>
                <SessionsManager />
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-6">API Keys</h2>
                <ApiKeyManager />
              </section>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SecurityPage;
