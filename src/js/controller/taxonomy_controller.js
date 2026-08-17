// ============================================================
//  taxonomy_controller.js — Categories & Badges Management Controller
// ============================================================
import { 
  getCategories, saveCategory, deleteCategory, getCategoryBySlug,
  getBadges, saveBadge, deleteBadge, getBadgeById,
  runAutoBadgeAssignment, getBadgeColorClass, getBadgeThresholdSummary,
  getProductBehaviorHistory, recordProductBehaviorEvent
} from '../models/taxonomy_data.js';
import { getStoredProducts, saveStoredProducts } from '../models/data.js';
import { closeAdminModal, switchAdminTab } from './admin_dashboard_controller.js';
import { showToast } from './cart_controller.js';

/**
 * ============================================================
 * TAB: CATEGORIES & BADGES (TAXONOMY MANAGEMENT)
 * ============================================================
 */
export function renderTaxonomyTab() {
  const container = document.getElementById('tab-panel-taxonomy');
  if (!container) return;

  const categories = getCategories();
  const badges = getBadges();
  const products = getStoredProducts();
  const history = getProductBehaviorHistory();

  // Metrics computation
  const totalCategories = categories.length;
  const featuredCategoriesCount = categories.filter(c => c.featured).length;
  const totalBadges = badges.length;
  const activeBadgesCount = badges.filter(b => b.isActive).length;
  const autoRulesCount = badges.filter(b => b.ruleType === 'automatic' && b.isActive).length;
  const productsWithBadgesCount = products.filter(p => p.badge && p.badge.trim() !== '').length;
  const badgeCoveragePct = products.length > 0 ? Math.round((productsWithBadgesCount / products.length) * 100) : 0;

  // Build product count map per category
  const categoryCounts = {};
  categories.forEach(c => { categoryCounts[c.slug] = 0; });
  products.forEach(p => {
    const cat = (p.category || '').toLowerCase();
    if (categoryCounts[cat] !== undefined) categoryCounts[cat]++;
    else categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  // Build product count map per badge
  const badgeCounts = {};
  badges.forEach(b => { badgeCounts[b.name.toLowerCase()] = 0; });
  products.forEach(p => {
    if (p.badge) {
      const bName = p.badge.toLowerCase();
      badgeCounts[bName] = (badgeCounts[bName] || 0) + 1;
    }
  });

  container.innerHTML = `
    <div class="space-y-6">
      
      <!-- ── Top Header Banner with Action Buttons ────────────── -->
      <div class="bg-[#101722] border border-[#202b3a] rounded-lg p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center space-x-2.5">
            <div class="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-sm">
              🏷️
            </div>
            <div>
              <h2 class="text-lg font-extrabold text-white">Categories & Badges Management</h2>
              <p class="text-xs text-[#718096]">Control store categorization hierarchy, dynamic visual tags, and automated behavior reach rules with customizable thresholds.</p>
            </div>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2.5">
          <button onclick="runAutoBadgeAssigner()" title="Evaluate & Auto-Assign Badges to Products"
            class="px-3.5 py-2 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-all flex items-center space-x-1.5 shadow-sm active:scale-95">
            <span>⚡ Run Auto-Assigner</span>
          </button>

          <button onclick="openCategoryModal()"
            class="px-3.5 py-2 rounded-lg bg-[#141c28] hover:bg-[#1a2434] text-white border border-[#202b3a] hover:border-blue-500/50 text-xs font-bold transition-all flex items-center space-x-1.5 shadow-sm">
            <span>+ Add Category</span>
          </button>

          <button onclick="openBadgeModal()"
            class="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center space-x-1.5 shadow-sm shadow-blue-600/20">
            <span>+ Add Badge</span>
          </button>
        </div>
      </div>

      <!-- ── Overview Summary KPI Metrics Row ─────────────────── -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-[#101722] border border-[#202b3a] rounded-lg p-4 shadow-sm">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-bold text-[#718096] uppercase tracking-wider">Active Categories</span>
            <span class="text-xs">📂</span>
          </div>
          <h3 class="text-2xl font-extrabold text-white mt-1 font-mono">${totalCategories}</h3>
          <p class="text-[10px] text-cyan-400 font-semibold mt-1">${featuredCategoriesCount} Featured on Storefront</p>
        </div>

        <div class="bg-[#101722] border border-[#202b3a] rounded-lg p-4 shadow-sm">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-bold text-[#718096] uppercase tracking-wider">Badge Tags</span>
            <span class="text-xs">🏷️</span>
          </div>
          <h3 class="text-2xl font-extrabold text-white mt-1 font-mono">${totalBadges}</h3>
          <p class="text-[10px] text-emerald-400 font-semibold mt-1">${activeBadgesCount} Enabled (${autoRulesCount} Auto Rules)</p>
        </div>

        <div class="bg-[#101722] border border-[#202b3a] rounded-lg p-4 shadow-sm">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-bold text-[#718096] uppercase tracking-wider">Catalog Badge Coverage</span>
            <span class="text-xs">🎯</span>
          </div>
          <h3 class="text-2xl font-extrabold text-white mt-1 font-mono">${badgeCoveragePct}%</h3>
          <p class="text-[10px] text-blue-400 font-semibold mt-1">${productsWithBadgesCount} of ${products.length} Products Tagged</p>
        </div>

        <div class="bg-[#101722] border border-[#202b3a] rounded-lg p-4 shadow-sm">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-bold text-[#718096] uppercase tracking-wider">Behavior History Log</span>
            <span class="text-xs">📜</span>
          </div>
          <h3 class="text-2xl font-extrabold text-white mt-1 font-mono">${history.length}</h3>
          <p class="text-[10px] text-purple-400 font-semibold mt-1">Background Audit Trail Ready</p>
        </div>
      </div>

      <!-- ── Section 1: Categories Management Table ───────────── -->
      <div class="bg-[#101722] border border-[#202b3a] rounded-lg shadow-lg overflow-hidden">
        <div class="p-4 border-b border-[#202b3a] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 class="text-sm font-extrabold text-white flex items-center space-x-2">
              <span>🗂️ Product Categories Directory</span>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/30">${categories.length} Categories</span>
            </h3>
            <p class="text-[11px] text-[#718096] mt-0.5">Primary navigation groupings and filter categories across catalog and shop.</p>
          </div>

          <button onclick="openCategoryModal()" class="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center space-x-1">
            <span>+ Add New Category</span>
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-[#080b12] border-b border-[#202b3a] text-[10px] uppercase font-bold text-[#718096] tracking-wider">
                <th class="py-3 px-4">Category Name & Icon</th>
                <th class="py-3 px-4">Slug / Key</th>
                <th class="py-3 px-4">Description</th>
                <th class="py-3 px-4 text-center">Featured Storefront</th>
                <th class="py-3 px-4 text-center">Product Count</th>
                <th class="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#202b3a] text-xs">
              ${categories.map(c => {
                const count = categoryCounts[c.slug] || 0;
                return `
                  <tr class="hover:bg-[#141c28]/60 transition-colors">
                    <td class="py-3 px-4 font-bold text-white flex items-center space-x-2">
                      <span class="text-base">${c.icon || '📦'}</span>
                      <span>${c.name}</span>
                    </td>
                    <td class="py-3 px-4 font-mono text-[11px] text-cyan-400">
                      ${c.slug}
                    </td>
                    <td class="py-3 px-4 max-w-xs text-[11px] text-[#a7b3c4] truncate" title="${c.description || ''}">
                      ${c.description || '<span class="italic text-[#718096]">No description provided</span>'}
                    </td>
                    <td class="py-3 px-4 text-center">
                      ${c.featured 
                        ? `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30">★ Featured</span>`
                        : `<span class="text-[#718096] text-[10px]">Standard</span>`}
                    </td>
                    <td class="py-3 px-4 text-center">
                      <span class="px-2.5 py-1 rounded-full text-xs font-mono font-extrabold ${count > 0 ? 'bg-blue-600/15 text-blue-300 border border-blue-500/30' : 'bg-[#141c28] text-[#718096] border border-[#202b3a]'}">
                        ${count} Products
                      </span>
                    </td>
                    <td class="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                      <button onclick="openCategoryModal('${c.slug}')" title="Edit Category"
                        class="px-2.5 py-1 bg-[#141c28] hover:bg-[#1a2434] text-blue-400 hover:text-blue-300 rounded text-xs font-bold border border-[#202b3a] transition-colors">
                        Edit
                      </button>
                      <button onclick="confirmDeleteCategory('${c.slug}')" title="Delete Category"
                        class="px-2.5 py-1 bg-rose-950/30 hover:bg-rose-900/50 text-rose-300 rounded text-xs font-bold border border-rose-900/40 transition-colors">
                        Delete
                      </button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- ── Section 2: Badges & Auto-Reach Rules Table ────────── -->
      <div class="bg-[#101722] border border-[#202b3a] rounded-lg shadow-lg overflow-hidden">
        <div class="p-4 border-b border-[#202b3a] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 class="text-sm font-extrabold text-white flex items-center space-x-2">
              <span>🏷️ Storefront Badges & Automated Behavioral Reach Rules</span>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">${badges.length} Badges</span>
            </h3>
            <p class="text-[11px] text-[#718096] mt-0.5">Define visual highlight labels and automated threshold rules triggered by live store metrics.</p>
          </div>

          <div class="flex items-center space-x-2">
            <button onclick="runAutoBadgeAssigner()"
              class="px-3 py-1.5 rounded bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-all flex items-center space-x-1">
              <span>⚡ Run Rules Now</span>
            </button>
            <button onclick="openBadgeModal()" class="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center space-x-1">
              <span>+ Add New Badge</span>
            </button>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-[#080b12] border-b border-[#202b3a] text-[10px] uppercase font-bold text-[#718096] tracking-wider">
                <th class="py-3 px-4">Badge Title & Style</th>
                <th class="py-3 px-4">Purpose / Intent</th>
                <th class="py-3 px-4">Active Standard Rule & Thresholds</th>
                <th class="py-3 px-4 text-center">Rule Type</th>
                <th class="py-3 px-4 text-center">Applied Products</th>
                <th class="py-3 px-4 text-center">Status</th>
                <th class="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#202b3a] text-xs">
              ${badges.map(b => {
                const colorClass = getBadgeColorClass(b.color);
                const count = badgeCounts[b.name.toLowerCase()] || 0;
                const thresholdSummary = getBadgeThresholdSummary(b);
                return `
                  <tr class="hover:bg-[#141c28]/60 transition-colors ${!b.isActive ? 'opacity-50' : ''}">
                    <td class="py-3 px-4">
                      <div class="flex items-center space-x-2.5">
                        <span class="px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider border shadow-sm ${colorClass}">
                          ${b.name}
                        </span>
                      </div>
                    </td>
                    <td class="py-3 px-4 max-w-xs text-[11px] text-[#a7b3c4]">
                      ${b.purpose || '<span class="italic text-[#718096]">No description provided</span>'}
                    </td>
                    <td class="py-3 px-4 text-[11px]">
                      <div class="space-y-0.5">
                        <span class="font-semibold text-[#f4f7fb]">${thresholdSummary}</span>
                        <span class="block text-[9px] font-mono text-[#718096]">Criteria: ${b.criteria || 'custom'} | Priority: ${b.priority || 10}</span>
                      </div>
                    </td>
                    <td class="py-3 px-4 text-center">
                      ${b.ruleType === 'automatic'
                        ? `<span class="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">⚡ Automatic</span>`
                        : `<span class="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-purple-500/10 text-purple-300 border border-purple-500/30">✋ Manual</span>`}
                    </td>
                    <td class="py-3 px-4 text-center">
                      <span class="px-2.5 py-1 rounded-full text-xs font-mono font-extrabold ${count > 0 ? 'bg-blue-600/15 text-blue-300 border border-blue-500/30' : 'bg-[#141c28] text-[#718096] border border-[#202b3a]'}">
                        ${count} Products
                      </span>
                    </td>
                    <td class="py-3 px-4 text-center">
                      ${b.isActive 
                        ? `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">Active</span>`
                        : `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">Disabled</span>`}
                    </td>
                    <td class="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                      <button onclick="openBadgeModal('${b.id}')" title="Edit Badge Rule & Thresholds"
                        class="px-2.5 py-1 bg-[#141c28] hover:bg-[#1a2434] text-blue-400 hover:text-blue-300 rounded text-xs font-bold border border-[#202b3a] transition-colors">
                        Edit
                      </button>
                      <button onclick="confirmDeleteBadge('${b.id}')" title="Delete Badge"
                        class="px-2.5 py-1 bg-rose-950/30 hover:bg-rose-900/50 text-rose-300 rounded text-xs font-bold border border-rose-900/40 transition-colors">
                        Delete
                      </button>
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

/**
 * Run Automated Badge Assignment Engine and Show Live Feedback Toast
 */
export function runAutoBadgeAssigner() {
  const result = runAutoBadgeAssignment();
  renderTaxonomyTab();

  if (result.updatedCount > 0) {
    showToast(`⚡ Auto-Assigner Complete: Updated ${result.updatedCount} product badges based on behavior standards!`);
  } else {
    showToast(`✓ All ${result.totalEvaluated} products already comply with active badge behavior standards.`);
  }
}

/**
 * ============================================================
 * CATEGORY MODALS & CRUD HANDLERS
 * ============================================================
 */
export function openCategoryModal(slug = null) {
  const modal = document.getElementById('admin-modal-container');
  if (!modal) return;

  const category = slug ? getCategoryBySlug(slug) : null;
  const isEdit = Boolean(category);

  modal.innerHTML = `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#080b12]/80 backdrop-blur-sm animate-fadeIn">
      <div class="bg-[#101722] border border-[#202b3a] rounded-xl p-6 max-w-md w-full space-y-4 shadow-2xl">
        <div class="flex items-center justify-between border-b border-[#202b3a] pb-3">
          <h3 class="text-base font-extrabold text-white flex items-center space-x-2">
            <span>${isEdit ? '✏️ Edit Category' : '➕ Add New Category'}</span>
          </h3>
          <button onclick="closeAdminModal()" class="text-[#718096] hover:text-white text-lg">&times;</button>
        </div>

        <form onsubmit="handleSaveCategorySubmit(event, ${isEdit})" class="space-y-3.5 text-xs">
          <div>
            <label class="block text-[#a7b3c4] font-bold mb-1">Category Title *</label>
            <input type="text" id="modal-cat-name" required value="${category ? category.name : ''}"
              placeholder="e.g. Mechanical Keyboards"
              class="w-full px-3 py-2 rounded-md bg-[#080b12] border border-[#202b3a] text-white focus:border-blue-500">
          </div>

          <div class="grid grid-cols-3 gap-3">
            <div class="col-span-2">
              <label class="block text-[#a7b3c4] font-bold mb-1">Slug / URL Key *</label>
              <input type="text" id="modal-cat-slug" required value="${category ? category.slug : ''}"
                placeholder="e.g. keyboards"
                class="w-full px-3 py-2 rounded-md bg-[#080b12] border border-[#202b3a] text-cyan-400 font-mono focus:border-blue-500">
            </div>
            <div>
              <label class="block text-[#a7b3c4] font-bold mb-1">Icon / Emoji</label>
              <input type="text" id="modal-cat-icon" value="${category ? category.icon : '📦'}"
                placeholder="⌨️"
                class="w-full px-3 py-2 rounded-md bg-[#080b12] border border-[#202b3a] text-center text-base text-white focus:border-blue-500">
            </div>
          </div>

          <div>
            <label class="block text-[#a7b3c4] font-bold mb-1">Category Description & Scope</label>
            <textarea id="modal-cat-desc" rows="2"
              placeholder="Describe what products belong in this category..."
              class="w-full px-3 py-2 rounded-md bg-[#080b12] border border-[#202b3a] text-white focus:border-blue-500">${category ? category.description : ''}</textarea>
          </div>

          <div class="flex items-center space-x-2 pt-1">
            <input type="checkbox" id="modal-cat-featured" ${category && category.featured ? 'checked' : ''}
              class="rounded bg-[#080b12] border-[#202b3a] text-blue-600 focus:ring-0">
            <label for="modal-cat-featured" class="text-xs text-[#a7b3c4] font-semibold cursor-pointer">
              Feature category on Storefront homepage & quick filters
            </label>
          </div>

          <input type="hidden" id="modal-cat-id" value="${category ? category.id : ''}">

          <div class="pt-3 border-t border-[#202b3a] flex items-center justify-end space-x-2.5">
            <button type="button" onclick="closeAdminModal()"
              class="px-4 py-2 bg-[#141c28] hover:bg-[#192332] text-[#a7b3c4] rounded-md font-bold border border-[#202b3a] transition-colors">
              Cancel
            </button>
            <button type="submit"
              class="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md font-bold shadow-sm transition-colors">
              ${isEdit ? 'Save Category' : 'Create Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
}

export function handleSaveCategorySubmit(event, isEdit = false) {
  event.preventDefault();

  const id = document.getElementById('modal-cat-id').value;
  const name = document.getElementById('modal-cat-name').value.trim();
  const slug = document.getElementById('modal-cat-slug').value.trim();
  const icon = document.getElementById('modal-cat-icon').value.trim() || '📦';
  const description = document.getElementById('modal-cat-desc').value.trim();
  const featured = document.getElementById('modal-cat-featured').checked;

  if (!name || !slug) {
    alert('Category name and slug are required.');
    return;
  }

  saveCategory({
    id: id || undefined,
    name,
    slug,
    icon,
    description,
    featured
  }, isEdit);

  closeAdminModal();
  renderTaxonomyTab();
  showToast(`✓ Category "${name}" saved successfully.`);
}

export function confirmDeleteCategory(slug) {
  const category = getCategoryBySlug(slug);
  if (!category) return;

  const products = getStoredProducts();
  const linkedCount = products.filter(p => (p.category || '').toLowerCase() === slug.toLowerCase()).length;

  let confirmMsg = `Are you sure you want to delete the category "${category.name}"?`;
  if (linkedCount > 0) {
    confirmMsg += `\n\n⚠️ Warning: ${linkedCount} product(s) are currently assigned to this category.`;
  }

  if (confirm(confirmMsg)) {
    deleteCategory(slug);
    renderTaxonomyTab();
    showToast(`✓ Category "${category.name}" removed.`);
  }
}

/**
 * ============================================================
 * BADGE MODALS & CRUD HANDLERS (WITH DYNAMIC THRESHOLD EDITOR)
 * ============================================================
 */

// Active cached badge for modal threshold rendering
let currentEditingBadge = null;

export function openBadgeModal(badgeId = null) {
  const modal = document.getElementById('admin-modal-container');
  if (!modal) return;

  const badge = badgeId ? getBadgeById(badgeId) : null;
  const isEdit = Boolean(badge);
  currentEditingBadge = badge;

  const colors = [
    { value: 'blue', label: 'Blue (Bestseller)', class: 'text-blue-400' },
    { value: 'rose', label: 'Rose / Red (Hot Deal / Alert)', class: 'text-rose-400' },
    { value: 'emerald', label: 'Emerald Green (New Arrival)', class: 'text-emerald-400' },
    { value: 'amber', label: 'Amber / Gold (Top Rated)', class: 'text-amber-400' },
    { value: 'purple', label: 'Purple (Staff Pick)', class: 'text-purple-400' },
    { value: 'cyan', label: 'Cyan (Popular)', class: 'text-cyan-400' },
    { value: 'orange', label: 'Orange (Clearance)', class: 'text-orange-400' }
  ];

  modal.innerHTML = `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#080b12]/80 backdrop-blur-sm animate-fadeIn">
      <div class="bg-[#101722] border border-[#202b3a] rounded-xl p-6 max-w-lg w-full space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between border-b border-[#202b3a] pb-3">
          <h3 class="text-base font-extrabold text-white flex items-center space-x-2">
            <span>${isEdit ? '🏷️ Edit Badge & Rule Criteria' : '➕ Add Product Badge'}</span>
          </h3>
          <button onclick="closeAdminModal()" class="text-[#718096] hover:text-white text-lg">&times;</button>
        </div>

        <form onsubmit="handleSaveBadgeSubmit(event, ${isEdit})" class="space-y-3.5 text-xs">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-[#a7b3c4] font-bold mb-1">Badge Display Title *</label>
              <input type="text" id="modal-bdg-name" required value="${badge ? badge.name : ''}"
                placeholder="e.g. Pro Choice"
                class="w-full px-3 py-2 rounded-md bg-[#080b12] border border-[#202b3a] text-white focus:border-blue-500 font-bold">
            </div>

            <div>
              <label class="block text-[#a7b3c4] font-bold mb-1">Color Theme Preset *</label>
              <select id="modal-bdg-color" required
                class="w-full px-3 py-2 rounded-md bg-[#080b12] border border-[#202b3a] text-white focus:border-blue-500 font-medium">
                ${colors.map(c => `
                  <option value="${c.value}" ${badge && badge.color === c.value ? 'selected' : ''}>
                    ${c.label}
                  </option>
                `).join('')}
              </select>
            </div>
          </div>

          <div>
            <label class="block text-[#a7b3c4] font-bold mb-1">Badge Purpose & Explanation</label>
            <input type="text" id="modal-bdg-purpose" value="${badge ? badge.purpose : ''}"
              placeholder="e.g. Highlights top-tier products chosen by our certified architects."
              class="w-full px-3 py-2 rounded-md bg-[#080b12] border border-[#202b3a] text-white focus:border-blue-500">
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-[#a7b3c4] font-bold mb-1">Assignment Rule Type *</label>
              <select id="modal-bdg-ruletype" onchange="updateBadgeThresholdsUI()" required
                class="w-full px-3 py-2 rounded-md bg-[#080b12] border border-[#202b3a] text-white focus:border-blue-500 font-medium">
                <option value="automatic" ${badge && badge.ruleType === 'automatic' ? 'selected' : ''}>⚡ Automatic (Rule Criteria)</option>
                <option value="manual" ${badge && badge.ruleType === 'manual' ? 'selected' : ''}>✋ Manual (Direct Staff Pick)</option>
              </select>
            </div>

            <div>
              <label class="block text-[#a7b3c4] font-bold mb-1">Trigger Standard Criteria *</label>
              <select id="modal-bdg-criteria" onchange="updateBadgeThresholdsUI()"
                class="w-full px-3 py-2 rounded-md bg-[#080b12] border border-[#202b3a] text-cyan-400 font-mono text-[11px] focus:border-blue-500">
                <option value="discount_gte_10" ${badge && badge.criteria === 'discount_gte_10' ? 'selected' : ''}>Price Markdown / Discount</option>
                <option value="rating_gte_48" ${badge && badge.criteria === 'rating_gte_48' ? 'selected' : ''}>Customer Rating & Reviews</option>
                <option value="bestseller" ${badge && badge.criteria === 'bestseller' ? 'selected' : ''}>Sales Champion (Reviews)</option>
                <option value="reviews_gte_40" ${badge && badge.criteria === 'reviews_gte_40' ? 'selected' : ''}>High Popularity (Reviews)</option>
                <option value="low_stock_scarcity" ${badge && badge.criteria === 'low_stock_scarcity' ? 'selected' : ''}>Low Stock Urgency Threshold</option>
                <option value="new_arrival" ${badge && badge.criteria === 'new_arrival' ? 'selected' : ''}>Recent Catalog Release</option>
                <option value="manual_curated" ${badge && badge.criteria === 'manual_curated' ? 'selected' : ''}>Manual Specialist Assignment</option>
                <option value="manual_clearance" ${badge && badge.criteria === 'manual_clearance' ? 'selected' : ''}>Manual Clearance Batch</option>
              </select>
            </div>
          </div>

          <!-- Dynamic Thresholds Configuration Panel -->
          <div id="modal-bdg-thresholds-container" class="p-3.5 rounded-lg bg-[#080b12] border border-[#202b3a] space-y-2.5">
            <!-- Dynamically populated by updateBadgeThresholdsUI() -->
          </div>

          <div>
            <label class="block text-[#a7b3c4] font-bold mb-1">Standard Reach Description</label>
            <input type="text" id="modal-bdg-standard" value="${badge ? badge.standardDescription : ''}"
              placeholder="e.g. Automated: Active price discount reaches specified benchmark."
              class="w-full px-3 py-2 rounded-md bg-[#080b12] border border-[#202b3a] text-white focus:border-blue-500">
          </div>

          <div class="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label class="block text-[#a7b3c4] font-bold mb-1">Rule Priority (Higher runs first)</label>
              <input type="number" id="modal-bdg-priority" value="${badge ? badge.priority : 10}" min="1" max="100"
                class="w-full px-3 py-2 rounded-md bg-[#080b12] border border-[#202b3a] text-white font-mono focus:border-blue-500">
            </div>

            <div class="flex items-center space-x-2 pt-6">
              <input type="checkbox" id="modal-bdg-active" ${!badge || badge.isActive ? 'checked' : ''}
                class="rounded bg-[#080b12] border-[#202b3a] text-blue-600 focus:ring-0">
              <label for="modal-bdg-active" class="text-xs text-[#a7b3c4] font-semibold cursor-pointer">
                Rule Enabled & Active
              </label>
            </div>
          </div>

          <input type="hidden" id="modal-bdg-id" value="${badge ? badge.id : ''}">

          <div class="pt-3 border-t border-[#202b3a] flex items-center justify-end space-x-2.5">
            <button type="button" onclick="closeAdminModal()"
              class="px-4 py-2 bg-[#141c28] hover:bg-[#192332] text-[#a7b3c4] rounded-md font-bold border border-[#202b3a] transition-colors">
              Cancel
            </button>
            <button type="submit"
              class="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md font-bold shadow-sm transition-colors">
              ${isEdit ? 'Save Badge Rule' : 'Create Badge'}
            </button>
          </div>
        </form>
      </div>
    </div>
  `;

  // Render initial threshold inputs based on current criteria
  updateBadgeThresholdsUI();
}

/**
 * Dynamically switches threshold inputs in the badge modal based on selected criteria
 */
export function updateBadgeThresholdsUI() {
  const container = document.getElementById('modal-bdg-thresholds-container');
  const criteriaEl = document.getElementById('modal-bdg-criteria');
  const ruleTypeEl = document.getElementById('modal-bdg-ruletype');
  if (!container || !criteriaEl || !ruleTypeEl) return;

  const criteria = criteriaEl.value;
  const ruleType = ruleTypeEl.value;
  const t = (currentEditingBadge && currentEditingBadge.thresholds) ? currentEditingBadge.thresholds : {};

  if (ruleType === 'manual') {
    container.innerHTML = `
      <div class="flex items-center space-x-2 text-[#718096] text-[11px] py-1">
        <span>✋</span>
        <span>Manual Rule: Assigned by technicians or administrators. No automatic numeric triggers required.</span>
      </div>
    `;
    return;
  }

  switch (criteria) {
    case 'discount_gte_10': {
      const currentDisc = t.discountPct !== undefined ? t.discountPct : 10;
      container.innerHTML = `
        <div class="space-y-1.5">
          <div class="flex items-center justify-between">
            <label class="text-[11px] font-extrabold text-amber-400 uppercase tracking-wider flex items-center space-x-1.5">
              <span>🏷️ Discount Benchmark Threshold (%)</span>
            </label>
            <span class="text-[10px] text-[#718096] font-mono">Triggers on markdown</span>
          </div>
          <div class="flex items-center space-x-2.5">
            <span class="text-xs text-[#a7b3c4] font-bold">Discount ≥</span>
            <input type="number" id="modal-thresh-discount" min="1" max="99" step="1" value="${currentDisc}"
              class="w-24 px-3 py-1.5 rounded-md bg-[#101722] border border-[#202b3a] text-white font-mono text-xs focus:border-amber-400">
            <span class="text-xs text-white font-bold">% off original MSRP</span>
          </div>
          <p class="text-[10px] text-[#718096]">Products with price markdown at or above this percentage will automatically qualify.</p>
        </div>
      `;
      break;
    }

    case 'rating_gte_48': {
      const currentRating = t.minRating !== undefined ? t.minRating : 4.8;
      const currentReviews = t.minReviews !== undefined ? t.minReviews : 50;
      container.innerHTML = `
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <label class="text-[11px] font-extrabold text-amber-400 uppercase tracking-wider flex items-center space-x-1.5">
              <span>⭐ Customer Rating & Review Benchmarks</span>
            </label>
            <span class="text-[10px] text-[#718096] font-mono">Both criteria required</span>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-[10px] text-[#a7b3c4] font-semibold mb-1">Min Star Rating (1.0 - 5.0)</label>
              <div class="flex items-center space-x-1.5">
                <span class="text-amber-400 text-sm">★</span>
                <input type="number" id="modal-thresh-rating" min="1.0" max="5.0" step="0.1" value="${currentRating}"
                  class="w-full px-2.5 py-1.5 rounded-md bg-[#101722] border border-[#202b3a] text-white font-mono text-xs focus:border-amber-400">
              </div>
            </div>
            <div>
              <label class="block text-[10px] text-[#a7b3c4] font-semibold mb-1">Min Verified Reviews Count</label>
              <div class="flex items-center space-x-1.5">
                <span class="text-cyan-400 text-xs">💬</span>
                <input type="number" id="modal-thresh-reviews" min="0" step="1" value="${currentReviews}"
                  class="w-full px-2.5 py-1.5 rounded-md bg-[#101722] border border-[#202b3a] text-white font-mono text-xs focus:border-amber-400">
              </div>
            </div>
          </div>
          <p class="text-[10px] text-[#718096]">Product must have at least ${currentRating} ★ rating AND at least ${currentReviews} customer reviews.</p>
        </div>
      `;
      break;
    }

    case 'bestseller': {
      const currentBestseller = t.minReviews !== undefined ? t.minReviews : 80;
      container.innerHTML = `
        <div class="space-y-1.5">
          <div class="flex items-center justify-between">
            <label class="text-[11px] font-extrabold text-amber-400 uppercase tracking-wider flex items-center space-x-1.5">
              <span>🏆 Sales Champion / Bestseller Threshold</span>
            </label>
            <span class="text-[10px] text-[#718096] font-mono">Volume benchmark</span>
          </div>
          <div class="flex items-center space-x-2.5">
            <span class="text-xs text-[#a7b3c4] font-bold">Total Reviews ≥</span>
            <input type="number" id="modal-thresh-bestseller" min="1" step="1" value="${currentBestseller}"
              class="w-28 px-3 py-1.5 rounded-md bg-[#101722] border border-[#202b3a] text-white font-mono text-xs focus:border-amber-400">
            <span class="text-xs text-white font-semibold">customer reviews</span>
          </div>
          <p class="text-[10px] text-[#718096]">Highlights top sales leaders with high volume verified reviews.</p>
        </div>
      `;
      break;
    }

    case 'reviews_gte_40': {
      const currentPopular = t.minReviews !== undefined ? t.minReviews : 40;
      container.innerHTML = `
        <div class="space-y-1.5">
          <div class="flex items-center justify-between">
            <label class="text-[11px] font-extrabold text-amber-400 uppercase tracking-wider flex items-center space-x-1.5">
              <span>🔥 High Popularity Review Benchmark</span>
            </label>
            <span class="text-[10px] text-[#718096] font-mono">Trending interest</span>
          </div>
          <div class="flex items-center space-x-2.5">
            <span class="text-xs text-[#a7b3c4] font-bold">Customer Reviews ≥</span>
            <input type="number" id="modal-thresh-popular" min="1" step="1" value="${currentPopular}"
              class="w-28 px-3 py-1.5 rounded-md bg-[#101722] border border-[#202b3a] text-white font-mono text-xs focus:border-amber-400">
            <span class="text-xs text-white font-semibold">reviews</span>
          </div>
          <p class="text-[10px] text-[#718096]">Awarded to popular items receiving consistent customer engagement.</p>
        </div>
      `;
      break;
    }

    case 'low_stock_scarcity': {
      const currentStock = t.maxStock !== undefined ? t.maxStock : 5;
      container.innerHTML = `
        <div class="space-y-1.5">
          <div class="flex items-center justify-between">
            <label class="text-[11px] font-extrabold text-amber-400 uppercase tracking-wider flex items-center space-x-1.5">
              <span>⚠️ Low Stock Scarcity Threshold</span>
            </label>
            <span class="text-[10px] text-[#718096] font-mono">Inventory warning</span>
          </div>
          <div class="flex items-center space-x-2.5">
            <span class="text-xs text-[#a7b3c4] font-bold">Total Available Stock ≤</span>
            <input type="number" id="modal-thresh-stock" min="1" max="100" step="1" value="${currentStock}"
              class="w-24 px-3 py-1.5 rounded-md bg-[#101722] border border-[#202b3a] text-white font-mono text-xs focus:border-amber-400">
            <span class="text-xs text-white font-semibold">units in warehouse</span>
          </div>
          <p class="text-[10px] text-[#718096]">Triggers urgency badge when available units drop to or below this count.</p>
        </div>
      `;
      break;
    }

    case 'new_arrival':
      container.innerHTML = `
        <div class="flex items-center space-x-2 text-[#718096] text-[11px] py-1">
          <span>✨</span>
          <span>New Arrival: Automatically tags products added during recent catalog intake batches.</span>
        </div>
      `;
      break;

    default:
      container.innerHTML = `
        <div class="text-[#718096] text-[11px] italic py-1">
          Custom or manual rule assignment.
        </div>
      `;
      break;
  }
}

export function handleSaveBadgeSubmit(event, isEdit = false) {
  event.preventDefault();

  const id = document.getElementById('modal-bdg-id').value;
  const name = document.getElementById('modal-bdg-name').value.trim();
  const color = document.getElementById('modal-bdg-color').value;
  const purpose = document.getElementById('modal-bdg-purpose').value.trim();
  const ruleType = document.getElementById('modal-bdg-ruletype').value;
  const criteria = document.getElementById('modal-bdg-criteria').value;
  let standardDescription = document.getElementById('modal-bdg-standard').value.trim();
  const priority = parseInt(document.getElementById('modal-bdg-priority').value) || 10;
  const isActive = document.getElementById('modal-bdg-active').checked;

  if (!name) {
    alert('Badge title is required.');
    return;
  }

  // Extract threshold numbers based on selected criteria
  const thresholds = {};
  if (ruleType === 'automatic') {
    if (criteria === 'discount_gte_10') {
      const disc = parseFloat(document.getElementById('modal-thresh-discount')?.value);
      thresholds.discountPct = !isNaN(disc) ? disc : 10;
      if (!standardDescription) standardDescription = `Automated: Active price markdown ≥ ${thresholds.discountPct}% off original MSRP.`;
    } else if (criteria === 'rating_gte_48') {
      const r = parseFloat(document.getElementById('modal-thresh-rating')?.value);
      const rev = parseInt(document.getElementById('modal-thresh-reviews')?.value);
      thresholds.minRating = !isNaN(r) ? r : 4.8;
      thresholds.minReviews = !isNaN(rev) ? rev : 50;
      if (!standardDescription) standardDescription = `Automated: Verified rating ≥ ${thresholds.minRating} with minimum ${thresholds.minReviews} reviews.`;
    } else if (criteria === 'bestseller') {
      const rev = parseInt(document.getElementById('modal-thresh-bestseller')?.value);
      thresholds.minReviews = !isNaN(rev) ? rev : 80;
      if (!standardDescription) standardDescription = `Automated: Sales volume & review benchmark satisfied (${thresholds.minReviews} reviews).`;
    } else if (criteria === 'reviews_gte_40') {
      const rev = parseInt(document.getElementById('modal-thresh-popular')?.value);
      thresholds.minReviews = !isNaN(rev) ? rev : 40;
      if (!standardDescription) standardDescription = `Automated: Customer review count ≥ ${thresholds.minReviews}.`;
    } else if (criteria === 'low_stock_scarcity') {
      const st = parseInt(document.getElementById('modal-thresh-stock')?.value);
      thresholds.maxStock = !isNaN(st) ? st : 5;
      if (!standardDescription) standardDescription = `Automated: Total inventory stock ≤ ${thresholds.maxStock} units.`;
    }
  }

  saveBadge({
    id: id || undefined,
    name,
    color,
    purpose,
    ruleType,
    criteria,
    thresholds,
    standardDescription,
    priority,
    isActive
  }, isEdit);

  // Automatically evaluate and re-assign badges to reflect new thresholds
  try {
    runAutoBadgeAssignment();
  } catch (e) {
    console.warn('Auto-assign on badge save failed:', e);
  }

  closeAdminModal();
  renderTaxonomyTab();
  showToast(`✓ Badge "${name}" with customized thresholds saved.`);
}

export function confirmDeleteBadge(badgeId) {
  const badge = getBadgeById(badgeId);
  if (!badge) return;

  if (confirm(`Are you sure you want to delete the badge "${badge.name}"?`)) {
    deleteBadge(badgeId);
    renderTaxonomyTab();
    showToast(`✓ Badge "${badge.name}" removed.`);
  }
}
