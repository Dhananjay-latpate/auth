import { useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "../../components/Layout";

const ProfileTwoFactorRedirect = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the correct two-factor setup path
    router.replace("/settings/security/two-factor");
  }, [router]);

  return (
    <Layout requireAuth={true} title="Redirecting...">
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            Redirecting to two-factor authentication setup...
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default ProfileTwoFactorRedirect;
