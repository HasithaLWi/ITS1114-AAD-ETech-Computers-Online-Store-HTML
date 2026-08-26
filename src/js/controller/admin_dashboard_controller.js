// ETech Computers - Administrator & Staff Management Dashboard Controller
import { getCurrentUser, isLoggedIn, logoutUser } from './login_controller.js';
import { UserApi } from '../api/userApi.js';
import { getBranches } from './branch_controller.js';
import { getAllOrders } from './order_management_controller.js';
import { getStoredProducts } from '../models/data.js';

// Controller Imports for Tabs
import { renderProductsTab } from './product_management_controller.js';
import { renderOrdersTab } from './order_management_controller.js';
import { renderBranchesTab } from './branch_management_controller.js';
import { renderUsersTab } from './user_management_controller.js';
import { renderAnalyticsTab } from './analytics_and_report_controller.js';
import { getStockHealthReport, renderStockHealthTab, navigateToStockHealthWithSearch } from './stock_health_controller.js';
import { renderTaxonomyTab } from './taxonomy_controller.js';
import { renderPoliciesTab } from './policy_management_controller.js';
import { renderPromotionsTab } from './promotion_management_controller.js';
import { renderTransfersTab } from './transfer_management_controller.js';
import { renderBrandsTab } from './brand_management_controller.js';

let activeTab = 'overview';
let activeUser = null;
let sidebarListenersInitialized = false;

/**
 * Initialize Dashboard & Security Guard
 */
export function initAdminDashboard() {
  if (!isLoggedIn()) {
    window.location.hash = '#login?redirect=admin';
    return;
  }

  activeUser = getCurrentUser();

  // Security Role Guard: Only STAFF, ADMIN, and SUPERADMIN allowed
  if (!activeUser || (!activeUser.isAdmin() && !activeUser.isStaff())) {
    alert('Access Denied: You do not have administrative privileges.');
    window.location.hash = '#home';
    return;
  }

  updateUserInfoHeader();
  setupRoleBasedNavigation();
  setupSidebarEventListeners();
  switchAdminTab(activeTab);
}

/**
 * Setup Global Sidebar Event Listeners (Outside Click, ESC Key, Window Resize)
 */
function setupSidebarEventListeners() {
  if (sidebarListenersInitialized) return;
  sidebarListenersInitialized = true;

  // Click outside sidebar to close when expanded on mobile
  document.addEventListener('click', (e) => {
    const sidebar = document.getElementById('admin-sidebar');
    const toggleBtn = document.getElementById('admin-sidebar-toggle');
    if (!sidebar || !sidebar.classList.contains('sidebar-force-expanded')) return;

    if (!sidebar.contains(e.target) && (!toggleBtn || !toggleBtn.contains(e.target))) {
      closeAdminSidebar();
    }
  });

  // ESC key to close sidebar on mobile
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAdminSidebar();
    }
  });

  // Clean up mobile expanded state when resized to desktop (>= 1024px)
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 1024) {
      closeAdminSidebar();
    }
  });
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
    if (activeUser.isSuperAdmin()) {
      roleEl.className = 'px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-purple-50 text-purple-700 border border-purple-200';
    } else if (activeUser.isAdmin()) {
      roleEl.className = 'px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-blue-50 text-blue-700 border border-blue-200';
    } else {
      roleEl.className = 'px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-sky-50 text-sky-700 border border-sky-200';
    }
  }
  if (avatarEl) {
    avatarEl.textContent = activeUser.getInitial();
    if (activeUser.isSuperAdmin()) {
      avatarEl.className = 'w-8 h-8 rounded-md bg-purple-600 text-white font-extrabold text-xs flex items-center justify-center shadow-sm';
    } else {
      avatarEl.className = 'w-8 h-8 rounded-md bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shadow-sm';
    }
  }
}

/**
 * Configure Side Navbar items based on user role (Hide Admin-only tabs for Staff)
 */
function setupRoleBasedNavigation() {
  const isSuperOrAdmin = activeUser && activeUser.isAdmin();
  const adminOnlyNavItems = document.querySelectorAll('.admin-only-nav');
  adminOnlyNavItems.forEach(item => {
    if (!isSuperOrAdmin) {
      item.classList.add('hidden');
    } else {
      item.classList.remove('hidden');
    }
  });
}

/**
 * Tab Switching Handler
 */
export function switchAdminTab(tabName, param = null) {
  const isSuperOrAdmin = activeUser && activeUser.isAdmin();

  // Prevent Staff from accessing Admin-only tabs
  if (!isSuperOrAdmin && ['branches', 'users', 'analytics', 'policies'].includes(tabName)) {
    tabName = 'overview';
  }

  activeTab = tabName;

  // Auto-close sidebar on mobile/tablet or when expanded
  closeAdminSidebar();

  // Update Nav items highlight
  const navBtns = document.querySelectorAll('.sidebar-nav-btn');
  navBtns.forEach(btn => {
    const target = btn.getAttribute('data-tab');
    if (target === tabName) {
      btn.classList.add('bg-blue-600', 'text-white', 'shadow-sm', 'font-bold');
      btn.classList.remove('text-[#475569]', 'hover:text-[#0f172a]', 'hover:bg-[#f1f5f9]', 'font-medium');
    } else {
      btn.classList.remove('bg-blue-600', 'text-white', 'shadow-sm', 'font-bold');
      btn.classList.add('text-[#475569]', 'hover:text-[#0f172a]', 'hover:bg-[#f1f5f9]', 'font-medium');
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
  else if (tabName === 'promotions') renderPromotionsTab();
  else if (tabName === 'orders') renderOrdersTab();
  else if (tabName === 'stock-health') renderStockHealthTab(param);
  else if (tabName === 'transfers') renderTransfersTab();
  else if (tabName === 'taxonomy') renderTaxonomyTab();
  else if (tabName === 'brands') renderBrandsTab();
  else if (tabName === 'branches' && isSuperOrAdmin) renderBranchesTab();
  else if (tabName === 'users' && isSuperOrAdmin) renderUsersTab();
  else if (tabName === 'analytics' && isSuperOrAdmin) renderAnalyticsTab();
  else if (tabName === 'policies' && isSuperOrAdmin) renderPoliciesTab();
}

/**
 * Open Admin Sidebar on Mobile/Tablet
 */
export function openAdminSidebar() {
  const sidebar = document.getElementById('admin-sidebar');
  const backdrop = document.getElementById('admin-sidebar-backdrop');
  if (!sidebar) return;

  const isDesktop = window.innerWidth >= 1024;
  if (isDesktop) {
    sidebar.classList.remove('sidebar-force-collapsed');
  } else {
    sidebar.classList.add('sidebar-force-expanded');
    sidebar.classList.remove('sidebar-force-collapsed');
    if (backdrop) {
      backdrop.classList.remove('hidden');
      requestAnimationFrame(() => {
        backdrop.classList.remove('opacity-0');
        backdrop.classList.add('opacity-100');
      });
    }
  }
}

/**
 * Close Admin Sidebar on Mobile/Tablet or Collapsed mode
 */
export function closeAdminSidebar() {
  const sidebar = document.getElementById('admin-sidebar');
  const backdrop = document.getElementById('admin-sidebar-backdrop');
  if (!sidebar) return;

  sidebar.classList.remove('sidebar-force-expanded');
  if (backdrop) {
    backdrop.classList.remove('opacity-100');
    backdrop.classList.add('opacity-0');
    setTimeout(() => {
      if (!sidebar.classList.contains('sidebar-force-expanded')) {
        backdrop.classList.add('hidden');
      }
    }, 200);
  }
}

/**
 * Toggle Admin Sidebar between Collapsed & Expanded states
 */
export function toggleAdminSidebar() {
  const sidebar = document.getElementById('admin-sidebar');
  if (!sidebar) return;

  const isDesktop = window.innerWidth >= 1024;
  if (isDesktop) {
    sidebar.classList.toggle('sidebar-force-collapsed');
    sidebar.classList.remove('sidebar-force-expanded');
    const backdrop = document.getElementById('admin-sidebar-backdrop');
    if (backdrop) backdrop.classList.add('hidden');
  } else {
    const isExpanded = sidebar.classList.contains('sidebar-force-expanded');
    if (isExpanded) {
      closeAdminSidebar();
    } else {
      openAdminSidebar();
    }
  }
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
  const branches = getBranches();
  const healthReport = getStockHealthReport();

  // Metrics
  const totalRevenue = orders.reduce((sum, o) => sum + (parseFloat((o.totalAmount || "0").toString().replace(/[^0-9.]/g, '')) || 0), 0);
  const pendingOrders = orders.filter(o => o.status === 'Pending' || o.status === 'Processing').length;

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
    lowStockCountEl.textContent = healthReport.totalActiveAlerts;
  }

  const lowStockSubtitleEl = document.getElementById('overview-low-stock-subtitle');
  if (lowStockSubtitleEl) {
    lowStockSubtitleEl.textContent = `${healthReport.totalDepletedUnits} Depleted, ${healthReport.totalLowUnits} Low Stock`;
  }

  const registeredUsersEl = document.getElementById('overview-registered-users');
  if (registeredUsersEl && (activeUser.role === 'SUPERADMIN' || activeUser.role === 'ADMIN')) {
    UserApi.getUsers().then(users => {
      if (registeredUsersEl && users) {
        registeredUsersEl.textContent = users.length;
      }
    }).catch(() => {
      if (registeredUsersEl) registeredUsersEl.textContent = '-';
    });
  }

  const activeBranchesEl = document.getElementById('overview-active-branches');
  if (activeBranchesEl) {
    activeBranchesEl.textContent = `${branches.length} Active Store Branches`;
  }

  // Populate Recent Incoming Orders Feed
  const recentOrdersFeed = document.getElementById('recent-orders-feed');
  if (recentOrdersFeed) {
    recentOrdersFeed.innerHTML = orders.slice(0, 5).map(o => `
            <div class="bg-[#f8fafc] border border-[#e2e8f0] rounded-md p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-xs">
              <div>
                <div class="flex items-center space-x-2">
                  <span class="text-xs font-mono font-bold text-blue-600">${o.orderId}</span>
                  <span class="text-[10px] text-[#64748b]">${o.date}</span>
                </div>
                <p class="text-xs font-semibold text-[#0f172a] mt-0.5">${o.customerName} (${o.city})</p>
                <p class="text-[10px] text-[#64748b]">Branch: <span class="text-[#0f172a] font-medium">${o.fulfillmentBranch || 'Colombo'}</span> | Dist: ${o.distanceKm || 5} km</p>
              </div>
              <div class="flex items-center justify-between sm:justify-end space-x-3">
                <span class="px-2 py-0.5 rounded text-[9px] font-bold ${getStatusStyle(o.status)}">
                  ${o.status || 'Pending'}
                </span>
                <span class="text-sm font-extrabold text-[#0f172a] font-mono">Rs. ${parseFloat((o.totalAmount || 0).toString().replace(/[^0-9.]/g, '')).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
        `).join('') || '<p class="text-xs text-[#64748b] py-3">No recent orders.</p>';
  }

  // Populate Low Stock Alerts Warning Sidebar (Branch-Aware with Click-to-Search-Filter)
  const lowStocksAlerts = document.getElementById('low-stocks-alerts');
  if (lowStocksAlerts) {
    if (healthReport.alertItems.length === 0) {
      lowStocksAlerts.innerHTML = `
        <div class="p-4 bg-[#f8fafc] rounded-md border border-emerald-200 text-center space-y-1">
          <span class="text-emerald-700 font-bold text-xs">✓ Optimal Inventory</span>
          <p class="text-[10px] text-[#64748b]">All regional warehouse stock levels are healthy.</p>
        </div>
      `;
    } else {
      lowStocksAlerts.innerHTML = healthReport.alertItems.map(item => {
        const p = item.product;
        const safeSearchQuery = (p.name || '').replace(/'/g, "\\'");
        return `
          <div onclick="navigateToStockHealthWithSearch('${safeSearchQuery}')"
            class="bg-[#f8fafc] hover:bg-white p-3 rounded-md border ${item.worstStage === 'DEPLETED' ? 'border-rose-200 hover:border-rose-300 bg-rose-50/50' : 'border-amber-200 hover:border-amber-300 bg-amber-50/50'} space-y-2 cursor-pointer transition-all group shadow-xs"
            title="Click to view & filter ${p.name} in Stock Health Center">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2 min-w-0">
                <img src="${p.image}" class="w-8 h-8 object-cover rounded bg-white flex-shrink-0 border border-[#e2e8f0]">
                <div class="min-w-0 flex-1">
                  <p class="text-xs font-bold text-[#0f172a] group-hover:text-blue-600 transition-colors truncate max-w-[150px]">${p.name}</p>
                  <span class="text-[9px] text-[#64748b] font-mono">${p.sku}</span>
                </div>
              </div>
              <button onclick="event.stopPropagation(); openQuickRestockModal(${p.id})"
                class="px-2 py-1 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white rounded text-[10px] font-bold border border-blue-200 transition-all flex-shrink-0">
                Restock
              </button>
            </div>

            <!-- Branch Stock Badges -->
            <div class="flex flex-wrap gap-1 pt-1 border-t border-[#e2e8f0]">
              ${Object.entries(p.branchStock || {}).map(([bId, qty]) => {
          const isOut = parseInt(qty) === 0;
          const isLow = parseInt(qty) > 0 && parseInt(qty) <= item.margin;
          let badgeClass = 'bg-white text-[#475569] border border-[#e2e8f0]';
          if (isOut) badgeClass = 'bg-rose-50 text-rose-700 font-bold border border-rose-200';
          else if (isLow) badgeClass = 'bg-amber-50 text-amber-700 font-bold border border-amber-200';
          return `
                  <span class="text-[9px] px-1.5 py-0.5 rounded font-mono ${badgeClass}">
                    ${bId.replace('BR-', '')}: ${qty}
                  </span>
                `;
        }).join('')}
            </div>
          </div>
        `;
      }).join('');
    }
  }
}

// ── Status Pill Styles Helper ──
function getStatusStyle(status) {
  switch (status) {
    case 'Processing': return 'bg-blue-50 text-blue-700 border border-blue-200';
    case 'Shipped': return 'bg-sky-50 text-sky-700 border border-sky-200';
    case 'Delivered': return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    case 'Cancelled': return 'bg-rose-50 text-rose-700 border border-rose-200';
    default: return 'bg-amber-50 text-amber-700 border border-amber-200';
  }
}

export function closeAdminModal() {
  const modal = document.getElementById('admin-modal-container');
  if (modal) modal.innerHTML = '';
}

export function handleAdminLogout() {
  logoutUser();
  window.location.hash = '#home';
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
