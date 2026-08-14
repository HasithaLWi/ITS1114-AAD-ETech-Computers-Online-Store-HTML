// ============================================================
//  stock_health_controller.js — Stock Health & Alert Center Controller
// ============================================================
import { getStoredProducts, saveStoredProducts, updateProductStockSettings, quickAdjustStock, transferBranchStock } from '../models/data.js';
import { getBranches } from './branch_controller.js';
import { showToast } from './cart_controller.js';

/**
 * Calculates comprehensive inventory health metrics across all branch warehouses
 */
export function getStockHealthReport() {
  const products = getStoredProducts();
  const branches = getBranches();

  // Branch Stats Map
  const branchStats = {};
  branches.forEach(b => {
    branchStats[b.id] = {
      id: b.id,
      name: b.name,
      city: b.city,
      totalSKUs: 0,
      healthyCount: 0,
      lowCount: 0,
      depletedCount: 0,
      status: 'Healthy'
    };
  });

  const alertItems = [];
  let totalActiveAlerts = 0;
  let totalDepletedUnits = 0;
  let totalLowUnits = 0;

  products.forEach(product => {
    const isAlertEnabled = product.alertEnabled !== false;
    const margin = parseInt(product.lowStockMargin) || 5;
    const branchStock = product.branchStock || {};

    let worstStage = 'HEALTHY'; // HEALTHY -> LOW -> DEPLETED
    const branchDetails = [];

    branches.forEach(branch => {
      const qty = parseInt(branchStock[branch.id] !== undefined ? branchStock[branch.id] : 0);
      const bStat = branchStats[branch.id];

      if (bStat) {
        bStat.totalSKUs++;
        if (qty === 0) {
          bStat.depletedCount++;
          if (isAlertEnabled) worstStage = 'DEPLETED';
        } else if (qty <= margin) {
          bStat.lowCount++;
          if (worstStage !== 'DEPLETED' && isAlertEnabled) worstStage = 'LOW';
        } else {
          bStat.healthyCount++;
        }
      }

      branchDetails.push({
        branchId: branch.id,
        branchName: branch.name,
        city: branch.city,
        qty: qty,
        isDepleted: qty === 0,
        isLow: qty > 0 && qty <= margin,
        isHealthy: qty > margin
      });
    });

    const hasIssue = branchDetails.some(b => b.isDepleted || b.isLow);

    if (hasIssue && isAlertEnabled) {
      totalActiveAlerts++;
      const depletedBranches = branchDetails.filter(b => b.isDepleted);
      const lowBranches = branchDetails.filter(b => b.isLow);

      totalDepletedUnits += depletedBranches.length;
      totalLowUnits += lowBranches.length;

      alertItems.push({
        product,
        worstStage,
        margin,
        depletedBranches,
        lowBranches,
        branchDetails
      });
    }
  });

  // Determine each branch's overall health status
  Object.values(branchStats).forEach(bs => {
    if (bs.depletedCount > 0) {
      bs.status = 'Critical';
      bs.statusClass = 'bg-rose-500/15 text-rose-400 border border-rose-500/30';
    } else if (bs.lowCount > 0) {
      bs.status = 'Warning';
      bs.statusClass = 'bg-amber-500/15 text-amber-400 border border-amber-500/30';
    } else {
      bs.status = 'Healthy';
      bs.statusClass = 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30';
    }
  });

  return {
    products,
    branches,
    branchStats,
    alertItems,
    totalActiveAlerts,
    totalDepletedUnits,
    totalLowUnits
  };
}

/**
 * Renders the Stock Health & Inventory Alert Center tab view
 */
export function renderStockHealthTab(initialSearchQuery = '') {
  const container = document.getElementById('tab-panel-stock-health');
  if (!container) return;

  const report = getStockHealthReport();
  const { products, branches, branchStats, totalActiveAlerts, totalDepletedUnits, totalLowUnits } = report;

  container.innerHTML = `
    <div class="space-y-6">

      <!-- Header & Quick Metrics Overview -->
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#101722] border border-[#202b3a] rounded-lg p-5 shadow-lg">
        <div>
          <div class="flex items-center space-x-2.5">
            <h3 class="text-lg font-extrabold text-white flex items-center space-x-2">
              <span class="w-2.5 h-2.5 rounded-full ${totalDepletedUnits > 0 ? 'bg-rose-500 animate-pulse' : (totalLowUnits > 0 ? 'bg-amber-400' : 'bg-emerald-400')}"></span>
              <span>Stock Health & Inventory Alert Center</span>
            </h3>
            <span class="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold ${totalActiveAlerts > 0 ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'}">
              ${totalActiveAlerts} Active Alert${totalActiveAlerts === 1 ? '' : 's'}
            </span>
          </div>
          <p class="text-xs text-[#718096] mt-1">
            Real-time warehouse inventory health, per-item alert monitoring toggles, custom margin thresholds, and instant stock adjustments.
          </p>
        </div>

        <div class="flex items-center space-x-3 flex-shrink-0">
          <button onclick="renderStockHealthTab()" class="px-3 py-2 bg-[#141c28] hover:bg-[#192332] text-[#a7b3c4] hover:text-white rounded-md text-xs font-bold border border-[#202b3a] transition-all flex items-center space-x-1.5">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh Health</span>
          </button>
        </div>
      </div>

      <!-- 4 Regional Branch Warehouse Status Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        ${branches.map(b => {
          const bs = branchStats[b.id] || { totalSKUs: 0, depletedCount: 0, lowCount: 0, status: 'Healthy', statusClass: 'bg-emerald-500/15 text-emerald-400' };
          return `
            <div class="bg-[#101722] border border-[#202b3a] rounded-lg p-4 shadow-md space-y-3 relative overflow-hidden">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2">
                  <span class="text-blue-400 text-sm">📍</span>
                  <span class="text-xs font-bold text-white">${b.name}</span>
                </div>
                <span class="px-2 py-0.5 rounded text-[9px] font-bold ${bs.statusClass}">${bs.status}</span>
              </div>
              
              <div class="grid grid-cols-3 gap-2 pt-1 border-t border-[#202b3a] text-center font-mono">
                <div class="bg-[#080b12] p-2 rounded border border-[#202b3a]">
                  <span class="text-[9px] text-[#718096] block uppercase">SKUs</span>
                  <span class="text-xs font-extrabold text-white">${bs.totalSKUs}</span>
                </div>
                <div class="bg-[#080b12] p-2 rounded border ${bs.depletedCount > 0 ? 'border-rose-500/40 bg-rose-950/20' : 'border-[#202b3a]'}">
                  <span class="text-[9px] text-[#718096] block uppercase">Depleted</span>
                  <span class="text-xs font-extrabold ${bs.depletedCount > 0 ? 'text-rose-400' : 'text-[#718096]'}">${bs.depletedCount}</span>
                </div>
                <div class="bg-[#080b12] p-2 rounded border ${bs.lowCount > 0 ? 'border-amber-500/40 bg-amber-950/20' : 'border-[#202b3a]'}">
                  <span class="text-[9px] text-[#718096] block uppercase">Low</span>
                  <span class="text-xs font-extrabold ${bs.lowCount > 0 ? 'text-amber-400' : 'text-[#718096]'}">${bs.lowCount}</span>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- Main Interactive Stock Health Table Container -->
      <div id="stock-health-table-section" class="bg-[#101722] border border-[#202b3a] rounded-lg p-5 shadow-lg space-y-5">
        
        <!-- Filter and Search Toolbar -->
        <div class="flex flex-col md:flex-row items-center justify-between gap-4">
          <div class="w-full md:w-80">
            <div class="relative">
              <input type="text" id="stock-health-search" oninput="filterStockHealthTable()"
                value="${(initialSearchQuery || '').replace(/"/g, '&quot;')}"
                placeholder="Search Product or SKU..."
                class="w-full pl-9 pr-8 py-2 rounded-md bg-[#080b12] border border-[#202b3a] text-white text-xs placeholder-[#718096] focus:border-blue-500 transition-colors">
              <svg class="w-4 h-4 text-[#718096] absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <button id="clear-stock-search-btn" onclick="clearStockSearch()"
                class="${initialSearchQuery ? '' : 'hidden'} absolute right-2.5 top-2 text-[#718096] hover:text-white text-xs" title="Clear filter">✕</button>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <!-- Filter by Branch -->
            <select id="stock-filter-branch" onchange="filterStockHealthTable()"
              class="px-3 py-2 rounded-md bg-[#080b12] border border-[#202b3a] text-white text-xs focus:border-blue-500">
              <option value="ALL">All Branches</option>
              ${branches.map(b => `<option value="${b.id}">${b.name} (${b.city})</option>`).join('')}
            </select>

            <!-- Filter by Alert Severity Stage -->
            <select id="stock-filter-stage" onchange="filterStockHealthTable()"
              class="px-3 py-2 rounded-md bg-[#080b12] border border-[#202b3a] text-white text-xs focus:border-blue-500">
              <option value="ALL">All Alert Stages</option>
              <option value="CRITICAL">🔴 Critical / Out of Stock (0 units)</option>
              <option value="LOW">🟡 Low Stock Warning</option>
              <option value="HEALTHY">🟢 Optimal / Healthy</option>
              <option value="ALERTS_ONLY">⚠️ Active Alerts Only</option>
            </select>

            <!-- Filter by Monitoring State -->
            <select id="stock-filter-monitoring" onchange="filterStockHealthTable()"
              class="px-3 py-2 rounded-md bg-[#080b12] border border-[#202b3a] text-white text-xs focus:border-blue-500">
              <option value="ALL">All Monitoring States</option>
              <option value="ENABLED">Alert Monitoring ON</option>
              <option value="MUTED">Alert Monitoring OFF</option>
            </select>
          </div>
        </div>

        <!-- Table Matrix View -->
        <div class="overflow-x-auto rounded-md border border-[#202b3a]">
          <table class="w-full text-left text-xs text-[#a7b3c4]">
            <thead class="bg-[#080b12] uppercase font-bold text-[10px] tracking-wider text-[#718096] border-b border-[#202b3a]">
              <tr>
                <th class="py-3 px-3.5">Product & SKU</th>
                <th class="py-3 px-3.5 text-center">Alert Monitoring</th>
                <th class="py-3 px-3.5">Alert Stage</th>
                <th class="py-3 px-3.5">Branch Warehouse Stock</th>
                <th class="py-3 px-3.5 text-center">Alert Margin</th>
                <th class="py-3 px-3.5 text-center">Total Stock</th>
                <th class="py-3 px-3.5 text-right">Quick Restock</th>
              </tr>
            </thead>
            <tbody id="stock-health-tbody" class="divide-y divide-[#202b3a]">
              ${renderStockHealthTableRows(products, branches)}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  `;

  // Apply initial filter if search query is provided
  if (initialSearchQuery) {
    filterStockHealthTable();
  }
}

/**
 * Helper to render stock health table rows
 */
function renderStockHealthTableRows(products, branches) {
  if (!products || products.length === 0) {
    return `<tr><td colspan="7" class="text-center py-6 text-xs text-[#718096]">No products found in inventory.</td></tr>`;
  }

  return products.map(product => {
    const isAlertEnabled = product.alertEnabled !== false;
    const margin = parseInt(product.lowStockMargin) || 5;
    const branchStock = product.branchStock || {};

    let hasDepleted = false;
    let hasLow = false;
    const branchChips = branches.map(b => {
      const qty = parseInt(branchStock[b.id] !== undefined ? branchStock[b.id] : 0);
      let chipClass = 'bg-[#141c28] text-[#a7b3c4] border-transparent';
      let statusLabel = '';

      if (qty === 0) {
        hasDepleted = true;
        chipClass = 'bg-rose-500/20 text-rose-300 border-rose-500/50 font-bold';
        statusLabel = ' (Out)';
      } else if (qty <= margin) {
        hasLow = true;
        chipClass = 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold';
        statusLabel = ' (Low)';
      } else {
        chipClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      }

      return `
        <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono border ${chipClass}" title="${b.name}: ${qty} units">
          <strong class="mr-1">${b.id.replace('BR-', '')}:</strong> ${qty}${statusLabel}
        </span>
      `;
    }).join(' ');

    let stageBadge = '';
    let stageKey = 'HEALTHY';
    if (!isAlertEnabled) {
      stageBadge = `<span class="px-2 py-0.5 rounded text-[9px] font-bold bg-[#141c28] text-[#718096] border border-[#202b3a]">Muted</span>`;
      stageKey = 'MUTED';
    } else if (hasDepleted) {
      stageBadge = `<span class="px-2 py-0.5 rounded text-[9px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse flex items-center space-x-1 w-max">
        <span class="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
        <span>Critical (Out)</span>
      </span>`;
      stageKey = 'CRITICAL';
    } else if (hasLow) {
      stageBadge = `<span class="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center space-x-1 w-max">
        <span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
        <span>Low Stock</span>
      </span>`;
      stageKey = 'LOW';
    } else {
      stageBadge = `<span class="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1 w-max">
        <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
        <span>Optimal</span>
      </span>`;
      stageKey = 'HEALTHY';
    }

    return `
      <tr class="hover:bg-[#141c28]/60 transition-colors stock-health-row"
          data-id="${product.id}"
          data-name="${(product.name || '').toLowerCase()}"
          data-sku="${(product.sku || '').toLowerCase()}"
          data-stage="${stageKey}"
          data-monitoring="${isAlertEnabled ? 'ENABLED' : 'MUTED'}"
          data-has-depleted="${hasDepleted}"
          data-has-low="${hasLow}"
          data-branch-stock='${JSON.stringify(branchStock)}'>
        
        <!-- Product & SKU -->
        <td class="py-3 px-3.5">
          <div class="flex items-center space-x-3">
            <img src="${product.image}" alt="${product.name}" class="w-10 h-10 object-cover rounded bg-[#080b12] border border-[#202b3a] flex-shrink-0">
            <div class="min-w-0">
              <p class="font-bold text-white truncate max-w-xs text-xs">${product.name}</p>
              <span class="text-[10px] font-mono text-cyan-400 block">${product.sku || 'SKU-NONE'}</span>
            </div>
          </div>
        </td>

        <!-- Alert Monitoring Toggle Switch -->
        <td class="py-3 px-3.5 text-center">
          <button onclick="toggleProductAlert(${product.id})"
            class="px-2.5 py-1 rounded text-[10px] font-bold transition-all border ${isAlertEnabled ? 'bg-blue-600/20 text-blue-400 border-blue-500/40 hover:bg-blue-600/30' : 'bg-[#141c28] text-[#718096] border-[#202b3a] hover:text-white'}"
            title="Click to toggle low stock alarm monitoring for this product">
            ${isAlertEnabled ? '● Alert ON' : '○ Alert OFF'}
          </button>
        </td>

        <!-- Alert Stage -->
        <td class="py-3 px-3.5">
          ${stageBadge}
        </td>

        <!-- Branch Stock Chips -->
        <td class="py-3 px-3.5">
          <div class="flex flex-wrap gap-1.5">
            ${branchChips}
          </div>
        </td>

        <!-- Alert Margin Dropdown -->
        <td class="py-3 px-3.5 text-center">
          <select onchange="updateProductStockMargin(${product.id}, this.value)"
            class="px-2 py-1 rounded bg-[#080b12] border border-[#202b3a] text-white text-[11px] font-mono focus:border-blue-500">
            ${[2, 3, 5, 8, 10, 15, 20].map(m => `
              <option value="${m}" ${margin === m ? 'selected' : ''}>&lt; ${m} units</option>
            `).join('')}
          </select>
        </td>

        <!-- Total Stock -->
        <td class="py-3 px-3.5 text-center font-mono font-extrabold text-white text-xs">
          ${product.totalStock}
        </td>

        <!-- Quick Restock Action -->
        <td class="py-3 px-3.5 text-right">
          <button onclick="openQuickRestockModal(${product.id})"
            class="px-2.5 py-1.5 bg-blue-600/15 hover:bg-blue-600/30 text-blue-400 hover:text-blue-300 font-bold text-xs rounded border border-blue-500/30 transition-all flex items-center space-x-1 ml-auto">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>Restock</span>
          </button>
        </td>

      </tr>
    `;
  }).join('');
}

/**
 * Filter stock health table in real-time
 */
export function filterStockHealthTable() {
  const query = (document.getElementById('stock-health-search')?.value || '').toLowerCase().trim();
  const selectedBranch = document.getElementById('stock-filter-branch')?.value || 'ALL';
  const selectedStage = document.getElementById('stock-filter-stage')?.value || 'ALL';
  const selectedMonitoring = document.getElementById('stock-filter-monitoring')?.value || 'ALL';

  const clearBtn = document.getElementById('clear-stock-search-btn');
  if (clearBtn) {
    if (query) clearBtn.classList.remove('hidden');
    else clearBtn.classList.add('hidden');
  }

  const rows = document.querySelectorAll('.stock-health-row');

  rows.forEach(row => {
    const name = row.getAttribute('data-name') || '';
    const sku = row.getAttribute('data-sku') || '';
    const stage = row.getAttribute('data-stage') || '';
    const monitoring = row.getAttribute('data-monitoring') || '';
    const hasDepleted = row.getAttribute('data-has-depleted') === 'true';
    const hasLow = row.getAttribute('data-has-low') === 'true';
    const branchStock = JSON.parse(row.getAttribute('data-branch-stock') || '{}');

    // Query match
    const matchesQuery = !query || name.includes(query) || sku.includes(query);

    // Monitoring match
    const matchesMonitoring = selectedMonitoring === 'ALL' || monitoring === selectedMonitoring;

    // Stage match
    let matchesStage = true;
    if (selectedStage === 'CRITICAL') matchesStage = stage === 'CRITICAL';
    else if (selectedStage === 'LOW') matchesStage = stage === 'LOW';
    else if (selectedStage === 'HEALTHY') matchesStage = stage === 'HEALTHY';
    else if (selectedStage === 'ALERTS_ONLY') matchesStage = stage === 'CRITICAL' || stage === 'LOW';

    // Branch match
    let matchesBranch = true;
    if (selectedBranch !== 'ALL') {
      const bQty = branchStock[selectedBranch];
      if (selectedStage === 'CRITICAL') matchesBranch = bQty === 0;
      else if (selectedStage === 'LOW') matchesBranch = bQty > 0 && bQty <= 5;
      else matchesBranch = true;
    }

    if (matchesQuery && matchesMonitoring && matchesStage && matchesBranch) {
      row.removeAttribute('style');
    } else {
      row.style.display = 'none';
    }
  });
}

/**
 * Clear stock search input and re-filter table
 */
export function clearStockSearch() {
  const searchInput = document.getElementById('stock-health-search');
  if (searchInput) {
    searchInput.value = '';
    filterStockHealthTable();
  }
}

/**
 * Navigate to Stock Health Tab and pre-filter by product query
 */
export function navigateToStockHealthWithSearch(productQuery) {
  if (typeof window.switchAdminTab === 'function') {
    window.switchAdminTab('stock-health', productQuery);
  } else {
    renderStockHealthTab(productQuery);
  }
}

/**
 * Toggle alert monitoring ON or OFF for a product
 */
export function toggleProductAlert(productId) {
  const products = getStoredProducts();
  const product = products.find(p => p.id === parseInt(productId));
  if (!product) return;

  const newState = product.alertEnabled === false ? true : false;
  updateProductStockSettings(productId, { alertEnabled: newState });

  showToast(newState ? `Alerts enabled for ${product.name}` : `Alerts muted for ${product.name}`);
  renderStockHealthTab();
}

/**
 * Update product low stock margin threshold
 */
export function updateProductStockMargin(productId, newMargin) {
  const margin = parseInt(newMargin) || 5;
  updateProductStockSettings(productId, { lowStockMargin: margin });
  showToast(`Low stock alert margin set to < ${margin} units.`);
  renderStockHealthTab();
}

/**
 * Opens Quick Restock & Branch Stock Transfer Modal
 */
export function openQuickRestockModal(productId, defaultBranchId = 'BR-COL') {
  const products = getStoredProducts();
  const product = products.find(p => p.id === parseInt(productId));
  if (!product) return;

  const branches = getBranches();
  const branchStock = product.branchStock || {};
  const modalContainer = document.getElementById('admin-modal-container');
  if (!modalContainer) return;

  modalContainer.innerHTML = `
    <div class="fixed inset-0 z-50 bg-[#080b12]/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-[#101722] border border-[#202b3a] rounded-lg p-6 max-w-lg w-full shadow-2xl space-y-5 text-xs">
        
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-[#202b3a] pb-3">
          <div class="flex items-center space-x-3">
            <img src="${product.image}" class="w-10 h-10 object-cover rounded bg-[#080b12] border border-[#202b3a]">
            <div>
              <h3 class="text-sm font-bold text-white">${product.name}</h3>
              <span class="text-[10px] text-[#718096] font-mono">${product.sku} | Total: ${product.totalStock} units</span>
            </div>
          </div>
          <button onclick="document.getElementById('admin-modal-container').innerHTML = ''" class="text-[#718096] hover:text-white text-lg">&times;</button>
        </div>

        <!-- Current Stock Distribution -->
        <div class="bg-[#080b12] p-3 rounded-md border border-[#202b3a] space-y-2">
          <span class="text-[10px] uppercase font-bold text-[#718096] tracking-wider">Current Warehouse Stock:</span>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono">
            ${branches.map(b => `
              <div class="bg-[#101722] p-2 rounded border ${parseInt(branchStock[b.id] || 0) === 0 ? 'border-rose-500/50 bg-rose-950/20' : 'border-[#202b3a]'}">
                <span class="text-[9px] text-[#718096] block">${b.name.replace(' Hub', '')}</span>
                <span class="text-xs font-bold ${parseInt(branchStock[b.id] || 0) === 0 ? 'text-rose-400' : 'text-white'}">${branchStock[b.id] || 0}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Mode Selector: Direct Restock vs Inter-Branch Transfer -->
        <div class="flex rounded-md bg-[#080b12] p-1 border border-[#202b3a]">
          <button id="restock-mode-add" onclick="switchRestockModalMode('add')"
            class="flex-1 py-1.5 text-xs font-bold rounded bg-blue-600 text-white transition-all">
            + Direct Stock Inbound
          </button>
          <button id="restock-mode-transfer" onclick="switchRestockModalMode('transfer')"
            class="flex-1 py-1.5 text-xs font-bold rounded text-[#718096] hover:text-white transition-all">
            ⇄ Inter-Branch Transfer
          </button>
        </div>

        <!-- Form Mode 1: Direct Inbound -->
        <form id="form-direct-restock" onsubmit="handleQuickRestockSubmit(event, ${product.id})" class="space-y-4">
          <div>
            <label class="block text-[#a7b3c4] font-bold mb-1">Target Warehouse Hub *</label>
            <select id="quick-restock-branch" class="w-full px-3 py-2 rounded-md bg-[#080b12] border border-[#202b3a] text-white">
              ${branches.map(b => `<option value="${b.id}" ${b.id === defaultBranchId ? 'selected' : ''}>${b.name} (${b.city}) — Currently ${branchStock[b.id] || 0} units</option>`).join('')}
            </select>
          </div>

          <div>
            <label class="block text-[#a7b3c4] font-bold mb-1">Inbound Restock Quantity *</label>
            <input type="number" id="quick-restock-qty" min="1" max="1000" value="10" required
              class="w-full px-3 py-2 rounded-md bg-[#080b12] border border-[#202b3a] text-white font-mono text-sm font-bold focus:border-blue-500">
          </div>

          <div class="flex items-center justify-end space-x-2 pt-2 border-t border-[#202b3a]">
            <button type="button" onclick="document.getElementById('admin-modal-container').innerHTML = ''"
              class="px-4 py-2 rounded bg-[#141c28] text-[#a7b3c4] font-bold">Cancel</button>
            <button type="submit" class="px-5 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold">
              Add Stock to Warehouse
            </button>
          </div>
        </form>

        <!-- Form Mode 2: Inter-Branch Transfer -->
        <form id="form-transfer-restock" onsubmit="handleStockTransferSubmit(event, ${product.id})" class="hidden space-y-4">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-[#a7b3c4] font-bold mb-1">From Hub (Source) *</label>
              <select id="transfer-from-branch" class="w-full px-2.5 py-2 rounded-md bg-[#080b12] border border-[#202b3a] text-white text-xs">
                ${branches.map(b => `<option value="${b.id}">${b.name.replace(' Hub', '')} (${branchStock[b.id] || 0} units)</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="block text-[#a7b3c4] font-bold mb-1">To Hub (Destination) *</label>
              <select id="transfer-to-branch" class="w-full px-2.5 py-2 rounded-md bg-[#080b12] border border-[#202b3a] text-white text-xs">
                ${branches.map((b, i) => `<option value="${b.id}" ${i === 1 ? 'selected' : ''}>${b.name.replace(' Hub', '')} (${branchStock[b.id] || 0} units)</option>`).join('')}
              </select>
            </div>
          </div>

          <div>
            <label class="block text-[#a7b3c4] font-bold mb-1">Transfer Units *</label>
            <input type="number" id="transfer-qty" min="1" max="100" value="5" required
              class="w-full px-3 py-2 rounded-md bg-[#080b12] border border-[#202b3a] text-white font-mono text-sm font-bold focus:border-blue-500">
          </div>

          <div class="flex items-center justify-end space-x-2 pt-2 border-t border-[#202b3a]">
            <button type="button" onclick="document.getElementById('admin-modal-container').innerHTML = ''"
              class="px-4 py-2 rounded bg-[#141c28] text-[#a7b3c4] font-bold">Cancel</button>
            <button type="submit" class="px-5 py-2 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-bold">
              Execute Inter-Branch Transfer
            </button>
          </div>
        </form>

      </div>
    </div>
  `;
}

/**
 * Mode toggle inside Restock Modal
 */
export function switchRestockModalMode(mode) {
  const formAdd = document.getElementById('form-direct-restock');
  const formTransfer = document.getElementById('form-transfer-restock');
  const btnAdd = document.getElementById('restock-mode-add');
  const btnTransfer = document.getElementById('restock-mode-transfer');

  if (mode === 'add') {
    formAdd.classList.remove('hidden');
    formTransfer.classList.add('hidden');
    btnAdd.className = 'flex-1 py-1.5 text-xs font-bold rounded bg-blue-600 text-white transition-all';
    btnTransfer.className = 'flex-1 py-1.5 text-xs font-bold rounded text-[#718096] hover:text-white transition-all';
  } else {
    formAdd.classList.add('hidden');
    formTransfer.classList.remove('hidden');
    btnTransfer.className = 'flex-1 py-1.5 text-xs font-bold rounded bg-cyan-600 text-white transition-all';
    btnAdd.className = 'flex-1 py-1.5 text-xs font-bold rounded text-[#718096] hover:text-white transition-all';
  }
}

/**
 * Handle Direct Restock Form Submission
 */
export function handleQuickRestockSubmit(e, productId) {
  e.preventDefault();
  const branchId = document.getElementById('quick-restock-branch').value;
  const qty = parseInt(document.getElementById('quick-restock-qty').value) || 0;

  if (qty <= 0) return;

  const updated = quickAdjustStock(productId, branchId, qty, false);
  if (updated) {
    showToast(`Added +${qty} units of ${updated.name} to warehouse.`);
    document.getElementById('admin-modal-container').innerHTML = '';
    renderStockHealthTab();
  }
}

/**
 * Handle Inter-Branch Transfer Form Submission
 */
export function handleStockTransferSubmit(e, productId) {
  e.preventDefault();
  const fromBranch = document.getElementById('transfer-from-branch').value;
  const toBranch = document.getElementById('transfer-to-branch').value;
  const qty = parseInt(document.getElementById('transfer-qty').value) || 0;

  if (fromBranch === toBranch) {
    alert('Source and destination warehouses cannot be the same.');
    return;
  }

  const result = transferBranchStock(productId, fromBranch, toBranch, qty);
  if (result.success) {
    showToast(`Transferred ${result.transferred} units between warehouses.`);
    document.getElementById('admin-modal-container').innerHTML = '';
    renderStockHealthTab();
  } else {
    alert(result.message || 'Transfer failed.');
  }
}
