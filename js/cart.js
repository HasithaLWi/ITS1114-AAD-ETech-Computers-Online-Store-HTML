// ETech Computers - Shopping Cart & Checkout Logic
import { products, getStoredProducts, deductBranchStock } from './data.js';
import { saveOrder, getCurrentUser } from './auth.js';
import { autoSelectFulfillmentBranch } from './branches.js';

/**
 * Global LocalStorage Cart State Helpers
 */
export function getCart() {
  const cart = localStorage.getItem('etech_cart');
  return cart ? JSON.parse(cart) : [];
}

export function saveCart(cart) {
  localStorage.setItem('etech_cart', JSON.stringify(cart));
  updateCartBadge();
}

export function updateCartBadge() {
  const badge = document.getElementById('cart-count-badge');
  if (!badge) return;

  const cart = getCart();
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  badge.textContent = totalItems;
}

export function addToCart(productId, quantity = 1) {
  const allProducts = getStoredProducts();
  const product = allProducts.find(p => p.id === parseInt(productId));
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

export function showToast(message) {
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

  setTimeout(() => {
    toast.classList.remove('translate-y-4', 'opacity-0');
  }, 10);

  setTimeout(() => {
    toast.classList.add('translate-y-4', 'opacity-0');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/**
 * Called by app.js router whenever #cart fragment is loaded into DOM
 */
export function initCartLogic() {
  renderCart();

  const clearCartBtn = document.getElementById('clear-cart-btn');
  if (clearCartBtn) {
    clearCartBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to clear all items from your cart?')) {
        saveCart([]);
        renderCart();
      }
    });
  }
}

/**
 * Reads localStorage cart array, updates UI items list and order totals
 */
function renderCart() {
  const container = document.getElementById('cart-items-container');
  const cartContentLayout = document.getElementById('cart-content-layout');
  const emptyCartView = document.getElementById('empty-cart-view');
  const clearCartBtn = document.getElementById('clear-cart-btn');

  if (!container) return;

  const cart = getCart();

  if (cart.length === 0) {
    if (cartContentLayout) cartContentLayout.classList.add('hidden');
    if (emptyCartView) emptyCartView.classList.remove('hidden');
    if (clearCartBtn) clearCartBtn.classList.add('hidden');
    updateSummaryTotals(0);
    return;
  }

  if (cartContentLayout) cartContentLayout.classList.remove('hidden');
  if (emptyCartView) emptyCartView.classList.add('hidden');
  if (clearCartBtn) clearCartBtn.classList.remove('hidden');

  let subtotal = 0;

  container.innerHTML = cart.map(item => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;

    return `
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 transition-all hover:border-slate-700">
        
        <!-- Product Image & Details -->
        <div class="flex items-center space-x-4 w-full sm:w-auto">
          <div class="w-20 h-20 rounded-xl bg-slate-950 flex-shrink-0 overflow-hidden border border-slate-800 flex items-center justify-center">
            <img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover">
          </div>
          <div>
            <span class="text-[10px] font-bold uppercase text-blue-400 tracking-wider">${item.category || 'Tech'}</span>
            <h3 class="text-base font-bold text-white line-clamp-1">${item.name}</h3>
            <p class="text-xs text-slate-400 mt-0.5">Unit Price: <span class="text-white font-semibold">Rs. ${item.price}</span></p>
          </div>
        </div>

        <!-- Quantity Controls & Actions -->
        <div class="flex items-center justify-between sm:justify-end w-full sm:w-auto space-x-6 border-t sm:border-t-0 border-slate-800 pt-3 sm:pt-0">
          <div class="flex items-center space-x-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <button onclick="updateItemQuantity(${item.id}, -1)" class="text-slate-400 hover:text-white font-bold px-1.5">-</button>
            <span class="text-xs font-bold text-white w-6 text-center">${item.quantity}</span>
            <button onclick="updateItemQuantity(${item.id}, 1)" class="text-slate-400 hover:text-white font-bold px-1.5">+</button>
          </div>
          <span class="text-sm font-extrabold text-white">Rs. ${itemTotal.toLocaleString()}</span>
          <button onclick="removeItemFromCart(${item.id})" class="text-slate-500 hover:text-rose-400 transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </button>
        </div>

      </div>
    `;
  }).join('');

  updateSummaryTotals(subtotal);
}

/*
 * Increment or Decrement quantity of a cart item
 */
export function updateItemQuantity(productId, delta) {
  let cart = getCart();
  const item = cart.find(i => i.id === productId);

  if (item) {
    item.quantity += delta;
    if (item.quantity <= 0) {
      cart = cart.filter(i => i.id !== productId);
    }
    saveCart(cart);
    renderCart();
  }
}

/**
 * Remove a product item completely from cart
 */
export function removeItemFromCart(productId) {
  let cart = getCart();
  cart = cart.filter(i => i.id !== productId);
  saveCart(cart);
  renderCart();
  if (typeof showToast === 'function') showToast('Item removed from cart');
}

/**
 * Recalculates subtotal, tax (8%), shipping, and total amount
 */
export function updateSummaryTotals(subtotal) {
  const subtotalEl = document.getElementById('summary-subtotal');
  const taxEl = document.getElementById('summary-tax');
  const shippingEl = document.getElementById('summary-shipping');
  const totalEl = document.getElementById('summary-total');

  const tax = subtotal * 0.08;
  const shipping = subtotal > 150000 || subtotal === 0 ? 0 : 2500;
  const grandTotal = subtotal + tax + shipping;

  if (subtotalEl) subtotalEl.textContent = `Rs. ${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (taxEl) taxEl.textContent = `Rs. ${tax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  if (shippingEl) {
    if (subtotal === 0) {
      shippingEl.textContent = 'Rs. 0.00';
      shippingEl.className = 'font-bold text-white';
    } else if (shipping === 0) {
      shippingEl.textContent = 'FREE';
      shippingEl.className = 'font-bold text-emerald-400';
    } else {
      shippingEl.textContent = `Rs. ${shipping.toFixed(2)}`;
      shippingEl.className = 'font-bold text-white';
    }
  }

  if (totalEl) totalEl.textContent = `Rs. ${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}


/* ================= CHECKOUT HOOK & LOGIC ================= */

export function initCheckoutLogic() {
  const cart = getCart();

  if (cart.length === 0) {
    alert("Your cart is empty! Redirecting to shop catalog...");
    window.location.hash = '#shop';
    return;
  }

  const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
  if (user) {
    const fullNameInput = document.getElementById('full-name');
    const emailInput = document.getElementById('email');
    if (fullNameInput && !fullNameInput.value) fullNameInput.value = user.name;
    if (emailInput && !emailInput.value) emailInput.value = user.email;
  }

  const cityInput = document.getElementById('city');
  const initialCity = cityInput ? (cityInput.value.trim() || 'Colombo') : 'Colombo';

  renderCheckoutSummary(cart, initialCity);

  if (cityInput) {
    cityInput.addEventListener('change', () => {
      renderCheckoutSummary(cart, cityInput.value.trim() || 'Colombo');
    });
  }

  const checkoutForm = document.getElementById('checkout-form');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', handleCheckoutSubmit);
  }
}

/**
 * Renders mini items list, automated fulfillment branch calculation, distance shipping fees
 */
export function renderCheckoutSummary(cart, customerCity = 'Colombo') {
  const itemsContainer = document.getElementById('checkout-items-list');
  const subtotalEl = document.getElementById('checkout-subtotal');
  const taxEl = document.getElementById('checkout-tax');
  const shippingEl = document.getElementById('checkout-shipping');
  const totalEl = document.getElementById('checkout-total');
  const branchInfoEl = document.getElementById('checkout-branch-info');

  if (!itemsContainer) return;

  let subtotal = 0;

  itemsContainer.innerHTML = cart.map(item => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;

    return `
      <div class="flex items-center justify-between text-xs py-2 border-b border-slate-800/60 last:border-0">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 rounded-lg bg-slate-950 flex-shrink-0 overflow-hidden border border-slate-800 flex items-center justify-center">
            <img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover">
          </div>
          <div>
            <p class="font-bold text-white line-clamp-1">${item.name}</p>
            <p class="text-slate-400">Qty: ${item.quantity} × Rs. ${item.price}</p>
          </div>
        </div>
        <span class="font-bold text-white">Rs. ${itemTotal.toLocaleString()}</span>
      </div>
    `;
  }).join('');

  // Run automated fulfillment branch selection
  const productsList = getStoredProducts();
  const fulfillment = autoSelectFulfillmentBranch(cart, customerCity, productsList);

  const tax = subtotal * 0.08;
  const shipping = subtotal > 150000 ? 0 : (fulfillment ? fulfillment.shippingFee : 450);
  const grandTotal = subtotal + tax + shipping;

  if (subtotalEl) subtotalEl.textContent = `Rs. ${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (taxEl) taxEl.textContent = `Rs. ${tax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (shippingEl) shippingEl.textContent = shipping === 0 ? 'FREE' : `Rs. ${shipping.toFixed(2)}`;
  if (totalEl) totalEl.textContent = `Rs. ${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  if (branchInfoEl && fulfillment) {
    branchInfoEl.innerHTML = `
      <div class="p-3 bg-blue-950/40 border border-blue-500/30 rounded-xl text-xs space-y-1">
        <div class="flex items-center justify-between font-bold text-blue-300">
          <span>Dispatch Hub: ${fulfillment.branch.name}</span>
          <span class="text-[10px] font-mono bg-blue-500/20 px-2 py-0.5 rounded text-blue-400">${fulfillment.distanceKm} km distance</span>
        </div>
        <p class="text-[11px] text-slate-400">Auto-selected as closest warehouse with full stock for your delivery destination.</p>
      </div>
    `;
  }
}

/**
 * Handles checkout form submission, saves order, and deducts branch stock
 */
export function handleCheckoutSubmit(e) {
  e.preventDefault();

  const fullName = document.getElementById('full-name')?.value.trim();
  const email = document.getElementById('email')?.value.trim();
  const address = document.getElementById('address')?.value.trim();
  const city = document.getElementById('city')?.value.trim() || 'Colombo';
  const phone = document.getElementById('phone')?.value.trim() || '';

  if (!fullName || !email || !address || !city) {
    alert("Please fill out all required shipping details.");
    return;
  }

  const cart = getCart();
  if (!cart.length) return;

  const productsList = getStoredProducts();
  const fulfillment = autoSelectFulfillmentBranch(cart, city, productsList);

  const subtotal = cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
  const tax = subtotal * 0.08;
  const shipping = subtotal > 150000 ? 0 : (fulfillment ? fulfillment.shippingFee : 450);
  const grandTotal = subtotal + tax + shipping;

  const orderId = '#ETC-' + Math.floor(100000 + Math.random() * 900000);

  // Save order
  const savedOrder = saveOrder({
    orderId: orderId,
    customerName: fullName,
    email: email,
    phone: phone,
    city: city,
    address: address,
    fulfillmentBranch: fulfillment ? fulfillment.branch.name : 'Colombo Main Hub',
    fulfillmentBranchId: fulfillment ? fulfillment.branch.id : 'BR-COL',
    distanceKm: fulfillment ? fulfillment.distanceKm : 5,
    items: cart,
    subtotal: `Rs. ${subtotal.toFixed(2)}`,
    tax: `Rs. ${tax.toFixed(2)}`,
    shipping: shipping === 0 ? 'FREE' : `Rs. ${shipping.toFixed(2)}`,
    totalAmount: `Rs. ${grandTotal.toFixed(2)}`,
    paymentMethod: 'card'
  });

  // Deduct inventory stock from assigned branch
  const branchId = fulfillment ? fulfillment.branch.id : 'BR-COL';
  cart.forEach(item => {
    deductBranchStock(item.id, branchId, item.quantity);
  });

  // Clear cart
  saveCart([]);

  // Populate modal
  const modalOrderId = document.getElementById('modal-order-id');
  const modalCustomerName = document.getElementById('modal-customer-name');
  const modalTotalPaid = document.getElementById('modal-total-paid');

  if (modalOrderId) modalOrderId.textContent = orderId;
  if (modalCustomerName) modalCustomerName.textContent = fullName;
  if (modalTotalPaid) modalTotalPaid.textContent = `Rs. ${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const modal = document.getElementById('order-success-modal');
  if (modal) {
    modal.classList.remove('hidden');
  }
}
