// ============================================================
//  src/js/controller/trash_bin_controller.js — SuperADMIN Trash Bin & Data Recovery Center
// ============================================================
import { getCurrentUser } from './login_controller.js';
import { 
  getDeletedProducts, restoreProduct, permanentlyDeleteProduct, getStoredProducts 
} from '../models/data.js';
import { 
  getDeletedCategories, restoreCategory, permanentlyDeleteCategory,
  getDeletedBadges, restoreBadge, permanentlyDeleteBadge 
} from '../models/taxonomy_data.js';
import { 
  getDeletedBrands, restoreBrand, permanentlyDeleteBrand 
} from '../models/brand_data.js';
import { showToast } from './cart_controller.js';
import { updateTrashSidebarBadge } from './admin_dashboard_controller.js';

let currentTrashFilter = 'all'; // 'all', 'products', 'categories', 'brands', 'badges'
let trashSearchQuery = '';

/**
 * Calculates total deleted records count across all modules
 * @returns {number}
 */
export function getTrashTotalCount() {
  const p = getDeletedProducts().length;
  const c = getDeletedCategories().length;
  const br = getDeletedBrands().length;
  const bg = getDeletedBadges().length;
  return p + c + br + bg;
}

/**
 * Main Render Function for SuperADMIN Trash Bin Console
 */
export function renderTrashBinTab() {
  const container = document.getElementById('tab-panel-trash');
  if (!container) return;

  const activeUser = getCurrentUser();

  // Strict RBAC Guard: SuperADMIN ONLY
  if (!activeUser || !activeUser.isSuperAdmin()) {
    container.innerHTML = `
      <div class="p-8 max-w-2xl mx-auto text-center space-y-4 bg-white border border-rose-200 rounded-2xl shadow-sm">
        <div class="w-14 h-14 mx-auto rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-2xl">
          🔒
        </div>
        <h2 class="text-xl font-extrabold text-[#0f172a]">SuperADMIN Access Restricted</h2>
        <p class="text-xs text-[#64748b] leading-relaxed">
          The Trash Bin & Permanent Data Purging Console is strictly restricted to <strong>SUPERADMIN</strong> accounts.
          Staff and regular Store Administrators are not authorized to view or restore deleted records.
        </p>
        <button onclick="switchAdminTab('overview')" class="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-sm transition-all">
          Return to Overview
        </button>
      </div>
    `;
    return;
  }

  const deletedProducts = getDeletedProducts();
  const deletedCategories = getDeletedCategories();
  const deletedBrands = getDeletedBrands();
  const deletedBadges = getDeletedBadges();

  const totalCount = deletedProducts.length + deletedCategories.length + deletedBrands.length + deletedBadges.length;

  // Aggregate deleted items with entity type metadata
  let items = [];

  if (currentTrashFilter === 'all' || currentTrashFilter === 'products') {
    deletedProducts.forEach(p => items.push({
      id: p.id,
      name: p.name,
      type: 'product',
      typeLabel: 'Product',
      typeBadgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
      typeIcon: '📦',
      code: p.sku || `ID: ${p.id}`,
      image: p.image || 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=200&q=80',
      extraInfo: `Category: ${p.category} | Rs. ${(p.price || 0).toLocaleString()}`,
      raw: p
    }));
  }

  if (currentTrashFilter === 'all' || currentTrashFilter === 'categories') {
    deletedCategories.forEach(c => items.push({
      id: c.id || c.slug,
      name: c.name,
      type: 'category',
      typeLabel: 'Category',
      typeBadgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
      typeIcon: c.icon || '📁',
      code: `Slug: ${c.slug}`,
      image: null,
      extraInfo: c.description || 'Storefront category group',
      raw: c
    }));
  }

  if (currentTrashFilter === 'all' || currentTrashFilter === 'brands') {
    deletedBrands.forEach(b => items.push({
      id: b.id,
      name: b.name,
      type: 'brand',
      typeLabel: 'Brand',
      typeBadgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
      typeIcon: '🏢',
      code: `Slug: ${b.slug}`,
      image: b.logo || b.logoUrl || null,
      extraInfo: `Origin: ${b.country || 'Global'} | Founded: ${b.founded || b.foundedYear || 'N/A'}`,
      raw: b
    }));
  }

  if (currentTrashFilter === 'all' || currentTrashFilter === 'badges') {
    deletedBadges.forEach(bg => items.push({
      id: bg.id,
      name: bg.name,
      type: 'badge',
      typeLabel: 'Badge Tag',
      typeBadgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      typeIcon: '🏷️',
      code: `Rule: ${bg.ruleType || 'manual'}`,
      image: null,
      extraInfo: bg.standardDescription || bg.purpose || 'Dynamic reach badge',
      raw: bg
    }));
  }

  // Search filter
  if (trashSearchQuery.trim()) {
    const q = trashSearchQuery.toLowerCase().trim();
    items = items.filter(i => 
      i.name.toLowerCase().includes(q) || 
      i.code.toLowerCase().includes(q) || 
      i.typeLabel.toLowerCase().includes(q) ||
      i.extraInfo.toLowerCase().includes(q)
    );
  }

  container.innerHTML = `
    <div class="space-y-6 max-w-7xl mx-auto pb-12">
      
      <!-- Top Action Bar -->
      <div class="bg-white border border-[#e2e8f0] rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex items-center space-x-3.5">
          <div class="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center font-bold text-2xl shadow-sm flex-shrink-0">
            🗑️
          </div>
          <div>
            <div class="flex items-center space-x-2">
              <h2 class="text-xl font-extrabold text-[#0f172a] tracking-tight">Trash Bin & Data Recovery Vault</h2>
              <span class="px-2 py-0.5 rounded-full text-[9px] font-mono font-extrabold uppercase bg-purple-50 text-purple-700 border border-purple-200">
                SUPERADMIN ONLY
              </span>
            </div>
            <p class="text-xs text-[#64748b] mt-0.5">
              Review soft-deleted catalog items, restore records back to ACTIVE lifecycle status, or permanently purge data from database.
            </p>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2.5">
          ${totalCount > 0 ? `
            <button type="button" onclick="confirmEmptyAllTrash()"
              class="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all flex items-center space-x-2 shadow-sm hover:shadow-rose-600/20 active:scale-95 cursor-pointer">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              <span>Empty Trash Vault</span>
            </button>
          ` : ''}
        </div>
      </div>

      <!-- KPI Summary Row -->
      <div class="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        
        <div onclick="switchTrashSubTab('all')"
          class="bg-white border ${currentTrashFilter === 'all' ? 'border-blue-600 ring-2 ring-blue-600/10' : 'border-[#e2e8f0]'} rounded-xl p-3.5 shadow-sm cursor-pointer hover:border-blue-400 transition-all">
          <div class="flex items-center justify-between text-[#64748b]">
            <span class="text-[10px] font-mono font-bold uppercase tracking-wider">Total in Vault</span>
            <span class="text-xs">🗑️</span>
          </div>
          <h3 class="text-xl font-black text-[#0f172a] font-mono mt-1">${totalCount}</h3>
          <p class="text-[9px] text-[#64748b] font-medium">All Deleted Records</p>
        </div>

        <div onclick="switchTrashSubTab('products')"
          class="bg-white border ${currentTrashFilter === 'products' ? 'border-blue-600 ring-2 ring-blue-600/10' : 'border-[#e2e8f0]'} rounded-xl p-3.5 shadow-sm cursor-pointer hover:border-blue-400 transition-all">
          <div class="flex items-center justify-between text-[#64748b]">
            <span class="text-[10px] font-mono font-bold uppercase tracking-wider">Products</span>
            <span class="text-xs">📦</span>
          </div>
          <h3 class="text-xl font-black text-blue-600 font-mono mt-1">${deletedProducts.length}</h3>
          <p class="text-[9px] text-blue-600 font-medium">Catalog Hardware</p>
        </div>

        <div onclick="switchTrashSubTab('categories')"
          class="bg-white border ${currentTrashFilter === 'categories' ? 'border-purple-600 ring-2 ring-purple-600/10' : 'border-[#e2e8f0]'} rounded-xl p-3.5 shadow-sm cursor-pointer hover:border-purple-400 transition-all">
          <div class="flex items-center justify-between text-[#64748b]">
            <span class="text-[10px] font-mono font-bold uppercase tracking-wider">Categories</span>
            <span class="text-xs">📁</span>
          </div>
          <h3 class="text-xl font-black text-purple-600 font-mono mt-1">${deletedCategories.length}</h3>
          <p class="text-[9px] text-purple-600 font-medium">Store Groupings</p>
        </div>

        <div onclick="switchTrashSubTab('brands')"
          class="bg-white border ${currentTrashFilter === 'brands' ? 'border-amber-600 ring-2 ring-amber-600/10' : 'border-[#e2e8f0]'} rounded-xl p-3.5 shadow-sm cursor-pointer hover:border-amber-400 transition-all">
          <div class="flex items-center justify-between text-[#64748b]">
            <span class="text-[10px] font-mono font-bold uppercase tracking-wider">Brands</span>
            <span class="text-xs">🏢</span>
          </div>
          <h3 class="text-xl font-black text-amber-600 font-mono mt-1">${deletedBrands.length}</h3>
          <p class="text-[9px] text-amber-600 font-medium">Partners & Makers</p>
        </div>

        <div onclick="switchTrashSubTab('badges')"
          class="bg-white border ${currentTrashFilter === 'badges' ? 'border-emerald-600 ring-2 ring-emerald-600/10' : 'border-[#e2e8f0]'} rounded-xl p-3.5 shadow-sm cursor-pointer hover:border-emerald-400 transition-all">
          <div class="flex items-center justify-between text-[#64748b]">
            <span class="text-[10px] font-mono font-bold uppercase tracking-wider">Badges</span>
            <span class="text-xs">🏷️</span>
          </div>
          <h3 class="text-xl font-black text-emerald-600 font-mono mt-1">${deletedBadges.length}</h3>
          <p class="text-[9px] text-emerald-600 font-medium">Dynamic Tags</p>
        </div>

      </div>

      <!-- Controls & Search -->
      <div class="bg-white border border-[#e2e8f0] rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        
        <!-- Filter Tabs -->
        <div class="flex items-center space-x-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <button type="button" onclick="switchTrashSubTab('all')"
            class="px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer whitespace-nowrap ${currentTrashFilter === 'all' ? 'bg-blue-600 text-white shadow-sm' : 'bg-[#f8fafc] text-[#475569] hover:bg-[#f1f5f9] border border-[#e2e8f0]'}">
            All Items (${totalCount})
          </button>
          <button type="button" onclick="switchTrashSubTab('products')"
            class="px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer whitespace-nowrap ${currentTrashFilter === 'products' ? 'bg-blue-600 text-white shadow-sm' : 'bg-[#f8fafc] text-[#475569] hover:bg-[#f1f5f9] border border-[#e2e8f0]'}">
            📦 Products (${deletedProducts.length})
          </button>
          <button type="button" onclick="switchTrashSubTab('categories')"
            class="px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer whitespace-nowrap ${currentTrashFilter === 'categories' ? 'bg-purple-600 text-white shadow-sm' : 'bg-[#f8fafc] text-[#475569] hover:bg-[#f1f5f9] border border-[#e2e8f0]'}">
            📁 Categories (${deletedCategories.length})
          </button>
          <button type="button" onclick="switchTrashSubTab('brands')"
            class="px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer whitespace-nowrap ${currentTrashFilter === 'brands' ? 'bg-amber-600 text-white shadow-sm' : 'bg-[#f8fafc] text-[#475569] hover:bg-[#f1f5f9] border border-[#e2e8f0]'}">
            🏢 Brands (${deletedBrands.length})
          </button>
          <button type="button" onclick="switchTrashSubTab('badges')"
            class="px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer whitespace-nowrap ${currentTrashFilter === 'badges' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-[#f8fafc] text-[#475569] hover:bg-[#f1f5f9] border border-[#e2e8f0]'}">
            🏷️ Badges (${deletedBadges.length})
          </button>
        </div>

        <!-- Search Bar -->
        <div class="relative w-full md:w-80">
          <input type="text" id="trash-search-input" value="${trashSearchQuery}" placeholder="Search deleted items, SKU, slug..."
            oninput="handleTrashSearch(this.value)"
            class="w-full pl-9 pr-4 py-2 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-[#0f172a] placeholder-[#94a3b8] focus:border-blue-600 focus:outline-none font-semibold text-xs">
          <svg class="w-4 h-4 text-[#94a3b8] absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          ${trashSearchQuery ? `
            <button onclick="handleTrashSearch(''); document.getElementById('trash-search-input').value='';" class="absolute right-3 top-2.5 text-[#94a3b8] hover:text-[#0f172a]">
              ✕
            </button>
          ` : ''}
        </div>

      </div>

      <!-- Main Trash Table -->
      <div class="bg-white border border-[#e2e8f0] rounded-2xl shadow-sm overflow-hidden">
        ${items.length === 0 ? `
          <div class="p-12 text-center space-y-3">
            <div class="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center text-2xl">
              ✨
            </div>
            <h3 class="text-base font-extrabold text-[#0f172a]">Trash Bin is Clean</h3>
            <p class="text-xs text-[#64748b] max-w-md mx-auto">
              ${trashSearchQuery ? 'No deleted records matched your search query.' : 'There are currently no deleted products, categories, brands, or badges in the vault.'}
            </p>
            ${trashSearchQuery ? `
              <button onclick="handleTrashSearch(''); document.getElementById('trash-search-input').value='';" class="px-3.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 font-bold text-xs border border-blue-200">
                Clear Search Filter
              </button>
            ` : ''}
          </div>
        ` : `
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs text-[#475569]">
              <thead class="bg-[#f8fafc] uppercase font-bold text-[10px] tracking-wider text-[#64748b] border-b border-[#e2e8f0]">
                <tr>
                  <th class="py-3.5 px-4">Item Details</th>
                  <th class="py-3.5 px-4">Module Type</th>
                  <th class="py-3.5 px-4">Identifier / SKU</th>
                  <th class="py-3.5 px-4">Current Status</th>
                  <th class="py-3.5 px-4 text-right">Recovery & Purge Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#e2e8f0]">
                ${items.map(item => `
                  <tr class="hover:bg-[#f8fafc] transition-colors">
                    
                    <!-- Item Info -->
                    <td class="py-3.5 px-4">
                      <div class="flex items-center space-x-3">
                        ${item.image ? `
                          <img src="${item.image}" class="w-10 h-10 object-cover rounded-lg bg-white border border-[#e2e8f0] flex-shrink-0">
                        ` : `
                          <div class="w-10 h-10 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] flex items-center justify-center text-lg flex-shrink-0">
                            ${item.typeIcon}
                          </div>
                        `}
                        <div class="min-w-0">
                          <p class="font-bold text-[#0f172a] text-xs truncate max-w-xs sm:max-w-md">${item.name}</p>
                          <p class="text-[10px] text-[#64748b] line-clamp-1 mt-0.5">${item.extraInfo}</p>
                        </div>
                      </div>
                    </td>

                    <!-- Module Type -->
                    <td class="py-3.5 px-4">
                      <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${item.typeBadgeClass}">
                        ${item.typeIcon} ${item.typeLabel}
                      </span>
                    </td>

                    <!-- Identifier / Code -->
                    <td class="py-3.5 px-4">
                      <span class="font-mono text-[10px] text-[#0f172a] font-semibold bg-[#f8fafc] border border-[#e2e8f0] px-2 py-0.5 rounded">
                        ${item.code}
                      </span>
                    </td>

                    <!-- Status -->
                    <td class="py-3.5 px-4">
                      <span class="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-extrabold uppercase bg-rose-50 text-rose-700 border border-rose-200">
                        DELETED
                      </span>
                    </td>

                    <!-- Actions -->
                    <td class="py-3.5 px-4 text-right">
                      <div class="flex items-center justify-end space-x-2">
                        
                        <!-- Restore Button -->
                        <button type="button" onclick="handleRestoreTrashItem('${item.type}', '${item.id}')"
                          title="Restore back to ACTIVE status"
                          class="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold transition-all flex items-center space-x-1 shadow-xs active:scale-95 cursor-pointer">
                          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                          <span>Restore</span>
                        </button>

                        <!-- Permanent Delete Button -->
                        <button type="button" onclick="confirmPermanentDeleteTrashItem('${item.type}', '${item.id}', '${escapeHtml(item.name)}')"
                          title="Permanently Delete (Irreversible)"
                          class="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all flex items-center space-x-1 shadow-xs active:scale-95 cursor-pointer">
                          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                          <span>Permanent Delete</span>
                        </button>

                      </div>
                    </td>

                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>

    </div>
  `;

  // Update sidebar counter
  updateTrashSidebarBadge();
}

/**
 * Switch Sub-tab Filter in Trash Bin
 */
export function switchTrashSubTab(filter) {
  currentTrashFilter = filter;
  renderTrashBinTab();
}

/**
 * Handle Real-time Search Input
 */
export function handleTrashSearch(query) {
  trashSearchQuery = query || '';
  renderTrashBinTab();
}

/**
 * Handle Item Restoration
 */
export async function handleRestoreTrashItem(type, id) {
  try {
    let res = null;
    let name = 'Item';

    if (type === 'product') {
      res = await restoreProduct(id);
      name = res?.product?.name || 'Product';
    } else if (type === 'category') {
      res = await restoreCategory(id);
      name = res?.category?.name || 'Category';
    } else if (type === 'brand') {
      res = await restoreBrand(id);
      name = res?.brand?.name || 'Brand';
    } else if (type === 'badge') {
      res = await restoreBadge(id);
      name = res?.badge?.name || 'Badge';
    }

    showToast(`"${name}" restored successfully and returned to ACTIVE catalog.`, 'success');
    renderTrashBinTab();
  } catch (err) {
    showToast(`Failed to restore item: ${err.message}`, 'error');
  }
}

/**
 * Confirm and Permanently Purge a Single Item
 */
export function confirmPermanentDeleteTrashItem(type, id, itemName) {
  const modalContainer = document.getElementById('admin-modal-container');
  if (!modalContainer) return;

  modalContainer.innerHTML = `
    <div class="fixed inset-0 bg-[#0f172a]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#e2e8f0] space-y-4 animate-in fade-in zoom-in duration-200">
        <div class="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center text-xl font-bold mx-auto">
          ⚠️
        </div>
        <div class="text-center space-y-1.5">
          <h3 class="text-lg font-extrabold text-[#0f172a]">Permanent Data Purge</h3>
          <p class="text-xs text-[#64748b]">
            Are you sure you want to permanently delete <strong>"${itemName}"</strong>?
          </p>
          <div class="p-3 bg-rose-50 border border-rose-200 rounded-xl text-[11px] text-rose-800 text-left space-y-1">
            <p class="font-bold">⚠️ Warning: Irreversible Action</p>
            <p>This will permanently purge this record and unlink any associated catalog products. This action cannot be undone.</p>
          </div>
        </div>

        <div class="flex items-center justify-end space-x-2.5 pt-2">
          <button type="button" onclick="closeAdminModal()"
            class="px-4 py-2 rounded-xl bg-[#f8fafc] hover:bg-[#f1f5f9] text-[#475569] font-bold text-xs border border-[#e2e8f0]">
            Cancel
          </button>
          <button type="button" onclick="executePermanentDelete('${type}', '${id}')"
            class="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm">
            Yes, Permanently Delete
          </button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Execute Permanent Deletion
 */
export async function executePermanentDelete(type, id) {
  const modalContainer = document.getElementById('admin-modal-container');
  if (modalContainer) modalContainer.innerHTML = '';

  try {
    if (type === 'product') {
      await permanentlyDeleteProduct(id);
    } else if (type === 'category') {
      await permanentlyDeleteCategory(id);
    } else if (type === 'brand') {
      await permanentlyDeleteBrand(id);
    } else if (type === 'badge') {
      await permanentlyDeleteBadge(id);
    }

    showToast(`Record was permanently purged from database.`, 'info');
    renderTrashBinTab();
  } catch (err) {
    showToast(`Permanent deletion error: ${err.message}`, 'error');
  }
}

/**
 * Confirm and Empty All Trash
 */
export function confirmEmptyAllTrash() {
  const totalCount = getTrashTotalCount();
  if (totalCount === 0) return;

  const modalContainer = document.getElementById('admin-modal-container');
  if (!modalContainer) return;

  modalContainer.innerHTML = `
    <div class="fixed inset-0 bg-[#0f172a]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#e2e8f0] space-y-4 animate-in fade-in zoom-in duration-200">
        <div class="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center text-xl font-bold mx-auto">
          🚨
        </div>
        <div class="text-center space-y-1.5">
          <h3 class="text-lg font-extrabold text-[#0f172a]">Empty Entire Trash Vault</h3>
          <p class="text-xs text-[#64748b]">
            You are about to permanently purge all <strong>${totalCount}</strong> soft-deleted records from the system.
          </p>
          <div class="p-3 bg-rose-50 border border-rose-200 rounded-xl text-[11px] text-rose-800 text-left space-y-1">
            <p class="font-bold">⚠️ Irreversible Bulk Purge</p>
            <p>All deleted products, categories, brands, and badges will be purged permanently from MySQL database.</p>
          </div>
        </div>

        <div class="flex items-center justify-end space-x-2.5 pt-2">
          <button type="button" onclick="closeAdminModal()"
            class="px-4 py-2 rounded-xl bg-[#f8fafc] hover:bg-[#f1f5f9] text-[#475569] font-bold text-xs border border-[#e2e8f0]">
            Cancel
          </button>
          <button type="button" onclick="executeEmptyAllTrash()"
            class="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm">
            Empty All Trash
          </button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Execute Empty All Trash
 */
export async function executeEmptyAllTrash() {
  const modalContainer = document.getElementById('admin-modal-container');
  if (modalContainer) modalContainer.innerHTML = '';

  const prods = getDeletedProducts();
  const cats = getDeletedCategories();
  const brds = getDeletedBrands();
  const bdgs = getDeletedBadges();

  for (const p of prods) await permanentlyDeleteProduct(p.id);
  for (const c of cats) await permanentlyDeleteCategory(c.id || c.slug);
  for (const b of brds) await permanentlyDeleteBrand(b.id);
  for (const bg of bdgs) await permanentlyDeleteBadge(bg.id);

  showToast(`All ${prods.length + cats.length + brds.length + bdgs.length} records purged from Trash Vault.`, 'info');
  renderTrashBinTab();
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

// Attach globals for inline DOM events
if (typeof window !== 'undefined') {
  window.switchTrashSubTab = switchTrashSubTab;
  window.handleTrashSearch = handleTrashSearch;
  window.handleRestoreTrashItem = handleRestoreTrashItem;
  window.confirmPermanentDeleteTrashItem = confirmPermanentDeleteTrashItem;
  window.executePermanentDelete = executePermanentDelete;
  window.confirmEmptyAllTrash = confirmEmptyAllTrash;
  window.executeEmptyAllTrash = executeEmptyAllTrash;
}
