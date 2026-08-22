// ============================================================
//  transfer_management_controller.js — Inter-Branch Stock Transfers & Logistics Controller
// ============================================================
import {
  getStockTransfers,
  createStockTransfer,
  receiveStockTransfer,
  cancelStockTransfer,
  getTransfersMetrics
} from '../models/transfers_data.js';
import { getStoredProducts } from '../models/data.js';
import { getBranches } from './branch_controller.js';
import { showToast } from './cart_controller.js';
import { closeAdminModal } from './admin_dashboard_controller.js';
import { getDealBundles } from '../models/deals_data.js';

let transferSearchQuery = '';
let activeStatusFilter = 'all';
let activeReasonFilter = 'all';

/**
 * Main Entry: Renders the Inter-Branch Stock Transfers & Logistics tab
 */
export function renderTransfersTab() {
  const container = document.getElementById('tab-panel-transfers');
  if (!container) return;

  const transfers = getStockTransfers();
  const metrics = getTransfersMetrics();

  // Filter transfers
  let filtered = transfers;
  if (activeStatusFilter !== 'all') {
    filtered = filtered.filter(t => t.status.toLowerCase() === activeStatusFilter.toLowerCase());
  }
  if (activeReasonFilter !== 'all') {
    filtered = filtered.filter(t => t.reason.toLowerCase().includes(activeReasonFilter.toLowerCase()));
  }
  if (transferSearchQuery.trim()) {
    const q = transferSearchQuery.toLowerCase();
    filtered = filtered.filter(t =>
      t.id.toLowerCase().includes(q) ||
      t.referenceNo.toLowerCase().includes(q) ||
      t.productName.toLowerCase().includes(q) ||
      t.productSku.toLowerCase().includes(q) ||
      t.fromBranchName.toLowerCase().includes(q) ||
      t.toBranchName.toLowerCase().includes(q) ||
      (t.trackingCode && t.trackingCode.toLowerCase().includes(q))
    );
  }

  container.innerHTML = `
    <div class="space-y-6 max-w-7xl mx-auto pb-12">

      <!-- Top Header & Primary Action -->
      <div class="bg-white border border-[#e2e8f0] rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center space-x-2">
            <span class="px-2.5 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-mono font-black uppercase">
              INTER-BRANCH LOGISTICS & WAREHOUSE TRANSFERS
            </span>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              LEDGER VERIFIED
            </span>
          </div>
          <h2 class="text-xl font-extrabold text-[#0f172a] tracking-tight mt-1.5">Stock Transfers & Logistics Control</h2>
          <p class="text-xs text-[#64748b] mt-0.5">Track multi-branch inventory movements, stage bundle kit assemblies, and verify inbound dispatches.</p>
        </div>

        <button onclick="openInitiateTransferModal()" 
          class="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center space-x-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          <span>+ Initiate Stock Transfer</span>
        </button>
      </div>

      <!-- KPI Metrics Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <!-- Card 1: In Transit -->
        <div class="bg-white border border-[#e2e8f0] rounded-2xl p-4 sm:p-5 shadow-sm relative overflow-hidden">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-[#64748b] uppercase tracking-wider">In-Transit Shipments</span>
            <span class="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-sm border border-amber-200">🚚</span>
          </div>
          <div class="flex items-baseline space-x-2 mt-2">
            <span class="text-2xl sm:text-3xl font-extrabold font-mono text-[#0f172a]">${metrics.inTransit}</span>
            <span class="text-xs font-bold text-amber-600 animate-pulse">● Active on route</span>
          </div>
          <p class="text-[11px] text-[#64748b] mt-1">Dispatched inventory en route between hubs.</p>
        </div>

        <!-- Card 2: Received & Verified -->
        <div class="bg-white border border-[#e2e8f0] rounded-2xl p-4 sm:p-5 shadow-sm relative overflow-hidden">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-[#64748b] uppercase tracking-wider">Completed Transfers</span>
            <span class="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm border border-emerald-200">✓</span>
          </div>
          <div class="flex items-baseline space-x-2 mt-2">
            <span class="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-600">${metrics.received}</span>
            <span class="text-xs font-bold text-slate-400">Transfers</span>
          </div>
          <p class="text-[11px] text-[#64748b] mt-1">Stock credited and verified at destination.</p>
        </div>

        <!-- Card 3: Bundle Assembly Transfers -->
        <div class="bg-white border border-[#e2e8f0] rounded-2xl p-4 sm:p-5 shadow-sm relative overflow-hidden">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-[#64748b] uppercase tracking-wider">Bundle Kit Rebalances</span>
            <span class="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm border border-blue-200">🎠</span>
          </div>
          <div class="flex items-baseline space-x-2 mt-2">
            <span class="text-2xl sm:text-3xl font-extrabold font-mono text-blue-600">${metrics.bundleTransfers}</span>
            <span class="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">Deal Assemblies</span>
          </div>
          <p class="text-[11px] text-[#64748b] mt-1">Parts moved to build ready-to-ship deal kits.</p>
        </div>

        <!-- Card 4: Total Units Moved -->
        <div class="bg-white border border-[#e2e8f0] rounded-2xl p-4 sm:p-5 shadow-sm relative overflow-hidden">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-[#64748b] uppercase tracking-wider">Total Hardware Moved</span>
            <span class="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-sm border border-purple-200">📦</span>
          </div>
          <div class="flex items-baseline space-x-2 mt-2">
            <span class="text-2xl sm:text-3xl font-extrabold font-mono text-purple-700">${metrics.totalUnits}</span>
            <span class="text-xs font-bold text-slate-400">Total Units</span>
          </div>
          <p class="text-[11px] text-[#64748b] mt-1">Gross physical inventory items transferred.</p>
        </div>

      </div>

      <!-- Filters, Search & Status Navigation Bar -->
      <div class="bg-white border border-[#e2e8f0] rounded-2xl p-4 shadow-sm space-y-3">
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          
          <!-- Status Filter Tabs -->
          <div class="flex items-center space-x-1.5 overflow-x-auto pb-1 w-full md:w-auto">
            ${[
              { id: 'all', label: 'All Transfers', count: transfers.length },
              { id: 'in transit', label: 'In Transit 🚚', count: metrics.inTransit, color: 'amber' },
              { id: 'received', label: 'Received ✓', count: metrics.received, color: 'emerald' },
              { id: 'requested', label: 'Requested 📋', count: metrics.requested, color: 'blue' },
              { id: 'cancelled', label: 'Cancelled ✕', count: metrics.cancelled, color: 'rose' }
            ].map(tab => `
              <button onclick="filterTransfersByStatus('${tab.id}')"
                class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 whitespace-nowrap ${
                  activeStatusFilter === tab.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-[#f8fafc] text-[#475569] border border-[#e2e8f0] hover:bg-slate-100 hover:text-[#0f172a]'
                }">
                <span>${tab.label}</span>
                <span class="px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  activeStatusFilter === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                }">${tab.count}</span>
              </button>
            `).join('')}
          </div>

          <!-- Search Input Bar -->
          <div class="relative w-full md:w-72">
            <input type="text" id="transfer-search-input" value="${transferSearchQuery}" oninput="handleTransferSearch(this.value)"
              placeholder="Search Transfer ID, SKU, Product, or Hub..."
              class="w-full pl-9 pr-3.5 py-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-xs font-semibold focus:border-blue-600 focus:outline-none">
            <svg class="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

        </div>
      </div>

      <!-- Transfers Ledger Table -->
      <div class="bg-white border border-[#e2e8f0] rounded-2xl shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs text-[#475569]">
            <thead class="bg-[#f8fafc] border-b border-[#e2e8f0] text-[10px] font-mono uppercase text-[#64748b] tracking-wider">
              <tr>
                <th class="p-4">Transfer Ref / ID</th>
                <th class="p-4">Product Details</th>
                <th class="p-4">Source Hub ➔ Destination Hub</th>
                <th class="p-4 text-center">Qty</th>
                <th class="p-4">Reason / Allocation</th>
                <th class="p-4 text-center">Status</th>
                <th class="p-4 text-right">Logistics Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#e2e8f0]">
              ${filtered.length === 0 ? `
                <tr>
                  <td colspan="7" class="p-12 text-center text-[#64748b]">
                    <div class="text-3xl mb-2">🚚</div>
                    <p class="text-sm font-bold text-[#0f172a]">No Stock Transfers Found</p>
                    <p class="text-xs text-slate-400 mt-1">No transfer records match your active search or filter criteria.</p>
                  </td>
                </tr>
              ` : filtered.map(t => {
                const isTransit = t.status === 'In Transit';
                const isReceived = t.status === 'Received';
                const isCancelled = t.status === 'Cancelled';

                return `
                  <tr class="hover:bg-[#f8fafc] transition-colors">
                    
                    <!-- ID & Tracking Code -->
                    <td class="p-4">
                      <div class="font-mono font-bold text-[#0f172a] text-xs">${t.id}</div>
                      <div class="text-[10px] text-blue-600 font-mono font-semibold">${t.trackingCode}</div>
                      <div class="text-[9px] text-[#94a3b8] font-mono">${new Date(t.createdAt).toLocaleDateString()}</div>
                    </td>

                    <!-- Product Details -->
                    <td class="p-4">
                      <div class="flex items-center space-x-2.5">
                        <img src="${t.productImage || 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=100&q=80'}" 
                          class="w-10 h-10 object-cover rounded-lg bg-[#f8fafc] border border-[#e2e8f0] flex-shrink-0">
                        <div>
                          <p class="font-bold text-[#0f172a] line-clamp-1">${t.productName}</p>
                          <p class="text-[10px] text-blue-600 font-mono font-semibold">${t.productSku}</p>
                        </div>
                      </div>
                    </td>

                    <!-- Route -->
                    <td class="p-4">
                      <div class="flex items-center space-x-2 text-xs font-semibold">
                        <span class="text-[#0f172a]">${t.fromBranchName}</span>
                        <span class="text-blue-600 font-bold">➔</span>
                        <span class="text-[#0f172a] font-bold">${t.toBranchName}</span>
                      </div>
                      <div class="text-[10px] text-[#64748b] font-mono mt-0.5">${t.driverOrCourier || 'Internal Logistics'}</div>
                    </td>

                    <!-- Qty -->
                    <td class="p-4 text-center font-mono font-bold text-sm text-[#0f172a]">
                      <span class="px-2.5 py-1 bg-slate-100 rounded-lg border border-slate-200">${t.quantity}</span>
                    </td>

                    <!-- Reason -->
                    <td class="p-4">
                      <div class="text-xs font-bold text-[#0f172a]">${t.reason}</div>
                      ${t.bundleTitle ? `
                        <span class="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-200 mt-1">
                          <span>🎠</span>
                          <span>${t.bundleTitle}</span>
                        </span>
                      ` : ''}
                      ${t.notes ? `<p class="text-[10px] text-[#64748b] line-clamp-1 mt-0.5">${t.notes}</p>` : ''}
                    </td>

                    <!-- Status Badge -->
                    <td class="p-4 text-center">
                      <span class="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-tight font-mono ${
                        isTransit
                          ? 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse'
                          : isReceived
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : isCancelled
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }">
                        ${isTransit ? '🚚 In Transit' : isReceived ? '✓ Received' : isCancelled ? '✕ Cancelled' : '📋 Requested'}
                      </span>
                    </td>

                    <!-- Actions -->
                    <td class="p-4 text-right">
                      <div class="flex items-center justify-end space-x-1.5">
                        ${isTransit ? `
                          <button onclick="handleReceiveTransfer('${t.id}')"
                            class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-[11px] shadow-sm transition-all flex items-center space-x-1"
                            title="Verify and credit inventory at destination branch">
                            <span>✓</span>
                            <span>Receive Stock</span>
                          </button>
                        ` : ''}

                        <button onclick="viewTransferManifestModal('${t.id}')"
                          class="px-2.5 py-1 bg-[#f8fafc] hover:bg-blue-50 text-[#0f172a] hover:text-blue-600 border border-[#e2e8f0] font-bold rounded-lg text-[11px] transition-all"
                          title="View complete transfer bill of lading manifest">
                          Manifest
                        </button>

                        ${(isTransit || t.status === 'Requested') ? `
                          <button onclick="handleCancelTransfer('${t.id}')"
                            class="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200"
                            title="Cancel transfer and return stock to source branch">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                          </button>
                        ` : ''}
                      </div>
                    </td>

                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `;
}

export function filterTransfersByStatus(status) {
  activeStatusFilter = status;
  renderTransfersTab();
}

export function handleTransferSearch(query) {
  transferSearchQuery = query;
  renderTransfersTab();
}

export function handleReceiveTransfer(transferId) {
  const res = receiveStockTransfer(transferId, 'Administrator Verification');
  if (res.success) {
    showToast(`✅ Transfer ${transferId} successfully received & credited to ${res.transfer.toBranchName}!`);
    renderTransfersTab();
  } else {
    showToast(res.message, 'error');
  }
}

export function handleCancelTransfer(transferId) {
  if (confirm(`Are you sure you want to cancel Transfer ${transferId}? Stock will be immediately returned to source warehouse.`)) {
    const res = cancelStockTransfer(transferId, 'Cancelled from management dashboard');
    if (res.success) {
      showToast(`Transfer ${transferId} cancelled. Stock returned to ${res.transfer.fromBranchName}.`);
      renderTransfersTab();
    } else {
      showToast(res.message, 'error');
    }
  }
}

/**
 * Open Modal to Initiate a New Transfer
 */
export function openInitiateTransferModal(prefill = null) {
  const modalContainer = document.getElementById('admin-modal-container');
  if (!modalContainer) return;

  const products = getStoredProducts();
  const branches = getBranches();

  const selectedProductId = prefill ? prefill.productId : (products[0] ? products[0].id : 1);
  const selectedProduct = products.find(p => p.id === selectedProductId) || products[0];

  modalContainer.innerHTML = `
    <div class="fixed inset-0 bg-[#0f172a]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div class="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-[#e2e8f0] my-8 space-y-4">
        
        <div class="flex items-center justify-between border-b border-[#e2e8f0] pb-3">
          <div class="flex items-center space-x-2">
            <span class="p-2 rounded-xl bg-blue-50 text-blue-600 font-bold">🚚</span>
            <div>
              <h3 class="text-base font-extrabold text-[#0f172a]">Initiate Inter-Branch Stock Transfer</h3>
              <p class="text-xs text-[#64748b]">Dispatch hardware inventory from one hub warehouse to another.</p>
            </div>
          </div>
          <button onclick="closeAdminModal()" class="text-slate-400 hover:text-slate-700 text-xl font-bold">&times;</button>
        </div>

        <form id="transfer-initiate-form" onsubmit="handleSaveTransferSubmit(event)" class="space-y-4 text-xs">
          
          <!-- Product Selector -->
          <div>
            <label class="block font-bold text-[#0f172a] mb-1">Select Hardware Product *</label>
            <select id="tf-product-id" onchange="updateTransferProductDetails(this.value)" required
              class="w-full px-3.5 py-2.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-[#0f172a] font-bold focus:border-blue-600 focus:outline-none">
              ${products.map(p => `
                <option value="${p.id}" ${p.id === selectedProductId ? 'selected' : ''}>
                  ${p.name} — SKU: ${p.sku} (Total: ${p.totalStock} units)
                </option>
              `).join('')}
            </select>
          </div>

          <!-- Product Live Branch Inventory Matrix Preview -->
          <div id="tf-branch-stock-preview" class="p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl space-y-1.5">
            <!-- Rendered by updateTransferProductDetails() -->
          </div>

          <!-- Source & Destination Branches -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-[#0f172a] mb-1">From Source Branch Hub *</label>
              <select id="tf-from-branch" onchange="validateTransferSourceStock()" required
                class="w-full px-3.5 py-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-[#0f172a] font-bold focus:border-blue-600 focus:outline-none">
                ${branches.map(b => `
                  <option value="${b.id}" ${prefill && prefill.fromBranchId === b.id ? 'selected' : ''}>
                    ${b.name} (${b.city})
                  </option>
                `).join('')}
              </select>
            </div>

            <div>
              <label class="block font-bold text-[#0f172a] mb-1">To Destination Hub *</label>
              <select id="tf-to-branch" required
                class="w-full px-3.5 py-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-[#0f172a] font-bold focus:border-blue-600 focus:outline-none">
                ${branches.map(b => `
                  <option value="${b.id}" ${prefill && prefill.toBranchId === b.id ? 'selected' : (b.id === 'BR-COL' ? 'selected' : '')}>
                    ${b.name} (${b.city})
                  </option>
                `).join('')}
              </select>
            </div>
          </div>

          <!-- Quantity & Reason -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-[#0f172a] mb-1">Transfer Quantity (Units) *</label>
              <input type="number" id="tf-qty" min="1" max="999" value="${prefill ? prefill.qty : 1}" required
                class="w-full px-3.5 py-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-[#0f172a] font-mono font-bold focus:border-blue-600 focus:outline-none">
              <span id="tf-source-avail-note" class="text-[10px] text-blue-600 font-bold block mt-1"></span>
            </div>

            <div>
              <label class="block font-bold text-[#0f172a] mb-1">Transfer Purpose / Reason</label>
              <select id="tf-reason" class="w-full px-3.5 py-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-[#0f172a] font-semibold focus:border-blue-600 focus:outline-none">
                <option value="Deal Bundle Kit Assembly" ${prefill && prefill.reason === 'Deal Bundle Kit Assembly' ? 'selected' : ''}>Deal Bundle Kit Assembly 🎠</option>
                <option value="Low Stock Rebalance">Low Stock Rebalance ⚖️</option>
                <option value="Customer Order Reservation">Customer Order Reservation 👤</option>
                <option value="Emergency Restock">Emergency Restock ⚡</option>
              </select>
            </div>
          </div>

          <!-- Logistics & Tracking Notes -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-[#0f172a] mb-1">Driver / Logistics Fleet</label>
              <input type="text" id="tf-driver" value="ETech Logistics Fleet #01"
                class="w-full px-3 py-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-[#0f172a] focus:border-blue-600 focus:outline-none">
            </div>
            <div>
              <label class="block font-bold text-[#0f172a] mb-1">Tracking Waybill / Code</label>
              <input type="text" id="tf-tracking" value="ET-LOG-${Math.floor(1000 + Math.random() * 9000)}"
                class="w-full px-3 py-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-[#0f172a] font-mono focus:border-blue-600 focus:outline-none">
            </div>
          </div>

          <div>
            <label class="block font-bold text-[#0f172a] mb-1">Notes / Instructions</label>
            <input type="text" id="tf-notes" value="${prefill && prefill.notes ? prefill.notes : ''}" placeholder="e.g. Expedited delivery for bundle kit assembly."
              class="w-full px-3.5 py-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-[#0f172a] focus:border-blue-600 focus:outline-none">
          </div>

          <!-- Dispatch Mode Option -->
          <div class="p-3 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between">
            <div>
              <span class="font-bold text-blue-900 block">Instant Warehouse Delivery (Auto-Receive)</span>
              <span class="text-[10px] text-blue-700">Check to instantly credit stock to destination without transit delay.</span>
            </div>
            <input type="checkbox" id="tf-instant" class="w-4 h-4 text-blue-600 rounded">
          </div>

          <!-- Buttons -->
          <div class="pt-3 border-t border-[#e2e8f0] flex items-center justify-end space-x-3">
            <button type="button" onclick="closeAdminModal()"
              class="px-4 py-2 bg-[#f8fafc] hover:bg-[#f1f5f9] text-[#475569] font-bold text-xs rounded-xl border border-[#e2e8f0]">
              Cancel
            </button>
            <button type="submit"
              class="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all">
              Dispatch Transfer
            </button>
          </div>

        </form>

      </div>
    </div>
  `;

  updateTransferProductDetails(selectedProductId);
}

export function updateTransferProductDetails(productId) {
  const products = getStoredProducts();
  const branches = getBranches();
  const p = products.find(prod => prod.id === Number(productId));
  const preview = document.getElementById('tf-branch-stock-preview');
  if (!p || !preview) return;

  preview.innerHTML = `
    <div class="flex items-center justify-between text-[11px] font-bold text-[#0f172a] mb-1">
      <span>Live Inventory Across Branch Hubs:</span>
      <span class="text-blue-600 font-mono">Total: ${p.totalStock} units</span>
    </div>
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
      ${branches.map(b => {
        const qty = (p.branchStock && p.branchStock[b.id]) || 0;
        return `
          <div class="p-1.5 rounded-lg border ${qty > 0 ? 'bg-white border-blue-200' : 'bg-slate-100 border-slate-200 opacity-60'} text-center">
            <span class="text-[10px] font-semibold text-[#64748b] block">${b.city}</span>
            <span class="text-xs font-mono font-extrabold ${qty > 0 ? 'text-blue-600' : 'text-slate-400'}">${qty} in stock</span>
          </div>
        `;
      }).join('')}
    </div>
  `;

  validateTransferSourceStock();
}

export function validateTransferSourceStock() {
  const productId = Number(document.getElementById('tf-product-id')?.value);
  const fromBranchId = document.getElementById('tf-from-branch')?.value;
  const note = document.getElementById('tf-source-avail-note');
  const qtyInput = document.getElementById('tf-qty');

  const products = getStoredProducts();
  const p = products.find(prod => prod.id === productId);
  if (!p || !note) return;

  const avail = (p.branchStock && p.branchStock[fromBranchId]) || 0;
  note.textContent = `Available at source branch: ${avail} units`;
  if (qtyInput) {
    qtyInput.max = avail;
  }
}

export function handleSaveTransferSubmit(event) {
  if (event) event.preventDefault();

  const productId = Number(document.getElementById('tf-product-id').value);
  const fromBranchId = document.getElementById('tf-from-branch').value;
  const toBranchId = document.getElementById('tf-to-branch').value;
  const quantity = Number(document.getElementById('tf-qty').value);
  const reason = document.getElementById('tf-reason').value;
  const driverOrCourier = document.getElementById('tf-driver').value.trim();
  const trackingCode = document.getElementById('tf-tracking').value.trim();
  const notes = document.getElementById('tf-notes').value.trim();
  const instantDelivery = document.getElementById('tf-instant').checked;

  if (fromBranchId === toBranchId) {
    alert("Source and Destination branches must be different.");
    return;
  }

  const res = createStockTransfer({
    productId,
    fromBranchId,
    toBranchId,
    quantity,
    reason,
    driverOrCourier,
    trackingCode,
    notes,
    instantDelivery
  });

  if (res.success) {
    showToast(`🚀 Stock transfer ${res.transfer.id} initiated successfully!`);
    closeAdminModal();
    renderTransfersTab();
  } else {
    alert(res.message);
  }
}

/**
 * View Detailed Transfer Bill of Lading Manifest Modal
 */
export function viewTransferManifestModal(transferId) {
  const list = getStockTransfers();
  const t = list.find(tr => tr.id === transferId);
  if (!t) return;

  const modalContainer = document.getElementById('admin-modal-container');
  if (!modalContainer) return;

  modalContainer.innerHTML = `
    <div class="fixed inset-0 bg-[#0f172a]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#e2e8f0] my-8 space-y-4">
        
        <div class="flex items-center justify-between border-b border-[#e2e8f0] pb-3">
          <div>
            <div class="flex items-center space-x-2">
              <span class="text-xs font-mono font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">${t.id}</span>
              <span class="text-xs font-mono text-[#64748b]">${t.referenceNo}</span>
            </div>
            <h3 class="text-base font-extrabold text-[#0f172a] mt-1">Inter-Branch Transfer Manifest</h3>
          </div>
          <button onclick="closeAdminModal()" class="text-slate-400 hover:text-slate-700 text-xl font-bold">&times;</button>
        </div>

        <div class="space-y-3.5 text-xs text-[#475569]">
          
          <!-- Route -->
          <div class="p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl flex items-center justify-between">
            <div>
              <span class="text-[10px] font-mono text-[#64748b] block">DISPATCH SOURCE</span>
              <span class="font-extrabold text-[#0f172a] text-sm">${t.fromBranchName}</span>
            </div>
            <span class="text-xl text-blue-600 font-bold">➔</span>
            <div class="text-right">
              <span class="text-[10px] font-mono text-[#64748b] block">DESTINATION WAREHOUSE</span>
              <span class="font-extrabold text-[#0f172a] text-sm">${t.toBranchName}</span>
            </div>
          </div>

          <!-- Product Details -->
          <div class="p-3 bg-white border border-[#e2e8f0] rounded-xl flex items-center space-x-3">
            <img src="${t.productImage}" class="w-12 h-12 object-cover rounded-lg border border-[#e2e8f0]">
            <div class="flex-1">
              <span class="font-extrabold text-[#0f172a] text-xs block">${t.productName}</span>
              <span class="text-[10px] font-mono text-blue-600 font-bold">SKU: ${t.productSku}</span>
            </div>
            <div class="text-right">
              <span class="text-[10px] font-mono text-[#64748b] block">QUANTITY</span>
              <span class="text-base font-extrabold font-mono text-blue-600">${t.quantity} Units</span>
            </div>
          </div>

          <!-- Details Grid -->
          <div class="grid grid-cols-2 gap-3 p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl">
            <div>
              <span class="text-[10px] font-mono text-[#64748b] block">TRANSFER REASON</span>
              <span class="font-bold text-[#0f172a]">${t.reason}</span>
            </div>
            <div>
              <span class="text-[10px] font-mono text-[#64748b] block">LOGISTICS CARRIER</span>
              <span class="font-bold text-[#0f172a]">${t.driverOrCourier || 'Fleet Fleet'}</span>
            </div>
            <div>
              <span class="text-[10px] font-mono text-[#64748b] block">TRACKING CODE</span>
              <span class="font-mono font-bold text-blue-600">${t.trackingCode}</span>
            </div>
            <div>
              <span class="text-[10px] font-mono text-[#64748b] block">CURRENT STATUS</span>
              <span class="font-bold ${t.status === 'Received' ? 'text-emerald-600' : 'text-amber-600'}">${t.status}</span>
            </div>
          </div>

          ${t.notes ? `
            <div class="p-3 bg-blue-50/50 border border-blue-200 rounded-xl">
              <span class="text-[10px] font-mono font-bold text-blue-800 block">SPECIAL INSTRUCTIONS / NOTES</span>
              <p class="text-xs text-[#0f172a] mt-0.5">${t.notes}</p>
            </div>
          ` : ''}

        </div>

        <div class="pt-3 border-t border-[#e2e8f0] flex items-center justify-between">
          <span class="text-[10px] text-[#94a3b8] font-mono">ETech Logistics OS v2.4</span>
          <button onclick="closeAdminModal()"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-sm">
            Close Manifest
          </button>
        </div>

      </div>
    </div>
  `;
}

// Global Window Bindings
window.renderTransfersTab = renderTransfersTab;
window.filterTransfersByStatus = filterTransfersByStatus;
window.handleTransferSearch = handleTransferSearch;
window.handleReceiveTransfer = handleReceiveTransfer;
window.handleCancelTransfer = handleCancelTransfer;
window.openInitiateTransferModal = openInitiateTransferModal;
window.updateTransferProductDetails = updateTransferProductDetails;
window.validateTransferSourceStock = validateTransferSourceStock;
window.handleSaveTransferSubmit = handleSaveTransferSubmit;
window.viewTransferManifestModal = viewTransferManifestModal;
