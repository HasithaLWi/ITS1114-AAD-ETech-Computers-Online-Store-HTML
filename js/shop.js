// ETech Computers - Shop Page Dynamic Logic

/**
 * Called by app.js router whenever #shop fragment is loaded into DOM
 */
function initShopLogic(queryPart = '') {
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
      if (priceValueDisplay) priceValueDisplay.textContent = `$${parseInt(e.target.value).toLocaleString()}`;
      renderFilteredProducts();
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      if (priceSlider) {
        priceSlider.value = 3000;
        if (priceValueDisplay) priceValueDisplay.textContent = '$3,000';
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
function renderFilteredProducts() {
  const grid = document.getElementById('product-grid');
  const itemCountEl = document.getElementById('item-count');
  const noProductsMsg = document.getElementById('no-products-msg');
  const activeTagsContainer = document.getElementById('active-filter-tags');

  if (!grid || typeof products === 'undefined') return;

  // Extract filter values
  const searchQuery = (document.getElementById('search-input')?.value || '').toLowerCase().trim();
  const selectedCategories = Array.from(document.querySelectorAll('.category-checkbox:checked')).map(cb => cb.value);
  const maxPrice = parseFloat(document.getElementById('price-slider')?.value || 3000);
  const sortBy = document.getElementById('sort-select')?.value || 'featured';

  // 1. Filter logic
  let filtered = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery) || 
                          product.description.toLowerCase().includes(searchQuery);
    
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(product.category);
    
    const matchesPrice = product.price <= maxPrice;

    return matchesSearch && matchesCategory && matchesPrice;
  });

  // 2. Sort logic
  if (sortBy === 'price-low') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-high') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'rating') {
    filtered.sort((a, b) => b.rating - a.rating);
  } else if (sortBy === 'name') {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  }

  // Update item count badge
  if (itemCountEl) itemCountEl.textContent = filtered.length;

  // Show/Hide empty state
  if (filtered.length === 0) {
    grid.innerHTML = '';
    if (noProductsMsg) noProductsMsg.classList.remove('hidden');
    return;
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
      tagsHtml += `<span class="inline-flex items-center space-x-1 text-[11px] font-semibold bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 px-2.5 py-1 rounded-full">Under $${maxPrice}</span>`;
    }
    activeTagsContainer.innerHTML = tagsHtml;
  }

  // Render cards
  grid.innerHTML = filtered.map(product => `
    <div class="group rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 p-4 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:shadow-blue-600/10">
      <div>
        <!-- Product Image & Badge -->
        <div class="relative overflow-hidden rounded-xl bg-slate-950 mb-4 h-52 flex items-center justify-center">
          <img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
          ${product.badge ? `<span class="absolute top-3 left-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full shadow-md">${product.badge}</span>` : ''}
          <span class="absolute top-3 right-3 bg-slate-900/90 text-slate-300 text-[11px] font-bold px-2 py-0.5 rounded-lg border border-slate-700/60 flex items-center space-x-1">
            <span class="text-amber-400">★</span>
            <span>${product.rating}</span>
          </span>
        </div>

        <!-- Meta & Title -->
        <div class="flex items-center justify-between text-[11px] font-bold uppercase text-slate-400 tracking-wider">
          <span>${product.category}</span>
          <span class="text-emerald-400 font-semibold">${product.inStock ? 'In Stock' : 'Pre-order'}</span>
        </div>
        
        <h3 class="text-base font-bold text-white mt-1 line-clamp-1 group-hover:text-blue-400 transition-colors">${product.name}</h3>
        <p class="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">${product.description}</p>
      </div>
      
      <!-- Footer Price & Action -->
      <div class="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
        <div>
          <span class="text-xs text-slate-500 line-through">$${product.originalPrice}</span>
          <p class="text-xl font-extrabold text-white">$${product.price}</p>
        </div>
        
        <button onclick="addToCart(${product.id})" class="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-blue-500/25 active:scale-95 transition-all flex items-center space-x-1.5">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          <span>Add to Cart</span>
        </button>
      </div>
    </div>
  `).join('');
}
