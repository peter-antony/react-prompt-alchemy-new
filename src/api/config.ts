const REACT_APP_API_URL = "https://c5x9m1w2-3001.inc1.devtunnels.ms/coreapiops/v1";
// const REACT_APP_API_URL = "http://ebswarcnv29.pearl.com/coreapiops/v1";

const token: any = localStorage.getItem("token");

export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || REACT_APP_API_URL,
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  HEADERS: {
    Authorization: `Bearer ${token?.access_token}`,
    Accept: "application/json",
    "Content-Type": "application/json",
    "context-lang-id": 1,
    "context-ou-id": 4,
    "context-role-name": "RAMCOROLE",
  },
} as const;

export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: "/auth/login",
    REFRESH: "/auth/refresh",
    LOGOUT: "/auth/logout",
    PROFILE: "/auth/profile",
  },
  // Trip management
  TRIPS: {
    LIST: "/triplog/hubsearch",
    CREATE: "/trips",
    UPDATE: (id: string) => `/trips/${id}`,
    DELETE: (id: string) => `/trips/${id}`,
    APPROVE: (id: string) => `/trips/${id}/approve`,
  },
  // Quick Order management
  QUICK_ORDERS: {
    LIST: "/quickorderhub/search",
    CREATE: "/quick-orders",
    UPDATE: (id: string) => `/quick-orders/${id}`,
    DELETE: (id: string) => `/quick-orders/${id}`,
    APPROVE: (id: string) => `/quick-orders/${id}/approve`,
    COMMON: "/common",
    COMBO: "/common/combo",
    SCREEN_FETCH: '/quickorderhub/screenfetch',
    ORDERFORM: "/quickorderhub/update",
    QUICKORDER_GET:"/quickorder/getdata"
  },
  // Invoice management
  INVOICES: {
    LIST: "/invoices",
    CREATE: "/invoices",
    UPDATE: (id: string) => `/invoices/${id}`,
    DELETE: (id: string) => `/invoices/${id}`,
  },
  // Filter presets
  FILTERS: {
    LIST: (userId: string, gridId: string) =>
      `/users/${userId}/filters/${gridId}`,
    SAVE: (userId: string) => `/users/${userId}/filters`,
    UPDATE: (filterId: string) => `/filters/${filterId}`,
    DELETE: (filterId: string) => `/filters/${filterId}`,
  },
  // Grid preferences
  PREFERENCES: {
    GET: (userId: string, gridId: string) =>
      `/users/${userId}/preferences/${gridId}`,
    SAVE: (userId: string, gridId: string) =>
      `/users/${userId}/preferences/${gridId}`,
  },
} as const;

export const ROUTES = {
  HOME: "/",
  DASHBOARD: "/dashboard",
  TRIP_EXECUTION: "/trip-execution",
  SIGNIN: "/signin",
  SIGNOUT: "/signout",
  OAUTH_CALLBACK: "/callback",
} as const;
