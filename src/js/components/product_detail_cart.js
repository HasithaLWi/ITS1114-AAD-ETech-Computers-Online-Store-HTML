import { getProductById, products } from '../models/data.js';

export default function renderProductDetails(productId) {
    const container = document.getElementById('product-details-container');
    if (!container) return;

    const product = getProductById(productId);
    if (!product) {
        container.innerHTML = `
      <div class="text-center py-16 bg-[#101722] rounded-lg border border-[#202b3a] space-y-4">
        <h3 class="text-xl font-bold text-white">Product Not Found</h3>
        <p class="text-xs text-[#718096]">The requested product details could not be loaded.</p>
        <a href="#shop" class="inline-block px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-md">Back to Shop Catalog</a>
      </div>
    `;
        return;
    }

    // Calculate discount percentage
    const discountPercent = product.originalPrice > product.price
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0;

    // Get related products in same category
    const relatedProducts = (typeof products !== 'undefined')
        ? products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4)
        : [];

    container.innerHTML = `
    <div class="space-y-8">
      
      <!-- Breadcrumb & Top Bar -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#101722] p-4 rounded-lg border border-[#202b3a]">
        <nav class="flex items-center space-x-2 text-xs font-semibold text-[#718096] flex-wrap">
          <a href="#home" class="hover:text-white transition-colors">Home</a>
          <span>/</span>
          <a href="#shop" class="hover:text-white transition-colors">Shop Catalog</a>
          <span>/</span>
          <a href="#shop?cat=${product.category}" class="hover:text-blue-400 uppercase text-[10px] font-mono transition-colors text-cyan-400">${product.category}</a>
          <span>/</span>
          <span class="text-[#f4f7fb] font-bold truncate max-w-[200px] sm:max-w-[300px]">${product.name}</span>
        </nav>

        <a href="#shop" class="inline-flex items-center space-x-1.5 text-xs font-bold text-[#a7b3c4] hover:text-white bg-[#141c28] px-3.5 py-1.5 rounded-md border border-[#202b3a] transition-all hover:bg-[#192332]">
          <svg class="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
          <span>Back to Catalog</span>
        </a>
      </div>

      <!-- Main Product Details Showcase -->
      <div class="bg-[#101722] border border-[#202b3a] rounded-lg p-6 sm:p-8 shadow-xl">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <!-- Left Column: Product Image Gallery & Badges -->
          <div class="lg:col-span-5 space-y-4">
            <div class="relative rounded-lg bg-[#080b12] p-4 border border-[#202b3a] overflow-hidden flex items-center justify-center min-h-[300px] sm:min-h-[380px] group shadow-inner">
              <img id="product-detail-main-img" src="${product.image}" alt="${product.name}" class="w-full h-full object-cover rounded-md transition-transform duration-300 group-hover:scale-105">
              
              ${product.badge ? `
                <span class="absolute top-3 left-3 bg-blue-600 text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded shadow-md">
                  ${product.badge}
                </span>
              ` : ''}

              <span class="absolute bottom-3 right-3 bg-[#101722]/90 backdrop-blur-md text-emerald-400 text-xs font-bold px-2.5 py-1 rounded-md border border-[#202b3a] flex items-center space-x-1.5 shadow-md">
                <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>${product.inStock ? 'In Stock (Ready to Ship)' : 'Pre-order Available'}</span>
              </span>
            </div>

            <!-- Multi-Image Gallery Thumbnails -->
            ${product.images && product.images.length > 1 ? `
              <div class="flex items-center space-x-2.5 overflow-x-auto pb-1">
                ${product.images.map((img, i) => `
                  <button type="button" onclick="document.getElementById('product-detail-main-img').src='${img}'; document.querySelectorAll('.gallery-thumb-btn').forEach(b => { b.classList.remove('border-blue-500'); b.classList.add('border-[#202b3a]'); }); this.classList.remove('border-[#202b3a]'); this.classList.add('border-blue-500');" class="gallery-thumb-btn w-14 h-14 rounded-md overflow-hidden bg-[#080b12] border-2 ${i === 0 ? 'border-blue-500' : 'border-[#202b3a]'} transition-all hover:scale-105 flex-shrink-0 shadow-sm">
                    <img src="${img}" class="w-full h-full object-cover">
                  </button>
                `).join('')}
              </div>
            ` : ''}

            <!-- Meta Information Pills -->
            <div class="grid grid-cols-2 gap-2.5 text-xs">
              <div class="bg-[#080b12] p-3 rounded-md border border-[#202b3a] space-y-0.5">
                <span class="text-[#718096] uppercase font-bold text-[10px] tracking-wider block">SKU Code</span>
                <span class="text-blue-400 font-mono font-extrabold text-xs">${product.sku || `ETC-PROD-${product.id}`}</span>
              </div>
              <div class="bg-[#080b12] p-3 rounded-md border border-[#202b3a] space-y-0.5">
                <span class="text-[#718096] uppercase font-bold text-[10px] tracking-wider block">Warranty</span>
                <span class="text-[#f4f7fb] font-semibold truncate block text-xs" title="${product.warranty}">${product.warranty ? product.warranty : 'Standard Warranty'}</span>
              </div>
            </div>
          </div>

          <!-- Right Column: Product Overview, Specs, Purchasing -->
          <div class="lg:col-span-7 space-y-5">
            
            <!-- Category & Rating Header -->
            <div>
              <div class="flex items-center space-x-3 text-xs mb-2">
                <span class="px-2.5 py-0.5 rounded bg-blue-600/15 text-cyan-400 border border-blue-500/30 uppercase font-bold font-mono tracking-wider text-[10px]">
                  ${product.category}
                </span>
                <div class="flex items-center space-x-1.5 bg-[#080b12] px-2.5 py-0.5 rounded border border-[#202b3a]">
                  <span class="text-amber-400 text-sm">★</span>
                  <span class="font-bold text-white text-xs">${product.rating}</span>
                  <span class="text-[#718096] text-[11px]">(${product.reviews} reviews)</span>
                </div>
              </div>

              <h1 class="text-2xl sm:text-3xl font-extrabold text-white leading-tight tracking-tight">${product.name}</h1>
            </div>

            <!-- Price Highlight Box -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-md bg-[#080b12] border border-[#202b3a] gap-2.5">
              <div>
                <span class="text-[10px] text-[#718096] block uppercase tracking-wider font-semibold">Verified Retail Price</span>
                <div class="flex items-baseline space-x-2.5">
                  <span class="text-2xl sm:text-3xl font-black text-white font-mono">Rs. ${product.price.toLocaleString()}</span>
                  ${product.originalPrice > product.price ? `
                    <span class="text-sm text-[#718096] line-through font-mono">Rs. ${product.originalPrice.toLocaleString()}</span>
                  ` : ''}
                </div>
              </div>
              ${discountPercent > 0 ? `
                <span class="px-3 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-extrabold text-xs self-start sm:self-center font-mono">
                  SAVE Rs. ${(product.originalPrice - product.price).toLocaleString()} (${discountPercent}% OFF)
                </span>
              ` : ''}
            </div>

            <!-- Product Description Paragraph -->
            <div class="space-y-1">
              <h3 class="text-[10px] font-bold uppercase tracking-widest text-[#718096]">Product Overview</h3>
              <p class="text-xs text-[#a7b3c4] leading-relaxed font-normal">
                ${product.fullDescription || product.description}
              </p>
            </div>

            <!-- Technical Specifications Table Grid -->
            ${product.specs ? `
              <div class="space-y-2">
                <h3 class="text-[10px] font-bold uppercase tracking-widest text-cyan-400 flex items-center space-x-1.5">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"/></svg>
                  <span>Full Hardware Specifications</span>
                </h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-[#080b12] p-3 rounded-md border border-[#202b3a] text-xs">
                  ${Object.entries(product.specs).map(([label, val]) => `
                    <div class="p-2.5 rounded bg-[#101722] border border-[#202b3a]">
                      <span class="text-[9px] font-bold uppercase text-[#718096] block mb-0.5">${label}</span>
                      <span class="font-semibold text-slate-200 leading-snug block">${val}</span>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}

            <!-- Key Features List -->
            ${product.features && product.features.length > 0 ? `
              <div class="space-y-2">
                <h3 class="text-[10px] font-bold uppercase tracking-widest text-blue-400 flex items-center space-x-1.5">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                  <span>Key Performance Highlights</span>
                </h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#a7b3c4]">
                  ${product.features.map(feat => `
                    <div class="flex items-start space-x-2 bg-[#080b12] p-2.5 rounded-md border border-[#202b3a]">
                      <span class="text-blue-400 font-bold">✓</span>
                      <span class="font-medium">${feat}</span>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}

            <!-- Regional Branch Stock Availability -->
            <div class="space-y-2">
              <h3 class="text-[10px] font-bold uppercase tracking-widest text-emerald-400 flex items-center space-x-1.5">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                <span>Branch Stock Availability</span>
              </h3>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#080b12] p-2.5 rounded-md border border-[#202b3a] text-xs">
                ${product.branchStock ? Object.entries(product.branchStock).map(([bId, qty]) => {
                  const bNames = { "BR-COL": "Colombo", "BR-GAL": "Galle", "BR-MAT": "Matara", "BR-KND": "Kandy" };
                  const name = bNames[bId] || bId;
                  return `
                    <div class="p-2 rounded bg-[#101722] border border-[#202b3a] text-center space-y-0.5">
                      <span class="text-[9px] font-bold text-[#718096] block">${name}</span>
                      <span class="font-extrabold text-xs font-mono ${qty > 0 ? 'text-emerald-400' : 'text-rose-400'}">${qty > 0 ? `${qty} in stock` : 'Out of stock'}</span>
                    </div>
                  `;
                }).join('') : `
                  <div class="col-span-4 p-2 text-center text-[#718096] text-xs">In stock at main warehouse</div>
                `}
              </div>
            </div>

            <!-- Quantity Selector & Action Buttons -->
            <div class="pt-4 border-t border-[#202b3a] space-y-3.5">
              <div class="flex items-center space-x-3">
                <span class="text-xs font-bold uppercase tracking-wider text-[#718096]">Select Quantity:</span>
                <div class="flex items-center space-x-1.5 bg-[#080b12] p-1 rounded-md border border-[#202b3a]">
                  <button onclick="changeProductQuantity(-1)" class="w-7 h-7 rounded bg-[#141c28] hover:bg-[#192332] text-white font-bold flex items-center justify-center transition-colors">
                    -
                  </button>
                  <span id="product-quantity-display" class="w-8 text-center text-xs font-bold text-white font-mono">1</span>
                  <button onclick="changeProductQuantity(1)" class="w-7 h-7 rounded bg-[#141c28] hover:bg-[#192332] text-white font-bold flex items-center justify-center transition-colors">
                    +
                  </button>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button onclick="handleAddToCartFromDetails(${product.id})" class="w-full py-3 px-5 bg-[#141c28] hover:bg-[#192332] text-white rounded-md font-bold text-xs shadow-sm border border-[#202b3a] transition-all flex items-center justify-center space-x-2">
                  <svg class="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                  <span>Add to Shopping Cart</span>
                </button>

                <button onclick="handleBuyNowFromDetails(${product.id})" class="w-full py-3 px-5 bg-blue-600 hover:bg-blue-500 text-white rounded-md font-bold text-xs shadow-sm transition-all flex items-center justify-center space-x-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                  <span>Buy Now (Express Checkout)</span>
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>

      <!-- Related Products Section -->
      ${relatedProducts.length > 0 ? `
        <div class="space-y-4 pt-4">
          <div class="flex items-center justify-between border-b border-[#202b3a] pb-3">
            <div>
              <h3 class="text-lg font-bold text-white tracking-tight">Related ${product.category.toUpperCase()} Hardware</h3>
              <p class="text-xs text-[#718096] mt-0.5">Explore similar high-performance equipment in our catalog</p>
            </div>
            <a href="#shop?cat=${product.category}" class="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center space-x-1">
              <span>View All</span>
              <span>→</span>
            </a>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            ${relatedProducts.map(rel => `
              <div onclick="viewProductDetails(${rel.id})" class="group rounded-lg bg-[#101722] border border-[#202b3a] hover:border-[#34445a] p-3.5 flex flex-col justify-between cursor-pointer transition-all duration-200 hover:-translate-y-0.5 shadow-md">
                <div>
                  <div class="relative overflow-hidden rounded-md bg-[#080b12] mb-2.5 h-36 flex items-center justify-center border border-[#202b3a]">
                    <img src="${rel.image}" alt="${rel.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
                  </div>
                  <span class="text-[9px] font-bold uppercase text-cyan-400 font-mono tracking-wider">${rel.category}</span>
                  <h4 class="text-xs font-bold text-white mt-1 line-clamp-1 group-hover:text-blue-400 transition-colors">${rel.name}</h4>
                </div>
                <div class="mt-3 pt-2.5 border-t border-[#202b3a] flex items-center justify-between">
                  <p class="text-sm font-extrabold text-white font-mono">Rs. ${rel.price}</p>
                  <span class="text-[11px] font-bold text-blue-400 group-hover:underline">View Specs →</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

    </div>
  `;
}