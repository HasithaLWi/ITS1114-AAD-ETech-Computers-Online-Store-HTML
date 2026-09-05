// ============================================================
//  src/js/api/wishlistApi.js — Customer Wishlist Backend API Client
// ============================================================
import { ajaxRequest } from './apiClient.js';

export const WishlistApi = {
  /**
   * Fetch customer's full wishlist items with product details
   * GET /api/v1/wishlist
   */
  async getWishlist() {
    console.log('[WishlistAPI] getWishlist() -> fetching customer wishlist');
    const res = await ajaxRequest({
      endpoint: '/wishlist',
      method: 'GET'
    });
    return res.body || res;
  },

  /**
   * Toggle product in customer wishlist (adds if not present, removes if present)
   * POST /api/v1/wishlist/toggle/{productId}
   */
  async toggleWishlist(productId) {
    console.log('[WishlistAPI] toggleWishlist() -> Product ID:', productId);
    return ajaxRequest({
      endpoint: `/wishlist/toggle/${encodeURIComponent(productId)}`,
      method: 'POST'
    });
  },

  /**
   * Explicitly add product to wishlist
   * POST /api/v1/wishlist/add/{productId}
   */
  async addToWishlist(productId) {
    console.log('[WishlistAPI] addToWishlist() -> Product ID:', productId);
    return ajaxRequest({
      endpoint: `/wishlist/add/${encodeURIComponent(productId)}`,
      method: 'POST'
    });
  },

  /**
   * Remove single product from customer wishlist
   * DELETE /api/v1/wishlist/remove/{productId}
   */
  async removeFromWishlist(productId) {
    console.log('[WishlistAPI] removeFromWishlist() -> Product ID:', productId);
    return ajaxRequest({
      endpoint: `/wishlist/remove/${encodeURIComponent(productId)}`,
      method: 'DELETE'
    });
  },

  /**
   * Clear all items in customer wishlist
   * DELETE /api/v1/wishlist/clear
   */
  async clearWishlist() {
    console.log('[WishlistAPI] clearWishlist() -> clearing all wishlist items');
    return ajaxRequest({
      endpoint: '/wishlist/clear',
      method: 'DELETE'
    });
  },

  /**
   * Move item from wishlist to cart
   * POST /api/v1/wishlist/move-to-cart
   */
  async moveToCart(productId, branchId = 'BR-COL', quantity = 1) {
    console.log('[WishlistAPI] moveToCart() -> Product ID:', productId, 'Branch:', branchId, 'Qty:', quantity);
    return ajaxRequest({
      endpoint: '/wishlist/move-to-cart',
      method: 'POST',
      data: { productId, branchId, quantity }
    });
  }
};
