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
      tagsHtml += selectedCategories.map(cat => `<span class="inline-flex items-center space-x-1 text-[11px] font-semibold bg-blue-600/20 text-blue-400 border border-blue-500/30 px-2.5 py-1 rounded-full uppercase">${cat}</span>`).join('');
    }
    if (maxPrice < 3000) {
      tagsHtml += `<span class="inline-flex items-center space-x-1 text-[11px] font-semibold bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 px-2.5 py-1 rounded-full">Under Rs. ${maxPrice}</span>`;
    }
    activeTagsContainer.innerHTML = tagsHtml;
  }

  // Render cards
  grid.innerHTML = filtered.map(product => `
    <div class="group rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 p-4 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:shadow-blue-600/10">
      <div>
        <!-- Product Image & Badge -->
        <div onclick="viewProductDetails(${product.id})" class="relative overflow-hidden rounded-xl bg-slate-950 mb-4 h-52 flex items-center justify-center cursor-pointer">
          <img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
          ${product.badge ? `<span class="absolute top-3 left-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full shadow-md">${product.badge}</span>` : ''}
          <span class="absolute top-3 right-3 bg-slate-900/90 text-slate-300 text-[11px] font-bold px-2 py-0.5 rounded-lg border border-slate-700/60 flex items-center space-x-1">
            <span class="text-amber-400">★</span>
            <span>${product.rating}</span>
          </span>
          <div class="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span class="px-3.5 py-2 rounded-xl bg-blue-600/90 text-white text-xs font-bold shadow-lg flex items-center space-x-1.5 backdrop-blur-md transform translate-y-2 group-hover:translate-y-0 transition-transform">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
              <span>View Details</span>
            </span>
          </div>
        </div>

        <!-- Meta & Title -->
        <div class="flex items-center justify-between text-[11px] font-bold uppercase text-slate-400 tracking-wider">
          <span>${product.category}</span>
          <span class="text-emerald-400 font-semibold">${product.inStock ? 'In Stock' : 'Pre-order'}</span>
        </div>
        
        <h3 onclick="viewProductDetails(${product.id})" class="text-base font-bold text-white mt-1 line-clamp-1 group-hover:text-blue-400 transition-colors cursor-pointer">${product.name}</h3>
        <p class="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">${product.description}</p>
      </div>
      
      <!-- Footer Price & Action -->
      <div class="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
        <div>
          <span class="text-xs text-slate-500 line-through">Rs. ${product.originalPrice}</span>
          <p class="text-xl font-extrabold text-white">Rs. ${product.price}</p>
        </div>
        
        <div class="flex items-center space-x-2">
          <button onclick="viewProductDetails(${product.id})" class="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700/80 transition-all" title="View Product Details">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
          </button>
          
          <button onclick="addToCart(${product.id})" class="px-3.5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-blue-500/25 active:scale-95 transition-all flex items-center space-x-1.5">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

