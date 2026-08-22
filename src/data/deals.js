// ============================================================
//  src/data/deals.js — Central Promotions, Banners & Deals Data
// ============================================================

export const DEFAULT_HOME_DEAL_BANNER = {
  tag: "WEEKEND TECH DEAL",
  title: "Upgrade your setup",
  titleHighlight: "Save up to 20%",
  subtitle: "on selected components",
  bgImage: "public/images/WEEKEND-TECH-DEAL-cart-bg.jpeg",
  durationType: "custom",
  durationDays: 2,
  durationHours: 14,
  durationMins: 31,
  durationSecs: 59,
  durationSeconds: 2 * 86400 + 14 * 3600 + 31 * 60 + 59,
  timerUpdatedAt: new Date().toISOString(),
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
    originalPrice: 360996,
    targetQuota: 25,
    soldCount: 8,
    stockLeft: 3,
    claimedPercent: 73,
    durationDays: 2,
    durationHours: 18,
    durationMins: 45,
    durationSecs: 30,
    durationSeconds: 2 * 86400 + 18 * 3600 + 45 * 60 + 30,
    timerUpdatedAt: new Date().toISOString(),
    status: "Live",
    active: true
  },
  {
    id: 2,
    badge: "HOT BUNDLE",
    eyebrow: "WEEKEND EXCLUSIVE",
    title: "Creator Workstation Pro",
    subtitle: "High-Core Productivity Engine",
    image: "public/images/home-hero-image-1.png",
    specs: [
      { icon: "⚡", label: "Intel Core i7-14700K" },
      { icon: "🧠", label: "64GB DDR5 6000MHz" },
      { icon: "🔌", label: "1000W 80+ Gold PSU" }
    ],
    bundleItems: [
      { productId: 2, qty: 1, name: "Intel Core i7-14700K" },
      { productId: 8, qty: 1, name: "Quantum 64GB DDR5 6000MHz RGB RAM Kit" },
      { productId: 9, qty: 1, name: "SuperNova 1000W 80+ Gold Modular PSU" }
    ],
    price: 249999,
    originalPrice: 274997,
    targetQuota: 20,
    soldCount: 14,
    stockLeft: 10,
    claimedPercent: 58,
    durationDays: 1,
    durationHours: 12,
    durationMins: 20,
    durationSecs: 0,
    durationSeconds: 1 * 86400 + 12 * 3600 + 20 * 60,
    timerUpdatedAt: new Date().toISOString(),
    status: "Live",
    active: true
  },
  {
    id: 3,
    badge: "CLEARANCE",
    eyebrow: "STREAMER KIT",
    title: "Pro Streamer & Audio Suite",
    subtitle: "Studio Setup in One Box",
    image: "public/images/home-hero-image-1.png",
    specs: [
      { icon: "🎧", label: "Immerse Pro 7.1 Wireless" },
      { icon: "📹", label: "HyperStream 4K Webcam" },
      { icon: "⚡", label: "Thunderbolt 4 Dock" }
    ],
    bundleItems: [
      { productId: 6, qty: 1, name: "Immerse Pro 7.1 Wireless Gaming Headset" },
      { productId: 11, qty: 1, name: "Thunderbolt 4 Pro Docking Station 12-in-1" },
      { productId: 12, qty: 1, name: "HyperStream 4K USB-C Webcam & Ring Light" }
    ],
    price: 99999,
    originalPrice: 113997,
    targetQuota: 30,
    soldCount: 22,
    stockLeft: 9,
    claimedPercent: 70,
    durationDays: 4,
    durationHours: 6,
    durationMins: 30,
    durationSecs: 0,
    durationSeconds: 4 * 86400 + 6 * 3600 + 30 * 60,
    timerUpdatedAt: new Date().toISOString(),
    status: "Live",
    active: true
  }
];

export const DEFAULT_HOT_DEALS = [
  {
    id: 101,
    productId: 1,
    dealPrice: 244999,
    badge: "HOT DEAL",
    durationDays: 0,
    durationHours: 5,
    durationMins: 42,
    durationSecs: 18,
    durationSeconds: 5 * 3600 + 42 * 60 + 18,
    timerUpdatedAt: new Date().toISOString(),
    targetQuota: 50,
    soldCount: 39,
    active: true
  },
  {
    id: 102,
    productId: 2,
    dealPrice: 164999,
    badge: "HOT DEAL",
    durationDays: 0,
    durationHours: 8,
    durationMins: 15,
    durationSecs: 2,
    durationSeconds: 8 * 3600 + 15 * 60 + 2,
    timerUpdatedAt: new Date().toISOString(),
    targetQuota: 30,
    soldCount: 19,
    active: true
  },
  {
    id: 103,
    productId: 3,
    dealPrice: 24999,
    badge: "HOT DEAL",
    durationDays: 0,
    durationHours: 11,
    durationMins: 32,
    durationSecs: 44,
    durationSeconds: 11 * 3600 + 32 * 60 + 44,
    timerUpdatedAt: new Date().toISOString(),
    targetQuota: 40,
    soldCount: 18,
    active: true
  },
  {
    id: 104,
    productId: 8,
    dealPrice: 42999,
    badge: "HOT DEAL",
    durationDays: 0,
    durationHours: 15,
    durationMins: 4,
    durationSecs: 21,
    durationSeconds: 15 * 3600 + 4 * 60 + 21,
    timerUpdatedAt: new Date().toISOString(),
    targetQuota: 60,
    soldCount: 42,
    active: true
  },
  {
    id: 105,
    productId: 4,
    dealPrice: 38999,
    badge: "HOT DEAL",
    durationDays: 0,
    durationHours: 6,
    durationMins: 20,
    durationSecs: 15,
    durationSeconds: 6 * 3600 + 20 * 60 + 15,
    timerUpdatedAt: new Date().toISOString(),
    targetQuota: 40,
    soldCount: 33,
    active: true
  },
  {
    id: 106,
    productId: 6,
    dealPrice: 29999,
    badge: "HOT DEAL",
    durationDays: 0,
    durationHours: 9,
    durationMins: 27,
    durationSecs: 45,
    durationSeconds: 9 * 3600 + 27 * 60 + 45,
    timerUpdatedAt: new Date().toISOString(),
    targetQuota: 30,
    soldCount: 19,
    active: true
  }
];
