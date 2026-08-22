// ============================================================
//  src/js/models/data.js — Product Inventory Model & Storage Layer
// ============================================================
import { DEFAULT_PRODUCTS, DEFAULT_BRANCH_ALLOCATION } from '../../data/products.js';

export const products = DEFAULT_PRODUCTS;

const PRODUCTS_STORAGE_KEY = 'etech_products';

/**
 * Get all stored products from localStorage (or seed default)
 */
export function getStoredProducts() {
    const raw = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    let list = [];
    if (!raw) {
        // Hydrate default products with branch stock
        list = products.map(p => {
            const stockMap = DEFAULT_BRANCH_ALLOCATION[p.id] || { "BR-COL": 10, "BR-GAL": 5, "BR-MAT": 3, "BR-KND": 4 };
            const totalStock = Object.values(stockMap).reduce((a, b) => a + b, 0);
            return {
                ...p,
                branchStock: stockMap,
                totalStock: totalStock,
                inStock: totalStock > 0,
                discount: p.originalPrice ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0,
                alertEnabled: p.alertEnabled !== undefined ? p.alertEnabled : true,
                lowStockMargin: p.lowStockMargin !== undefined ? parseInt(p.lowStockMargin) : 5
            };
        });
        localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(list));
    } else {
        try {
            list = JSON.parse(raw);
        } catch (e) {
            list = products;
        }
    }

    // Always ensure items 0, 1, 2, 3 have updated metadata matching reference design
    [0, 1, 2, 3].forEach(i => {
        if (products[i] && list[i]) {
            list[i].name = products[i].name;
            list[i].category = products[i].category;
            list[i].price = products[i].price;
            list[i].originalPrice = products[i].originalPrice;
            list[i].rating = products[i].rating;
            list[i].reviews = products[i].reviews;
            list[i].badge = products[i].badge;
            list[i].image = products[i].image;
        }
    });

    // Ensure all items have alertEnabled and lowStockMargin properties
    return list.map(p => ({
        ...p,
        alertEnabled: p.alertEnabled !== undefined ? p.alertEnabled : true,
        lowStockMargin: p.lowStockMargin !== undefined ? parseInt(p.lowStockMargin) : 5
    }));
}

/**
 * Save full products array to localStorage
 */
export function saveStoredProducts(productsList) {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(productsList));
}

/**
 * Get product by ID from stored products
 */
export function getProductById(id) {
    const all = getStoredProducts();
    return all.find(p => p.id === parseInt(id));
}

/**
 * Get featured products (Best Sellers)
 */
export function getFeaturedProducts() {
    const all = getStoredProducts();
    const bestSellers = all.filter(p => p.badge && p.badge.trim().toLowerCase() === "best seller");
    if (bestSellers.length > 0) {
        return bestSellers;
    }
    return all.slice(0, 4);
}

/**
 * Get new arrival products (filtered by badge matching "New Arrival")
 */
export function getNewArrivalProducts() {
    const all = getStoredProducts();
    const arrivals = all.filter(p => p.badge && p.badge.trim().toLowerCase() === "new arrival");
    if (arrivals.length > 0) {
        return arrivals;
    }
    // Fallback: Return any products with non-empty badge or default to top 4 products
    const featured = all.filter(p => p.badge && p.badge !== "");
    return featured.length > 0 ? featured : all.slice(0, 4);
}

/**
 * Save or update a product
 */
export function saveProduct(productData) {
    const all = getStoredProducts();
    const index = all.findIndex(p => p.id === parseInt(productData.id));

    // Filter and sanitize images array (max 5 images)
    let imagesArr = Array.isArray(productData.images) ? productData.images.filter(img => img && typeof img === 'string' && img.trim() !== '') : [];
    if (imagesArr.length === 0 && productData.image) {
        imagesArr = [productData.image];
    }
    if (imagesArr.length > 5) {
        imagesArr = imagesArr.slice(0, 5);
    }

    const mainImg = imagesArr.length > 0 ? imagesArr[0] : (productData.image || "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80");

    const branchStock = productData.branchStock || { "BR-COL": 10, "BR-GAL": 5, "BR-MAT": 3, "BR-KND": 5 };
    const totalStock = Object.values(branchStock).reduce((sum, v) => sum + parseInt(v || 0), 0);

    const formattedProduct = {
        id: productData.id ? parseInt(productData.id) : (all.length > 0 ? Math.max(...all.map(p => p.id)) + 1 : 1),
        name: productData.name,
        category: productData.category,
        price: parseFloat(productData.price),
        originalPrice: parseFloat(productData.originalPrice || productData.price),
        rating: parseFloat(productData.rating || 4.8),
        reviews: parseInt(productData.reviews || 10),
        image: mainImg,
        images: imagesArr.length > 0 ? imagesArr : [mainImg],
        description: productData.description || "",
        fullDescription: productData.fullDescription || productData.description || "",
        sku: productData.sku || `ETC-${(productData.category || 'GEN').toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
        badge: productData.badge || "",
        warranty: productData.warranty || "1-Year Warranty",
        specs: productData.specs || { "Category": productData.category },
        features: productData.features || ["High Performance Tech Hardware"],
        branchStock: branchStock,
        totalStock: totalStock,
        inStock: totalStock > 0,
        alertEnabled: productData.alertEnabled !== undefined ? productData.alertEnabled : (index > -1 && all[index].alertEnabled !== undefined ? all[index].alertEnabled : true),
        lowStockMargin: productData.lowStockMargin !== undefined ? parseInt(productData.lowStockMargin) : (index > -1 && all[index].lowStockMargin !== undefined ? all[index].lowStockMargin : 5)
    };

    if (index > -1) {
        all[index] = formattedProduct;
    } else {
        all.push(formattedProduct);
    }

    saveStoredProducts(all);
    return formattedProduct;
}

/**
 * Delete product by ID
 */
export function deleteProduct(id) {
    let all = getStoredProducts();
    all = all.filter(p => p.id !== parseInt(id));
    saveStoredProducts(all);
    return true;
}

/**
 * Deduct stock from a specific branch when an order is placed
 */
export function deductBranchStock(productId, branchId, quantity) {
    const all = getStoredProducts();
    const product = all.find(p => p.id === parseInt(productId));
    if (product && product.branchStock) {
        const current = product.branchStock[branchId] || 0;
        product.branchStock[branchId] = Math.max(0, current - quantity);
        product.totalStock = Object.values(product.branchStock).reduce((a, b) => a + b, 0);
        product.inStock = product.totalStock > 0;
        saveStoredProducts(all);
    }
}

/**
 * Update stock alert configuration for a specific product
 */
export function updateProductStockSettings(productId, { alertEnabled, lowStockMargin }) {
    const all = getStoredProducts();
    const product = all.find(p => p.id === parseInt(productId));
    if (product) {
        if (alertEnabled !== undefined) product.alertEnabled = Boolean(alertEnabled);
        if (lowStockMargin !== undefined) product.lowStockMargin = Math.max(1, parseInt(lowStockMargin) || 5);
        saveStoredProducts(all);
        return product;
    }
    return null;
}

/**
 * Adjust stock quantity directly for a branch warehouse
 */
export function quickAdjustStock(productId, branchId, quantityOrDelta, isAbsolute = false) {
    const all = getStoredProducts();
    const product = all.find(p => p.id === parseInt(productId));
    if (product) {
        if (!product.branchStock) product.branchStock = { "BR-COL": 0, "BR-GAL": 0, "BR-MAT": 0, "BR-KND": 0 };
        const current = parseInt(product.branchStock[branchId] || 0);
        if (isAbsolute) {
            product.branchStock[branchId] = Math.max(0, parseInt(quantityOrDelta) || 0);
        } else {
            product.branchStock[branchId] = Math.max(0, current + parseInt(quantityOrDelta || 0));
        }
        product.totalStock = Object.values(product.branchStock).reduce((a, b) => a + parseInt(b || 0), 0);
        product.inStock = product.totalStock > 0;
        saveStoredProducts(all);
        return product;
    }
    return null;
}

/**
 * Transfer stock from one branch warehouse to another
 */
export function transferBranchStock(productId, fromBranchId, toBranchId, transferQty) {
    const all = getStoredProducts();
    const product = all.find(p => p.id === parseInt(productId));
    const qty = parseInt(transferQty) || 0;
    if (product && qty > 0 && fromBranchId !== toBranchId) {
        if (!product.branchStock) product.branchStock = { "BR-COL": 0, "BR-GAL": 0, "BR-MAT": 0, "BR-KND": 0 };
        const sourceStock = parseInt(product.branchStock[fromBranchId] || 0);
        const actualTransfer = Math.min(sourceStock, qty);
        product.branchStock[fromBranchId] = Math.max(0, sourceStock - actualTransfer);
        product.branchStock[toBranchId] = (parseInt(product.branchStock[toBranchId] || 0)) + actualTransfer;
        product.totalStock = Object.values(product.branchStock).reduce((a, b) => a + parseInt(b || 0), 0);
        product.inStock = product.totalStock > 0;
        saveStoredProducts(all);
        return { success: true, transferred: actualTransfer, product };
    }
    return { success: false, message: 'Invalid transfer parameters.' };
}


