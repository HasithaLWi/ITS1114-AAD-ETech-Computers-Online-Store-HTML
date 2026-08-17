import { getProductById, products } from '../models/data.js';
import { getCurrentUser } from '../controller/login_controller.js';
import { getUserReviewForProduct, getProductReviews } from '../models/rating_data.js';

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

    const currentUser = getCurrentUser();
    const userReviewObj = currentUser ? getUserReviewForProduct(product.id, currentUser.id) : null;
    const userRatingValue = userReviewObj ? userReviewObj.rating : 5;
    const productReviews = getProductReviews(product.id);

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
                <a href="#product-reviews-section" class="flex items-center space-x-1.5 bg-[#080b12] hover:bg-[#141c28] px-2.5 py-0.5 rounded border border-[#202b3a] transition-colors cursor-pointer">
                  <span class="text-amber-400 text-sm">★</span>
                  <span class="font-bold text-white text-xs">${product.rating}</span>
                  <span class="text-[#718096] text-[11px]">(${product.reviews} reviews)</span>
                </a>
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

            <!-- Customer Rating & Text Review Form -->
            <div id="product-rating-box" class="p-4 rounded-lg bg-[#080b12] border border-[#202b3a] space-y-3.5 shadow-md">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-bold uppercase tracking-widest text-amber-400 flex items-center space-x-1.5">
                  <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                  <span>Customer Product Review & Rating</span>
                </span>

                ${currentUser ? (
                  userReviewObj ? `
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center space-x-1">
                      <span>✓ Your Review: ${userReviewObj.rating} ★</span>
                    </span>
                  ` : `
                    <span class="text-[10px] text-cyan-400 font-semibold font-mono">Write a Review</span>
                  `
                ) : `
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30">
                    Sign in required
                  </span>
                `}
              </div>

              ${!currentUser ? `
                <!-- Guest View: Disabled form with sign-in prompt -->
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#101722] p-3 rounded-md border border-[#202b3a]">
                  <div class="flex items-center space-x-1 text-[#34445a]">
                    ${[1, 2, 3, 4, 5].map(() => `<span class="text-xl">★</span>`).join('')}
                    <span class="text-xs text-[#718096] ml-2">Sign in to rate and write a text review</span>
                  </div>
                  <a href="#login" class="inline-flex items-center justify-center space-x-1.5 px-3.5 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-sm">
                    <span>Sign In to Review</span>
                    <span>→</span>
                  </a>
                </div>
              ` : `
                <!-- Logged In View: Interactive 5-star rating + text review comment -->
                <div class="bg-[#101722] p-3.5 rounded-md border border-[#202b3a] space-y-3">
                  <div class="flex items-center justify-between flex-wrap gap-2">
                    <div class="flex items-center space-x-1" id="product-rating-stars-group" onmouseleave="resetProductRatingStars(${product.id}, ${userRatingValue})">
                      ${[1, 2, 3, 4, 5].map(starNum => {
                        const isFilled = starNum <= userRatingValue;
                        return `
                          <button type="button"
                            id="rating-star-btn-${starNum}"
                            data-star="${starNum}"
                            onclick="selectRatingStar(${product.id}, ${starNum})"
                            onmouseenter="hoverProductRatingStars(${starNum})"
                            class="star-rating-btn p-1 text-2xl transition-all duration-150 hover:scale-125 focus:outline-none ${isFilled ? 'text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]' : 'text-[#34445a] hover:text-amber-300'}"
                            title="Rate ${starNum} Star${starNum > 1 ? 's' : ''}">
                            ★
                          </button>
                        `;
                      }).join('')}
                    </div>

                    <span id="product-rating-text-hint" class="text-xs font-bold text-amber-400 font-mono">
                      ${userRatingValue > 0 ? `${userRatingValue} / 5 Stars` : 'Click a star to select score'}
                    </span>
                  </div>

                  <!-- Text Review Textarea (Only text, no images) -->
                  <div>
                    <label class="block text-[10px] font-bold text-[#718096] uppercase tracking-wider mb-1">
                      Your Text Review (Experience & Performance)
                    </label>
                    <textarea id="product-review-comment" rows="3"
                      placeholder="Share your hands-on experience, gaming benchmark, or build quality feedback with other customers..."
                      class="w-full px-3 py-2 rounded-md bg-[#080b12] border border-[#202b3a] text-[#f4f7fb] placeholder-[#506075] text-xs focus:border-amber-400 focus:ring-0 transition-colors resize-none">${userReviewObj && userReviewObj.comment ? userReviewObj.comment : ''}</textarea>
                  </div>

                  <!-- Action Buttons -->
                  <div class="flex items-center justify-between pt-1">
                    <span class="text-[11px] text-[#718096]">
                      ${userReviewObj ? '💡 Submitting will update your existing review.' : '⭐ Only verified text reviews are published.'}
                    </span>

                    <button type="button" onclick="handleSubmitProductReview(${product.id})"
                      class="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-md shadow-md transition-all flex items-center space-x-1.5 cursor-pointer">
                      <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                      <span>${userReviewObj ? 'Update Review' : 'Submit Review'}</span>
                    </button>
                  </div>
                </div>
              `}
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

      <!-- Customer Reviews Showcase Section (Bottom of Page - Only this product's reviews) -->
      <div class="space-y-6 pt-6 border-t border-[#202b3a]" id="product-reviews-section">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#202b3a] pb-4">
          <div>
            <h3 class="text-xl font-extrabold text-white tracking-tight flex items-center space-x-2.5">
              <span>💬 Customer Reviews</span>
              <span class="px-2 py-0.5 rounded-full text-xs font-mono bg-blue-500/10 text-cyan-400 border border-blue-500/30 font-bold">${productReviews.length} Reviews</span>
            </h3>
            <p class="text-xs text-[#718096] mt-1">Verified buyer feedback and performance reports specifically for ${product.name}.</p>
          </div>

          <!-- Summary Score Pill -->
          <div class="flex items-center space-x-3 bg-[#101722] p-2.5 px-4 rounded-lg border border-[#202b3a] self-start sm:self-auto">
            <div class="text-amber-400 text-2xl font-black font-mono">★ ${product.rating}</div>
            <div class="text-left border-l border-[#202b3a] pl-3">
              <div class="text-xs font-bold text-white">${product.rating} out of 5.0</div>
              <div class="text-[10px] text-[#718096] font-mono">${product.reviews} Total Ratings</div>
            </div>
          </div>
        </div>

        <!-- Reviews Grid -->
        ${productReviews.length > 0 ? `
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${productReviews.map(rev => {
              const userInitial = rev.userName ? rev.userName.charAt(0).toUpperCase() : 'C';
              const formattedDate = rev.createdAt ? new Date(rev.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Feb 2026';
              const isCurrentUserReview = currentUser && currentUser.id === rev.userId;

              return `
                <div class="bg-[#101722] border ${isCurrentUserReview ? 'border-amber-500/40 bg-[#101722]/90 shadow-lg shadow-amber-500/5' : 'border-[#202b3a]'} rounded-lg p-4 flex flex-col justify-between space-y-3 transition-all hover:border-[#34445a] shadow-md">
                  <div class="space-y-2.5">
                    <div class="flex items-start justify-between">
                      <div class="flex items-center space-x-2.5">
                        <div class="w-8 h-8 rounded-full bg-blue-600/20 text-cyan-400 border border-blue-500/30 flex items-center justify-center font-bold text-xs">
                          ${userInitial}
                        </div>
                        <div>
                          <div class="flex items-center space-x-1.5">
                            <span class="text-xs font-bold text-white">${rev.userName || 'Customer'}</span>
                            ${isCurrentUserReview ? `<span class="text-[9px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.2 rounded font-bold">You</span>` : ''}
                          </div>
                          <span class="text-[10px] text-emerald-400 flex items-center space-x-1">
                            <span>✓ Verified Buyer</span>
                          </span>
                        </div>
                      </div>

                      <!-- Review Star Score & Date -->
                      <div class="text-right">
                        <div class="flex items-center text-amber-400 text-xs font-mono">
                          ${'★'.repeat(rev.rating)}${'☆'.repeat(Math.max(0, 5 - rev.rating))}
                        </div>
                        <span class="text-[10px] text-[#718096] font-mono mt-0.5 block">${formattedDate}</span>
                      </div>
                    </div>

                    <!-- Review Comment Text (Only text) -->
                    <p class="text-xs text-[#cbd5e1] leading-relaxed">
                      ${rev.comment ? rev.comment : '<span class="italic text-[#718096]">Customer submitted star rating without written text.</span>'}
                    </p>
                  </div>

                  ${isCurrentUserReview ? `
                    <div class="pt-2 border-t border-[#202b3a] flex items-center justify-between text-[10px] text-[#718096]">
                      <span class="text-amber-400 font-semibold">Your active review</span>
                      <button onclick="document.getElementById('product-rating-box').scrollIntoView({behavior: 'smooth'})" class="text-blue-400 hover:text-blue-300 font-bold hover:underline">
                        Edit Review Above ↑
                      </button>
                    </div>
                  ` : ''}
                </div>
              `;
            }).join('')}
          </div>
        ` : `
          <div class="text-center py-12 bg-[#080b12] rounded-lg border border-[#202b3a] space-y-2.5">
            <div class="text-3xl">💬</div>
            <h4 class="text-sm font-bold text-white">No Reviews Yet for this Product</h4>
            <p class="text-xs text-[#718096] max-w-sm mx-auto">Be the first customer to share your thoughts and benchmark performance on this hardware!</p>
            ${currentUser ? `
              <button onclick="document.getElementById('product-rating-box').scrollIntoView({behavior: 'smooth'})" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-md shadow-sm transition-all mt-2">
                Write First Review ↑
              </button>
            ` : `
              <a href="#login" class="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-md shadow-sm transition-all mt-2">
                Sign In to Review
              </a>
            `}
          </div>
        `}
      </div>

    </div>
  `;
}