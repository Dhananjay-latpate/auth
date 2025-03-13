import { useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import { useAuth } from '../../context/AuthContext';
import ApiKeyManager from '../../components/security/ApiKeyManager';

const ApiKeysPage = () => {
  const { user, loading, checkUserLoggedIn } = useAuth();
  
  useEffect(() => {
    checkUserLoggedIn();
  }, []);
  
  return (
    <Layout title="API Keys | Auth Platform">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">API Keys</h1>
        
        {loading ? (
          <div className="flex justify-center items-center p-10">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <section>
            <ApiKeyManager />
          </section>
        )}
      </div>
    </Layout>
  );
};

export default ApiKeysPage;
