// ETech Computers - Shop Page Dynamic Logic
import { products } from '../models/data.js';
import { addToCart } from './cart_controller.js';
import { viewProductDetails } from './product-details_controller.js';

/**
 * Called by app.js router whenever #shop fragment is loaded into DOM
 */
export function initShopLogic(queryPart = '') {
  const searchInput = document.getElementById('search-input');
  const categoryCheckboxes = document.querySelectorAll('.category-checkbox');
  const priceSlider = document.getElementById('price-slider');
  const priceValueDisplay = document.getElementById('price-value');
  const sortSelect = document.getElementById('sort-select');
  const resetBtn = document.getElementById('reset-filters-btn');

  // Parse query string (e.g. cat=laptops)
  let initialCategory = '';
  if (queryPart) {
    const params = new URLSearchParams(queryPart);
    initialCategory = params.get('cat');
  }

  if (initialCategory) {
    categoryCheckboxes.forEach(cb => {
      if (cb.value === initialCategory) {
        cb.checked = true;
      }
    });
  }

  // Event Listeners for Live Filtering
  if (searchInput) searchInput.addEventListener('input', renderFilteredProducts);
  if (sortSelect) sortSelect.addEventListener('change', renderFilteredProducts);

  categoryCheckboxes.forEach(cb => {
    cb.addEventListener('change', renderFilteredProducts);
  });

  if (priceSlider) {
    priceSlider.addEventListener('input', (e) => {
      if (priceValueDisplay) priceValueDisplay.textContent = `Rs. ${parseInt(e.target.value).toLocaleString()}`;
      renderFilteredProducts();
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      if (priceSlider) {
        priceSlider.value = 3000;
        if (priceValueDisplay) priceValueDisplay.textContent = 'Rs. 3,000';
      }
      categoryCheckboxes.forEach(cb => cb.checked = false);
      if (sortSelect) sortSelect.value = 'featured';
      renderFilteredProducts();
    });
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

  if (!grid || typeof products === 'undefined') return;

  // Extract filter values
  const searchInput = document.getElementById('search-input');
  const categoryCheckboxes = document.querySelectorAll('.category-checkbox:checked');
  const priceSlider = document.getElementById('price-slider');
  const sortSelect = document.getElementById('sort-select');

  const searchQuery = searchInput ? searchInput.value.toLowerCase().trim() : '';
  const selectedCategories = Array.from(categoryCheckboxes).map(cb => cb.value);
  const maxPrice = priceSlider ? parseInt(priceSlider.value) : 3000;
  const sortOption = sortSelect ? sortSelect.value : 'featured';

  // Apply filters
  let filtered = products.filter(product => {
    // 1. Search Query
    const matchesSearch = searchQuery === '' || 
      product.name.toLowerCase().includes(searchQuery) ||
      product.description.toLowerCase().includes(searchQuery) ||
      product.category.toLowerCase().includes(searchQuery);

    // 2. Category Filter
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(product.category);

    // 3. Price Filter
    const matchesPrice = product.price <= maxPrice;

    return matchesSearch && matchesCategory && matchesPrice;
  });

  // Apply sorting
  if (sortOption === 'price-low') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sortOption === 'price-high') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (sortOption === 'rating') {
    filtered.sort((a, b) => b.rating - a.rating);
  } else if (sortOption === 'name') {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
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

  // Update active filter tags UI
  if (activeTagsContainer) {
    let tagsHtml = '';
    if (selectedCategories.length > 0) {
      tagsHtml += selectedCategories.map(cat => `<span class="inline-flex items-center space-x-1 text-[10px] font-bold bg-[#141c28] text-cyan-400 border border-[#202b3a] px-2 py-0.5 rounded uppercase font-mono">${cat}</span>`).join('');
    }
    if (maxPrice < 3000) {
      tagsHtml += `<span class="inline-flex items-center space-x-1 text-[10px] font-bold bg-[#141c28] text-blue-400 border border-[#202b3a] px-2 py-0.5 rounded font-mono">Under Rs. ${maxPrice}</span>`;
    }
    activeTagsContainer.innerHTML = tagsHtml;
  }

  // Render cards
  grid.innerHTML = filtered.map(product => `
    <div class="group rounded-lg bg-[#101722] border border-[#202b3a] hover:border-[#34445a] p-4 flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 shadow-md">
      <div>
        <!-- Product Image & Badge -->
        <div onclick="viewProductDetails(${product.id})" class="relative overflow-hidden rounded-md bg-[#080b12] mb-3.5 h-44 flex items-center justify-center cursor-pointer border border-[#202b3a]">
          <img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
          ${product.badge ? `<span class="absolute top-2.5 left-2.5 bg-blue-600 text-white text-[9px] font-bold uppercase px-2 py-0.5 rounded shadow-sm">${product.badge}</span>` : ''}
          <span class="absolute top-2.5 right-2.5 bg-[#080b12]/90 text-[#a7b3c4] text-[10px] font-bold px-1.5 py-0.5 rounded border border-[#202b3a] flex items-center space-x-1">
            <span class="text-amber-400">★</span>
            <span>${product.rating}</span>
          </span>
          <div class="absolute inset-0 bg-[#080b12]/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span class="px-3 py-1.5 rounded-md bg-blue-600 text-white text-xs font-bold shadow-md flex items-center space-x-1">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
              <span>View Specs</span>
            </span>
          </div>
        </div>

        <!-- Meta & Title -->
        <div class="flex items-center justify-between text-[10px] font-bold uppercase text-[#718096] font-mono tracking-wider">
          <span class="text-cyan-400">${product.category}</span>
          <span class="${product.inStock ? 'text-emerald-400' : 'text-amber-400'}">${product.inStock ? 'In Stock' : 'Pre-order'}</span>
        </div>
        
        <h3 onclick="viewProductDetails(${product.id})" class="text-sm font-bold text-white mt-1 line-clamp-1 group-hover:text-blue-400 transition-colors cursor-pointer">${product.name}</h3>
        <p class="text-xs text-[#718096] mt-1 line-clamp-2 leading-relaxed">${product.description}</p>
      </div>
      
      <!-- Footer Price & Action -->
      <div class="mt-4 pt-3 border-t border-[#202b3a] flex items-center justify-between">
        <div>
          <span class="text-[10px] text-[#718096] line-through font-mono">Rs. ${product.originalPrice}</span>
          <p class="text-base font-extrabold text-white font-mono">Rs. ${product.price}</p>
        </div>
        
        <div class="flex items-center space-x-1.5">
          <button onclick="viewProductDetails(${product.id})" class="p-2 bg-[#141c28] hover:bg-[#192332] text-[#a7b3c4] hover:text-white rounded-md border border-[#202b3a] transition-all" title="View Product Details">
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
