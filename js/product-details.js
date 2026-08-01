// ETech Computers - Product Details Page Renderer & Logic
import { getProductById, products } from './data.js';
import { addToCart } from './cart.js';
import renderProductDetails from '../components/product_detail_cart.js';

let selectedProductQuantity = 1;

/**
 * Navigate to product details section
 */
export function viewProductDetails(productId) {
  window.location.hash = `#product?id=${productId}`;
}

/**
 * Renders full product details page inside #product-details-page section
 */
export function renderProductDetailsPage(productId) {
  selectedProductQuantity = 1;
  renderProductDetails(productId);
}

/**
 * Change quantity stepper
 */
export function changeProductQuantity(delta) {
  selectedProductQuantity = Math.max(1, selectedProductQuantity + delta);
  const display = document.getElementById('product-quantity-display');
  if (display) display.textContent = selectedProductQuantity;
}

/**
 * Add to cart from product details page
 */
export function handleAddToCartFromDetails(productId) {
  addToCart(productId, selectedProductQuantity);
}

/**
 * Buy now from product details page
 */
export function handleBuyNowFromDetails(productId) {
  addToCart(productId, selectedProductQuantity);
  window.location.hash = '#checkout';
}


