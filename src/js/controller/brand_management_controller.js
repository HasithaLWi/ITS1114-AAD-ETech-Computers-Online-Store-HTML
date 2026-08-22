// ============================================================
//  src/js/controller/brand_management_controller.js — Brands Controller
// ============================================================
import {
  getBrands, getBrandById, getBrandBySlug, saveBrand, deleteBrand,
  toggleBrandFeatured, getBrandProductCount
} from '../models/brand_data.js';
import { getCategories } from '../models/taxonomy_data.js';
import { getStoredProducts } from '../models/data.js';
import { showToast } from './cart_controller.js';
import { switchAdminTab } from './admin_dashboard_controller.js';

let currentEditingBrandId = null;
let brandSearchQuery = '';
let brandFeaturedFilter = 'all';

/**
 * Common Brand Logo Presets for quick-selection
 */
const BRAND_LOGO_PRESETS = [
  { name: 'ASUS', url: 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/asus.svg', country: 'Taiwan', founded: '1989' },
  { name: 'Intel', url: 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/intel.svg', country: 'USA', founded: '1968' },
  { name: 'NVIDIA', url: 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/nvidia.svg', country: 'USA', founded: '1993' },
  { name: 'AMD', url: 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/amd.svg', country: 'USA', founded: '1969' },
  { name: 'Corsair', url: 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/corsair.svg', country: 'USA', founded: '1994' },
  { name: 'Samsung', url: 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/samsung.svg', country: 'South Korea', founded: '1938' },
  { name: 'MSI', url: 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/msi.svg', country: 'Taiwan', founded: '1986' },
  { name: 'Gigabyte', url: 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/gigabyte.svg', country: 'Taiwan', founded: '1986' },
  { name: 'Razer', url: 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/razer.svg', country: 'USA / Singapore', founded: '2005' },
  { name: 'Logitech G', url: 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/logitechg.svg', country: 'Switzerland', founded: '1981' },
  { name: 'HyperX', url: 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/hyperx.svg', country: 'USA', founded: '2002' },
  { name: 'Apple', url: 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/apple.svg', country: 'USA', founded: '1976' },
  { name: 'Lian Li', url: 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/lianli.svg', country: 'Taiwan', founded: '1983' },
  { name: 'NZXT', url: 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/nzxt.svg', country: 'USA', founded: '2004' }
];

/**
 * ============================================================
 * 1. RENDER BRANDS TAB OVERVIEW
 * ============================================================
 */
export function renderBrandsTab() {
  const container = document.getElementById('tab-panel-brands');
  if (!container) return;

  const brands = getBrands();
  const allProducts = (typeof getStoredProducts === 'function' ? getStoredProducts() : null) || [];

  // Metrics
  const totalBrands = brands.length;
  const activeBrandsCount = brands.filter(b => b.active !== false).length;
  const featuredBrandsCount = brands.filter(b => b.featured).length;
  const assignedProductsCount = brands.reduce((sum, b) => sum + getBrandProductCount(b.name), 0);

  // Filtered dataset for table
  let filteredBrands = [...brands];

  if (brandSearchQuery.trim()) {
    const q = brandSearchQuery.toLowerCase().trim();
    filteredBrands = filteredBrands.filter(b => 
      b.name.toLowerCase().includes(q) || 
      b.slug.toLowerCase().includes(q) ||
      (b.country && b.country.toLowerCase().includes(q))
    );
  }

  if (brandFeaturedFilter === 'featured') {
    filteredBrands = filteredBrands.filter(b => b.featured);
  } else if (brandFeaturedFilter === 'standard') {
    filteredBrands = filteredBrands.filter(b => !b.featured);
  }

  // Sort by displayOrder
  filteredBrands.sort((a, b) => (a.displayOrder || 99) - (b.displayOrder || 99));

  container.innerHTML = `
    <div class="space-y-6">
      
      <!-- Top Action Bar -->
      <div class="bg-white border border-[#e2e8f0] rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center font-bold text-lg shadow-sm">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
            </div>
            <div>
              <h2 class="text-xl font-extrabold text-[#0f172a] tracking-tight">Hardware Brands Management</h2>
              <p class="text-xs text-[#64748b] mt-0.5">Control partner manufacturers, official logos, origin data, and homepage showcase positioning.</p>
            </div>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2.5">
          <button type="button" onclick="openBrandFormPage(null)"
            class="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center space-x-2 shadow-md hover:shadow-blue-500/20 active:scale-95 cursor-pointer">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            <span>+ Register New Brand</span>
          </button>
        </div>
      </div>

      <!-- KPI Summary Row -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div class="bg-white border border-[#e2e8f0] rounded-2xl p-4 sm:p-5 shadow-sm space-y-1">
          <div class="flex items-center justify-between text-[#64748b]">
            <span class="text-[11px] font-mono font-bold uppercase tracking-wider">Total Brands</span>
            <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
          </div>
          <h3 class="text-2xl font-black text-[#0f172a] font-mono">${totalBrands}</h3>
          <p class="text-[10px] text-emerald-600 font-semibold">${activeBrandsCount} Active Partners</p>
        </div>

        <div class="bg-white border border-[#e2e8f0] rounded-2xl p-4 sm:p-5 shadow-sm space-y-1">
          <div class="flex items-center justify-between text-[#64748b]">
            <span class="text-[11px] font-mono font-bold uppercase tracking-wider">Featured Brands</span>
            <svg class="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
          </div>
          <h3 class="text-2xl font-black text-blue-600 font-mono">${featuredBrandsCount}</h3>
          <p class="text-[10px] text-blue-600 font-semibold">Highlighted on Storefront Home</p>
        </div>

        <div class="bg-white border border-[#e2e8f0] rounded-2xl p-4 sm:p-5 shadow-sm space-y-1">
          <div class="flex items-center justify-between text-[#64748b]">
            <span class="text-[11px] font-mono font-bold uppercase tracking-wider">Catalog Products</span>
            <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
          </div>
          <h3 class="text-2xl font-black text-purple-600 font-mono">${assignedProductsCount}</h3>
          <p class="text-[10px] text-purple-600 font-semibold">Assigned under registered brands</p>
        </div>

        <div class="bg-white border border-[#e2e8f0] rounded-2xl p-4 sm:p-5 shadow-sm space-y-1">
          <div class="flex items-center justify-between text-[#64748b]">
            <span class="text-[11px] font-mono font-bold uppercase tracking-wider">Global Origin</span>
            <svg class="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
          <h3 class="text-2xl font-black text-amber-600 font-mono">6+</h3>
          <p class="text-[10px] text-amber-600 font-semibold">Countries & Global Importers</p>
        </div>

      </div>

      <!-- Filter & Search Controls -->
      <div class="bg-white border border-[#e2e8f0] rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        
        <div class="relative w-full md:w-80">
          <input type="text" id="brand-search-input" value="${brandSearchQuery}" placeholder="Search brand name, origin, keywords..."
            oninput="handleBrandSearch(this.value)"
            class="w-full pl-9 pr-4 py-2 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-[#0f172a] placeholder-[#94a3b8] focus:border-blue-600 focus:outline-none font-semibold">
          <svg class="w-4 h-4 text-[#94a3b8] absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
        </div>

        <div class="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          
          <!-- Featured Filter -->
          <select id="brand-featured-filter" onchange="handleBrandFeaturedFilter(this.value)"
            class="px-3 py-2 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-[#0f172a] font-bold focus:border-blue-600 focus:outline-none">
            <option value="all" ${brandFeaturedFilter === 'all' ? 'selected' : ''}>All Statuses</option>
            <option value="featured" ${brandFeaturedFilter === 'featured' ? 'selected' : ''}>Featured on Home</option>
            <option value="standard" ${brandFeaturedFilter === 'standard' ? 'selected' : ''}>Standard Brands</option>
          </select>

          <!-- Reset Filter Button -->
          ${(brandSearchQuery || brandFeaturedFilter !== 'all') ? `
            <button onclick="resetBrandFilters()" class="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors font-bold flex items-center space-x-1 cursor-pointer" title="Reset Filters">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              <span>Reset</span>
            </button>
          ` : ''}

        </div>

      </div>

      <!-- Brands Grid Table -->
      <div class="bg-white border border-[#e2e8f0] rounded-2xl shadow-sm overflow-hidden">
        
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-[#f8fafc] text-[#64748b] font-mono uppercase text-[10px] tracking-wider border-b border-[#e2e8f0]">
              <tr>
                <th class="py-3.5 px-4">Brand / Logo</th>
                <th class="py-3.5 px-4">Origin & Website</th>
                <th class="py-3.5 px-4 text-center">Store Products</th>
                <th class="py-3.5 px-4 text-center">Featured on Home</th>
                <th class="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#e2e8f0]">
              ${filteredBrands.length === 0 ? `
                <tr>
                  <td colspan="5" class="py-12 text-center text-[#64748b]">
                    <div class="max-w-xs mx-auto space-y-2">
                      <div class="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center mx-auto">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                      </div>
                      <p class="font-bold text-[#0f172a] text-sm">No hardware brands found</p>
                      <p class="text-xs text-[#64748b]">Try adjusting your search terms or register a new brand.</p>
                      <button onclick="openBrandFormPage(null)" class="mt-2 px-3.5 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold">
                        + Register New Brand
                      </button>
                    </div>
                  </td>
                </tr>
              ` : filteredBrands.map(brand => {
                const productCount = getBrandProductCount(brand.name);
                const initials = (brand.name || 'BR').substring(0, 2).toUpperCase();
                return `
                  <tr class="hover:bg-[#f8fafc]/80 transition-colors group">
                    
                    <!-- Brand / Logo Cell -->
                    <td class="py-3 px-4">
                      <div class="flex items-center space-x-3">
                        <div class="w-12 h-12 rounded-xl bg-white border border-[#e2e8f0] p-1.5 flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden">
                          ${brand.logo ? `
                            <img src="${brand.logo}" alt="${brand.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" class="max-h-full max-w-full object-contain">
                            <span style="display:none" class="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 font-extrabold text-xs items-center justify-center border border-blue-200">${initials}</span>
                          ` : `
                            <span class="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 font-extrabold text-xs flex items-center justify-center border border-blue-200">${initials}</span>
                          `}
                        </div>
                        <div>
                          <div class="flex items-center space-x-2">
                            <span class="font-extrabold text-sm text-[#0f172a] group-hover:text-blue-600 transition-colors">${brand.name}</span>
                            ${brand.featured ? `<span class="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 text-[9px] font-mono font-bold">FEATURED</span>` : ''}
                          </div>
                          <p class="text-[11px] text-[#64748b] font-mono">Slug: <span class="text-blue-600 font-semibold">${brand.slug}</span></p>
                        </div>
                      </div>
                    </td>

                    <!-- Origin & Website -->
                    <td class="py-3 px-4">
                      <div class="space-y-0.5">
                        <div class="flex items-center space-x-1 font-semibold text-[#0f172a]">
                          <span>🌍</span>
                          <span>${brand.country || 'Global'}</span>
                          ${brand.founded ? `<span class="text-[10px] text-slate-400 font-mono">(Est. ${brand.founded})</span>` : ''}
                        </div>
                        ${brand.website ? `
                          <a href="${brand.website}" target="_blank" rel="noopener" class="text-[11px] text-blue-600 hover:underline flex items-center space-x-1 font-mono">
                            <span class="truncate max-w-[140px]">${brand.website.replace('https://', '').replace('http://', '')}</span>
                            <svg class="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                          </a>
                        ` : '<span class="text-[11px] text-slate-400">N/A</span>'}
                      </div>
                    </td>

                    <!-- Store Products Count -->
                    <td class="py-3 px-4 text-center">
                      <a href="#shop?brand=${brand.slug}" title="View ${productCount} products in store catalog"
                        class="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg ${productCount > 0 ? 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100' : 'bg-slate-50 text-slate-400 border border-slate-200'} font-mono font-bold transition-all">
                        <span>📦</span>
                        <span>${productCount} items</span>
                      </a>
                    </td>

                    <!-- Featured Toggle -->
                    <td class="py-3 px-4 text-center">
                      <button type="button" onclick="handleToggleBrandFeatured('${brand.id}')"
                        class="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border transition-all ${brand.featured ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'}">
                        ${brand.featured ? '● Featured' : '○ Standard'}
                      </button>
                    </td>

                    <!-- Actions -->
                    <td class="py-3 px-4 text-right whitespace-nowrap">
                      <div class="flex items-center justify-end space-x-1.5">
                        
                        <a href="#shop?brand=${brand.slug}" title="View Brand Catalog in Store"
                          class="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-200">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                        </a>

                        <button type="button" onclick="openBrandFormPage('${brand.id}')" title="Edit Brand Details"
                          class="px-2.5 py-1 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200 flex items-center space-x-1">
                          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                          <span>Edit</span>
                        </button>

                        <button type="button" onclick="handleDeleteBrand('${brand.id}', '${brand.name.replace(/'/g, "\\'")}')" title="Delete Brand"
                          class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        </button>

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

/**
 * ============================================================
 * 2. FULL-PAGE BRAND FORM VIEW (NO MODAL OVERLAY)
 * ============================================================
 */
export function openBrandFormPage(brandId = null) {
  currentEditingBrandId = brandId;
  const brand = brandId ? getBrandById(brandId) : null;
  const categories = getCategories();
  const allProducts = getStoredProducts();

  // Find products associated with this brand
  const associatedProducts = brand ? allProducts.filter(p => {
    const pBrand = (p.brand || '').toLowerCase().trim();
    const bName = brand.name.toLowerCase().trim();
    return pBrand === bName || pBrand.includes(bName);
  }) : [];

  // Hide all tab panels and reveal dedicated brand form panel
  const tabPanels = document.querySelectorAll('.dashboard-tab-panel');
  tabPanels.forEach(panel => panel.classList.add('hidden'));

  const formPanel = document.getElementById('tab-panel-brand-form');
  if (!formPanel) return;
  formPanel.classList.remove('hidden');

  const isEdit = Boolean(brand);

  formPanel.innerHTML = `
    <div class="space-y-6 pb-12">
      
      <!-- Top Action Bar -->
      <div class="bg-white border border-[#e2e8f0] rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-20 backdrop-blur-md bg-white/95">
        
        <div class="flex items-center space-x-3">
          <button type="button" onclick="closeBrandFormPage()"
            class="p-2 rounded-xl bg-[#f8fafc] hover:bg-[#f1f5f9] text-[#0f172a] border border-[#e2e8f0] transition-colors flex items-center justify-center font-bold text-xs shadow-sm cursor-pointer" title="Back to Brands List">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
          </button>
          
          <div>
            <div class="flex items-center space-x-2">
              <span class="text-[10px] font-mono font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200 uppercase">
                ${isEdit ? 'Editing Existing Brand' : 'New Brand Registration'}
              </span>
              ${brand && brand.featured ? `<span class="text-[10px] font-mono font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-200">FEATURED</span>` : ''}
            </div>
            <h2 class="text-xl font-extrabold text-[#0f172a] tracking-tight mt-0.5">
              ${isEdit ? `Edit Brand: ${brand.name}` : 'Register New Hardware Brand'}
            </h2>
            <p class="text-xs text-[#64748b]">Configure official manufacturer profile, high-res logo vector, origin data, and storefront integration.</p>
          </div>
        </div>

        <div class="flex items-center space-x-2.5">
          <button type="button" onclick="closeBrandFormPage()"
            class="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-[#475569] border border-[#e2e8f0] text-xs font-bold transition-all shadow-sm cursor-pointer">
            Cancel
          </button>
          <button type="button" onclick="triggerBrandFormSubmit()"
            class="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md flex items-center space-x-2 active:scale-95 cursor-pointer">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            <span>${isEdit ? 'Save Changes' : 'Register Brand'}</span>
          </button>
        </div>

      </div>

      <!-- Main Form Grid (Dual Column) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        <!-- Left Column: Form Fields (7 Cols) -->
        <div class="lg:col-span-7 space-y-6">
          
          <form id="full-brand-form" onsubmit="handleSaveBrandFormPage(event)" class="space-y-6">
            
            <!-- Section 1: Brand Identity & Origin -->
            <div class="bg-white border border-[#e2e8f0] rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
              <div class="border-b border-[#e2e8f0] pb-3">
                <h3 class="text-xs font-extrabold text-[#0f172a] uppercase tracking-wider flex items-center space-x-2">
                  <span class="w-2 h-2 rounded-full bg-blue-600"></span>
                  <span>1. Brand Identity & Headquarters</span>
                </h3>
                <p class="text-[11px] text-[#64748b] mt-0.5">Core company identification and global headquarters origin.</p>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                
                <div>
                  <label class="block font-bold text-[#0f172a] mb-1">Brand Name *</label>
                  <input type="text" id="bf-brand-name" required value="${brand ? brand.name : ''}" placeholder="e.g. ASUS, Intel, Corsair"
                    oninput="handleBrandNameInput(this.value)"
                    class="w-full px-3.5 py-2 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-[#0f172a] font-bold focus:border-blue-600 focus:outline-none">
                </div>

                <div>
                  <label class="block font-bold text-[#0f172a] mb-1">URL Slug</label>
                  <input type="text" id="bf-brand-slug" value="${brand ? brand.slug : ''}" placeholder="e.g. asus"
                    class="w-full px-3.5 py-2 rounded-xl bg-slate-100 border border-[#e2e8f0] text-blue-600 font-mono font-bold text-xs focus:border-blue-600 focus:outline-none">
                </div>

                <div>
                  <label class="block font-bold text-[#0f172a] mb-1">Country of Origin</label>
                  <input type="text" id="bf-brand-country" value="${brand ? (brand.country || 'USA') : 'Taiwan'}" placeholder="e.g. Taiwan, USA, South Korea, Switzerland"
                    oninput="updateBrandLivePreview()"
                    class="w-full px-3.5 py-2 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-[#0f172a] font-semibold focus:border-blue-600 focus:outline-none">
                </div>

                <div>
                  <label class="block font-bold text-[#0f172a] mb-1">Founded Year</label>
                  <input type="text" id="bf-brand-founded" value="${brand ? (brand.founded || '') : '1989'}" placeholder="e.g. 1989"
                    oninput="updateBrandLivePreview()"
                    class="w-full px-3.5 py-2 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-[#0f172a] font-mono font-bold focus:border-blue-600 focus:outline-none">
                </div>

                <div class="sm:col-span-2">
                  <label class="block font-bold text-[#0f172a] mb-1">Official Website URL</label>
                  <input type="url" id="bf-brand-website" value="${brand ? (brand.website || '') : ''}" placeholder="https://www.asus.com"
                    oninput="updateBrandLivePreview()"
                    class="w-full px-3.5 py-2 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-blue-600 font-mono text-xs focus:border-blue-600 focus:outline-none">
                </div>

                <div class="sm:col-span-2">
                  <label class="block font-bold text-[#0f172a] mb-1">Slogan / Tagline</label>
                  <input type="text" id="bf-brand-tagline" value="${brand ? (brand.tagline || '') : ''}" placeholder="e.g. In Search of Incredible"
                    oninput="updateBrandLivePreview()"
                    class="w-full px-3.5 py-2 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-[#0f172a] font-semibold text-xs focus:border-blue-600 focus:outline-none">
                </div>

              </div>
            </div>

            <!-- Section 2: Logo & Visual Brand Identity -->
            <div class="bg-white border border-[#e2e8f0] rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
              <div class="border-b border-[#e2e8f0] pb-3">
                <h3 class="text-xs font-extrabold text-[#0f172a] uppercase tracking-wider flex items-center space-x-2">
                  <span class="w-2 h-2 rounded-full bg-indigo-600"></span>
                  <span>2. Official Brand Logo</span>
                </h3>
                <p class="text-[11px] text-[#64748b] mt-0.5">High-resolution vector SVG or transparent PNG manufacturer logo.</p>
              </div>

              <div class="space-y-4 text-xs">
                
                <div>
                  <label class="block font-bold text-[#0f172a] mb-1">Logo Image URL (SVG / PNG / WebP)</label>
                  <input type="url" id="bf-brand-logo" value="${brand ? (brand.logo || '') : ''}" placeholder="https://upload.wikimedia.org/.../ASUS_Logo.svg"
                    oninput="updateBrandLivePreview()"
                    class="w-full px-3.5 py-2.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-blue-600 font-mono text-xs focus:border-blue-600 focus:outline-none">
                </div>

                <!-- Quick Presets for Leading Brands -->
                <div>
                  <label class="block text-[10px] font-mono font-bold uppercase text-[#64748b] mb-1.5">Quick-Apply Logo Presets for Top Hardware Brands:</label>
                  <div class="flex flex-wrap gap-1.5">
                    ${BRAND_LOGO_PRESETS.map(preset => `
                      <button type="button" onclick="applyBrandPreset('${preset.name}', '${preset.url}', '${preset.country}', '${preset.founded}')"
                        class="px-2.5 py-1 rounded-lg bg-[#f8fafc] hover:bg-blue-50 hover:text-blue-700 border border-[#e2e8f0] text-[11px] font-semibold transition-all flex items-center space-x-1.5 cursor-pointer">
                        <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                        <span>${preset.name}</span>
                      </button>
                    `).join('')}
                  </div>
                </div>

              </div>
            </div>

            <!-- Section 3: Brand Story & Description -->
            <div class="bg-white border border-[#e2e8f0] rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
              <div class="border-b border-[#e2e8f0] pb-3">
                <h3 class="text-xs font-extrabold text-[#0f172a] uppercase tracking-wider flex items-center space-x-2">
                  <span class="w-2 h-2 rounded-full bg-emerald-600"></span>
                  <span>3. Brand Story & Overview</span>
                </h3>
                <p class="text-[11px] text-[#64748b] mt-0.5">Shown to customers on the brand showcase and product details pages.</p>
              </div>

              <div class="text-xs">
                <label class="block font-bold text-[#0f172a] mb-1">Company Description</label>
                <textarea id="bf-brand-desc" rows="3" placeholder="Describe the brand's engineering specialty, hardware history, and market leadership..."
                  oninput="updateBrandLivePreview()"
                  class="w-full px-3.5 py-2.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-[#0f172a] text-xs font-medium focus:border-blue-600 focus:outline-none leading-relaxed">${brand ? (brand.description || '') : ''}</textarea>
              </div>
            </div>

            <!-- Section 4: Storefront Placement & Visibility -->
            <div class="bg-white border border-[#e2e8f0] rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
              <div class="border-b border-[#e2e8f0] pb-3">
                <h3 class="text-xs font-extrabold text-[#0f172a] uppercase tracking-wider flex items-center space-x-2">
                  <span class="w-2 h-2 rounded-full bg-amber-600"></span>
                  <span>4. Storefront Placement & Visibility</span>
                </h3>
                <p class="text-[11px] text-[#64748b] mt-0.5">Control homepage showcase presence and filter options.</p>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                
                <div class="flex items-center justify-between p-3.5 rounded-xl border border-[#e2e8f0] bg-[#f8fafc]">
                  <div>
                    <span class="font-bold text-[#0f172a] block">Featured on Homepage</span>
                    <span class="text-[11px] text-[#64748b]">Showcase logo on the home page brands strip</span>
                  </div>
                  <input type="checkbox" id="bf-brand-featured" ${brand && brand.featured ? 'checked' : ''} onchange="updateBrandLivePreview()"
                    class="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer">
                </div>

                <div class="flex items-center justify-between p-3.5 rounded-xl border border-[#e2e8f0] bg-[#f8fafc]">
                  <div>
                    <span class="font-bold text-[#0f172a] block">Active Status</span>
                    <span class="text-[11px] text-[#64748b]">Available for catalog filtering & products</span>
                  </div>
                  <input type="checkbox" id="bf-brand-active" ${brand ? (brand.active !== false ? 'checked' : '') : 'checked'} onchange="updateBrandLivePreview()"
                    class="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer">
                </div>

                <div class="sm:col-span-2">
                  <label class="block font-bold text-[#0f172a] mb-1">Display Sort Priority</label>
                  <input type="number" id="bf-brand-order" min="1" max="99" value="${brand ? (brand.displayOrder || 1) : 1}" oninput="updateBrandLivePreview()"
                    class="w-32 px-3 py-2 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-xs font-mono font-bold">
                  <span class="text-[10px] text-[#64748b] ml-2">Lower numbers appear first on storefront.</span>
                </div>

              </div>
            </div>

          </form>

        </div>

        <!-- Right Column: Interactive Live Preview & Connected Products (5 Cols) -->
        <div class="lg:col-span-5 space-y-6 sticky top-24">
          
          <!-- Live Preview Card -->
          <div class="bg-white border border-[#e2e8f0] rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
            <div class="flex items-center justify-between border-b border-[#e2e8f0] pb-3">
              <h3 class="text-xs font-mono font-bold text-[#64748b] uppercase tracking-wider">
                Storefront Live Brand Preview
              </h3>
              <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
                REAL-TIME
              </span>
            </div>

            <!-- Preview Card Container -->
            <div id="brand-live-preview-card" class="space-y-4">
              <!-- Dynamically populated by updateBrandLivePreview() -->
            </div>
          </div>

          <!-- Connected Catalog Products -->
          <div class="bg-white border border-[#e2e8f0] rounded-2xl p-5 sm:p-6 shadow-sm space-y-3">
            <div class="flex items-center justify-between border-b border-[#e2e8f0] pb-3">
              <h3 class="text-xs font-extrabold text-[#0f172a] uppercase tracking-wider flex items-center space-x-1.5">
                <span>📦</span>
                <span>Associated Catalog Products (${associatedProducts.length})</span>
              </h3>
              <span class="text-[10px] font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-bold">
                LIVE CATALOG
              </span>
            </div>

            ${associatedProducts.length === 0 ? `
              <div class="text-center py-6 bg-[#f8fafc] rounded-xl border border-dashed border-[#e2e8f0] text-xs text-[#64748b]">
                No store products currently assigned to this brand.
              </div>
            ` : `
              <div class="max-h-60 overflow-y-auto space-y-2 pr-1 divide-y divide-slate-100">
                ${associatedProducts.map(p => `
                  <div class="pt-2 flex items-center justify-between text-xs">
                    <div class="flex items-center space-x-2.5 min-w-0 flex-1 pr-2">
                      <img src="${p.image}" alt="${p.name}" class="w-8 h-8 rounded-lg bg-white border border-[#e2e8f0] p-0.5 object-contain flex-shrink-0">
                      <div class="min-w-0 flex-1">
                        <h4 class="font-bold text-[#0f172a] truncate" title="${p.name}">${p.name}</h4>
                        <span class="text-[10px] font-mono text-[#64748b]">${p.sku} | Stock: ${p.totalStock}</span>
                      </div>
                    </div>
                    <span class="font-mono font-extrabold text-blue-600 whitespace-nowrap">Rs. ${Number(p.price).toLocaleString()}</span>
                  </div>
                `).join('')}
              </div>
            `}
          </div>

        </div>

      </div>

    </div>
  `;

  // Initial preview render
  updateBrandLivePreview();
}

/**
 * Handle auto-generating slug on brand name typing
 */
export function handleBrandNameInput(name) {
  const slugInput = document.getElementById('bf-brand-slug');
  if (slugInput && name) {
    slugInput.value = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
  }
  updateBrandLivePreview();
}

/**
 * Apply Brand Logo Preset
 */
export function applyBrandPreset(name, url, country, founded) {
  const nameEl = document.getElementById('bf-brand-name');
  const slugEl = document.getElementById('bf-brand-slug');
  const logoEl = document.getElementById('bf-brand-logo');
  const countryEl = document.getElementById('bf-brand-country');
  const foundedEl = document.getElementById('bf-brand-founded');

  if (nameEl && (!nameEl.value || nameEl.value.trim() === '')) nameEl.value = name;
  if (slugEl) slugEl.value = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  if (logoEl) logoEl.value = url;
  if (countryEl) countryEl.value = country;
  if (foundedEl) foundedEl.value = founded;

  updateBrandLivePreview();
}

/**
 * Updates the right-hand live preview card
 */
export function updateBrandLivePreview() {
  const container = document.getElementById('brand-live-preview-card');
  if (!container) return;

  const name = document.getElementById('bf-brand-name')?.value || 'Brand Name';
  const logo = document.getElementById('bf-brand-logo')?.value || '';
  const country = document.getElementById('bf-brand-country')?.value || 'Taiwan';
  const founded = document.getElementById('bf-brand-founded')?.value || '1989';
  const website = document.getElementById('bf-brand-website')?.value || 'https://www.brand.com';
  const tagline = document.getElementById('bf-brand-tagline')?.value || 'Next-Gen Performance Hardware';
  const desc = document.getElementById('bf-brand-desc')?.value || 'Manufacturer of high-performance gaming hardware and components.';
  const featured = document.getElementById('bf-brand-featured')?.checked || false;

  const initials = (name || 'BR').substring(0, 2).toUpperCase();

  container.innerHTML = `
    <div class="bg-gradient-to-br from-slate-900 to-blue-950 text-white rounded-2xl p-5 shadow-xl relative overflow-hidden space-y-4">
      
      <!-- Subtle Glow Effect -->
      <div class="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/20 rounded-full blur-xl pointer-events-none"></div>

      <!-- Top Row: Logo & Featured Status -->
      <div class="flex items-center justify-between relative z-10">
        <div class="w-14 h-14 rounded-xl bg-white p-2 flex items-center justify-center shadow-lg border border-white/20">
          ${logo ? `
            <img src="${logo}" alt="${name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" class="max-h-full max-w-full object-contain">
            <span style="display:none" class="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 font-extrabold text-sm items-center justify-center border border-blue-200">${initials}</span>
          ` : `
            <span class="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 font-extrabold text-sm flex items-center justify-center border border-blue-200">${initials}</span>
          `}
        </div>

        <div class="flex flex-col items-end space-y-1">
          ${featured ? `
            <span class="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-300/30 text-[9px] font-mono font-extrabold uppercase tracking-wider">
              Featured Showcase
            </span>
          ` : `
            <span class="px-2.5 py-0.5 rounded-full bg-white/10 text-slate-300 border border-white/15 text-[9px] font-mono font-bold">
              Standard Brand
            </span>
          `}
          <span class="text-[10px] font-mono text-blue-300">${country} (Est. ${founded})</span>
        </div>
      </div>

      <!-- Name & Slogan -->
      <div class="relative z-10 space-y-1">
        <h4 class="text-lg font-black text-white tracking-tight">${name}</h4>
        <p class="text-xs text-blue-200 font-semibold line-clamp-1 italic">${tagline}</p>
      </div>

      <!-- Description -->
      <p class="text-xs text-slate-300 leading-relaxed line-clamp-2 relative z-10">${desc}</p>

      <!-- Action Link Mockup -->
      <div class="pt-3 border-t border-white/10 flex items-center justify-between text-xs relative z-10">
        <span class="text-[10px] text-slate-400 font-mono truncate max-w-[160px]">${website.replace('https://', '')}</span>
        <span class="font-bold text-blue-300 flex items-center space-x-1">
          <span>Shop ${name}</span>
          <span>→</span>
        </span>
      </div>

    </div>
  `;
}

/**
 * Trigger form submission
 */
export function triggerBrandFormSubmit() {
  const form = document.getElementById('full-brand-form');
  if (form) {
    if (typeof form.requestSubmit === 'function') {
      form.requestSubmit();
    } else {
      form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    }
  } else {
    handleSaveBrandFormPage();
  }
}

/**
 * Close Brand Form Page
 */
export function closeBrandFormPage() {
  const formPanel = document.getElementById('tab-panel-brand-form');
  if (formPanel) formPanel.classList.add('hidden');

  const brandsPanel = document.getElementById('tab-panel-brands');
  if (brandsPanel) brandsPanel.classList.remove('hidden');

  renderBrandsTab();
}

/**
 * Handle Save Brand Form
 */
export function handleSaveBrandFormPage(event) {
  if (event) event.preventDefault();

  const name = document.getElementById('bf-brand-name').value.trim();
  if (!name) {
    showToast('Brand name is required.', 'error');
    return;
  }

  const slug = document.getElementById('bf-brand-slug').value.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const logo = document.getElementById('bf-brand-logo').value.trim();
  const country = document.getElementById('bf-brand-country').value.trim() || 'Global';
  const founded = document.getElementById('bf-brand-founded').value.trim();
  const website = document.getElementById('bf-brand-website').value.trim();
  const tagline = document.getElementById('bf-brand-tagline').value.trim();
  const description = document.getElementById('bf-brand-desc').value.trim();
  const featured = document.getElementById('bf-brand-featured').checked;
  const active = document.getElementById('bf-brand-active').checked;
  const displayOrder = Number(document.getElementById('bf-brand-order').value) || 1;

  const brandData = {
    id: currentEditingBrandId,
    name: name,
    slug: slug,
    logo: logo,
    country: country,
    founded: founded,
    website: website,
    tagline: tagline,
    description: description,
    featured: featured,
    active: active,
    displayOrder: displayOrder
  };

  const result = saveBrand(brandData);
  if (result.success) {
    showToast(result.message, 'success');
    closeBrandFormPage();
  } else {
    showToast(result.message, 'error');
  }
}

/**
 * Filter handlers
 */
export function handleBrandSearch(query) {
  brandSearchQuery = query;
  renderBrandsTab();
}

export function handleBrandFeaturedFilter(status) {
  brandFeaturedFilter = status;
  renderBrandsTab();
}

export function resetBrandFilters() {
  brandSearchQuery = '';
  brandFeaturedFilter = 'all';
  renderBrandsTab();
}

export function handleToggleBrandFeatured(id) {
  const result = toggleBrandFeatured(id);
  if (result.success) {
    showToast(result.message, 'success');
    renderBrandsTab();
  } else {
    showToast(result.message, 'error');
  }
}

export function handleDeleteBrand(id, name) {
  if (!confirm(`Are you sure you want to delete brand "${name}"?`)) return;

  const result = deleteBrand(id);
  if (result.success) {
    showToast(result.message, 'success');
    renderBrandsTab();
  } else {
    showToast(result.message, 'error');
  }
}

// Window Global Bindings
window.renderBrandsTab = renderBrandsTab;
window.openBrandFormPage = openBrandFormPage;
window.closeBrandFormPage = closeBrandFormPage;
window.triggerBrandFormSubmit = triggerBrandFormSubmit;
window.handleSaveBrandFormPage = handleSaveBrandFormPage;
window.handleBrandSearch = handleBrandSearch;
window.handleBrandFeaturedFilter = handleBrandFeaturedFilter;
window.resetBrandFilters = resetBrandFilters;
window.handleToggleBrandFeatured = handleToggleBrandFeatured;
window.handleDeleteBrand = handleDeleteBrand;
window.handleBrandNameInput = handleBrandNameInput;
window.applyBrandPreset = applyBrandPreset;
window.updateBrandLivePreview = updateBrandLivePreview;
