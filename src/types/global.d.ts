export {};

declare global {
  interface Window {
    AppSettings: {
      REACT_APP_BASE_APP_URL: string;
      REACT_APP_MOCK_API_URL: string;
      REACT_APP_API_URL: string;
      REACT_APP_RIDS_AUTH_URL: string;
      REACT_APP_RIDS_AUTHORIZE_CLIENT_ID: string;
      REACT_APP_BACKEND_MODE: string;
      REACT_APP_RIDS_AUTHORIZE_SCOPE: string;
      REACT_APP_OPENREPLAY_KEY: string;
      REACT_APP_OPENREPLAY_INGEST_POINT: string;
      REACT_APP_ENABLE_LOGGING: boolean;
      REACT_APP_BASE_APP_NAME: string;
    };
  }
}