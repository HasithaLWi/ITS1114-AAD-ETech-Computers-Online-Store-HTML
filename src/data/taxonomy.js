// ============================================================
//  src/data/taxonomy.js — Central Categories & Badges Taxonomy
// ============================================================

export const DEFAULT_CATEGORIES = [
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

export const DEFAULT_BADGES = [
  {
    id: 'bdg-bestseller',
    name: 'Bestseller',
    slug: 'bestseller',
    color: 'blue',
    bgClass: 'bg-blue-50',
    textClass: 'text-blue-700',
    borderClass: 'border-blue-200',
    colorHex: '#2563eb',
    purpose: 'Highlights undisputed customer favorites and top sales volume leaders.',
    standardDescription: 'Automated: High sales volume & customer review count benchmark.',
    ruleType: 'automatic',
    criteria: 'bestseller',
    thresholds: {
      minReviews: 80
    },
    priority: 10,
    isActive: true,
    isSystemDefault: true,
    canEdit: true,
    canDelete: false
  },
  {
    id: 'bdg-hotdeal',
    name: 'Hot Deal',
    slug: 'hot-deal',
    color: 'rose',
    bgClass: 'bg-rose-50',
    textClass: 'text-rose-700',
    borderClass: 'border-rose-200',
    colorHex: '#e11d48',
    purpose: 'Draws attention to limited-time steep promotional discounts.',
    standardDescription: 'System Default: Exclusively managed and assigned via Hot Deals & Promotions module.',
    ruleType: 'system',
    criteria: 'system_hot_deal',
    thresholds: {},
    priority: 20,
    isActive: true,
    isSystemDefault: true,
    canEdit: false,
    canDelete: false
  },
  {
    id: 'bdg-newarrival',
    name: 'New Arrival',
    slug: 'new-arrival',
    color: 'emerald',
    bgClass: 'bg-emerald-50',
    textClass: 'text-emerald-700',
    borderClass: 'border-emerald-200',
    colorHex: '#059669',
    purpose: 'Spotlights newly cataloged hardware and latest generation releases.',
    standardDescription: 'Automated: Inventory item introduced within recent catalog batch.',
    ruleType: 'automatic',
    criteria: 'new_arrival',
    thresholds: {},
    priority: 15,
    isActive: true,
    isSystemDefault: true,
    canEdit: true,
    canDelete: false
  },
  {
    id: 'bdg-toprated',
    name: 'Top Rated',
    slug: 'top-rated',
    color: 'amber',
    bgClass: 'bg-amber-50',
    textClass: 'text-amber-700',
    borderClass: 'border-amber-200',
    colorHex: '#d97706',
    purpose: 'Showcases elite customer satisfaction and 5-star verified feedback.',
    standardDescription: 'Automated: Verified rating score and customer review count satisfy benchmark.',
    ruleType: 'automatic',
    criteria: 'rating_gte_48',
    thresholds: {
      minRating: 4.8,
      minReviews: 50
    },
    priority: 18,
    isActive: true,
    isSystemDefault: true,
    canEdit: true,
    canDelete: false
  },
  {
    id: 'bdg-popular',
    name: 'Popular',
    slug: 'popular',
    color: 'cyan',
    bgClass: 'bg-cyan-50',
    textClass: 'text-cyan-700',
    borderClass: 'border-cyan-200',
    colorHex: '#0891b2',
    purpose: 'Highlights items with high daily traffic and trending interest.',
    standardDescription: 'Automated: Customer review count reaches popularity benchmark.',
    ruleType: 'automatic',
    criteria: 'reviews_gte_40',
    thresholds: {
      minReviews: 40
    },
    priority: 12,
    isActive: true,
    isSystemDefault: false,
    canEdit: true,
    canDelete: true
  },
  {
    id: 'bdg-lowstock',
    name: 'Low Stock Alert',
    slug: 'low-stock-alert',
    color: 'rose',
    bgClass: 'bg-rose-50',
    textClass: 'text-rose-700',
    borderClass: 'border-rose-200',
    colorHex: '#e11d48',
    purpose: 'Signals urgency to customers and staff due to warehouse inventory scarcity.',
    standardDescription: 'Automated: Total inventory stock ≤ product low-stock threshold margin.',
    ruleType: 'automatic',
    criteria: 'low_stock_scarcity',
    thresholds: {
      maxStock: 5
    },
    priority: 25,
    isActive: true,
    isSystemDefault: false,
    canEdit: true,
    canDelete: true
  },
  {
    id: 'bdg-staffpick',
    name: 'Staff Pick',
    slug: 'staff-pick',
    color: 'purple',
    bgClass: 'bg-purple-50',
    textClass: 'text-purple-700',
    borderClass: 'border-purple-200',
    colorHex: '#9333ea',
    purpose: 'Curated technical recommendations endorsed by ETech certified engineers.',
    standardDescription: 'Manual: Hand-picked by warehouse technicians and branch administrators.',
    ruleType: 'manual',
    criteria: 'manual_curated',
    thresholds: {},
    priority: 5,
    isActive: true,
    isSystemDefault: false,
    canEdit: true,
    canDelete: true
  },
  {
    id: 'bdg-clearance',
    name: 'Clearance',
    slug: 'clearance',
    color: 'orange',
    bgClass: 'bg-orange-50',
    textClass: 'text-orange-700',
    borderClass: 'border-orange-200',
    colorHex: '#ea580c',
    purpose: 'Final liquidation inventory at heavily reduced clearance rates.',
    standardDescription: 'Manual: Liquidation batches, open-box or end-of-life catalog lines.',
    ruleType: 'manual',
    criteria: 'manual_clearance',
    thresholds: {},
    priority: 8,
    isActive: true,
    isSystemDefault: false,
    canEdit: true,
    canDelete: true
  }
];

export const defaultCategories = DEFAULT_CATEGORIES;
export const defaultBadges = DEFAULT_BADGES;
