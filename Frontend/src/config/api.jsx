// API configuration
const API_HOST = window.location.hostname === 'localhost'
    ? 'http://localhost:5000'
    : 'http://api:5000';

export const API_BASE_URL = `${API_HOST}/api/items`;
export const API_LOGIN_URL = `${API_HOST}/api/login`;
export const API_AUTH_STATUS_URL = `${API_HOST}/api/auth/status`;
export const API_EXPORT_URL = `${API_HOST}/api/items/export`;
export const API_IMPORT_URL = `${API_HOST}/api/items/import`;
