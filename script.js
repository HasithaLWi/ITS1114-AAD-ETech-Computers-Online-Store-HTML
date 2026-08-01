// ============================================================
//  script.js — Central Window Bridge (ES Module)
// ============================================================
//  Single source of truth for all window.xxx bindings.
//  Imports every exported function/object from the module layer
//  and exposes them globally so inline HTML onclick="" handlers
//  can resolve them at runtime.
// ============================================================

import { products, getProductById, getFeaturedProducts } from './js/data.js';
import { legalPolicies, getPolicyData } from './js/policy-data.js';
import { ET_CONFIG } from './js/et-training.js';
import {
    getUsers, registerUser, loginUser, setCurrentUser,
    getCurrentUser, isLoggedIn, logoutUser,
    saveOrder, getAllOrders, getUserOrders,
    switchTab, togglePasswordVisibility, showAlert, handleLoginSubmit, handleSignupSubmit
} from './js/auth.js';
import {
    getCart, saveCart, updateCartBadge, addToCart, showToast,
    initCartLogic, initCheckoutLogic,
    updateItemQuantity, removeItemFromCart
} from './js/cart.js';
import {
    viewProductDetails, renderProductDetailsPage,
    changeProductQuantity,
    handleAddToCartFromDetails, handleBuyNowFromDetails
} from './js/product-details.js';
import { initShopLogic, renderFilteredProducts } from './js/shop.js';

// ── Bind everything to window in one shot ────────────────────
Object.assign(window, {
    // Data & Products
    products, getProductById, getFeaturedProducts,

    // Legal Policies
    legalPolicies, getPolicyData,

    // Chatbot Config
    ET_CONFIG,

    // Authentication & Orders
    getUsers, registerUser, loginUser, setCurrentUser,
    getCurrentUser, isLoggedIn, logoutUser,
    saveOrder, getAllOrders, getUserOrders,
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