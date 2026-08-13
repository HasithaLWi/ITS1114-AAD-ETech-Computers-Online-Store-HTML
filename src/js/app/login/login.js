// ETech Computers - Authentication & User State Management Module

const USERS_STORAGE_KEY = 'etech_users';
const CURRENT_USER_KEY = 'etech_current_user';
const ORDERS_STORAGE_KEY = 'etech_orders';

const DEFAULT_USERS = [
  {
    id: 'USR-100001',
    name: 'System Admin',
    email: 'admin@etech.com',
    password: 'admin123',
    role: 'ADMIN',
    assignedBranch: 'BR-COL',
    createdAt: 'Jan 15, 2026'
  },
  {
    id: 'USR-100002',
    name: 'Galle Operations Staff',
    email: 'staff@etech.com',
    password: 'staff123',
    role: 'STAFF',
    assignedBranch: 'BR-GAL',
    createdAt: 'Feb 01, 2026'
  },
  {
    id: 'USR-100003',
    name: 'John Doe',
    email: 'customer@etech.com',
    password: 'customer123',
    role: 'CUSTOMER',
    assignedBranch: null,
    createdAt: 'Mar 10, 2026'
  }
];

/**
 * Get all registered users from localStorage (seed defaults if empty)
 */
export function getUsers() {
  const users = localStorage.getItem(USERS_STORAGE_KEY);
  if (!users) {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
    return DEFAULT_USERS;
  }
  const parsed = JSON.parse(users);
  // Ensure default admin always exists if missing
  if (!parsed.some(u => u.email.toLowerCase() === 'admin@etech.com')) {
    parsed.unshift(DEFAULT_USERS[0]);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(parsed));
  }
  return parsed;
}

/**
 * Register a new user (always role CUSTOMER)
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
    password: password,
    role: 'CUSTOMER',
    assignedBranch: null,
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
    role: user.role || 'CUSTOMER',
    assignedBranch: user.assignedBranch || null,
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
 * ADMIN ONLY: Add a new user directly (Admin or Staff or Customer)
 */
export function addUserByAdmin(userData) {
  const users = getUsers();
  const cleanEmail = userData.email.trim().toLowerCase();

  if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
    return { success: false, message: 'Email address already exists.' };
  }

  const newUser = {
    id: 'USR-' + Math.floor(100000 + Math.random() * 900000),
    name: userData.name.trim(),
    email: cleanEmail,
    password: userData.password || 'etech123',
    role: userData.role || 'STAFF',
    assignedBranch: userData.assignedBranch || null,
    createdAt: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  };

  users.push(newUser);
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

  return { success: true, message: `User ${newUser.name} created successfully!`, user: newUser };
}

/**
 * ADMIN ONLY: Update existing user role / branch
 */
export function updateUserRole(userId, newRole, assignedBranch = null) {
  const users = getUsers();
  const user = users.find(u => u.id === userId);
  if (!user) return { success: false, message: 'User not found.' };

  user.role = newRole;
  user.assignedBranch = assignedBranch;
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

  return { success: true, message: `Role updated to ${newRole}` };
}

/**
 * ADMIN ONLY: Full user update (Name, Email, Role, Branch, Password)
 */
export function updateUser(userData) {
  const users = getUsers();
  const user = users.find(u => u.id === userData.id);
  if (!user) return { success: false, message: 'User not found.' };

  const cleanEmail = userData.email.trim().toLowerCase();
  const existingUser = users.find(u => u.email.toLowerCase() === cleanEmail && u.id !== userData.id);
  if (existingUser) {
    return { success: false, message: 'Another user with this email address already exists.' };
  }

  user.name = userData.name.trim();
  user.email = cleanEmail;
  user.role = userData.role || user.role;
  user.assignedBranch = userData.assignedBranch !== undefined ? userData.assignedBranch : user.assignedBranch;

  if (userData.password && userData.password.trim().length > 0) {
    if (userData.password.trim().length < 6) {
      return { success: false, message: 'New password must be at least 6 characters long.' };
    }
    user.password = userData.password.trim();
  }

  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

  // If current active session is being updated, update session state too
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.id === user.id) {
    setCurrentUser(user);
  }

  return { success: true, message: `User ${user.name} updated successfully!`, user };
}

/**
 * ADMIN ONLY: Delete user
 */
export function deleteUser(userId) {
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.id === userId) {
    return { success: false, message: 'You cannot delete your own active admin account.' };
  }

  let users = getUsers();
  users = users.filter(u => u.id !== userId);
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

  return { success: true, message: 'User removed successfully.' };
}

/**
 * Save order details to order database
 */
export function saveOrder(orderData) {
  const orders = getAllOrders();
  const currentUser = getCurrentUser();

  const sanitizedOrder = {
    orderId: orderData.orderId,
    userId: orderData.userId || (currentUser ? currentUser.id : null),
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    customerName: orderData.customerName,
    email: (orderData.email || '').trim().toLowerCase(),
    phone: orderData.phone || '',
    city: orderData.city || 'Colombo',
    address: orderData.address || '',
    fulfillmentBranch: orderData.fulfillmentBranch || 'Colombo Main Hub',
    fulfillmentBranchId: orderData.fulfillmentBranchId || 'BR-COL',
    distanceKm: orderData.distanceKm || 5,
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
    status: 'Pending'
  };

  orders.unshift(sanitizedOrder);
  localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));

  return sanitizedOrder;
}

/**
 * Update order status (Pending -> Processing -> Shipped -> Delivered -> Cancelled)
 */
export function updateOrderStatus(orderId, newStatus) {
  const orders = getAllOrders();
  const order = orders.find(o => o.orderId === orderId);
  if (!order) return { success: false, message: 'Order not found.' };

  order.status = newStatus;
  localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  return { success: true, message: `Order #${orderId} status updated to ${newStatus}` };
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
 * Get order history for a specific user object or email
 * @param {string|object} userOrEmail 
 * @returns {Array}
 */
export function getUserOrders(userOrEmail) {
  if (!userOrEmail) return [];
  const allOrders = getAllOrders();

  if (typeof userOrEmail === 'object') {
    const email = (userOrEmail.email || '').trim().toLowerCase();
    const userId = userOrEmail.id;
    return allOrders.filter(o => {
      const matchEmail = o.email && o.email.trim().toLowerCase() === email;
      const matchId = userId && o.userId === userId;
      return matchEmail || matchId;
    });
  }

  const cleanEmail = userOrEmail.trim().toLowerCase();
  return allOrders.filter(o => o.email && o.email.trim().toLowerCase() === cleanEmail);
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
    const user = getCurrentUser();
    window.location.href = getRedirectTarget(user);
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

function getRedirectTarget(user) {
  if (user && (user.role === 'ADMIN' || user.role === 'STAFF')) {
    return 'administrator_dashboard.html';
  }
  const urlParams = new URLSearchParams(window.location.search);
  const redirectParam = urlParams.get('redirect');
  return redirectParam ? `../../index.html#${redirectParam}` : '../../index.html#home';
}

export function handleLoginSubmit(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  const res = loginUser(email, password);
  if (res.success) {
    showAlert(`Welcome back, ${res.user.name}! Redirecting...`, false);
    setTimeout(() => {
      window.location.href = getRedirectTarget(res.user);
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


