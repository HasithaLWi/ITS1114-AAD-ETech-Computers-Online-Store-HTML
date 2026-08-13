import { getBranches } from './branch_controller.js';
import { getStoredProducts, saveProduct, deleteProduct, getProductById } from '../models/data.js';
import { getCurrentUser } from './login_controller.js';

/**
 * ============================================================
 * TAB 2: PRODUCT MANAGEMENT (STAFF & ADMIN)
 * ============================================================
 */
export function renderProductsTab() {
  const tbody = document.getElementById('products-tbody');
  if (!tbody) return;

  const products = getStoredProducts();
  const branches = getBranches();
  const activeUser = getCurrentUser();

  const isStaff = activeUser && activeUser.role === 'STAFF';
  const staffBranchId = isStaff ? (activeUser.assignedBranch || 'BR-GAL') : null;
  const staffBranchObj = staffBranchId ? branches.find(b => b.id === staffBranchId) : null;

  // Handle staff banner visibility and text
  const staffBanner = document.getElementById('products-staff-banner');
  const staffBannerText = document.getElementById('products-staff-banner-text');
  const staffBranchBadge = document.getElementById('products-staff-branch-badge');
  if (staffBanner) {
    if (isStaff) {
      staffBanner.classList.remove('hidden');
      if (staffBannerText) {
        staffBannerText.innerHTML = `Logged in as Staff for <strong>${staffBranchObj ? staffBranchObj.name : 'Assigned Branch'}</strong>. You can view all catalog items, but stock edits are scoped to your assigned branch.`;
      }
      if (staffBranchBadge) {
        staffBranchBadge.textContent = `${staffBranchId} Hub`;
      }
    } else {
      staffBanner.classList.add('hidden');
    }
  }

  tbody.innerHTML = products.map(p => `
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
  `).join('');
}

export function confirmDeleteProduct(productId) {
  if (confirm('Are you sure you want to delete this product from inventory?')) {
    deleteProduct(productId);
    renderProductsTab();
  }
}

// ── Dedicated Product Add/Edit Workspace Page ──
export function openProductFormPage(productId = null) {
  const product = productId ? getProductById(productId) : null;
  const branches = getBranches();
  const activeUser = getCurrentUser();

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

  // Populate title & subtitle
  const formTitle = document.getElementById('product-form-title');
  const formSubtitle = document.getElementById('product-form-subtitle');
  if (formTitle) formTitle.textContent = product ? `Edit Product: ${product.name}` : 'Add New Hardware Product';
  if (formSubtitle) formSubtitle.textContent = product ? `SKU: ${product.sku} | ID: #${product.id}` : 'Fill in specifications, multi-image gallery (max 5), pricing, and branch stock.';

  // Populate form submit buttons' text
  const submitBtnText = document.getElementById('form-submit-btn-text');
  const submitBtnSecondary = document.getElementById('form-submit-btn-secondary');
  if (submitBtnText) submitBtnText.textContent = product ? 'Update & Save Product' : 'Publish Product';
  if (submitBtnSecondary) submitBtnSecondary.textContent = product ? 'Save & Publish Changes' : 'Create Product';

  // Set the product ID attribute on the form
  const form = document.getElementById('full-product-form');
  if (form) {
    form.setAttribute('data-product-id', product ? product.id : '');
    // Bind submit action handler
    form.onsubmit = function (e) {
      handleSaveProductSubmit(e);
    };
  }

  // Handle staff banner visibility and text
  const staffBanner = document.getElementById('form-staff-banner');
  const staffBannerText = document.getElementById('form-staff-banner-text');
  if (staffBanner) {
    if (isStaff) {
      staffBanner.classList.remove('hidden');
      if (staffBannerText) {
        staffBannerText.textContent = `Staff Scope Active: You are editing inventory stock for ${staffBranchObj ? staffBranchObj.city : 'your branch'} (${staffBranchId}). Quantities for other branch hubs are locked.`;
      }
    } else {
      staffBanner.classList.add('hidden');
    }
  }

  // Set basic input values
  const nameInput = document.getElementById('form-p-name');
  if (nameInput) nameInput.value = product ? product.name : '';

  const categorySelect = document.getElementById('form-p-category');
  if (categorySelect) categorySelect.value = product ? product.category : 'laptops';

  const badgeSelect = document.getElementById('form-p-badge');
  if (badgeSelect) badgeSelect.value = product && product.badge ? product.badge : 'New Arrival';

  const skuInput = document.getElementById('form-p-sku');
  if (skuInput) skuInput.value = product && product.sku ? product.sku : '';

  const warrantyInput = document.getElementById('form-p-warranty');
  if (warrantyInput) warrantyInput.value = product && product.warranty ? product.warranty : '2-Year Official Warranty';

  const priceInput = document.getElementById('form-p-price');
  if (priceInput) priceInput.value = product ? product.price : '';

  const origPriceInput = document.getElementById('form-p-original-price');
  if (origPriceInput) origPriceInput.value = product && product.originalPrice ? product.originalPrice : '';

  const descInput = document.getElementById('form-p-description');
  if (descInput) descInput.value = product ? product.description : '';

  const fullDescInput = document.getElementById('form-p-full-description');
  if (fullDescInput) fullDescInput.value = product ? product.fullDescription : '';

  // Render branch stock inputs dynamically inside the form
  const branchStocksContainer = document.getElementById('form-branch-stocks-container');
  if (branchStocksContainer) {
    branchStocksContainer.innerHTML = branches.map(b => {
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
    }).join('');
  }

  // Render initial multi-image, specs, and features inputs
  renderFormImageInputs();
  renderFormSpecsInputs();
  renderFormFeaturesInputs();

  // Switch to product form tab
  if (window.switchAdminTab) {
    window.switchAdminTab('product-form');
  }

  // Initial preview update
  setTimeout(() => updateLivePreview(), 50);
}

export function renderFormImageInputs() {
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
        <input type="url" value="${url}" oninput="window.formImagesState[${idx}] = this.value; updateLivePreview();" placeholder="https://..." class="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500 font-mono text-xs">
      </div>

      ${images.length > 1 ? `
        <button type="button" onclick="removeGalleryImageInput(${idx})" class="p-2 rounded-lg bg-rose-950/40 text-rose-400 hover:bg-rose-900/60 transition-colors flex-shrink-0" title="Delete Image">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
        </button>
      ` : ''}
    </div>
  `).join('');
}

export function addGalleryImageInput() {
  if (!window.formImagesState) window.formImagesState = [''];
  if (window.formImagesState.length < 5) {
    window.formImagesState.push('');
    renderFormImageInputs();
    updateLivePreview();
  }
}

export function removeGalleryImageInput(idx) {
  if (window.formImagesState && window.formImagesState.length > 1) {
    window.formImagesState.splice(idx, 1);
    renderFormImageInputs();
    updateLivePreview();
  }
}

// ── Dynamic Specs List Manager ──
export function renderFormSpecsInputs() {
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
}

export function addFormSpecInput() {
  if (!window.formSpecsState) window.formSpecsState = [];
  window.formSpecsState.push({ key: '', value: '' });
  renderFormSpecsInputs();
  updateLivePreview();
}

export function removeFormSpecInput(idx) {
  if (window.formSpecsState && window.formSpecsState.length > 0) {
    window.formSpecsState.splice(idx, 1);
    renderFormSpecsInputs();
    updateLivePreview();
  }
}

// ── Dynamic Features List Manager ──
export function renderFormFeaturesInputs() {
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
}

export function addFormFeatureInput() {
  if (!window.formFeaturesState) window.formFeaturesState = [];
  window.formFeaturesState.push('');
  renderFormFeaturesInputs();
  updateLivePreview();
}

export function removeFormFeatureInput(idx) {
  if (window.formFeaturesState && window.formFeaturesState.length > 0) {
    window.formFeaturesState.splice(idx, 1);
    renderFormFeaturesInputs();
    updateLivePreview();
  }
}

export function triggerProductFormSubmit() {
  const form = document.getElementById('full-product-form');
  if (form) form.requestSubmit();
}

export function updateLivePreview() {
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
}

export function editProduct(productId) {
  openProductFormPage(productId);
}

export function openProductModal(productId = null) {
  openProductFormPage(productId);
}

export function handleSaveProductSubmit(e) {
  e.preventDefault();
  const productIdAttr = e.target.getAttribute('data-product-id');
  const productId = productIdAttr ? parseInt(productIdAttr) : null;
  const branches = getBranches();
  const activeUser = getCurrentUser();
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
  if (window.switchAdminTab) {
    window.switchAdminTab('products');
  }
  renderProductsTab();
}