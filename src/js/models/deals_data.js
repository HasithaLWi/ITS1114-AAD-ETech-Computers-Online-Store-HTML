// deals_data.js — Model & Storage layer for Promotions, Deal Banners, and Deal Bundles
import { getStoredProducts, saveStoredProducts } from './data.js';

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
      "ASUS GeForce RTX 4070 Super 12GB",
      "Corsair Vengeance 32GB DDR5-6000MHz",
      "Samsung 990 PRO 1TB PCIe 4.0 SSD"
    ],
    price: 259999,
    originalPrice: 289999,
    savingAmount: 30000,
    savingPercent: 10,
    claimedPercent: 62,
    stockLeft: 38,
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
      "Intel Core i7-14700K 20-Core Processor",
      "Quantum 64GB (2x32GB) DDR5 6000MHz",
      "Samsung 990 PRO 2TB NVMe SSD"
    ],
    price: 319999,
    originalPrice: 369999,
    savingAmount: 50000,
    savingPercent: 14,
    claimedPercent: 45,
    stockLeft: 15,
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
      { icon: "🖥️", label: "34\" Curved QD-OLED" },
      { icon: "🎮", label: "RTX 4080 Super" },
      { icon: "🎧", label: "7.1 Spatial Audio" }
    ],
    bundleItems: [
      "Vortex Ultra 34\" Curved QD-OLED Monitor",
      "NVIDIA GeForce RTX 4080 Super GPU",
      "Immerse Pro 7.1 Wireless Headset"
    ],
    price: 489999,
    originalPrice: 559999,
    savingAmount: 70000,
    savingPercent: 13,
    claimedPercent: 80,
    stockLeft: 6,
    durationDays: 1,
    durationHours: 19,
    durationMins: 45,
    durationSecs: 10,
    productId: 3,
    active: true
  }
];

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
 * Retrieve Deal Bundles for DealHot Carousel
 */
export function getDealBundles() {
  const raw = localStorage.getItem(DEAL_BUNDLES_STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(DEAL_BUNDLES_STORAGE_KEY, JSON.stringify(DEFAULT_DEAL_BUNDLES));
    return [...DEFAULT_DEAL_BUNDLES];
  }
  try {
    const list = JSON.parse(raw);
    return Array.isArray(list) && list.length > 0 ? list : [...DEFAULT_DEAL_BUNDLES];
  } catch (e) {
    return [...DEFAULT_DEAL_BUNDLES];
  }
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
  const newId = list.length > 0 ? Math.max(...list.map(b => b.id || 0)) + 1 : 1;
  const newBundle = {
    id: newId,
    badge: bundleData.badge || "HOT DEAL",
    eyebrow: bundleData.eyebrow || "FEATURED DEAL",
    title: bundleData.title || "New High-End Bundle",
    subtitle: bundleData.subtitle || "Premium Hardware Package",
    image: bundleData.image || "public/images/home-hero-image-1.png",
    specs: bundleData.specs || [{ icon: "🎮", label: "GPU/CPU" }],
    bundleItems: bundleData.bundleItems || [],
    price: Number(bundleData.price) || 199999,
    originalPrice: Number(bundleData.originalPrice) || 229999,
    savingAmount: Math.max(0, (Number(bundleData.originalPrice) || 229999) - (Number(bundleData.price) || 199999)),
    savingPercent: Math.round((((Number(bundleData.originalPrice) || 229999) - (Number(bundleData.price) || 199999)) / (Number(bundleData.originalPrice) || 229999)) * 100),
    claimedPercent: Number(bundleData.claimedPercent) || 50,
    stockLeft: Number(bundleData.stockLeft) || 20,
    durationDays: Number(bundleData.durationDays) || 2,
    durationHours: Number(bundleData.durationHours) || 14,
    durationMins: Number(bundleData.durationMins) || 30,
    durationSecs: Number(bundleData.durationSecs) || 0,
    productId: Number(bundleData.productId) || 1,
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

  const price = Number(bundleData.price) || list[index].price;
  const originalPrice = Number(bundleData.originalPrice) || list[index].originalPrice;
  const savingAmount = Math.max(0, originalPrice - price);
  const savingPercent = originalPrice > 0 ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  list[index] = {
    ...list[index],
    ...bundleData,
    id: Number(id),
    price,
    originalPrice,
    savingAmount,
    savingPercent
  };
  saveDealBundles(list);
  return list[index];
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
