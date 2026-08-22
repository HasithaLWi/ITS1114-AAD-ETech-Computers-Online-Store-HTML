// ============================================================
//  rating_data.js — Product Ratings & Text Reviews Data Model
// ============================================================
import { getStoredProducts, saveStoredProducts } from './data.js';
import { runAutoBadgeAssignment, recordProductBehaviorEvent } from './taxonomy_data.js';
import {
  DEFAULT_REVIEWS,
  DEFAULT_RATINGS,
  defaultReviews,
  defaultRatings
} from '../../data/ratings_reviews.js';

export { DEFAULT_REVIEWS, DEFAULT_RATINGS, defaultReviews, defaultRatings };

const REVIEWS_STORAGE_KEY = 'etech_product_reviews';

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
