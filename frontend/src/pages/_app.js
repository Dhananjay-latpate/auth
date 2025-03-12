import { useEffect } from "react";
import Head from "next/head";
import { AuthProvider } from "../context/AuthContext";
import { configureAxios } from "../utils/apiUtils";
import "../styles/globals.css";

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // Configure axios on app mount
    configureAxios();
  }, []);

  return (
    <AuthProvider>
      {/* Fix: Use text-only title element */}
      <Head>
        <title>Auth System</title>
      </Head>
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default MyApp;
