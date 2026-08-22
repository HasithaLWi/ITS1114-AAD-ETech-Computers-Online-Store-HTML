// ============================================================
//  transfers_data.js — Inter-Branch Stock Transfers & Logistics Data Model
// ============================================================
import { getStoredProducts, saveStoredProducts } from './data.js';
import { getBranches } from '../controller/branch_controller.js';

export const TRANSFERS_STORAGE_KEY = 'etech_stock_transfers';

// Initial Seed Transfers Dataset
export const DEFAULT_TRANSFERS = [
  {
    id: "TRF-8001",
    referenceNo: "TRF-2026-08-01",
    productId: 2, // Intel Core i7-14700K
    productName: "Intel Core i7-14700K",
    productSku: "ETC-CPU-14700K",
    productImage: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=600&q=80",
    fromBranchId: "BR-GAL",
    fromBranchName: "Galle Tech Center",
    toBranchId: "BR-COL",
    toBranchName: "Colombo Main Hub",
    quantity: 2,
    reason: "Deal Bundle Kit Assembly",
    bundleId: 1,
    bundleTitle: "Ultimate Gaming Power",
    status: "In Transit", // 'Requested' | 'In Transit' | 'Received' | 'Cancelled'
    requestedBy: "Administrator",
    driverOrCourier: "ETech Logistics Fleet #01",
    trackingCode: "ET-LOG-9041",
    notes: "Rebalancing 2x CPUs to Colombo Main Hub to assemble 2 complete Ultimate Gaming Power bundle kits.",
    createdAt: new Date(Date.now() - 3600 * 4000).toISOString(),
    dispatchedAt: new Date(Date.now() - 3600 * 2000).toISOString(),
    receivedAt: null
  },
  {
    id: "TRF-8002",
    referenceNo: "TRF-2026-08-02",
    productId: 1, // ASUS RTX 4070 Super
    productName: "ASUS GeForce RTX 4070 Super 12GB GDDR6X",
    productSku: "ETC-GPU-4070S",
    productImage: "https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=600&q=80",
    fromBranchId: "BR-COL",
    fromBranchName: "Colombo Main Hub",
    toBranchId: "BR-KND",
    toBranchName: "Kandy Express Hub",
    quantity: 1,
    reason: "Customer Order Reservation",
    bundleId: null,
    bundleTitle: null,
    status: "Received",
    requestedBy: "Staff (Kandy)",
    driverOrCourier: "City Express Courier",
    trackingCode: "ET-LOG-8914",
    notes: "Direct transfer for customer reservation pickup in Kandy.",
    createdAt: new Date(Date.now() - 86400 * 2000).toISOString(),
    dispatchedAt: new Date(Date.now() - 86400 * 1500).toISOString(),
    receivedAt: new Date(Date.now() - 86400 * 800).toISOString()
  },
  {
    id: "TRF-8003",
    referenceNo: "TRF-2026-08-03",
    productId: 3, // Corsair DDR5 RAM
    productName: "Corsair Vengeance 16GB (2x8GB) DDR5 6000MHz",
    productSku: "ETC-RAM-CORSDDR5",
    productImage: "https://images.unsplash.com/photo-1562976540-1502c2145186?auto=format&fit=crop&w=600&q=80",
    fromBranchId: "BR-COL",
    fromBranchName: "Colombo Main Hub",
    toBranchId: "BR-MAT",
    toBranchName: "Matara Branch",
    quantity: 3,
    reason: "Low Stock Rebalance",
    bundleId: null,
    bundleTitle: null,
    status: "In Transit",
    requestedBy: "Warehouse Supervisor",
    driverOrCourier: "ETech Logistics Van #02",
    trackingCode: "ET-LOG-9118",
    notes: "Replenishing low memory inventory in Matara warehouse.",
    createdAt: new Date(Date.now() - 3600 * 8000).toISOString(),
    dispatchedAt: new Date(Date.now() - 3600 * 3000).toISOString(),
    receivedAt: null
  }
];

/**
 * Retrieve all stock transfer records
 */
export function getStockTransfers() {
  const raw = localStorage.getItem(TRANSFERS_STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(TRANSFERS_STORAGE_KEY, JSON.stringify(DEFAULT_TRANSFERS));
    return [...DEFAULT_TRANSFERS];
  }
  try {
    const list = JSON.parse(raw);
    return Array.isArray(list) && list.length > 0 ? list : [...DEFAULT_TRANSFERS];
  } catch (e) {
    return [...DEFAULT_TRANSFERS];
  }
}

/**
 * Save stock transfers array
 */
export function saveStockTransfers(transfersList) {
  localStorage.setItem(TRANSFERS_STORAGE_KEY, JSON.stringify(transfersList));
}

/**
 * Create a new stock transfer request
 */
export function createStockTransfer(transferData) {
  const list = getStockTransfers();
  const products = getStoredProducts();
  const branches = getBranches();

  const product = products.find(p => p.id === Number(transferData.productId));
  if (!product) return { success: false, message: 'Product not found.' };

  const fromBranch = branches.find(b => b.id === transferData.fromBranchId);
  const toBranch = branches.find(b => b.id === transferData.toBranchId);

  if (!fromBranch || !toBranch || fromBranch.id === toBranch.id) {
    return { success: false, message: 'Invalid source or destination branch.' };
  }

  const qty = Math.max(1, parseInt(transferData.quantity) || 1);
  const availableAtSource = (product.branchStock && product.branchStock[fromBranch.id]) || 0;

  if (availableAtSource < qty) {
    return { 
      success: false, 
      message: `Insufficient stock at ${fromBranch.name}. Available: ${availableAtSource}, requested: ${qty}.` 
    };
  }

  // Deduct from source branch right now (held in transit)
  product.branchStock[fromBranch.id] = Math.max(0, availableAtSource - qty);
  product.totalStock = Object.values(product.branchStock).reduce((a, b) => a + b, 0);
  saveStoredProducts(products);

  const nextSeq = list.length > 0 ? Math.max(...list.map(t => parseInt(t.id.replace('TRF-', '')) || 8000)) + 1 : 8001;
  const newTransfer = {
    id: `TRF-${nextSeq}`,
    referenceNo: `TRF-2026-${String(nextSeq).padStart(4, '0')}`,
    productId: product.id,
    productName: product.name,
    productSku: product.sku || `ETC-${product.id}`,
    productImage: product.image,
    fromBranchId: fromBranch.id,
    fromBranchName: fromBranch.name,
    toBranchId: toBranch.id,
    toBranchName: toBranch.name,
    quantity: qty,
    reason: transferData.reason || "General Stock Rebalancing",
    bundleId: transferData.bundleId || null,
    bundleTitle: transferData.bundleTitle || null,
    status: transferData.instantDelivery ? "Received" : (transferData.status || "In Transit"),
    requestedBy: transferData.requestedBy || "Administrator",
    driverOrCourier: transferData.driverOrCourier || "ETech Logistics Fleet",
    trackingCode: transferData.trackingCode || `ET-LOG-${Math.floor(1000 + Math.random() * 9000)}`,
    notes: transferData.notes || "",
    createdAt: new Date().toISOString(),
    dispatchedAt: new Date().toISOString(),
    receivedAt: transferData.instantDelivery ? new Date().toISOString() : null
  };

  // If instant delivery, credit destination branch immediately
  if (transferData.instantDelivery) {
    product.branchStock[toBranch.id] = ((product.branchStock && product.branchStock[toBranch.id]) || 0) + qty;
    product.totalStock = Object.values(product.branchStock).reduce((a, b) => a + b, 0);
    saveStoredProducts(products);
  }

  list.unshift(newTransfer);
  saveStockTransfers(list);
  window.dispatchEvent(new Event('productsUpdated'));

  return { success: true, transfer: newTransfer };
}

/**
 * Mark a transfer as Received & Verified at destination branch
 */
export function receiveStockTransfer(transferId, receivedBy = 'Staff Verification') {
  const list = getStockTransfers();
  const transfer = list.find(t => t.id === transferId);
  if (!transfer) return { success: false, message: 'Transfer record not found.' };

  if (transfer.status === 'Received') {
    return { success: false, message: 'Transfer has already been received.' };
  }
  if (transfer.status === 'Cancelled') {
    return { success: false, message: 'Cannot receive a cancelled transfer.' };
  }

  const products = getStoredProducts();
  const product = products.find(p => p.id === Number(transfer.productId));
  if (product) {
    if (!product.branchStock) product.branchStock = { "BR-COL": 0, "BR-GAL": 0, "BR-MAT": 0, "BR-KND": 0 };
    product.branchStock[transfer.toBranchId] = (product.branchStock[transfer.toBranchId] || 0) + transfer.quantity;
    product.totalStock = Object.values(product.branchStock).reduce((a, b) => a + b, 0);
    saveStoredProducts(products);
  }

  transfer.status = 'Received';
  transfer.receivedAt = new Date().toISOString();
  transfer.receivedBy = receivedBy;

  saveStockTransfers(list);
  window.dispatchEvent(new Event('productsUpdated'));

  return { success: true, transfer };
}

/**
 * Cancel a transfer and return stock back to source branch
 */
export function cancelStockTransfer(transferId, reason = 'Cancelled by Administrator') {
  const list = getStockTransfers();
  const transfer = list.find(t => t.id === transferId);
  if (!transfer) return { success: false, message: 'Transfer record not found.' };

  if (transfer.status === 'Received') {
    return { success: false, message: 'Cannot cancel a transfer that has already been received at destination.' };
  }
  if (transfer.status === 'Cancelled') {
    return { success: false, message: 'Transfer is already cancelled.' };
  }

  // Return stock back to source branch
  const products = getStoredProducts();
  const product = products.find(p => p.id === Number(transfer.productId));
  if (product && product.branchStock) {
    product.branchStock[transfer.fromBranchId] = (product.branchStock[transfer.fromBranchId] || 0) + transfer.quantity;
    product.totalStock = Object.values(product.branchStock).reduce((a, b) => a + b, 0);
    saveStoredProducts(products);
  }

  transfer.status = 'Cancelled';
  transfer.cancellationReason = reason;
  transfer.cancelledAt = new Date().toISOString();

  saveStockTransfers(list);
  window.dispatchEvent(new Event('productsUpdated'));

  return { success: true, transfer };
}

/**
 * Get transfer metrics summary
 */
export function getTransfersMetrics() {
  const list = getStockTransfers();
  const inTransit = list.filter(t => t.status === 'In Transit').length;
  const received = list.filter(t => t.status === 'Received').length;
  const requested = list.filter(t => t.status === 'Requested').length;
  const cancelled = list.filter(t => t.status === 'Cancelled').length;
  const bundleTransfers = list.filter(t => t.reason === 'Deal Bundle Kit Assembly').length;
  const totalUnits = list.reduce((sum, t) => sum + (t.status !== 'Cancelled' ? t.quantity : 0), 0);

  return {
    total: list.length,
    inTransit,
    received,
    requested,
    cancelled,
    bundleTransfers,
    totalUnits
  };
}
