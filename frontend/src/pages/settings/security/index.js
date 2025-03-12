import Link from "next/link";
import { useAuth } from "../../../context/AuthContext";
import Layout from "../../../components/Layout";
import LoginActivity from "../../../components/LoginActivity";

const SecuritySettingsPage = () => {
  const { user } = useAuth();

  return (
    <Layout title="Security Settings" requireAuth={true}>
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Security Settings
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Manage your account security settings
            </p>
          </div>

          <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
            <dl className="sm:divide-y sm:divide-gray-200">
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:items-center">
                <dt className="text-sm font-medium text-gray-500">Password</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 flex justify-between items-center">
                  <span>••••••••••••</span>
                  <Link
                    href="/settings/security/password"
                    className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Change
                  </Link>
                </dd>
              </div>

              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:items-center">
                <dt className="text-sm font-medium text-gray-500">
                  Two-Factor Authentication
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 flex justify-between items-center">
                  <div>
                    <div
                      className={`${
                        user?.twoFactorEnabled
                          ? "text-green-500"
                          : "text-red-500"
                      } font-medium`}
                    >
                      {user?.twoFactorEnabled ? "Enabled" : "Disabled"}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {user?.twoFactorEnabled
                        ? "Your account is protected with two-factor authentication"
                        : "Add an extra layer of security to your account"}
                    </div>
                  </div>
                  <Link
                    href="/settings/security/two-factor"
                    className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    {user?.twoFactorEnabled ? "Manage" : "Setup"}
                  </Link>
                </dd>
              </div>

              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Login Activity
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <LoginActivity user={user} />
                </dd>
              </div>

              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Account Security Tips
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                    <li>
                      Use a strong, unique password that you don't use elsewhere
                    </li>
                    <li>
                      Enable two-factor authentication for additional security
                    </li>
                    <li>
                      Never share your password or verification codes with
                      others
                    </li>
                    <li>
                      Be careful when logging in on public or shared devices
                    </li>
                    <li>Watch for suspicious activity in your account</li>
                  </ul>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SecuritySettingsPage;
