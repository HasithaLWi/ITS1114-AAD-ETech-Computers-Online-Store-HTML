// ETech Computers - Shared Application Logic & Component Loader

document.addEventListener('DOMContentLoaded', async () => {
  await loadComponents();
  updateCartBadge();
});

/**
 * Determine if current page is inside the 'pages/' subfolder
 */
function isSubfolder() {
  return window.location.pathname.includes('/pages/');
}

/**
 * Get correct relative prefix depending on current page location
 */
function getPathPrefix() {
  return isSubfolder() ? '../' : './';
}

/**
 * Asynchronously fetch and inject Navbar & Footer components into HTML placeholders
 */
async function loadComponents() {
  const prefix = getPathPrefix();
  const navbarContainer = document.getElementById('navbar');
  const footerContainer = document.getElementById('footer');

  try {
    // Load Navbar
    if (navbarContainer) {
      const res = await fetch(`${prefix}components/navbar.html`);
      if (res.ok) {
        let html = await res.text();
        html = replacePathTokens(html);
        navbarContainer.innerHTML = html;
        setupNavbarEvents();
      }
    }

    // Load Footer
    if (footerContainer) {
      const res = await fetch(`${prefix}components/footer.html`);
      if (res.ok) {
        let html = await res.text();
        html = replacePathTokens(html);
        footerContainer.innerHTML = html;
      }
    }
  } catch (err) {
    console.error("Error loading component layouts:", err);
  }
}

/**
 * Replace placeholders inside fetched components with correct relative links
 */
function replacePathTokens(html) {
  const inPages = isSubfolder();
  
  const indexLink = inPages ? '../index.html' : 'index.html';
  const shopLink = inPages ? '../index.html#shop' : '#shop';
  const cartLink = inPages ? '../index.html#cart' : '#cart';
  const checkoutLink = inPages ? '../index.html#checkout' : '#checkout';
  const accountLink = inPages ? '../index.html#account' : '#account';
  const loginLink = inPages ? 'login.html' : 'pages/login.html';

  return html
    .replace(/INDEX_PATH/g, indexLink)
    .replace(/SHOP_PATH/g, shopLink)
    .replace(/CART_PATH/g, cartLink)
    .replace(/CHECKOUT_PATH/g, checkoutLink)
    .replace(/ACCOUNT_PATH/g, accountLink)
    .replace(/LOGIN_PATH/g, loginLink);
}

/**
 * Set up interactive elements inside navbar (mobile menu, active state)
 */
function setupNavbarEvents() {
  const btn = document.getElementById('mobile-menu-btn');
  const menu = document.getElementById('mobile-menu');

  if (btn && menu) {
    btn.addEventListener('click', () => {
      menu.classList.toggle('hidden');
    });
  }

  // Highlight active link
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav-link');
  
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href && currentPath.endsWith(href.replace('../', ''))) {
      link.classList.add('text-white', 'bg-slate-800', 'border-b-2', 'border-blue-500');
      link.classList.remove('text-slate-300');
    }
  });
}

/**
 * Cart LocalStorage Helper Functions
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
  if (totalItems > 0) {
    badge.classList.add('scale-110');
    setTimeout(() => badge.classList.remove('scale-110'), 200);
  }
}

/**
 * Add a product to the localStorage cart
 */
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

/**
 * Display toast notification overlay
 */
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

  // Animate in
  setTimeout(() => {
    toast.classList.remove('translate-y-4', 'opacity-0');
  }, 10);

  // Remove after 3 seconds
  setTimeout(() => {
    toast.classList.add('translate-y-4', 'opacity-0');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
