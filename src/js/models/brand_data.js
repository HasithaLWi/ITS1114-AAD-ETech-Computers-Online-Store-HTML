// ============================================================
//  src/js/models/brand_data.js — Hardware Brands Model & Operations
// ============================================================
import { DEFAULT_BRANDS } from '../../data/brands.js';
import { getStoredProducts } from './data.js';
import { BrandsApi } from '../api/brandsApi.js';

export const BRANDS_STORAGE_KEY = 'etech_brands_data';

/**
 * Retrieve all brands from storage (hydrates from DEFAULT_BRANDS if empty)
 * @param {object} options
 * @param {boolean} [options.includeDeleted=false]
 * @param {boolean} [options.activeOnly=false]
 * @returns {Array}
 */
export function getBrands(options = {}) {
  const { includeDeleted = false, activeOnly = false } = options;
  const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(BRANDS_STORAGE_KEY) : null;
  let list = [];

  if (raw) {
    try {
      list = JSON.parse(raw);
      if (!Array.isArray(list)) list = [];
    } catch (e) {
      list = [];
    }
  }

  if (includeDeleted) return list;
  if (activeOnly) return list.filter(b => (b.status || (b.active !== false ? 'ACTIVE' : 'INACTIVE')).toUpperCase() === 'ACTIVE');
  // Default: Exclude soft-deleted brands
  return list.filter(b => (b.status || '').toUpperCase() !== 'DELETED');
}

/**
 * Sync brands directly from backend REST API
 */
export async function syncBrandsFromApi(options = {}) {
  try {
    const res = await BrandsApi.getAll();
    let apiList = [];
    if (Array.isArray(res)) {
      apiList = res;
    } else if (res && Array.isArray(res.data)) {
      apiList = res.data;
    }
    const normalized = apiList.map(b => ({
      id: b.id,
      name: b.name || '',
      slug: b.slug || '',
      logo: b.logo || b.logoUrl || '',
      logoUrl: b.logoUrl || b.logo || '',
      country: b.country || '',
      website: b.website || '',
      description: b.description || '',
      featured: Boolean(b.featured),
      status: (b.status || (b.active !== false ? 'ACTIVE' : 'INACTIVE')).toUpperCase(),
      active: (b.status || '').toUpperCase() === 'ACTIVE' || b.active === true
    }));
    saveBrands(normalized);
    return getBrands(options);
  } catch (err) {
    console.warn('[BrandModel] Brands API sync notice:', err.message);
    return getBrands(options);
  }
}

/**
 * Retrieve only deleted brands for SuperADMIN Trash Bin
 */
export function getDeletedBrands() {
  const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(BRANDS_STORAGE_KEY) : null;
  if (!raw) return [];
  try {
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return [];
    return list.filter(b => (b.status || '').toUpperCase() === 'DELETED');
  } catch (e) {
    return [];
  }
}

/**
 * Save the entire brands array to storage
 */
export function saveBrands(brandsList) {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(BRANDS_STORAGE_KEY, JSON.stringify(brandsList));
  }
}

/**
 * Retrieve a brand by its unique ID
 */
export function getBrandById(id) {
  if (!id) return null;
  const brands = getBrands({ includeDeleted: true });
  return brands.find(b => b.id.toLowerCase() === id.toLowerCase()) || null;
}

/**
 * Retrieve a brand by its unique URL slug
 */
export function getBrandBySlug(slug) {
  if (!slug) return null;
  const normalized = slug.toLowerCase().trim();
  const brands = getBrands({ includeDeleted: true });
  return brands.find(b => b.slug.toLowerCase() === normalized || b.name.toLowerCase() === normalized || b.id.toLowerCase() === normalized) || null;
}

/**
 * Retrieve all active brands featured on the homepage showcase
 */
export function getFeaturedBrands() {
  const brands = getBrands({ activeOnly: true });
  return brands.filter(b => b.featured).sort((a, b) => (a.displayOrder || 99) - (b.displayOrder || 99));
}

/**
 * Count active store catalog products associated with a brand
 */
export function getBrandProductCount(brandNameOrSlug) {
  if (!brandNameOrSlug) return 0;
  const target = brandNameOrSlug.toLowerCase().trim();
  const products = getStoredProducts();
  return products.filter(p => {
    const pBrand = (p.brand || '').toLowerCase().trim();
    return pBrand === target || pBrand.includes(target) || target.includes(pBrand);
  }).length;
}

/**
 * Create or Update a Brand record
 */
export async function saveBrand(brandData) {
  if (!brandData || !brandData.name || !brandData.name.trim()) {
    return { success: false, message: "Brand name is required." };
  }

  const brands = getBrands({ includeDeleted: true });
  const rawName = brandData.name.trim();
  const slug = brandData.slug ? brandData.slug.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-') : rawName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const now = new Date().toISOString();
  const status = (brandData.status || (brandData.active !== false ? 'ACTIVE' : 'INACTIVE')).toUpperCase();

  // Check if updating existing brand
  if (brandData.id) {
    const index = brands.findIndex(b => b.id.toLowerCase() === brandData.id.toLowerCase());
    if (index !== -1) {
      const duplicateSlug = brands.find((b, idx) => idx !== index && b.slug.toLowerCase() === slug);
      if (duplicateSlug) {
        return { success: false, message: `A brand with the slug "${slug}" already exists.` };
      }

      brands[index] = {
        ...brands[index],
        ...brandData,
        name: rawName,
        slug: slug,
        logo: brandData.logo || brandData.logoUrl || brands[index].logo,
        logoUrl: brandData.logo || brandData.logoUrl || brands[index].logo,
        status: status,
        active: status === 'ACTIVE',
        updatedAt: now
      };

      saveBrands(brands);

      try {
        await BrandsApi.update(brands[index].id, brands[index]);
      } catch (err) {
        console.warn('[BrandModel] Backend brand update notice:', err.message);
      }

      return { success: true, brand: brands[index], isNew: false, message: `Brand "${rawName}" updated successfully.` };
    }
  }

  // Create New Brand
  const duplicateSlug = brands.find(b => b.slug.toLowerCase() === slug);
  if (duplicateSlug) {
    return { success: false, message: `A brand with the slug "${slug}" already exists.` };
  }

  const generatedId = `brd-${slug}`;
  const newBrand = {
    id: generatedId,
    name: rawName,
    slug: slug,
    logo: brandData.logo || brandData.logoUrl || '',
    logoUrl: brandData.logo || brandData.logoUrl || '',
    country: brandData.country || 'Global',
    founded: brandData.founded || brandData.foundedYear || '',
    foundedYear: brandData.founded || brandData.foundedYear || '',
    website: brandData.website || brandData.websiteUrl || '',
    websiteUrl: brandData.website || brandData.websiteUrl || '',
    tagline: brandData.tagline || '',
    description: brandData.description || '',
    featured: Boolean(brandData.featured),
    displayOrder: brandData.displayOrder !== undefined ? Number(brandData.displayOrder) : brands.length + 1,
    status: status,
    active: status === 'ACTIVE',
    createdAt: now,
    updatedAt: now
  };

  brands.push(newBrand);
  saveBrands(brands);

  try {
    await BrandsApi.create(newBrand);
  } catch (err) {
    console.warn('[BrandModel] Backend brand create notice:', err.message);
  }

  return { success: true, brand: newBrand, isNew: true, message: `Brand "${rawName}" registered successfully.` };
}

/**
 * Update brand lifecycle status (ACTIVE, INACTIVE, DELETED)
 */
export async function updateBrandStatus(id, newStatus) {
  const upperStatus = (newStatus || 'ACTIVE').toUpperCase();
  const brands = getBrands({ includeDeleted: true });
  const index = brands.findIndex(b => b.id.toLowerCase() === id.toLowerCase());

  if (index !== -1) {
    brands[index].status = upperStatus;
    brands[index].active = upperStatus === 'ACTIVE';
    brands[index].updatedAt = new Date().toISOString();
    saveBrands(brands);

    try {
      await BrandsApi.updateStatus(brands[index].id, upperStatus);
    } catch (err) {
      console.warn(`[BrandModel] Backend brand status update notice for ${id}:`, err.message);
    }

    return { success: true, brand: brands[index] };
  }
  return { success: false, message: 'Brand not found.' };
}

/**
 * Soft delete a brand (sets status to DELETED)
 */
export async function deleteBrand(id) {
  if (!id) return { success: false, message: "Brand ID is required." };
  const brands = getBrands({ includeDeleted: true });
  const targetBrand = brands.find(b => b.id.toLowerCase() === id.toLowerCase());
  if (!targetBrand) {
    return { success: false, message: "Brand not found." };
  }

  const res = await updateBrandStatus(id, 'DELETED');
  try {
    await BrandsApi.delete(id);
  } catch (err) {
    console.warn(`[BrandModel] Backend brand soft-delete notice for ${id}:`, err.message);
  }

  return { success: true, message: `Brand "${targetBrand.name}" moved to Trash Bin.` };
}

/**
 * Restore soft-deleted brand back to ACTIVE status
 */
export async function restoreBrand(id) {
  return await updateBrandStatus(id, 'ACTIVE');
}

/**
 * Permanently delete brand from storage and database (SuperADMIN only)
 */
export async function permanentlyDeleteBrand(id) {
  let brands = getBrands({ includeDeleted: true });
  const targetBrand = brands.find(b => b.id.toLowerCase() === id.toLowerCase());
  brands = brands.filter(b => b.id.toLowerCase() !== id.toLowerCase());
  saveBrands(brands);

  try {
    await BrandsApi.permaDelete(id);
  } catch (err) {
    console.warn(`[BrandModel] Backend brand perma-delete notice for ${id}:`, err.message);
  }

  return { success: true, brand: targetBrand };
}

/**
 * Toggle brand featured status for the homepage showcase
 */
export function toggleBrandFeatured(id) {
  if (!id) return { success: false };
  const brands = getBrands({ includeDeleted: true });
  const brand = brands.find(b => b.id.toLowerCase() === id.toLowerCase());
  if (!brand) return { success: false, message: "Brand not found." };

  brand.featured = !brand.featured;
  brand.updatedAt = new Date().toISOString();
  saveBrands(brands);
  return { success: true, featured: brand.featured, message: `Brand "${brand.name}" ${brand.featured ? 'is now featured on homepage' : 'removed from homepage showcase'}.` };
}
