import Link from "next/link";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 md:flex md:items-center md:justify-between">
        <div className="flex items-center justify-center md:justify-start">
          <div className="flex items-center">
            <div className="rounded-full bg-indigo-600 p-1.5 text-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <span className="ml-2 text-sm text-gray-500">Auth System</span>
          </div>
        </div>

        <div className="mt-4 md:mt-0">
          <p className="text-center text-xs text-gray-500">
            &copy; {year} Secure Authentication System. All rights reserved.
          </p>
        </div>

        <div className="mt-4 md:mt-0 flex justify-center space-x-6">
          <Link
            href="/privacy"
            className="text-xs text-gray-500 hover:text-gray-900"
          >
            Privacy Policy
          </Link>
          <Link
            href="/terms"
            className="text-xs text-gray-500 hover:text-gray-900"
          >
            Terms of Service
          </Link>
          <Link
            href="/contact"
            className="text-xs text-gray-500 hover:text-gray-900"
          >
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
