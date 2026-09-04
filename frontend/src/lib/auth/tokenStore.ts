/**
 * In-memory storage for JWT Access Tokens.
 * Per the Full-Stack Blueprint security guidelines, access tokens are NEVER stored in
 * localStorage or sessionStorage to protect against XSS token harvesting.
 * Refresh tokens are stored safely in HttpOnly cookies managed automatically by the browser.
 */

let inMemoryAccessToken: string | null = null;
let tokenChangeListeners: Array<(token: string | null) => void> = [];

export const tokenStore = {
  getAccessToken(): string | null {
    return inMemoryAccessToken;
  },

  setAccessToken(token: string | null) {
    inMemoryAccessToken = token;
    tokenChangeListeners.forEach((listener) => listener(token));
  },

  clearAccessToken() {
    inMemoryAccessToken = null;
    tokenChangeListeners.forEach((listener) => listener(null));
  },

  subscribe(listener: (token: string | null) => void): () => void {
    tokenChangeListeners.push(listener);
    return () => {
      tokenChangeListeners = tokenChangeListeners.filter((l) => l !== listener);
    };
  }
};
