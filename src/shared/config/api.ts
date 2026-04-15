/**
 * API Configuration
 * Provides utilities for building API URLs
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

const API_CONFIG = {
  /**
   * Get full URL for an API endpoint
   * @param path - API path (e.g., '/api/signal/stream' or 'api/signal/webhook/123')
   * @returns Full URL with base URL
   */
  getFullUrl(path: string): string {
    // Remove leading slash if present to avoid double slashes
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;

    // If path already starts with 'api/', use it as is
    // Otherwise, prepend 'api/' if not already present
    const fullPath = cleanPath.startsWith('api/')
      ? cleanPath
      : `api/${cleanPath}`;

    return `${API_BASE_URL}/${fullPath}`;
  },

  /**
   * Get base URL
   */
  getBaseUrl(): string {
    return API_BASE_URL;
  },
};

export default API_CONFIG;
