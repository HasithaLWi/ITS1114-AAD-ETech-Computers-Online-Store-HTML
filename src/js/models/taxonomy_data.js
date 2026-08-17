// ============================================================
//  taxonomy_data.js — Categories, Badges & Product Behavior History Data Model
// ============================================================
import { getStoredProducts, saveStoredProducts } from './data.js';

const CATEGORIES_STORAGE_KEY = 'etech_categories_data';
const BADGES_STORAGE_KEY = 'etech_badges_data';
const BEHAVIOR_HISTORY_STORAGE_KEY = 'etech_product_behavior_history';

// ── Default Categories Preset ───────────────────────────────
export const defaultCategories = [
  {
    id: 'cat-laptops',
    name: 'Laptops & Notebooks',
    slug: 'laptops',
    icon: '💻',
    description: 'Flagship portable gaming laptops, thin-and-lights & mobile creator workstations.',
    featured: true,
    displayOrder: 1
  },
  {
    id: 'cat-peripherals',
    name: 'Gaming Peripherals',
    slug: 'peripherals',
    icon: '⌨️',
    description: 'Hot-swappable mechanical keyboards, ultra-lightweight mice & spatial audio headsets.',
    featured: true,
    displayOrder: 2
  },
  {
    id: 'cat-monitors',
    name: 'Displays & Monitors',
    slug: 'monitors',
    icon: '🖥️',
    description: 'Curved QD-OLED, 4K UHD, high-refresh 240Hz+ gaming & professional grade displays.',
    featured: true,
    displayOrder: 3
  },
  {
    id: 'cat-components',
    name: 'PC Components',
    slug: 'components',
    icon: '⚙️',
    description: 'Cutting-edge RTX 40-series GPUs, AIO liquid coolers, DDR5 memory & ATX 3.0 power units.',
    featured: true,
    displayOrder: 4
  },
  {
    id: 'cat-accessories',
    name: 'Accessories & Tech',
    slug: 'accessories',
    icon: '🎧',
    description: 'Studio boom arms, RGB desk mats, GaN fast chargers, Thunderbolt docks & cables.',
    featured: false,
    displayOrder: 5
  }
];

// ── Default Badges Preset (with automated standard triggers & customizable thresholds) ─
export const defaultBadges = [
  {
    id: 'bdg-bestseller',
    name: 'Bestseller',
    slug: 'bestseller',
    color: 'blue', // blue, rose, emerald, amber, purple, cyan, orange
    purpose: 'Highlights undisputed customer favorites and top sales volume leaders.',
    standardDescription: 'Automated: High sales volume & customer review count benchmark.',
    ruleType: 'automatic', // 'automatic' | 'manual'
    criteria: 'bestseller',
    thresholds: {
      minReviews: 80
    },
    priority: 10,
    isActive: true
  },
  {
    id: 'bdg-hotdeal',
    name: 'Hot Deal',
    slug: 'hot-deal',
    color: 'rose',
    purpose: 'Draws attention to limited-time steep promotional discounts.',
    standardDescription: 'Automated: Active price markdown reaches required discount percentage.',
    ruleType: 'automatic',
    criteria: 'discount_gte_10',
    thresholds: {
      discountPct: 10
    },
    priority: 20,
    isActive: true
  },
  {
    id: 'bdg-newarrival',
    name: 'New Arrival',
    slug: 'new-arrival',
    color: 'emerald',
    purpose: 'Spotlights newly cataloged hardware and latest generation releases.',
    standardDescription: 'Automated: Inventory item introduced within recent catalog batch.',
    ruleType: 'automatic',
    criteria: 'new_arrival',
    thresholds: {},
    priority: 15,
    isActive: true
  },
  {
    id: 'bdg-toprated',
    name: 'Top Rated',
    slug: 'top-rated',
    color: 'amber',
    purpose: 'Showcases elite customer satisfaction and 5-star verified feedback.',
    standardDescription: 'Automated: Verified rating score and customer review count satisfy benchmark.',
    ruleType: 'automatic',
    criteria: 'rating_gte_48',
    thresholds: {
      minRating: 4.8,
      minReviews: 50
    },
    priority: 18,
    isActive: true
  },
  {
    id: 'bdg-popular',
    name: 'Popular',
    slug: 'popular',
    color: 'cyan',
    purpose: 'Highlights items with high daily traffic and trending interest.',
    standardDescription: 'Automated: Customer review count reaches popularity benchmark.',
    ruleType: 'automatic',
    criteria: 'reviews_gte_40',
    thresholds: {
      minReviews: 40
    },
    priority: 12,
    isActive: true
  },
  {
    id: 'bdg-lowstock',
    name: 'Low Stock Alert',
    slug: 'low-stock-alert',
    color: 'rose',
    purpose: 'Signals urgency to customers and staff due to warehouse inventory scarcity.',
    standardDescription: 'Automated: Total inventory stock ≤ product low-stock threshold margin.',
    ruleType: 'automatic',
    criteria: 'low_stock_scarcity',
    thresholds: {
      maxStock: 5
    },
    priority: 25,
    isActive: true
  },
  {
    id: 'bdg-staffpick',
    name: 'Staff Pick',
    slug: 'staff-pick',
    color: 'purple',
    purpose: 'Curated technical recommendations endorsed by ETech certified engineers.',
    standardDescription: 'Manual: Hand-picked by warehouse technicians and branch administrators.',
    ruleType: 'manual',
    criteria: 'manual_curated',
    thresholds: {},
    priority: 5,
    isActive: true
  },
  {
    id: 'bdg-clearance',
    name: 'Clearance',
    slug: 'clearance',
    color: 'orange',
    purpose: 'Final liquidation inventory at heavily reduced clearance rates.',
    standardDescription: 'Manual: Liquidation batches, open-box or end-of-life catalog lines.',
    ruleType: 'manual',
    criteria: 'manual_clearance',
    thresholds: {},
    priority: 8,
    isActive: true
  }
];

// ============================================================
//  1. CATEGORIES MANAGEMENT MODEL
// ============================================================

export function getCategories() {
  const stored = localStorage.getItem(CATEGORIES_STORAGE_KEY);
  if (!stored) {
    saveCategories(defaultCategories);
    return defaultCategories;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error('Failed to parse categories data:', e);
    return defaultCategories;
  }
}

export function saveCategories(categories) {
  localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
}

export function getCategoryBySlug(slug) {
  if (!slug) return null;
  const categories = getCategories();
  return categories.find(c => c.slug.toLowerCase() === slug.toLowerCase()) || null;
}

export function saveCategory(categoryData, isEdit = false) {
  const categories = getCategories();
  const slug = (categoryData.slug || categoryData.name || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
  
  if (isEdit) {
    const index = categories.findIndex(c => c.id === categoryData.id || c.slug === categoryData.slug);
    if (index !== -1) {
      categories[index] = {
        ...categories[index],
        ...categoryData,
        slug: slug || categories[index].slug
      };
      saveCategories(categories);
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
    displayOrder: parseInt(categoryData.displayOrder) || (categories.length + 1)
  };

  categories.push(newCat);
  saveCategories(categories);
  return newCat;
}

export function deleteCategory(slug) {
  let categories = getCategories();
  categories = categories.filter(c => c.slug !== slug && c.id !== slug);
  saveCategories(categories);
  return true;
}

// ============================================================
//  2. BADGES MANAGEMENT MODEL (WITH DYNAMIC THRESHOLDS)
// ============================================================

export function getBadges() {
  const stored = localStorage.getItem(BADGES_STORAGE_KEY);
  if (!stored) {
    saveBadges(defaultBadges);
    return defaultBadges;
  }
  try {
    const parsed = JSON.parse(stored);
    // Ensure all badges have thresholds object
    return parsed.map(b => ({
      ...b,
      thresholds: b.thresholds || {}
    }));
  } catch (e) {
    console.error('Failed to parse badges data:', e);
    return defaultBadges;
  }
}

export function saveBadges(badges) {
  localStorage.setItem(BADGES_STORAGE_KEY, JSON.stringify(badges));
}

export function getBadgeById(id) {
  const badges = getBadges();
  return badges.find(b => b.id === id || b.slug === id || b.name.toLowerCase() === id.toLowerCase()) || null;
}

export function saveBadge(badgeData, isEdit = false) {
  const badges = getBadges();
  const slug = (badgeData.slug || badgeData.name || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
  const thresholds = badgeData.thresholds || {};

  if (isEdit) {
    const index = badges.findIndex(b => b.id === badgeData.id || b.slug === badgeData.slug);
    if (index !== -1) {
      badges[index] = {
        ...badges[index],
        ...badgeData,
        thresholds: {
          ...(badges[index].thresholds || {}),
          ...thresholds
        },
        slug: slug || badges[index].slug
      };
      saveBadges(badges);
      return badges[index];
    }
  }

  // Create New Badge
  const newBadge = {
    id: badgeData.id || `bdg-${Date.now()}`,
    name: badgeData.name || 'New Badge',
    slug: slug || `badge-${Math.floor(1000 + Math.random() * 9000)}`,
    color: badgeData.color || 'blue',
    purpose: badgeData.purpose || '',
    standardDescription: badgeData.standardDescription || 'Custom standard criterion',
    ruleType: badgeData.ruleType || 'manual',
    criteria: badgeData.criteria || 'custom',
    thresholds: thresholds,
    priority: parseInt(badgeData.priority) || 10,
    isActive: badgeData.isActive !== undefined ? Boolean(badgeData.isActive) : true
  };

  badges.push(newBadge);
  saveBadges(badges);
  return newBadge;
}

export function deleteBadge(badgeId) {
  let badges = getBadges();
  badges = badges.filter(b => b.id !== badgeId && b.slug !== badgeId);
  saveBadges(badges);
  return true;
}

/**
 * Generates a human-readable summary of the active rule thresholds for a badge
 */
export function getBadgeThresholdSummary(badge) {
  if (!badge) return 'No criteria specified';
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

/**
 * Returns all recorded product behavior history entries
 */
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

/**
 * Record a new product behavior event into the audit log
 */
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

  // Prepend to maintain newest first, keep last 500 events
  history.unshift(event);
  if (history.length > 500) history.pop();

  localStorage.setItem(BEHAVIOR_HISTORY_STORAGE_KEY, JSON.stringify(history));
  return event;
}

/**
 * Retrieve behavior logs for a specific product ID
 */
export function getProductHistory(productId) {
  const history = getProductBehaviorHistory();
  return history.filter(h => String(h.productId) === String(productId));
}

/**
 * Clear behavior history logs
 */
export function clearProductBehaviorHistory() {
  localStorage.removeItem(BEHAVIOR_HISTORY_STORAGE_KEY);
  return true;
}

// ============================================================
//  4. AUTOMATED BEHAVIOR & BADGE EVALUATION ENGINE
// ============================================================

/**
 * Evaluates which badge best fits a product based on active rule criteria and dynamic thresholds
 */
export function evaluateBadgeForProduct(product, activeBadges = null) {
  if (!activeBadges) {
    activeBadges = getBadges().filter(b => b.isActive);
  }

  // Sort active badges by priority descending
  const sortedBadges = [...activeBadges].sort((a, b) => (b.priority || 0) - (a.priority || 0));

  // Compute metrics
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

    // Rule 1: Hot Deal / Discount Markdown
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

    // Rule 2: Low Stock Alert (Total stock <= configured threshold)
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

    // Rule 3: Top Rated (Rating >= minRating & Reviews >= minReviews)
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

    // Rule 4: Bestseller (Reviews >= minReviews or high sales)
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

    // Rule 5: Popular (Reviews >= minReviews)
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

    // Rule 6: New Arrival
    if (badge.criteria === 'new_arrival' && (product.badge === 'New Arrival' || product.isNew)) {
      return {
        badgeName: badge.name,
        badgeObj: badge,
        reason: `Product marked as recent catalog intake.`,
        metrics: { price, origPrice, discountPct, rating, reviews, totalStock }
      };
    }
  }

  // Preserve existing manual badge if already set to a manual badge
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

/**
 * Runs the Automated Badge Assignment Engine across all products in inventory
 * and records transitions in the behavior history log
 */
export function runAutoBadgeAssignment() {
  const products = getStoredProducts();
  const activeBadges = getBadges().filter(b => b.isActive);
  let updatedCount = 0;
  const changes = [];

  products.forEach(p => {
    const evaluation = evaluateBadgeForProduct(p, activeBadges);
    const oldBadge = p.badge || '';
    const newBadge = evaluation.badgeName;

    if (newBadge !== oldBadge) {
      p.badge = newBadge;
      updatedCount++;

      // Record in Product Behavior History
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

// ── Badge Color Style Helper ────────────────────────────────
export function getBadgeColorClass(color) {
  switch (color) {
    case 'blue':
      return 'bg-blue-600/20 text-blue-300 border-blue-500/40';
    case 'rose':
      return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
    case 'emerald':
      return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    case 'amber':
      return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    case 'purple':
      return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
    case 'cyan':
      return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
    case 'orange':
      return 'bg-orange-500/20 text-orange-300 border-orange-500/40';
    default:
      return 'bg-blue-600/20 text-blue-300 border-blue-500/40';
  }
}
