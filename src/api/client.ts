
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_CONFIG } from './config';

// Token management
class TokenManager {
  private static instance: TokenManager;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private OuId: number | null = null;
  private LangId: number | null = null;
  private RoleName: string | null = null;

  private constructor() {
    this.loadTokensFromStorage();
  }

  static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    return TokenManager.instance;
  }

  private loadTokensFromStorage() {
    
    let localToken = JSON.parse(localStorage.getItem('token')); // uncommend for nly build
    if(localToken){
      this.accessToken = localToken.access_token; 
      this.refreshToken = localToken.refresh_token; 
    }
    
    // this.accessToken = localStorage.getItem('accessToken'); // commend for nly build
    // this.refreshToken = localStorage.getItem('refreshToken');
  }

  setTokens(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  getRefreshToken(): string | null {
    return this.refreshToken;
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
}

// Create axios instance
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    headers: API_CONFIG.HEADERS,
  });

  const tokenManager = TokenManager.getInstance();

  // Request interceptor for adding auth token
  client.interceptors.request.use(
    (config) => {
      const token = tokenManager.getAccessToken();
      // const nebulaUserInfo = JSON.parse(localStorage.getItem('nebulaUserInfo'));
      // const OuId = nebulaUserInfo.data.userDefaults.ouId;
      // const LangId = nebulaUserInfo.data.userDefaults.langId;
      // const RoleName = nebulaUserInfo.data.userDefaults.roleName;

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        // config.headers.OuId = OuId;
        // config.headers.LangId = LangId;
        // config.headers.RoleName = RoleName;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor for handling token refresh
  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const refreshToken = tokenManager.getRefreshToken();

          // const nebulaUserInfo = JSON.parse(localStorage.getItem('nebulaUserInfo'));
          // const OuId = nebulaUserInfo.data.userDefaults.ouId;
          // const LangId = nebulaUserInfo.data.userDefaults.langId;
          // const RoleName = nebulaUserInfo.data.userDefaults.roleName;

          if (refreshToken) {
            const response = await axios.post(`${API_CONFIG.BASE_URL}/auth/refresh`, {
              refreshToken,
            });

            const { accessToken, refreshToken: newRefreshToken } = response.data;
            tokenManager.setTokens(accessToken, newRefreshToken);

            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            // originalRequest.headers.OuId = OuId;
            // originalRequest.headers.LangId = LangId;
            // originalRequest.headers.RoleName = RoleName;
            return client(originalRequest);
          }
        } catch (refreshError) {
          // Refresh failed, redirect to login
          tokenManager.clearTokens();
          window.location.href = '/login';
        }
      }

      return Promise.reject(error);
    }
  );

  return client;
};

export const apiClient = createApiClient();
export { TokenManager };
