function getBaseUrl() {
  if (
    window.location.hostname.indexOf('localhost') > -1 &&
    window.location.port == '3000'
  ) {
    return 'http://localhost:3000';
  }
  return `${window.location.protocol}//${window.location.host}`;
}

function getAppUrl() {
  return getBaseUrl();
}

function getMockApiUrl() {
  if (window.location.host.indexOf('localhost') > -1) {
    return 'http://localhost:3000';
  }
  return `${getBaseUrl()}/coregwops/mock`;
}

function getGatewayUrl() {
  if (window.location.host.indexOf('localhost') > -1) {
    return 'http://hcmwarcnv75.ramco';
  } else if (window.location.host.indexOf('hcmwarcnv75') > -1) {
    return 'http://hcmwarcnv75.ramco';
  } else if (window.location.host.indexOf('hrpsaasdemo.ramcouat.com') > -1) {
    if (window.location.port) {
      return 'https://hrpsaasdemo.ramcouat.com' + ':' + window.location.port;
    } else {
      return 'https://hrpsaasdemo.ramcouat.com';
    }
  } else if (window.location.host.indexOf('hrpmodern.ramcouat.com') > -1) {
    if (window.location.port) {
      return 'https://hrpmodern.ramcouat.com' + ':' + window.location.port;
    } else {
      return 'https://hrpmodern.ramcouat.com';
    }
  } else {
    return `${getBaseUrl()}`;
  }
  return getBaseUrl();
}

const _AppSettings = {
  REACT_APP_BASE_APP_URL: getAppUrl(),
  REACT_APP_MOCK_API_URL: getMockApiUrl(),
  REACT_APP_API_URL: `${getGatewayUrl()}/coreapiops`,
  REACT_APP_RIDS_AUTH_URL: `${getGatewayUrl()}/coresecurityops`,
  REACT_APP_RIDS_AUTHORIZE_CLIENT_ID: 'com.ramco.nebula.clients',
  REACT_APP_BACKEND_MODE: 'both',
  REACT_APP_RIDS_AUTHORIZE_SCOPE: 'openid rvw_impersonate offline_access',
  REACT_APP_OPENREPLAY_KEY: 'rEbvxU9Fowung1KtwjZk',
  REACT_APP_OPENREPLAY_INGEST_POINT: 'https://analytics.ramcouat.com/ingest',
  REACT_APP_ENABLE_LOGGING: true,
};
