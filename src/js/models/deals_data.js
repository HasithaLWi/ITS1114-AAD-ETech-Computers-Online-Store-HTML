// ============================================================
//  deals_data.js — Model & Storage layer for Promotions & Composite Deal Bundles
// ============================================================
import { getStoredProducts, saveStoredProducts } from './data.js';
import { getBranches } from '../controller/branch_controller.js';
import {
  DEFAULT_HOME_DEAL_BANNER,
  DEFAULT_DEAL_BUNDLES,
  DEFAULT_HOT_DEALS
} from '../../data/deals.js';

export { DEFAULT_HOME_DEAL_BANNER, DEFAULT_DEAL_BUNDLES, DEFAULT_HOT_DEALS };

export const HOME_DEAL_STORAGE_KEY = 'etech_home_deal_banner';
export const DEAL_BUNDLES_STORAGE_KEY = 'etech_deal_bundles';
export const HOT_DEALS_STORAGE_KEY = 'etech_hot_deals_list';

/**
 * Check if the Home Deal Banner & Hot Deals Campaign is currently active/visible
 * @returns {boolean}
 */
export function isHomeDealBannerActive() {
  const banner = getHomeDealBanner();
  return banner.active !== false;
}

/**
 * Calculates realtime remaining countdown duration from timerUpdatedAt & total configured duration
 * 
 * @param {Object} item - An object containing durationDays, durationHours, durationMins, durationSecs, durationSeconds, and timerUpdatedAt
 * @returns {Object} { totalSeconds, days, hours, mins, secs, isExpired }
 */
export function getRemainingTimeFromDuration(item) {
  if (!item) {
    return { totalSeconds: 0, days: "00", hours: "00", mins: "00", secs: "00", isExpired: true };
  }

  // If the item or campaign is frozen/paused, return frozen remaining duration
  if (item.isPaused && item.pausedRemainingSeconds !== undefined) {
    const remaining = Math.max(0, Number(item.pausedRemainingSeconds) || 0);
    const remDays = Math.floor(remaining / 86400);
    const remHours = Math.floor((remaining % 86400) / 3600);
    const remMins = Math.floor((remaining % 3600) / 60);
    const remSecs = remaining % 60;
    return {
      totalSeconds: remaining,
      days: String(remDays).padStart(2, '0'),
      hours: String(remHours).padStart(2, '0'),
      mins: String(remMins).padStart(2, '0'),
      secs: String(remSecs).padStart(2, '0'),
      isExpired: remaining <= 0
    };
  }

  const days = Number(item.durationDays) || 0;
  const hours = Number(item.durationHours) || 0;
  const mins = Number(item.durationMins) || 0;
  const secs = Number(item.durationSecs) || 0;
  const totalDuration = Number(item.durationSeconds) || (days * 86400 + hours * 3600 + mins * 60 + secs);

  if (totalDuration <= 0) {
    return { totalSeconds: 0, days: "00", hours: "00", mins: "00", secs: "00", isExpired: true };
  }

  // Calculate elapsed time from timerUpdatedAt or lastUpdated
  const updatedAt = item.timerUpdatedAt || item.lastUpdated;
  let elapsedSeconds = 0;
  if (updatedAt) {
    const startMs = new Date(updatedAt).getTime();
    if (!isNaN(startMs)) {
      elapsedSeconds = Math.max(0, Math.floor((Date.now() - startMs) / 1000));
    }
  }

  const remaining = Math.max(0, totalDuration - elapsedSeconds);
  const isExpired = remaining <= 0;

  const remDays = Math.floor(remaining / 86400);
  const remHours = Math.floor((remaining % 86400) / 3600);
  const remMins = Math.floor((remaining % 3600) / 60);
  const remSecs = remaining % 60;

  return {
    totalSeconds: remaining,
    days: String(remDays).padStart(2, '0'),
    hours: String(remHours).padStart(2, '0'),
    mins: String(remMins).padStart(2, '0'),
    secs: String(remSecs).padStart(2, '0'),
    isExpired: isExpired
  };
}

/**
 * Get remaining countdown for the Store-Wide Home / Hot Deals Banner (Timer Type 1)
 */
export function getHomeBannerRemainingTime() {
  const banner = getHomeDealBanner();
  return getRemainingTimeFromDuration(banner);
}

/**
 * Get remaining countdown for a specific Deal Bundle (Timer Type 2)
 */
export function getBundleRemainingTime(bundleId) {
  const bundles = getDealBundles();
  const bundle = bundles.find(b => b.id === Number(bundleId));
  return getRemainingTimeFromDuration(bundle);
}

/**
 * Normalizes bundle items to structured format [{ productId, qty, name }]
 */
export function normalizeBundleItems(items, productsList) {
  if (!Array.isArray(items)) return [];
  const products = productsList || getStoredProducts();

  return items.map(item => {
    if (typeof item === 'object' && item !== null && item.productId) {
      const p = products.find(prod => prod.id === Number(item.productId));
      return {
        productId: Number(item.productId),
        qty: Math.max(1, parseInt(item.qty) || 1),
        name: p ? p.name : (item.name || `Product #${item.productId}`)
      };
    } else if (typeof item === 'string') {
      // Find matching product by name
      const p = products.find(prod => prod.name.toLowerCase().includes(item.toLowerCase()) || item.toLowerCase().includes(prod.name.toLowerCase()));
      return {
        productId: p ? p.id : 1,
        qty: 1,
        name: p ? p.name : item
      };
    }
    return null;
  }).filter(Boolean);
}

/**
 * Calculates live dynamic inventory status, bottleneck available units, and branch assembly readiness for a bundle
 */
export function calculateBundleInventory(bundle, customProducts = null, customBranches = null) {
  const products = customProducts || getStoredProducts();
  const branches = customBranches || getBranches();
  const normalizedItems = normalizeBundleItems(bundle.bundleItems, products);

  if (normalizedItems.length === 0) {
    return {
      maxAvailableBundles: 0,
      calculatedMSRP: Number(bundle.originalPrice) || Number(bundle.price) || 0,
      componentsBreakdown: [],
      branchAssembly: {},
      totalReadyToShip: 0,
      claimedPercent: Number(bundle.claimedPercent) || 50,
      stockLeft: 0
    };
  }

  let calculatedMSRP = 0;
  let componentBottlenecks = [];
  let branchStocksAccumulator = {};

  branches.forEach(b => {
    branchStocksAccumulator[b.id] = [];
  });

  const componentsBreakdown = normalizedItems.map(item => {
    const product = products.find(p => p.id === item.productId);
    const unitPrice = product ? Number(product.price) : 0;
    calculatedMSRP += unitPrice * item.qty;

    const totalStock = product ? (product.totalStock || 0) : 0;
    const availableBundlesForThisItem = Math.floor(totalStock / item.qty);
    componentBottlenecks.push(availableBundlesForThisItem);

    // Branch breakdown
    const branchStockMap = {};
    branches.forEach(b => {
      const bStock = (product && product.branchStock && product.branchStock[b.id]) || 0;
      const bBundles = Math.floor(bStock / item.qty);
      branchStockMap[b.id] = bStock;
      branchStocksAccumulator[b.id].push(bBundles);
    });

    return {
      productId: item.productId,
      qty: item.qty,
      name: product ? product.name : item.name,
      sku: product ? product.sku : `ETC-${item.productId}`,
      brand: product ? (product.brand || '') : '',
      category: product ? (product.category || '') : '',
      image: product ? product.image : '',
      unitPrice: unitPrice,
      specs: product ? (product.specs || {}) : {},
      totalStock: totalStock,
      availableBundlesForThisItem: availableBundlesForThisItem,
      branchStock: branchStockMap
    };
  });

  // Overall bottleneck across entire network
  const maxAvailableBundles = componentBottlenecks.length > 0 ? Math.max(0, Math.min(...componentBottlenecks)) : 0;

  // Branch assembly readiness (How many complete kits each single branch can fulfill right now)
  const branchAssembly = {};
  let totalReadyToShip = 0;

  branches.forEach(b => {
    const branchKitLimits = branchStocksAccumulator[b.id] || [0];
    const readyKits = branchKitLimits.length > 0 ? Math.max(0, Math.min(...branchKitLimits)) : 0;
    branchAssembly[b.id] = {
      branchId: b.id,
      branchName: b.name,
      city: b.city,
      readyKits: readyKits
    };
    totalReadyToShip += readyKits;
  });

  // Dynamic Claimed Percentage based on soldCount and available stock
  const soldCount = Math.max(0, parseInt(bundle.soldCount) || 0);
  let claimedPercent = 0;
  if (soldCount + maxAvailableBundles > 0) {
    claimedPercent = Math.min(99, Math.max(5, Math.round((soldCount / (soldCount + maxAvailableBundles)) * 100)));
  } else {
    claimedPercent = 95; // sold out
  }

  return {
    maxAvailableBundles,
    calculatedMSRP,
    componentsBreakdown,
    branchAssembly,
    totalReadyToShip,
    claimedPercent,
    stockLeft: maxAvailableBundles,
    soldCount
  };
}

/**
 * Retrieve Home Deal Banner Configuration
 */
export function getHomeDealBanner() {
  const raw = localStorage.getItem(HOME_DEAL_STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(HOME_DEAL_STORAGE_KEY, JSON.stringify(DEFAULT_HOME_DEAL_BANNER));
    return { ...DEFAULT_HOME_DEAL_BANNER };
  }
  try {
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_HOME_DEAL_BANNER, ...parsed };
  } catch (e) {
    return { ...DEFAULT_HOME_DEAL_BANNER };
  }
}

/**
 * Save Home Deal Banner Configuration with full Hot Deals Campaign state cascade
 */
export function saveHomeDealBanner(bannerData) {
  const currentBanner = getHomeDealBanner();
  const wasActive = currentBanner.active !== false;
  const isNowActive = bannerData.active !== undefined ? Boolean(bannerData.active) : true;

  const durationDays = Number(bannerData.durationDays) || 0;
  const durationHours = Number(bannerData.durationHours) || 8;
  const durationMins = Number(bannerData.durationMins) || 0;
  const durationSecs = Number(bannerData.durationSecs) || 0;
  const durationSeconds = (durationDays * 86400) + (durationHours * 3600) + (durationMins * 60) + durationSecs;

  // Hot deals pause / resume transition handling
  if (wasActive && !isNowActive) {
    // Pausing campaign: freeze remaining countdown on all hot deals
    const rawDeals = localStorage.getItem(HOT_DEALS_STORAGE_KEY);
    let deals = [];
    try { deals = JSON.parse(rawDeals) || []; } catch(e) { deals = []; }
    const updatedDeals = deals.map(d => {
      const rem = getRemainingTimeFromDuration(d);
      return {
        ...d,
        pausedRemainingSeconds: rem.totalSeconds,
        isPaused: true
      };
    });
    localStorage.setItem(HOT_DEALS_STORAGE_KEY, JSON.stringify(updatedDeals));
  } else if (!wasActive && isNowActive) {
    // Resuming campaign: unfreeze hot deals from pausedRemainingSeconds
    const rawDeals = localStorage.getItem(HOT_DEALS_STORAGE_KEY);
    let deals = [];
    try { deals = JSON.parse(rawDeals) || []; } catch(e) { deals = []; }
    const updatedDeals = deals.map(d => {
      const remainingSecs = d.pausedRemainingSeconds !== undefined ? d.pausedRemainingSeconds : d.durationSeconds;
      return {
        ...d,
        durationSeconds: remainingSecs,
        timerUpdatedAt: new Date().toISOString(),
        isPaused: false
      };
    });
    localStorage.setItem(HOT_DEALS_STORAGE_KEY, JSON.stringify(updatedDeals));
  }

  const updated = {
    ...bannerData,
    active: isNowActive,
    durationDays,
    durationHours,
    durationMins,
    durationSecs,
    durationSeconds,
    timerUpdatedAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString()
  };
  localStorage.setItem(HOME_DEAL_STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

/**
 * Retrieve Deal Bundles with Live Dynamic Inventory Calculations
 */
export function getDealBundles() {
  const raw = localStorage.getItem(DEAL_BUNDLES_STORAGE_KEY);
  let list = [];
  if (!raw) {
    localStorage.setItem(DEAL_BUNDLES_STORAGE_KEY, JSON.stringify(DEFAULT_DEAL_BUNDLES));
    list = [...DEFAULT_DEAL_BUNDLES];
  } else {
    try {
      const parsed = JSON.parse(raw);
      list = Array.isArray(parsed) && parsed.length > 0 ? parsed : [...DEFAULT_DEAL_BUNDLES];
    } catch (e) {
      list = [...DEFAULT_DEAL_BUNDLES];
    }
  }

  const products = getStoredProducts();
  const branches = getBranches();

  // Attach live computed inventory and dynamic specs to each bundle
  return list.map(b => {
    const inv = calculateBundleInventory(b, products, branches);
    const price = Number(b.price) || 199999;
    const originalPrice = inv.calculatedMSRP > 0 ? inv.calculatedMSRP : (Number(b.originalPrice) || price);
    const savingAmount = Math.max(0, originalPrice - price);
    const savingPercent = originalPrice > 0 ? Math.round((savingAmount / originalPrice) * 100) : 0;

    // Derive specs dynamically from included products
    const dynamicSpecs = [];
    (inv.componentsBreakdown || []).forEach(comp => {
      if (comp.specs && Object.keys(comp.specs).length > 0) {
        const topSpec = Object.entries(comp.specs)[0];
        if (topSpec) {
          dynamicSpecs.push({
            icon: '⚡',
            label: `${topSpec[1]}`
          });
        }
      }
    });

    return {
      ...b,
      bundleItems: normalizeBundleItems(b.bundleItems, products),
      specs: dynamicSpecs.length > 0 ? dynamicSpecs : (b.specs || []),
      price: price,
      originalPrice: originalPrice,
      savingAmount: savingAmount,
      savingPercent: savingPercent,
      stockLeft: inv.maxAvailableBundles,
      claimedPercent: inv.claimedPercent,
      soldCount: inv.soldCount,
      branchAssembly: inv.branchAssembly,
      totalReadyToShip: inv.totalReadyToShip,
      componentsBreakdown: inv.componentsBreakdown
    };
  });
}

/**
 * Save All Deal Bundles
 */
export function saveDealBundles(bundlesList) {
  localStorage.setItem(DEAL_BUNDLES_STORAGE_KEY, JSON.stringify(bundlesList));
}

/**
 * Add or Create a Deal Bundle
 */
export function addDealBundle(bundleData) {
  const list = getDealBundles();
  const products = getStoredProducts();
  const newId = list.length > 0 ? Math.max(...list.map(b => b.id || 0)) + 1 : 1;

  const normalizedItems = normalizeBundleItems(bundleData.bundleItems, products);
  const inv = calculateBundleInventory({ ...bundleData, bundleItems: normalizedItems }, products);

  const price = Number(bundleData.price) || 199999;
  const originalPrice = inv.calculatedMSRP > 0 ? inv.calculatedMSRP : (Number(bundleData.originalPrice) || 229999);
  const savingAmount = Math.max(0, originalPrice - price);
  const savingPercent = originalPrice > 0 ? Math.round((savingAmount / originalPrice) * 100) : 0;

  const durationDays = Number(bundleData.durationDays) || 2;
  const durationHours = Number(bundleData.durationHours) || 14;
  const durationMins = Number(bundleData.durationMins) || 30;
  const durationSecs = Number(bundleData.durationSecs) || 0;
  const durationSeconds = (durationDays * 86400) + (durationHours * 3600) + (durationMins * 60) + durationSecs;

  const newBundle = {
    id: newId,
    badge: bundleData.badge || "HOT DEAL",
    eyebrow: bundleData.eyebrow || "FEATURED DEAL",
    title: bundleData.title || "New High-End Bundle",
    subtitle: bundleData.subtitle || "Premium Hardware Package",
    image: bundleData.image || "public/images/home-hero-image-1.png",
    specs: bundleData.specs || [{ icon: "🎮", label: "GPU/CPU" }],
    bundleItems: normalizedItems,
    price: price,
    originalPrice: originalPrice,
    savingAmount: savingAmount,
    savingPercent: savingPercent,
    targetQuota: Number(bundleData.targetQuota) || 20,
    soldCount: 0,
    claimedPercent: inv.claimedPercent,
    stockLeft: inv.maxAvailableBundles,
    durationDays,
    durationHours,
    durationMins,
    durationSecs,
    durationSeconds,
    timerUpdatedAt: new Date().toISOString(),
    productId: Number(bundleData.productId) || (normalizedItems[0] ? normalizedItems[0].productId : 1),
    active: bundleData.active !== undefined ? bundleData.active : true
  };

  list.push(newBundle);
  saveDealBundles(list);
  return newBundle;
}

/**
 * Update an existing Deal Bundle
 */
export function updateDealBundle(id, bundleData) {
  const list = getDealBundles();
  const index = list.findIndex(b => b.id === Number(id));
  if (index === -1) return null;

  const products = getStoredProducts();
  const normalizedItems = normalizeBundleItems(bundleData.bundleItems || list[index].bundleItems, products);
  const inv = calculateBundleInventory({ ...list[index], ...bundleData, bundleItems: normalizedItems }, products);

  const price = Number(bundleData.price) || list[index].price;
  const originalPrice = inv.calculatedMSRP > 0 ? inv.calculatedMSRP : (Number(bundleData.originalPrice) || list[index].originalPrice);
  const savingAmount = Math.max(0, originalPrice - price);
  const savingPercent = originalPrice > 0 ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  const durationDays = bundleData.durationDays !== undefined ? Number(bundleData.durationDays) : (list[index].durationDays || 2);
  const durationHours = bundleData.durationHours !== undefined ? Number(bundleData.durationHours) : (list[index].durationHours || 14);
  const durationMins = bundleData.durationMins !== undefined ? Number(bundleData.durationMins) : (list[index].durationMins || 30);
  const durationSecs = bundleData.durationSecs !== undefined ? Number(bundleData.durationSecs) : (list[index].durationSecs || 0);
  const durationSeconds = (durationDays * 86400) + (durationHours * 3600) + (durationMins * 60) + durationSecs;

  list[index] = {
    ...list[index],
    ...bundleData,
    id: Number(id),
    bundleItems: normalizedItems,
    price,
    originalPrice,
    savingAmount,
    savingPercent,
    stockLeft: inv.maxAvailableBundles,
    claimedPercent: inv.claimedPercent,
    durationDays,
    durationHours,
    durationMins,
    durationSecs,
    durationSeconds,
    timerUpdatedAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString()
  };
  saveDealBundles(list);
  return list[index];
}

/**
 * Records a purchase of a Deal Bundle and increments its sold count
 */
export function recordBundleSale(bundleId, qty = 1) {
  const list = getDealBundles();
  const index = list.findIndex(b => b.id === Number(bundleId));
  if (index !== -1) {
    list[index].soldCount = (list[index].soldCount || 0) + (parseInt(qty) || 1);
    saveDealBundles(list);
  }
}

/**
 * Delete a Deal Bundle
 */
export function deleteDealBundle(id) {
  const list = getDealBundles();
  const filtered = list.filter(b => b.id !== Number(id));
  saveDealBundles(filtered);
  return true;
}

/**
 * Validates whether a deal bundle is currently active, unexpired, and in stock
 */
export function isBundleAvailable(bundleId) {
  const bundles = getDealBundles();
  const bundle = bundles.find(b => b.id === Number(bundleId));
  if (!bundle || bundle.active === false) {
    return { available: false, reason: 'inactive', message: 'This deal bundle is currently inactive.' };
  }

  const timer = getBundleRemainingTime(bundle.id);
  if (timer.isExpired) {
    return { available: false, reason: 'expired', message: `The deal bundle "${bundle.title}" has expired.` };
  }

  const products = getStoredProducts();
  const inv = calculateBundleInventory(bundle, products);
  if (inv.maxAvailableBundles <= 0) {
    return { available: false, reason: 'out_of_stock', message: `The deal bundle "${bundle.title}" is currently out of stock.` };
  }

  return { available: true, bundle, inv, remainingSeconds: timer.totalSeconds };
}

/**
 * Get all products with promotion details for the discounts table
 */
export function getAllDiscountsAndDeals() {
  const products = getStoredProducts();
  return products.map(p => {
    const orig = p.originalPrice || p.price;
    const current = p.price;
    const discount = orig > current ? Math.round(((orig - current) / orig) * 100) : 0;
    const savings = Math.max(0, orig - current);

    return {
      ...p,
      discountPercent: discount,
      savingAmount: savings,
      isHotDeal: p.badge && (p.badge.toLowerCase().includes('deal') || p.badge.toLowerCase().includes('hot') || p.badge.toLowerCase().includes('-')),
      isBestSeller: p.badge && p.badge.toLowerCase().includes('best seller')
    };
  });
}

/**
 * Update a specific product discount and badge
 */
export function updateProductDiscount(productId, { price, originalPrice, badge }) {
  const products = getStoredProducts();
  const index = products.findIndex(p => p.id === Number(productId));
  if (index === -1) return false;

  products[index].price = Number(price);
  if (originalPrice !== undefined) products[index].originalPrice = Number(originalPrice);
  if (badge !== undefined) products[index].badge = badge;
  products[index].discount = products[index].originalPrice > products[index].price 
    ? Math.round(((products[index].originalPrice - products[index].price) / products[index].originalPrice) * 100) 
    : 0;

  saveStoredProducts(products);
  return true;
}

/* ========================================================================== */
/* 4. RELATIONAL HOT DEALS & FLASH SALES MANAGEMENT LAYER                     */
/* ========================================================================== */

/**
 * Retrieve All Hot Deals with live Product relation join and dynamic calculations
 */
export function getHotDeals() {
  const raw = localStorage.getItem(HOT_DEALS_STORAGE_KEY);
  let list = [];
  if (!raw) {
    localStorage.setItem(HOT_DEALS_STORAGE_KEY, JSON.stringify(DEFAULT_HOT_DEALS));
    list = [...DEFAULT_HOT_DEALS];
  } else {
    try {
      const parsed = JSON.parse(raw);
      list = Array.isArray(parsed) && parsed.length > 0 ? parsed : [...DEFAULT_HOT_DEALS];
    } catch (e) {
      list = [...DEFAULT_HOT_DEALS];
    }
  }

  const products = getStoredProducts();

  return list.map(deal => {
    const product = products.find(p => p.id === Number(deal.productId)) || {
      id: deal.productId,
      name: `Hardware Product #${deal.productId}`,
      category: 'components',
      price: deal.dealPrice || 100000,
      originalPrice: (deal.dealPrice || 100000) * 1.2,
      image: 'public/images/home-hero-image-1.png',
      rating: 4.8,
      reviews: 50,
      totalStock: 20
    };

    const regularCatalogPrice = Number(product.price) || Number(deal.dealPrice);
    const originalListPrice = Number(product.originalPrice) || regularCatalogPrice;
    const dealPrice = Number(deal.dealPrice) || regularCatalogPrice;

    const remainingTime = getRemainingTimeFromDuration(deal);
    const isExpired = remainingTime.isExpired;

    // Dynamic savings vs original list price
    const savingsAmount = Math.max(0, originalListPrice - dealPrice);
    const discountPercent = originalListPrice > 0 ? Math.round((savingsAmount / originalListPrice) * 100) : 0;

    // Target quota & sold count
    const targetQuota = Number(deal.targetQuota) || 30;
    const soldCount = Number(deal.soldCount) || 0;
    const stockLeft = product.totalStock !== undefined ? product.totalStock : 15;
    const totalAllocated = soldCount + stockLeft;
    const soldPercent = totalAllocated > 0 ? Math.min(99, Math.max(5, Math.round((soldCount / totalAllocated) * 100))) : 75;

    return {
      ...deal,
      id: Number(deal.id),
      productId: Number(deal.productId),
      productName: product.name,
      name: product.name,
      category: product.category,
      image: product.image,
      images: product.images || [product.image],
      specs: product.specs,
      rating: product.rating || 4.8,
      reviews: product.reviews || 95,
      sku: product.sku || `ETC-${deal.productId}`,
      regularPrice: regularCatalogPrice,
      originalPrice: originalListPrice,
      dealPrice: dealPrice,
      savingAmount: savingsAmount,
      discountPercent: discountPercent,
      badge: deal.badge || "HOT DEAL",
      targetQuota: targetQuota,
      soldCount: soldCount,
      stockLeft: stockLeft,
      totalStock: totalAllocated,
      soldPercent: soldPercent,
      remainingStock: stockLeft,
      remainingTime: remainingTime,
      isExpired: isExpired,
      active: deal.active !== false && !isExpired
    };
  });
}

/**
 * Get only Active and Unexpired Hot Deals (returns empty if master campaign is paused/hidden)
 */
export function getActiveHotDeals() {
  if (!isHomeDealBannerActive()) {
    return [];
  }
  return getHotDeals().filter(d => d.active !== false && !d.isExpired);
}

/**
 * Get active Hot Deal override for a given product ID (or null if none/expired)
 */
export function getHotDealByProductId(productId) {
  const activeDeals = getActiveHotDeals();
  return activeDeals.find(d => d.productId === Number(productId)) || null;
}

/**
 * Save Hot Deals list to localStorage
 */
export function saveHotDeals(dealsList) {
  localStorage.setItem(HOT_DEALS_STORAGE_KEY, JSON.stringify(dealsList));
}

/**
 * Add a new Hot Deal
 */
export function addHotDeal(dealData) {
  const list = getHotDeals();
  const newId = list.length > 0 ? Math.max(...list.map(d => d.id || 0)) + 1 : 101;

  const durationDays = Number(dealData.durationDays) || 0;
  const durationHours = Number(dealData.durationHours) || 8;
  const durationMins = Number(dealData.durationMins) || 0;
  const durationSecs = Number(dealData.durationSecs) || 0;
  const durationSeconds = (durationDays * 86400) + (durationHours * 3600) + (durationMins * 60) + durationSecs;

  const newDeal = {
    id: newId,
    productId: Number(dealData.productId),
    dealPrice: Number(dealData.dealPrice),
    badge: dealData.badge || "HOT DEAL",
    durationDays,
    durationHours,
    durationMins,
    durationSecs,
    durationSeconds,
    timerUpdatedAt: new Date().toISOString(),
    targetQuota: Number(dealData.targetQuota) || 25,
    soldCount: Number(dealData.soldCount) || 0,
    active: dealData.active !== undefined ? dealData.active : true,
    lastUpdated: new Date().toISOString()
  };

  const rawList = JSON.parse(localStorage.getItem(HOT_DEALS_STORAGE_KEY) || '[]');
  rawList.push(newDeal);
  saveHotDeals(rawList);
  return newDeal;
}

/**
 * Update an existing Hot Deal
 */
export function updateHotDeal(id, dealData) {
  const rawList = JSON.parse(localStorage.getItem(HOT_DEALS_STORAGE_KEY) || '[]');
  const index = rawList.findIndex(d => d.id === Number(id));
  if (index === -1) return null;

  const durationDays = dealData.durationDays !== undefined ? Number(dealData.durationDays) : (rawList[index].durationDays || 0);
  const durationHours = dealData.durationHours !== undefined ? Number(dealData.durationHours) : (rawList[index].durationHours || 8);
  const durationMins = dealData.durationMins !== undefined ? Number(dealData.durationMins) : (rawList[index].durationMins || 0);
  const durationSecs = dealData.durationSecs !== undefined ? Number(dealData.durationSecs) : (rawList[index].durationSecs || 0);
  const durationSeconds = (durationDays * 86400) + (durationHours * 3600) + (durationMins * 60) + durationSecs;

  rawList[index] = {
    ...rawList[index],
    ...dealData,
    id: Number(id),
    productId: Number(dealData.productId !== undefined ? dealData.productId : rawList[index].productId),
    dealPrice: Number(dealData.dealPrice !== undefined ? dealData.dealPrice : rawList[index].dealPrice),
    durationDays,
    durationHours,
    durationMins,
    durationSecs,
    durationSeconds,
    timerUpdatedAt: dealData.resetTimer ? new Date().toISOString() : (rawList[index].timerUpdatedAt || new Date().toISOString()),
    lastUpdated: new Date().toISOString()
  };

  saveHotDeals(rawList);
  return rawList[index];
}

/**
 * Delete a Hot Deal
 */
export function deleteHotDeal(id) {
  const rawList = JSON.parse(localStorage.getItem(HOT_DEALS_STORAGE_KEY) || '[]');
  const filtered = rawList.filter(d => d.id !== Number(id));
  saveHotDeals(filtered);
  return true;
}

/**
 * Toggle Active / Inactive status of a Hot Deal
 */
export function toggleHotDealStatus(id) {
  const rawList = JSON.parse(localStorage.getItem(HOT_DEALS_STORAGE_KEY) || '[]');
  const deal = rawList.find(d => d.id === Number(id));
  if (deal) {
    deal.active = !deal.active;
    deal.lastUpdated = new Date().toISOString();
    saveHotDeals(rawList);
    return deal.active;
  }
  return false;
}
