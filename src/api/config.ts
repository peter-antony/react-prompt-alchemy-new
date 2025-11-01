
// appSettings will be injected during the build or runtime
export const Config = {
  apiUrl: window.AppSettings?.REACT_APP_API_URL,
  baseAppUrl: window.AppSettings?.REACT_APP_BASE_APP_URL || "http://localhost:3000",
  mockApiUrl: window.AppSettings?.REACT_APP_MOCK_API_URL || "",
  loggingEnabled: window.AppSettings?.REACT_APP_ENABLE_LOGGING ?? false,
  openReplayKey: window.AppSettings?.REACT_APP_OPENREPLAY_KEY || "",
  client_id: window.AppSettings?.REACT_APP_RIDS_AUTHORIZE_CLIENT_ID,
  redirect_uri: window.AppSettings?.REACT_APP_BASE_APP_URL + '/' + window.AppSettings?.REACT_APP_BASE_APP_NAME + '/callback',
  response_type: 'code',
  scope: window.AppSettings?.REACT_APP_RIDS_AUTHORIZE_SCOPE,
  response_mode: 'query',
  authUrl: window.AppSettings?.REACT_APP_RIDS_AUTH_URL,
  state: '',

} as const;
// const REACT_APP_API_URL = "https://c5x9m1w2-3001.inc1.devtunnels.ms/coreapiops/v1";
// const REACT_APP_API_URL = "http://192.168.2.17/v1"; // santhanam url
const REACT_APP_API_URL = "http://192.168.2.92/v1"; // Local Dev url
// const REACT_APP_API_URL = "https://forwardis.ramcouat.com/coreapiops/v1"; // UAT url
// const REACT_APP_API_URL = "http://ebswarcnv29.pearl.com/coreapiops/v1"; // Dev url

const token: any = localStorage.getItem("token");
// Function to set user context when user makes selection
export const setUserContext = (ouId: number, roleName: string, ouDescription?: string) => {
  const contextData = {
    ouId,
    roleName,
    ouDescription,
    selectedAt: new Date().toISOString()
  };
  
  localStorage.setItem('selectedUserContext', JSON.stringify(contextData));
  console.log('User context saved to localStorage:', contextData);
};

//User Context Fetch 
export const getUserContext = () => {
  try {
    const selectedContext = localStorage.getItem('selectedUserContext');
    
    if (selectedContext) {
      const parsedContext = JSON.parse(selectedContext);      
      return {
        ouId: parsedContext.ouId || 4,
        roleName: parsedContext.roleName || "RAMCOROLE",
        ouDescription: parsedContext.ouDescription || "",
        userInfo: parsedContext
      };
    }
  } catch (error) {
    console.error('Error retrieving user context from localStorage:', error);
  }
  
  // Default values if nothing is stored
  const defaultContext = {
    ouId: 4, 
    roleName: "RAMCOROLE",
    ouDescription: "Default OU"
  };
  
  return defaultContext;
};

const createHeaders = () => {
  const userContext = getUserContext();
  const parsedToken = token ? JSON.parse(token) : null;
  
  const headers = {
    Authorization: `Bearer ${parsedToken?.access_token}`,
    Accept: "application/json",
    "Content-Type": "application/json",
    "context-lang-id": 1,
    "context-ou-id": userContext.ouId,
    "context-role-name": userContext.roleName,
  };
  
  console.log('API Headers:', headers);
  
  return headers;
};
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || REACT_APP_API_URL,
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  get HEADERS() {
    return createHeaders();
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
  //Context
  Context:{
    CONTEXT: "/me/contexts",
  },
  // Trip management
  TRIPS: {
    LIST: "/triplog/hubsearch",
    CREATE: "/trips",
    BULK_CANCEL: '/triplog/bulkcancel',
    GET_TRIP: "/transportexecution/gettrip",
    SAVE_TRIP: "/transportexecution/savetrip",
    CONFIRM_TRIP: "/transportexecution/confirmtrip",
    CANCEL_TRIP: "/transportexecution/canceltrip",
    AMEND_TRIP: "/transportexecution/amendtrip",
    UPDATE: (id: string) => `/trips/${id}`,
    DELETE: (id: string) => `/trips/${id}`,
    APPROVE: (id: string) => `/trips/${id}/approve`,
    GET_VAS: "/transportexecution/getvasfromtrip",
    GET_INCIDENT: "/transportexecution/common",
    SAVE_VAS: "/transportexecution/savevas",
    SAVE_INCIDENT: "/transportexecution/common",
    CREATE_TRIP_CO:"/tripplanexecution/createtripplan",
    ROUTE_UPDATE: "manageexecution/planhubsearch",
    CO_SELECTION: "manageexecution/planhubselection",
    UPDATE_SELECTION: "manageexecution/planhubupdate",
    TRIP_LEG_LEVEL_UPDATE: "manageexecution/plantriplevelupdate"
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
    QUICKORDER_GET:"/quickorder/getdata",
    LINKEDORDERS_GET:"/quickorder/showlinked",
    UPLOADFILES: "/fileupload/update",
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
