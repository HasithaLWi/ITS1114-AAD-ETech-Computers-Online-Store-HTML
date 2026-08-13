// ETech Computers - Administrator & Staff Management Dashboard Controller
import { getCurrentUser, isLoggedIn, logoutUser, getUsers, addUserByAdmin, updateUserRole, updateUser, deleteUser, getAllOrders, updateOrderStatus } from '../login/login.js';
import { getStoredProducts, saveProduct, deleteProduct, getProductById } from '../../models/data.js';
import { getBranches, saveBranch, deleteBranch, getBranchById } from '../../controller/branch_controller.js';

let activeTab = 'overview';
let activeUser = null;

document.addEventListener('DOMContentLoaded', () => {
  initAdminDashboard();
});

/**
 * Initialize Dashboard & Security Guard
 */
export function initAdminDashboard() {
  if (!isLoggedIn()) {
    window.location.href = 'login.html?redirect=admin';
    return;
  }

  activeUser = getCurrentUser();

  // Security Role Guard: Only STAFF and ADMIN allowed
  if (!activeUser || (activeUser.role !== 'ADMIN' && activeUser.role !== 'STAFF')) {
    alert('Access Denied: You do not have administrative privileges.');
    window.location.href = '../../../../index.html';
    return;
  }

  updateUserInfoHeader();
  setupRoleBasedNavigation();
  switchAdminTab(activeTab);
}

/**
 * Render Header User Badge & Role Tag
 */
function updateUserInfoHeader() {
  const nameEl = document.getElementById('admin-user-name');
  const roleEl = document.getElementById('admin-user-role');
  const avatarEl = document.getElementById('admin-user-avatar');

  if (nameEl) nameEl.textContent = activeUser.name;
  if (roleEl) {
    roleEl.textContent = activeUser.role;
    if (activeUser.role === 'ADMIN') {
      roleEl.className = 'px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/40';
    } else {
      roleEl.className = 'px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-blue-500/20 text-blue-300 border border-blue-500/40';
    }
  }
  if (avatarEl) avatarEl.textContent = activeUser.name.charAt(0).toUpperCase();
}

/**
 * Configure Side Navbar items based on user role (Hide Admin-only tabs for Staff)
 */
function setupRoleBasedNavigation() {
  const adminOnlyNavItems = document.querySelectorAll('.admin-only-nav');
  adminOnlyNavItems.forEach(item => {
    if (activeUser.role !== 'ADMIN') {
      item.classList.add('hidden');
    } else {
      item.classList.remove('hidden');
    }
  });
}

/**
 * Tab Switching Handler
 */
export function switchAdminTab(tabName) {
  // Prevent Staff from accessing Admin-only tabs
  if (activeUser.role !== 'ADMIN' && ['branches', 'users', 'analytics'].includes(tabName)) {
    tabName = 'overview';
  }

  activeTab = tabName;

  // Update Nav items highlight
  const navBtns = document.querySelectorAll('.sidebar-nav-btn');
  navBtns.forEach(btn => {
    const target = btn.getAttribute('data-tab');
    if (target === tabName) {
      btn.className = 'sidebar-nav-btn w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30 transition-all';
    } else {
      btn.className = 'sidebar-nav-btn w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-sm text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all';
    }
  });

  // Hide all view panels
  const tabPanels = document.querySelectorAll('.dashboard-tab-panel');
  tabPanels.forEach(panel => panel.classList.add('hidden'));

  // Show active panel
  const activePanel = document.getElementById(`tab-panel-${tabName}`);
  if (activePanel) {
    activePanel.classList.remove('hidden');
  }

  // Render tab content
  if (tabName === 'overview') renderOverviewTab();
  else if (tabName === 'products') renderProductsTab();
  else if (tabName === 'orders') renderOrdersTab();
  else if (tabName === 'branches' && activeUser.role === 'ADMIN') renderBranchesTab();
  else if (tabName === 'users' && activeUser.role === 'ADMIN') renderUsersTab();
  else if (tabName === 'analytics' && activeUser.role === 'ADMIN') renderAnalyticsTab();
}

/**
 * ============================================================
 * TAB 1: OVERVIEW (Accessible to STAFF & ADMIN)
 * ============================================================
 */
function renderOverviewTab() {
  const container = document.getElementById('overview-content-container');
  if (!container) return;

  const orders = getAllOrders();
  const products = getStoredProducts();
  const users = getUsers();
  const branches = getBranches();

  // Metrics
  const totalRevenue = orders.reduce((sum, o) => sum + (parseFloat((o.totalAmount || "0").toString().replace(/[^0-9.]/g, '')) || 0), 0);
  const pendingOrders = orders.filter(o => o.status === 'Pending' || o.status === 'Processing').length;
  const lowStockProducts = products.filter(p => p.totalStock < 10);

  container.innerHTML = `
    <!-- Top Stats Counter Cards Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      
      <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex items-center justify-between">
        <div>
          <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Sales Revenue</span>
          <h3 class="text-2xl font-black text-white mt-1">Rs. ${totalRevenue.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</h3>
          <p class="text-[11px] text-emerald-400 font-bold mt-1 flex items-center">
            <svg class="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
            Live Store Analytics
          </p>
        </div>
        <div class="w-12 h-12 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        </div>
      </div>

      <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex items-center justify-between">
        <div>
          <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Orders To Process</span>
          <h3 class="text-2xl font-black text-amber-400 mt-1">${pendingOrders}</h3>
          <p class="text-[11px] text-slate-400 mt-1">${orders.length} Total Orders Recorded</p>
        </div>
        <div class="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
        </div>
      </div>

      <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex items-center justify-between">
        <div>
          <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Low Stock Items</span>
          <h3 class="text-2xl font-black text-rose-400 mt-1">${lowStockProducts.length}</h3>
          <p class="text-[11px] text-slate-400 mt-1">Stock &lt; 10 units across branches</p>
        </div>
        <div class="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
        </div>
      </div>

      <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex items-center justify-between">
        <div>
          <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Registered Accounts</span>
          <h3 class="text-2xl font-black text-indigo-400 mt-1">${users.length}</h3>
          <p class="text-[11px] text-slate-400 mt-1">${branches.length} Active Store Branches</p>
        </div>
        <div class="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
        </div>
      </div>

    </div>

    <!-- Overview Content Split: Recent Orders & Stock Alerts -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      <!-- Recent Orders Feed (2 cols) -->
      <div class="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-extrabold text-white flex items-center space-x-2">
            <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
            <span>Recent Incoming Orders</span>
          </h3>
          <button onclick="switchAdminTab('orders')" class="text-xs font-bold text-blue-400 hover:underline">View All Orders &rarr;</button>
        </div>

        <div class="space-y-3">
          ${orders.slice(0, 5).map(o => `
            <div class="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div class="flex items-center space-x-2">
                  <span class="text-xs font-mono font-bold text-blue-400">${o.orderId}</span>
                  <span class="text-[10px] text-slate-400">${o.date}</span>
                </div>
                <p class="text-xs font-semibold text-white mt-0.5">${o.customerName} (${o.city})</p>
                <p class="text-[11px] text-slate-400">Branch: <span class="text-slate-200 font-medium">${o.fulfillmentBranch || 'Colombo'}</span> | Distance: ${o.distanceKm || 5} km</p>
              </div>
              <div class="flex items-center justify-between sm:justify-end space-x-3">
                <span class="px-2.5 py-1 rounded-full text-[10px] font-extrabold ${getStatusStyle(o.status)}">
                  ${o.status || 'Pending'}
                </span>
                <span class="text-sm font-bold text-white">Rs. ${parseFloat((o.totalAmount||0).toString().replace(/[^0-9.]/g,'')).toLocaleString(undefined,{minimumFractionDigits:2, maximumFractionDigits:2})}</span>
              </div>
            </div>
          `).join('') || '<p class="text-xs text-slate-400 py-4">No recent orders.</p>'}
        </div>
      </div>

      <!-- Low Stock Alerts Sidebar (1 col) -->
      <div class="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h3 class="text-lg font-extrabold text-white flex items-center space-x-2">
          <svg class="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          <span>Branch Stock Warnings</span>
        </h3>
        <p class="text-xs text-slate-400">Products requiring replenishment at regional warehouses:</p>

        <div class="space-y-3 max-h-[360px] overflow-y-auto pr-1">
          ${lowStockProducts.map(p => `
            <div class="bg-slate-950 p-3.5 rounded-xl border border-rose-950/60 flex items-center space-x-3">
              <img src="${p.image}" class="w-10 h-10 object-cover rounded-lg bg-slate-900 flex-shrink-0">
              <div class="min-w-0 flex-1">
                <p class="text-xs font-bold text-white truncate">${p.name}</p>
                <div class="flex flex-wrap gap-1 mt-1">
                  ${Object.entries(p.branchStock || {}).map(([bId, qty]) => `
                    <span class="text-[9px] px-1.5 py-0.5 rounded font-mono ${qty < 3 ? 'bg-rose-500/20 text-rose-300 font-bold' : 'bg-slate-800 text-slate-300'}">
                      ${bId.replace('BR-','')}: ${qty}
                    </span>
                  `).join('')}
                </div>
              </div>
            </div>
          `).join('') || '<p class="text-xs text-emerald-400 py-4">All branch stocks healthy!</p>'}
        </div>
      </div>

    </div>
  `;
}

/**
 * ============================================================
 * TAB 2: PRODUCT MANAGEMENT (STAFF & ADMIN)
 * ============================================================
 */
function renderProductsTab() {
  const container = document.getElementById('products-content-container');
  if (!container) return;

  const products = getStoredProducts();
  const branches = getBranches();

  const isStaff = activeUser && activeUser.role === 'STAFF';
  const staffBranchId = isStaff ? (activeUser.assignedBranch || 'BR-GAL') : null;
  const staffBranchObj = staffBranchId ? branches.find(b => b.id === staffBranchId) : null;

  container.innerHTML = `
    <div class="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
      
      ${isStaff ? `
        <div class="p-3.5 bg-blue-950/60 border border-blue-500/40 rounded-2xl text-xs text-blue-200 flex items-center justify-between shadow-md">
          <div class="flex items-center space-x-2.5">
            <div class="w-7 h-7 rounded-lg bg-blue-600/30 text-blue-400 font-bold flex items-center justify-center flex-shrink-0">
              📍
            </div>
            <span>Logged in as Staff for <strong>${staffBranchObj ? staffBranchObj.name : 'Assigned Branch'}</strong>. You can view all catalog items, but stock edits are scoped to your assigned branch.</span>
          </div>
          <span class="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-300 font-mono text-[10px] font-extrabold uppercase flex-shrink-0">${staffBranchId} Hub</span>
        </div>
      ` : ''}

      <!-- Top Action Bar -->
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 class="text-xl font-extrabold text-white">Product Inventory Catalog</h3>
          <p class="text-xs text-slate-400 mt-0.5">Manage products and branch stock quantities across Colombo, Galle, Matara, and Kandy hubs.</p>
        </div>

        <div class="flex items-center space-x-3 w-full sm:w-auto">
          <input type="text" id="product-search-input" onkeyup="filterProductsTable()" placeholder="Search SKU or Product..." class="px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-blue-500 w-full sm:w-64">
          <button onclick="openProductFormPage()" class="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center space-x-1.5 flex-shrink-0">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            <span>Add Product</span>
          </button>
        </div>
      </div>

      <!-- Products Table -->
      <div class="overflow-x-auto rounded-2xl border border-slate-800">
        <table class="w-full text-left text-xs text-slate-300">
          <thead class="bg-slate-950 uppercase font-bold text-[10px] tracking-wider text-slate-400 border-b border-slate-800">
            <tr>
              <th class="py-3.5 px-4">Item</th>
              <th class="py-3.5 px-4">Category</th>
              <th class="py-3.5 px-4">Price</th>
              <th class="py-3.5 px-4">Branch Stock breakdown</th>
              <th class="py-3.5 px-4">Total Stock</th>
              <th class="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody id="products-tbody" class="divide-y divide-slate-800/80">
            ${products.map(p => `
              <tr class="hover:bg-slate-800/40 transition-colors">
                <td class="py-3 px-4">
                  <div class="flex items-center space-x-3">
                    <img src="${p.image}" class="w-10 h-10 object-cover rounded-lg bg-slate-950 border border-slate-800 flex-shrink-0">
                    <div>
                      <p class="font-bold text-white line-clamp-1">${p.name}</p>
                      <p class="text-[10px] text-blue-400 font-mono">${p.sku}</p>
                    </div>
                  </div>
                </td>
                <td class="py-3 px-4 uppercase text-[10px] font-bold text-slate-400">${p.category}</td>
                <td class="py-3 px-4 font-bold text-white">Rs. ${p.price.toLocaleString()}</td>
                <td class="py-3 px-4">
                  <div class="flex flex-wrap gap-1.5">
                    ${branches.map(b => {
                      const qty = (p.branchStock && p.branchStock[b.id]) || 0;
                      return `
                        <span class="px-2 py-0.5 rounded text-[10px] font-mono border ${qty > 0 ? 'bg-slate-950 text-slate-200 border-slate-800' : 'bg-rose-950/60 text-rose-300 border-rose-800/60'}">
                          <strong class="text-blue-400">${b.city}:</strong> ${qty}
                        </span>
                      `;
                    }).join('')}
                  </div>
                </td>
                <td class="py-3 px-4">
                  <span class="px-2.5 py-1 rounded-full text-[11px] font-bold ${p.totalStock > 0 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'}">
                    ${p.totalStock} units
                  </span>
                </td>
                <td class="py-3 px-4 text-right">
                  <div class="flex items-center justify-end space-x-2">
                    <button onclick="editProduct(${p.id})" class="p-1.5 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-lg transition-colors">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                    </button>
                    <button onclick="confirmDeleteProduct(${p.id})" class="p-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800 rounded-lg transition-colors">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

    </div>
  `;
}

/**
 * ============================================================
 * TAB 3: ORDER MANAGEMENT (STAFF & ADMIN)
 * ============================================================
 */
function renderOrdersTab() {
  const container = document.getElementById('orders-content-container');
  if (!container) return;

  const orders = getAllOrders();

  container.innerHTML = `
    <div class="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
      
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 class="text-xl font-extrabold text-white">Customer Order Fulfillment</h3>
          <p class="text-xs text-slate-400 mt-0.5">Process customer purchases, review delivery branch distances, and update shipping progress.</p>
        </div>
      </div>

      <div class="overflow-x-auto rounded-2xl border border-slate-800">
        <table class="w-full text-left text-xs text-slate-300">
          <thead class="bg-slate-950 uppercase font-bold text-[10px] tracking-wider text-slate-400 border-b border-slate-800">
            <tr>
              <th class="py-3.5 px-4">Order ID & Date</th>
              <th class="py-3.5 px-4">Customer</th>
              <th class="py-3.5 px-4">Dispatch Branch & Distance</th>
              <th class="py-3.5 px-4">Total Amount</th>
              <th class="py-3.5 px-4">Status</th>
              <th class="py-3.5 px-4 text-right">Update Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/80">
            ${orders.map(o => `
              <tr class="hover:bg-slate-800/40 transition-colors">
                <td class="py-3.5 px-4">
                  <span class="font-mono font-extrabold text-blue-400">${o.orderId}</span>
                  <p class="text-[10px] text-slate-400">${o.date}</p>
                </td>
                <td class="py-3.5 px-4">
                  <p class="font-bold text-white">${o.customerName}</p>
                  <p class="text-[10px] text-slate-400">${o.email}</p>
                </td>
                <td class="py-3.5 px-4">
                  <p class="font-bold text-slate-200">${o.fulfillmentBranch || 'Colombo Hub'}</p>
                  <p class="text-[10px] text-slate-400">Dest: <strong class="text-white">${o.city}</strong> (${o.distanceKm || 5} km distance)</p>
                </td>
                <td class="py-3.5 px-4 font-bold text-white">
                  Rs. ${parseFloat((o.totalAmount||0).toString().replace(/[^0-9.]/g,'')).toLocaleString(undefined,{minimumFractionDigits:2, maximumFractionDigits:2})}
                </td>
                <td class="py-3.5 px-4">
                  <span class="px-2.5 py-1 rounded-full text-[10px] font-extrabold ${getStatusStyle(o.status)}">
                    ${o.status || 'Pending'}
                  </span>
                </td>
                <td class="py-3.5 px-4 text-right">
                  <div class="flex items-center justify-end space-x-2">
                    <select onchange="changeOrderStatus('${o.orderId}', this.value)" class="bg-slate-950 border border-slate-700 text-white rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:border-blue-500">
                      <option value="Pending" ${o.status === 'Pending' ? 'selected' : ''}>Pending</option>
                      <option value="Processing" ${o.status === 'Processing' ? 'selected' : ''}>Processing</option>
                      <option value="Shipped" ${o.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
                      <option value="Delivered" ${o.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                      <option value="Cancelled" ${o.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>
                  </div>
                </td>
              </tr>
            `).join('') || '<tr><td colspan="6" class="py-8 text-center text-xs text-slate-400">No orders recorded yet.</td></tr>'}
          </tbody>
        </table>
      </div>

    </div>
  `;
}

/**
 * ============================================================
 * TAB 4: BRANCH MANAGEMENT (ADMIN ONLY)
 * ============================================================
 */
function renderBranchesTab() {
  const container = document.getElementById('branches-content-container');
  if (!container) return;

  const branches = getBranches();

  container.innerHTML = `
    <div class="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
      
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 class="text-xl font-extrabold text-white">Store Branch Management</h3>
          <p class="text-xs text-slate-400 mt-0.5">Manage regional warehouses, base shipping rates, and distance parameters.</p>
        </div>
        <button onclick="openBranchModal()" class="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center space-x-1.5">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          <span>Add New Branch</span>
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        ${branches.map(b => `
          <div class="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4 hover:border-slate-700 transition-colors">
            <div class="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span class="text-[10px] font-mono text-blue-400 uppercase tracking-widest font-bold">${b.id}</span>
                <h4 class="text-base font-extrabold text-white">${b.name}</h4>
                <p class="text-xs text-slate-400">${b.city} Region</p>
              </div>
              <span class="px-2.5 py-1 rounded-full text-[10px] font-bold ${b.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'}">
                ${b.status}
              </span>
            </div>

            <div class="space-y-1.5 text-xs text-slate-300">
              <p>📍 <strong class="text-slate-400">Address:</strong> ${b.address}</p>
              <p>📞 <strong class="text-slate-400">Phone:</strong> ${b.phone}</p>
              <p>🚚 <strong class="text-slate-400">Base Shipping:</strong> Rs. ${b.baseShippingFee} + Rs. ${b.perKmFee}/km</p>
            </div>

            <div class="pt-2 border-t border-slate-800 flex items-center justify-end space-x-2">
              <button onclick="editBranch('${b.id}')" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-lg text-xs font-bold transition-colors">Edit Branch</button>
              <button onclick="confirmDeleteBranch('${b.id}')" class="px-3 py-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800 rounded-lg text-xs font-bold transition-colors">Delete</button>
            </div>
          </div>
        `).join('')}
      </div>

    </div>
  `;
}

/**
 * ============================================================
 * TAB 5: USER MANAGEMENT (ADMIN ONLY)
 * ============================================================
 */
function renderUsersTab() {
  const container = document.getElementById('users-content-container');
  if (!container) return;

  const users = getUsers();
  const branches = getBranches();

  container.innerHTML = `
    <div class="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
      
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 class="text-xl font-extrabold text-white">System User Directory & Roles</h3>
          <p class="text-xs text-slate-400 mt-0.5">Assign worker roles (STAFF / ADMIN), create staff accounts, and manage system access.</p>
        </div>
        <button onclick="openUserModal()" class="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center space-x-1.5">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/></svg>
          <span>Create Admin / Staff</span>
        </button>
      </div>

      <div class="overflow-x-auto rounded-2xl border border-slate-800">
        <table class="w-full text-left text-xs text-slate-300">
          <thead class="bg-slate-950 uppercase font-bold text-[10px] tracking-wider text-slate-400 border-b border-slate-800">
            <tr>
              <th class="py-3.5 px-4">User ID & Name</th>
              <th class="py-3.5 px-4">Email</th>
              <th class="py-3.5 px-4">Current Role</th>
              <th class="py-3.5 px-4">Assigned Branch</th>
              <th class="py-3.5 px-4">Joined Date</th>
              <th class="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/80">
            ${users.map(u => `
              <tr class="hover:bg-slate-800/40 transition-colors">
                <td class="py-3.5 px-4">
                  <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 font-bold text-xs flex items-center justify-center border border-blue-500/30">
                      ${u.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p class="font-bold text-white">${u.name}</p>
                      <p class="text-[10px] text-slate-500 font-mono">${u.id}</p>
                    </div>
                  </div>
                </td>
                <td class="py-3.5 px-4 font-mono text-slate-300">${u.email}</td>
                <td class="py-3.5 px-4">
                  <span class="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${u.role === 'ADMIN' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' : u.role === 'STAFF' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40' : 'bg-slate-800 text-slate-300'}">
                    ${u.role || 'CUSTOMER'}
                  </span>
                </td>
                <td class="py-3.5 px-4">
                  ${u.assignedBranch ? branches.find(b => b.id === u.assignedBranch)?.name || u.assignedBranch : '<span class="text-slate-500">-</span>'}
                </td>
                <td class="py-3.5 px-4 text-slate-400">${u.createdAt || 'Standard'}</td>
                <td class="py-3.5 px-4 text-right">
                  <div class="flex items-center justify-end space-x-2">
                    <button onclick="openUserModal('${u.id}')" class="p-1.5 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-lg transition-colors" title="Edit User Details">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                    </button>
                    <select onchange="changeUserRole('${u.id}', this.value)" class="bg-slate-950 border border-slate-700 text-white rounded-lg px-2 py-1 text-xs font-semibold focus:outline-none focus:border-blue-500">
                      <option value="CUSTOMER" ${u.role === 'CUSTOMER' ? 'selected' : ''}>CUSTOMER</option>
                      <option value="STAFF" ${u.role === 'STAFF' ? 'selected' : ''}>STAFF</option>
                      <option value="ADMIN" ${u.role === 'ADMIN' ? 'selected' : ''}>ADMIN</option>
                    </select>
                    <button onclick="confirmDeleteUser('${u.id}')" class="p-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800 rounded-lg transition-colors" title="Delete User">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

    </div>
  `;
}

/**
 * ============================================================
 * TAB 6: FINANCIAL ANALYTICS & REPORTS (ADMIN ONLY)
 * ============================================================
 */
function renderAnalyticsTab() {
  const container = document.getElementById('analytics-content-container');
  if (!container) return;

  const orders = getAllOrders();
  const branches = getBranches();

  // Branch Revenue Calculations
  const branchSales = branches.map(b => {
    const branchOrders = orders.filter(o => o.fulfillmentBranchId === b.id || o.fulfillmentBranch === b.name);
    const revenue = branchOrders.reduce((sum, o) => sum + (parseFloat((o.totalAmount || "0").toString().replace(/[^0-9.]/g, '')) || 0), 0);
    return { name: b.name, city: b.city, count: branchOrders.length, revenue };
  });

  const maxRevenue = Math.max(...branchSales.map(bs => bs.revenue), 1000);

  container.innerHTML = `
    <div class="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
      
      <div>
        <h3 class="text-xl font-extrabold text-white">Regional Sales & Performance Analytics</h3>
        <p class="text-xs text-slate-400 mt-0.5">Comprehensive revenue metrics and branch sales comparison.</p>
      </div>

      <!-- Branch Sales Performance Meters -->
      <div class="space-y-4 pt-2">
        <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Branch Sales Breakdown</h4>

        <div class="space-y-4">
          ${branchSales.map(bs => {
            const percentage = Math.round((bs.revenue / maxRevenue) * 100);
            return `
              <div class="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div class="flex items-center justify-between text-xs">
                  <span class="font-bold text-white">${bs.name} (${bs.city})</span>
                  <span class="font-mono text-blue-400 font-extrabold">Rs. ${bs.revenue.toLocaleString()} (${bs.count} orders)</span>
                </div>
                <div class="w-full h-3 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                  <div class="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full transition-all duration-500" style="width: ${percentage}%"></div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

    </div>
  `;
}

// ── Status Pill Styles ──
function getStatusStyle(status) {
  switch (status) {
    case 'Processing': return 'bg-blue-500/20 text-blue-400 border border-blue-500/40';
    case 'Shipped': return 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/40';
    case 'Delivered': return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40';
    case 'Cancelled': return 'bg-rose-500/20 text-rose-400 border border-rose-500/40';
    default: return 'bg-amber-500/20 text-amber-400 border border-amber-500/40';
  }
}

// ── Global Helper Handlers ──
window.switchAdminTab = switchAdminTab;

window.changeOrderStatus = function(orderId, newStatus) {
  const res = updateOrderStatus(orderId, newStatus);
  if (res.success) {
    if (activeTab === 'overview') renderOverviewTab();
    else if (activeTab === 'orders') renderOrdersTab();
  }
};

window.changeUserRole = function(userId, newRole) {
  const res = updateUserRole(userId, newRole);
  if (res.success) {
    renderUsersTab();
  } else {
    alert(res.message);
  }
};

window.confirmDeleteUser = function(userId) {
  if (confirm('Are you sure you want to delete this user?')) {
    const res = deleteUser(userId);
    if (res.success) {
      renderUsersTab();
    } else {
      alert(res.message);
    }
  }
};

window.confirmDeleteProduct = function(productId) {
  if (confirm('Are you sure you want to delete this product from inventory?')) {
    deleteProduct(productId);
    renderProductsTab();
  }
};

window.confirmDeleteBranch = function(branchId) {
  if (confirm('Are you sure you want to delete this store branch?')) {
    deleteBranch(branchId);
    renderBranchesTab();
  }
};

// ── Dedicated Product Add/Edit Workspace Page ──
window.openProductFormPage = function(productId = null) {
  const product = productId ? getProductById(productId) : null;
  const branches = getBranches();

  const isStaff = activeUser && activeUser.role === 'STAFF';
  const staffBranchId = isStaff ? (activeUser.assignedBranch || 'BR-GAL') : null;
  const staffBranchObj = staffBranchId ? branches.find(b => b.id === staffBranchId) : null;

  // Multi-image array state (Max 5 images)
  let imagesArr = product && Array.isArray(product.images) && product.images.length > 0
    ? [...product.images]
    : (product && product.image ? [product.image] : ['']);

  if (imagesArr.length > 5) imagesArr = imagesArr.slice(0, 5);
  window.formImagesState = imagesArr;

  // Specs state array
  let specsState = [];
  if (product && product.specs) {
    specsState = Object.entries(product.specs).map(([k, v]) => ({ key: k, value: String(v) }));
  } else {
    specsState = [
      { key: 'Category', value: product ? product.category : 'laptops' },
      { key: 'Warranty', value: product ? (product.warranty || '2-Year Warranty') : '2-Year Warranty' }
    ];
  }
  window.formSpecsState = specsState;

  // Features state array
  let featuresState = product && Array.isArray(product.features) && product.features.length > 0
    ? [...product.features]
    : ['High Performance Tech Hardware'];
  window.formFeaturesState = featuresState;

  const container = document.getElementById('product-form-content-container');
  if (!container) return;

  container.innerHTML = `
    <div class="space-y-6 max-w-7xl mx-auto pb-12">
      <!-- Top Action Navigation Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div class="flex items-center space-x-4">
          <button onclick="switchAdminTab('products')" class="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700/80 flex items-center space-x-2 text-xs font-bold">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
            <span>Back to Product Catalog</span>
          </button>
          <div>
            <h2 class="text-xl font-extrabold text-white">${product ? `Edit Product: ${product.name}` : 'Add New Hardware Product'}</h2>
            <p class="text-xs text-slate-400 mt-0.5">${product ? `SKU: ${product.sku} | ID: #${product.id}` : 'Fill in specifications, multi-image gallery (max 5), pricing, and branch stock.'}</p>
          </div>
        </div>

        <div class="flex items-center space-x-3">
          <button type="button" onclick="switchAdminTab('products')" class="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs">Cancel</button>
          <button type="button" onclick="triggerProductFormSubmit()" class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-blue-600/30 flex items-center space-x-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            <span>${product ? 'Update & Save Product' : 'Publish Product'}</span>
          </button>
        </div>
      </div>

      ${isStaff ? `
        <div class="p-4 bg-blue-950/60 border border-blue-500/40 rounded-2xl text-xs text-blue-200 flex items-center space-x-3 shadow-md">
          <span class="text-blue-400 font-bold text-base">ℹ️</span>
          <span>Staff Scope Active: You are editing inventory stock for <strong>${staffBranchObj ? staffBranchObj.city : 'your branch'} (${staffBranchId})</strong>. Quantities for other branch hubs are locked.</span>
        </div>
      ` : ''}

      <!-- Main 2-Column Layout Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <!-- Left 8 Columns: Main Edit Form -->
        <div class="lg:col-span-8 space-y-6">
          <form id="full-product-form" onsubmit="handleSaveProductSubmit(event, ${product ? product.id : 'null'})" class="space-y-6">
            
            <!-- Section 1: Basic Information -->
            <div class="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <h3 class="text-sm font-extrabold text-white uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center space-x-2">
                <span class="w-2 h-2 rounded-full bg-blue-500"></span>
                <span>1. Basic Product Information</span>
              </h3>

              <div class="space-y-4 text-xs">
                <div>
                  <label class="block text-slate-300 font-bold mb-1.5">Product Title *</label>
                  <input type="text" id="form-p-name" required value="${product ? product.name : ''}" oninput="updateLivePreview()" placeholder="e.g. Zenith Studio Ultra Laptop 16" class="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500 text-sm font-medium">
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-slate-300 font-bold mb-1.5">Category *</label>
                    <select id="form-p-category" required onchange="updateLivePreview()" class="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500 text-xs font-semibold">
                      <option value="laptops" ${product && product.category === 'laptops' ? 'selected' : ''}>Laptops & Notebooks</option>
                      <option value="peripherals" ${product && product.category === 'peripherals' ? 'selected' : ''}>Gaming Peripherals</option>
                      <option value="monitors" ${product && product.category === 'monitors' ? 'selected' : ''}>Displays & Monitors</option>
                      <option value="components" ${product && product.category === 'components' ? 'selected' : ''}>PC Components (GPUs/RAM)</option>
                      <option value="accessories" ${product && product.category === 'accessories' ? 'selected' : ''}>Accessories & Tech</option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-slate-300 font-bold mb-1.5">Badge Tag</label>
                    <select id="form-p-badge" onchange="updateLivePreview()" class="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500 text-xs font-semibold">
                      <option value="New Arrival" ${product && product.badge === 'New Arrival' ? 'selected' : ''}>New Arrival</option>
                      <option value="Bestseller" ${product && product.badge === 'Bestseller' ? 'selected' : ''}>Bestseller</option>
                      <option value="Hot Deal" ${product && product.badge === 'Hot Deal' ? 'selected' : ''}>Hot Deal</option>
                      <option value="Top Rated" ${product && product.badge === 'Top Rated' ? 'selected' : ''}>Top Rated</option>
                      <option value="Popular" ${product && product.badge === 'Popular' ? 'selected' : ''}>Popular</option>
                      <option value="" ${!product || !product.badge ? 'selected' : ''}>None</option>
                    </select>
                  </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-slate-300 font-bold mb-1.5">SKU / Model Code</label>
                    <input type="text" id="form-p-sku" value="${product && product.sku ? product.sku : ''}" oninput="updateLivePreview()" placeholder="ETC-LAP-4090" class="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500 font-mono text-xs">
                  </div>
                  <div>
                    <label class="block text-slate-300 font-bold mb-1.5">Warranty Period</label>
                    <input type="text" id="form-p-warranty" value="${product && product.warranty ? product.warranty : '2-Year Official Warranty'}" oninput="updateLivePreview()" placeholder="2-Year Official Warranty" class="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500 text-xs">
                  </div>
                </div>
              </div>
            </div>

            <!-- Section 2: Pricing & Discount -->
            <div class="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <h3 class="text-sm font-extrabold text-white uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center space-x-2">
                <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>2. Pricing & Discounts</span>
              </h3>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label class="block text-slate-300 font-bold mb-1.5">Selling Price (Rs.) *</label>
                  <input type="number" step="0.01" id="form-p-price" required value="${product ? product.price : ''}" oninput="updateLivePreview()" placeholder="2499.00" class="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-extrabold text-base focus:outline-none focus:border-blue-500">
                </div>
                <div>
                  <label class="block text-slate-300 font-bold mb-1.5">Original List Price (Rs.) <span class="text-slate-400 font-normal">(For discount strikethrough)</span></label>
                  <input type="number" step="0.01" id="form-p-original-price" value="${product && product.originalPrice ? product.originalPrice : ''}" oninput="updateLivePreview()" placeholder="2799.00" class="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 font-semibold text-base focus:outline-none focus:border-blue-500">
                </div>
              </div>
            </div>

            <!-- Section 3: Multi-Image Gallery Manager (Up to 5 Images) -->
            <div class="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div class="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 class="text-sm font-extrabold text-white uppercase tracking-wider flex items-center space-x-2">
                  <span class="w-2 h-2 rounded-full bg-purple-500"></span>
                  <span>3. Multi-Image Gallery Manager (Max 5 Images)</span>
                </h3>
                <span id="gallery-count-badge" class="px-2.5 py-0.5 rounded-full bg-slate-800 text-blue-400 text-[10px] font-mono font-bold">${imagesArr.length} / 5 Images</span>
              </div>

              <p class="text-xs text-slate-400">Add up to 5 image web URLs for this product gallery. The first image serves as the primary card cover thumbnail.</p>

              <div id="image-inputs-container" class="space-y-3">
                <!-- Dynamically populated image input rows -->
              </div>

              <div class="pt-2 flex items-center justify-between">
                <button type="button" id="add-img-btn" onclick="addGalleryImageInput()" class="px-4 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 hover:text-blue-300 font-bold text-xs border border-blue-500/40 transition-colors flex items-center space-x-1.5">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                  <span>+ Add Image URL</span>
                </button>
                <span class="text-[11px] text-slate-500">Supports Unsplash, CDN & direct HTTPS image links.</span>
              </div>
            </div>

            <!-- Section 4: Descriptions -->
            <div class="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <h3 class="text-sm font-extrabold text-white uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center space-x-2">
                <span class="w-2 h-2 rounded-full bg-amber-500"></span>
                <span>4. Product Descriptions & Overview</span>
              </h3>

              <div class="space-y-4 text-xs">
                <div>
                  <label class="block text-slate-300 font-bold mb-1.5">Short Card Description Snippet</label>
                  <input type="text" id="form-p-description" value="${product && product.description ? product.description : ''}" oninput="updateLivePreview()" placeholder="Lightweight CNC aluminum chassis with Liquid Retina XDR display..." class="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500">
                </div>

                <div>
                  <label class="block text-slate-300 font-bold mb-1.5">Full Detailed Overview Paragraph</label>
                  <textarea id="form-p-full-description" rows="3" oninput="updateLivePreview()" placeholder="Full comprehensive summary paragraph shown on the Product Specification page..." class="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500">${product && product.fullDescription ? product.fullDescription : ''}</textarea>
                </div>
              </div>
            </div>

            <!-- Section 5: Tech Specs & Features -->
            <div class="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <h3 class="text-sm font-extrabold text-white uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center space-x-2">
                <span class="w-2 h-2 rounded-full bg-indigo-500"></span>
                <span>5. Specifications & Highlights</span>
              </h3>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                <!-- Technical Specs List Builder -->
                <div class="space-y-3">
                  <div class="flex items-center justify-between">
                    <label class="block text-slate-300 font-bold">Technical Specs (Key-Value)</label>
                    <button type="button" onclick="addFormSpecInput()" class="px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 font-bold text-xs border border-blue-500/40 transition-colors flex items-center space-x-1 shadow-sm">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                      <span>+ Add Spec</span>
                    </button>
                  </div>

                  <div id="specs-inputs-container" class="space-y-2.5">
                    <!-- Dynamic spec rows -->
                  </div>
                </div>

                <!-- Highlight Features List Builder -->
                <div class="space-y-3">
                  <div class="flex items-center justify-between">
                    <label class="block text-slate-300 font-bold">Highlight Features (Bullets)</label>
                    <button type="button" onclick="addFormFeatureInput()" class="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 font-bold text-xs border border-indigo-500/40 transition-colors flex items-center space-x-1 shadow-sm">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                      <span>+ Add Feature</span>
                    </button>
                  </div>

                  <div id="features-inputs-container" class="space-y-2.5">
                    <!-- Dynamic feature rows -->
                  </div>
                </div>
              </div>
            </div>

            <!-- Section 6: Branch Stock Allocations -->
            <div class="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <h3 class="text-sm font-extrabold text-white uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center space-x-2">
                <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>6. Branch Warehouse Inventory Allocation</span>
              </h3>

              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                ${branches.map(b => {
                  const qty = product && product.branchStock ? (product.branchStock[b.id] || 0) : (b.id === staffBranchId ? 10 : 0);
                  const isEditable = !isStaff || (b.id === staffBranchId);

                  return `
                    <div>
                      <label class="block text-[11px] font-bold mb-1 ${isEditable ? 'text-slate-200' : 'text-slate-500'}">
                        ${b.city} (${b.id})
                      </label>
                      <input type="number" min="0" id="form-stock-${b.id}" value="${qty}" ${isEditable ? '' : 'disabled'} oninput="updateLivePreview()" class="w-full px-3 py-2 rounded-xl text-xs ${isEditable ? 'bg-slate-950 border border-blue-500/80 text-white focus:outline-none focus:border-blue-500 font-bold' : 'bg-slate-950 border border-slate-800 text-slate-500 cursor-not-allowed'}">
                    </div>
                  `;
                }).join('')}
              </div>
            </div>

            <!-- Bottom Action Footer -->
            <div class="flex items-center justify-end space-x-4 pt-4">
              <button type="button" onclick="switchAdminTab('products')" class="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs">Cancel</button>
              <button type="submit" class="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-sm shadow-xl shadow-blue-600/40">
                ${product ? 'Save & Publish Changes' : 'Create Product'}
              </button>
            </div>
          </form>
        </div>

        <!-- Right 4 Columns: Live Product Card Preview -->
        <div class="lg:col-span-4">
          <div class="sticky top-6 bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
            <div class="flex items-center justify-between border-b border-slate-800 pb-3">
              <span class="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center space-x-1.5">
                <span>👁️</span>
                <span>Live Catalog Preview</span>
              </span>
              <span class="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-mono font-bold">REAL-TIME</span>
            </div>

            <!-- Live Card Display -->
            <div id="live-product-preview-card"></div>
          </div>
        </div>

      </div>
    </div>
  `;

  // Render initial multi-image, specs, and features inputs
  renderFormImageInputs();
  renderFormSpecsInputs();
  renderFormFeaturesInputs();

  // Switch to product form tab
  switchAdminTab('product-form');

  // Initial preview update
  setTimeout(() => updateLivePreview(), 50);
};

window.renderFormImageInputs = function() {
  const container = document.getElementById('image-inputs-container');
  const countBadge = document.getElementById('gallery-count-badge');
  const addBtn = document.getElementById('add-img-btn');
  if (!container) return;

  const images = window.formImagesState || [''];
  if (countBadge) countBadge.textContent = `${images.length} / 5 Images`;
  if (addBtn) addBtn.disabled = images.length >= 5;

  container.innerHTML = images.map((url, idx) => `
    <div class="flex items-center space-x-3 p-2.5 rounded-2xl bg-slate-950 border border-slate-800/80">
      <div class="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden flex-shrink-0 relative">
        <img src="${url || 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=300&q=80'}" class="w-full h-full object-cover" onerror="this.src='https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=300&q=80'">
        ${idx === 0 ? `<span class="absolute bottom-0 inset-x-0 bg-blue-600 text-white text-[8px] font-black uppercase text-center py-0.5">MAIN</span>` : ''}
      </div>

      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between mb-1">
          <span class="text-[10px] font-bold ${idx === 0 ? 'text-blue-400' : 'text-slate-400'} uppercase">Image ${idx + 1} ${idx === 0 ? '(Primary Cover)' : ''}</span>
        </div>
        <input type="url" value="${url}" oninput="window.formImagesState[${idx}] = this.value; updateLivePreview();" placeholder="https://..." class="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500 font-mono">
      </div>

      ${images.length > 1 ? `
        <button type="button" onclick="removeGalleryImageInput(${idx})" class="p-2 rounded-lg bg-rose-950/40 text-rose-400 hover:bg-rose-900/60 transition-colors flex-shrink-0" title="Delete Image">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
        </button>
      ` : ''}
    </div>
  `).join('');
};

window.addGalleryImageInput = function() {
  if (!window.formImagesState) window.formImagesState = [''];
  if (window.formImagesState.length < 5) {
    window.formImagesState.push('');
    renderFormImageInputs();
    updateLivePreview();
  }
};

window.removeGalleryImageInput = function(idx) {
  if (window.formImagesState && window.formImagesState.length > 1) {
    window.formImagesState.splice(idx, 1);
    renderFormImageInputs();
    updateLivePreview();
  }
};

// ── Dynamic Specs List Manager ──
window.renderFormSpecsInputs = function() {
  const container = document.getElementById('specs-inputs-container');
  if (!container) return;

  const specs = window.formSpecsState || [];
  if (specs.length === 0) {
    container.innerHTML = `<p class="text-[11px] text-slate-500 italic py-2">No specs added yet. Click "+ Add Spec" above.</p>`;
    return;
  }

  container.innerHTML = specs.map((s, idx) => `
    <div class="flex items-center space-x-2">
      <input type="text" value="${s.key || ''}" oninput="window.formSpecsState[${idx}].key = this.value; updateLivePreview();" placeholder="Key (e.g. GPU)" class="w-5/12 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500 font-medium">
      <input type="text" value="${s.value || ''}" oninput="window.formSpecsState[${idx}].value = this.value; updateLivePreview();" placeholder="Value (e.g. RTX 4090)" class="w-7/12 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500 font-medium">
      <button type="button" onclick="removeFormSpecInput(${idx})" class="p-2 rounded-xl bg-rose-950/40 text-rose-400 hover:bg-rose-900/60 transition-colors flex-shrink-0" title="Delete Spec">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
      </button>
    </div>
  `).join('');
};

window.addFormSpecInput = function() {
  if (!window.formSpecsState) window.formSpecsState = [];
  window.formSpecsState.push({ key: '', value: '' });
  renderFormSpecsInputs();
  updateLivePreview();
};

window.removeFormSpecInput = function(idx) {
  if (window.formSpecsState && window.formSpecsState.length > 0) {
    window.formSpecsState.splice(idx, 1);
    renderFormSpecsInputs();
    updateLivePreview();
  }
};

// ── Dynamic Features List Manager ──
window.renderFormFeaturesInputs = function() {
  const container = document.getElementById('features-inputs-container');
  if (!container) return;

  const features = window.formFeaturesState || [];
  if (features.length === 0) {
    container.innerHTML = `<p class="text-[11px] text-slate-500 italic py-2">No highlight features added yet. Click "+ Add Feature" above.</p>`;
    return;
  }

  container.innerHTML = features.map((f, idx) => `
    <div class="flex items-center space-x-2">
      <input type="text" value="${f || ''}" oninput="window.formFeaturesState[${idx}] = this.value; updateLivePreview();" placeholder="Feature bullet (e.g. 240Hz Mini-LED)" class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500 font-medium">
      <button type="button" onclick="removeFormFeatureInput(${idx})" class="p-2 rounded-xl bg-rose-950/40 text-rose-400 hover:bg-rose-900/60 transition-colors flex-shrink-0" title="Delete Feature">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
      </button>
    </div>
  `).join('');
};

window.addFormFeatureInput = function() {
  if (!window.formFeaturesState) window.formFeaturesState = [];
  window.formFeaturesState.push('');
  renderFormFeaturesInputs();
  updateLivePreview();
};

window.removeFormFeatureInput = function(idx) {
  if (window.formFeaturesState && window.formFeaturesState.length > 0) {
    window.formFeaturesState.splice(idx, 1);
    renderFormFeaturesInputs();
    updateLivePreview();
  }
};

window.triggerProductFormSubmit = function() {
  const form = document.getElementById('full-product-form');
  if (form) form.requestSubmit();
};

window.updateLivePreview = function() {
  const previewContainer = document.getElementById('live-product-preview-card');
  if (!previewContainer) return;

  const name = document.getElementById('form-p-name')?.value || 'Product Title Placeholder';
  const category = document.getElementById('form-p-category')?.value || 'laptops';
  const badge = document.getElementById('form-p-badge')?.value || '';
  const price = parseFloat(document.getElementById('form-p-price')?.value || '0');
  const origPrice = parseFloat(document.getElementById('form-p-original-price')?.value || '0');
  const sku = document.getElementById('form-p-sku')?.value || 'ETC-GEN-1001';
  const warranty = document.getElementById('form-p-warranty')?.value || '1-Year Warranty';
  const desc = document.getElementById('form-p-description')?.value || 'Short product summary description snippet...';

  const images = window.formImagesState && window.formImagesState.filter(u => u && u.trim() !== '').length > 0
    ? window.formImagesState.filter(u => u && u.trim() !== '')
    : ['https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80'];

  const mainImage = images[0];

  previewContainer.innerHTML = `
    <div class="rounded-2xl bg-gradient-to-b from-slate-800/90 to-slate-950 border border-slate-700/80 p-4 space-y-3.5 shadow-xl">
      <div class="relative w-full h-48 rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
        <img id="preview-main-img" src="${mainImage}" class="w-full h-full object-cover">
        
        ${badge ? `
          <div class="absolute top-2.5 left-2.5">
            <span class="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[9px] font-black uppercase tracking-wider shadow-md">
              ${badge}
            </span>
          </div>
        ` : ''}

        <div class="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-slate-900/90 text-blue-300 text-[9px] font-bold border border-slate-700">
          ${images.length} Image${images.length > 1 ? 's' : ''}
        </div>
      </div>

      <!-- Preview Image Thumbnails -->
      ${images.length > 1 ? `
        <div class="flex items-center space-x-2 overflow-x-auto pb-1">
          ${images.map((img, i) => `
            <img src="${img}" onclick="document.getElementById('preview-main-img').src='${img}'" class="w-9 h-9 rounded-lg object-cover bg-slate-950 border border-slate-700 cursor-pointer hover:border-blue-500 transition-colors flex-shrink-0">
          `).join('')}
        </div>
      ` : ''}

      <div class="space-y-1 text-xs">
        <div class="flex items-center justify-between">
          <span class="text-[10px] font-bold text-blue-400 uppercase tracking-widest">${category}</span>
          <span class="text-[10px] text-slate-500 font-mono">${sku}</span>
        </div>

        <h4 class="font-extrabold text-white text-sm line-clamp-1">${name}</h4>
        <p class="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">${desc}</p>
      </div>

      <div class="flex items-center justify-between pt-2 border-t border-slate-800">
        <div>
          ${origPrice > price ? `<span class="text-[10px] text-slate-400 line-through mr-1.5">Rs. ${origPrice.toLocaleString()}</span>` : ''}
          <span class="text-base font-black text-white">Rs. ${price.toLocaleString()}</span>
        </div>
        <span class="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
          ${warranty}
        </span>
      </div>
    </div>
  `;
};

window.editProduct = function(productId) {
  window.openProductFormPage(productId);
};

window.openProductModal = function(productId = null) {
  window.openProductFormPage(productId);
};

window.handleSaveProductSubmit = function(e, productId) {
  e.preventDefault();
  const branches = getBranches();
  const existingProduct = productId ? getProductById(productId) : null;
  const branchStock = existingProduct && existingProduct.branchStock ? { ...existingProduct.branchStock } : {};

  const isStaff = activeUser && activeUser.role === 'STAFF';
  const staffBranchId = isStaff ? (activeUser.assignedBranch || 'BR-GAL') : null;

  branches.forEach(b => {
    const input = document.getElementById(`form-stock-${b.id}`);
    if (input && (!isStaff || b.id === staffBranchId)) {
      branchStock[b.id] = parseInt(input.value || 0) || 0;
    } else if (branchStock[b.id] === undefined) {
      branchStock[b.id] = 0;
    }
  });

  // Filter gallery images array (max 5)
  const images = window.formImagesState && window.formImagesState.filter(u => u && typeof u === 'string' && u.trim() !== '').length > 0
    ? window.formImagesState.filter(u => u && typeof u === 'string' && u.trim() !== '').slice(0, 5)
    : ["https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80"];

  // Convert specsState array into key-value object
  const specsObj = {};
  if (window.formSpecsState && Array.isArray(window.formSpecsState)) {
    window.formSpecsState.forEach(s => {
      if (s && s.key && s.value && s.key.trim() !== '') {
        specsObj[s.key.trim()] = s.value.trim();
      }
    });
  }

  // Convert featuresState array into string array
  const featuresArr = window.formFeaturesState && Array.isArray(window.formFeaturesState)
    ? window.formFeaturesState.map(f => typeof f === 'string' ? f.trim() : '').filter(f => f.length > 0)
    : ["High Performance Tech Hardware"];

  const categoryVal = document.getElementById('form-p-category').value;
  const priceVal = parseFloat(document.getElementById('form-p-price').value);
  const origPriceVal = document.getElementById('form-p-original-price').value ? parseFloat(document.getElementById('form-p-original-price').value) : priceVal;

  const productData = {
    id: productId,
    name: document.getElementById('form-p-name').value,
    category: categoryVal,
    price: priceVal,
    originalPrice: origPriceVal,
    sku: document.getElementById('form-p-sku').value || `ETC-${categoryVal.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
    warranty: document.getElementById('form-p-warranty').value || '1-Year Warranty',
    image: images[0],
    images: images,
    badge: document.getElementById('form-p-badge') ? document.getElementById('form-p-badge').value : (existingProduct ? existingProduct.badge : ''),
    description: document.getElementById('form-p-description').value || '',
    fullDescription: document.getElementById('form-p-full-description').value || document.getElementById('form-p-description').value || '',
    specs: Object.keys(specsObj).length > 0 ? specsObj : { "Category": categoryVal },
    features: featuresArr.length > 0 ? featuresArr : ["High Performance Hardware"],
    branchStock: branchStock
  };

  saveProduct(productData);
  window.dispatchEvent(new CustomEvent('productsUpdated'));
  switchAdminTab('products');
  renderProductsTab();
};

window.openUserModal = function(userId = null) {
  const modal = document.getElementById('admin-modal-container');
  const branches = getBranches();
  const users = getUsers();
  const targetUser = userId ? users.find(u => u.id === userId) : null;

  modal.innerHTML = `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl">
        <div class="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 class="text-lg font-extrabold text-white">${targetUser ? 'Edit User Account' : 'Create Staff / Admin Account'}</h3>
            ${targetUser ? `<span class="text-[10px] text-blue-400 font-mono">${targetUser.id}</span>` : ''}
          </div>
          <button onclick="closeAdminModal()" class="text-slate-400 hover:text-white">&times;</button>
        </div>

        <form onsubmit="handleSaveUserSubmit(event, ${targetUser ? `'${targetUser.id}'` : 'null'})" class="space-y-4 text-xs">
          <div>
            <label class="block text-slate-300 font-bold mb-1">Full Name *</label>
            <input type="text" id="modal-u-name" required value="${targetUser ? targetUser.name : ''}" placeholder="Jane Smith" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500">
          </div>

          <div>
            <label class="block text-slate-300 font-bold mb-1">Email Address *</label>
            <input type="email" id="modal-u-email" required value="${targetUser ? targetUser.email : ''}" placeholder="staff@etech.com" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500">
          </div>

          <div>
            <label class="block text-slate-300 font-bold mb-1">${targetUser ? 'New Password (Optional)' : 'Password *'}</label>
            <input type="password" id="modal-u-password" ${targetUser ? '' : 'required'} placeholder="${targetUser ? 'Leave blank to keep current password' : '••••••••'}" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500">
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-slate-300 font-bold mb-1">System Role *</label>
              <select id="modal-u-role" required class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500">
                <option value="CUSTOMER" ${targetUser && targetUser.role === 'CUSTOMER' ? 'selected' : ''}>CUSTOMER</option>
                <option value="STAFF" ${targetUser && targetUser.role === 'STAFF' ? 'selected' : ''}>STAFF</option>
                <option value="ADMIN" ${targetUser && targetUser.role === 'ADMIN' ? 'selected' : ''}>ADMIN</option>
              </select>
            </div>
            <div>
              <label class="block text-slate-300 font-bold mb-1">Assigned Branch</label>
              <select id="modal-u-branch" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500">
                <option value="">None</option>
                ${branches.map(b => `<option value="${b.id}" ${targetUser && targetUser.assignedBranch === b.id ? 'selected' : ''}>${b.city}</option>`).join('')}
              </select>
            </div>
          </div>

          <div class="pt-2 flex items-center justify-end space-x-3">
            <button type="button" onclick="closeAdminModal()" class="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold">Cancel</button>
            <button type="submit" class="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-600/30">${targetUser ? 'Save User Changes' : 'Create Account'}</button>
          </div>
        </form>
      </div>
    </div>
  `;
};

window.handleSaveUserSubmit = function(e, userId) {
  e.preventDefault();
  const userData = {
    id: userId,
    name: document.getElementById('modal-u-name').value,
    email: document.getElementById('modal-u-email').value,
    password: document.getElementById('modal-u-password').value,
    role: document.getElementById('modal-u-role').value,
    assignedBranch: document.getElementById('modal-u-branch').value
  };

  const res = userId ? updateUser(userData) : addUserByAdmin(userData);
  if (res.success) {
    closeAdminModal();
    renderUsersTab();
  } else {
    alert(res.message);
  }
};

window.openBranchModal = function(branchId = null) {
  const modal = document.getElementById('admin-modal-container');
  const branch = branchId ? getBranchById(branchId) : null;

  modal.innerHTML = `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl">
        <div class="flex items-center justify-between border-b border-slate-800 pb-4">
          <h3 class="text-lg font-extrabold text-white">${branch ? 'Edit Store Branch' : 'Add Store Branch'}</h3>
          <button onclick="closeAdminModal()" class="text-slate-400 hover:text-white">&times;</button>
        </div>

        <form onsubmit="handleSaveBranchSubmit(event, ${branch ? `'${branch.id}'` : 'null'})" class="space-y-4 text-xs">
          <div>
            <label class="block text-slate-300 font-bold mb-1">Branch Name *</label>
            <input type="text" id="modal-b-name" required value="${branch ? branch.name : ''}" placeholder="Galle Tech Center" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500">
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-slate-300 font-bold mb-1">City / Region *</label>
              <input type="text" id="modal-b-city" required value="${branch ? branch.city : ''}" placeholder="Galle" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500">
            </div>
            <div>
              <label class="block text-slate-300 font-bold mb-1">Phone Number</label>
              <input type="text" id="modal-b-phone" value="${branch ? branch.phone : ''}" placeholder="+94 91..." class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500">
            </div>
          </div>

          <div>
            <label class="block text-slate-300 font-bold mb-1">Address</label>
            <input type="text" id="modal-b-address" value="${branch ? branch.address : ''}" placeholder="Main Street, Galle Fort" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500">
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-slate-300 font-bold mb-1">Base Shipping Fee (Rs.)</label>
              <input type="number" id="modal-b-basefee" value="${branch ? branch.baseShippingFee : 300}" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500">
            </div>
            <div>
              <label class="block text-slate-300 font-bold mb-1">Per KM Rate (Rs.)</label>
              <input type="number" id="modal-b-kmfee" value="${branch ? branch.perKmFee : 25}" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500">
            </div>
          </div>

          <div class="pt-2 flex items-center justify-end space-x-3">
            <button type="button" onclick="closeAdminModal()" class="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold">Cancel</button>
            <button type="submit" class="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-600/30">Save Branch</button>
          </div>
        </form>
      </div>
    </div>
  `;
};

window.editBranch = function(branchId) {
  window.openBranchModal(branchId);
};

window.handleSaveBranchSubmit = function(e, branchId) {
  e.preventDefault();
  const branchData = {
    id: branchId,
    name: document.getElementById('modal-b-name').value,
    city: document.getElementById('modal-b-city').value,
    phone: document.getElementById('modal-b-phone').value,
    address: document.getElementById('modal-b-address').value,
    baseShippingFee: document.getElementById('modal-b-basefee').value,
    perKmFee: document.getElementById('modal-b-kmfee').value,
    status: 'Active'
  };

  saveBranch(branchData);
  closeAdminModal();
  renderBranchesTab();
};

window.closeAdminModal = function() {
  const modal = document.getElementById('admin-modal-container');
  if (modal) modal.innerHTML = '';
};

window.handleAdminLogout = function() {
  logoutUser();
  window.location.href = '../../../../index.html';
};
