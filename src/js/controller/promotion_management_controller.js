// promotion_management_controller.js — Administrator & Staff Deals & Promotions Management Controller
import {
  getHomeDealBanner,
  saveHomeDealBanner,
  getDealBundles,
  saveDealBundles,
  addDealBundle,
  updateDealBundle,
  deleteDealBundle,
  getAllDiscountsAndDeals,
  updateProductDiscount,
  calculateBundleInventory,
  normalizeBundleItems
} from '../models/deals_data.js';
import { getStoredProducts } from '../models/data.js';
import { getBadges } from '../models/taxonomy_data.js';
import { getBranches } from './branch_controller.js';
import { createStockTransfer } from '../models/transfers_data.js';
import { openInitiateTransferModal } from './transfer_management_controller.js';
import { showToast } from './cart_controller.js';
import { closeAdminModal } from './admin_dashboard_controller.js';

let activePromoSubTab = 'home-banner'; // 'home-banner' | 'hot-bundles' | 'discounts' | 'timer-presets'
let currentEditingBundleId = null;

/**
 * Main Entry Point: Renders the Promotions & Deals Tab in Admin Dashboard
 */
export function renderPromotionsTab() {
  const container = document.getElementById('promotions-tab-container');
  if (!container) return;

  const homeBanner = getHomeDealBanner();
  const bundles = getDealBundles();
  const discounts = getAllDiscountsAndDeals();

  container.innerHTML = `
    <div class="space-y-6">

      <!-- Header & Quick Actions -->
      <div class="bg-white border border-[#e2e8f0] rounded-xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center space-x-2">
            <span class="px-2.5 py-1 rounded bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-mono font-black uppercase">PROMOTIONS & DEALS ENGINE</span>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">LIVE SYNC</span>
          </div>
          <h2 class="text-xl font-extrabold text-[#0f172a] tracking-tight mt-1.5">Deals, Banners & Bundles Management</h2>
          <p class="text-xs text-[#64748b] mt-0.5">Control Home & Hot Deals banners, create promotional bundles with carousels, and manage store discounts.</p>
        </div>

        <!-- Quick 1-Week Deal Preset Trigger Button -->
        <div class="flex items-center space-x-2.5">
          <button onclick="handleQuickStartOneWeekDeal()" 
            class="px-4 py-2.5 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-extrabold text-xs rounded-lg shadow-md transition-all flex items-center space-x-2">
            <span>⚡</span>
            <span>Start 1-Week Deal Now</span>
          </button>
          <button onclick="openBundleFormPage(null)" 
            class="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg shadow-sm transition-all flex items-center space-x-1.5">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            <span>New Deal Bundle</span>
          </button>
        </div>
      </div>

      <!-- Promotions Sub-Navigation Tabs -->
      <div class="flex items-center space-x-2 overflow-x-auto pb-1">
        <button onclick="switchPromoSubTab('home-banner')"
          class="promo-subtab-btn px-4 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-2 ${
            activePromoSubTab === 'home-banner'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-[#475569] border border-[#e2e8f0] hover:bg-[#f8fafc] hover:text-[#0f172a]'
          }">
          <span>🏠</span>
          <span>Home Deal Banner (Image 1)</span>
        </button>

        <button onclick="switchPromoSubTab('hot-bundles')"
          class="promo-subtab-btn px-4 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-2 ${
            activePromoSubTab === 'hot-bundles'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-[#475569] border border-[#e2e8f0] hover:bg-[#f8fafc] hover:text-[#0f172a]'
          }">
          <span>🎠</span>
          <span>Featured Deal Carousel Bundles (Image 2 & 3)</span>
          <span class="px-1.5 py-0.2 bg-blue-100 text-blue-800 text-[10px] rounded-full font-mono font-bold">${bundles.length}</span>
        </button>

        <button onclick="switchPromoSubTab('discounts')"
          class="promo-subtab-btn px-4 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-2 ${
            activePromoSubTab === 'discounts'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-[#475569] border border-[#e2e8f0] hover:bg-[#f8fafc] hover:text-[#0f172a]'
          }">
          <span>🏷️</span>
          <span>All Discounts & Hot Deals</span>
          <span class="px-1.5 py-0.2 bg-slate-100 text-slate-700 text-[10px] rounded-full font-mono font-bold">${discounts.filter(d => d.discountPercent > 0).length}</span>
        </button>

        <button onclick="switchPromoSubTab('timer-presets')"
          class="promo-subtab-btn px-4 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-2 ${
            activePromoSubTab === 'timer-presets'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-[#475569] border border-[#e2e8f0] hover:bg-[#f8fafc] hover:text-[#0f172a]'
          }">
          <span>⏱️</span>
          <span>Deal Timing & Presets</span>
        </button>
      </div>

      <!-- Sub-Tab Content Containers -->
      <div id="promo-subtab-content">
        ${renderActiveSubTabContent(homeBanner, bundles, discounts)}
      </div>

    </div>
  `;

  // Attach live preview listeners for home banner form if active
  if (activePromoSubTab === 'home-banner') {
    attachHomeBannerLiveListeners();
  }
}

/**
 * Switch Sub Tab inside Promotions
 */
export function switchPromoSubTab(tabName) {
  activePromoSubTab = tabName;
  renderPromotionsTab();
}

/**
 * Renders appropriate content according to active sub-tab
 */
function renderActiveSubTabContent(homeBanner, bundles, discounts) {
  if (activePromoSubTab === 'home-banner') {
    return renderHomeBannerEditor(homeBanner);
  } else if (activePromoSubTab === 'hot-bundles') {
    return renderHotBundlesManager(bundles);
  } else if (activePromoSubTab === 'discounts') {
    return renderAllDiscountsTable(discounts);
  } else if (activePromoSubTab === 'timer-presets') {
    return renderTimingPresets(homeBanner);
  }
  return '';
}

/* ========================================================================== */
/* 1. HOME DEAL BANNER (IMAGE 1)                                              */
/* ========================================================================== */

function renderHomeBannerEditor(banner) {
  return `
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      <!-- Left 7 Cols: Editor Form -->
      <div class="lg:col-span-7 bg-white border border-[#e2e8f0] rounded-xl p-5 sm:p-6 shadow-sm space-y-4">
        <div class="border-b border-[#e2e8f0] pb-3">
          <h3 class="text-base font-extrabold text-[#0f172a]">Edit Home Page Weekend Tech Deal Banner</h3>
          <p class="text-xs text-[#64748b]">Configure headline, highlight text, background image, and countdown timer shown on store homepage.</p>
        </div>

        <form onsubmit="handleSaveHomeBanner(event)" class="space-y-4">
          
          <!-- Deal Tag -->
          <div>
            <label class="block text-xs font-bold text-[#0f172a] mb-1">Deal Header Tag</label>
            <input type="text" id="hb-tag" value="${banner.tag || 'WEEKEND TECH DEAL'}" required
              class="w-full px-3.5 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg text-xs font-semibold focus:border-blue-600 focus:outline-none">
          </div>

          <!-- Main Title & Highlight -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-[#0f172a] mb-1">Main Headline Line 1</label>
              <input type="text" id="hb-title" value="${banner.title || 'Upgrade your setup'}" required
                class="w-full px-3.5 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg text-xs font-semibold focus:border-blue-600 focus:outline-none">
            </div>
            <div>
              <label class="block text-xs font-bold text-[#0f172a] mb-1">Highlight Line 2</label>
              <input type="text" id="hb-title-highlight" value="${banner.titleHighlight || 'Save up to 20%'}" required
                class="w-full px-3.5 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg text-xs font-semibold focus:border-blue-600 focus:outline-none">
            </div>
          </div>

          <!-- Subtitle -->
          <div>
            <label class="block text-xs font-bold text-[#0f172a] mb-1">Subtitle Text</label>
            <input type="text" id="hb-subtitle" value="${banner.subtitle || 'on selected components'}" required
              class="w-full px-3.5 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg text-xs font-semibold focus:border-blue-600 focus:outline-none">
          </div>

          <!-- Background Image URL / Preset -->
          <div>
            <label class="block text-xs font-bold text-[#0f172a] mb-1">Banner Background Image URL</label>
            <div class="flex items-center space-x-2">
              <input type="text" id="hb-bg-image" value="${banner.bgImage || 'public/images/WEEKEND-TECH-DEAL-cart-bg.jpeg'}" required
                class="flex-1 px-3.5 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg text-xs font-semibold focus:border-blue-600 focus:outline-none">
              <button type="button" onclick="document.getElementById('hb-bg-image').value = 'public/images/WEEKEND-TECH-DEAL-cart-bg.jpeg'; updateHomeBannerLivePreview();"
                class="px-3 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] text-[#475569] text-xs font-bold rounded-lg hover:bg-[#f1f5f9]">
                Default
              </button>
            </div>
          </div>

          <!-- Countdown Timer Setting -->
          <div class="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-4 space-y-3">
            <span class="text-xs font-bold text-[#0f172a] uppercase tracking-wider block">⏱️ Countdown Timer Settings</span>
            
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <label class="block text-[10px] font-bold text-[#64748b] uppercase">Days</label>
                <input type="number" id="hb-days" min="0" max="30" value="${banner.durationDays || 2}"
                  class="w-full px-2.5 py-1.5 bg-white border border-[#e2e8f0] rounded-lg text-xs font-mono font-bold text-center">
              </div>
              <div>
                <label class="block text-[10px] font-bold text-[#64748b] uppercase">Hours</label>
                <input type="number" id="hb-hours" min="0" max="23" value="${banner.durationHours || 14}"
                  class="w-full px-2.5 py-1.5 bg-white border border-[#e2e8f0] rounded-lg text-xs font-mono font-bold text-center">
              </div>
              <div>
                <label class="block text-[10px] font-bold text-[#64748b] uppercase">Mins</label>
                <input type="number" id="hb-mins" min="0" max="59" value="${banner.durationMins || 31}"
                  class="w-full px-2.5 py-1.5 bg-white border border-[#e2e8f0] rounded-lg text-xs font-mono font-bold text-center">
              </div>
              <div>
                <label class="block text-[10px] font-bold text-[#64748b] uppercase">Secs</label>
                <input type="number" id="hb-secs" min="0" max="59" value="${banner.durationSecs || 59}"
                  class="w-full px-2.5 py-1.5 bg-white border border-[#e2e8f0] rounded-lg text-xs font-mono font-bold text-center">
              </div>
            </div>

            <!-- Quick Presets -->
            <div class="flex items-center space-x-2 pt-1">
              <span class="text-[10px] font-bold text-[#64748b]">Presets:</span>
              <button type="button" onclick="setHomeBannerTimerPreset(7, 0, 0, 0)" class="px-2 py-1 bg-white border border-[#e2e8f0] rounded text-[10px] font-bold text-[#475569] hover:text-blue-600">1 Week</button>
              <button type="button" onclick="setHomeBannerTimerPreset(3, 0, 0, 0)" class="px-2 py-1 bg-white border border-[#e2e8f0] rounded text-[10px] font-bold text-[#475569] hover:text-blue-600">3 Days</button>
              <button type="button" onclick="setHomeBannerTimerPreset(2, 14, 30, 0)" class="px-2 py-1 bg-white border border-[#e2e8f0] rounded text-[10px] font-bold text-[#475569] hover:text-blue-600">Weekend Special</button>
              <button type="button" onclick="setHomeBannerTimerPreset(1, 0, 0, 0)" class="px-2 py-1 bg-white border border-[#e2e8f0] rounded text-[10px] font-bold text-[#475569] hover:text-blue-600">24 Hours</button>
            </div>
          </div>

          <!-- CTA Button Text & Target Link -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-[#0f172a] mb-1">Button Text</label>
              <input type="text" id="hb-btn-text" value="${banner.buttonText || 'Shop Deals'}" required
                class="w-full px-3.5 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg text-xs font-semibold focus:border-blue-600 focus:outline-none">
            </div>
            <div>
              <label class="block text-xs font-bold text-[#0f172a] mb-1">Target Link</label>
              <input type="text" id="hb-target-url" value="${banner.targetUrl || '#deals'}" required
                class="w-full px-3.5 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg text-xs font-semibold focus:border-blue-600 focus:outline-none">
            </div>
          </div>

          <div class="pt-3 border-t border-[#e2e8f0] flex items-center justify-between">
            <div class="text-[11px] text-[#64748b]">
              Last updated: <span class="font-mono">${new Date(banner.lastUpdated || Date.now()).toLocaleTimeString()}</span>
            </div>
            <button type="submit" 
              class="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg shadow-md transition-all flex items-center space-x-1.5">
              <span>💾</span>
              <span>Save & Publish Live</span>
            </button>
          </div>

        </form>
      </div>

      <!-- Right 5 Cols: Real-Time Preview (Image 1 Style) -->
      <div class="lg:col-span-5 space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-xs font-extrabold text-[#0f172a] uppercase tracking-wider flex items-center space-x-1">
            <span>👁️</span>
            <span>Live Home Banner Preview</span>
          </span>
          <span class="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">REAL-TIME</span>
        </div>

        <div id="hb-live-preview-container" class="rounded-2xl overflow-hidden shadow-lg border border-slate-200">
          <!-- Rendered by updateHomeBannerLivePreview() -->
        </div>
      </div>

    </div>
  `;
}

function attachHomeBannerLiveListeners() {
  const ids = ['hb-tag', 'hb-title', 'hb-title-highlight', 'hb-subtitle', 'hb-bg-image', 'hb-days', 'hb-hours', 'hb-mins', 'hb-secs', 'hb-btn-text'];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', updateHomeBannerLivePreview);
    }
  });
  updateHomeBannerLivePreview();
}

function updateHomeBannerLivePreview() {
  const container = document.getElementById('hb-live-preview-container');
  if (!container) return;

  const tag = document.getElementById('hb-tag')?.value || 'WEEKEND TECH DEAL';
  const title = document.getElementById('hb-title')?.value || 'Upgrade your setup';
  const titleHighlight = document.getElementById('hb-title-highlight')?.value || 'Save up to 20%';
  const subtitle = document.getElementById('hb-subtitle')?.value || 'on selected components';
  const bgImage = document.getElementById('hb-bg-image')?.value || 'public/images/WEEKEND-TECH-DEAL-cart-bg.jpeg';
  const days = document.getElementById('hb-days')?.value || '02';
  const hours = document.getElementById('hb-hours')?.value || '14';
  const mins = document.getElementById('hb-mins')?.value || '31';
  const secs = document.getElementById('hb-secs')?.value || '59';
  const btnText = document.getElementById('hb-btn-text')?.value || 'Shop Deals';

  container.innerHTML = `
    <div
      class="min-h-[360px] text-white rounded-2xl p-6 shadow-md flex flex-col justify-between relative overflow-hidden bg-[#0042c6]"
      style="background-image: url('${bgImage}'); background-size: cover; background-position: center right; background-repeat: no-repeat;">
      
      <!-- Rosette Ribbon Badge Top Right -->
      <div class="absolute top-2 right-3 z-20 w-11 h-14 drop-shadow-md pointer-events-none">
        <svg viewBox="0 0 48 56" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
          <path d="M15 28L9 52L19 45L22 52L19 28" fill="#1d4ed8"/>
          <path d="M33 28L39 52L29 45L26 52L29 28" fill="#2563eb"/>
          <circle cx="24" cy="20" r="18" fill="#3b82f6" stroke="#ffffff" stroke-width="2.5"/>
          <circle cx="24" cy="20" r="14" fill="#1d4ed8"/>
          <text x="24" y="26" fill="white" font-size="16" font-weight="900" font-family="system-ui, sans-serif" text-anchor="middle">%</text>
        </svg>
      </div>

      <!-- Deal Details -->
      <div class="space-y-1.5 relative z-10 max-w-[270px]">
        <span class="text-[11px] font-mono font-extrabold uppercase tracking-widest text-white/90">
          ${tag}
        </span>
        <h3 class="text-2xl font-extrabold text-white tracking-tight leading-snug">
          ${title}<br>
          ${titleHighlight}<br>
          <span class="text-white/90 text-base font-medium">${subtitle}</span>
        </h3>
      </div>

      <!-- Countdown Timer Blocks -->
      <div class="my-4 grid grid-cols-4 gap-2 text-center relative z-10 max-w-[270px]">
        <div class="bg-[#0b2b80]/50 backdrop-blur-md rounded-lg py-2 px-1 border border-white/25">
          <span class="block text-base font-extrabold font-mono leading-none text-white">${String(days).padStart(2, '0')}</span>
          <span class="text-[9px] uppercase tracking-wider text-blue-100">Days</span>
        </div>
        <div class="bg-[#0b2b80]/50 backdrop-blur-md rounded-lg py-2 px-1 border border-white/25">
          <span class="block text-base font-extrabold font-mono leading-none text-white">${String(hours).padStart(2, '0')}</span>
          <span class="text-[9px] uppercase tracking-wider text-blue-100">Hours</span>
        </div>
        <div class="bg-[#0b2b80]/50 backdrop-blur-md rounded-lg py-2 px-1 border border-white/25">
          <span class="block text-base font-extrabold font-mono leading-none text-white">${String(mins).padStart(2, '0')}</span>
          <span class="text-[9px] uppercase tracking-wider text-blue-100">Mins</span>
        </div>
        <div class="bg-[#0b2b80]/50 backdrop-blur-md rounded-lg py-2 px-1 border border-white/25">
          <span class="block text-base font-extrabold font-mono leading-none text-white">${String(secs).padStart(2, '0')}</span>
          <span class="text-[9px] uppercase tracking-wider text-blue-100">Secs</span>
        </div>
      </div>

      <!-- CTA Button -->
      <div class="relative z-10">
        <span class="inline-flex items-center space-x-2 px-5 py-2.5 bg-white text-[#0f172a] font-bold text-xs rounded-lg shadow-md">
          <span>${btnText}</span>
          <svg class="w-3.5 h-3.5 text-[#0f172a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </span>
      </div>
    </div>
  `;
}

window.handleSaveHomeBanner = function(event) {
  if (event) event.preventDefault();

  const bannerData = {
    tag: document.getElementById('hb-tag').value.trim(),
    title: document.getElementById('hb-title').value.trim(),
    titleHighlight: document.getElementById('hb-title-highlight').value.trim(),
    subtitle: document.getElementById('hb-subtitle').value.trim(),
    bgImage: document.getElementById('hb-bg-image').value.trim(),
    durationDays: parseInt(document.getElementById('hb-days').value) || 0,
    durationHours: parseInt(document.getElementById('hb-hours').value) || 0,
    durationMins: parseInt(document.getElementById('hb-mins').value) || 0,
    durationSecs: parseInt(document.getElementById('hb-secs').value) || 0,
    buttonText: document.getElementById('hb-btn-text').value.trim(),
    targetUrl: document.getElementById('hb-target-url').value.trim()
  };

  saveHomeDealBanner(bannerData);
  window.dispatchEvent(new Event('productsUpdated'));
  showToast('✅ Home Page Weekend Tech Deal Banner saved & published live!');
  renderPromotionsTab();
};

window.setHomeBannerTimerPreset = function(days, hours, mins, secs) {
  if (document.getElementById('hb-days')) document.getElementById('hb-days').value = days;
  if (document.getElementById('hb-hours')) document.getElementById('hb-hours').value = hours;
  if (document.getElementById('hb-mins')) document.getElementById('hb-mins').value = mins;
  if (document.getElementById('hb-secs')) document.getElementById('hb-secs').value = secs;
  updateHomeBannerLivePreview();
};

/* ========================================================================== */
/* 2. FEATURED DEAL BUNDLES MANAGER & CAROUSEL CRUD (IMAGES 2 & 3)             */
/* ========================================================================== */

function renderHotBundlesManager(bundles) {
  return `
    <div class="space-y-6">
      
      <!-- Info Header -->
      <div class="bg-blue-50/70 border border-blue-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center text-lg shadow-sm">
            🎠
          </div>
          <div>
            <h4 class="text-sm font-bold text-[#0f172a]">DealHot Featured Deal Carousel Slides</h4>
            <p class="text-xs text-[#64748b]">These bundle packages cycle dynamically on the Hot Deals page showcase banner with interactive carousel controls (< > arrows & dot indicators).</p>
          </div>
        </div>
        <button onclick="openBundleFormPage(null)"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg shadow-sm transition-all flex items-center space-x-1.5 whitespace-nowrap">
          <span>+ Add New Slide</span>
        </button>
      </div>

      <!-- Bundles Grid / Cards List -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        ${bundles.map((bundle, index) => `
          <div class="bg-white border ${bundle.active ? 'border-[#e2e8f0]' : 'border-dashed border-slate-300 opacity-75'} rounded-2xl p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
            
            <!-- Top Slide Number Badge & Status -->
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center space-x-2">
                <span class="w-6 h-6 rounded-full bg-slate-900 text-white font-mono font-bold text-xs flex items-center justify-center">
                  ${index + 1}
                </span>
                <span class="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                  bundle.badge === 'BEST DEAL' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
                }">
                  ${bundle.badge}
                </span>
              </div>
              <button onclick="toggleBundleActiveStatus(${bundle.id})" 
                class="px-2.5 py-1 rounded text-[10px] font-bold ${
                  bundle.active 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100' 
                    : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                }">
                ${bundle.active ? '● Active in Carousel' : '○ Inactive'}
              </button>
            </div>

            <!-- Visual Showcase -->
            <div class="relative h-36 rounded-xl bg-gradient-to-br from-slate-900 to-blue-950 flex items-center justify-center p-3 mb-3 overflow-hidden">
              <img src="${bundle.image}" alt="${bundle.title}" class="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300">
              <span class="absolute bottom-2 left-2 text-[9px] font-mono text-blue-200 uppercase bg-black/40 px-2 py-0.5 rounded backdrop-blur-sm">
                ${bundle.eyebrow}
              </span>
            </div>

            <!-- Details -->
            <div class="space-y-1.5 mb-3 flex-1">
              <h4 class="text-sm font-extrabold text-[#0f172a] line-clamp-1">${bundle.title}</h4>
              <p class="text-xs text-[#64748b] line-clamp-1">${bundle.subtitle}</p>

              <!-- Specs Pills -->
              <div class="flex flex-wrap gap-1 pt-1">
                ${(bundle.specs || []).map(s => `
                  <span class="px-2 py-0.5 rounded bg-[#f1f5f9] text-[#334155] text-[10px] font-semibold flex items-center space-x-1">
                    <span>${s.icon || '🔹'}</span>
                    <span>${s.label}</span>
                  </span>
                `).join('')}
              </div>

              <!-- Price & Savings -->
              <div class="flex items-baseline space-x-2 pt-2">
                <span class="text-base font-extrabold font-mono text-blue-600">Rs. ${Number(bundle.price).toLocaleString()}</span>
                <del class="text-xs font-mono text-slate-400">Rs. ${Number(bundle.originalPrice).toLocaleString()}</del>
                <span class="text-[10px] font-bold text-amber-600">(-${bundle.savingPercent}%)</span>
              </div>

              <!-- Claimed Progress -->
              <div class="pt-1">
                <div class="flex justify-between text-[10px] font-semibold text-[#64748b] mb-0.5">
                  <span>${bundle.claimedPercent}% Claimed</span>
                  <span class="text-amber-600 font-bold">${bundle.stockLeft} units left</span>
                </div>
                <div class="w-full bg-[#f1f5f9] h-1.5 rounded-full overflow-hidden">
                  <div class="bg-gradient-to-r from-amber-400 to-amber-500 h-full rounded-full" style="width: ${bundle.claimedPercent}%"></div>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="pt-3 border-t border-[#f1f5f9] flex items-center justify-between gap-2">
              <button onclick="openBundleFormPage(${bundle.id})"
                class="flex-1 py-1.5 px-3 bg-[#f8fafc] hover:bg-blue-50 text-[#0f172a] hover:text-blue-600 border border-[#e2e8f0] hover:border-blue-300 font-bold text-xs rounded-lg transition-all flex items-center justify-center space-x-1">
                <span>✏️</span>
                <span>Edit Bundle</span>
              </button>
              <button onclick="handleDeleteBundle(${bundle.id})"
                class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200"
                title="Delete Bundle Slide">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              </button>
            </div>

          </div>
        `).join('')}
      </div>

    </div>
  `;
}

window.toggleBundleActiveStatus = function(id) {
  const bundles = getDealBundles();
  const bundle = bundles.find(b => b.id === Number(id));
  if (!bundle) return;

  updateDealBundle(id, { active: !bundle.active });
  showToast(`Bundle "${bundle.title}" is now ${!bundle.active ? 'Active in Carousel' : 'Inactive'}.`);
  renderPromotionsTab();
};

window.handleDeleteBundle = function(id) {
  if (confirm('Are you sure you want to delete this deal bundle slide?')) {
    deleteDealBundle(id);
    showToast('Deal bundle deleted.');
    renderPromotionsTab();
  }
};

/* ========================================================================== */
/* 3. ALL DISCOUNTS & HOT DEALS TABLE                                          */
/* ========================================================================== */

function renderAllDiscountsTable(discounts) {
  return `
    <div class="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
      
      <!-- Top Filters -->
      <div class="p-4 sm:p-5 border-b border-[#e2e8f0] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 class="text-sm font-extrabold text-[#0f172a]">Store Catalog Discounts & Promotional Deals</h3>
          <p class="text-xs text-[#64748b]">View, modify, and assign hot deal badges and percentage markdowns across all items.</p>
        </div>
        <div class="flex items-center space-x-2">
          <input type="text" id="discount-search-input" onkeyup="filterDiscountsTable(this.value)" placeholder="Search discounted products..."
            class="px-3 py-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg text-xs focus:border-blue-600 focus:outline-none w-56">
        </div>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs text-[#475569]">
          <thead class="bg-[#f8fafc] border-b border-[#e2e8f0] text-[10px] font-mono uppercase text-[#64748b] tracking-wider">
            <tr>
              <th class="p-3.5">Product</th>
              <th class="p-3.5">Category</th>
              <th class="p-3.5 text-right">Original Price</th>
              <th class="p-3.5 text-right">Deal Price</th>
              <th class="p-3.5 text-center">Discount</th>
              <th class="p-3.5 text-center">Promotional Badge</th>
              <th class="p-3.5 text-center">Stock</th>
              <th class="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody id="discounts-table-body" class="divide-y divide-[#e2e8f0]">
            ${discounts.map(p => `
              <tr class="hover:bg-[#f8fafc] transition-colors">
                <td class="p-3.5 flex items-center space-x-3">
                  <img src="${p.image}" class="w-9 h-9 object-contain rounded bg-[#f1f5f9] border border-slate-200 flex-shrink-0">
                  <div>
                    <span class="font-bold text-[#0f172a] block line-clamp-1">${p.name}</span>
                    <span class="text-[10px] font-mono text-[#94a3b8]">ID: #${p.id}</span>
                  </div>
                </td>
                <td class="p-3.5 capitalize font-semibold">${p.category}</td>
                <td class="p-3.5 text-right font-mono text-slate-400">Rs. ${Number(p.originalPrice || p.price).toLocaleString()}</td>
                <td class="p-3.5 text-right font-mono font-bold text-blue-600">Rs. ${Number(p.price).toLocaleString()}</td>
                <td class="p-3.5 text-center">
                  <span class="px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                    p.discountPercent > 0 ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-slate-50 text-slate-500'
                  }">
                    ${p.discountPercent > 0 ? `-${p.discountPercent}%` : 'None'}
                  </span>
                </td>
                <td class="p-3.5 text-center">
                  ${p.badge ? `<span class="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-amber-50 text-amber-800 border border-amber-200">${p.badge}</span>` : '<span class="text-slate-300">—</span>'}
                </td>
                <td class="p-3.5 text-center font-mono font-bold text-slate-700">${p.totalStock || 10}</td>
                <td class="p-3.5 text-right">
                  <button onclick="openEditDiscountModal(${p.id})"
                    class="px-3 py-1 bg-white hover:bg-blue-50 text-blue-600 border border-[#e2e8f0] hover:border-blue-300 font-bold rounded text-[11px] transition-all">
                    Edit Deal
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

    </div>
  `;
}

window.filterDiscountsTable = function(query) {
  const q = (query || '').toLowerCase();
  const rows = document.querySelectorAll('#discounts-table-body tr');
  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(q) ? '' : 'none';
  });
};

/* ========================================================================== */
/* 4. DEAL TIMING & PRESETS                                                    */
/* ========================================================================== */

function renderTimingPresets(banner) {
  return `
    <div class="bg-white border border-[#e2e8f0] rounded-xl p-6 shadow-sm max-w-2xl space-y-6">
      <div>
        <h3 class="text-base font-extrabold text-[#0f172a]">Global Deal Timing Engine & Presets</h3>
        <p class="text-xs text-[#64748b]">Trigger pre-configured sale durations across the store with a single click or customize date ranges.</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        <!-- Preset 1: 1-Week Flash Sale -->
        <div class="border border-blue-200 bg-blue-50/50 rounded-xl p-4 flex flex-col justify-between space-y-3">
          <div>
            <div class="flex items-center justify-between">
              <span class="text-xs font-mono font-extrabold uppercase text-blue-700">PRESET 01</span>
              <span class="text-lg">⚡</span>
            </div>
            <h4 class="text-sm font-bold text-[#0f172a] mt-1">1-Week Mega Tech Sale</h4>
            <p class="text-xs text-[#64748b] mt-0.5">Sets active timers across Home Banner & Deals Page to 7 Days (168 Hours).</p>
          </div>
          <button onclick="handleApplyPresetTimer(7, 0, 0, 0, '1-Week Mega Sale')" 
            class="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg shadow-sm transition-all">
            Apply 1-Week Preset
          </button>
        </div>

        <!-- Preset 2: Weekend 3-Day Special -->
        <div class="border border-rose-200 bg-rose-50/50 rounded-xl p-4 flex flex-col justify-between space-y-3">
          <div>
            <div class="flex items-center justify-between">
              <span class="text-xs font-mono font-extrabold uppercase text-rose-700">PRESET 02</span>
              <span class="text-lg">🔥</span>
            </div>
            <h4 class="text-sm font-bold text-[#0f172a] mt-1">Weekend 3-Day Blast</h4>
            <p class="text-xs text-[#64748b] mt-0.5">Sets active countdown to 72 Hours (3 Days) for weekend hardware discount events.</p>
          </div>
          <button onclick="handleApplyPresetTimer(3, 0, 0, 0, 'Weekend 3-Day Blast')" 
            class="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg shadow-sm transition-all">
            Apply 3-Day Preset
          </button>
        </div>

        <!-- Preset 3: 24-Hour Midnight Flash -->
        <div class="border border-amber-200 bg-amber-50/50 rounded-xl p-4 flex flex-col justify-between space-y-3">
          <div>
            <div class="flex items-center justify-between">
              <span class="text-xs font-mono font-extrabold uppercase text-amber-700">PRESET 03</span>
              <span class="text-lg">⏳</span>
            </div>
            <h4 class="text-sm font-bold text-[#0f172a] mt-1">24-Hour Midnight Rush</h4>
            <p class="text-xs text-[#64748b] mt-0.5">Rapid 24-hour urgency countdown for limited-quantity clearance items.</p>
          </div>
          <button onclick="handleApplyPresetTimer(1, 0, 0, 0, '24-Hour Midnight Rush')" 
            class="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-lg shadow-sm transition-all">
            Apply 24-Hour Preset
          </button>
        </div>

        <!-- Preset 4: Custom Countdown Range -->
        <div class="border border-slate-200 bg-slate-50 rounded-xl p-4 flex flex-col justify-between space-y-3">
          <div>
            <div class="flex items-center justify-between">
              <span class="text-xs font-mono font-extrabold uppercase text-slate-700">CUSTOM</span>
              <span class="text-lg">🎯</span>
            </div>
            <h4 class="text-sm font-bold text-[#0f172a] mt-1">Custom Time Range</h4>
            <p class="text-xs text-[#64748b] mt-0.5">Configure precise days, hours, and minutes for a customized marketing campaign.</p>
          </div>
          <button onclick="switchPromoSubTab('home-banner')" 
            class="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all">
            Configure Custom Range
          </button>
        </div>

      </div>

    </div>
  `;
}

window.handleApplyPresetTimer = function(days, hours, mins, secs, label) {
  saveHomeDealBanner({
    durationDays: days,
    durationHours: hours,
    durationMins: mins,
    durationSecs: secs
  });
  showToast(`⚡ Timer preset "${label}" applied to all active promotional banners!`);
  renderPromotionsTab();
};

window.handleQuickStartOneWeekDeal = function() {
  saveHomeDealBanner({
    durationDays: 7,
    durationHours: 0,
    durationMins: 0,
    durationSecs: 0
  });
  showToast('🎉 1-Week Promotional Deal successfully activated store-wide!');
  renderPromotionsTab();
};

/* ========================================================================== */
/* 2. DEDICATED DEAL BUNDLE SLIDE EDITOR WORKSPACE (FULL PAGE VIEW)          */
/* ========================================================================== */

/**
 * Open the dedicated Full Page Deal Bundle Slide Workspace with Composite Inventory & Logistics
 */
export function openBundleFormPage(bundleId = null) {
  const bundles = getDealBundles();
  const products = getStoredProducts();
  const branches = getBranches();
  const badges = getBadges().filter(b => b.isActive !== false);

  const bundle = bundleId ? bundles.find(b => b.id === Number(bundleId)) : null;
  currentEditingBundleId = bundle ? bundle.id : null;

  // Specs state array: [{ icon: '🎮', label: 'RTX 4070 Super' }, ...]
  let specsState = [];
  if (bundle && Array.isArray(bundle.specs) && bundle.specs.length > 0) {
    specsState = bundle.specs.map(s => ({ icon: s.icon || '🎮', label: s.label || '' }));
  } else {
    specsState = [
      { icon: '🎮', label: 'RTX 4070 Super' },
      { icon: '🧠', label: '32GB DDR5 RAM' },
      { icon: '💾', label: '1TB NVMe SSD' }
    ];
  }
  window.bundleFormSpecsState = specsState;

  // Included Items state array: [{ productId: 1, qty: 1, name: '...' }, ...]
  let itemsState = [];
  if (bundle && Array.isArray(bundle.bundleItems) && bundle.bundleItems.length > 0) {
    itemsState = normalizeBundleItems(bundle.bundleItems, products);
  } else {
    itemsState = [
      { productId: 1, qty: 1, name: products[0] ? products[0].name : "ASUS GeForce RTX 4070 Super" },
      { productId: 3, qty: 2, name: products[2] ? products[2].name : "Corsair Vengeance 16GB DDR5" },
      { productId: 4, qty: 1, name: products[3] ? products[3].name : "Samsung 990 PRO 1TB SSD" }
    ];
  }
  window.bundleFormItemsState = itemsState;

  // Hide all tab panels and display the dedicated Deal Bundle Form panel
  const tabPanels = document.querySelectorAll('.dashboard-tab-panel');
  tabPanels.forEach(panel => panel.classList.add('hidden'));

  const formPanel = document.getElementById('tab-panel-bundle-form');
  if (formPanel) formPanel.classList.remove('hidden');

  const container = document.getElementById('bundle-form-page-container');
  if (!container) return;

  const isEdit = bundle !== null;
  const inv = calculateBundleInventory({ ...bundle, bundleItems: itemsState }, products, branches);

  const initialPrice = bundle ? Number(bundle.price) : 259999;
  const initialOrigPrice = inv.calculatedMSRP > 0 ? inv.calculatedMSRP : (bundle ? Number(bundle.originalPrice) : 331997);
  const initialSavings = Math.max(0, initialOrigPrice - initialPrice);
  const initialSavingPercent = initialOrigPrice > 0 ? Math.round((initialSavings / initialOrigPrice) * 100) : 0;

  container.innerHTML = `
    <div class="space-y-6 max-w-7xl mx-auto pb-16">
      
      <!-- Top Action Navigation Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#e2e8f0] rounded-2xl p-5 sm:p-6 shadow-sm">
        <div class="flex items-center space-x-3.5">
          <button type="button" onclick="closeBundleFormPage()"
            class="p-2.5 rounded-xl bg-[#f8fafc] hover:bg-[#f1f5f9] text-[#475569] hover:text-[#0f172a] transition-all border border-[#e2e8f0] flex items-center space-x-2 text-xs font-bold shadow-sm">
            <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Bundles</span>
          </button>
          <div>
            <div class="flex items-center space-x-2 mb-0.5">
              <span class="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                ${isEdit ? `Editing Slide #${bundle.id}` : 'New Composite Deal Bundle'}
              </span>
              <span class="text-xs text-[#94a3b8]">/ Promotions & Logistics Engine</span>
            </div>
            <h2 class="text-xl font-extrabold text-[#0f172a] tracking-tight">
              ${isEdit ? `Edit Deal Bundle: ${bundle.title}` : 'Create Composite Deal Bundle Slide'}
            </h2>
            <p class="text-xs text-[#64748b] mt-0.5">Configure real catalog components, branch assembly logistics, automated claimed urgency, and live carousel preview.</p>
          </div>
        </div>

        <div class="flex items-center space-x-3">
          <button type="button" onclick="closeBundleFormPage()"
            class="px-4 py-2.5 rounded-xl bg-[#f8fafc] hover:bg-[#f1f5f9] text-[#475569] font-bold text-xs border border-[#e2e8f0] transition-all">
            Cancel
          </button>
          <button type="button" onclick="triggerBundleFormSubmit()"
            class="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-md transition-all flex items-center space-x-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <span>${isEdit ? 'Save Changes' : 'Publish Bundle Slide'}</span>
          </button>
        </div>
      </div>

      <!-- Main 2-Column Responsive Workspace Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        <!-- Left 8 Columns: Comprehensive Configuration Form -->
        <div class="lg:col-span-7 xl:col-span-8 space-y-5">
          <form id="full-bundle-form" onsubmit="handleSaveBundleFormPage(event)" class="space-y-5">

            <!-- Section 1: Campaign Identity & Dynamic Badges -->
            <div class="bg-white border border-[#e2e8f0] rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
              <div class="border-b border-[#e2e8f0] pb-3 flex items-center justify-between">
                <h3 class="text-xs font-extrabold text-[#0f172a] uppercase tracking-wider flex items-center space-x-2">
                  <span class="w-2 h-2 rounded-full bg-blue-600"></span>
                  <span>1. Bundle Campaign Identity & Badges</span>
                </h3>
                <span class="text-[10px] text-blue-600 font-mono font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">TAXONOMY SYNC</span>
              </div>

              <div class="space-y-3.5 text-xs">
                
                <!-- Dynamic Badge Preset Selector (from Taxonomy) -->
                <div>
                  <label class="block font-bold text-[#0f172a] mb-1.5">Top Badge Pill Tag (from Dynamic Badges)</label>
                  <div class="flex flex-wrap gap-2 mb-2">
                    ${badges.map(b => `
                      <button type="button" onclick="setBundleBadgeTag('${b.name.toUpperCase()}')"
                        class="px-2.5 py-1 rounded-lg border text-[11px] font-extrabold transition-all hover:border-blue-300 hover:bg-blue-50 bg-[#f8fafc] text-[#475569]">
                        ${b.name}
                      </button>
                    `).join('')}
                    <button type="button" onclick="setBundleBadgeTag('BEST DEAL')" class="px-2.5 py-1 rounded-lg border text-[11px] font-extrabold bg-[#f8fafc] text-[#475569]">BEST DEAL</button>
                    <button type="button" onclick="setBundleBadgeTag('HOT BUNDLE')" class="px-2.5 py-1 rounded-lg border text-[11px] font-extrabold bg-[#f8fafc] text-[#475569]">HOT BUNDLE</button>
                  </div>
                  <input type="text" id="bf-badge" value="${bundle ? bundle.badge : 'BEST DEAL'}" required oninput="updateBundleLivePreview()"
                    placeholder="e.g. BEST DEAL or HOT BUNDLE"
                    class="w-full px-3.5 py-2.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-[#0f172a] font-bold text-xs focus:border-blue-600 focus:outline-none">
                </div>

                <!-- Eyebrow Tag -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="block font-bold text-[#0f172a] mb-1">Eyebrow Sub-tag</label>
                    <input type="text" id="bf-eyebrow" value="${bundle ? bundle.eyebrow : 'FEATURED DEAL'}" required oninput="updateBundleLivePreview()"
                      placeholder="e.g. FEATURED DEAL or CREATOR WORKSTATION"
                      class="w-full px-3.5 py-2 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-[#0f172a] font-mono text-xs focus:border-blue-600 focus:outline-none">
                  </div>
                  <div>
                    <label class="block font-bold text-[#0f172a] mb-1">Lead Anchor Product ID (For Instant Buy)</label>
                    <input type="number" id="bf-product-id" value="${bundle ? (bundle.productId || 1) : 1}" min="1" required oninput="updateBundleLivePreview()"
                      class="w-full px-3.5 py-2 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-[#0f172a] font-mono text-xs focus:border-blue-600 focus:outline-none">
                  </div>
                </div>

                <!-- Bundle Title & Subtitle -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="block font-bold text-[#0f172a] mb-1">Bundle Main Title *</label>
                    <input type="text" id="bf-title" value="${bundle ? bundle.title : 'Ultimate Gaming Power'}" required oninput="updateBundleLivePreview()"
                      placeholder="e.g. Ultimate Gaming Power"
                      class="w-full px-3.5 py-2.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-[#0f172a] font-bold text-sm focus:border-blue-600 focus:outline-none">
                  </div>
                  <div>
                    <label class="block font-bold text-[#0f172a] mb-1">Subtitle / Headline *</label>
                    <input type="text" id="bf-subtitle" value="${bundle ? bundle.subtitle : 'Complete Your Dream Setup'}" required oninput="updateBundleLivePreview()"
                      placeholder="e.g. Complete Your Dream Setup"
                      class="w-full px-3.5 py-2.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-[#0f172a] text-xs focus:border-blue-600 focus:outline-none">
                  </div>
                </div>

              </div>
            </div>

            <!-- Section 2: Visual Graphic & Media -->
            <div class="bg-white border border-[#e2e8f0] rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
              <div class="border-b border-[#e2e8f0] pb-3 flex items-center justify-between">
                <h3 class="text-xs font-extrabold text-[#0f172a] uppercase tracking-wider flex items-center space-x-2">
                  <span class="w-2 h-2 rounded-full bg-indigo-600"></span>
                  <span>2. Hero Graphic & Showcase Visual</span>
                </h3>
                <span class="text-[10px] text-[#64748b] font-mono">Showcase Graphic</span>
              </div>

              <div class="space-y-3 text-xs">
                <div>
                  <label class="block font-bold text-[#0f172a] mb-1">Image URL or Local Asset Path</label>
                  <div class="flex items-center space-x-2">
                    <input type="text" id="bf-image" value="${bundle ? bundle.image : 'public/images/home-hero-image-1.png'}" required oninput="updateBundleLivePreview()"
                      placeholder="public/images/home-hero-image-1.png or https://..."
                      class="flex-1 px-3.5 py-2 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-[#0f172a] text-xs focus:border-blue-600 focus:outline-none">
                    <button type="button" onclick="document.getElementById('bf-image').value = 'public/images/home-hero-image-1.png'; updateBundleLivePreview();"
                      class="px-3 py-2 bg-[#f8fafc] hover:bg-[#f1f5f9] border border-[#e2e8f0] text-xs font-bold text-[#475569] rounded-xl transition-colors">
                      Default Hero
                    </button>
                  </div>
                </div>

                <!-- Preset Visual Suggestions -->
                <div class="pt-1">
                  <span class="text-[11px] text-[#64748b] font-semibold block mb-1.5">Quick Graphic Presets:</span>
                  <div class="flex flex-wrap gap-2">
                    <button type="button" onclick="document.getElementById('bf-image').value = 'public/images/home-hero-image-1.png'; updateBundleLivePreview();"
                      class="px-2.5 py-1 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] hover:bg-blue-50 text-[10px] font-bold text-[#475569]">
                      🖥️ ETech Master Rig (Default)
                    </button>
                    <button type="button" onclick="document.getElementById('bf-image').value = 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=600&q=80'; updateBundleLivePreview();"
                      class="px-2.5 py-1 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] hover:bg-blue-50 text-[10px] font-bold text-[#475569]">
                      ⚙️ Creator Workstation
                    </button>
                    <button type="button" onclick="document.getElementById('bf-image').value = 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80'; updateBundleLivePreview();"
                      class="px-2.5 py-1 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] hover:bg-blue-50 text-[10px] font-bold text-[#475569]">
                      🎮 Esports Battlestation
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Section 3: Hardware Specifications Badges Builder -->
            <div class="bg-white border border-[#e2e8f0] rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
              <div class="border-b border-[#e2e8f0] pb-3 flex items-center justify-between">
                <div>
                  <h3 class="text-xs font-extrabold text-[#0f172a] uppercase tracking-wider flex items-center space-x-2">
                    <span class="w-2 h-2 rounded-full bg-sky-600"></span>
                    <span>3. Hardware Specifications Badges</span>
                  </h3>
                  <p class="text-[11px] text-[#64748b] mt-0.5">High-impact highlight tags shown on the carousel banner slide.</p>
                </div>
                <button type="button" onclick="addBundleFormSpecInput()"
                  class="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs border border-blue-200 transition-colors flex items-center space-x-1 shadow-sm">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                  <span>+ Add Spec Badge</span>
                </button>
              </div>

              <div id="bundle-specs-inputs-container" class="space-y-2.5">
                <!-- Dynamically populated by renderBundleSpecsInputs() -->
              </div>
            </div>

            <!-- Section 4: Package Included Real Hardware Products (Composite Inventory) -->
            <div class="bg-white border border-[#e2e8f0] rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
              <div class="border-b border-[#e2e8f0] pb-3 flex items-center justify-between">
                <div>
                  <h3 class="text-xs font-extrabold text-[#0f172a] uppercase tracking-wider flex items-center space-x-2">
                    <span class="w-2 h-2 rounded-full bg-emerald-600"></span>
                    <span>4. Included Components Package Breakdown (Live Store Products)</span>
                  </h3>
                  <p class="text-[11px] text-[#64748b] mt-0.5">Select actual catalog items. Stock bottleneck and regular bundle price calculate automatically.</p>
                </div>
                <button type="button" onclick="addBundleFormProductItem()"
                  class="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs border border-emerald-200 transition-colors flex items-center space-x-1 shadow-sm">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                  <span>+ Add Store Product to Bundle</span>
                </button>
              </div>

              <div id="bundle-items-inputs-container" class="space-y-3">
                <!-- Dynamically populated by renderBundleItemsInputs() -->
              </div>
            </div>

            <!-- Section 4.5: Live Branch Assembly & Transfer Logistics Matrix -->
            <div class="bg-white border border-[#e2e8f0] rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
              <div class="border-b border-[#e2e8f0] pb-3 flex items-center justify-between">
                <div>
                  <h3 class="text-xs font-extrabold text-[#0f172a] uppercase tracking-wider flex items-center space-x-2">
                    <span class="w-2 h-2 rounded-full bg-purple-600"></span>
                    <span>5. Multi-Branch Assembly & Stock Logistics</span>
                  </h3>
                  <p class="text-[11px] text-[#64748b] mt-0.5">Live branch readiness matrix and 1-click inter-branch balancing.</p>
                </div>
                <span class="text-[10px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 font-bold font-mono">
                  LOGISTICS HUB
                </span>
              </div>

              <!-- Live Branch Assembly Matrix Container -->
              <div id="bundle-branch-assembly-matrix" class="space-y-3">
                <!-- Populated dynamically by updateBundleBranchMatrix() -->
              </div>
            </div>

            <!-- Section 6: Pricing, Savings & Auto Discount Calculation -->
            <div class="bg-white border border-[#e2e8f0] rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
              <div class="border-b border-[#e2e8f0] pb-3 flex items-center justify-between">
                <h3 class="text-xs font-extrabold text-[#0f172a] uppercase tracking-wider flex items-center space-x-2">
                  <span class="w-2 h-2 rounded-full bg-rose-600"></span>
                  <span>6. Pricing, Savings & Auto Calculation</span>
                </h3>
                <span id="bundle-savings-indicator-tag" class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  Save Rs. ${initialSavings.toLocaleString()} (${initialSavingPercent}%)
                </span>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label class="block font-bold text-[#0f172a] mb-1">Deal Bundle Price (Now Rs.) *</label>
                  <input type="number" id="bf-price" value="${initialPrice}" required oninput="updateBundleLivePreview()"
                    placeholder="259999"
                    class="w-full px-3.5 py-2.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-blue-600 font-bold font-mono text-sm focus:border-blue-600 focus:outline-none">
                </div>
                <div>
                  <div class="flex items-center justify-between mb-1">
                    <label class="font-bold text-[#0f172a]">Original Bundle Total (Was Rs.)</label>
                    <span class="text-[10px] text-emerald-600 font-bold">Auto-calculated MSRP</span>
                  </div>
                  <input type="number" id="bf-orig-price" value="${initialOrigPrice}" required oninput="updateBundleLivePreview()"
                    placeholder="289999"
                    class="w-full px-3.5 py-2.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-slate-500 font-bold font-mono text-sm focus:border-blue-600 focus:outline-none">
                </div>
              </div>
            </div>

            <!-- Section 7: Urgency, Sales Quota & Countdown Timer Engine -->
            <div class="bg-white border border-[#e2e8f0] rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
              <div class="border-b border-[#e2e8f0] pb-3 flex items-center justify-between">
                <h3 class="text-xs font-extrabold text-[#0f172a] uppercase tracking-wider flex items-center space-x-2">
                  <span class="w-2 h-2 rounded-full bg-amber-600"></span>
                  <span>7. Sales Quota, Stock Urgency & Countdown Timer</span>
                </h3>
                <span class="text-[10px] text-emerald-600 font-mono font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  REAL-TIME AUTOMATION
                </span>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label class="block font-bold text-[#0f172a] mb-1">Campaign Target Quota</label>
                  <input type="number" id="bf-target-quota" min="1" max="999" value="${bundle ? (bundle.targetQuota || 20) : 20}" required oninput="updateBundleLivePreview()"
                    class="w-full px-3.5 py-2 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-[#0f172a] font-bold font-mono text-xs focus:border-blue-600 focus:outline-none">
                  <span class="text-[10px] text-[#64748b] block mt-1">Initial promotion batch allocation</span>
                </div>

                <div>
                  <label class="block font-bold text-[#0f172a] mb-1">Live Units Sold</label>
                  <input type="number" id="bf-sold-count" min="0" value="${bundle ? (bundle.soldCount || 0) : 0}" oninput="updateBundleLivePreview()"
                    class="w-full px-3.5 py-2 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-emerald-600 font-bold font-mono text-xs focus:border-blue-600 focus:outline-none">
                  <span class="text-[10px] text-emerald-600 font-bold block mt-1">Increments on checkout</span>
                </div>

                <div>
                  <label class="block font-bold text-[#0f172a] mb-1">Available Bundles (Bottleneck)</label>
                  <input type="number" id="bf-stock" min="0" value="${inv.maxAvailableBundles}" readonly
                    class="w-full px-3.5 py-2 rounded-xl bg-slate-100 border border-[#e2e8f0] text-blue-600 font-bold font-mono text-xs cursor-not-allowed">
                  <span id="bf-claimed-display-note" class="text-[10px] text-blue-600 font-bold block mt-1">
                    ${inv.claimedPercent}% Claimed
                  </span>
                </div>
              </div>

              <!-- Hidden claimed input for form state compatibility -->
              <input type="hidden" id="bf-claimed" value="${inv.claimedPercent}">

              <!-- Countdown Duration Inputs -->
              <div class="pt-2 border-t border-[#e2e8f0]">
                <div class="flex items-center justify-between mb-2">
                  <label class="block font-bold text-[#0f172a] text-xs">Deal Countdown Duration</label>
                  <div class="flex items-center space-x-1.5">
                    <button type="button" onclick="setBundleFormPresetTimer(3, 0, 0, 0)" class="px-2 py-0.5 bg-[#f8fafc] hover:bg-blue-50 border border-[#e2e8f0] text-[10px] font-bold rounded">3-Day Weekend</button>
                    <button type="button" onclick="setBundleFormPresetTimer(1, 0, 0, 0)" class="px-2 py-0.5 bg-[#f8fafc] hover:bg-blue-50 border border-[#e2e8f0] text-[10px] font-bold rounded">24-Hour Flash</button>
                    <button type="button" onclick="setBundleFormPresetTimer(7, 0, 0, 0)" class="px-2 py-0.5 bg-[#f8fafc] hover:bg-blue-50 border border-[#e2e8f0] text-[10px] font-bold rounded">1-Week Mega</button>
                  </div>
                </div>
                <div class="grid grid-cols-4 gap-2 text-xs">
                  <div>
                    <span class="text-[10px] font-mono text-[#64748b] block mb-0.5">Days</span>
                    <input type="number" id="bf-days" min="0" max="30" value="${bundle ? (bundle.durationDays || 2) : 2}" oninput="updateBundleLivePreview()"
                      class="w-full px-2.5 py-1.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] text-center font-mono font-bold">
                  </div>
                  <div>
                    <span class="text-[10px] font-mono text-[#64748b] block mb-0.5">Hours</span>
                    <input type="number" id="bf-hours" min="0" max="23" value="${bundle ? (bundle.durationHours || 14) : 14}" oninput="updateBundleLivePreview()"
                      class="w-full px-2.5 py-1.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] text-center font-mono font-bold">
                  </div>
                  <div>
                    <span class="text-[10px] font-mono text-[#64748b] block mb-0.5">Minutes</span>
                    <input type="number" id="bf-mins" min="0" max="59" value="${bundle ? (bundle.durationMins || 30) : 30}" oninput="updateBundleLivePreview()"
                      class="w-full px-2.5 py-1.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] text-center font-mono font-bold">
                  </div>
                  <div>
                    <span class="text-[10px] font-mono text-[#64748b] block mb-0.5">Seconds</span>
                    <input type="number" id="bf-secs" min="0" max="59" value="${bundle ? (bundle.durationSecs || 0) : 0}" oninput="updateBundleLivePreview()"
                      class="w-full px-2.5 py-1.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] text-center font-mono font-bold">
                  </div>
                </div>
              </div>

            </div>

            <!-- Section 8: Carousel Status & Visibility -->
            <div class="bg-white border border-[#e2e8f0] rounded-2xl p-5 sm:p-6 shadow-sm flex items-center justify-between">
              <div>
                <h4 class="text-sm font-extrabold text-[#0f172a]">Active in DealHot Carousel</h4>
                <p class="text-xs text-[#64748b]">When enabled, this bundle appears live in the rotating banner showcase on the Hot Deals store page.</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" id="bf-active" ${bundle && bundle.active === false ? '' : 'checked'} onchange="updateBundleLivePreview()" class="sr-only peer">
                <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <!-- Bottom Action Buttons -->
            <div class="flex items-center justify-end space-x-3 pt-3">
              <button type="button" onclick="closeBundleFormPage()"
                class="px-5 py-2.5 rounded-xl bg-[#f8fafc] hover:bg-[#f1f5f9] text-[#475569] font-bold text-xs border border-[#e2e8f0] transition-all">
                Cancel
              </button>
              <button type="submit"
                class="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-md transition-all">
                ${isEdit ? 'Save Changes' : 'Publish Deal Bundle'}
              </button>
            </div>

          </form>
        </div>

        <!-- Right 4 Columns: Interactive Live Carousel Banner Preview -->
        <div class="lg:col-span-5 xl:col-span-4 space-y-4 sticky top-6">
          <div class="bg-white border border-[#e2e8f0] rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
            <div class="flex items-center justify-between border-b border-[#e2e8f0] pb-2.5">
              <span class="text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center space-x-1.5">
                <span>👁️</span>
                <span>Live Carousel Slide Preview</span>
              </span>
              <span class="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[9px] font-mono font-bold border border-blue-200">REAL-TIME</span>
            </div>

            <!-- Dynamic Live Preview Banner Card -->
            <div id="bundle-live-preview-card"></div>

            <!-- Included Items Preview Box -->
            <div id="bundle-live-items-preview" class="pt-2"></div>
          </div>
        </div>

      </div>

    </div>
  `;

  // Render sub-sections & initial live preview
  renderBundleSpecsInputs();
  renderBundleItemsInputs();
  updateBundleBranchMatrix();
  updateBundleLivePreview();
}

/**
 * Trigger form submission from external action bar button
 */
export function triggerBundleFormSubmit() {
  const form = document.getElementById('deal-bundle-fullpage-form') || document.getElementById('full-bundle-form');
  if (form) {
    if (typeof form.requestSubmit === 'function') {
      form.requestSubmit();
    } else {
      form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    }
  } else {
    handleSaveBundleFormPage();
  }
}

/**
 * Return back to the Promotions Management -> Hot Bundles tab
 */
export function closeBundleFormPage() {
  const formPanel = document.getElementById('tab-panel-bundle-form');
  if (formPanel) formPanel.classList.add('hidden');

  const promoPanel = document.getElementById('tab-panel-promotions');
  if (promoPanel) promoPanel.classList.remove('hidden');

  switchPromoSubTab('hot-bundles');
}

/**
 * Quick Badge Tag Selector Helper
 */
export function setBundleBadgeTag(tag) {
  const badgeInput = document.getElementById('bf-badge');
  if (badgeInput) {
    badgeInput.value = tag;
    updateBundleLivePreview();
  }
}

/**
 * Quick Timer Preset Helper
 */
export function setBundleFormPresetTimer(days, hours, mins, secs) {
  const d = document.getElementById('bf-days');
  const h = document.getElementById('bf-hours');
  const m = document.getElementById('bf-mins');
  const s = document.getElementById('bf-secs');

  if (d) d.value = days;
  if (h) h.value = hours;
  if (m) m.value = mins;
  if (s) s.value = secs;

  updateBundleLivePreview();
}

/**
 * Render dynamic Spec Badges inputs
 */
export function renderBundleSpecsInputs() {
  const container = document.getElementById('bundle-specs-inputs-container');
  if (!container) return;

  const specs = window.bundleFormSpecsState || [];

  if (specs.length === 0) {
    container.innerHTML = `
      <div class="text-center py-4 bg-[#f8fafc] rounded-xl border border-dashed border-[#e2e8f0] text-xs text-[#64748b]">
        No specification badges added yet. Click "+ Add Spec Badge" above.
      </div>
    `;
    return;
  }

  container.innerHTML = specs.map((s, idx) => `
    <div class="flex items-center space-x-2 bg-[#f8fafc] p-2 rounded-xl border border-[#e2e8f0]">
      <input type="text" value="${s.icon || '🎮'}" placeholder="🎮" oninput="updateBundleFormSpec(${idx}, 'icon', this.value)"
        class="w-12 px-2 py-1.5 text-center rounded-lg bg-white border border-[#e2e8f0] text-xs font-bold focus:border-blue-600 focus:outline-none">
      <input type="text" value="${s.label || ''}" placeholder="e.g. RTX 4070 Super or 32GB RAM" oninput="updateBundleFormSpec(${idx}, 'label', this.value)"
        class="flex-1 px-3 py-1.5 rounded-lg bg-white border border-[#e2e8f0] text-[#0f172a] text-xs font-semibold focus:border-blue-600 focus:outline-none">
      <button type="button" onclick="removeBundleFormSpec(${idx})"
        class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200" title="Remove spec">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
      </button>
    </div>
  `).join('');
}

export function addBundleFormSpecInput() {
  if (!window.bundleFormSpecsState) window.bundleFormSpecsState = [];
  window.bundleFormSpecsState.push({ icon: '🔹', label: '' });
  renderBundleSpecsInputs();
  updateBundleLivePreview();
}

export function removeBundleFormSpec(index) {
  if (!window.bundleFormSpecsState) return;
  window.bundleFormSpecsState.splice(index, 1);
  renderBundleSpecsInputs();
  updateBundleLivePreview();
}

export function updateBundleFormSpec(index, field, value) {
  if (!window.bundleFormSpecsState || !window.bundleFormSpecsState[index]) return;
  window.bundleFormSpecsState[index][field] = value;
  updateBundleLivePreview();
}

/**
 * Render dynamic Package Included Product Items with Search/Selector
 */
export function renderBundleItemsInputs() {
  const container = document.getElementById('bundle-items-inputs-container');
  if (!container) return;

  const products = getStoredProducts();
  const items = window.bundleFormItemsState || [];

  if (items.length === 0) {
    container.innerHTML = `
      <div class="text-center py-4 bg-[#f8fafc] rounded-xl border border-dashed border-[#e2e8f0] text-xs text-[#64748b]">
        No catalog products added to this bundle yet. Click "+ Add Store Product to Bundle" above.
      </div>
    `;
    return;
  }

  container.innerHTML = items.map((item, idx) => {
    const product = products.find(p => p.id === Number(item.productId)) || products[0];
    const unitPrice = product ? Number(product.price) : 0;
    const lineTotal = unitPrice * (item.qty || 1);
    const stockAvailable = product ? product.totalStock : 0;

    return `
      <div class="p-3.5 bg-[#f8fafc] rounded-2xl border border-[#e2e8f0] space-y-2.5">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <span class="w-6 h-6 rounded-full bg-blue-600 text-white text-[11px] font-mono font-bold flex items-center justify-center">
              ${idx + 1}
            </span>
            <span class="text-xs font-extrabold text-[#0f172a]">Component Item #${idx + 1}</span>
          </div>

          <button type="button" onclick="removeBundleFormItem(${idx})"
            class="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center space-x-1 p-1 hover:bg-rose-50 rounded-lg transition-colors">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            <span>Remove Product</span>
          </button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          
          <!-- Product Selector Dropdown -->
          <div class="sm:col-span-8">
            <label class="block text-[10px] font-mono font-bold text-[#64748b] mb-1">STORE CATALOG PRODUCT *</label>
            <select onchange="updateBundleFormItemProduct(${idx}, this.value)"
              class="w-full px-3 py-2 rounded-xl bg-white border border-[#e2e8f0] text-xs font-bold text-[#0f172a] focus:border-blue-600 focus:outline-none">
              ${products.map(p => `
                <option value="${p.id}" ${product && product.id === p.id ? 'selected' : ''}>
                  ${p.name} (SKU: ${p.sku} | Rs. ${p.price.toLocaleString()} | Stock: ${p.totalStock})
                </option>
              `).join('')}
            </select>
          </div>

          <!-- Quantity Stepper -->
          <div class="sm:col-span-4">
            <label class="block text-[10px] font-mono font-bold text-[#64748b] mb-1">QUANTITY PER BUNDLE</label>
            <div class="flex items-center space-x-2">
              <input type="number" min="1" max="50" value="${item.qty || 1}" oninput="updateBundleFormItemQty(${idx}, this.value)"
                class="w-20 px-3 py-2 rounded-xl bg-white border border-[#e2e8f0] text-xs font-mono font-bold text-center focus:border-blue-600 focus:outline-none">
              <div class="text-[11px] font-mono font-bold text-[#64748b]">
                <span>x Rs. ${unitPrice.toLocaleString()} = </span>
                <span class="text-blue-600">Rs. ${lineTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>

        </div>

        <!-- Live Stock & Branch Availability Pill -->
        <div class="flex flex-wrap items-center justify-between pt-2 border-t border-slate-200/80 text-[11px]">
          <div class="flex items-center space-x-2">
            <span class="font-bold text-[#64748b]">Available in Store:</span>
            <span class="font-mono font-extrabold ${stockAvailable > 0 ? 'text-emerald-600' : 'text-rose-600'}">
              ${stockAvailable} units total
            </span>
            <span class="text-slate-400">|</span>
            <span class="font-mono text-blue-600 font-bold">
              Can make: ${Math.floor(stockAvailable / (item.qty || 1))} bundle kits
            </span>
          </div>

          <div class="text-[10px] text-slate-400 font-mono">
            SKU: ${product ? product.sku : 'N/A'}
          </div>
        </div>

      </div>
    `;
  }).join('');
}

export function addBundleFormProductItem() {
  if (!window.bundleFormItemsState) window.bundleFormItemsState = [];
  const products = getStoredProducts();
  const defaultProd = products[0] || { id: 1, name: 'Hardware Component' };
  window.bundleFormItemsState.push({ productId: defaultProd.id, qty: 1, name: defaultProd.name });
  renderBundleItemsInputs();
  updateBundleBranchMatrix();
  updateBundleLivePreview();
}

export function removeBundleFormItem(index) {
  if (!window.bundleFormItemsState) return;
  window.bundleFormItemsState.splice(index, 1);
  renderBundleItemsInputs();
  updateBundleBranchMatrix();
  updateBundleLivePreview();
}

export function updateBundleFormItemProduct(index, productId) {
  if (!window.bundleFormItemsState || !window.bundleFormItemsState[index]) return;
  const products = getStoredProducts();
  const prod = products.find(p => p.id === Number(productId));
  window.bundleFormItemsState[index].productId = Number(productId);
  window.bundleFormItemsState[index].name = prod ? prod.name : `Product #${productId}`;
  renderBundleItemsInputs();
  updateBundleBranchMatrix();
  updateBundleLivePreview();
}

export function updateBundleFormItemQty(index, qty) {
  if (!window.bundleFormItemsState || !window.bundleFormItemsState[index]) return;
  window.bundleFormItemsState[index].qty = Math.max(1, parseInt(qty) || 1);
  renderBundleItemsInputs();
  updateBundleBranchMatrix();
  updateBundleLivePreview();
}

// Named Aliases for ES module consumers
export const addBundleFormItemInput = addBundleFormProductItem;
export const updateBundleFormItem = updateBundleFormItemProduct;

/**
 * Updates the Multi-Branch Assembly Matrix and Logistics transfer helper
 */
export function updateBundleBranchMatrix() {
  const container = document.getElementById('bundle-branch-assembly-matrix');
  if (!container) return;

  const products = getStoredProducts();
  const branches = getBranches();
  const items = window.bundleFormItemsState || [];

  const inv = calculateBundleInventory({ bundleItems: items }, products, branches);

  if (items.length === 0) {
    container.innerHTML = `
      <div class="text-center py-4 bg-[#f8fafc] rounded-xl border border-dashed border-[#e2e8f0] text-xs text-[#64748b]">
        Add components to evaluate multi-branch assembly readiness.
      </div>
    `;
    return;
  }

  // Check if primary hub (Colombo) has complete kits
  const colomboKits = (inv.branchAssembly['BR-COL'] && inv.branchAssembly['BR-COL'].readyKits) || 0;
  const totalCompanyKits = inv.maxAvailableBundles;
  const missingInColombo = Math.max(0, totalCompanyKits - colomboKits);

  container.innerHTML = `
    <!-- Branch Assembly KPI Pills -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
      ${branches.map(b => {
        const ready = (inv.branchAssembly[b.id] && inv.branchAssembly[b.id].readyKits) || 0;
        return `
          <div class="p-3 rounded-xl border ${ready > 0 ? 'bg-blue-50/60 border-blue-200' : 'bg-slate-50 border-slate-200 opacity-75'} text-center space-y-0.5">
            <span class="text-[10px] font-bold text-[#64748b] block uppercase tracking-wider">${b.city} Hub</span>
            <span class="text-base font-extrabold font-mono ${ready > 0 ? 'text-blue-700' : 'text-slate-400'}">${ready} Ready</span>
            <span class="text-[9px] text-[#64748b] block">${ready > 0 ? 'Complete Kit in Stock' : 'Incomplete Kit'}</span>
          </div>
        `;
      }).join('')}
    </div>

    <!-- Component by Branch Table -->
    <div class="border border-[#e2e8f0] rounded-xl overflow-hidden text-xs">
      <table class="w-full text-left">
        <thead class="bg-[#f8fafc] text-[10px] font-mono uppercase text-[#64748b] border-b border-[#e2e8f0]">
          <tr>
            <th class="p-2.5">Component</th>
            <th class="p-2.5 text-center">Req Qty</th>
            <th class="p-2.5 text-center">Colombo</th>
            <th class="p-2.5 text-center">Galle</th>
            <th class="p-2.5 text-center">Matara</th>
            <th class="p-2.5 text-center">Kandy</th>
            <th class="p-2.5 text-center">Total Stock</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-[#e2e8f0]">
          ${inv.componentsBreakdown.map(comp => `
            <tr class="hover:bg-[#f8fafc]">
              <td class="p-2.5 font-bold text-[#0f172a]">
                <div class="line-clamp-1">${comp.name}</div>
                <div class="text-[9px] font-mono text-blue-600">${comp.sku}</div>
              </td>
              <td class="p-2.5 text-center font-mono font-bold text-[#0f172a]">${comp.qty}</td>
              <td class="p-2.5 text-center font-mono ${comp.branchStock['BR-COL'] >= comp.qty ? 'text-emerald-600 font-bold' : 'text-rose-500 font-bold'}">
                ${comp.branchStock['BR-COL'] || 0}
              </td>
              <td class="p-2.5 text-center font-mono ${comp.branchStock['BR-GAL'] >= comp.qty ? 'text-emerald-600' : 'text-slate-400'}">
                ${comp.branchStock['BR-GAL'] || 0}
              </td>
              <td class="p-2.5 text-center font-mono ${comp.branchStock['BR-MAT'] >= comp.qty ? 'text-emerald-600' : 'text-slate-400'}">
                ${comp.branchStock['BR-MAT'] || 0}
              </td>
              <td class="p-2.5 text-center font-mono ${comp.branchStock['BR-KND'] >= comp.qty ? 'text-emerald-600' : 'text-slate-400'}">
                ${comp.branchStock['BR-KND'] || 0}
              </td>
              <td class="p-2.5 text-center font-mono font-extrabold text-[#0f172a]">
                ${comp.totalStock}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <!-- Smart Inter-Branch Rebalancing Logistics Banner -->
    <div class="p-3.5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <div>
        <div class="flex items-center space-x-2">
          <span class="text-sm">🚚</span>
          <span class="font-extrabold text-xs text-blue-900">Inter-Branch Stock Transfer Engine</span>
        </div>
        <p class="text-[11px] text-blue-700 mt-0.5">
          ${missingInColombo > 0 
            ? `Parts for <strong>${missingInColombo}</strong> additional bundles exist across branches. Transfer parts to Colombo Main Hub to enable ready-to-ship dispatch.`
            : `Colombo Main Hub is fully stocked with <strong>${colomboKits}</strong> complete ready-to-ship bundle kits!`
          }
        </p>
      </div>

      <button type="button" onclick="openInitiateTransferModal({ reason: 'Deal Bundle Kit Assembly', notes: 'Transferring parts to Colombo Hub to assemble bundle kits.' })"
        class="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-sm transition-all whitespace-nowrap flex items-center space-x-1.5">
        <span>+ Transfer Parts for Kit</span>
      </button>
    </div>
  `;
}

/**
 * Update the interactive Real-Time Live Preview card on the right
 */
export function updateBundleLivePreview() {
  const previewContainer = document.getElementById('bundle-live-preview-card');
  const itemsContainer = document.getElementById('bundle-live-items-preview');
  if (!previewContainer) return;

  const products = getStoredProducts();
  const branches = getBranches();
  const items = window.bundleFormItemsState || [];

  const inv = calculateBundleInventory({ bundleItems: items }, products, branches);

  // Auto-update Original Price field if changed
  const origPriceInput = document.getElementById('bf-orig-price');
  if (origPriceInput && inv.calculatedMSRP > 0 && (!origPriceInput.value || Number(origPriceInput.value) === 0)) {
    origPriceInput.value = inv.calculatedMSRP;
  }

  const badge = document.getElementById('bf-badge')?.value || 'BEST DEAL';
  const eyebrow = document.getElementById('bf-eyebrow')?.value || 'FEATURED DEAL';
  const title = document.getElementById('bf-title')?.value || 'Ultimate Gaming Power';
  const subtitle = document.getElementById('bf-subtitle')?.value || 'Complete Your Dream Setup';
  const image = document.getElementById('bf-image')?.value || 'public/images/home-hero-image-1.png';
  const price = Number(document.getElementById('bf-price')?.value) || 259999;
  const origPrice = Number(document.getElementById('bf-orig-price')?.value) || (inv.calculatedMSRP > 0 ? inv.calculatedMSRP : 289999);
  
  const soldCount = Number(document.getElementById('bf-sold-count')?.value) || (bundle ? (bundle.soldCount || 0) : 0);
  const targetQuota = Number(document.getElementById('bf-target-quota')?.value) || 20;
  
  const stockLeft = inv.maxAvailableBundles;
  
  // Calculate dynamic claimed %
  let claimedPercent = 0;
  if (soldCount + stockLeft > 0) {
    claimedPercent = Math.min(99, Math.max(5, Math.round((soldCount / (soldCount + stockLeft)) * 100)));
  } else {
    claimedPercent = 95;
  }

  // Update hidden claimed and display note
  const claimedHidden = document.getElementById('bf-claimed');
  if (claimedHidden) claimedHidden.value = claimedPercent;
  
  const stockInput = document.getElementById('bf-stock');
  if (stockInput) stockInput.value = stockLeft;

  const claimedNote = document.getElementById('bf-claimed-display-note');
  if (claimedNote) claimedNote.textContent = `${claimedPercent}% Claimed (${soldCount} sold / ${stockLeft} left)`;

  const days = String(document.getElementById('bf-days')?.value || '02').padStart(2, '0');
  const hrs = String(document.getElementById('bf-hours')?.value || '14').padStart(2, '0');
  const mins = String(document.getElementById('bf-mins')?.value || '30').padStart(2, '0');
  const secs = String(document.getElementById('bf-secs')?.value || '00').padStart(2, '0');
  const isActive = document.getElementById('bf-active')?.checked !== false;

  const savings = Math.max(0, origPrice - price);
  const savingPercent = origPrice > 0 ? Math.round((savings / origPrice) * 100) : 0;

  // Update savings tag on form section
  const savingsIndicator = document.getElementById('bundle-savings-indicator-tag');
  if (savingsIndicator) {
    savingsIndicator.textContent = `Save Rs. ${savings.toLocaleString()} (${savingPercent}%)`;
  }

  const specs = window.bundleFormSpecsState || [];
  const validSpecs = specs.filter(s => s.label && s.label.trim() !== '');

  previewContainer.innerHTML = `
    <div class="bg-gradient-to-r from-[#0b1329] via-[#0f2766] to-[#1d4ed8] text-white rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden transition-all duration-300">
      
      <!-- Subtle Glow Orbs -->
      <div class="absolute -right-16 -bottom-16 w-48 h-48 bg-blue-500/20 rounded-full blur-2xl pointer-events-none"></div>
      <div class="absolute top-0 left-1/4 w-36 h-36 bg-indigo-500/20 rounded-full blur-xl pointer-events-none"></div>

      <!-- Top Row: Badge & Status -->
      <div class="flex items-center justify-between mb-3 relative z-10">
        <span class="px-2.5 py-0.5 rounded-full ${
          badge === 'BEST DEAL' ? 'bg-rose-600' : 'bg-blue-600'
        } text-white font-extrabold text-[9px] uppercase tracking-wider shadow-sm">
          ${badge}
        </span>
        <span class="text-[10px] font-mono font-bold ${isActive ? 'text-emerald-300 bg-emerald-500/20' : 'text-slate-300 bg-white/10'} px-2 py-0.5 rounded-full border border-white/15">
          ${isActive ? '● Live Slide' : '○ Draft'}
        </span>
      </div>

      <!-- Center Rig Graphic Visual -->
      <div class="relative w-full aspect-[16/10] flex items-center justify-center bg-white/5 rounded-xl border border-white/10 p-2 backdrop-blur-sm mb-3 group overflow-hidden">
        <img src="${image}" alt="${title}" onerror="this.src='public/images/home-hero-image-1.png'"
          class="max-h-36 w-auto object-contain drop-shadow-xl group-hover:scale-105 transition-transform duration-300">
      </div>

      <!-- Title & Eyebrow -->
      <div class="relative z-10 space-y-1 mb-2.5">
        <p class="text-[9px] font-mono font-bold tracking-widest text-blue-300 uppercase">${eyebrow}</p>
        <h4 class="text-base font-extrabold text-white tracking-tight leading-tight line-clamp-1">${title}</h4>
        <p class="text-xs text-blue-200 line-clamp-1">${subtitle}</p>
      </div>

      <!-- Specs Badges -->
      ${validSpecs.length > 0 ? `
        <div class="flex flex-wrap items-center gap-1.5 mb-3 relative z-10">
          ${validSpecs.map(s => `
            <span class="px-2 py-0.5 rounded-md bg-white/10 border border-white/15 text-[10px] font-mono font-semibold flex items-center space-x-1 backdrop-blur-sm">
              <span>${s.icon || '🔹'}</span><span>${s.label}</span>
            </span>
          `).join('')}
        </div>
      ` : ''}

      <!-- Pricing Row -->
      <div class="flex flex-wrap items-baseline gap-2 mb-3 relative z-10">
        <span class="text-lg font-black font-mono text-white tracking-tight">Rs. ${price.toLocaleString()}</span>
        <del class="text-xs text-slate-400 font-mono">Rs. ${origPrice.toLocaleString()}</del>
        <span class="text-[10px] font-bold text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded border border-amber-300/30">
          Save Rs. ${savings.toLocaleString()} (${savingPercent}%)
        </span>
      </div>

      <!-- Claimed Progress -->
      <div class="space-y-1 mb-3 relative z-10">
        <div class="flex justify-between items-center text-[10px] font-semibold">
          <span class="text-slate-200">${claimedPercent}% Claimed</span>
          <span class="text-amber-300 font-bold">Only ${stockLeft} left!</span>
        </div>
        <div class="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
          <div class="bg-gradient-to-r from-amber-400 to-amber-500 h-full rounded-full transition-all duration-300" style="width: ${claimedPercent}%"></div>
        </div>
      </div>

      <!-- Countdown Mini Cards & CTA -->
      <div class="flex items-center justify-between pt-2.5 border-t border-white/10 relative z-10 gap-2">
        <div class="flex items-center space-x-1 font-mono text-[10px] font-bold">
          <span class="px-1.5 py-0.5 bg-black/40 rounded border border-white/10 text-white">${days}d</span>
          <span class="px-1.5 py-0.5 bg-black/40 rounded border border-white/10 text-white">${hrs}h</span>
          <span class="px-1.5 py-0.5 bg-black/40 rounded border border-white/10 text-white">${mins}m</span>
          <span class="px-1.5 py-0.5 bg-black/40 rounded border border-white/10 text-rose-400">${secs}s</span>
        </div>
        <button type="button" class="px-3.5 py-1.5 bg-white text-[#0f172a] font-extrabold text-xs rounded-lg shadow transition-all flex items-center space-x-1">
          <span>Buy Now</span>
          <span>→</span>
        </button>
      </div>

    </div>
  `;

  // Included Items Breakdown Preview Card
  if (itemsContainer) {
    if (items.length > 0) {
      itemsContainer.innerHTML = `
        <div class="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-3.5 space-y-2">
          <div class="flex items-center justify-between text-xs font-bold text-[#0f172a]">
            <span>Included Package Items</span>
            <span class="text-[10px] font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-bold">${items.length} Products</span>
          </div>
          <ul class="space-y-1.5 text-xs text-[#475569]">
            ${items.map((item, idx) => `
              <li class="flex items-start space-x-2">
                <span class="text-emerald-600 font-bold text-xs mt-0.5">✓</span>
                <span class="line-clamp-1"><strong>${item.qty}x</strong> ${item.name}</span>
              </li>
            `).join('')}
          </ul>
        </div>
      `;
    } else {
      itemsContainer.innerHTML = '';
    }
  }
}

/**
 * Handles saving the deal bundle form page
 */
export function handleSaveBundleFormPage(event) {
  if (event) event.preventDefault();

  const specs = (window.bundleFormSpecsState || []).filter(s => s.label && s.label.trim() !== '');
  const bundleItems = window.bundleFormItemsState || [];

  const price = Number(document.getElementById('bf-price').value) || 259999;
  const originalPrice = Number(document.getElementById('bf-orig-price').value) || 289999;
  const savingAmount = Math.max(0, originalPrice - price);
  const savingPercent = originalPrice > 0 ? Math.round((savingAmount / originalPrice) * 100) : 0;
  const targetQuota = Number(document.getElementById('bf-target-quota')?.value) || 20;
  const soldCount = Number(document.getElementById('bf-sold-count')?.value) || 0;

  const bundleData = {
    badge: document.getElementById('bf-badge').value.trim() || 'BEST DEAL',
    eyebrow: document.getElementById('bf-eyebrow').value.trim() || 'FEATURED DEAL',
    title: document.getElementById('bf-title').value.trim() || 'Ultimate Gaming Power',
    subtitle: document.getElementById('bf-subtitle').value.trim() || 'Complete Your Dream Setup',
    image: document.getElementById('bf-image').value.trim() || 'public/images/home-hero-image-1.png',
    specs: specs.length > 0 ? specs : [{ icon: '🎮', label: 'Hardware Bundle' }],
    bundleItems: bundleItems,
    price: price,
    originalPrice: originalPrice,
    savingAmount: savingAmount,
    savingPercent: savingPercent,
    targetQuota: targetQuota,
    soldCount: soldCount,
    durationDays: Number(document.getElementById('bf-days').value) || 2,
    durationHours: Number(document.getElementById('bf-hours').value) || 14,
    durationMins: Number(document.getElementById('bf-mins').value) || 30,
    durationSecs: Number(document.getElementById('bf-secs').value) || 0,
    productId: Number(document.getElementById('bf-product-id').value) || (bundleItems[0] ? bundleItems[0].productId : 1),
    active: document.getElementById('bf-active').checked
  };

  if (currentEditingBundleId !== null) {
    updateDealBundle(currentEditingBundleId, bundleData);
    showToast('✅ Featured deal bundle slide updated successfully!');
  } else {
    addDealBundle(bundleData);
    showToast('🎉 New deal bundle slide created & added to carousel!');
  }

  window.dispatchEvent(new Event('productsUpdated'));
  closeBundleFormPage();
  renderPromotionsTab();
}

// ── Global Window Aliases for complete backwards compatibility ──
window.openBundleFormPage = openBundleFormPage;
window.openCreateBundlePage = () => openBundleFormPage(null);
window.openEditBundlePage = (id) => openBundleFormPage(id);
window.openCreateBundleModal = () => openBundleFormPage(null);
window.openEditBundleModal = (id) => openBundleFormPage(id);
window.closeBundleFormPage = closeBundleFormPage;
window.triggerBundleFormSubmit = triggerBundleFormSubmit;
window.handleSaveBundleFormPage = handleSaveBundleFormPage;
window.setBundleBadgeTag = setBundleBadgeTag;
window.setBundleFormPresetTimer = setBundleFormPresetTimer;
window.addBundleFormSpecInput = addBundleFormSpecInput;
window.removeBundleFormSpec = removeBundleFormSpec;
window.updateBundleFormSpec = updateBundleFormSpec;
window.addBundleFormProductItem = addBundleFormProductItem;
window.addBundleFormItemInput = addBundleFormProductItem;
window.removeBundleFormItem = removeBundleFormItem;
window.updateBundleFormItemProduct = updateBundleFormItemProduct;
window.updateBundleFormItemQty = updateBundleFormItemQty;
window.updateBundleBranchMatrix = updateBundleBranchMatrix;
window.updateBundleLivePreview = updateBundleLivePreview;

/* ========================================================================== */
/* 3. ALL DISCOUNTS & HOT DEALS TABLE                                          */
/* ========================================================================== */

/* ========================================================================== */
/* MODAL: EDIT PRODUCT DISCOUNT & BADGES (DYNAMIC TAXONOMY INTEGRATED)        */
/* ========================================================================== */

window.openEditDiscountModal = function(productId) {
  const products = getStoredProducts();
  const badges = getBadges().filter(b => b.isActive !== false);
  const product = products.find(p => p.id === Number(productId));
  if (!product) return;

  const modalContainer = document.getElementById('admin-modal-container');
  if (!modalContainer) return;

  const orig = product.originalPrice || product.price;

  modalContainer.innerHTML = `
    <div class="fixed inset-0 bg-[#0f172a]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#e2e8f0] space-y-4">
        
        <div class="flex items-center justify-between border-b border-[#e2e8f0] pb-3">
          <div>
            <h3 class="text-base font-extrabold text-[#0f172a]">Edit Product Deal & Badge</h3>
            <p class="text-xs text-[#64748b]">${product.name}</p>
          </div>
          <button onclick="closeAdminModal()" class="text-slate-400 hover:text-slate-700 text-xl font-bold">&times;</button>
        </div>

        <form onsubmit="handleSaveProductDiscount(event, ${product.id})" class="space-y-4">
          
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-[#0f172a] mb-1">Deal Price (Rs.)</label>
              <input type="number" id="dm-price" value="${product.price}" required
                class="w-full px-3 py-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg text-xs font-mono font-bold text-blue-600 focus:border-blue-600 focus:outline-none">
            </div>
            <div>
              <label class="block text-xs font-bold text-[#0f172a] mb-1">Original Price (Rs.)</label>
              <input type="number" id="dm-orig-price" value="${orig}" required
                class="w-full px-3 py-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg text-xs font-mono font-bold text-slate-500 focus:border-blue-600 focus:outline-none">
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-[#0f172a] mb-1">Promotional Badge Tag (from Dynamic Badges)</label>
            <select id="dm-badge" class="w-full px-3 py-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg text-xs font-semibold focus:border-blue-600 focus:outline-none">
              <option value="" ${!product.badge ? 'selected' : ''}>No Badge (Regular)</option>
              ${badges.map(b => `
                <option value="${b.name}" ${product.badge === b.name ? 'selected' : ''}>
                  ${b.name} (${b.color})
                </option>
              `).join('')}
              <option value="-15%" ${product.badge === '-15%' ? 'selected' : ''}>-15% Discount</option>
              <option value="-20%" ${product.badge === '-20%' ? 'selected' : ''}>-20% Discount</option>
              <option value="-25%" ${product.badge === '-25%' ? 'selected' : ''}>-25% Discount</option>
              <option value="-30%" ${product.badge === '-30%' ? 'selected' : ''}>-30% Discount</option>
            </select>
          </div>

          <div class="pt-3 border-t border-[#e2e8f0] flex items-center justify-end space-x-2">
            <button type="button" onclick="closeAdminModal()"
              class="px-4 py-2 bg-[#f8fafc] hover:bg-[#f1f5f9] text-[#475569] font-bold text-xs rounded-lg border border-[#e2e8f0]">
              Cancel
            </button>
            <button type="submit"
              class="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg shadow-sm transition-all">
              Save Changes
            </button>
          </div>

        </form>

      </div>
    </div>
  `;
};

window.handleSaveProductDiscount = function(event, productId) {
  if (event) event.preventDefault();

  const price = Number(document.getElementById('dm-price').value);
  const originalPrice = Number(document.getElementById('dm-orig-price').value);
  const badge = document.getElementById('dm-badge').value;

  updateProductDiscount(productId, { price, originalPrice, badge });
  window.dispatchEvent(new Event('productsUpdated'));
  showToast('✅ Product discount updated successfully!');
  closeAdminModal();
  renderPromotionsTab();
};

// Global Window Bindings for Dynamic Admin UI
window.switchPromoSubTab = switchPromoSubTab;
window.renderPromotionsTab = renderPromotionsTab;

