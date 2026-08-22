// ============================================================
//  src/js/models/brand_data.js — Hardware Brands Model & Operations
// ============================================================
import { DEFAULT_BRANDS } from '../../data/brands.js';
import { getStoredProducts } from './data.js';

export const BRANDS_STORAGE_KEY = 'etech_brands_data';

/**
 * Retrieve all brands from storage (hydrates from DEFAULT_BRANDS if empty)
 */
export function getBrands() {
  const raw = localStorage.getItem(BRANDS_STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(BRANDS_STORAGE_KEY, JSON.stringify(DEFAULT_BRANDS));
    return [...DEFAULT_BRANDS];
  }
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(BRANDS_STORAGE_KEY, JSON.stringify(DEFAULT_BRANDS));
      return [...DEFAULT_BRANDS];
    }
    // Self-healing migration for logo URLs
    let needsUpdate = false;
    const migrated = parsed.map(b => {
      const defaultMatch = DEFAULT_BRANDS.find(d => d.slug === b.slug || d.id === b.id);
      if (defaultMatch && b.logo && b.logo.includes('wikimedia.org')) {
        needsUpdate = true;
        return { ...b, logo: defaultMatch.logo };
      }
      return b;
    });
    if (needsUpdate) {
      localStorage.setItem(BRANDS_STORAGE_KEY, JSON.stringify(migrated));
      return migrated;
    }
    return parsed;
  } catch (e) {
    console.error("Error reading brands from storage:", e);
    return [...DEFAULT_BRANDS];
  }
}

/**
 * Save the entire brands array to storage
 */
export function saveBrands(brandsList) {
  localStorage.setItem(BRANDS_STORAGE_KEY, JSON.stringify(brandsList));
}

/**
 * Retrieve a brand by its unique ID
 */
export function getBrandById(id) {
  if (!id) return null;
  const brands = getBrands();
  return brands.find(b => b.id.toLowerCase() === id.toLowerCase()) || null;
}

/**
 * Retrieve a brand by its unique URL slug
 */
export function getBrandBySlug(slug) {
  if (!slug) return null;
  const normalized = slug.toLowerCase().trim();
  const brands = getBrands();
  return brands.find(b => b.slug.toLowerCase() === normalized || b.name.toLowerCase() === normalized) || null;
}

/**
 * Retrieve all active brands featured on the homepage showcase
 */
export function getFeaturedBrands() {
  const brands = getBrands();
  return brands.filter(b => b.active !== false && b.featured).sort((a, b) => (a.displayOrder || 99) - (b.displayOrder || 99));
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
export function saveBrand(brandData) {
  if (!brandData || !brandData.name || !brandData.name.trim()) {
    return { success: false, message: "Brand name is required." };
  }

  const brands = getBrands();
  const rawName = brandData.name.trim();
  const slug = brandData.slug ? brandData.slug.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-') : rawName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const now = new Date().toISOString();

  // Check if updating existing brand
  if (brandData.id) {
    const index = brands.findIndex(b => b.id.toLowerCase() === brandData.id.toLowerCase());
    if (index !== -1) {
      // Slug uniqueness check
      const duplicateSlug = brands.find((b, idx) => idx !== index && b.slug.toLowerCase() === slug);
      if (duplicateSlug) {
        return { success: false, message: `A brand with the slug "${slug}" already exists.` };
      }

      brands[index] = {
        ...brands[index],
        ...brandData,
        name: rawName,
        slug: slug,
        updatedAt: now
      };

      saveBrands(brands);
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
    logo: brandData.logo || '',
    country: brandData.country || 'Global',
    founded: brandData.founded || '',
    website: brandData.website || '',
    tagline: brandData.tagline || '',
    description: brandData.description || '',
    featured: Boolean(brandData.featured),
    displayOrder: brandData.displayOrder !== undefined ? Number(brandData.displayOrder) : brands.length + 1,
    active: brandData.active !== false,
    createdAt: now,
    updatedAt: now
  };

  brands.push(newBrand);
  saveBrands(brands);
  return { success: true, brand: newBrand, isNew: true, message: `Brand "${rawName}" registered successfully.` };
}

/**
 * Delete a brand (with safety check: cannot delete if store products are assigned to it)
 */
export function deleteBrand(id) {
  if (!id) return { success: false, message: "Brand ID is required." };
  const brands = getBrands();
  const targetBrand = brands.find(b => b.id.toLowerCase() === id.toLowerCase());
  if (!targetBrand) {
    return { success: false, message: "Brand not found." };
  }

  // Check if products in store are assigned to this brand
  const productCount = getBrandProductCount(targetBrand.name);
  if (productCount > 0) {
    return {
      success: false,
      message: `Cannot delete "${targetBrand.name}" because ${productCount} active product(s) in the catalog are currently assigned to this brand. Please reassign those products first.`
    };
  }

  const updated = brands.filter(b => b.id.toLowerCase() !== id.toLowerCase());
  saveBrands(updated);
  return { success: true, message: `Brand "${targetBrand.name}" was removed successfully.` };
}

/**
 * Toggle brand featured status for the homepage showcase
 */
export function toggleBrandFeatured(id) {
  if (!id) return { success: false };
  const brands = getBrands();
  const brand = brands.find(b => b.id.toLowerCase() === id.toLowerCase());
  if (!brand) return { success: false, message: "Brand not found." };

  brand.featured = !brand.featured;
  brand.updatedAt = new Date().toISOString();
  saveBrands(brands);
  return { success: true, featured: brand.featured, message: `Brand "${brand.name}" ${brand.featured ? 'is now featured on homepage' : 'removed from homepage showcase'}.` };
}
