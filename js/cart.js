// ETech Computers - Shopping Cart & Checkout Logic

/**
 * Called by app.js router whenever #cart fragment is loaded into DOM
 */
function initCartLogic() {
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
            <p class="text-xs text-slate-400 mt-0.5">Unit Price: <span class="text-white font-semibold">$${item.price}</span></p>
          </div>
        </div>

        <!-- Quantity Controls & Actions -->
        <div class="flex items-center justify-between sm:justify-end w-full sm:w-auto space-x-6 border-t sm:border-t-0 border-slate-800 pt-3 sm:pt-0">
          
          <!-- Quantity Stepper -->
          <div class="flex items-center space-x-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button onclick="updateItemQuantity(${item.id}, -1)" class="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center transition-colors">
              -
            </button>
            <span class="w-8 text-center text-sm font-bold text-white">${item.quantity}</span>
            <button onclick="updateItemQuantity(${item.id}, 1)" class="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center transition-colors">
              +
            </button>
          </div>

          <!-- Total Price for Line Item -->
          <div class="text-right min-w-[90px]">
            <span class="text-[10px] text-slate-400 uppercase tracking-wider block">Line Total</span>
            <span class="text-lg font-extrabold text-white">$${itemTotal.toLocaleString()}</span>
          </div>

          <!-- Remove Item Button -->
          <button onclick="removeItemFromCart(${item.id})" class="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all" title="Remove item">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          </button>

        </div>

      </div>
    `;
  }).join('');

  updateSummaryTotals(subtotal);
}

/**
 * Increment or Decrement quantity of a cart item
 */
function updateItemQuantity(productId, delta) {
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
function removeItemFromCart(productId) {
  let cart = getCart();
  cart = cart.filter(i => i.id !== productId);
  saveCart(cart);
  renderCart();
  showToast('Item removed from cart');
}

/**
 * Recalculates subtotal, tax (8%), shipping, and total amount
 */
function updateSummaryTotals(subtotal) {
  const subtotalEl = document.getElementById('summary-subtotal');
  const taxEl = document.getElementById('summary-tax');
  const shippingEl = document.getElementById('summary-shipping');
  const totalEl = document.getElementById('summary-total');

  const tax = subtotal * 0.08; // 8% sales tax
  const shipping = subtotal > 500 || subtotal === 0 ? 0 : 25; // Free shipping over $500
  const grandTotal = subtotal + tax + shipping;

  if (subtotalEl) subtotalEl.textContent = `$${subtotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  if (taxEl) taxEl.textContent = `$${tax.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  
  if (shippingEl) {
    if (subtotal === 0) {
      shippingEl.textContent = '$0.00';
      shippingEl.className = 'font-bold text-white';
    } else if (shipping === 0) {
      shippingEl.textContent = 'FREE';
      shippingEl.className = 'font-bold text-emerald-400';
    } else {
      shippingEl.textContent = `$${shipping.toFixed(2)}`;
      shippingEl.className = 'font-bold text-white';
    }
  }

  if (totalEl) totalEl.textContent = `$${grandTotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
}


/* ================= CHECKOUT HOOK & LOGIC ================= */

/**
 * Called by app.js router whenever #checkout fragment is loaded into DOM
 */
function initCheckoutLogic() {
  const cart = getCart();

  // If cart is empty, redirect to shop page hash
  if (cart.length === 0) {
    alert("Your cart is empty! Redirecting to shop catalog...");
    window.location.hash = '#shop';
    return;
  }

  renderCheckoutSummary(cart);

  const checkoutForm = document.getElementById('checkout-form');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', handleCheckoutSubmit);
  }
}

/**
 * Renders mini items list and subtotal calculations on checkout fragment
 */
function renderCheckoutSummary(cart) {
  const itemsContainer = document.getElementById('checkout-items-list');
  const subtotalEl = document.getElementById('checkout-subtotal');
  const taxEl = document.getElementById('checkout-tax');
  const shippingEl = document.getElementById('checkout-shipping');
  const totalEl = document.getElementById('checkout-total');

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
            <p class="text-slate-400">Qty: ${item.quantity} × $${item.price}</p>
          </div>
        </div>
        <span class="font-bold text-white">$${itemTotal.toLocaleString()}</span>
      </div>
    `;
  }).join('');

  const tax = subtotal * 0.08;
  const shipping = subtotal > 500 ? 0 : 25;
  const grandTotal = subtotal + tax + shipping;

  if (subtotalEl) subtotalEl.textContent = `$${subtotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  if (taxEl) taxEl.textContent = `$${tax.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  if (shippingEl) shippingEl.textContent = shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`;
  if (totalEl) totalEl.textContent = `$${grandTotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
}

/**
 * Handles checkout form submission
 */
function handleCheckoutSubmit(e) {
  e.preventDefault();

  const fullName = document.getElementById('full-name')?.value.trim();
  const email = document.getElementById('email')?.value.trim();
  const address = document.getElementById('address')?.value.trim();
  const city = document.getElementById('city')?.value.trim();
  const postalCode = document.getElementById('postal-code')?.value.trim();

  if (!fullName || !email || !address || !city || !postalCode) {
    alert("Please fill out all required shipping details.");
    return;
  }

  // Generate order ID
  const orderId = '#ETC-' + Math.floor(100000 + Math.random() * 900000);
  const totalAmount = document.getElementById('checkout-total')?.textContent || '$0.00';

  // Populate modal
  const modalOrderId = document.getElementById('modal-order-id');
  const modalCustomerName = document.getElementById('modal-customer-name');
  const modalTotalPaid = document.getElementById('modal-total-paid');

  if (modalOrderId) modalOrderId.textContent = orderId;
  if (modalCustomerName) modalCustomerName.textContent = fullName;
  if (modalTotalPaid) modalTotalPaid.textContent = totalAmount;

  // Clear localStorage cart
  saveCart([]);

  // Display Success Modal Popup
  const modal = document.getElementById('order-success-modal');
  if (modal) {
    modal.classList.remove('hidden');
  }
}
