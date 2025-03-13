import { useEffect } from "react";
import Layout from "../../components/layout/Layout";
import { useAuth } from "../../context/AuthContext";
import ProfileSettings from "../../components/profile/ProfileSettings";

const ProfileEditPage = () => {
  const { user, loading, checkUserLoggedIn } = useAuth();

  useEffect(() => {
    checkUserLoggedIn();
  }, []);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Edit Profile</h1>

        {loading ? (
          <div className="flex justify-center items-center p-10">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <ProfileSettings />
        )}
      </div>
    </Layout>
  );
};

export default ProfileEditPage;
