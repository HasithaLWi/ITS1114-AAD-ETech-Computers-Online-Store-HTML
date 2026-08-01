// ETech Computers - Authentication & User State Management Module

const USERS_STORAGE_KEY = 'etech_users';
const CURRENT_USER_KEY = 'etech_current_user';
const ORDERS_STORAGE_KEY = 'etech_orders';

/**
 * Get all registered users from localStorage
 */
export function getUsers() {
  const users = localStorage.getItem(USERS_STORAGE_KEY);
  return users ? JSON.parse(users) : [];
}

/**
 * Register a new user
 * @param {string} name 
 * @param {string} email 
 * @param {string} password 
 * @returns {object} { success: boolean, message: string, user: object }
 */
export function registerUser(name, email, password) {
  const cleanName = name.trim();
  const cleanEmail = email.trim().toLowerCase();

  if (!cleanName || !cleanEmail || !password) {
    return { success: false, message: 'Please fill in all required fields.' };
  }

  if (password.length < 6) {
    return { success: false, message: 'Password must be at least 6 characters long.' };
  }

  const users = getUsers();
  const existingUser = users.find(u => u.email.toLowerCase() === cleanEmail);

  if (existingUser) {
    return { success: false, message: 'An account with this email address already exists. Please log in.' };
  }

  const newUser = {
    id: 'USR-' + Math.floor(100000 + Math.random() * 900000),
    name: cleanName,
    email: cleanEmail,
    password: password, // Simple client-side storage for demo app
    createdAt: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  };

  users.push(newUser);
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

  // Automatically log in newly registered user
  setCurrentUser(newUser);

  return { success: true, message: 'Account created successfully!', user: newUser };
}

/**
 * Log in user with credentials
 * @param {string} email 
 * @param {string} password 
 * @returns {object} { success: boolean, message: string, user: object }
 */
export function loginUser(email, password) {
  const cleanEmail = email.trim().toLowerCase();

  if (!cleanEmail || !password) {
    return { success: false, message: 'Please enter both email address and password.' };
  }

  const users = getUsers();
  const user = users.find(u => u.email.toLowerCase() === cleanEmail);

  if (!user || user.password !== password) {
    return { success: false, message: 'Invalid email address or password. Please try again.' };
  }

  setCurrentUser(user);

  return { success: true, message: 'Logged in successfully!', user: user };
}

/**
 * Set active user session
 */
export function setCurrentUser(user) {
  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt
  };
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(safeUser));
}

/**
 * Get active user session
 * @returns {object|null}
 */
export function getCurrentUser() {
  const session = localStorage.getItem(CURRENT_USER_KEY);
  return session ? JSON.parse(session) : null;
}

/**
 * Check if user is logged in
 * @returns {boolean}
 */
export function isLoggedIn() {
  return getCurrentUser() !== null;
}

/**
 * Log out active user session
 */
export function logoutUser() {
  localStorage.removeItem(CURRENT_USER_KEY);
}

/**
 * Save order details to order database (excluding sensitive card/address data)
 * @param {object} orderData 
 */
export function saveOrder(orderData) {
  const orders = getAllOrders();

  // Strict privacy enforcement: Ensure sensitive fields are never saved
  const sanitizedOrder = {
    orderId: orderData.orderId,
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    customerName: orderData.customerName,
    email: orderData.email.toLowerCase(),
    items: orderData.items.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image
    })),
    subtotal: orderData.subtotal,
    tax: orderData.tax,
    shipping: orderData.shipping,
    totalAmount: orderData.totalAmount,
    paymentMethod: orderData.paymentMethod === 'card' ? 'Credit / Debit Card' : 'Cash on Delivery',
    status: 'Processing'
  };

  orders.unshift(sanitizedOrder);
  localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));

  return sanitizedOrder;
}

/**
 * Get all orders from localStorage
 * @returns {Array}
 */
export function getAllOrders() {
  const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

/**
 * Get order history for a specific user email
 * @param {string} email 
 * @returns {Array}
 */
export function getUserOrders(email) {
  if (!email) return [];
  const cleanEmail = email.toLowerCase();
  const allOrders = getAllOrders();
  return allOrders.filter(o => o.email === cleanEmail);
}

// ── Login Page Logic (only runs if login-form exists in DOM) ──
document.addEventListener('DOMContentLoaded', () => {
  // Only execute on login page
  if (!document.getElementById('login-form')) return;

  const urlParams = new URLSearchParams(window.location.search);
  const redirectParam = urlParams.get('redirect');
  const tabParam = urlParams.get('tab');

  // Check if already logged in
  if (isLoggedIn()) {
    const destination = redirectParam ? `../index.html#${redirectParam}` : '../index.html#account';
    window.location.href = destination;
    return;
  }

  // Show banner if redirected
  if (redirectParam) {
    const banner = document.getElementById('redirect-banner');
    const bannerText = document.getElementById('redirect-banner-text');
    if (banner && bannerText) {
      banner.classList.remove('hidden');
      if (redirectParam === 'checkout') {
        bannerText.textContent = 'Please log in or create an account to finish your order checkout.';
      } else if (redirectParam === 'account') {
        bannerText.textContent = 'You must sign up or log in first to view your Account & Order history.';
      }
    }
  }

  // Auto switch tab if tab=signup
  if (tabParam === 'signup') {
    switchTab('signup');
  }
});

export function switchTab(tab) {
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  const loginBtn = document.getElementById('tab-login-btn');
  const signupBtn = document.getElementById('tab-signup-btn');
  const alertBox = document.getElementById('auth-alert');

  if (alertBox) alertBox.classList.add('hidden');

  if (tab === 'login') {
    loginForm.classList.remove('hidden');
    signupForm.classList.add('hidden');
    loginBtn.className = 'flex-1 py-2.5 text-xs font-bold rounded-lg transition-all text-white bg-blue-600 shadow-md';
    signupBtn.className = 'flex-1 py-2.5 text-xs font-bold rounded-lg transition-all text-slate-400 hover:text-white';
  } else {
    loginForm.classList.add('hidden');
    signupForm.classList.remove('hidden');
    signupBtn.className = 'flex-1 py-2.5 text-xs font-bold rounded-lg transition-all text-white bg-blue-600 shadow-md';
    loginBtn.className = 'flex-1 py-2.5 text-xs font-bold rounded-lg transition-all text-slate-400 hover:text-white';
  }
}

export function togglePasswordVisibility(fieldId) {
  const field = document.getElementById(fieldId);
  if (field) {
    field.type = field.type === 'password' ? 'text' : 'password';
  }
}

export function showAlert(message, isError = true) {
  const alertBox = document.getElementById('auth-alert');
  const alertText = document.getElementById('auth-alert-text');
  if (!alertBox || !alertText) return;

  alertBox.classList.remove('hidden', 'bg-rose-950/80', 'border-rose-800', 'text-rose-300', 'bg-emerald-950/80', 'border-emerald-800', 'text-emerald-300');

  if (isError) {
    alertBox.classList.add('bg-rose-950/80', 'border-rose-800', 'text-rose-300');
  } else {
    alertBox.classList.add('bg-emerald-950/80', 'border-emerald-800', 'text-emerald-300');
  }

  alertText.textContent = message;
}

function getRedirectTarget() {
  const urlParams = new URLSearchParams(window.location.search);
  const redirectParam = urlParams.get('redirect');
  return redirectParam ? `../index.html#${redirectParam}` : '../index.html#account';
}

export function handleLoginSubmit(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  const res = loginUser(email, password);
  if (res.success) {
    showAlert(res.message, false);
    setTimeout(() => {
      window.location.href = getRedirectTarget();
    }, 800);
  } else {
    showAlert(res.message, true);
  }
}

export function handleSignupSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('signup-name').value;
  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;
  const confirmPassword = document.getElementById('signup-confirm-password').value;

  if (password !== confirmPassword) {
    showAlert("Passwords do not match. Please re-enter your password.", true);
    return;
  }

  const res = registerUser(name, email, password);
  if (res.success) {
    showAlert(res.message, false);
    setTimeout(() => {
      window.location.href = getRedirectTarget();
    }, 800);
  } else {
    showAlert(res.message, true);
  }
}


