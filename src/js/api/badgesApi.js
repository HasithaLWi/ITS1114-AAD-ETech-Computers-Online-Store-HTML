// ============================================================
//  src/js/api/badgesApi.js — Badge & Rules Engine Backend API Client
// ============================================================
import { ajaxRequest } from './apiClient.js';

export const BadgesApi = {
  /**
   * Fetch all non-deleted badges ordered by priority
   * GET /api/v1/badges/all
   */
  async getAll() {
    console.log('[BadgesAPI] getAll() -> fetching all badges');
    const res = await ajaxRequest({
      endpoint: '/badges/all',
      method: 'GET'
    });
    return res.body || res;
  },

  /**
   * Fetch active badges
   * GET /api/v1/badges/active
   */
  async getActive() {
    console.log('[BadgesAPI] getActive() -> fetching active badges');
    const res = await ajaxRequest({
      endpoint: '/badges/active',
      method: 'GET'
    });
    return res.body || res;
  },

  /**
   * Fetch single badge by ID
   * GET /api/v1/badges/{id}
   */
  async getById(id) {
    console.log('[BadgesAPI] getById() -> ID:', id);
    const res = await ajaxRequest({
      endpoint: `/badges/${encodeURIComponent(id)}`,
      method: 'GET'
    });
    return res.body || res;
  },

  /**
   * Fetch single badge by slug
   * GET /api/v1/badges/slug/{slug}
   */
  async getBySlug(slug) {
    console.log('[BadgesAPI] getBySlug() -> slug:', slug);
    const res = await ajaxRequest({
      endpoint: `/badges/slug/${encodeURIComponent(slug)}`,
      method: 'GET'
    });
    return res.body || res;
  },

  /**
   * Fetch single badge by name
   * GET /api/v1/badges/name/{name}
   */
  async getByName(name) {
    console.log('[BadgesAPI] getByName() -> name:', name);
    const res = await ajaxRequest({
      endpoint: `/badges/name/${encodeURIComponent(name)}`,
      method: 'GET'
    });
    return res.body || res;
  },

  /**
   * Filter badges by search keyword
   * GET /api/v1/badges/filter?search={search}
   */
  async filter(search) {
    console.log('[BadgesAPI] filter() -> search:', search);
    const res = await ajaxRequest({
      endpoint: `/badges/filter?search=${encodeURIComponent(search)}`,
      method: 'GET'
    });
    return res.body || res;
  },

  /**
   * Create a new badge tag (Admin/Superadmin)
   * POST /api/v1/badges/create
   */
  async create(badgeData) {
    console.log('[BadgesAPI] create() -> payload:', badgeData);
    return ajaxRequest({
      endpoint: '/badges/create',
      method: 'POST',
      data: badgeData
    });
  },

  /**
   * Update badge properties (Admin/Superadmin)
   * PUT /api/v1/badges/update/{id}
   */
  async update(id, badgeData) {
    console.log('[BadgesAPI] update() -> ID:', id, badgeData);
    return ajaxRequest({
      endpoint: `/badges/update/${encodeURIComponent(id)}`,
      method: 'PUT',
      data: badgeData
    });
  },

  /**
   * Update badge lifecycle status (ACTIVE, INACTIVE, DELETED)
   * PATCH /api/v1/badges/update-status/{id}?status={status}
   */
  async updateStatus(id, status) {
    console.log('[BadgesAPI] updateStatus() -> ID:', id, 'status:', status);
    return ajaxRequest({
      endpoint: `/badges/update-status/${encodeURIComponent(id)}?status=${encodeURIComponent(status)}`,
      method: 'PATCH'
    });
  },

  /**
   * Soft delete badge (enforces canDelete flag)
   * DELETE /api/v1/badges/delete/{id}
   */
  async delete(id) {
    console.log('[BadgesAPI] delete() [Soft Delete] -> ID:', id);
    return ajaxRequest({
      endpoint: `/badges/delete/${encodeURIComponent(id)}`,
      method: 'DELETE'
    });
  },

  /**
   * Permanently delete badge and unlink products (SuperADMIN only)
   * DELETE /api/v1/badges/perma-delete/{id}
   */
  async permaDelete(id) {
    console.log('[BadgesAPI] permaDelete() [Permanent Delete] -> ID:', id);
    return ajaxRequest({
      endpoint: `/badges/perma-delete/${encodeURIComponent(id)}`,
      method: 'DELETE'
    });
  }
};
