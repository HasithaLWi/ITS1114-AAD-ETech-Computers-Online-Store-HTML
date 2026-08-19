// ETech Computers - Shop Page Dynamic Logic
import { products, getStoredProducts } from '../models/data.js';
import { addToCart } from './cart_controller.js';
import { viewProductDetails } from './product-details_controller.js';
import { getCategories } from '../models/taxonomy_data.js';

// Module-level state for multi-selected category filters
let selectedCategorySlugs = [];

/**
 * Returns currently selected category slugs
 */
export function getSelectedCategories() {
  return [...selectedCategorySlugs];
}

/**
 * Adds a category slug to the active filter set
 */
export function addCategoryFilter(slug) {
  if (!slug) return;
  const normalizedSlug = slug.toLowerCase().trim();
  if (!selectedCategorySlugs.includes(normalizedSlug)) {
    selectedCategorySlugs.push(normalizedSlug);
  }
  renderCategoryCombobox();
  renderSelectedCategoryTags();
  renderFilteredProducts();
}

/**
 * Removes a category slug from the active filter set
 */
export function removeCategoryFilter(slug) {
  if (!slug) return;
  const normalizedSlug = slug.toLowerCase().trim();
  selectedCategorySlugs = selectedCategorySlugs.filter(s => s !== normalizedSlug);
  renderCategoryCombobox();
  renderSelectedCategoryTags();
  renderFilteredProducts();
}

/**
 * Clears all active category filters
 */
export function clearCategoryFilters() {
  selectedCategorySlugs = [];
  renderCategoryCombobox();
  renderSelectedCategoryTags();
  renderFilteredProducts();
}

/**
 * Populates the category combobox dropdown options
 */
export function renderCategoryCombobox() {
  const combobox = document.getElementById('shop-category-combobox');
  if (!combobox) return;

  const categories = getCategories();
  
  let optionsHtml = `<option value="" disabled selected>+ Select category...</option>`;
  
  categories.forEach(c => {
    const isSelected = selectedCategorySlugs.includes(c.slug.toLowerCase());
    const icon = c.icon ? `${c.icon} ` : '';
    if (isSelected) {
      optionsHtml += `<option value="${c.slug}" disabled class="text-[#94a3b8] bg-[#f8fafc]">${icon}${c.name} ✓ (Selected)</option>`;
    } else {
      optionsHtml += `<option value="${c.slug}" class="text-[#0f172a] bg-white">${icon}${c.name}</option>`;
    }
  });

  combobox.innerHTML = optionsHtml;
  combobox.value = '';
}

/**
 * Renders selected category chips/tags with close '✕' icons underneath the combobox
 */
export function renderSelectedCategoryTags() {
  const tagsContainer = document.getElementById('shop-selected-category-tags');
  const countBadge = document.getElementById('category-selected-badge');
  if (!tagsContainer) return;

  const categories = getCategories();

  if (selectedCategorySlugs.length === 0) {
    if (countBadge) {
      countBadge.classList.add('hidden');
      countBadge.textContent = '0 selected';
    }
    tagsContainer.innerHTML = `<span class="text-[11px] text-[#94a3b8] italic mt-0.5">Showing all categories</span>`;
    return;
  }

  if (countBadge) {
    countBadge.classList.remove('hidden');
    countBadge.textContent = `${selectedCategorySlugs.length} selected`;
  }

  tagsContainer.innerHTML = selectedCategorySlugs.map(slug => {
    const cat = categories.find(c => c.slug.toLowerCase() === slug.toLowerCase());
    const name = cat ? cat.name : slug;
    const icon = cat && cat.icon ? `${cat.icon} ` : '🏷️ ';

    return `
      <span class="inline-flex items-center space-x-1.5 text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-md shadow-sm transition-all hover:bg-blue-100 group">
        <span class="truncate max-w-[130px]" title="${name}">${icon}${name}</span>
        <button type="button" onclick="removeCategoryFilter('${slug}')"
          class="text-blue-600 hover:text-blue-900 hover:bg-blue-200/60 rounded p-0.5 ml-0.5 transition-colors focus:outline-none flex items-center justify-center"
          title="Remove ${name} filter">
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </span>
    `;
  }).join('');
}

/**
 * Called by app.js router whenever #shop fragment is loaded into DOM
 */
export function initShopLogic(queryPart = '') {
  const searchInput = document.getElementById('search-input');
  const priceSlider = document.getElementById('price-slider');
  const priceValueDisplay = document.getElementById('price-value');
  const sortSelect = document.getElementById('sort-select');
  const resetBtn = document.getElementById('reset-filters-btn');
  const combobox = document.getElementById('shop-category-combobox');

  // Parse query string (e.g. cat=laptops or cat=laptops,peripherals)
  let initialCategory = '';
  if (queryPart) {
    const params = new URLSearchParams(queryPart);
    initialCategory = params.get('cat') || '';
  }

  if (initialCategory) {
    selectedCategorySlugs = initialCategory.split(',')
      .map(s => s.trim().toLowerCase())
      .filter(Boolean);
  }

  // Populate combobox and active tags
  renderCategoryCombobox();
  renderSelectedCategoryTags();

  // Event Listeners for Combobox
  if (combobox) {
    combobox.onchange = (e) => {
      const chosenSlug = e.target.value;
      if (chosenSlug) {
        addCategoryFilter(chosenSlug);
      }
    };
  }

  // Event Listeners for Live Filtering
  if (searchInput) {
    searchInput.oninput = renderFilteredProducts;
  }
  if (sortSelect) {
    sortSelect.onchange = renderFilteredProducts;
  }

  if (priceSlider) {
    priceSlider.oninput = (e) => {
      if (priceValueDisplay) priceValueDisplay.textContent = `Rs. ${parseInt(e.target.value).toLocaleString()}`;
      renderFilteredProducts();
    };
  }

  if (resetBtn) {
    resetBtn.onclick = () => {
      if (searchInput) searchInput.value = '';
      if (priceSlider) {
        priceSlider.value = 3000;
        if (priceValueDisplay) priceValueDisplay.textContent = 'Rs. 3,000';
      }
      if (sortSelect) sortSelect.value = 'featured';
      clearCategoryFilters();
    };
  }

  // Initial render
  renderFilteredProducts();
}

/**
 * Filter and sort products, then render the catalog grid
 */
export function renderFilteredProducts() {
  const grid = document.getElementById('product-grid');
  const itemCountEl = document.getElementById('item-count');
  const noProductsMsg = document.getElementById('no-products-msg');
  const activeTagsContainer = document.getElementById('active-filter-tags');

  if (!grid) return;

  const allProducts = (typeof getStoredProducts === 'function' ? getStoredProducts() : null) || products || [];

  // Extract filter values
  const searchInput = document.getElementById('search-input');
  const priceSlider = document.getElementById('price-slider');
  const sortSelect = document.getElementById('sort-select');

  const searchQuery = searchInput ? searchInput.value.toLowerCase().trim() : '';
  const maxPrice = priceSlider ? parseInt(priceSlider.value) : 3000;
  const sortOption = sortSelect ? sortSelect.value : 'featured';

  // Apply filters
  let filtered = allProducts.filter(product => {
    // 1. Search Query
    const matchesSearch = searchQuery === '' || 
      (product.name && product.name.toLowerCase().includes(searchQuery)) ||
      (product.description && product.description.toLowerCase().includes(searchQuery)) ||
      (product.category && product.category.toLowerCase().includes(searchQuery));

    // 2. Category Filter (Multi-select)
    const productCat = (product.category || '').toLowerCase();
    const matchesCategory = selectedCategorySlugs.length === 0 || 
      selectedCategorySlugs.includes(productCat);

    // 3. Price Filter
    const matchesPrice = Number(product.price || 0) <= maxPrice;

    return matchesSearch && matchesCategory && matchesPrice;
  });

  // Apply sorting
  if (sortOption === 'price-low') {
    filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
  } else if (sortOption === 'price-high') {
    filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
  } else if (sortOption === 'rating') {
    filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  } else if (sortOption === 'name') {
    filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }

  // Update item count UI
  if (itemCountEl) itemCountEl.textContent = filtered.length;

  // Toggle empty state message
  if (filtered.length === 0) {
    grid.innerHTML = '';
    if (noProductsMsg) noProductsMsg.classList.remove('hidden');
  } else {
    if (noProductsMsg) noProductsMsg.classList.add('hidden');
  }

  // Update active filter tags UI (Top bar above products)
  if (activeTagsContainer) {
    let tagsHtml = '';
    const categories = getCategories();

    if (selectedCategorySlugs.length > 0) {
      tagsHtml += selectedCategorySlugs.map(slug => {
        const cat = categories.find(c => c.slug.toLowerCase() === slug.toLowerCase());
        const name = cat ? cat.name : slug;
        return `
          <span class="inline-flex items-center space-x-1.5 text-[10px] font-bold bg-[#f1f5f9] text-blue-700 border border-[#e2e8f0] px-2 py-0.5 rounded font-mono shadow-sm">
            <span>${name}</span>
            <button type="button" onclick="removeCategoryFilter('${slug}')" class="text-blue-700 hover:text-red-600 ml-0.5 font-sans" title="Remove filter">✕</button>
          </span>
        `;
      }).join('');
    }
    if (maxPrice < 3000) {
      tagsHtml += `<span class="inline-flex items-center space-x-1 text-[10px] font-bold bg-[#f1f5f9] text-blue-700 border border-[#e2e8f0] px-2 py-0.5 rounded font-mono shadow-sm">Under Rs. ${maxPrice.toLocaleString()}</span>`;
    }
    activeTagsContainer.innerHTML = tagsHtml;
  }

  // Render cards
  grid.innerHTML = filtered.map(product => `
    <div class="group rounded-lg bg-white border border-[#e2e8f0] hover:border-[#cbd5e1] p-4 flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 shadow-sm hover:shadow-md">
      <div>
        <!-- Product Image & Badge -->
        <div onclick="viewProductDetails(${product.id})" class="relative overflow-hidden rounded-md bg-[#f8fafc] mb-3.5 h-44 flex items-center justify-center cursor-pointer border border-[#e2e8f0]">
          <img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
          ${product.badge ? `<span class="absolute top-2.5 left-2.5 bg-blue-600 text-white text-[9px] font-bold uppercase px-2 py-0.5 rounded shadow-sm">${product.badge}</span>` : ''}
          <span class="absolute top-2.5 right-2.5 bg-white/95 text-[#475569] text-[10px] font-bold px-1.5 py-0.5 rounded border border-[#e2e8f0] flex items-center space-x-1 shadow-sm">
            <span class="text-amber-500">★</span>
            <span>${product.rating}</span>
          </span>
          <div class="absolute inset-0 bg-[#0f172a]/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span class="px-3 py-1.5 rounded-md bg-blue-600 text-white text-xs font-bold shadow-md flex items-center space-x-1">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
              <span>View Specs</span>
            </span>
          </div>
        </div>

        <!-- Meta & Title -->
        <div class="flex items-center justify-between text-[10px] font-bold uppercase text-[#64748b] font-mono tracking-wider">
          <span class="text-blue-600">${product.category}</span>
          <span class="${product.inStock ? 'text-emerald-600' : 'text-amber-600'}">${product.inStock ? 'In Stock' : 'Pre-order'}</span>
        </div>
        
        <h3 onclick="viewProductDetails(${product.id})" class="text-sm font-bold text-[#0f172a] mt-1 line-clamp-1 group-hover:text-blue-600 transition-colors cursor-pointer">${product.name}</h3>
        <p class="text-xs text-[#64748b] mt-1 line-clamp-2 leading-relaxed">${product.description}</p>
      </div>
      
      <!-- Footer Price & Action -->
      <div class="mt-4 pt-3 border-t border-[#e2e8f0] flex items-center justify-between">
        <div>
          <span class="text-[10px] text-[#94a3b8] line-through font-mono">Rs. ${product.originalPrice}</span>
          <p class="text-base font-extrabold text-[#0f172a] font-mono">Rs. ${product.price}</p>
        </div>
        
        <div class="flex items-center space-x-1.5">
          <button onclick="viewProductDetails(${product.id})" class="p-2 bg-[#f8fafc] hover:bg-[#f1f5f9] text-[#475569] hover:text-[#0f172a] rounded-md border border-[#e2e8f0] transition-all shadow-sm" title="View Product Details">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
          </button>
          
          <button onclick="addToCart(${product.id})" class="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-md shadow-sm transition-all flex items-center space-x-1">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  `).join('');
}
