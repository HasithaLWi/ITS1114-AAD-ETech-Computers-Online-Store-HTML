import { getProductById, products } from '../js/data.js';

export default function renderProductDetails(productId) {
    const container = document.getElementById('product-details-container');
    if (!container) return;

    const product = getProductById(productId);
    if (!product) {
        container.innerHTML = `
      <div class="text-center py-16 bg-slate-900 rounded-3xl border border-slate-800 space-y-4">
        <h3 class="text-xl font-bold text-white">Product Not Found</h3>
        <p class="text-xs text-slate-400">The requested product details could not be loaded.</p>
        <a href="#shop" class="inline-block px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl">Back to Shop Catalog</a>
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
    <div class="space-y-10">
      
      <!-- Breadcrumb & Top Bar -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800 backdrop-blur-md">
        <nav class="flex items-center space-x-2 text-xs font-semibold text-slate-400 flex-wrap">
          <a href="#home" class="hover:text-white transition-colors">Home</a>
          <span>/</span>
          <a href="#shop" class="hover:text-white transition-colors">Shop Catalog</a>
          <span>/</span>
          <a href="#shop?cat=${product.category}" class="hover:text-blue-400 uppercase text-[11px] transition-colors">${product.category}</a>
          <span>/</span>
          <span class="text-slate-200 font-bold truncate max-w-[200px] sm:max-w-[300px]">${product.name}</span>
        </nav>

        <a href="#shop" class="inline-flex items-center space-x-2 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 px-4 py-2 rounded-xl border border-slate-700/60 transition-all hover:bg-slate-700">
          <svg class="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
          <span>Back to Catalog</span>
        </a>
      </div>

      <!-- Main Product Details Showcase -->
      <div class="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-md">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          <!-- Left Column: Product Image Gallery & Badges -->
          <div class="lg:col-span-5 space-y-4">
            <div class="relative rounded-2xl bg-slate-950 p-6 border border-slate-800 overflow-hidden flex items-center justify-center min-h-[320px] sm:min-h-[420px] group shadow-inner">
              <img id="product-detail-main-img" src="${product.image}" alt="${product.name}" class="w-full h-full object-cover rounded-xl transition-transform duration-500 group-hover:scale-105">
              
              ${product.badge ? `
                <span class="absolute top-4 left-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-extrabold uppercase px-3 py-1.5 rounded-full shadow-lg">
                  ${product.badge}
                </span>
              ` : ''}

              <span class="absolute bottom-4 right-4 bg-slate-900/90 backdrop-blur-md text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-700/80 flex items-center space-x-2 shadow-md">
                <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>${product.inStock ? 'In Stock (Ready to Ship)' : 'Pre-order Available'}</span>
              </span>
            </div>

            <!-- Meta Information Pills -->
            <div class="grid grid-cols-2 gap-3 text-xs">
              <div class="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 space-y-0.5">
                <span class="text-slate-500 uppercase font-bold text-[10px] tracking-wider block">SKU Code</span>
                <span class="text-blue-400 font-mono font-extrabold text-sm">${product.sku || `ETC-PROD-${product.id}`}</span>
              </div>
              <div class="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 space-y-0.5">
                <span class="text-slate-500 uppercase font-bold text-[10px] tracking-wider block">Warranty Protection</span>
                <span class="text-slate-200 font-bold truncate block" title="${product.warranty}">${product.warranty ? product.warranty : 'Standard Warranty'}</span>
              </div>
            </div>
          </div>

          <!-- Right Column: Product Overview, Specs, Purchasing -->
          <div class="lg:col-span-7 space-y-6">
            
            <!-- Category & Rating Header -->
            <div>
              <div class="flex items-center space-x-3 text-xs mb-2">
                <span class="px-3 py-1 rounded-full bg-blue-600/10 text-blue-400 border border-blue-500/30 uppercase font-bold tracking-wider text-[10px]">
                  ${product.category}
                </span>
                <div class="flex items-center space-x-1.5 bg-slate-800 px-3 py-1 rounded-xl border border-slate-700">
                  <span class="text-amber-400 text-base">★</span>
                  <span class="font-bold text-white text-sm">${product.rating}</span>
                  <span class="text-slate-400 text-xs">(${product.reviews} customer reviews)</span>
                </div>
              </div>

              <h1 class="text-2xl sm:text-4xl font-black text-white leading-tight tracking-tight">${product.name}</h1>
            </div>

            <!-- Price Highlight Box -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl bg-slate-950/90 border border-slate-800 gap-3">
              <div>
                <span class="text-xs text-slate-400 block uppercase tracking-wider font-semibold">Verified Retail Price</span>
                <div class="flex items-baseline space-x-3">
                  <span class="text-3xl sm:text-4xl font-black text-white">Rs. ${product.price.toLocaleString()}</span>
                  ${product.originalPrice > product.price ? `
                    <span class="text-lg text-slate-500 line-through">Rs. ${product.originalPrice.toLocaleString()}</span>
                  ` : ''}
                </div>
              </div>
              ${discountPercent > 0 ? `
                <span class="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-extrabold text-xs sm:text-sm self-start sm:self-center">
                  SAVE Rs. ${(product.originalPrice - product.price).toLocaleString()} (${discountPercent}% OFF)
                </span>
              ` : ''}
            </div>

            <!-- Product Description Paragraph -->
            <div class="space-y-2">
              <h3 class="text-xs font-extrabold uppercase tracking-widest text-slate-400">Product Overview</h3>
              <p class="text-sm text-slate-300 leading-relaxed font-normal">
                ${product.fullDescription || product.description}
              </p>
            </div>

            <!-- Technical Specifications Table Grid -->
            ${product.specs ? `
              <div class="space-y-3">
                <h3 class="text-xs font-extrabold uppercase tracking-widest text-blue-400 flex items-center space-x-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"/></svg>
                  <span>Full Hardware Specifications</span>
                </h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-slate-950 p-4 rounded-2xl border border-slate-800/80 text-xs">
                  ${Object.entries(product.specs).map(([label, val]) => `
                    <div class="p-3 rounded-xl bg-slate-900/60 border border-slate-800/60">
                      <span class="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">${label}</span>
                      <span class="font-semibold text-slate-200 leading-snug block">${val}</span>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}

            <!-- Key Features List -->
            ${product.features && product.features.length > 0 ? `
              <div class="space-y-2.5">
                <h3 class="text-xs font-extrabold uppercase tracking-widest text-indigo-400 flex items-center space-x-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                  <span>Key Performance & Feature Highlights</span>
                </h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-300">
                  ${product.features.map(feat => `
                    <div class="flex items-start space-x-2.5 bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
                      <span class="text-blue-400 font-bold">✓</span>
                      <span class="font-medium">${feat}</span>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}

            <!-- Regional Branch Stock Availability -->
            <div class="space-y-2.5">
              <h3 class="text-xs font-extrabold uppercase tracking-widest text-emerald-400 flex items-center space-x-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                <span>Branch Stock Availability</span>
              </h3>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-950 p-3 rounded-2xl border border-slate-800 text-xs">
                ${product.branchStock ? Object.entries(product.branchStock).map(([bId, qty]) => {
                  const bNames = { "BR-COL": "Colombo", "BR-GAL": "Galle", "BR-MAT": "Matara", "BR-KND": "Kandy" };
                  const name = bNames[bId] || bId;
                  return `
                    <div class="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-center space-y-0.5">
                      <span class="text-[10px] font-bold text-slate-400 block">${name}</span>
                      <span class="font-extrabold text-sm ${qty > 0 ? 'text-emerald-400' : 'text-rose-400'}">${qty > 0 ? `${qty} in stock` : 'Out of stock'}</span>
                    </div>
                  `;
                }).join('') : `
                  <div class="col-span-4 p-2 text-center text-slate-400 text-xs">In stock at main warehouse</div>
                `}
              </div>
            </div>

            <!-- Quantity Selector & Action Buttons -->
            <div class="pt-6 border-t border-slate-800 space-y-4">
              <div class="flex items-center space-x-4">
                <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Select Quantity:</span>
                <div class="flex items-center space-x-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                  <button onclick="changeProductQuantity(-1)" class="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center transition-colors">
                    -
                  </button>
                  <span id="product-quantity-display" class="w-8 text-center text-sm font-bold text-white">1</span>
                  <button onclick="changeProductQuantity(1)" class="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center transition-colors">
                    +
                  </button>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button onclick="handleAddToCartFromDetails(${product.id})" class="w-full py-4 px-6 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-sm shadow-md border border-slate-700 transition-all flex items-center justify-center space-x-2 group">
                  <svg class="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                  <span>Add to Shopping Cart</span>
                </button>

                <button onclick="handleBuyNowFromDetails(${product.id})" class="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-extrabold text-sm shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center space-x-2 group">
                  <svg class="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                  <span>Buy Now (Proceed to Checkout)</span>
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>

      <!-- Related Products Section -->
      ${relatedProducts.length > 0 ? `
        <div class="space-y-6 pt-6">
          <div class="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 class="text-xl font-black text-white tracking-tight">Related ${product.category.toUpperCase()} Hardware</h3>
              <p class="text-xs text-slate-400 mt-0.5">Explore similar high-performance equipment in our catalog</p>
            </div>
            <a href="#shop?cat=${product.category}" class="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center space-x-1">
              <span>View All ${product.category}</span>
              <span>→</span>
            </a>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            ${relatedProducts.map(rel => `
              <div onclick="viewProductDetails(${rel.id})" class="group rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 p-4 flex flex-col justify-between cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/5">
                <div>
                  <div class="relative overflow-hidden rounded-xl bg-slate-950 mb-3 h-40 flex items-center justify-center">
                    <img src="${rel.image}" alt="${rel.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                  </div>
                  <span class="text-[10px] font-bold uppercase text-slate-400 tracking-wider">${rel.category}</span>
                  <h4 class="text-sm font-bold text-white mt-1 line-clamp-1 group-hover:text-blue-400 transition-colors">${rel.name}</h4>
                </div>
                <div class="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <p class="text-base font-extrabold text-white">Rs. ${rel.price}</p>
                  <span class="text-xs font-bold text-blue-400 group-hover:underline">View Specs →</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

    </div>
  `;
}