// Simple authentication utilities

const TOKEN_KEY = 'auth_token';

export const authUtils = {
  // Check if token exists
  hasToken: (): boolean => {
    return !!localStorage.getItem(TOKEN_KEY);
  },

  // Get token
  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },

  // Set token (for testing purposes)
  setToken: (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
  },

  // Remove token
  removeToken: (): void => {
    localStorage.removeItem(TOKEN_KEY);
  }
}; 