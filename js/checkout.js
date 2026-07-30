// ETech Computers - Checkout Page Script

document.addEventListener('DOMContentLoaded', () => {
  initCheckoutLogic();
});

function initCheckoutLogic() {
  // 1. Mandatory Route Guard: Check if user is logged in
  if (typeof isLoggedIn === 'function' && !isLoggedIn()) {
    window.location.href = 'pages/login.html?redirect=checkout';
    return;
  }

  const cart = typeof getCart === 'function' ? getCart() : [];

  // 2. Check if cart is empty
  if (cart.length === 0) {
    if (typeof showToast === 'function') {
      showToast("Your cart is empty! Redirecting to shop catalog...");
    }
    setTimeout(() => {
      window.location.hash = '#shop';
    }, 500);
    return;
  }

  // 3. Pre-fill logged in user info
  if (typeof getCurrentUser === 'function') {
    const user = getCurrentUser();
    if (user) {
      const nameInput = document.getElementById('full-name');
      const emailInput = document.getElementById('email');
      if (nameInput && !nameInput.value) nameInput.value = user.name;
      if (emailInput && !emailInput.value) emailInput.value = user.email;
    }
  }

  renderCheckoutSummary(cart);

  // 4. Set up form submission handler
  const checkoutForm = document.getElementById('checkout-form');
  if (checkoutForm) {
    checkoutForm.removeEventListener('submit', handleCheckoutSubmit);
    checkoutForm.addEventListener('submit', handleCheckoutSubmit);
  }
}

/**
 * Renders mini items list and subtotal calculations
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
 * Handles form validation, intercepts submit event, and saves non-sensitive order record
 */
function handleCheckoutSubmit(e) {
  e.preventDefault();

  // 1. Final authentication double-check
  if (typeof isLoggedIn === 'function' && !isLoggedIn()) {
    window.location.href = 'pages/login.html?redirect=checkout';
    return;
  }

  const fullName = document.getElementById('full-name')?.value.trim();
  const email = document.getElementById('email')?.value.trim();
  const address = document.getElementById('address')?.value.trim();
  const city = document.getElementById('city')?.value.trim();
  const postalCode = document.getElementById('postal-code')?.value.trim();
  const paymentMethodRadio = document.querySelector('input[name="payment-method"]:checked')?.value || 'card';

  if (!fullName || !email || !address || !city || !postalCode) {
    alert("Please fill out all required shipping details.");
    return;
  }

  const cart = typeof getCart === 'function' ? getCart() : [];
  if (cart.length === 0) {
    alert("Cart is empty.");
    return;
  }

  // Calculate pricing breakdown
  let subtotal = 0;
  cart.forEach(item => subtotal += item.price * item.quantity);
  const tax = subtotal * 0.08;
  const shipping = subtotal > 500 ? 0 : 25;
  const grandTotal = subtotal + tax + shipping;
  const formattedTotal = `$${grandTotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;

  // Generate random order ID
  const orderId = '#ETC-' + Math.floor(100000 + Math.random() * 900000);

  // Privacy Protection: Save order summary EXCLUDING card details & physical street address
  if (typeof saveOrder === 'function') {
    saveOrder({
      orderId: orderId,
      customerName: fullName,
      email: email,
      items: cart,
      subtotal: `$${subtotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`,
      tax: `$${tax.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`,
      shipping: shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`,
      totalAmount: formattedTotal,
      paymentMethod: paymentMethodRadio
    });
  }

  // Set modal details
  const modalOrderId = document.getElementById('modal-order-id');
  const modalCustomerName = document.getElementById('modal-customer-name');
  const modalTotalPaid = document.getElementById('modal-total-paid');

  if (modalOrderId) modalOrderId.textContent = orderId;
  if (modalCustomerName) modalCustomerName.textContent = fullName;
  if (modalTotalPaid) modalTotalPaid.textContent = formattedTotal;

  // Clear cart
  if (typeof saveCart === 'function') {
    saveCart([]);
  }

  // Show Success Modal Popup
  const modal = document.getElementById('order-success-modal');
  if (modal) {
    modal.classList.remove('hidden');
  }
}
