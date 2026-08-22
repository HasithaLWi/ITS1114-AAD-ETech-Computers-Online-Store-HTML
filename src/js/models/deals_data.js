// ============================================================
//  deals_data.js — Model & Storage layer for Promotions & Composite Deal Bundles
// ============================================================
import { getStoredProducts, saveStoredProducts } from './data.js';
import { getBranches } from '../controller/branch_controller.js';

export const HOME_DEAL_STORAGE_KEY = 'etech_home_deal_banner';
export const DEAL_BUNDLES_STORAGE_KEY = 'etech_deal_bundles';

export const DEFAULT_HOME_DEAL_BANNER = {
  tag: "WEEKEND TECH DEAL",
  title: "Upgrade your setup",
  titleHighlight: "Save up to 20%",
  subtitle: "on selected components",
  bgImage: "public/images/WEEKEND-TECH-DEAL-cart-bg.jpeg",
  durationType: "week", // 'week' or 'custom'
  durationDays: 2,
  durationHours: 14,
  durationMins: 31,
  durationSecs: 59,
  targetUrl: "#deals",
  buttonText: "Shop Deals",
  active: true,
  lastUpdated: new Date().toISOString()
};

export const DEFAULT_DEAL_BUNDLES = [
  {
    id: 1,
    badge: "BEST DEAL",
    eyebrow: "FEATURED DEAL",
    title: "Ultimate Gaming Power",
    subtitle: "Complete Your Dream Setup",
    image: "public/images/home-hero-image-1.png",
    specs: [
      { icon: "🎮", label: "RTX 4070 Super" },
      { icon: "🧠", label: "32GB DDR5 RAM" },
      { icon: "💾", label: "1TB NVMe SSD" }
    ],
    bundleItems: [
      { productId: 1, qty: 1, name: "ASUS GeForce RTX 4070 Super 12GB GDDR6X" },
      { productId: 3, qty: 2, name: "Corsair Vengeance 16GB (2x8GB) DDR5 6000MHz" },
      { productId: 4, qty: 1, name: "Samsung 990 PRO 1TB NVMe SSD" }
    ],
    price: 259999,
    originalPrice: 331997, // Sum of 259,999 + (28,999 * 2) + 42,999
    targetQuota: 25,
    soldCount: 8,
    claimedPercent: 62,
    stockLeft: 3,
    durationDays: 2,
    durationHours: 14,
    durationMins: 28,
    durationSecs: 42,
    productId: 1,
    active: true
  },
  {
    id: 2,
    badge: "HOT BUNDLE",
    eyebrow: "CREATOR WORKSTATION",
    title: "Apex Creator Studio Rig",
    subtitle: "Unmatched 4K Content Creation & Rendering",
    image: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=600&q=80",
    specs: [
      { icon: "⚙️", label: "i7-14700K 20-Core" },
      { icon: "🧠", label: "64GB DDR5 6000MHz" },
      { icon: "💾", label: "2TB PCIe 4.0 SSD" }
    ],
    bundleItems: [
      { productId: 2, qty: 1, name: "Intel Core i7-14700K" },
      { productId: 3, qty: 2, name: "Corsair Vengeance 16GB (2x8GB) DDR5 6000MHz" },
      { productId: 4, qty: 1, name: "Samsung 990 PRO 1TB NVMe SSD" }
    ],
    price: 269999,
    originalPrice: 280996,
    targetQuota: 15,
    soldCount: 5,
    claimedPercent: 45,
    stockLeft: 2,
    durationDays: 3,
    durationHours: 8,
    durationMins: 15,
    durationSecs: 20,
    productId: 2,
    active: true
  },
  {
    id: 3,
    badge: "FLASH COMBO",
    eyebrow: "ESPORTS COMPETITIVE",
    title: "Predator Cyber Battlestation",
    subtitle: "Ultra-High 240Hz Competitive Performance",
    image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80",
    specs: [
      { icon: "🎮", label: "RTX 4070 Super" },
      { icon: "⚙️", label: "i7-14700K 20-Core" },
      { icon: "💾", label: "Fast NVMe Storage" }
    ],
    bundleItems: [
      { productId: 1, qty: 1, name: "ASUS GeForce RTX 4070 Super 12GB GDDR6X" },
      { productId: 2, qty: 1, name: "Intel Core i7-14700K" }
    ],
    price: 399999,
    originalPrice: 439998,
    targetQuota: 10,
    soldCount: 4,
    claimedPercent: 80,
    stockLeft: 2,
    durationDays: 1,
    durationHours: 19,
    durationMins: 45,
    durationSecs: 10,
    productId: 1,
    active: true
  }
];

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
      image: product ? product.image : '',
      unitPrice: unitPrice,
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
    return JSON.parse(raw);
  } catch (e) {
    return { ...DEFAULT_HOME_DEAL_BANNER };
  }
}

/**
 * Save Home Deal Banner Configuration
 */
export function saveHomeDealBanner(bannerData) {
  const current = getHomeDealBanner();
  const updated = {
    ...current,
    ...bannerData,
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

  // Attach live computed inventory to each bundle
  return list.map(b => {
    const inv = calculateBundleInventory(b, products, branches);
    const price = Number(b.price) || 199999;
    const originalPrice = inv.calculatedMSRP > 0 ? inv.calculatedMSRP : (Number(b.originalPrice) || price);
    const savingAmount = Math.max(0, originalPrice - price);
    const savingPercent = originalPrice > 0 ? Math.round((savingAmount / originalPrice) * 100) : 0;

    return {
      ...b,
      bundleItems: normalizeBundleItems(b.bundleItems, products),
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
    durationDays: Number(bundleData.durationDays) || 2,
    durationHours: Number(bundleData.durationHours) || 14,
    durationMins: Number(bundleData.durationMins) || 30,
    durationSecs: Number(bundleData.durationSecs) || 0,
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
    claimedPercent: inv.claimedPercent
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
