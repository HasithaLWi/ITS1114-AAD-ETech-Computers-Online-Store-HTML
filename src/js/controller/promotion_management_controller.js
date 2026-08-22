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
  updateProductDiscount
} from '../models/deals_data.js';
import { getStoredProducts } from '../models/data.js';
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
          <button onclick="openCreateBundleModal()" 
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
        <button onclick="openCreateBundleModal()"
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
              <button onclick="openEditBundleModal(${bundle.id})"
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
/* MODAL: CREATE / EDIT DEAL BUNDLE (IMAGE 2 & 3 CAROUSEL SLIDE)              */
/* ========================================================================== */

window.openCreateBundleModal = function() {
  currentEditingBundleId = null;
  renderBundleModal({
    badge: "BEST DEAL",
    eyebrow: "FEATURED DEAL",
    title: "",
    subtitle: "",
    image: "public/images/home-hero-image-1.png",
    specs: [
      { icon: "🎮", label: "RTX 4070 Super" },
      { icon: "🧠", label: "32GB DDR5 RAM" },
      { icon: "💾", label: "1TB NVMe SSD" }
    ],
    bundleItems: [],
    price: 259999,
    originalPrice: 289999,
    claimedPercent: 62,
    stockLeft: 38,
    durationDays: 2,
    durationHours: 14,
    durationMins: 30,
    productId: 1,
    active: true
  });
};

window.openEditBundleModal = function(id) {
  const bundles = getDealBundles();
  const bundle = bundles.find(b => b.id === Number(id));
  if (!bundle) return;
  currentEditingBundleId = Number(id);
  renderBundleModal(bundle);
};

function renderBundleModal(data) {
  const modalContainer = document.getElementById('admin-modal-container');
  if (!modalContainer) return;

  const isEdit = currentEditingBundleId !== null;

  modalContainer.innerHTML = `
    <div class="fixed inset-0 bg-[#0f172a]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div class="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-[#e2e8f0] my-8 space-y-4">
        
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-[#e2e8f0] pb-3">
          <div>
            <h3 class="text-lg font-extrabold text-[#0f172a]">${isEdit ? 'Edit Featured Deal Bundle Slide' : 'Create New Deal Bundle Slide'}</h3>
            <p class="text-xs text-[#64748b]">Configure bundle specs, pricing, claimed % progress, and custom visual (Image 2 style).</p>
          </div>
          <button onclick="closeAdminModal()" class="text-slate-400 hover:text-slate-700 text-xl font-bold">&times;</button>
        </div>

        <!-- Form -->
        <form onsubmit="handleSaveBundleForm(event)" class="space-y-4">
          
          <!-- Badges -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-[#0f172a] mb-1">Top Badge Tag (e.g. BEST DEAL)</label>
              <input type="text" id="bm-badge" value="${data.badge || 'BEST DEAL'}" required
                class="w-full px-3.5 py-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg text-xs font-semibold focus:border-blue-600 focus:outline-none">
            </div>
            <div>
              <label class="block text-xs font-bold text-[#0f172a] mb-1">Eyebrow (e.g. FEATURED DEAL)</label>
              <input type="text" id="bm-eyebrow" value="${data.eyebrow || 'FEATURED DEAL'}" required
                class="w-full px-3.5 py-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg text-xs font-semibold focus:border-blue-600 focus:outline-none">
            </div>
          </div>

          <!-- Title & Subtitle -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-[#0f172a] mb-1">Bundle Title</label>
              <input type="text" id="bm-title" value="${data.title || ''}" placeholder="Ultimate Gaming Power" required
                class="w-full px-3.5 py-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg text-xs font-semibold focus:border-blue-600 focus:outline-none">
            </div>
            <div>
              <label class="block text-xs font-bold text-[#0f172a] mb-1">Subtitle</label>
              <input type="text" id="bm-subtitle" value="${data.subtitle || ''}" placeholder="Complete Your Dream Setup" required
                class="w-full px-3.5 py-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg text-xs font-semibold focus:border-blue-600 focus:outline-none">
            </div>
          </div>

          <!-- Deal Image URL -->
          <div>
            <label class="block text-xs font-bold text-[#0f172a] mb-1">Deal Image URL (Custom PC / Setup Graphic)</label>
            <div class="flex items-center space-x-2">
              <input type="text" id="bm-image" value="${data.image || 'public/images/home-hero-image-1.png'}" required
                class="flex-1 px-3.5 py-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg text-xs font-semibold focus:border-blue-600 focus:outline-none">
              <button type="button" onclick="document.getElementById('bm-image').value = 'public/images/home-hero-image-1.png'"
                class="px-3 py-2 bg-[#f8fafc] border border-[#e2e8f0] text-xs font-bold text-[#475569] rounded-lg hover:bg-[#f1f5f9]">
                Default
              </button>
            </div>
          </div>

          <!-- Hardware Specs Badges (JSON or Comma List) -->
          <div>
            <label class="block text-xs font-bold text-[#0f172a] mb-1">Hardware Specs Badges (Icon + Label, comma separated)</label>
            <input type="text" id="bm-specs" value="${(data.specs || []).map(s => `${s.icon || '🎮'} ${s.label}`).join(', ')}" placeholder="🎮 RTX 4070 Super, 🧠 32GB DDR5 RAM, 💾 1TB NVMe SSD" required
              class="w-full px-3.5 py-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg text-xs font-semibold focus:border-blue-600 focus:outline-none">
            <span class="text-[10px] text-[#64748b]">Example: 🎮 RTX 4070 Super, 🧠 32GB DDR5 RAM, 💾 1TB NVMe SSD</span>
          </div>

          <!-- Bundle Included Items (Textarea) -->
          <div>
            <label class="block text-xs font-bold text-[#0f172a] mb-1">Bundle Included Items List (One per line)</label>
            <textarea id="bm-bundle-items" rows="2" placeholder="ASUS ROG Strix RTX 4070S&#10;Corsair Vengeance 32GB DDR5&#10;Samsung 990 PRO 1TB"
              class="w-full px-3.5 py-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg text-xs font-semibold focus:border-blue-600 focus:outline-none">${(data.bundleItems || []).join('\n')}</textarea>
          </div>

          <!-- Pricing: Deal Price & Original Price -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#f8fafc] p-3.5 rounded-xl border border-[#e2e8f0]">
            <div>
              <label class="block text-xs font-bold text-[#0f172a] mb-1">Deal Price (Now Rs.)</label>
              <input type="number" id="bm-price" value="${data.price || 259999}" required
                class="w-full px-3 py-1.5 bg-white border border-[#e2e8f0] rounded-lg text-xs font-mono font-bold text-blue-600">
            </div>
            <div>
              <label class="block text-xs font-bold text-[#0f172a] mb-1">Original Price (Was Rs.)</label>
              <input type="number" id="bm-orig-price" value="${data.originalPrice || 289999}" required
                class="w-full px-3 py-1.5 bg-white border border-[#e2e8f0] rounded-lg text-xs font-mono font-bold text-slate-500">
            </div>
          </div>

          <!-- Claimed % & Stock Left -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-[#0f172a] mb-1">Claimed Percentage (e.g. 62%)</label>
              <input type="number" id="bm-claimed" min="1" max="99" value="${data.claimedPercent || 62}" required
                class="w-full px-3.5 py-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg text-xs font-semibold">
            </div>
            <div>
              <label class="block text-xs font-bold text-[#0f172a] mb-1">Stock Left (Units)</label>
              <input type="number" id="bm-stock" min="1" max="999" value="${data.stockLeft || 38}" required
                class="w-full px-3.5 py-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg text-xs font-semibold">
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="pt-3 border-t border-[#e2e8f0] flex items-center justify-end space-x-3">
            <button type="button" onclick="closeAdminModal()"
              class="px-4 py-2 bg-[#f8fafc] hover:bg-[#f1f5f9] text-[#475569] font-bold text-xs rounded-lg border border-[#e2e8f0]">
              Cancel
            </button>
            <button type="submit"
              class="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg shadow-sm transition-all">
              ${isEdit ? 'Update Bundle' : 'Create Bundle'}
            </button>
          </div>

        </form>

      </div>
    </div>
  `;
}

window.handleSaveBundleForm = function(event) {
  if (event) event.preventDefault();

  const rawSpecs = document.getElementById('bm-specs').value.split(',');
  const parsedSpecs = rawSpecs.map(s => {
    const trimmed = s.trim();
    const parts = trimmed.split(' ');
    const icon = parts.length > 1 ? parts[0] : '🎮';
    const label = parts.length > 1 ? parts.slice(1).join(' ') : trimmed;
    return { icon, label };
  }).filter(s => s.label);

  const rawBundleItems = document.getElementById('bm-bundle-items').value.split('\n').map(i => i.trim()).filter(Boolean);

  const bundleData = {
    badge: document.getElementById('bm-badge').value.trim(),
    eyebrow: document.getElementById('bm-eyebrow').value.trim(),
    title: document.getElementById('bm-title').value.trim(),
    subtitle: document.getElementById('bm-subtitle').value.trim(),
    image: document.getElementById('bm-image').value.trim(),
    specs: parsedSpecs,
    bundleItems: rawBundleItems,
    price: Number(document.getElementById('bm-price').value),
    originalPrice: Number(document.getElementById('bm-orig-price').value),
    claimedPercent: Number(document.getElementById('bm-claimed').value),
    stockLeft: Number(document.getElementById('bm-stock').value),
    active: true
  };

  if (currentEditingBundleId !== null) {
    updateDealBundle(currentEditingBundleId, bundleData);
    showToast('✅ Deal bundle slide updated successfully!');
  } else {
    addDealBundle(bundleData);
    showToast('🎉 New deal bundle created & added to carousel!');
  }

  window.dispatchEvent(new Event('productsUpdated'));
  closeAdminModal();
  renderPromotionsTab();
};

/* ========================================================================== */
/* MODAL: EDIT PRODUCT DISCOUNT & BADGES                                       */
/* ========================================================================== */

window.openEditDiscountModal = function(productId) {
  const products = getStoredProducts();
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
            <h3 class="text-base font-extrabold text-[#0f172a]">Edit Product Deal</h3>
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
            <label class="block text-xs font-bold text-[#0f172a] mb-1">Promotional Badge Tag</label>
            <select id="dm-badge" class="w-full px-3 py-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg text-xs font-semibold focus:border-blue-600 focus:outline-none">
              <option value="" ${!product.badge ? 'selected' : ''}>No Badge (Regular)</option>
              <option value="Hot Deal" ${product.badge === 'Hot Deal' ? 'selected' : ''}>Hot Deal 🔥</option>
              <option value="Best Seller" ${product.badge === 'Best Seller' ? 'selected' : ''}>Best Seller ⭐</option>
              <option value="New Arrival" ${product.badge === 'New Arrival' ? 'selected' : ''}>New Arrival 🚀</option>
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
window.updateHomeBannerLivePreview = updateHomeBannerLivePreview;

