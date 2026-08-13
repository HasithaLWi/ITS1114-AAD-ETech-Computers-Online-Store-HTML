// ============================================================
//  script.js — Central Window Bridge (ES Module)
// ============================================================
//  Single source of truth for all window.xxx bindings.
//  Imports every exported function/object from the module layer
//  and exposes them globally so inline HTML onclick="" handlers
//  can resolve them at runtime.
// ============================================================

import { products, getProductById, getFeaturedProducts, getNewArrivalProducts, getStoredProducts, saveProduct, deleteProduct } from './src/js/models/data.js';
import { legalPolicies, getPolicyData } from './src/js/models/policy-data.js';
import { ET_CONFIG } from './src/js/models/et-training.js';
import {
    getUsers, registerUser, loginUser, setCurrentUser,
    getCurrentUser, isLoggedIn, logoutUser,
    saveOrder, getAllOrders, getUserOrders, updateOrderStatus,
    switchTab, togglePasswordVisibility, showAlert, handleLoginSubmit, handleSignupSubmit
} from './src/js/services/auth.js';
import { getBranches, calculateShippingFee, autoSelectFulfillmentBranch } from './src/js/utils/branches.js';
import {
    getCart, saveCart, updateCartBadge, addToCart, showToast,
    initCartLogic, initCheckoutLogic,
    updateItemQuantity, removeItemFromCart
} from './src/js/services/cart.js';
import {
    viewProductDetails, renderProductDetailsPage,
    changeProductQuantity,
    handleAddToCartFromDetails, handleBuyNowFromDetails
} from './src/js/product-details.js';
import { initShopLogic, renderFilteredProducts } from './src/js/utils/shop.js';
import { handleLogout } from './src/js/app.js';

// ── Bind everything to window in one shot ────────────────────
Object.assign(window, {
    // Data & Products
    products, getProductById, getFeaturedProducts, getNewArrivalProducts, getStoredProducts, saveProduct, deleteProduct,

    // Branches & Shipping
    getBranches, calculateShippingFee, autoSelectFulfillmentBranch,

    // Legal Policies
    legalPolicies, getPolicyData,

    // Chatbot Config
    ET_CONFIG,

    // Authentication & Orders
    getUsers, registerUser, loginUser, setCurrentUser,
    getCurrentUser, isLoggedIn, logoutUser, handleLogout,
    saveOrder, getAllOrders, getUserOrders, updateOrderStatus,
    switchTab, togglePasswordVisibility, showAlert, handleLoginSubmit, handleSignupSubmit,

    // Cart & Checkout
    getCart, saveCart, updateCartBadge, addToCart, showToast,
    initCartLogic, initCheckoutLogic,
    updateItemQuantity, removeItemFromCart,

    // Product Details
    viewProductDetails, renderProductDetailsPage,
    changeProductQuantity,
    handleAddToCartFromDetails, handleBuyNowFromDetails,

    // Shop Catalog
    initShopLogic, renderFilteredProducts,
});