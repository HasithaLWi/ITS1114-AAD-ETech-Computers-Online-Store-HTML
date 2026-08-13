// ETech Computers - Administrator & Staff Management Dashboard Controller
import { getCurrentUser, isLoggedIn, logoutUser, getUsers } from './login_controller.js';
import { getBranches } from './branch_controller.js';
import { getAllOrders } from './order_management_controller.js';
import { getStoredProducts } from '../models/data.js';

// Controller Imports for Tabs
import { renderProductsTab } from './product_management_controller.js';
import { renderOrdersTab } from './order_management_controller.js';
import { renderBranchesTab } from './branch_management_controller.js';
import { renderUsersTab } from './user_management_controller.js';
import { renderAnalyticsTab } from './analytics_and_report_controller.js';

let activeTab = 'overview';
let activeUser = null;

// Initialize on DOMContentLoaded only if we are on the administrator dashboard page
document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.includes('administrator_dashboard.html')) {
    initAdminDashboard();
  }
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
    window.location.href = '../../../index.html';
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
      roleEl.className = 'px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-blue-500/10 text-blue-300 border border-blue-500/30';
    } else {
      roleEl.className = 'px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-cyan-500/10 text-cyan-300 border border-cyan-500/30';
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
      btn.className = 'sidebar-nav-btn w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-md font-bold text-xs bg-blue-600 text-white shadow-sm transition-all';
    } else {
      btn.className = 'sidebar-nav-btn w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-md font-medium text-xs text-[#a7b3c4] hover:text-white hover:bg-[#141c28] transition-all';
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

  // Update Overview Stats Counters
  const totalRevenueEl = document.getElementById('overview-total-revenue');
  if (totalRevenueEl) {
    totalRevenueEl.textContent = `Rs. ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  const pendingOrdersEl = document.getElementById('overview-pending-orders');
  if (pendingOrdersEl) {
    pendingOrdersEl.textContent = pendingOrders;
  }

  const totalOrdersEl = document.getElementById('overview-total-orders');
  if (totalOrdersEl) {
    totalOrdersEl.textContent = `${orders.length} Total Orders Recorded`;
  }

  const lowStockCountEl = document.getElementById('overview-low-stock-count');
  if (lowStockCountEl) {
    lowStockCountEl.textContent = lowStockProducts.length;
  }

  const registeredUsersEl = document.getElementById('overview-registered-users');
  if (registeredUsersEl) {
    registeredUsersEl.textContent = users.length;
  }

  const activeBranchesEl = document.getElementById('overview-active-branches');
  if (activeBranchesEl) {
    activeBranchesEl.textContent = `${branches.length} Active Store Branches`;
  }

  // Populate Recent Incoming Orders Feed
  const recentOrdersFeed = document.getElementById('recent-orders-feed');
  if (recentOrdersFeed) {
    recentOrdersFeed.innerHTML = orders.slice(0, 5).map(o => `
            <div class="bg-[#080b12] border border-[#202b3a] rounded-md p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div>
                <div class="flex items-center space-x-2">
                  <span class="text-xs font-mono font-bold text-blue-400">${o.orderId}</span>
                  <span class="text-[10px] text-[#718096]">${o.date}</span>
                </div>
                <p class="text-xs font-semibold text-white mt-0.5">${o.customerName} (${o.city})</p>
                <p class="text-[10px] text-[#718096]">Branch: <span class="text-[#f4f7fb] font-medium">${o.fulfillmentBranch || 'Colombo'}</span> | Dist: ${o.distanceKm || 5} km</p>
              </div>
              <div class="flex items-center justify-between sm:justify-end space-x-3">
                <span class="px-2 py-0.5 rounded text-[9px] font-bold ${getStatusStyle(o.status)}">
                  ${o.status || 'Pending'}
                </span>
                <span class="text-sm font-extrabold text-white font-mono">Rs. ${parseFloat((o.totalAmount || 0).toString().replace(/[^0-9.]/g, '')).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
        `).join('') || '<p class="text-xs text-[#718096] py-3">No recent orders.</p>';
  }

  // Populate Low Stock Alerts Warning Sidebar
  const lowStocksAlerts = document.getElementById('low-stocks-alerts');
  if (lowStocksAlerts) {
    lowStocksAlerts.innerHTML = lowStockProducts.map(p => `
            <div class="bg-[#080b12] p-3 rounded-md border border-rose-950/60 flex items-center space-x-2.5">
              <img src="${p.image}" class="w-9 h-9 object-cover rounded bg-[#101722] flex-shrink-0">
              <div class="min-w-0 flex-1">
                <p class="text-xs font-bold text-white truncate">${p.name}</p>
                <div class="flex flex-wrap gap-1 mt-0.5">
                  ${Object.entries(p.branchStock || {}).map(([bId, qty]) => `
                    <span class="text-[9px] px-1 py-0.5 rounded font-mono ${qty < 3 ? 'bg-rose-500/20 text-rose-300 font-bold' : 'bg-[#141c28] text-[#a7b3c4]'}">
                      ${bId.replace('BR-', '')}: ${qty}
                    </span>
                  `).join('')}
                </div>
              </div>
            </div>
        `).join('') || '<p class="text-xs text-emerald-400 py-3">All branch stocks healthy!</p>';
  }
}

// ── Status Pill Styles Helper ──
function getStatusStyle(status) {
  switch (status) {
    case 'Processing': return 'bg-blue-500/10 text-blue-400 border border-blue-500/30';
    case 'Shipped': return 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30';
    case 'Delivered': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30';
    case 'Cancelled': return 'bg-rose-500/10 text-rose-400 border border-rose-500/30';
    default: return 'bg-amber-500/10 text-amber-400 border border-amber-500/30';
  }
}

export function closeAdminModal() {
  const modal = document.getElementById('admin-modal-container');
  if (modal) modal.innerHTML = '';
}

export function handleAdminLogout() {
  logoutUser();
  window.location.href = '../../../index.html';
}

export function filterProductsTable() {
  const query = (document.getElementById('product-search-input')?.value || '').toLowerCase().trim();
  const rows = document.querySelectorAll('#products-tbody tr');
  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    if (text.includes(query)) {
      row.removeAttribute('style');
    } else {
      row.style.display = 'none';
    }
  });
}
