import { apiClient } from '../client';

export interface TokenExchangeParams {
  grant_type?: string;
  client_id?: string;
  code?: string;
  redirect_uri?: string;
  code_verifier?: string;
}

export const authService = {
  exchangeToken: async (params: TokenExchangeParams) => {
    const body = new URLSearchParams(params as Record<string, string>);
    const response = await apiClient.post(
      '/connect/token',
      body.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        transformRequest: [(data) => data], // Prevent axios from serializing again
      }
    );
    return response.data;
  },
};