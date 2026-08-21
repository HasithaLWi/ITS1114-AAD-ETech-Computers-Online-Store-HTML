// ETech Computers - Hot Deals Page Controller & Interactive System
import { products, getStoredProducts } from '../models/data.js';
import { addToCart, showToast } from './cart_controller.js';
import { viewProductDetails } from './product-details_controller.js';

// Curated Deals Dataset with accurate discounts, ratings, sold metrics, and categories
export const HOT_DEALS_DATA = [
  {
    id: 101,
    productId: 1,
    name: "ASUS GeForce RTX 4070 Super 12GB GDDR6X",
    category: "gpus",
    categoryLabel: "Graphics Cards",
    dealPrice: 259999,
    originalPrice: 289999,
    discountPercent: 25,
    savingAmount: 30000,
    rating: 4.8,
    reviews: 156,
    image: "https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=600&q=80",
    badge: "-25%",
    soldPercent: 78,
    timerSeconds: 5 * 3600 + 42 * 60 + 18,
    totalStock: 50,
    remainingStock: 11
  },
  {
    id: 102,
    productId: 2,
    name: "Acer Predator Helios Neo 16 i7-13700HX RTX 4060",
    category: "laptops",
    categoryLabel: "Laptops",
    dealPrice: 289999,
    originalPrice: 359999,
    discountPercent: 20,
    savingAmount: 70000,
    rating: 4.7,
    reviews: 98,
    image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=600&q=80",
    badge: "-20%",
    soldPercent: 62,
    timerSeconds: 8 * 3600 + 15 * 60 + 2,
    totalStock: 30,
    remainingStock: 11
  },
  {
    id: 103,
    productId: 3,
    name: "AMD Ryzen 7 7700X 8-Core Desktop Processor",
    category: "cpus",
    categoryLabel: "Processors",
    dealPrice: 97999,
    originalPrice: 139999,
    discountPercent: 30,
    savingAmount: 42000,
    rating: 4.9,
    reviews: 203,
    image: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=600&q=80",
    badge: "-30%",
    soldPercent: 45,
    timerSeconds: 11 * 3600 + 32 * 60 + 44,
    totalStock: 40,
    remainingStock: 22
  },
  {
    id: 104,
    productId: 8,
    name: "Corsair Vengeance RGB 32GB (16GBx2) DDR5 6000MHz",
    category: "ram",
    categoryLabel: "RAM",
    dealPrice: 37999,
    originalPrice: 45999,
    discountPercent: 18,
    savingAmount: 8000,
    rating: 4.8,
    reviews: 74,
    image: "https://images.unsplash.com/photo-1562976540-1502c2145186?auto=format&fit=crop&w=600&q=80",
    badge: "-18%",
    soldPercent: 70,
    timerSeconds: 15 * 3600 + 4 * 60 + 21,
    totalStock: 60,
    remainingStock: 18
  },
  {
    id: 105,
    productId: 3,
    name: "Vortex Ultra 34\" Curved QD-OLED Gaming Monitor",
    category: "monitors",
    categoryLabel: "Monitors",
    dealPrice: 229999,
    originalPrice: 279999,
    discountPercent: 18,
    savingAmount: 50000,
    rating: 4.9,
    reviews: 67,
    image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80",
    badge: "-18%",
    soldPercent: 82,
    timerSeconds: 6 * 3600 + 20 * 60 + 15,
    totalStock: 25,
    remainingStock: 4
  },
  {
    id: 106,
    productId: 4,
    name: "Precision Elite Wireless Gaming Mouse 26K DPI",
    category: "accessories",
    categoryLabel: "Accessories",
    dealPrice: 18999,
    originalPrice: 24999,
    discountPercent: 24,
    savingAmount: 6000,
    rating: 4.7,
    reviews: 210,
    image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=600&q=80",
    badge: "-24%",
    soldPercent: 55,
    timerSeconds: 9 * 3600 + 40 * 60 + 50,
    totalStock: 80,
    remainingStock: 36
  },
  {
    id: 107,
    productId: 6,
    name: "Immerse Pro 7.1 Spatial Wireless Headset",
    category: "accessories",
    categoryLabel: "Accessories",
    dealPrice: 34999,
    originalPrice: 42999,
    discountPercent: 19,
    savingAmount: 8000,
    rating: 4.6,
    reviews: 142,
    image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=600&q=80",
    badge: "-19%",
    soldPercent: 64,
    timerSeconds: 12 * 3600 + 10 * 60 + 30,
    totalStock: 45,
    remainingStock: 16
  },
  {
    id: 108,
    productId: 7,
    name: "Samsung 990 Pro 2TB PCIe 4.0 NVMe M.2 SSD",
    category: "storage",
    categoryLabel: "Storage",
    dealPrice: 48999,
    originalPrice: 59999,
    discountPercent: 18,
    savingAmount: 11000,
    rating: 4.9,
    reviews: 189,
    image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=600&q=80",
    badge: "-18%",
    soldPercent: 88,
    timerSeconds: 4 * 3600 + 15 * 60 + 10,
    totalStock: 50,
    remainingStock: 6
  }
];

// Module State
let activeDealCategory = 'all';
let countdownInterval = null;
let weekendSaleTimeSeconds = 2 * 86400 + 14 * 3600 + 38 * 60 + 21; // 2 days, 14 hrs, 38 mins, 21 secs
const flashDealTimers = new Map();
const wishlistDeals = new Set();

/**
 * Initializes the Hot Deals section
 */
export function initHotDealsLogic(queryPart = '') {
  // Parse query category if provided
  if (queryPart) {
    const params = new URLSearchParams(queryPart);
    const cat = params.get('cat') || params.get('category') || 'all';
    activeDealCategory = cat.toLowerCase();
  } else {
    activeDealCategory = 'all';
  }

  // Initialize individual flash deal timers if not set
  HOT_DEALS_DATA.forEach(deal => {
    if (!flashDealTimers.has(deal.id)) {
      flashDealTimers.set(deal.id, deal.timerSeconds);
    }
  });

  // Render Category Tabs
  renderDealCategoryTabs();

  // Render Flash Deals Cards
  renderFlashDealsGrid();

  // Start Realtime Countdown Loop
  startDealCountdowns();
}

/**
 * Starts global ticking intervals for all timers on the page
 */
function startDealCountdowns() {
  if (countdownInterval) clearInterval(countdownInterval);

  countdownInterval = setInterval(() => {
    // 1. Weekend Sale Main Countdown
    if (weekendSaleTimeSeconds > 0) {
      weekendSaleTimeSeconds--;
      updateWeekendSaleTimerDisplay();
    }

    // 2. Flash Deals Timers
    flashDealTimers.forEach((seconds, dealId) => {
      if (seconds > 0) {
        flashDealTimers.set(dealId, seconds - 1);
        updateFlashDealTimerDisplay(dealId, seconds - 1);
      }
    });

    // 3. Featured Deal Timer
    updateFeaturedDealTimerDisplay();
  }, 1000);

  // Immediate initial update
  updateWeekendSaleTimerDisplay();
  updateFeaturedDealTimerDisplay();
}

/**
 * Formats seconds into { days, hours, mins, secs }
 */
function formatTime(totalSeconds) {
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  return {
    days: String(days).padStart(2, '0'),
    hours: String(hours).padStart(2, '0'),
    mins: String(mins).padStart(2, '0'),
    secs: String(secs).padStart(2, '0')
  };
}

/**
 * Updates the Weekend Tech Sale countdown in the hero section
 */
function updateWeekendSaleTimerDisplay() {
  const t = formatTime(weekendSaleTimeSeconds);

  const daysEl = document.getElementById('deal-hero-timer-days');
  const hrsEl = document.getElementById('deal-hero-timer-hrs');
  const minsEl = document.getElementById('deal-hero-timer-mins');
  const secsEl = document.getElementById('deal-hero-timer-secs');

  if (daysEl) daysEl.textContent = t.days;
  if (hrsEl) hrsEl.textContent = t.hours;
  if (minsEl) minsEl.textContent = t.mins;
  if (secsEl) secsEl.textContent = t.secs;
}

/**
 * Updates the Featured Deal mini countdown
 */
function updateFeaturedDealTimerDisplay() {
  const t = formatTime(weekendSaleTimeSeconds);

  const daysEl = document.getElementById('deal-featured-timer-days');
  const hrsEl = document.getElementById('deal-featured-timer-hrs');
  const minsEl = document.getElementById('deal-featured-timer-mins');
  const secsEl = document.getElementById('deal-featured-timer-secs');

  if (daysEl) daysEl.textContent = t.days;
  if (hrsEl) hrsEl.textContent = t.hours;
  if (minsEl) minsEl.textContent = t.mins;
  if (secsEl) secsEl.textContent = t.secs;
}

/**
 * Updates a specific Flash Deal card's timer badge
 */
function updateFlashDealTimerDisplay(dealId, remainingSeconds) {
  const el = document.getElementById(`flash-timer-${dealId}`);
  if (!el) return;

  const hours = Math.floor(remainingSeconds / 3600);
  const mins = Math.floor((remainingSeconds % 3600) / 60);
  const secs = remainingSeconds % 60;

  const timeStr = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  el.textContent = timeStr;
}

/**
 * Category Definitions for the filter bar
 */
const DEAL_CATEGORIES = [
  { id: 'all', label: 'All Deals', icon: '🔥' },
  { id: 'laptops', label: 'Laptops', icon: '💻' },
  { id: 'gpus', label: 'Graphics Cards', icon: '🎮' },
  { id: 'cpus', label: 'Processors', icon: '⚙️' },
  { id: 'ram', label: 'RAM', icon: '🧠' },
  { id: 'storage', label: 'Storage', icon: '💾' },
  { id: 'monitors', label: 'Monitors', icon: '🖥️' },
  { id: 'accessories', label: 'Accessories', icon: '🎧' }
];

/**
 * Renders the Deal Category Filter Pills
 */
export function renderDealCategoryTabs() {
  const container = document.getElementById('deals-category-tabs');
  if (!container) return;

  container.innerHTML = DEAL_CATEGORIES.map(cat => {
    const isActive = activeDealCategory === cat.id;
    return `
      <button 
        onclick="filterDealsByCategory('${cat.id}')"
        class="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap shadow-sm ${
          isActive
            ? 'bg-blue-600 text-white shadow-blue-500/20'
            : 'bg-white text-[#475569] border border-[#e2e8f0] hover:text-blue-600 hover:border-blue-300 hover:bg-[#f8fafc]'
        }">
        <span>${cat.icon}</span>
        <span>${cat.label}</span>
      </button>
    `;
  }).join('');
}

/**
 * Handles category selection from the filter bar
 */
export function filterDealsByCategory(categoryId) {
  activeDealCategory = categoryId.toLowerCase();
  renderDealCategoryTabs();
  renderFlashDealsGrid();
}

/**
 * Renders the grid of Flash Deals cards
 */
export function renderFlashDealsGrid() {
  const container = document.getElementById('flash-deals-grid');
  if (!container) return;

  let filtered = HOT_DEALS_DATA;
  if (activeDealCategory !== 'all') {
    filtered = HOT_DEALS_DATA.filter(d => d.category.toLowerCase() === activeDealCategory);
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-12 text-center bg-white rounded-2xl border border-[#e2e8f0]">
        <div class="text-4xl mb-2">⚡</div>
        <h4 class="text-base font-bold text-[#0f172a]">No deals found for this category</h4>
        <p class="text-xs text-[#64748b] mt-1">Check back soon or explore our full hardware catalog.</p>
        <button onclick="filterDealsByCategory('all')" class="mt-4 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-500 transition-all">
          View All Deals
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(deal => {
    const isWishlisted = wishlistDeals.has(deal.id);
    const remainingSecs = flashDealTimers.get(deal.id) || deal.timerSeconds;
    const hours = Math.floor(remainingSecs / 3600);
    const mins = Math.floor((remainingSecs % 3600) / 60);
    const secs = remainingSecs % 60;
    const timeStr = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    return `
      <div class="group bg-white rounded-2xl border border-[#e2e8f0] p-4 flex flex-col justify-between hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/5 transition-all relative overflow-hidden">
        
        <div>
          <!-- Top Badges Row: Discount Badge & Live Timer -->
          <div class="flex items-center justify-between gap-2 mb-3">
            <span class="px-2.5 py-1 rounded-md bg-rose-500 text-white font-extrabold text-xs tracking-tight shadow-sm">
              ${deal.badge}
            </span>
            <div class="flex items-center space-x-1 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-[#475569] font-mono text-[11px] font-bold">
              <svg class="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span id="flash-timer-${deal.id}">${timeStr}</span>
            </div>
          </div>

          <!-- Product Image Showcase -->
          <div class="relative w-full h-44 rounded-xl bg-[#f8fafc] border border-slate-100 flex items-center justify-center p-3 mb-3 overflow-hidden cursor-pointer" onclick="viewProductDetails(${deal.productId})">
            <img 
              src="${deal.image}" 
              alt="${deal.name}" 
              class="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300">
          </div>

          <!-- Title -->
          <h3 
            onclick="viewProductDetails(${deal.productId})"
            class="text-sm font-bold text-[#0f172a] hover:text-blue-600 transition-colors line-clamp-2 leading-snug cursor-pointer mb-1.5" title="${deal.name}">
            ${deal.name}
          </h3>

          <!-- Rating -->
          <div class="flex items-center space-x-1.5 mb-2.5">
            <div class="flex text-amber-400 text-xs">
              ★
            </div>
            <span class="text-xs font-bold text-[#0f172a]">${deal.rating}</span>
            <span class="text-[11px] text-[#94a3b8]">(${deal.reviews})</span>
          </div>

          <!-- Price & Savings -->
          <div class="space-y-0.5 mb-3">
            <div class="flex items-baseline space-x-2">
              <span class="text-lg font-black text-blue-600 font-mono tracking-tight">Rs. ${deal.dealPrice.toLocaleString()}</span>
              <del class="text-xs text-[#94a3b8] font-mono">Rs. ${deal.originalPrice.toLocaleString()}</del>
            </div>
            <div class="text-[11px] font-extrabold text-rose-600 uppercase tracking-wide">
              SAVE Rs. ${deal.savingAmount.toLocaleString()}
            </div>
          </div>

          <!-- Sold Progress Bar -->
          <div class="space-y-1 mb-4">
            <div class="w-full bg-[#f1f5f9] h-2 rounded-full overflow-hidden border border-slate-200/60">
              <div 
                class="bg-gradient-to-r from-rose-500 to-amber-500 h-full rounded-full transition-all duration-500" 
                style="width: ${deal.soldPercent}%"></div>
            </div>
            <div class="flex justify-between items-center text-[10px] font-semibold text-[#64748b]">
              <span>${deal.soldPercent}% sold</span>
              <span class="text-amber-600 font-bold">${deal.remainingStock} left</span>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center space-x-2 pt-2 border-t border-[#f1f5f9]">
          <button 
            onclick="addToCart(${deal.productId})"
            class="flex-1 py-2.5 px-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center space-x-1.5 active:scale-95">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
            </svg>
            <span>Add to Cart</span>
          </button>
          
          <button 
            onclick="toggleDealWishlist(${deal.id}, this)" 
            class="p-2.5 rounded-xl border border-[#e2e8f0] hover:border-rose-300 hover:bg-rose-50 transition-all text-[#64748b] hover:text-rose-600 flex items-center justify-center shadow-sm"
            title="Add to Wishlist">
            <svg class="w-4 h-4 ${isWishlisted ? 'text-rose-600 fill-rose-600' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
          </button>
        </div>

      </div>
    `;
  }).join('');
}

/**
 * Toggles a deal in user's wishlist
 */
export function toggleDealWishlist(dealId, btnElement) {
  const deal = HOT_DEALS_DATA.find(d => d.id === dealId);
  if (!deal) return;

  if (wishlistDeals.has(dealId)) {
    wishlistDeals.delete(dealId);
    showToast(`Removed "${deal.name.split(' ')[0]}" from wishlist.`);
  } else {
    wishlistDeals.add(dealId);
    showToast(`Added "${deal.name.split(' ')[0]}" to your wishlist! ❤️`);
  }

  renderFlashDealsGrid();
}

/**
 * Handles purchase action for the Featured Deal Banner
 */
export function buyFeaturedDeal(productId = 1) {
  addToCart(productId, 1);
  window.location.hash = '#cart';
}

/**
 * Handles newsletter subscription submission
 */
export function handleDealsNewsletter(event) {
  if (event) event.preventDefault();
  const input = document.getElementById('deals-newsletter-email');
  if (!input) return;

  const email = input.value.trim();
  if (!email || !email.includes('@') || !email.includes('.')) {
    showToast('Please enter a valid email address.');
    return;
  }

  showToast('🎉 You are now subscribed to ETech VIP Deal Alerts!');
  input.value = '';
}
