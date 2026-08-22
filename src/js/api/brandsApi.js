// ============================================================
//  src/js/api/brandsApi.js — Brands Backend API Service Client
// ============================================================

const API_BASE_URL = window.API_BASE_URL || 'http://localhost:8080/api/v1';

export const BrandsApi = {
  /**
   * Fetch all active hardware brands with optional category filter
   */
  async getAllBrands(activeOnly = true) {
    const res = await fetch(`${API_BASE_URL}/brands?activeOnly=${activeOnly}`);
    if (!res.ok) throw new Error('Failed to fetch brands from API.');
    return res.json();
  },

  /**
   * Fetch featured brands for homepage showcase
   */
  async getFeaturedBrands() {
    const res = await fetch(`${API_BASE_URL}/brands/featured`);
    if (!res.ok) throw new Error('Failed to fetch featured brands from API.');
    return res.json();
  },

  /**
   * Get single brand profile and associated store products
   */
  async getBrandBySlugOrId(slugOrId) {
    const res = await fetch(`${API_BASE_URL}/brands/${encodeURIComponent(slugOrId)}`);
    if (!res.ok) throw new Error('Failed to fetch brand details from API.');
    return res.json();
  },

  /**
   * Create new hardware brand (Admin only)
   */
  async createBrand(brandData, token) {
    const res = await fetch(`${API_BASE_URL}/brands`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(brandData)
    });
    if (!res.ok) throw new Error('Failed to create brand.');
    return res.json();
  },

  /**
   * Update brand profile (Admin only)
   */
  async updateBrand(id, brandData, token) {
    const res = await fetch(`${API_BASE_URL}/brands/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(brandData)
    });
    if (!res.ok) throw new Error('Failed to update brand.');
    return res.json();
  },

  /**
   * Toggle featured status on homepage showcase
   */
  async toggleFeatured(id, featured, token) {
    const res = await fetch(`${API_BASE_URL}/brands/${encodeURIComponent(id)}/featured`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ featured })
    });
    if (!res.ok) throw new Error('Failed to toggle featured status.');
    return res.json();
  },

  /**
   * Delete brand with safety check (Admin only)
   */
  async deleteBrand(id, token) {
    const res = await fetch(`${API_BASE_URL}/brands/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!res.ok) throw new Error('Failed to delete brand.');
    return res.json();
  }
};
