/**
 * Creates a throttled function that only invokes the provided function at most once per specified interval
 *
 * @param {Function} func - The function to throttle
 * @param {number} wait - The number of milliseconds to wait between invocations
 * @returns {Function} - The throttled function
 */
export const throttle = (func, wait) => {
  let waiting = false;
  let lastResult;
  let lastArgs;

  return function (...args) {
    lastArgs = args;

    // If we're not waiting, execute the function immediately
    if (!waiting) {
      waiting = true;
      lastResult = func.apply(this, args);

      // After the wait time, allow the function to be called again
      setTimeout(() => {
        waiting = false;
      }, wait);
    } else {
      console.log(`Throttled: Function call prevented within ${wait}ms`);
    }

    return lastResult;
  };
};

/**
 * Creates a debounced function that delays invoking the provided function until after wait milliseconds have elapsed
 * since the last time the debounced function was invoked
 *
 * @param {Function} func - The function to debounce
 * @param {number} wait - The number of milliseconds to wait
 * @returns {Function} - The debounced function
 */
export const debounce = (func, wait) => {
  let timeout;

  return function (...args) {
    const later = () => {
      timeout = null;
      func.apply(this, args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};
