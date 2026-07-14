/**
 * Utility for handling URL construction to prevent double slashes
 */

/**
 * Joins URL segments ensuring no double slashes
 * @param {string} baseUrl - The base URL (e.g., https://example.com)
 * @param {string} path - The path to append (e.g., /api/endpoint)
 * @returns {string} - Properly joined URL
 */
export const joinUrl = (baseUrl, path) => {
  // Remove trailing slash from baseUrl if it exists
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  
  // Remove leading slash from path if it exists
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // Join with a single slash
  return `${cleanBaseUrl}/${cleanPath}`;
};
