// ============================================================
//  src/js/api/apiClient.js — Centralized jQuery AJAX API Client
// ============================================================

export const API_BASE_URL = window.API_BASE_URL || 'http://localhost:8080/api/v1';
export const TOKEN_STORAGE_KEY = 'etech_jwt_token';
export const CURRENT_USER_STORAGE_KEY = 'etech_current_user';

/**
 * Retrieve active JWT Bearer Token from localStorage
 */
export function getToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

/**
 * Persist JWT Bearer Token into localStorage
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
 * Safely sanitizes request/response payload for debug logging (strips passwords, tokens, credentials)
 * @param {any} payload
 * @returns {any}
 */
export function sanitizeForLogging(payload) {
  if (!payload) return payload;
  try {
    let obj = payload;
    if (typeof payload === 'string') {
      try {
        obj = JSON.parse(payload);
      } catch (e) {
        return payload;
      }
    }
    if (typeof obj !== 'object' || obj === null) return obj;

    const SENSITIVE_KEYS = [
      'password', 'currentpassword', 'newpassword', 
      'confirmpassword', 'token', 'jwt', 'secret', 
      'cvv', 'cardnumber'
    ];
    
    if (Array.isArray(obj)) {
      return obj.map(item => sanitizeForLogging(item));
    }

    const sanitized = { ...obj };
    for (const key of Object.keys(sanitized)) {
      if (SENSITIVE_KEYS.includes(key.toLowerCase())) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
        sanitized[key] = sanitizeForLogging(sanitized[key]);
      }
    }
    return sanitized;
  } catch (e) {
    return '[Unserializable Data]';
  }
}

/**
 * Centralized jQuery AJAX Request Handler
 * Standardizes authentication headers, payload serialization, error parsing, and debug logging.
 */
export function ajaxRequest({ endpoint, method = 'GET', data = null, headers = {} }) {
  return new Promise((resolve, reject) => {
    const $ = window.jQuery || window.$;

    if (!$) {
      console.error('[API Client] jQuery is not loaded. Please ensure jQuery script is included.');
      return reject(new Error('jQuery is not loaded. Please ensure jQuery script is included.'));
    }

    const token = getToken();
    const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
    const httpMethod = method.toUpperCase();
    const startTime = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();

    console.log(`%c[API Request] ${httpMethod} ${endpoint}`, 'color: #2563eb; font-weight: bold;', {
      url,
      method: httpMethod,
      hasToken: Boolean(token),
      payload: sanitizeForLogging(data)
    });

    const ajaxConfig = {
      url: url,
      type: httpMethod,
      dataType: 'json',
      contentType: 'application/json; charset=utf-8',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...headers
      },
      success: (response, statusText, xhr) => {
        const endTime = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
        const duration = (endTime - startTime).toFixed(1);
        const statusCode = xhr ? xhr.status : 200;

        console.log(`%c[API Response ${statusCode}] ${httpMethod} ${endpoint} (${duration}ms)`, 'color: #16a34a; font-weight: bold;', sanitizeForLogging(response));
        resolve(response);
      },
      error: (xhr, status, error) => {
        const endTime = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
        const duration = (endTime - startTime).toFixed(1);
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

        console.error(`%c[API Error ${xhr.status || 0}] ${httpMethod} ${endpoint} (${duration}ms)`, 'color: #dc2626; font-weight: bold;', {
          status: xhr.status,
          statusText: xhr.statusText,
          message: errorMessage,
          response: sanitizeForLogging(xhr.responseJSON || xhr.responseText)
        });

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
