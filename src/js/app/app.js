// ETech Computers - Single Page Section Toggle Router & Global App Logic
import { products, getProductById, getFeaturedProducts, getNewArrivalProducts } from '../models/data.js';
import { getHomeDealBanner, getHomeBannerRemainingTime } from '../models/deals_data.js';
import { legalPolicies, getPolicyData, getStoredPolicies } from '../models/policy-data.js';
import { getCurrentUser, isLoggedIn, logoutUser } from '../controller/login_controller.js';
import { getUserOrders } from '../controller/order_management_controller.js';
import { initCartLogic, initCheckoutLogic, updateCartBadge, addToCart, getCart, saveCart, showToast } from '../controller/cart_controller.js';
import { renderProductDetailsPage, viewProductDetails } from '../controller/product-details_controller.js';
import { initShopLogic } from '../controller/shop_controller.js';
import { initHotDealsLogic } from '../controller/hot_deal_controller.js';
import { renderLoginPage } from './login/login.js';
import { renderAdminPage } from './administrator/administrator.js';
import { renderAboutPage } from './about/about.js';

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

window.addEventListener('hashchange', () => {
  handleRoute();
});

/**
 * Initialize SPA application
 */
export function initApp() {
  handleRoute();
  updateCartBadge();
  updateHeaderAuthUI();
}

/**
 * Main Section Router: Toggles 'hidden' class on page sections based on URL hash
 */
function handleRoute() {
  const hash = window.location.hash || '#home';
  const [routePart, queryPart] = hash.substring(1).split('?');
  const pageName = routePart || 'home';

  // ROUTE GUARDS: Protected pages require signup/login first
  if ((pageName === 'checkout' || pageName === 'account') && !isLoggedIn()) {
    window.location.hash = `#login?redirect=${pageName}`;
    return;
  }

  if (['admin', 'administrator'].includes(pageName)) {
    if (!isLoggedIn()) {
      window.location.hash = '#login?redirect=admin';
      return;
    }
    const user = getCurrentUser();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'STAFF')) {
      alert('Access Denied: You do not have administrative privileges.');
      window.location.hash = '#home';
      return;
    }
  }

  // Manage Layout (Header, Footer, Chatbot) visibility for full-screen Admin Console
  const storeHeader = document.querySelector('header');
  const storeFooter = document.getElementById('store-footer');
  const chatbot = document.getElementById('et-chatbot');

  if (['admin', 'administrator'].includes(pageName)) {
    if (storeHeader) storeHeader.classList.add('hidden');
    if (storeFooter) storeFooter.classList.add('hidden');
    if (chatbot) chatbot.classList.add('hidden');
  } else {
    if (storeHeader) storeHeader.classList.remove('hidden');
    if (storeFooter) storeFooter.classList.remove('hidden');
    if (chatbot) chatbot.classList.remove('hidden');
  }

  // 1. Hide all page sections
  const sections = document.querySelectorAll('.page-section');
  sections.forEach(sec => sec.classList.add('hidden'));

  // Handle Dynamic Login Page route (#login)
  if (pageName === 'login') {
    if (isLoggedIn()) {
      const user = getCurrentUser();
      window.location.hash = (user && (user.role === 'ADMIN' || user.role === 'STAFF')) ? '#admin' : '#home';
      return;
    }
    const loginSection = document.getElementById('login-page');
    if (loginSection) {
      loginSection.classList.remove('hidden');
      window.scrollTo(0, 0);
      renderLoginPage(queryPart);
    }
    updateActiveNavLinks(pageName);
    updateHeaderAuthUI();
    return;
  }

  // Handle Dynamic Administrator Dashboard route (#admin or #administrator)
  if (['admin', 'administrator'].includes(pageName)) {
    const adminSection = document.getElementById('admin-page');
    if (adminSection) {
      adminSection.classList.remove('hidden');
      window.scrollTo(0, 0);
      renderAdminPage(queryPart);
    }
    return;
  }

  // Handle About Us route (#about)
  if (pageName === 'about') {
    const aboutSection = document.getElementById('about-page');
    if (aboutSection) {
      aboutSection.classList.remove('hidden');
      window.scrollTo(0, 0);
      renderAboutPage();
    }
    updateActiveNavLinks(pageName);
    updateHeaderAuthUI();
    return;
  }

  // Handle Legal Policy routes (privacy, terms, warranty, policy, policies)
  if (['privacy', 'terms', 'warranty', 'policy', 'policies'].includes(pageName)) {
    const policySection = document.getElementById('policy-page');
    if (policySection) {
      policySection.classList.remove('hidden');
      window.scrollTo(0, 0);
      const activeKey = (pageName === 'policy' || pageName === 'policies') ? (queryPart || 'privacy') : pageName;
      renderPolicyPage(activeKey);
    }
    updateActiveNavLinks(pageName);
    updateHeaderAuthUI();
    return;
  }

  // Handle Product Details route (#product?id=X or #product-details?id=X)
  if (['product', 'product-details'].includes(pageName)) {
    const productSection = document.getElementById('product-details-page');
    if (productSection) {
      productSection.classList.remove('hidden');
      window.scrollTo(0, 0);
      let productId = 1;
      if (queryPart) {
        const params = new URLSearchParams(queryPart);
        productId = parseInt(params.get('id')) || 1;
      }
      renderProductDetailsPage(productId);
    }
    updateActiveNavLinks('shop');
    updateHeaderAuthUI();
    return;
  }

  // 2. Unhide target page section
  const targetSection = document.getElementById(`${pageName}-page`);
  if (targetSection) {
    targetSection.classList.remove('hidden');
    window.scrollTo(0, 0);

    // 3. Trigger route logic hooks
    triggerPageHooks(pageName, queryPart);
  } else {
    // Fallback to home section if page name doesn't match
    const homeSection = document.getElementById('home-page');
    if (homeSection) homeSection.classList.remove('hidden');
    triggerPageHooks('home', queryPart);
  }

  // 4. Update Header Nav & Auth UI
  updateActiveNavLinks(pageName);
  updateHeaderAuthUI();
}

/**
 * Executes page-specific logic functions after section unhide
 */
function triggerPageHooks(pageName, queryPart) {
  if (pageName === 'home') {
    renderHomeFeaturedProducts();
    renderHomeDealBannerLive();
    renderHomeNewArrivalsCarousel();
    renderHomeNewArrivalsGrid();
  } else if (pageName === 'shop') {
    initShopLogic(queryPart);
  } else if (pageName === 'deals' || pageName === 'hot-deals') {
    initHotDealsLogic(queryPart);
  } else if (pageName === 'cart') {
    initCartLogic();
  } else if (pageName === 'checkout') {
    initCheckoutLogic();
  } else if (pageName === 'account') {
    initAccountLogic();
  }
}

/**
 * Updates top navigation bar to reflect active authentication state
 */
export function updateHeaderAuthUI() {
  const authContainer = document.getElementById('header-auth-btn-container');
  const mobileDrawer = document.getElementById('mobile-auth-drawer');

  if (typeof getCurrentUser !== 'function') return;

  const user = getCurrentUser();

  if (authContainer) {
    if (user) {
      const isAdminOrStaff = user.role === 'ADMIN' || user.role === 'STAFF';

      authContainer.innerHTML = `
          <div class="flex items-center space-x-2 hidden md:flex">
            ${isAdminOrStaff ? `
              <a href="#admin" class="flex items-center space-x-2 bg-[#f1f5f9] hover:bg-[#e2e8f0] border border-[#e2e8f0] hover:border-[#cbd5e1] px-3.5 py-2 rounded-md transition-all group shadow-sm">
                <span class="text-xs font-semibold text-[#475569] group-hover:text-[#0f172a] max-w-[100px] truncate">Admin Console</span>
              </a>
            ` : ''}
            <a href="#account" class="flex items-center space-x-2 bg-[#f1f5f9] hover:bg-[#e2e8f0] border border-[#e2e8f0] hover:border-[#cbd5e1] px-3 py-1.5 rounded-md transition-all group shadow-sm">
              <div class="w-6 h-6 rounded bg-blue-600 text-white font-extrabold text-[11px] flex items-center justify-center">
                ${user.name.charAt(0).toUpperCase()}
              </div>
              <span class="text-xs font-semibold text-[#0f172a] max-w-[100px] truncate">${user.name.split(' ')[0]}</span>
            </a>
          </div>
        `;
    } else {
      authContainer.innerHTML = `
          <a href="#login" class="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center space-x-1.5 shadow-sm">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
            </svg>
            <span>Sign In</span>
          </a>
        `;
    }
  }

  if (mobileDrawer) {
    if (user) {
      const isAdminOrStaff = user.role === 'ADMIN' || user.role === 'STAFF';
      mobileDrawer.innerHTML = `
        <div class="p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-md space-y-2 text-xs">
          <div class="flex items-center space-x-2">
            <div class="w-7 h-7 rounded bg-blue-600 text-white font-bold flex items-center justify-center">${user.name.charAt(0).toUpperCase()}</div>
            <div>
              <p class="font-bold text-[#0f172a]">${user.name}</p>
              <p class="text-[10px] text-[#64748b]">${user.email}</p>
            </div>
          </div>
          ${isAdminOrStaff ? `
            <a href="#admin" class="block w-full text-center py-2 bg-white border border-[#e2e8f0] text-[#0f172a] rounded-md text-xs font-bold shadow-sm">Open Admin Console</a>
          ` : ''}
          <button onclick="handleLogout()" class="w-full py-2 bg-rose-50 border border-rose-200 text-rose-700 rounded-md text-xs font-bold shadow-sm">Sign Out</button>
        </div>
      `;
    } else {
      mobileDrawer.innerHTML = `
        <a href="#login" class="block w-full text-center py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md font-bold text-xs shadow-sm">Sign In / Create Account</a>
      `;
    }
  }
}

/**
 * Highlights current active link in header nav
 */
function updateActiveNavLinks(pageName) {
  const desktopLinks = document.querySelectorAll('header nav .nav-tab-btn');
  desktopLinks.forEach(link => {
    const href = link.getAttribute('href');
    const isActive = href && (href === `#${pageName}` || href.startsWith(`#${pageName}?`));

    if (isActive) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  const mobileLinks = document.querySelectorAll('#mobile-menu .nav-link');
  mobileLinks.forEach(link => {
    const href = link.getAttribute('href');
    const isActive = href && (href === `#${pageName}` || href.startsWith(`#${pageName}?`));

    if (isActive) {
      link.className = 'nav-link block px-4 py-2.5 rounded-md text-sm font-bold text-blue-600 bg-blue-50 border-l-2 border-blue-600 transition-all duration-150';
    } else {
      link.className = 'nav-link block px-4 py-2.5 rounded-md text-sm font-medium text-[#475569] hover:bg-[#f8fafc] hover:text-blue-600 transition-all duration-150';
    }
  });
}

/**
 * Renders Account section details for logged in user
 */
function initAccountLogic() {
  if (typeof getCurrentUser !== 'function') return;

  const user = getCurrentUser();
  if (!user) {
    window.location.hash = '#login?redirect=account';
    return;
  }

  // Update Profile elements
  const avatarEl = document.getElementById('account-avatar');
  const nameEl = document.getElementById('account-user-name');
  const handleEl = document.getElementById('account-user-handle');
  const usernameEl = document.getElementById('account-user-username');
  const emailEl = document.getElementById('account-user-email');
  const idEl = document.getElementById('account-user-id');
  const joinedEl = document.getElementById('account-user-joined');
  const roleTextEl = document.getElementById('account-user-role-text');

  if (avatarEl) avatarEl.textContent = user.name ? user.name.charAt(0).toUpperCase() : 'U';
  if (nameEl) nameEl.textContent = user.name;
  if (handleEl) handleEl.textContent = `@${user.username || (user.email ? user.email.split('@')[0] : 'user')}`;
  if (usernameEl) usernameEl.textContent = `@${user.username || (user.email ? user.email.split('@')[0] : 'user')}`;
  if (emailEl) emailEl.textContent = user.email;
  if (idEl) idEl.textContent = user.id || 'USR-882910';
  if (joinedEl) joinedEl.textContent = user.createdAt || 'Member';
  if (roleTextEl) roleTextEl.textContent = `${user.role || 'CUSTOMER'} Account`;

  renderUserOrderHistory(user);
}

/**
 * Render user's saved orders history list
 */
function renderUserOrderHistory(userOrEmail) {
  const container = document.getElementById('account-orders-list');
  const countEl = document.getElementById('account-orders-count');
  if (!container) return;

  if (typeof getUserOrders !== 'function') {
    container.innerHTML = `<p class="text-xs text-[#64748b]">Order management system unavailable.</p>`;
    return;
  }

  const orders = getUserOrders(userOrEmail);

  if (countEl) countEl.textContent = `${orders.length} Order${orders.length === 1 ? '' : 's'}`;

  if (orders.length === 0) {
    container.innerHTML = `
      <div class="text-center py-12 bg-[#f8fafc] rounded-lg border border-[#e2e8f0] space-y-3">
        <div class="w-12 h-12 rounded-full bg-white text-[#64748b] flex items-center justify-center mx-auto border border-[#e2e8f0]">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
        </div>
        <h4 class="text-sm font-bold text-[#0f172a]">No Orders Placed Yet</h4>
        <p class="text-xs text-[#64748b] max-w-sm mx-auto">Your order history will appear here after you place an order.</p>
        <a href="#shop" class="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-md transition-colors shadow-sm">Explore Hardware Catalog</a>
      </div>
    `;
    return;
  }

  container.innerHTML = orders.map(order => `
    <div class="bg-[#f8fafc] border border-[#e2e8f0] rounded-lg p-4 space-y-3.5 hover:border-[#cbd5e1] transition-colors shadow-sm">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#e2e8f0] pb-2.5 gap-2">
        <div>
          <span class="text-[10px] font-bold uppercase tracking-wider text-[#64748b]">Order ID</span>
          <h4 class="text-sm font-extrabold text-blue-600 font-mono">${order.orderId}</h4>
          <p class="text-[10px] text-[#64748b]">${order.date}</p>
        </div>
        <div class="flex items-center space-x-3">
          <span class="px-2.5 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold">
            ✓ ${order.status || 'Pending'}
          </span>
          <span class="text-base font-extrabold text-[#0f172a] font-mono">Rs. ${parseFloat((order.totalAmount || 0).toString().replace(/[^0-9.]/g, '')).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
      </div>

      <!-- Dispatch Hub & Destination -->
      <div class="flex items-center justify-between text-xs bg-white p-2.5 rounded-md border border-[#e2e8f0]">
        <span class="text-[#64748b]">Dispatch Hub: <strong class="text-[#0f172a]">${order.fulfillmentBranch || 'Colombo Hub'}</strong></span>
        <span class="text-[#64748b]">Destination: <strong class="text-blue-600">${order.city || 'Colombo'}</strong> (${order.distanceKm || 5} km)</span>
      </div>

      <!-- Items Grid -->
      <div class="space-y-2">
        <p class="text-[10px] font-bold text-[#64748b] uppercase tracking-wider">Purchased Items</p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
          ${order.items.map(item => `
            <div class="flex items-center space-x-2.5 bg-white p-2 rounded-md border border-[#e2e8f0]">
              <img src="${item.image}" alt="${item.name}" class="w-9 h-9 object-cover rounded flex-shrink-0 bg-[#f8fafc]">
              <div class="min-w-0 flex-1">
                <p class="text-xs font-bold text-[#0f172a] truncate">${item.name}</p>
                <p class="text-[10px] text-[#64748b] font-mono">Qty: ${item.quantity} × Rs. ${item.price}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="pt-2 border-t border-[#e2e8f0] flex items-center justify-between text-[11px] text-[#64748b]">
        <span>Payment: <strong class="text-[#0f172a]">${order.paymentMethod}</strong></span>
        <span class="text-emerald-600 font-medium flex items-center space-x-1">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          <span>Verified Purchase</span>
        </span>
      </div>
    </div>
  `).join('');
}

/**
 * Log out active session
 */
export function handleLogout() {
  if (typeof logoutUser === 'function') {
    logoutUser();
  }
  showToast('Signed out of account.');
  window.location.hash = '#home';
  handleRoute();
}

window.handleLogout = handleLogout;

let homeBannerTimerInterval = null;

/**
 * Renders dynamic Home Deal Banner configuration with persistent real-time countdown
 */
export function renderHomeDealBannerLive() {
  const container = document.getElementById('home-weekend-deal-card');
  if (!container || typeof getHomeDealBanner === 'undefined') return;

  const banner = getHomeDealBanner();
  container.style.backgroundImage = `url('${banner.bgImage || 'public/images/WEEKEND-TECH-DEAL-cart-bg.jpeg'}')`;

  const tagEl = document.getElementById('home-deal-tag');
  if (tagEl) tagEl.textContent = banner.tag || 'WEEKEND TECH DEAL';

  const headingEl = document.getElementById('home-deal-heading');
  if (headingEl) {
    headingEl.innerHTML = `
      ${banner.title || 'Upgrade your setup'}<br>
      ${banner.titleHighlight || 'Save up to 20%'}<br>
      <span class="text-white/90 text-base sm:text-lg font-medium">${banner.subtitle || 'on selected components'}</span>
    `;
  }

  const btnEl = document.getElementById('home-deal-btn');
  if (btnEl) {
    btnEl.innerHTML = `
      <span>Shop Deals</span>
      <svg class="w-3.5 h-3.5 text-[#0f172a] group-hover:translate-x-1 transition-transform" fill="none"
        stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
          d="M14 5l7 7m0 0l-7 7m7-7H3" />
      </svg>
    `;
    btnEl.setAttribute('href', '#deals');
  }

  // Update timer display & start ticking
  const updateHomeTimerDisplay = () => {
    const t = getHomeBannerRemainingTime();
    const daysEl = document.getElementById('home-deal-timer-days');
    const hrsEl = document.getElementById('home-deal-timer-hrs');
    const minsEl = document.getElementById('home-deal-timer-mins');
    const secsEl = document.getElementById('home-deal-timer-secs');

    if (daysEl) daysEl.textContent = t.days;
    if (hrsEl) hrsEl.textContent = t.hours;
    if (minsEl) minsEl.textContent = t.mins;
    if (secsEl) secsEl.textContent = t.secs;
  };

  updateHomeTimerDisplay();
  if (homeBannerTimerInterval) clearInterval(homeBannerTimerInterval);
  homeBannerTimerInterval = setInterval(updateHomeTimerDisplay, 1000);
}

/**
 * Renders top 4 featured products on home page section
 */
function renderHomeFeaturedProducts() {
  const grid = document.getElementById('home-featured-grid');
  if (!grid || typeof getFeaturedProducts === 'undefined') return;

  const featured = getFeaturedProducts().slice(0, 4);
  grid.innerHTML = featured.map(product => `
    <div class="group rounded-xl bg-white border border-slate-100 hover:border-slate-300 p-3.5 flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 shadow-sm hover:shadow-md">
      <div>
        <div onclick="viewProductDetails(${product.id})" class="relative overflow-hidden rounded-lg bg-white mb-2.5 h-32 flex items-center justify-center cursor-pointer">
          <img src="${product.image}" alt="${product.name}" class="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300">
          <span class="absolute top-1 left-1 bg-[#ff7a00] text-white text-[8px] sm:text-[8.5px] font-extrabold uppercase px-2 py-0.5 rounded shadow-sm tracking-wide">BEST SELLER</span>
        </div>
        <h3 onclick="viewProductDetails(${product.id})" class="text-xs font-bold text-[#0f172a] line-clamp-2 group-hover:text-blue-600 transition-colors cursor-pointer leading-tight h-8" title="${product.name}">${product.name}</h3>
        <div class="flex items-center space-x-1 mt-1 text-[11px] text-amber-500 font-bold">
          <span>★</span>
          <span>${product.rating || '4.8'}</span>
          <span class="text-[#94a3b8] font-normal text-[11px]">(${product.reviews || '156'})</span>
        </div>
      </div>
      
      <div class="mt-3.5 flex items-center justify-between">
        <div>
          <p class="text-sm font-extrabold text-blue-600 font-sans tracking-tight">Rs. ${product.price ? product.price.toLocaleString() : ''}</p>
        </div>
        <button onclick="addToCart(${product.id})" class="w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors shadow-sm cursor-pointer" title="Add to Cart">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </button>
      </div>
    </div>
  `).join('');
}

/**
 * Renders top 4 new arrival products in New Arrivals grid on home page
 */
export function renderHomeNewArrivalsGrid() {
  const grid = document.getElementById('home-new-arrivals-grid');
  if (!grid || typeof getNewArrivalProducts === 'undefined') return;

  const arrivals = getNewArrivalProducts().slice(0, 4);
  grid.innerHTML = arrivals.map(product => `
    <div class="group rounded-lg bg-white border border-[#e2e8f0] hover:border-[#cbd5e1] p-3.5 flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 shadow-sm hover:shadow-md">
      <div>
        <div onclick="viewProductDetails(${product.id})" class="relative overflow-hidden rounded-md bg-[#f8fafc] mb-3 h-36 flex items-center justify-center cursor-pointer border border-[#e2e8f0]">
          <img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
          <span class="absolute top-2 left-2 bg-blue-600 text-white text-[9px] font-bold uppercase px-2 py-0.5 rounded shadow-sm">${product.badge || 'New Arrival'}</span>
        </div>
        <span class="text-[10px] font-bold uppercase text-blue-600 font-mono tracking-wider">${product.category}</span>
        <h3 onclick="viewProductDetails(${product.id})" class="text-xs font-bold text-[#0f172a] mt-1 line-clamp-1 group-hover:text-blue-600 transition-colors cursor-pointer">${product.name}</h3>
        <div class="flex items-center space-x-1 mt-1 text-[11px] text-amber-500 font-bold">
          <span>★</span>
          <span>${product.rating || '4.8'}</span>
          <span class="text-[#94a3b8] font-normal">(${product.reviews || '24'})</span>
        </div>
      </div>
      
      <div class="mt-3 pt-2.5 border-t border-[#e2e8f0] flex items-center justify-between">
        <div>
          ${product.originalPrice ? `<span class="text-[10px] text-[#94a3b8] line-through font-mono">Rs. ${product.originalPrice}</span>` : ''}
          <p class="text-sm font-extrabold text-[#0f172a] font-mono">Rs. ${product.price}</p>
        </div>
        <button onclick="addToCart(${product.id})" class="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md shadow-sm transition-all flex items-center justify-center" title="Add to Cart">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
        </button>
      </div>
    </div>
  `).join('');
}

// ── Hero New Arrivals Product Carousel Controller ──
let currentCarouselIndex = 0;
let carouselTimer = null;
let carouselTouchStartX = 0;

/**
 * Renders dynamic 3D Stacked Product Card Mockup Carousel in Hero Section
 */
export function renderHomeNewArrivalsCarousel() {
  const container = document.getElementById('hero-carousel-container');
  if (!container || typeof getNewArrivalProducts === 'undefined') return;

  const arrivals = getNewArrivalProducts();
  if (!arrivals || arrivals.length === 0) {
    container.innerHTML = `
      <div class="relative rounded-2xl overflow-hidden border border-[#e2e8f0] bg-white shadow-xl p-4 text-center">
        <img src="public/images/home-hero-image-1.png" alt="ETech PC Workstation Setup" class="w-full h-auto object-contain rounded-xl">
      </div>`;
    return;
  }

  // Ensure current index is valid
  if (currentCarouselIndex >= arrivals.length) {
    currentCarouselIndex = 0;
  }

  const n = arrivals.length;
  const idx0 = currentCarouselIndex;
  const idx1 = (currentCarouselIndex + 1) % n;
  const idx2 = (currentCarouselIndex + 2) % n;

  const product0 = arrivals[idx0];
  const product1 = arrivals[idx1];
  const product2 = arrivals[idx2];

  // Helper renderer for clean vertical card in the 3D deck
  const renderCardItem = (p, slotClass, slideIdx, isFront) => `
    <div class="absolute top-0  w-[100px] h-[280px] sm:w-[160px] sm:h-[320px] card-3d-deck-item ${slotClass} cursor-pointer select-none" 
         onclick="${isFront ? `viewProductDetails(${p.id})` : `goToHeroCarouselSlide(${slideIdx})`}">
      <div class="relative h-full flex flex-col justify-between p-3 rounded-2xl bg-white border border-slate-200/80 shadow-xl overflow-hidden group">
        
        <!-- Top Pill Badge -->
        <div class="flex items-center justify-between z-10 mb-1">
          <span class="px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-[9.5px] font-extrabold uppercase tracking-wider shadow-sm">
            ${p.badge || 'NEW ARRIVAL'}
          </span>
          ${isFront ? '<span class="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>' : ''}
        </div>

        <!-- Product Image Showcase Container -->
        <div class="relative w-full flex items-center justify-center py-3 px-0 my-1 rounded-xl bg-white border border-slate-100 group-hover:border-blue-100 transition-colors">
          <div class="flex justify-center items-center w-full h-36 overflow-hidden">
          <img src="${p.image}" alt="${p.name}" class="max-w-full w-full object-cover drop-shadow-sm transition-transform duration-300 group-hover:scale-105">
          </div>
          ${isFront ? `
          <!-- Hover View Specs overlay -->
          <div class="absolute inset-0 bg-[#0f172a]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center rounded-xl pointer-events-none">
            <span class="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-[10px] font-bold shadow-md flex items-center space-x-1">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
              <span>View Specs</span>
            </span>
          </div>` : ''}
        </div>

        <!-- Product Title & Pricing -->
        <div class="space-y-0.5 z-10">
          <p class="text-[9.5px] font-bold text-[#94a3b8] uppercase tracking-wider truncate">
            ${p.brand || (p.category === 'laptops' ? 'ASUS ROG' : p.name.includes('Intel') ? 'Intel Core' : 'ASUS GeForce')}
          </p>
          <h3 class="text-xs sm:text-[13px] font-extrabold text-[#0f172a] line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
            ${p.name}
          </h3>

          <div class="pt-1.5 flex flex-col items-start">
            ${p.originalPrice ? `<span class="text-[9.5px] text-[#94a3b8] line-through font-semibold font-mono">Rs. ${p.originalPrice.toLocaleString()}</span>` : ''}
            <span class="text-sm sm:text-base font-black text-blue-600 font-mono tracking-tight">
              Rs. ${p.price.toLocaleString()}
            </span>
          </div>
        </div>

      </div>
    </div>
  `;

  container.innerHTML = `
    <div class="relative w-full max-w-[340px] sm:max-w-[360px] pt-1 pb-4" id="hero-carousel-wrapper"
         onmouseenter="pauseHeroCarousel()" 
         onmouseleave="startHeroCarouselAutoPlay()">
      
      <!-- Top Right Counter Badge -->
      <div class="flex items-center justify-end mb-2 pr-1">
        <span class="text-[11px] font-mono font-extrabold text-[#64748b] bg-white/90 backdrop-blur px-2.5 py-0.5 rounded-md border border-[#e2e8f0] shadow-sm">
          ${currentCarouselIndex + 1}/${arrivals.length}
        </span>
      </div>

      <!-- 3D Card Deck Viewport -->
      <div class="relative h-[330px] sm:h-[345px] w-full hero-carousel-container-3d overflow-visible">
        <!-- Back Card (Slot 2) -->
        ${renderCardItem(product2, 'card-deck-slot-2', idx2, false)}

        <!-- Middle Card (Slot 1) -->
        ${renderCardItem(product1, 'card-deck-slot-1', idx1, false)}

        <!-- Front Active Card (Slot 0) -->
        ${renderCardItem(product0, 'card-deck-slot-0', idx0, true)}
      </div>

      <!-- Bottom Controls Row -->
      <div class="flex items-center justify-end space-x-3 mt-3 pr-2">
        <!-- Navigation Arrow Buttons -->
        <div class="flex items-center space-x-2">
          <button onclick="prevHeroCarouselSlide()" 
                  class="w-8 h-8 rounded-full bg-white hover:bg-blue-600 hover:text-white text-[#0f172a] border border-[#cbd5e1] flex items-center justify-center shadow-md transition-all transform hover:scale-105 active:scale-95" 
                  title="Previous Card">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"/></svg>
          </button>
          
          <button onclick="nextHeroCarouselSlide()" 
                  class="w-8 h-8 rounded-full bg-white hover:bg-blue-600 hover:text-white text-[#0f172a] border border-[#cbd5e1] flex items-center justify-center shadow-md transition-all transform hover:scale-105 active:scale-95" 
                  title="Next Card">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/></svg>
          </button>
        </div>

        <!-- Dot Pagination Indicators -->
        <div class="flex items-center space-x-1.5 ml-1">
          ${arrivals.map((_, idx) => `
            <button onclick="goToHeroCarouselSlide(${idx})" 
                    class="hero-carousel-indicator h-2 rounded-full transition-all duration-300 ${idx === currentCarouselIndex ? 'active w-5 bg-blue-600' : 'w-2 bg-[#cbd5e1] hover:bg-[#94a3b8]'}"
                    title="Go to card ${idx + 1}"></button>
          `).join('')}
        </div>
      </div>

    </div>
  `;

  // Touch Swipe Support
  const wrapper = document.getElementById('hero-carousel-wrapper');
  if (wrapper) {
    wrapper.addEventListener('touchstart', (e) => {
      carouselTouchStartX = e.touches[0].clientX;
    }, { passive: true });

    wrapper.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      const diff = carouselTouchStartX - touchEndX;
      if (Math.abs(diff) > 40) {
        if (diff > 0) nextHeroCarouselSlide();
        else prevHeroCarouselSlide();
      }
    }, { passive: true });
  }

  startHeroCarouselAutoPlay();
}
/**
 * Jump to specific carousel slide
 */
export function goToHeroCarouselSlide(index) {
  const arrivals = typeof getNewArrivalProducts === 'function' ? getNewArrivalProducts() : [];
  if (!arrivals || arrivals.length === 0) return;
  currentCarouselIndex = (index + arrivals.length) % arrivals.length;
  renderHomeNewArrivalsCarousel();
}

/**
 * Move to next slide (left movement)
 */
export function nextHeroCarouselSlide() {
  goToHeroCarouselSlide(currentCarouselIndex + 1);
}

/**
 * Move to previous slide
 */
export function prevHeroCarouselSlide() {
  goToHeroCarouselSlide(currentCarouselIndex - 1);
}

/**
 * Start continuous auto-play timer (slides left every 3.5 seconds)
 */
export function startHeroCarouselAutoPlay() {
  pauseHeroCarousel();
  carouselTimer = setInterval(() => {
    const arrivals = typeof getNewArrivalProducts === 'function' ? getNewArrivalProducts() : [];
    if (arrivals && arrivals.length > 1) {
      currentCarouselIndex = (currentCarouselIndex + 1) % arrivals.length;
      renderHomeNewArrivalsCarousel();
    }
  }, 3500);
}

/**
 * Pause auto-play timer on hover
 */
export function pauseHeroCarousel() {
  if (carouselTimer) {
    clearInterval(carouselTimer);
    carouselTimer = null;
  }
}

// Bind to window for inline handlers
window.renderHomeNewArrivalsCarousel = renderHomeNewArrivalsCarousel;
window.goToHeroCarouselSlide = goToHeroCarouselSlide;
window.nextHeroCarouselSlide = nextHeroCarouselSlide;
window.prevHeroCarouselSlide = prevHeroCarouselSlide;
window.pauseHeroCarousel = pauseHeroCarousel;
window.startHeroCarouselAutoPlay = startHeroCarouselAutoPlay;

// Real-time synchronization listeners
window.addEventListener('storage', (e) => {
  if (e.key === 'etech_products') {
    renderHomeNewArrivalsCarousel();
    renderHomeFeaturedProducts();
  }
  if (e.key === 'etech_home_deal_banner') {
    renderHomeDealBannerLive();
  }
});

window.addEventListener('productsUpdated', () => {
  renderHomeNewArrivalsCarousel();
  renderHomeFeaturedProducts();
  renderHomeDealBannerLive();
});

/**
 * Renders Legal Policy Section (Privacy Policy, Terms of Service, Guarantee & Warranty)
 */
function renderPolicyPage(policyKey = 'privacy') {
  const container = document.getElementById('policy-content-area');
  const tabsContainer = document.getElementById('policy-tabs-container');
  if (!container) return;

  const policies = getStoredPolicies();
  const key = policies[policyKey] ? policyKey : 'privacy';
  const policy = policies[key];

  // Render Tabs
  if (tabsContainer) {
    tabsContainer.innerHTML = Object.keys(policies).map(k => {
      const p = policies[k];
      const isActive = k === key;
      return `
        <a href="#${k}" class="flex items-center space-x-2 px-4 py-2 rounded-md font-bold text-xs transition-all shadow-sm ${isActive
          ? 'bg-blue-600 text-white'
          : 'bg-[#f8fafc] text-[#475569] hover:text-[#0f172a] hover:bg-[#f1f5f9] border border-[#e2e8f0]'
        }">
          ${p.icon || '📄'}
          <span>${p.title}</span>
        </a>
      `;
    }).join('');
  }

  // Render Main Policy Content Body
  container.innerHTML = `
    <div class="bg-white border border-[#e2e8f0] rounded-lg p-6 sm:p-8 shadow-sm space-y-6">
      
      <!-- Policy Header Banner -->
      <div class="border-b border-[#e2e8f0] pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center space-x-2 mb-1.5">
            <span class="text-xs font-mono font-bold uppercase tracking-wider text-blue-600">Official Legal Policy</span>
          </div>
          <h1 class="text-2xl font-extrabold text-[#0f172a] tracking-tight">${policy.title}</h1>
          <p class="text-xs text-[#64748b] mt-1">${policy.subtitle}</p>
        </div>

        <div class="flex items-center gap-2">
          <span class="inline-flex items-center space-x-1.5 px-3 py-1 rounded bg-[#f8fafc] border border-[#e2e8f0] text-[#475569] text-xs">
            <svg class="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            <span>Updated: ${policy.lastUpdated}</span>
          </span>
          <button onclick="window.print()" class="px-3 py-1 bg-[#f8fafc] hover:bg-[#f1f5f9] text-[#0f172a] rounded text-xs font-bold border border-[#e2e8f0] transition-all shadow-sm">
            Print
          </button>
        </div>
      </div>

      <!-- Policy Sections List -->
      <div class="space-y-4">
        ${policy.sections.map(sec => `
          <div class="space-y-2 bg-[#f8fafc] p-4 rounded-md border border-[#e2e8f0]">
            <h3 class="text-sm font-bold text-[#0f172a] flex items-center space-x-2">
              <span class="w-1.5 h-1.5 rounded-full bg-blue-600 inline-block"></span>
              <span>${sec.heading}</span>
            </h3>
            <p class="text-xs text-[#475569] leading-relaxed font-normal">${sec.content}</p>
            ${sec.bullets ? `
              <ul class="mt-2 space-y-1 pl-3 border-l border-blue-200">
                ${sec.bullets.map(bullet => `
                  <li class="text-xs text-[#64748b] flex items-start space-x-2">
                    <span class="text-blue-600 font-bold">▪</span>
                    <span>${bullet}</span>
                  </li>
                `).join('')}
              </ul>
            ` : ''}
          </div>
        `).join('')}
      </div>

      <!-- Policy Footer Assistance Callout -->
      <div class="pt-4 border-t border-[#e2e8f0] flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#f8fafc] p-4 rounded-md border border-[#e2e8f0]">
        <div>
          <h4 class="text-xs font-bold text-[#0f172a]">Have questions regarding our ${policy.title}?</h4>
          <p class="text-[11px] text-[#64748b] mt-0.5">Our support team is ready to assist you anytime.</p>
        </div>
        <a href="mailto:support@etechcomputers.com" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-xs font-bold shadow-sm transition-all flex items-center space-x-1.5 flex-shrink-0">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
          <span>Contact Support</span>
        </a>
      </div>

    </div>
  `;
}
