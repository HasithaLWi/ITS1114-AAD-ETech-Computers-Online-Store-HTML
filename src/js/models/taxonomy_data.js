// ============================================================
//  taxonomy_data.js — Categories, Badges & Product Behavior History Data Model
// ============================================================
import { getStoredProducts, saveStoredProducts } from './data.js';
import {
  DEFAULT_CATEGORIES,
  DEFAULT_BADGES,
  defaultCategories,
  defaultBadges
} from '../../data/taxonomy.js';
import { CategoriesApi } from '../api/categoriesApi.js';
import { BadgesApi } from '../api/badgesApi.js';

export { DEFAULT_CATEGORIES, DEFAULT_BADGES, defaultCategories, defaultBadges };

const CATEGORIES_STORAGE_KEY = 'etech_categories_data';
const BADGES_STORAGE_KEY = 'etech_badges_data';
const BEHAVIOR_HISTORY_STORAGE_KEY = 'etech_product_behavior_history';

// ============================================================
//  1. CATEGORIES MANAGEMENT MODEL
// ============================================================

export function getCategories(options = {}) {
  const { includeDeleted = false, activeOnly = false } = options;
  const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(CATEGORIES_STORAGE_KEY) : null;
  let list = [];

  if (stored) {
    try {
      list = JSON.parse(stored);
      if (!Array.isArray(list)) list = [];
    } catch (e) {
      list = [];
    }
  }

  if (includeDeleted) return list;
  if (activeOnly) return list.filter(c => (c.categoryStatus || c.status || 'ACTIVE').toUpperCase() === 'ACTIVE');
  // Default: exclude soft-deleted categories
  return list.filter(c => (c.categoryStatus || c.status || 'ACTIVE').toUpperCase() !== 'DELETED');
}

/**
 * Sync categories directly from backend REST API
 */
export async function syncCategoriesFromApi(options = {}) {
  try {
    const res = await CategoriesApi.getAll();
    let apiList = [];
    if (Array.isArray(res)) {
      apiList = res;
    } else if (res && Array.isArray(res.data)) {
      apiList = res.data;
    }
    const normalized = apiList.map(c => ({
      id: c.id,
      name: c.name || '',
      slug: c.slug || '',
      icon: c.icon || '🏷️',
      description: c.description || '',
      featured: Boolean(c.featured),
      displayOrder: Number(c.displayOrder || 1),
      categoryStatus: (c.categoryStatus || c.status || 'ACTIVE').toUpperCase(),
      status: (c.categoryStatus || c.status || 'ACTIVE').toUpperCase()
    }));
    saveCategories(normalized);
    return getCategories(options);
  } catch (err) {
    console.warn('[TaxonomyModel] Categories API sync notice:', err.message);
    return getCategories(options);
  }
}

/**
 * Retrieve only deleted categories for SuperADMIN Trash Bin
 */
export function getDeletedCategories() {
  const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(CATEGORIES_STORAGE_KEY) : null;
  if (!stored) return [];
  try {
    const list = JSON.parse(stored);
    if (!Array.isArray(list)) return [];
    return list.filter(c => (c.categoryStatus || c.status || '').toUpperCase() === 'DELETED');
  } catch (e) {
    return [];
  }
}

export function saveCategories(categories) {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
  }
}

export function getCategoryBySlug(slug) {
  if (!slug) return null;
  const categories = getCategories({ includeDeleted: true });
  return categories.find(c => c.slug.toLowerCase() === slug.toLowerCase() || c.id === slug) || null;
}

export async function saveCategory(categoryData, isEdit = false) {
  const categories = getCategories({ includeDeleted: true });
  const slug = (categoryData.slug || categoryData.name || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
  const categoryStatus = (categoryData.categoryStatus || categoryData.status || 'ACTIVE').toUpperCase();

  if (isEdit) {
    const index = categories.findIndex(c => c.id === categoryData.id || c.slug === categoryData.slug);
    if (index !== -1) {
      categories[index] = {
        ...categories[index],
        ...categoryData,
        categoryStatus: categoryStatus,
        status: categoryStatus,
        slug: slug || categories[index].slug
      };
      saveCategories(categories);

      // Async API update
      try {
        await CategoriesApi.update(categories[index].id, categories[index]);
      } catch (err) {
        console.warn('[TaxonomyModel] Backend category update notice:', err.message);
      }

      return categories[index];
    }
  }

  // Create New Category
  const newCat = {
    id: categoryData.id || `cat-${slug || Date.now()}`,
    name: categoryData.name || 'New Category',
    slug: slug || `category-${Math.floor(1000 + Math.random() * 9000)}`,
    icon: categoryData.icon || '🏷️',
    description: categoryData.description || '',
    featured: Boolean(categoryData.featured),
    displayOrder: parseInt(categoryData.displayOrder) || (categories.length + 1),
    categoryStatus: categoryStatus,
    status: categoryStatus
  };

  categories.push(newCat);
  saveCategories(categories);

  // Async API create
  try {
    await CategoriesApi.create(newCat);
  } catch (err) {
    console.warn('[TaxonomyModel] Backend category create notice:', err.message);
  }

  return newCat;
}

/**
 * Update category lifecycle status (ACTIVE, INACTIVE, DELETED)
 */
export async function updateCategoryStatus(idOrSlug, newStatus) {
  const upperStatus = (newStatus || 'ACTIVE').toUpperCase();
  const categories = getCategories({ includeDeleted: true });
  const index = categories.findIndex(c => c.id === idOrSlug || c.slug === idOrSlug);

  if (index !== -1) {
    categories[index].categoryStatus = upperStatus;
    categories[index].status = upperStatus;
    saveCategories(categories);

    try {
      await CategoriesApi.updateStatus(categories[index].id, upperStatus);
    } catch (err) {
      console.warn(`[TaxonomyModel] Backend category status update notice for ${idOrSlug}:`, err.message);
    }

    return { success: true, category: categories[index] };
  }
  return { success: false, message: 'Category not found.' };
}

/**
 * Soft delete category by slug/ID (sets status to DELETED)
 */
export async function deleteCategory(slugOrId) {
  const res = await updateCategoryStatus(slugOrId, 'DELETED');
  try {
    const cat = getCategoryBySlug(slugOrId);
    if (cat) await CategoriesApi.delete(cat.id);
  } catch (err) {
    console.warn(`[TaxonomyModel] Backend category soft-delete notice for ${slugOrId}:`, err.message);
  }
  return res.success;
}

/**
 * Restore soft-deleted category back to ACTIVE
 */
export async function restoreCategory(slugOrId) {
  return await updateCategoryStatus(slugOrId, 'ACTIVE');
}

/**
 * Permanently purge category from storage and backend (SuperADMIN only)
 */
export async function permanentlyDeleteCategory(slugOrId) {
  let categories = getCategories({ includeDeleted: true });
  const target = categories.find(c => c.id === slugOrId || c.slug === slugOrId);
  categories = categories.filter(c => c.id !== slugOrId && c.slug !== slugOrId);
  saveCategories(categories);

  try {
    if (target) await CategoriesApi.permaDelete(target.id);
  } catch (err) {
    console.warn(`[TaxonomyModel] Backend category perma-delete notice for ${slugOrId}:`, err.message);
  }

  return { success: true, category: target };
}

// ============================================================
//  2. BADGES MANAGEMENT MODEL (WITH DYNAMIC THRESHOLDS & STATUS)
// ============================================================

export function getBadges(options = {}) {
  const { includeDeleted = false, activeOnly = false } = options;
  const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(BADGES_STORAGE_KEY) : null;
  let list = [];

  if (stored) {
    try {
      list = JSON.parse(stored);
      if (!Array.isArray(list)) list = [];
    } catch (e) {
      list = [];
    }
  }

  if (includeDeleted) return list;
  if (activeOnly) return list.filter(b => (b.status || (b.isActive !== false ? 'ACTIVE' : 'INACTIVE')).toUpperCase() === 'ACTIVE');
  // Default: exclude soft-deleted badges
  return list.filter(b => (b.status || '').toUpperCase() !== 'DELETED');
}

/**
 * Sync badges directly from backend REST API
 */
export async function syncBadgesFromApi(options = {}) {
  try {
    const res = await BadgesApi.getAll();
    let apiList = [];
    if (Array.isArray(res)) {
      apiList = res;
    } else if (res && Array.isArray(res.data)) {
      apiList = res.data;
    }
    const normalized = apiList.map(b => ({
      id: b.id,
      name: b.name || '',
      slug: b.slug || '',
      badgeType: b.badgeType || 'general',
      description: b.description || '',
      color: b.color || 'blue',
      bgClass: b.bgClass || `bg-${b.color || 'blue'}-50`,
      textClass: b.textClass || `text-${b.color || 'blue'}-700`,
      borderClass: b.borderClass || `border-${b.color || 'blue'}-200`,
      colorHex: b.colorHex || '#2563eb',
      ruleType: b.ruleType || 'automatic',
      isSystemDefault: Boolean(b.isSystemDefault),
      canEdit: b.canEdit !== undefined ? b.canEdit : true,
      canDelete: b.canDelete !== undefined ? b.canDelete : true,
      status: (b.status || (b.isActive !== false ? 'ACTIVE' : 'INACTIVE')).toUpperCase(),
      isActive: (b.status || '').toUpperCase() === 'ACTIVE' || b.isActive === true,
      thresholds: b.thresholds || {}
    }));
    saveBadges(normalized);
    return getBadges(options);
  } catch (err) {
    console.warn('[TaxonomyModel] Badges API sync notice:', err.message);
    return getBadges(options);
  }
}

/**
 * Retrieve only deleted badges for SuperADMIN Trash Bin
 */
export function getDeletedBadges() {
  const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(BADGES_STORAGE_KEY) : null;
  if (!stored) return [];
  try {
    const list = JSON.parse(stored);
    if (!Array.isArray(list)) return [];
    return list.filter(b => (b.status || '').toUpperCase() === 'DELETED');
  } catch (e) {
    return [];
  }
}

export function saveBadges(badges) {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(BADGES_STORAGE_KEY, JSON.stringify(badges));
  }
}

export function getBadgeById(id) {
  const badges = getBadges({ includeDeleted: true });
  return badges.find(b => b.id === id || b.slug === id || b.name.toLowerCase() === id.toLowerCase()) || null;
}

export async function saveBadge(badgeData, isEdit = false) {
  const badges = getBadges({ includeDeleted: true });
  const slug = (badgeData.slug || badgeData.name || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
  const thresholds = badgeData.thresholds || {};
  const status = (badgeData.status || (badgeData.isActive !== false ? 'ACTIVE' : 'INACTIVE')).toUpperCase();

  // Protect Hot Deal from being modified
  if ((badgeData.id === 'bdg-hotdeal' || slug === 'hotdeal' || slug === 'hot-deal' || badgeData.canEdit === false) && isEdit) {
    console.warn('Hot Deal is a protected system badge and cannot be modified.');
    return badges.find(b => b.id === 'bdg-hotdeal') || badgeData;
  }

  if (isEdit) {
    const index = badges.findIndex(b => b.id === badgeData.id || b.slug === badgeData.slug);
    if (index !== -1) {
      if (badges[index].canEdit === false || badges[index].id === 'bdg-hotdeal') {
        console.warn('Attempted to edit a non-editable system badge.');
        return badges[index];
      }
      const existing = badges[index];
      badges[index] = {
        ...existing,
        ...badgeData,
        status: status,
        isActive: status === 'ACTIVE',
        isSystemDefault: existing.isSystemDefault,
        canDelete: existing.canDelete,
        canEdit: existing.canEdit,
        thresholds: {
          ...(existing.thresholds || {}),
          ...thresholds
        },
        slug: slug || existing.slug
      };
      saveBadges(badges);

      try {
        await BadgesApi.update(badges[index].id, badges[index]);
      } catch (err) {
        console.warn('[TaxonomyModel] Backend badge update notice:', err.message);
      }

      return badges[index];
    }
  }

  // Create New Badge
  const newBadge = {
    id: badgeData.id || `bdg-${slug || Date.now()}`,
    name: badgeData.name || 'New Badge',
    slug: slug || `badge-${Math.floor(1000 + Math.random() * 9000)}`,
    color: badgeData.color || 'blue',
    colorHex: badgeData.colorHex || '#2563eb',
    bgClass: badgeData.bgClass || `bg-${badgeData.color || 'blue'}-50`,
    textClass: badgeData.textClass || `text-${badgeData.color || 'blue'}-700`,
    borderClass: badgeData.borderClass || `border-${badgeData.color || 'blue'}-200`,
    purpose: badgeData.purpose || '',
    standardDescription: badgeData.standardDescription || 'Custom standard criterion',
    ruleType: badgeData.ruleType || 'manual',
    criteria: badgeData.criteria || 'custom',
    thresholds: thresholds,
    priority: parseInt(badgeData.priority) || 10,
    status: status,
    isActive: status === 'ACTIVE',
    isSystemDefault: false,
    canEdit: true,
    canDelete: true
  };

  badges.push(newBadge);
  saveBadges(badges);

  try {
    await BadgesApi.create(newBadge);
  } catch (err) {
    console.warn('[TaxonomyModel] Backend badge create notice:', err.message);
  }

  return newBadge;
}

/**
 * Update badge lifecycle status (ACTIVE, INACTIVE, DELETED)
 */
export async function updateBadgeStatus(badgeId, newStatus) {
  const upperStatus = (newStatus || 'ACTIVE').toUpperCase();
  const badges = getBadges({ includeDeleted: true });
  const index = badges.findIndex(b => b.id === badgeId || b.slug === badgeId);

  if (index !== -1) {
    badges[index].status = upperStatus;
    badges[index].isActive = upperStatus === 'ACTIVE';
    saveBadges(badges);

    try {
      await BadgesApi.updateStatus(badges[index].id, upperStatus);
    } catch (err) {
      console.warn(`[TaxonomyModel] Backend badge status update notice for ${badgeId}:`, err.message);
    }

    return { success: true, badge: badges[index] };
  }
  return { success: false, message: 'Badge not found.' };
}

/**
 * Soft delete badge by ID (sets status to DELETED)
 */
export async function deleteBadge(badgeId) {
  const badges = getBadges({ includeDeleted: true });
  const target = badges.find(b => b.id === badgeId || b.slug === badgeId);

  if (target && (target.canDelete === false || target.isSystemDefault || target.id === 'bdg-hotdeal')) {
    console.warn('Cannot delete core system protected badge:', target.name);
    return false;
  }

  const res = await updateBadgeStatus(badgeId, 'DELETED');
  try {
    if (target) await BadgesApi.delete(target.id);
  } catch (err) {
    console.warn(`[TaxonomyModel] Backend badge soft-delete notice for ${badgeId}:`, err.message);
  }
  return res.success;
}

/**
 * Restore soft-deleted badge back to ACTIVE status
 */
export async function restoreBadge(badgeId) {
  return await updateBadgeStatus(badgeId, 'ACTIVE');
}

/**
 * Permanently delete badge from storage and database (SuperADMIN only)
 */
export async function permanentlyDeleteBadge(badgeId) {
  let badges = getBadges({ includeDeleted: true });
  const target = badges.find(b => b.id === badgeId || b.slug === badgeId);
  badges = badges.filter(b => b.id !== badgeId && b.slug !== badgeId);
  saveBadges(badges);

  try {
    if (target) await BadgesApi.permaDelete(target.id);
  } catch (err) {
    console.warn(`[TaxonomyModel] Backend badge perma-delete notice for ${badgeId}:`, err.message);
  }

  return { success: true, badge: target };
}

/**
 * Generates a human-readable summary of the active rule thresholds for a badge
 */
export function getBadgeThresholdSummary(badge) {
  if (!badge) return 'No criteria specified';
  if (badge.id === 'bdg-hotdeal' || badge.ruleType === 'system' || badge.criteria === 'system_hot_deal') {
    return 'Managed via Hot Deals & Promotions Module';
  }
  if (badge.ruleType !== 'automatic') {
    return badge.standardDescription || 'Manual Staff Assignment';
  }

  const t = badge.thresholds || {};
  switch (badge.criteria) {
    case 'discount_gte_10': {
      const val = t.discountPct !== undefined ? t.discountPct : 10;
      return `Discount ≥ ${val}% off MSRP`;
    }
    case 'rating_gte_48': {
      const minR = t.minRating !== undefined ? t.minRating : 4.8;
      const minRev = t.minReviews !== undefined ? t.minReviews : 50;
      return `Rating ≥ ${minR} / 5.0 (Reviews ≥ ${minRev})`;
    }
    case 'bestseller': {
      const minRev = t.minReviews !== undefined ? t.minReviews : 80;
      return `Sales Champion (Reviews ≥ ${minRev})`;
    }
    case 'reviews_gte_40': {
      const minRev = t.minReviews !== undefined ? t.minReviews : 40;
      return `High Popularity (Reviews ≥ ${minRev})`;
    }
    case 'low_stock_scarcity': {
      const maxSt = t.maxStock !== undefined ? t.maxStock : 5;
      return `Urgent Scarcity (Stock ≤ ${maxSt} units)`;
    }
    case 'new_arrival':
      return `Recent Catalog Intake`;
    default:
      return badge.standardDescription || 'Automated rule';
  }
}

// ============================================================
//  3. PRODUCT BEHAVIOR HISTORY DATA STORE (AUDIT LOGS)
// ============================================================

export function getProductBehaviorHistory() {
  const stored = localStorage.getItem(BEHAVIOR_HISTORY_STORAGE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error('Failed to parse product behavior history:', e);
    return [];
  }
}

export function recordProductBehaviorEvent(eventData) {
  const history = getProductBehaviorHistory();
  const event = {
    id: `pbe-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    productId: eventData.productId,
    productName: eventData.productName || 'Unknown Product',
    eventType: eventData.eventType || 'STANDARD_REACHED',
    previousValue: eventData.previousValue || '',
    newValue: eventData.newValue || '',
    triggerReason: eventData.triggerReason || 'Standard behavioral rule threshold satisfied.',
    metricsSnapshot: eventData.metricsSnapshot || {},
    actor: eventData.actor || 'SYSTEM_AUTO_RULE',
    timestamp: new Date().toISOString()
  };

  history.unshift(event);
  if (history.length > 500) history.pop();

  localStorage.setItem(BEHAVIOR_HISTORY_STORAGE_KEY, JSON.stringify(history));
  return event;
}

export function getProductHistory(productId) {
  const history = getProductBehaviorHistory();
  return history.filter(h => String(h.productId) === String(productId));
}

export function clearProductBehaviorHistory() {
  localStorage.removeItem(BEHAVIOR_HISTORY_STORAGE_KEY);
  return true;
}

// ============================================================
//  4. AUTOMATED BEHAVIOR & BADGE EVALUATION ENGINE
// ============================================================

export function evaluateBadgeForProduct(product, activeBadges = null) {
  if (!activeBadges) {
    activeBadges = getBadges({ activeOnly: true });
  }

  const sortedBadges = [...activeBadges].sort((a, b) => (b.priority || 0) - (a.priority || 0));

  const price = parseFloat(product.price || 0);
  const origPrice = parseFloat(product.originalPrice || 0);
  const discountPct = origPrice > price ? Math.round(((origPrice - price) / origPrice) * 100) : 0;
  const rating = parseFloat(product.rating || 0);
  const reviews = parseInt(product.reviews || 0);
  const totalStock = parseInt(product.totalStock !== undefined ? product.totalStock : (product.inStock ? 20 : 0));
  const lowStockMargin = parseInt(product.lowStockMargin || 5);

  for (const badge of sortedBadges) {
    if (badge.ruleType !== 'automatic') continue;
    const t = badge.thresholds || {};

    if (badge.criteria === 'discount_gte_10') {
      const minDiscount = t.discountPct !== undefined ? parseFloat(t.discountPct) : 10;
      if (discountPct >= minDiscount) {
        return {
          badgeName: badge.name,
          badgeObj: badge,
          reason: `Discount reached ${discountPct}% (>= ${minDiscount}% required).`,
          metrics: { price, origPrice, discountPct, rating, reviews, totalStock }
        };
      }
    }

    if (badge.criteria === 'low_stock_scarcity') {
      const maxStockAllowed = t.maxStock !== undefined ? parseInt(t.maxStock) : lowStockMargin;
      if (totalStock <= maxStockAllowed && totalStock > 0 && product.alertEnabled !== false) {
        return {
          badgeName: badge.name,
          badgeObj: badge,
          reason: `Stock is at ${totalStock} units (<= threshold of ${maxStockAllowed}).`,
          metrics: { price, origPrice, discountPct, rating, reviews, totalStock }
        };
      }
    }

    if (badge.criteria === 'rating_gte_48') {
      const minRatingReq = t.minRating !== undefined ? parseFloat(t.minRating) : 4.8;
      const minReviewsReq = t.minReviews !== undefined ? parseInt(t.minReviews) : 50;
      if (rating >= minRatingReq && reviews >= minReviewsReq) {
        return {
          badgeName: badge.name,
          badgeObj: badge,
          reason: `Rating reached ${rating}/5.0 (>= ${minRatingReq}) with ${reviews} reviews (>= ${minReviewsReq}).`,
          metrics: { price, origPrice, discountPct, rating, reviews, totalStock }
        };
      }
    }

    if (badge.criteria === 'bestseller') {
      const minReviewsReq = t.minReviews !== undefined ? parseInt(t.minReviews) : 80;
      if (reviews >= minReviewsReq) {
        return {
          badgeName: badge.name,
          badgeObj: badge,
          reason: `Review benchmark satisfied (${reviews} reviews >= ${minReviewsReq}).`,
          metrics: { price, origPrice, discountPct, rating, reviews, totalStock }
        };
      }
    }

    if (badge.criteria === 'reviews_gte_40') {
      const minReviewsReq = t.minReviews !== undefined ? parseInt(t.minReviews) : 40;
      if (reviews >= minReviewsReq) {
        return {
          badgeName: badge.name,
          badgeObj: badge,
          reason: `Popular interest benchmark met with ${reviews} reviews (>= ${minReviewsReq}).`,
          metrics: { price, origPrice, discountPct, rating, reviews, totalStock }
        };
      }
    }

    if (badge.criteria === 'new_arrival' && (product.badge === 'New Arrival' || product.isNew)) {
      return {
        badgeName: badge.name,
        badgeObj: badge,
        reason: `Product marked as recent catalog intake.`,
        metrics: { price, origPrice, discountPct, rating, reviews, totalStock }
      };
    }
  }

  const existingBadge = product.badge ? activeBadges.find(b => b.name.toLowerCase() === product.badge.toLowerCase()) : null;
  if (existingBadge && existingBadge.ruleType === 'manual') {
    return {
      badgeName: existingBadge.name,
      badgeObj: existingBadge,
      reason: `Preserved manual specialist assignment: ${existingBadge.name}.`,
      metrics: { price, origPrice, discountPct, rating, reviews, totalStock }
    };
  }

  return {
    badgeName: product.badge || '',
    badgeObj: null,
    reason: 'No automated rule triggered.',
    metrics: { price, origPrice, discountPct, rating, reviews, totalStock }
  };
}

export function runAutoBadgeAssignment() {
  const products = getStoredProducts();
  const activeBadges = getBadges({ activeOnly: true });
  let updatedCount = 0;
  const changes = [];

  products.forEach(p => {
    const evaluation = evaluateBadgeForProduct(p, activeBadges);
    const oldBadge = p.badge || '';
    const newBadge = evaluation.badgeName;

    if (newBadge !== oldBadge) {
      p.badge = newBadge;
      p.badgeId = evaluation.badgeObj ? evaluation.badgeObj.id : '';
      updatedCount++;

      recordProductBehaviorEvent({
        productId: p.id,
        productName: p.name,
        eventType: 'BADGE_AUTO_ASSIGNED',
        previousValue: oldBadge || 'None',
        newValue: newBadge || 'None',
        triggerReason: evaluation.reason,
        metricsSnapshot: evaluation.metrics,
        actor: 'SYSTEM_AUTO_RULE'
      });

      changes.push({
        id: p.id,
        name: p.name,
        oldBadge,
        newBadge,
        reason: evaluation.reason
      });
    }
  });

  if (updatedCount > 0) {
    saveStoredProducts(products);
  }

  return {
    totalEvaluated: products.length,
    updatedCount,
    changes,
    timestamp: new Date().toISOString()
  };
}

export function getBadgeColorClass(color) {
  switch (color) {
    case 'blue':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'rose':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'emerald':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'amber':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'purple':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'cyan':
      return 'bg-cyan-50 text-cyan-700 border-cyan-200';
    case 'orange':
      return 'bg-orange-50 text-orange-700 border-orange-200';
    default:
      return 'bg-blue-50 text-blue-700 border-blue-200';
  }
}
