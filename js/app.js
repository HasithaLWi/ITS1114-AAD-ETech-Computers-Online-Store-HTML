// ETech Computers - Single Page Section Toggle Router & Global App Logic

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

window.addEventListener('hashchange', () => {
  handleRoute();
});

/**
 * Initialize SPA application
 */
function initApp() {
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
  if ((pageName === 'checkout' || pageName === 'account') && typeof isLoggedIn === 'function' && !isLoggedIn()) {
    window.location.href = `pages/login.html?redirect=${pageName}`;
    return;
  }

  // 1. Hide all page sections
  const sections = document.querySelectorAll('.page-section');
  sections.forEach(sec => sec.classList.add('hidden'));

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
    if (typeof initShopLogic === 'function') {
      initShopLogic(queryPart);
    }
  } else if (pageName === 'cart') {
    if (typeof initCartLogic === 'function') {
      initCartLogic();
    }
  } else if (pageName === 'checkout') {
    if (typeof initCheckoutLogic === 'function') {
      initCheckoutLogic();
    }
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
    if (href && href.startsWith(`#${pageName}`)) {
      link.classList.add('text-white', 'bg-slate-800', 'border-b-2', 'border-blue-500');
      link.classList.remove('text-slate-300');
    } else {
      link.classList.remove('text-white', 'bg-slate-800', 'border-b-2', 'border-blue-500');
      link.classList.add('text-slate-300');
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
          <span class="text-lg font-black text-white">$${parseFloat(order.totalAmount.replace(/[^0-9.]/g, '') || 0).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</span>
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
                <p class="text-[10px] text-slate-400">Qty: ${item.quantity} × $${item.price}</p>
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
        <div class="relative overflow-hidden rounded-xl bg-slate-950 mb-4 h-48 flex items-center justify-center">
          <img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
          ${product.badge ? `<span class="absolute top-3 left-3 bg-blue-600 text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full shadow-md">${product.badge}</span>` : ''}
        </div>
        <span class="text-[11px] font-bold uppercase text-slate-400 tracking-wider">${product.category}</span>
        <h3 class="text-base font-bold text-white mt-1 line-clamp-1 group-hover:text-blue-400 transition-colors">${product.name}</h3>
        <p class="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">${product.description}</p>
      </div>
      
      <div class="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between">
        <div>
          <span class="text-xs text-slate-400 line-through">$${product.originalPrice}</span>
          <p class="text-xl font-black text-white">$${product.price}</p>
        </div>
        <button onclick="addToCart(${product.id})" class="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center space-x-1">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          <span>Add to Cart</span>
        </button>
      </div>
    </div>
  `).join('');
}

/**
 * Global LocalStorage Cart State Helpers
 */
function getCart() {
  const cart = localStorage.getItem('etech_cart');
  return cart ? JSON.parse(cart) : [];
}

function saveCart(cart) {
  localStorage.setItem('etech_cart', JSON.stringify(cart));
  updateCartBadge();
}

function updateCartBadge() {
  const badge = document.getElementById('cart-count-badge');
  if (!badge) return;

  const cart = getCart();
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  badge.textContent = totalItems;
}

function addToCart(productId, quantity = 1) {
  if (typeof products === 'undefined') return;
  const product = products.find(p => p.id === parseInt(productId));
  if (!product) return;

  let cart = getCart();
  const existingIndex = cart.findIndex(item => item.id === product.id);

  if (existingIndex > -1) {
    cart[existingIndex].quantity += quantity;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
      quantity: quantity
    });
  }

  saveCart(cart);
  showToast(`Added "${product.name}" to cart!`);
}

function showToast(message) {
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'fixed bottom-6 right-6 z-50 flex flex-col space-y-3 pointer-events-none';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  toast.className = 'pointer-events-auto flex items-center space-x-3 bg-slate-900 text-white px-5 py-3.5 rounded-xl shadow-2xl border border-blue-500/40 transform translate-y-4 opacity-0 transition-all duration-300';
  toast.innerHTML = `
    <div class="w-8 h-8 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center flex-shrink-0">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
      </svg>
    </div>
    <span class="text-sm font-medium">${message}</span>
  `;

  toastContainer.appendChild(toast);

  setTimeout(() => toast.classList.remove('translate-y-4', 'opacity-0'), 10);
  setTimeout(() => {
    toast.classList.add('translate-y-4', 'opacity-0');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
