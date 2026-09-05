// ============================================================
//  src/js/models/data.js — Product Inventory Model & Storage Layer
// ============================================================
import { DEFAULT_PRODUCTS, DEFAULT_BRANCH_ALLOCATION } from '../../data/products.js';
import { ProductsApi } from '../api/productsApi.js';

export const products = DEFAULT_PRODUCTS;

const PRODUCTS_STORAGE_KEY = 'etech_products';

/**
 * Get all stored products from localStorage (or seed default)
 * @param {object} options
 * @param {boolean} [options.includeDeleted=false] - If true, returns deleted items too
 * @param {boolean} [options.activeOnly=false] - If true, returns only ACTIVE items
 * @returns {Array}
 */
export function getStoredProducts(options = {}) {
    const { includeDeleted = false, activeOnly = false } = options;
    const raw = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    let list = [];
    let shouldSave = false;

    if (!raw) {
        // Hydrate default products with branch stock & default ACTIVE status
        list = products.map(p => {
            const stockMap = DEFAULT_BRANCH_ALLOCATION[p.id] || { "BR-COL": 10, "BR-GAL": 5, "BR-MAT": 3, "BR-KAN": 4 };
            const totalStock = Object.values(stockMap).reduce((a, b) => a + b, 0);
            return {
                ...p,
                brand: p.brand || 'ASUS',
                productStatus: p.productStatus || p.status || 'ACTIVE',
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
            if (!Array.isArray(list) || list.length === 0) {
                list = [...products];
                shouldSave = true;
            }
        } catch (e) {
            list = [...products];
            shouldSave = true;
        }
    }

    // Always ensure every product has a valid brand, category, and productStatus synced
    list = list.map(p => {
        const def = products.find(dp => dp.id === p.id || (dp.name && p.name && dp.name.toLowerCase() === p.name.toLowerCase()));
        const fallbackBrand = def && def.brand ? def.brand : 'ASUS';
        
        let currentBrand = p.brand;
        if (!currentBrand || currentBrand.trim() === '') {
            currentBrand = fallbackBrand;
            shouldSave = true;
        }

        const currentStatus = (p.productStatus || p.status || 'ACTIVE').toUpperCase();
        if (!p.productStatus || p.productStatus !== currentStatus) {
            shouldSave = true;
        }

        return {
            ...p,
            brand: currentBrand,
            productStatus: currentStatus,
            alertEnabled: p.alertEnabled !== undefined ? p.alertEnabled : true,
            lowStockMargin: p.lowStockMargin !== undefined ? parseInt(p.lowStockMargin) : 5
        };
    });

    if (shouldSave) {
        localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(list));
    }

    // Filter based on requested status scope
    if (includeDeleted) {
        return list;
    }
    if (activeOnly) {
        return list.filter(p => p.productStatus === 'ACTIVE');
    }
    // Standard default: Exclude soft-deleted products
    return list.filter(p => p.productStatus !== 'DELETED');
}

/**
 * Retrieve only deleted products for the SuperADMIN Trash Bin
 * @returns {Array}
 */
export function getDeletedProducts() {
    const raw = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (!raw) return [];
    try {
        const list = JSON.parse(raw);
        if (!Array.isArray(list)) return [];
        return list.filter(p => (p.productStatus || p.status || '').toUpperCase() === 'DELETED');
    } catch (e) {
        return [];
    }
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
    const all = getStoredProducts({ includeDeleted: true });
    return all.find(p => p.id === parseInt(id));
}

/**
 * Get featured products (Best Sellers) - Active only
 */
export function getFeaturedProducts() {
    const all = getStoredProducts({ activeOnly: true });
    const bestSellers = all.filter(p => p.badge && p.badge.trim().toLowerCase() === "best seller");
    if (bestSellers.length > 0) {
        return bestSellers;
    }
    return all.slice(0, 4);
}

/**
 * Get new arrival products (filtered by badge matching "New Arrival") - Active only
 */
export function getNewArrivalProducts() {
    const all = getStoredProducts({ activeOnly: true });
    const arrivals = all.filter(p => p.badge && p.badge.trim().toLowerCase() === "new arrival");
    if (arrivals.length > 0) {
        return arrivals;
    }
    const featured = all.filter(p => p.badge && p.badge !== "");
    return featured.length > 0 ? featured : all.slice(0, 4);
}

/**
 * Update product lifecycle status (ACTIVE, INACTIVE, DELETED)
 * Synchronizes with backend API PATCH /products/update-status/{id}
 */
export async function updateProductStatus(id, newStatus) {
    const upperStatus = (newStatus || 'ACTIVE').toUpperCase();
    const all = getStoredProducts({ includeDeleted: true });
    const index = all.findIndex(p => p.id === parseInt(id));

    if (index !== -1) {
        all[index].productStatus = upperStatus;
        all[index].status = upperStatus;
        saveStoredProducts(all);

        // Async API update in background
        try {
            await ProductsApi.updateStatus(id, upperStatus);
        } catch (err) {
            console.warn(`[DataModel] Backend status sync notice for product ${id}:`, err.message);
        }

        return { success: true, product: all[index] };
    }
    return { success: false, message: 'Product not found.' };
}

/**
 * Soft delete product by ID (sets status to DELETED)
 * Synchronizes with backend API DELETE /products/delete/{id}
 */
export async function deleteProduct(id) {
    const res = await updateProductStatus(id, 'DELETED');
    try {
        await ProductsApi.delete(id);
    } catch (err) {
        console.warn(`[DataModel] Backend soft-delete sync notice for product ${id}:`, err.message);
    }
    return res.success;
}

/**
 * Restore soft-deleted product back to ACTIVE status
 */
export async function restoreProduct(id) {
    return await updateProductStatus(id, 'ACTIVE');
}

/**
 * Permanently purge product from database and storage (SuperADMIN only)
 * Synchronizes with backend API DELETE /products/perma-delete/{id}
 */
export async function permanentlyDeleteProduct(id) {
    let all = getStoredProducts({ includeDeleted: true });
    const target = all.find(p => p.id === parseInt(id));
    all = all.filter(p => p.id !== parseInt(id));
    saveStoredProducts(all);

    try {
        await ProductsApi.permaDelete(id);
    } catch (err) {
        console.warn(`[DataModel] Backend permanent delete notice for product ${id}:`, err.message);
    }

    return { success: true, product: target };
}

/**
 * Save or update a product
 */
export async function saveProduct(productData) {
    const all = getStoredProducts({ includeDeleted: true });
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
    const branchStock = productData.branchStock || { "BR-COL": 10, "BR-GAL": 5, "BR-MAT": 3, "BR-KAN": 5 };
    const totalStock = Object.values(branchStock).reduce((sum, v) => sum + parseInt(v || 0), 0);
    const productStatus = (productData.productStatus || productData.status || (index > -1 ? all[index].productStatus : 'ACTIVE')).toUpperCase();

    const formattedProduct = {
        id: productData.id ? parseInt(productData.id) : (all.length > 0 ? Math.max(...all.map(p => p.id)) + 1 : 1),
        name: productData.name,
        category: productData.category,
        categoryId: productData.categoryId || `cat-${productData.category}`,
        brand: productData.brand || 'ASUS',
        brandId: productData.brandId || `brd-${(productData.brand || 'asus').toLowerCase()}`,
        price: parseFloat(productData.price),
        originalPrice: parseFloat(productData.originalPrice || productData.price),
        rating: parseFloat(productData.rating || 4.8),
        reviews: parseInt(productData.reviews || 10),
        reviewsCount: parseInt(productData.reviews || 10),
        image: mainImg,
        images: imagesArr.length > 0 ? imagesArr : [mainImg],
        description: productData.description || "",
        fullDescription: productData.fullDescription || productData.description || "",
        sku: productData.sku || `ETC-${(productData.category || 'GEN').toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
        badge: productData.badge || "",
        badgeId: productData.badgeId || (productData.badge ? `bdg-${productData.badge.toLowerCase().replace(/[^a-z0-9]+/g, '')}` : ""),
        warranty: productData.warranty || "1-Year Warranty",
        specs: productData.specs || { "Category": productData.category },
        features: productData.features || ["High Performance Tech Hardware"],
        branchStock: branchStock,
        totalStock: totalStock,
        inStock: totalStock > 0,
        productStatus: productStatus,
        status: productStatus,
        alertEnabled: productData.alertEnabled !== undefined ? productData.alertEnabled : (index > -1 && all[index].alertEnabled !== undefined ? all[index].alertEnabled : true),
        lowStockMargin: productData.lowStockMargin !== undefined ? parseInt(productData.lowStockMargin) : (index > -1 && all[index].lowStockMargin !== undefined ? all[index].lowStockMargin : 5)
    };

    if (index > -1) {
        all[index] = formattedProduct;
    } else {
        all.push(formattedProduct);
    }

    saveStoredProducts(all);

    // Synchronize with API
    try {
        if (index > -1) {
            await ProductsApi.update(formattedProduct.id, formattedProduct);
        } else {
            await ProductsApi.create(formattedProduct);
        }
    } catch (err) {
        console.warn(`[DataModel] Backend sync notice for saveProduct:`, err.message);
    }

    return formattedProduct;
}

/**
 * Deduct stock from a specific branch when an order is placed
 */
export function deductBranchStock(productId, branchId, quantity) {
    const all = getStoredProducts({ includeDeleted: true });
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
    const all = getStoredProducts({ includeDeleted: true });
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
    const all = getStoredProducts({ includeDeleted: true });
    const product = all.find(p => p.id === parseInt(productId));
    if (product) {
        if (!product.branchStock) product.branchStock = { "BR-COL": 0, "BR-GAL": 0, "BR-MAT": 0, "BR-KAN": 0 };
        const current = parseInt(product.branchStock[branchId] || 0);
        if (isAbsolute) {
            product.branchStock[branchId] = Math.max(0, parseInt(quantityOrDelta) || 0);
        } else {
            product.branchStock[branchId] = Math.max(0, current + parseInt(quantityOrDelta || 0));
        }
        product.totalStock = Object.values(product.branchStock).reduce((a, b) => a + parseInt(b || 0), 0);
        product.inStock = product.totalStock > 0;
        saveStoredProducts(all);

        // Async sync inventory stock with backend
        try {
            ProductsApi.updateInventory(productId, product.branchStock).catch(() => {});
        } catch (e) {}

        return product;
    }
    return null;
}

/**
 * Transfer stock from one branch warehouse to another
 */
export function transferBranchStock(productId, fromBranchId, toBranchId, transferQty) {
    const all = getStoredProducts({ includeDeleted: true });
    const product = all.find(p => p.id === parseInt(productId));
    const qty = parseInt(transferQty) || 0;
    if (product && qty > 0 && fromBranchId !== toBranchId) {
        if (!product.branchStock) product.branchStock = { "BR-COL": 0, "BR-GAL": 0, "BR-MAT": 0, "BR-KAN": 0 };
        const sourceStock = parseInt(product.branchStock[fromBranchId] || 0);
        const actualTransfer = Math.min(sourceStock, qty);
        product.branchStock[fromBranchId] = Math.max(0, sourceStock - actualTransfer);
        product.branchStock[toBranchId] = (parseInt(product.branchStock[toBranchId] || 0)) + actualTransfer;
        product.totalStock = Object.values(product.branchStock).reduce((a, b) => a + parseInt(b || 0), 0);
        product.inStock = product.totalStock > 0;
        saveStoredProducts(all);

        // Async sync inventory stock with backend
        try {
            ProductsApi.updateInventory(productId, product.branchStock).catch(() => {});
        } catch (e) {}

        return { success: true, transferred: actualTransfer, product };
    }
    return { success: false, message: 'Invalid transfer parameters.' };
}

/**
 * Fetch and sync products from backend API into local storage
 */
export async function syncProductsFromApi() {
    try {
        const liveProducts = await ProductsApi.getAll();
        if (Array.isArray(liveProducts) && liveProducts.length > 0) {
            saveStoredProducts(liveProducts);
            return liveProducts;
        }
    } catch (err) {
        console.warn('[DataModel] Live API sync offline, using local storage products.');
    }
    return getStoredProducts();
}
