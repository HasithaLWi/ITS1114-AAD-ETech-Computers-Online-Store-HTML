// ETech Computers - Authentication & User State Management Module

const USERS_STORAGE_KEY = 'etech_users';
const CURRENT_USER_KEY = 'etech_current_user';
const ORDERS_STORAGE_KEY = 'etech_orders';

/**
 * Get all registered users from localStorage
 */
function getUsers() {
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
function registerUser(name, email, password) {
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
function loginUser(email, password) {
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
function setCurrentUser(user) {
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
function getCurrentUser() {
  const session = localStorage.getItem(CURRENT_USER_KEY);
  return session ? JSON.parse(session) : null;
}

/**
 * Check if user is logged in
 * @returns {boolean}
 */
function isLoggedIn() {
  return getCurrentUser() !== null;
}

/**
 * Log out active user session
 */
function logoutUser() {
  localStorage.removeItem(CURRENT_USER_KEY);
}

/**
 * Save order details to order database (excluding sensitive card/address data)
 * @param {object} orderData 
 */
function saveOrder(orderData) {
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
function getAllOrders() {
  const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

/**
 * Get order history for a specific user email
 * @param {string} email 
 * @returns {Array}
 */
function getUserOrders(email) {
  if (!email) return [];
  const cleanEmail = email.toLowerCase();
  const allOrders = getAllOrders();
  return allOrders.filter(o => o.email === cleanEmail);
}
