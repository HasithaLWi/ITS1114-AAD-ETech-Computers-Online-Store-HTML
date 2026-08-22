// ETech Computers - Branch & Distance Shipping Management Module
import { DEFAULT_BRANCHES, CITY_DISTANCES } from '../../data/branches.js';

export { DEFAULT_BRANCHES, CITY_DISTANCES };

const BRANCHES_STORAGE_KEY = 'etech_branches';

/**
 * Get all branches from localStorage (or initialize with seed)
 */
export function getBranches() {
  const data = localStorage.getItem(BRANCHES_STORAGE_KEY);
  if (!data) {
    localStorage.setItem(BRANCHES_STORAGE_KEY, JSON.stringify(DEFAULT_BRANCHES));
    return DEFAULT_BRANCHES;
  }
  return JSON.parse(data);
}

/**
 * Save all branches array to localStorage
 */
export function saveBranches(branches) {
  localStorage.setItem(BRANCHES_STORAGE_KEY, JSON.stringify(branches));
}

/**
 * Get branch by ID
 */
export function getBranchById(branchId) {
  const branches = getBranches();
  return branches.find(b => b.id === branchId) || null;
}

/**
 * Save or update a single branch
 */
export function saveBranch(branchData) {
  const branches = getBranches();
  const index = branches.findIndex(b => b.id === branchData.id);
  
  if (index > -1) {
    branches[index] = { ...branches[index], ...branchData };
  } else {
    const newBranch = {
      id: branchData.id || 'BR-' + Math.floor(100 + Math.random() * 900),
      name: branchData.name,
      city: branchData.city,
      address: branchData.address || '',
      phone: branchData.phone || '',
      email: branchData.email || '',
      baseShippingFee: parseFloat(branchData.baseShippingFee) || 300,
      perKmFee: parseFloat(branchData.perKmFee) || 25,
      status: branchData.status || 'Active'
    };
    branches.push(newBranch);
  }
  
  saveBranches(branches);
  return true;
}

/**
 * Delete branch by ID
 */
export function deleteBranch(branchId) {
  let branches = getBranches();
  branches = branches.filter(b => b.id !== branchId);
  saveBranches(branches);
  return true;
}

/**
 * Calculate distance in KM between a branch city and destination city
 */
export function calculateDistanceKm(branchCity, destCity) {
  const bCity = branchCity || "Colombo";
  const dCity = destCity || "Colombo";
  
  if (bCity === dCity) return 5; // local delivery distance
  
  if (CITY_DISTANCES[bCity] && CITY_DISTANCES[bCity][dCity]) {
    return CITY_DISTANCES[bCity][dCity];
  }
  
  // Default estimate fallback if city not in matrix
  return 80;
}

/**
 * Calculate shipping fee based on branch and destination city
 */
export function calculateShippingFee(branchId, destinationCity) {
  const branch = getBranchById(branchId) || getBranches()[0];
  const distanceKm = calculateDistanceKm(branch.city, destinationCity);
  
  const fee = branch.baseShippingFee + (distanceKm * branch.perKmFee);
  return {
    distanceKm,
    fee: Math.round(fee),
    branchName: branch.name,
    branchCity: branch.city
  };
}

/**
 * AUTOMATIC FULFILLMENT BRANCH SELECTION:
 * Finds the closest branch to customer's city that has ALL requested cart items in stock.
 */
export function autoSelectFulfillmentBranch(cartItems, customerCity, productsList) {
  const branches = getBranches().filter(b => b.status === 'Active');
  if (!branches.length) return null;

  let bestBranch = null;
  let minDistance = Infinity;

  for (const branch of branches) {
    // Check if branch has sufficient stock for all cart items (including composite bundles)
    let hasStockForAll = true;
    for (const item of cartItems) {
      if (item.isBundle && Array.isArray(item.bundleComponents)) {
        for (const comp of item.bundleComponents) {
          const compProduct = productsList.find(p => p.id === Number(comp.productId));
          if (compProduct && compProduct.branchStock) {
            const compStock = compProduct.branchStock[branch.id] || 0;
            if (compStock < ((comp.qty || 1) * item.quantity)) {
              hasStockForAll = false;
              break;
            }
          }
        }
      } else {
        const product = productsList.find(p => p.id === Number(item.id));
        if (product && product.branchStock) {
          const stockInBranch = product.branchStock[branch.id] || 0;
          if (stockInBranch < item.quantity) {
            hasStockForAll = false;
            break;
          }
        }
      }
      if (!hasStockForAll) break;
    }

    if (hasStockForAll) {
      const dist = calculateDistanceKm(branch.city, customerCity);
      if (dist < minDistance) {
        minDistance = dist;
        bestBranch = branch;
      }
    }
  }

  // If no single branch has stock for ALL items, pick closest branch as fallback
  if (!bestBranch) {
    bestBranch = branches[0];
    minDistance = calculateDistanceKm(bestBranch.city, customerCity);
  }

  const shippingCalc = calculateShippingFee(bestBranch.id, customerCity);

  return {
    branch: bestBranch,
    distanceKm: shippingCalc.distanceKm,
    shippingFee: shippingCalc.fee
  };
}
