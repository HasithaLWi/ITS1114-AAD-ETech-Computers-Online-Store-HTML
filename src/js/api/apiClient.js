// ============================================================
//  src/js/api/apiClient.js — Centralized jQuery AJAX API Client
// ============================================================

export const API_BASE_URL = window.API_BASE_URL || 'http://localhost:8080/api/v1';
export const TOKEN_STORAGE_KEY = 'etech_jwt_token';
export const CURRENT_USER_STORAGE_KEY = 'etech_current_user';

/**
 * Retrieve active JWT Bearer Token from localStorage
 * @returns {string|null}
 */
export function getToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

/**
 * Persist JWT Bearer Token into localStorage
 * @param {string} token
 */
export function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  }
}

/**
 * Clear JWT Bearer Token from localStorage
 */
export function removeToken() {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

/**
 * Centralized jQuery AJAX Request Handler
 * Standardizes authentication headers, payload serialization, and error parsing.
 * 
 * @param {object} options
 * @param {string} options.endpoint - Endpoint path relative to API_BASE_URL (e.g. '/auth/login')
 * @param {string} [options.method='GET'] - HTTP method (GET, POST, PUT, PATCH, DELETE)
 * @param {object|null} [options.data=null] - Request payload or query parameters
 * @param {object} [options.headers={}] - Additional custom headers
 * @returns {Promise<any>}
 */
export function ajaxRequest({ endpoint, method = 'GET', data = null, headers = {} }) {
  return new Promise((resolve, reject) => {
    const $ = window.jQuery || window.$;

    if (!$) {
      return reject(new Error('jQuery is not loaded. Please ensure jQuery script is included.'));
    }

    const token = getToken();
    const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;

    const ajaxConfig = {
      url: url,
      type: method.toUpperCase(),
      dataType: 'json',
      contentType: 'application/json; charset=utf-8',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...headers
      },
      success: (response) => {
        resolve(response);
      },
      error: (xhr, status, error) => {
        let errorMessage = 'Network error or server unavailable. Please try again.';

        if (xhr.status === 401) {
          removeToken();
          localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
          errorMessage = xhr.responseJSON?.message || 'Session expired. Please sign in again.';
        } else if (xhr.responseJSON) {
          if (xhr.responseJSON.message) {
            errorMessage = xhr.responseJSON.message;
          } else if (xhr.responseJSON.body && typeof xhr.responseJSON.body === 'object') {
            errorMessage = Object.values(xhr.responseJSON.body).join(', ');
          }
        } else if (xhr.responseText) {
          try {
            const parsed = JSON.parse(xhr.responseText);
            errorMessage = parsed.message || errorMessage;
          } catch (e) {
            errorMessage = xhr.statusText || errorMessage;
          }
        }

        const err = new Error(errorMessage);
        err.status = xhr.status;
        err.responseJSON = xhr.responseJSON;
        reject(err);
      }
    };

    // Serialize data appropriately for HTTP verb
    if (data !== null && data !== undefined) {
      if (['POST', 'PUT', 'PATCH'].includes(ajaxConfig.type)) {
        ajaxConfig.data = typeof data === 'string' ? data : JSON.stringify(data);
      } else if (ajaxConfig.type === 'GET' || ajaxConfig.type === 'DELETE') {
        ajaxConfig.data = data;
      }
    }

    $.ajax(ajaxConfig);
  });
}
