// ============================================================
//  src/js/api/userApi.js — User & Authentication Backend API Client
// ============================================================
import { ajaxRequest } from './apiClient.js';

export const AuthApi = {
  /**
   * Authenticate user credentials and retrieve JWT token + sanitized profile
   * POST /api/v1/auth/login
   */
  async login(username, password) {
    console.log('[UserAPI] AuthApi.login() -> username/email:', (username || '').trim());
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
   */
  async register({ name, username, email, password }) {
    console.log('[UserAPI] AuthApi.register() -> new user:', { 
      name: (name || '').trim(), 
      username: (username || '').trim().toLowerCase(), 
      email: (email || '').trim().toLowerCase() 
    });
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
   */
  async getCurrentUser() {
    console.log('[UserAPI] AuthApi.getCurrentUser() -> verifying active session');
    return ajaxRequest({
      endpoint: '/auth/me',
      method: 'GET'
    });
  }
};

export const UserApi = {
  /**
   * Fetch list of available user roles from database (if supported by backend)
   * GET /api/v1/users/roles
   */
  async getRoles() {
    console.log('[UserAPI] UserApi.getRoles() -> fetching system roles');
    return ajaxRequest({
      endpoint: '/users/roles',
      method: 'GET'
    });
  },

  /**
   * Fetch system user directory with optional filtering (Admin/Superadmin only)
   * GET /api/v1/users
   */
  async getUsers(params = {}) {
    const query = {};
    if (params.role) query.role = params.role;
    if (params.branch) query.branch = params.branch;
    if (params.search) query.search = params.search;

    console.log('[UserAPI] UserApi.getUsers() -> query filters:', query);
    return ajaxRequest({
      endpoint: '/users',
      method: 'GET',
      data: query
    });
  },

  /**
   * Fetch single user record by database ID
   * GET /api/v1/users/{id}
   */
  async getUserById(id) {
    console.log('[UserAPI] UserApi.getUserById() -> user ID:', id);
    return ajaxRequest({
      endpoint: `/users/${encodeURIComponent(id)}`,
      method: 'GET'
    });
  },

  /**
   * Create a new user account (Admin/Superadmin only)
   * POST /api/v1/users
   */
  async createUser(userData) {
    console.log('[UserAPI] UserApi.createUser() -> new user account:', {
      name: (userData.name || '').trim(),
      username: (userData.username || '').trim().toLowerCase(),
      email: (userData.email || '').trim().toLowerCase(),
      role: userData.role || 'CUSTOMER',
      assignedBranch: userData.assignedBranch || null
    });

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
   */
  async updateUser(id, userData) {
    console.log('[UserAPI] UserApi.updateUser() -> ID:', id, {
      name: (userData.name || '').trim(),
      username: (userData.username || '').trim().toLowerCase(),
      email: (userData.email || '').trim().toLowerCase(),
      role: userData.role,
      assignedBranch: userData.assignedBranch || null,
      hasPasswordUpdate: Boolean(userData.password)
    });

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
   */
  async updateUserRole(id, { role, assignedBranch = null }) {
    console.log('[UserAPI] UserApi.updateUserRole() -> ID:', id, { role, assignedBranch });
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
   */
  async deleteUser(id) {
    console.log('[UserAPI] UserApi.deleteUser() -> ID:', id);
    return ajaxRequest({
      endpoint: `/users/${encodeURIComponent(id)}`,
      method: 'DELETE'
    });
  },

  /**
   * Update logged-in user's personal profile (Name, Username, Email)
   * PUT /api/v1/users/me/profile
   */
  async updateSelfProfile({ name, username, email }) {
    console.log('[UserAPI] UserApi.updateSelfProfile() -> profile:', {
      name: (name || '').trim(),
      username: (username || '').trim().toLowerCase(),
      email: (email || '').trim().toLowerCase()
    });

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
   */
  async changeSelfPassword({ currentPassword, newPassword }) {
    console.log('[UserAPI] UserApi.changeSelfPassword() -> password update request');
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

