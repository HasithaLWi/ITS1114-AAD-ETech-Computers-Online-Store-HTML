// ============================================================
//  src/js/api/userApi.js — User & Authentication Backend API Client
// ============================================================
import { ajaxRequest } from './apiClient.js';

export const AuthApi = {
  /**
   * Authenticate user credentials and retrieve JWT token + sanitized profile
   * POST /api/v1/auth/login
   * 
   * @param {string} username - Username or email
   * @param {string} password - Account password
   * @returns {Promise<{token: string, user: object}>}
   */
  async login(username, password) {
    return ajaxRequest({
      endpoint: '/auth/login',
      method: 'POST',
      data: {
        username: (username || '').trim(),
        password: password
      }
    });
  },

  /**
   * Register a new customer storefront user
   * POST /api/v1/auth/register
   * 
   * @param {object} param0
   * @param {string} param0.name - Full name
   * @param {string} param0.username - Unique alphanumeric username
   * @param {string} param0.email - Unique email address
   * @param {string} param0.password - Account password
   * @returns {Promise<{token: string, user: object}>}
   */
  async register({ name, username, email, password }) {
    return ajaxRequest({
      endpoint: '/auth/register',
      method: 'POST',
      data: {
        name: (name || '').trim(),
        username: (username || '').trim().toLowerCase(),
        email: (email || '').trim().toLowerCase(),
        password: password
      }
    });
  },

  /**
   * Retrieve currently authenticated user profile from active JWT session
   * GET /api/v1/auth/me
   * 
   * @returns {Promise<object>}
   */
  async getCurrentUser() {
    return ajaxRequest({
      endpoint: '/auth/me',
      method: 'GET'
    });
  }
};

export const UserApi = {
  /**
   * Fetch system user directory with optional filtering (Admin/Superadmin only)
   * GET /api/v1/users
   * 
   * @param {object} [params]
   * @param {string} [params.role] - Filter by role (SUPERADMIN, ADMIN, STAFF, CUSTOMER)
   * @param {string} [params.branch] - Filter by branch ID (BR-COL, BR-GAL, etc.)
   * @param {string} [params.search] - Search keyword (name, username, email)
   * @returns {Promise<Array<object>>}
   */
  async getUsers(params = {}) {
    // Filter out empty params
    const query = {};
    if (params.role) query.role = params.role;
    if (params.branch) query.branch = params.branch;
    if (params.search) query.search = params.search;

    return ajaxRequest({
      endpoint: '/users',
      method: 'GET',
      data: query
    });
  },

  /**
   * Fetch single user record by database ID
   * GET /api/v1/users/{id}
   * 
   * @param {number|string} id
   * @returns {Promise<object>}
   */
  async getUserById(id) {
    return ajaxRequest({
      endpoint: `/users/${encodeURIComponent(id)}`,
      method: 'GET'
    });
  },

  /**
   * Create a new user account (Admin/Superadmin only)
   * POST /api/v1/users
   * 
   * @param {object} userData
   * @param {string} userData.name
   * @param {string} userData.username
   * @param {string} userData.email
   * @param {string} userData.password
   * @param {string} userData.role - Role to assign
   * @param {string|null} [userData.assignedBranch] - Branch ID or null
   * @returns {Promise<object>}
   */
  async createUser(userData) {
    return ajaxRequest({
      endpoint: '/users',
      method: 'POST',
      data: {
        name: (userData.name || '').trim(),
        username: (userData.username || '').trim().toLowerCase(),
        email: (userData.email || '').trim().toLowerCase(),
        password: userData.password,
        role: userData.role || 'CUSTOMER',
        assignedBranch: userData.assignedBranch || null
      }
    });
  },

  /**
   * Update user details and optionally override password
   * PUT /api/v1/users/{id}
   * 
   * @param {number|string} id
   * @param {object} userData
   * @returns {Promise<object>}
   */
  async updateUser(id, userData) {
    const payload = {
      name: (userData.name || '').trim(),
      username: (userData.username || '').trim().toLowerCase(),
      email: (userData.email || '').trim().toLowerCase(),
      role: userData.role,
      assignedBranch: userData.assignedBranch || null
    };

    if (userData.password) {
      payload.password = userData.password;
    }

    return ajaxRequest({
      endpoint: `/users/${encodeURIComponent(id)}`,
      method: 'PUT',
      data: payload
    });
  },

  /**
   * Assign / change a user's system role and branch
   * PATCH /api/v1/users/{id}/role
   * 
   * @param {number|string} id
   * @param {object} param1
   * @param {string} param1.role - New role (SUPERADMIN, ADMIN, STAFF, CUSTOMER)
   * @param {string|null} [param1.assignedBranch] - Optional branch ID
   * @returns {Promise<object>}
   */
  async updateUserRole(id, { role, assignedBranch = null }) {
    return ajaxRequest({
      endpoint: `/users/${encodeURIComponent(id)}/role`,
      method: 'PATCH',
      data: {
        role: role,
        assignedBranch: assignedBranch
      }
    });
  },

  /**
   * Delete user account from system
   * DELETE /api/v1/users/{id}
   * 
   * @param {number|string} id
   * @returns {Promise<{success: boolean, message: string}>}
   */
  async deleteUser(id) {
    return ajaxRequest({
      endpoint: `/users/${encodeURIComponent(id)}`,
      method: 'DELETE'
    });
  },

  /**
   * Update logged-in user's personal profile (Name, Username, Email)
   * PUT /api/v1/users/me/profile
   * 
   * @param {object} param0
   * @param {string} param0.name
   * @param {string} param0.username
   * @param {string} param0.email
   * @returns {Promise<object>}
   */
  async updateSelfProfile({ name, username, email }) {
    return ajaxRequest({
      endpoint: '/users/me/profile',
      method: 'PUT',
      data: {
        name: (name || '').trim(),
        username: (username || '').trim().toLowerCase(),
        email: (email || '').trim().toLowerCase()
      }
    });
  },

  /**
   * Change logged-in user's account password
   * PUT /api/v1/users/me/password
   * 
   * @param {object} param0
   * @param {string} param0.currentPassword
   * @param {string} param0.newPassword
   * @returns {Promise<{success: boolean, message: string}>}
   */
  async changeSelfPassword({ currentPassword, newPassword }) {
    return ajaxRequest({
      endpoint: '/users/me/password',
      method: 'PUT',
      data: {
        currentPassword: currentPassword,
        newPassword: newPassword
      }
    });
  }
};
