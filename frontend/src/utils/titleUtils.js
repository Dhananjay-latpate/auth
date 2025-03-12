/**
 * Creates a properly formatted title string for HTML title elements
 * @param {string} pageTitle - The title for the current page
 * @param {string} [siteName="Auth System"] - The name of the site
 * @returns {string} A properly formatted title string
 */
export const formatPageTitle = (pageTitle, siteName = "Auth System") => {
  if (!pageTitle) return siteName;
  // Return a simple string to avoid React rendering an array or multiple elements
  return `${pageTitle} | ${siteName}`;
};
