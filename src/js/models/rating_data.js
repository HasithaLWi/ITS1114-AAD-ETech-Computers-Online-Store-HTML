// ============================================================
//  rating_data.js — Product Ratings & Text Reviews Data Model
// ============================================================
import { getStoredProducts, saveStoredProducts } from './data.js';
import { runAutoBadgeAssignment, recordProductBehaviorEvent } from './taxonomy_data.js';

const REVIEWS_STORAGE_KEY = 'etech_product_reviews';

/**
 * Default Seed Reviews Dataset (Text-only, no images, structured for SQL table 'product_reviews')
 * Schema:
 * - id: string (Primary Key, e.g. 'REV-10001')
 * - productId: number (Foreign Key -> products.id)
 * - userId: string (Foreign Key -> users.id)
 * - userName: string
 * - userEmail: string
 * - rating: number (1 to 5)
 * - comment: string (Customer text review)
 * - createdAt: string (ISO Timestamp)
 * - updatedAt: string (ISO Timestamp)
 */
export const defaultReviews = [
  {
    id: 'REV-10001',
    productId: 1,
    userId: 'USR-100001',
    userName: 'System Admin',
    userEmail: 'admin@etech.com',
    rating: 5,
    comment: 'Exceptional build quality and thermal management. The 240Hz Mini-LED display is breathtaking for rendering and competitive gaming. Easily the best laptop in this segment.',
    createdAt: '2026-02-10T10:30:00.000Z',
    updatedAt: '2026-02-10T10:30:00.000Z'
  },
  {
    id: 'REV-10002',
    productId: 1,
    userId: 'USR-100002',
    userName: 'Galle Operations Staff',
    userEmail: 'staff@etech.com',
    rating: 5,
    comment: 'Benchmarked the RTX 4090 with Cyberpunk 2077 with full ray tracing at native QHD+. Consistent 110+ FPS with whisper-quiet vapor chamber fans. Highly recommended!',
    createdAt: '2026-02-12T14:15:00.000Z',
    updatedAt: '2026-02-12T14:15:00.000Z'
  },
  {
    id: 'REV-10003',
    productId: 2,
    userId: 'USR-100001',
    userName: 'System Admin',
    userEmail: 'admin@etech.com',
    rating: 5,
    comment: 'Solid aluminum frame with zero flex. The hot-swappable switches feel remarkably smooth with pre-lubed stabilizers. Fantastic tactile feedback.',
    createdAt: '2026-02-14T09:00:00.000Z',
    updatedAt: '2026-02-14T09:00:00.000Z'
  },
  {
    id: 'REV-10004',
    productId: 3,
    userId: 'USR-100002',
    userName: 'Galle Operations Staff',
    userEmail: 'staff@etech.com',
    rating: 4,
    comment: 'QD-OLED panel delivers true inky blacks and vibrant color accuracy. Perfect for dual workstation setup and simulation gaming.',
    createdAt: '2026-02-15T11:45:00.000Z',
    updatedAt: '2026-02-15T11:45:00.000Z'
  },
  {
    id: 'REV-10005',
    productId: 4,
    userId: 'USR-100001',
    userName: 'System Admin',
    userEmail: 'admin@etech.com',
    rating: 5,
    comment: 'Unmatched 4K rasterization performance. Thermal dissipation stays under 65C during heavy stress test benchmarks.',
    createdAt: '2026-02-16T16:20:00.000Z',
    updatedAt: '2026-02-16T16:20:00.000Z'
  },
  {
    id: 'REV-10006',
    productId: 5,
    userId: 'USR-100002',
    userName: 'Galle Operations Staff',
    userEmail: 'staff@etech.com',
    rating: 5,
    comment: 'High grade memory chips with clean XMP 3.0 profile support. Rock solid stability on modern Z790 motherboards.',
    createdAt: '2026-02-17T08:10:00.000Z',
    updatedAt: '2026-02-17T08:10:00.000Z'
  }
];

/**
 * Retrieve all reviews from localStorage (or seed defaults)
 */
export function getAllReviews() {
  const data = localStorage.getItem(REVIEWS_STORAGE_KEY);
  if (!data) {
    localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(defaultReviews));
    return defaultReviews;
  }
  try {
    return JSON.parse(data);
  } catch (err) {
    console.error('Error parsing stored reviews:', err);
    return defaultReviews;
  }
}

// Alias for backward compatibility
export const getAllRatings = getAllReviews;

/**
 * Save reviews list to localStorage
 */
export function saveAllReviews(reviews) {
  localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(reviews));
}

// Alias for backward compatibility
export const saveAllRatings = saveAllReviews;

/**
 * Get all reviews for a specific product, sorted newest first
 */
export function getProductReviews(productId) {
  const pId = Number(productId);
  const all = getAllReviews();
  return all
    .filter(r => Number(r.productId) === pId)
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
}

// Alias for backward compatibility
export const getProductRatings = getProductReviews;

/**
 * Get a specific user's review for a product (if exists)
 */
export function getUserReviewForProduct(productId, userId) {
  if (!userId) return null;
  const pId = Number(productId);
  const all = getAllReviews();
  return all.find(r => Number(r.productId) === pId && r.userId === userId) || null;
}

// Alias for backward compatibility
export const getUserRatingForProduct = getUserReviewForProduct;

/**
 * Check if a user has already reviewed/rated a product
 */
export function hasUserReviewedProduct(productId, userId) {
  return getUserReviewForProduct(productId, userId) !== null;
}

// Alias for backward compatibility
export const hasUserRatedProduct = hasUserReviewedProduct;

/**
 * Submit or override a product review + rating by a registered user.
 * Recalculates product aggregate rating, review count, behavior history, and auto badge rules.
 *
 * @param {Object} payload
 * @param {number} payload.productId
 * @param {string} payload.userId
 * @param {string} payload.userName
 * @param {string} payload.userEmail
 * @param {number} payload.rating (1 - 5)
 * @param {string} payload.comment (text-only customer review)
 * @returns {Object} { success: boolean, isOverride: boolean, reviewRecord: Object, product: Object, message: string }
 */
export function submitProductReview({ productId, userId, userName, userEmail, rating, comment = '' }) {
  const pId = Number(productId);
  const ratingNum = Math.max(1, Math.min(5, Math.round(Number(rating || 5))));
  const cleanComment = (comment || '').trim();

  if (!pId || !userId) {
    return { success: false, message: 'Authentication is required to review products.' };
  }

  const allReviews = getAllReviews();
  const existingIndex = allReviews.findIndex(r => Number(r.productId) === pId && r.userId === userId);
  const isOverride = existingIndex !== -1;
  const oldRatingVal = isOverride ? allReviews[existingIndex].rating : null;
  const nowIso = new Date().toISOString();

  let reviewRecord;

  if (isOverride) {
    // Update / override existing review
    allReviews[existingIndex] = {
      ...allReviews[existingIndex],
      rating: ratingNum,
      comment: cleanComment || allReviews[existingIndex].comment || '',
      userName: userName || allReviews[existingIndex].userName,
      userEmail: userEmail || allReviews[existingIndex].userEmail,
      updatedAt: nowIso
    };
    reviewRecord = allReviews[existingIndex];
  } else {
    // Insert new review
    reviewRecord = {
      id: 'REV-' + Math.floor(10000 + Math.random() * 90000),
      productId: pId,
      userId: userId,
      userName: userName || 'Customer',
      userEmail: userEmail || '',
      rating: ratingNum,
      comment: cleanComment,
      createdAt: nowIso,
      updatedAt: nowIso
    };
    allReviews.unshift(reviewRecord);
  }

  // Persist reviews dataset
  saveAllReviews(allReviews);

  // Recalculate product aggregate rating & review count in inventory
  const products = getStoredProducts();
  const product = products.find(p => Number(p.id) === pId);

  if (product) {
    const currentProductRating = Number(product.rating || 5.0);
    const currentReviewsCount = Number(product.reviews || 1);

    let newAvgRating;
    let newReviewsCount;

    if (isOverride) {
      // Override: review count stays constant, average adjusts by delta
      newReviewsCount = currentReviewsCount;
      const totalPoints = (currentProductRating * currentReviewsCount) - oldRatingVal + ratingNum;
      newAvgRating = Math.max(1, Math.min(5, Math.round((totalPoints / Math.max(1, newReviewsCount)) * 10) / 10));
    } else {
      // New review: review count increments, average updates
      newReviewsCount = currentReviewsCount + 1;
      const totalPoints = (currentProductRating * currentReviewsCount) + ratingNum;
      newAvgRating = Math.max(1, Math.min(5, Math.round((totalPoints / newReviewsCount) * 10) / 10));
    }

    product.rating = newAvgRating;
    product.reviews = newReviewsCount;
    saveStoredProducts(products);

    // Record Behavior Event Audit Trail
    try {
      recordProductBehaviorEvent({
        productId: product.id,
        productName: product.name,
        eventType: isOverride ? 'REVIEW_OVERRIDDEN' : 'PRODUCT_REVIEWED',
        previousValue: isOverride ? `${oldRatingVal} ★ (Avg: ${currentProductRating})` : `Avg: ${currentProductRating}`,
        newValue: `${ratingNum} ★ (New Avg: ${newAvgRating}, ${newReviewsCount} reviews)`,
        triggerReason: `Customer ${userName || userId} ${isOverride ? 'updated' : 'posted'} review: "${cleanComment ? cleanComment.slice(0, 50) + '...' : `${ratingNum} Stars`}"`,
        metricsSnapshot: {
          rating: newAvgRating,
          reviews: newReviewsCount,
          price: product.price,
          totalStock: product.branchStock ? Object.values(product.branchStock).reduce((a, b) => a + b, 0) : 10
        },
        actor: userName || userId
      });
    } catch (e) {
      console.warn('Behavior event logging failed:', e);
    }

    // Trigger Automated Badge Assignment Engine
    try {
      runAutoBadgeAssignment();
    } catch (e) {
      console.warn('Auto badge assignment trigger failed:', e);
    }

    return {
      success: true,
      isOverride,
      reviewRecord,
      ratingRecord: reviewRecord,
      product,
      message: isOverride 
        ? `Your review & rating have been updated (${ratingNum} ★)!` 
        : `Thank you for your review (${ratingNum} ★)!`
    };
  }

  return {
    success: true,
    isOverride,
    reviewRecord,
    ratingRecord: reviewRecord,
    product: null,
    message: `Review saved successfully.`
  };
}

// Alias for backward compatibility
export const submitProductRating = submitProductReview;
