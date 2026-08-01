// ETech Computers - Single Page Section Toggle Router & Global App Logic
import { products, getProductById, getFeaturedProducts } from './data.js';
import { legalPolicies, getPolicyData } from './policy-data.js';
import { getCurrentUser, isLoggedIn, logoutUser, getUserOrders } from './auth.js';
import { initCartLogic, initCheckoutLogic, updateCartBadge, addToCart, getCart, saveCart, showToast } from './cart.js';
import { renderProductDetailsPage, viewProductDetails } from './product-details.js';
import { initShopLogic } from './shop.js';

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
    window.location.href = `pages/login.html?redirect=${pageName}`;
    return;
  }

  // 1. Hide all page sections
  const sections = document.querySelectorAll('.page-section');
  sections.forEach(sec => sec.classList.add('hidden'));

  // Handle Legal Policy routes (privacy, terms, warranty, policy)
  if (['privacy', 'terms', 'warranty', 'policy'].includes(pageName)) {
    const policySection = document.getElementById('policy-page');
    if (policySection) {
      policySection.classList.remove('hidden');
      window.scrollTo(0, 0);
      const activeKey = (pageName === 'policy') ? (queryPart || 'privacy') : pageName;
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
        productId = parseInt(params.get('id') || 1);
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
  } else if (pageName === 'shop') {
    initShopLogic(queryPart);
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
function updateHeaderAuthUI() {
  const authContainer = document.getElementById('header-auth-btn-container');
  const mobileDrawer = document.getElementById('mobile-auth-drawer');

  if (typeof getCurrentUser !== 'function') return;

  const user = getCurrentUser();

  if (authContainer) {
    if (user) {
      authContainer.innerHTML = `
        <div class="flex items-center space-x-2">
          <a href="#account" class="flex items-center space-x-2 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 px-3 py-1.5 rounded-xl transition-all group">
            <div class="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-bold text-xs flex items-center justify-center shadow-md">
              ${user.name.charAt(0).toUpperCase()}
            </div>
            <span class="text-xs font-bold text-slate-200 group-hover:text-white max-w-[100px] truncate">${user.name.split(' ')[0]}</span>
          </a>
        </div>
      `;
    } else {
      authContainer.innerHTML = `
        <a href="pages/login.html" class="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md transition-all flex items-center space-x-1.5">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
          </svg>
          <span>Sign In</span>
        </a>
      `;
    }
  }

  if (mobileDrawer) {
    if (user) {
      mobileDrawer.innerHTML = `
        <div class="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2 text-xs">
          <div class="flex items-center space-x-2">
            <div class="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center">${user.name.charAt(0).toUpperCase()}</div>
            <div>
              <p class="font-bold text-white">${user.name}</p>
              <p class="text-[10px] text-slate-400">${user.email}</p>
            </div>
          </div>
          <button onclick="handleLogout()" class="w-full py-2 bg-rose-950/80 border border-rose-800 text-rose-300 rounded-lg text-xs font-bold">Sign Out</button>
        </div>
      `;
    } else {
      mobileDrawer.innerHTML = `
        <a href="pages/login.html" class="block w-full text-center py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-xs">Sign In / Create Account</a>
      `;
    }
  }
}

/**
 * Highlights current active link in header nav
 */
function updateActiveNavLinks(pageName) {
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    const isActive = href && (href === `#${pageName}` || href.startsWith(`#${pageName}?`));
    
    if (isActive) {
      if (link.classList.contains('block')) {
        link.className = 'nav-link block px-4 py-2.5 rounded-xl text-base font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md shadow-blue-500/25 transition-all duration-200';
      } else {
        link.className = 'nav-link px-4 py-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md shadow-blue-500/25 ring-1 ring-blue-400/30 transition-all duration-200';
      }
    } else {
      if (link.classList.contains('block')) {
        link.className = 'nav-link block px-4 py-2.5 rounded-xl text-base font-medium text-slate-300 hover:bg-slate-800/80 hover:text-blue-400 transition-all duration-200';
      } else {
        link.className = 'nav-link px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-blue-400 hover:bg-slate-800/70 transition-all duration-200';
      }
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
    window.location.href = 'pages/login.html?redirect=account';
    return;
  }

  // Update Profile elements
  const avatarEl = document.getElementById('account-avatar');
  const nameEl = document.getElementById('account-user-name');
  const emailEl = document.getElementById('account-user-email');
  const idEl = document.getElementById('account-user-id');
  const joinedEl = document.getElementById('account-user-joined');

  if (avatarEl) avatarEl.textContent = user.name.charAt(0).toUpperCase();
  if (nameEl) nameEl.textContent = user.name;
  if (emailEl) emailEl.textContent = user.email;
  if (idEl) idEl.textContent = user.id || 'USR-882910';
  if (joinedEl) joinedEl.textContent = user.createdAt || 'Member';

  renderUserOrderHistory(user.email);
}

/**
 * Render user's saved orders history list
 */
function renderUserOrderHistory(email) {
  const container = document.getElementById('account-orders-list');
  const countEl = document.getElementById('account-orders-count');
  if (!container) return;

  if (typeof getUserOrders !== 'function') {
    container.innerHTML = `<p class="text-xs text-slate-400">Order management system unavailable.</p>`;
    return;
  }

  const orders = getUserOrders(email);

  if (countEl) countEl.textContent = `${orders.length} Order${orders.length === 1 ? '' : 's'}`;

  if (orders.length === 0) {
    container.innerHTML = `
      <div class="text-center py-12 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-3">
        <div class="w-12 h-12 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
        </div>
        <h4 class="text-sm font-bold text-white">No Orders Placed Yet</h4>
        <p class="text-xs text-slate-400 max-w-sm mx-auto">Your order history will appear here after you place an order.</p>
        <a href="#shop" class="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-colors">Explore Hardware Catalog</a>
      </div>
    `;
    return;
  }

  container.innerHTML = orders.map(order => `
    <div class="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4 hover:border-slate-700 transition-colors">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800/80 pb-3 gap-2">
        <div>
          <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Order ID</span>
          <h4 class="text-sm font-extrabold text-blue-400 font-mono">${order.orderId}</h4>
          <p class="text-[11px] text-slate-400">${order.date}</p>
        </div>
        <div class="flex items-center space-x-3">
          <span class="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold">
            ✓ ${order.status || 'Processing'}
          </span>
          <span class="text-lg font-black text-white">Rs. ${parseFloat(order.totalAmount.replace(/[^0-9.]/g, '') || 0).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</span>
        </div>
      </div>

      <!-- Items Grid -->
      <div class="space-y-2">
        <p class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Purchased Items</p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
          ${order.items.map(item => `
            <div class="flex items-center space-x-3 bg-slate-900/80 p-2 rounded-lg border border-slate-800">
              <img src="${item.image}" alt="${item.name}" class="w-10 h-10 object-cover rounded-md flex-shrink-0 bg-slate-950">
              <div class="min-w-0 flex-1">
                <p class="text-xs font-bold text-white truncate">${item.name}</p>
                <p class="text-[10px] text-slate-400">Qty: ${item.quantity} × Rs. ${item.price}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <span>Payment Method: <strong class="text-slate-200">${order.paymentMethod}</strong></span>
        <span class="text-emerald-400 font-semibold flex items-center space-x-1">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          <span>Card & Address Details Not Stored</span>
        </span>
      </div>
    </div>
  `).join('');
}

/**
 * Log out active session
 */
function handleLogout() {
  if (typeof logoutUser === 'function') {
    logoutUser();
  }
  showToast('Signed out of account.');
  window.location.hash = '#home';
  handleRoute();
}

/**
 * Renders top 4 featured products on home page section
 */
function renderHomeFeaturedProducts() {
  const grid = document.getElementById('home-featured-grid');
  if (!grid || typeof getFeaturedProducts === 'undefined') return;

  const featured = getFeaturedProducts().slice(0, 4);
  grid.innerHTML = featured.map(product => `
    <div class="group rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 p-4 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/5">
      <div>
        <div onclick="viewProductDetails(${product.id})" class="relative overflow-hidden rounded-xl bg-slate-950 mb-4 h-48 flex items-center justify-center cursor-pointer">
          <img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
          ${product.badge ? `<span class="absolute top-3 left-3 bg-blue-600 text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full shadow-md">${product.badge}</span>` : ''}
          <div class="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span class="px-3 py-1.5 rounded-xl bg-blue-600/90 text-white text-xs font-bold shadow-lg flex items-center space-x-1 backdrop-blur-md">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
              <span>View Specs</span>
            </span>
          </div>
        </div>
        <span class="text-[11px] font-bold uppercase text-slate-400 tracking-wider">${product.category}</span>
        <h3 onclick="viewProductDetails(${product.id})" class="text-base font-bold text-white mt-1 line-clamp-1 group-hover:text-blue-400 transition-colors cursor-pointer">${product.name}</h3>
        <p class="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">${product.description}</p>
      </div>
      
      <div class="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between">
        <div>
          <span class="text-xs text-slate-400 line-through">Rs. ${product.originalPrice}</span>
          <p class="text-xl font-black text-white">Rs. ${product.price}</p>
        </div>
        <div class="flex items-center space-x-1.5">
          <button onclick="viewProductDetails(${product.id})" class="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700/80 transition-all" title="View Product Details">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
          </button>
          <button onclick="addToCart(${product.id})" class="px-3.5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center space-x-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  `).join('');
}



/**
 * Renders Legal Policy Section (Privacy Policy, Terms of Service, Guarantee & Warranty)
 */
function renderPolicyPage(policyKey = 'privacy') {
  const container = document.getElementById('policy-content-area');
  const tabsContainer = document.getElementById('policy-tabs-container');
  if (!container || typeof legalPolicies === 'undefined') return;

  const key = legalPolicies[policyKey] ? policyKey : 'privacy';
  const policy = legalPolicies[key];

  // Render Tabs
  if (tabsContainer) {
    tabsContainer.innerHTML = Object.keys(legalPolicies).map(k => {
      const p = legalPolicies[k];
      const isActive = k === key;
      return `
        <a href="#${k}" class="flex items-center space-x-2 px-5 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all ${
          isActive 
            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 ring-1 ring-blue-400/30' 
            : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
        }">
          ${p.icon}
          <span>${p.title}</span>
        </a>
      `;
    }).join('');
  }

  // Render Main Policy Content Body
  container.innerHTML = `
    <div class="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-md space-y-8">
      
      <!-- Policy Header Banner -->
      <div class="border-b border-slate-800 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center space-x-3 mb-2">
            <div class="p-2.5 rounded-2xl bg-blue-600/10 border border-blue-500/30 text-blue-400">
              ${policy.icon}
            </div>
            <span class="text-xs font-extrabold uppercase tracking-widest text-blue-400">Official Legal Policy</span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-black text-white tracking-tight">${policy.title}</h1>
          <p class="text-sm text-slate-400 mt-1">${policy.subtitle}</p>
        </div>

        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <span class="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold">
            <svg class="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            <span>Updated: ${policy.lastUpdated}</span>
          </span>
          <button onclick="window.print()" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold border border-slate-700 transition-all flex items-center space-x-1.5">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
            <span>Print Policy</span>
          </button>
        </div>
      </div>

      <!-- Policy Sections List -->
      <div class="space-y-8">
        ${policy.sections.map(sec => `
          <div class="space-y-3 bg-slate-950/60 p-5 sm:p-6 rounded-2xl border border-slate-800/80 hover:border-slate-700/80 transition-colors">
            <h3 class="text-base sm:text-lg font-extrabold text-white flex items-center space-x-2">
              <span class="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>
              <span>${sec.heading}</span>
            </h3>
            <p class="text-sm text-slate-300 leading-relaxed font-normal">${sec.content}</p>
            ${sec.bullets ? `
              <ul class="mt-3 space-y-2 pl-4 border-l-2 border-blue-500/30">
                ${sec.bullets.map(bullet => `
                  <li class="text-xs sm:text-sm text-slate-400 flex items-start space-x-2">
                    <span class="text-blue-400 font-bold">▪</span>
                    <span>${bullet}</span>
                  </li>
                `).join('')}
              </ul>
            ` : ''}
          </div>
        `).join('')}
      </div>

      <!-- Policy Footer Assistance Callout -->
      <div class="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-blue-950/40 via-indigo-950/40 to-slate-900 p-6 rounded-2xl border border-blue-500/20">
        <div>
          <h4 class="text-sm font-bold text-white">Have questions regarding our ${policy.title}?</h4>
          <p class="text-xs text-slate-400 mt-0.5">Our legal and support team is ready to assist you anytime.</p>
        </div>
        <a href="mailto:support@etechcomputers.com" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center space-x-2 flex-shrink-0">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
          <span>Contact Legal Team</span>
        </a>
      </div>

    </div>
  `;
}
