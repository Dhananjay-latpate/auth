/**
 * Utility to track and prevent redirect loops
 * Used by the authentication middleware to detect potential infinite redirects
 */
class RedirectTracker {
  constructor(options = {}) {
    this.maxRedirects = options.maxRedirects || 5;
    this.timeWindow = options.timeWindow || 3000; // 3 seconds
    this.history = [];
    this.storageKey = "redirect_history";
  }

  /**
   * Add a redirect to the history and check if we're in a loop
   * @param {string} path - The path being redirected to
   * @returns {boolean} - True if we should break the redirect chain
   */
  trackRedirect(path) {
    const now = Date.now();

    // Clean up old redirects outside the time window
    this.history = this.history.filter(
      (item) => now - item.time < this.timeWindow
    );

    // Add current redirect
    this.history.push({
      path,
      time: now,
    });

    // Check if we've exceeded the maximum redirects in the time window
    if (this.history.length >= this.maxRedirects) {
      // Consider adding logging or metrics here
      return true; // Break the redirect chain
    }

    return false;
  }

  /**
   * Reset the redirect history
   */
  reset() {
    this.history = [];
  }

  /**
   * Get a unique marker for bypass flags
   * @returns {string} - A timestamp-based unique string for bypass parameters
   */
  getBypassMarker() {
    return `bypass_${Date.now()}`;
  }
}

module.exports = RedirectTracker;
