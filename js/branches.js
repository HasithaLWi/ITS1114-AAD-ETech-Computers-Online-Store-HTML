// ETech Computers - Branch & Distance Shipping Management Module

const BRANCHES_STORAGE_KEY = 'etech_branches';

// Initial Seed Branches dataset
const DEFAULT_BRANCHES = [
  {
    id: "BR-COL",
    name: "Colombo Main Hub",
    city: "Colombo",
    address: "123 Galle Road, Colombo 03",
    phone: "+94 11 234 5678",
    email: "colombo@etech.com",
    coordinates: { lat: 6.9271, lng: 79.8612 },
    baseShippingFee: 350,
    perKmFee: 30,
    status: "Active"
  },
  {
    id: "BR-GAL",
    name: "Galle Tech Center",
    city: "Galle",
    address: "45 Main Street, Galle Fort",
    phone: "+94 91 345 6789",
    email: "galle@etech.com",
    coordinates: { lat: 6.0535, lng: 80.2210 },
    baseShippingFee: 300,
    perKmFee: 25,
    status: "Active"
  },
  {
    id: "BR-MAT",
    name: "Matara Branch",
    city: "Matara",
    address: "88 Anagarika Dharmapala Mawatha, Matara",
    phone: "+94 41 456 7890",
    email: "matara@etech.com",
    coordinates: { lat: 5.9496, lng: 80.5469 },
    baseShippingFee: 300,
    perKmFee: 25,
    status: "Active"
  },
  {
    id: "BR-KND",
    name: "Kandy Express Hub",
    city: "Kandy",
    address: "12 Dalada Veediya, Kandy",
    phone: "+94 81 567 8901",
    email: "kandy@etech.com",
    coordinates: { lat: 7.2906, lng: 80.6337 },
    baseShippingFee: 400,
    perKmFee: 35,
    status: "Active"
  }
];

// Distance matrix (in KM) between key cities in Sri Lanka for distance-based shipping calculations
const CITY_DISTANCES = {
  "Colombo": { "Colombo": 5, "Galle": 125, "Matara": 160, "Kandy": 115, "Negombo": 38, "Jaffna": 395, "Kurunegala": 94, "Ratnapura": 101 },
  "Galle": { "Colombo": 125, "Galle": 5, "Matara": 35, "Kandy": 220, "Negombo": 160, "Jaffna": 510, "Kurunegala": 210, "Ratnapura": 130 },
  "Matara": { "Colombo": 160, "Galle": 35, "Matara": 5, "Kandy": 250, "Negombo": 195, "Jaffna": 540, "Kurunegala": 240, "Ratnapura": 150 },
  "Kandy": { "Colombo": 115, "Galle": 220, "Matara": 250, "Kandy": 5, "Negombo": 105, "Jaffna": 310, "Kurunegala": 42, "Ratnapura": 125 }
};

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
    // Check if branch has sufficient stock for all cart items
    let hasStockForAll = true;
    for (const item of cartItems) {
      const product = productsList.find(p => p.id === item.id);
      if (product && product.branchStock) {
        const stockInBranch = product.branchStock[branch.id] || 0;
        if (stockInBranch < item.quantity) {
          hasStockForAll = false;
          break;
        }
      }
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
