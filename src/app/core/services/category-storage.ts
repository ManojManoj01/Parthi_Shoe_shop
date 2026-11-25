import { Category, CategoryRequest, Product } from '../models/product.model';

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 1,
    name: 'Slippers',
    slug: 'chappals',
    description: 'Traditional handcrafted leather slippers, orthopaedic daily slides, and comfort temple footwear.',
    imageUrl: 'https://images.unsplash.com/photo-1603487742131-4160ec999306?auto=format&fit=crop&w=600&q=80',
    displayOrder: 1,
    active: true,
    productCount: 4,
    itemCount: 4
  },
  {
    id: 2,
    name: "Men's Footwear",
    slug: 'men',
    description: 'Executive formal shoes, casual loafers, walking sandals, and sports runners for men.',
    imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80',
    displayOrder: 2,
    active: true,
    productCount: 2,
    itemCount: 2
  },
  {
    id: 3,
    name: "Women's Footwear",
    slug: 'women',
    description: 'Comfort block heels, flats, daily wedges, and slip-on walking trainers for women.',
    imageUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=600&q=80',
    displayOrder: 3,
    active: true,
    productCount: 2,
    itemCount: 2
  },
  {
    id: 4,
    name: 'Sports & Athletics',
    slug: 'sports',
    description: 'High-performance marathon runners, gym trainers, and active athletic footwear.',
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
    displayOrder: 4,
    active: true,
    productCount: 2,
    itemCount: 2
  },
  {
    id: 5,
    name: 'Formal Elegance',
    slug: 'formal',
    description: 'Hand-burnished pure leather Oxford brogues, derby shoes, and executive slip-on loafers.',
    imageUrl: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=600&q=80',
    displayOrder: 5,
    active: true,
    productCount: 2,
    itemCount: 2
  },
  {
    id: 6,
    name: 'Casual Lifestyle',
    slug: 'casual',
    description: 'Street low-top canvas sneakers, suede chukka boots, and relaxed slip-on sneakers.',
    imageUrl: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=600&q=80',
    displayOrder: 6,
    active: true,
    productCount: 2,
    itemCount: 2
  },
  {
    id: 7,
    name: "Kids' Collection",
    slug: 'kids',
    description: 'Playproof velcro sneakers, soft anti-slip sandals, and lightweight school shoes.',
    imageUrl: 'https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=600&q=80',
    displayOrder: 7,
    active: true,
    productCount: 1,
    itemCount: 1
  }
];

const STORAGE_KEY = 'palani_custom_categories';
const COOKIE_NAME = 'palani_custom_categories';
const DEACTIVATED_KEY = 'stepstyle_deactivated_categories';
const DEACTIVATED_COOKIE = 'stepstyle_deactivated_categories';

function parseCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
  return match ? decodeURIComponent(match[3]) : null;
}

function writeCookie(name: string, value: string): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=31536000; SameSite=Lax`;
}

export function getDeactivatedCategoryKeys(): Set<string> {
  let list: string[] = [];
  if (typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem(DEACTIVATED_KEY);
      if (raw) list = JSON.parse(raw);
    } catch {}
  }
  if (!list || list.length === 0) {
    try {
      const cookie = parseCookie(DEACTIVATED_COOKIE);
      if (cookie) list = JSON.parse(cookie);
    } catch {}
  }
  return new Set(Array.isArray(list) ? list.map(s => String(s).toLowerCase().trim()) : []);
}

export function saveDeactivatedCategoryKeys(keys: Set<string>): void {
  const arr = Array.from(keys);
  const json = JSON.stringify(arr);
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(DEACTIVATED_KEY, json);
    } catch {}
  }
  try {
    writeCookie(DEACTIVATED_COOKIE, json);
  } catch {}
}

export function isCategoryDeactivated(cat: Partial<Category> | null | undefined): boolean {
  if (!cat) return false;
  const set = getDeactivatedCategoryKeys();
  const idStr = cat.id !== undefined && cat.id !== null ? String(cat.id).toLowerCase().trim() : '';
  const slugStr = String(cat.slug || '').toLowerCase().trim();
  const nameStr = String(cat.name || '').toLowerCase().trim();
  return (!!idStr && set.has(idStr)) || (!!slugStr && set.has(slugStr)) || (!!nameStr && set.has(nameStr));
}

export function deactivateCategory(cat: Category | { id?: number | string; slug?: string; name?: string }): void {
  const set = getDeactivatedCategoryKeys();
  if (cat.id !== undefined && cat.id !== null) set.add(String(cat.id).toLowerCase().trim());
  if (cat.slug) set.add(String(cat.slug).toLowerCase().trim());
  if (cat.name) set.add(String(cat.name).toLowerCase().trim());
  saveDeactivatedCategoryKeys(set);

  // Also remove from custom categories if present
  const custom = getCustomCategories();
  const filtered = custom.filter(c => 
    String(c.id) !== String(cat.id) &&
    c.slug?.toLowerCase().trim() !== cat.slug?.toLowerCase().trim()
  );
  saveCustomCategories(filtered);
}

export function reactivateCategory(slugOrName: string): void {
  if (!slugOrName) return;
  const set = getDeactivatedCategoryKeys();
  const lower = slugOrName.toLowerCase().trim();
  set.delete(lower);
  saveDeactivatedCategoryKeys(set);
}

export function getCustomCategories(): Category[] {
  let rawJson: string | null = null;

  if (typeof localStorage !== 'undefined') {
    try {
      rawJson = localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      // Ignore
    }
  }

  if (!rawJson) {
    try {
      rawJson = parseCookie(COOKIE_NAME);
    } catch (e) {
      // Ignore
    }
  }

  if (rawJson) {
    try {
      const parsed = JSON.parse(rawJson);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch (e) {
      try {
        const cookieJson = parseCookie(COOKIE_NAME);
        if (cookieJson) {
          const cookieParsed = JSON.parse(cookieJson);
          if (Array.isArray(cookieParsed) && cookieParsed.length > 0) {
            return cookieParsed;
          }
        }
      } catch {}
    }
  }

  return [];
}

export function saveCustomCategories(categories: Category[]): void {
  const json = JSON.stringify(categories);

  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, json);
    } catch (e) {
      // Ignore
    }
  }

  try {
    writeCookie(COOKIE_NAME, json);
  } catch (e) {
    // Ignore
  }
}

export function getAllCategoriesMerged(): Category[] {
  const custom = getCustomCategories();
  const merged: Category[] = [...DEFAULT_CATEGORIES];

  for (const cat of custom) {
    if (!cat || !cat.name) continue;
    const catSlug = (cat.slug || '').toLowerCase();
    const catName = (cat.name || '').toLowerCase();

    const existingIndex = merged.findIndex(m => {
      const mSlug = (m.slug || '').toLowerCase();
      const mName = (m.name || '').toLowerCase();
      return (catSlug && mSlug === catSlug) || (catName && mName === catName);
    });

    if (existingIndex >= 0) {
      merged[existingIndex] = { ...merged[existingIndex], ...cat };
    } else {
      merged.push(cat);
    }
  }

  return merged.filter(c => !isCategoryDeactivated(c) && c.active !== false);
}

export function addCustomCategory(req: CategoryRequest): Category {
  const custom = getCustomCategories();
  const slug = (req.slug || req.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')).toLowerCase();

  reactivateCategory(slug);
  if (req.name) reactivateCategory(req.name);

  const newCat: Category = {
    id: Date.now(),
    name: req.name.trim(),
    slug,
    description: req.description || 'Custom footwear category added by store administrator.',
    imageUrl: req.imageUrl || 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80',
    displayOrder: (req.displayOrder ?? custom.length + 8),
    active: true,
    productCount: 0,
    itemCount: 0
  };

  const filtered = custom.filter(c => c.slug.toLowerCase() !== slug);
  filtered.push(newCat);
  saveCustomCategories(filtered);

  return newCat;
}

export function removeCustomCategory(idOrCat: number | string | Category): void {
  if (typeof idOrCat === 'object' && idOrCat !== null) {
    deactivateCategory(idOrCat);
  } else {
    deactivateCategory({ id: idOrCat });
  }
}

export function isProductMatchingCategory(product: Product, category: Category): boolean {
  if (!product || !category) return false;
  const pCat = String(product.category || '').toLowerCase().trim();
  const cSlug = String(category.slug || '').toLowerCase().trim();
  const cName = String(category.name || '').toLowerCase().trim();
  if (pCat === cSlug || pCat === cName) return true;
  if ((cSlug === 'chappals' || cSlug === 'slippers') && (pCat === 'chappals' || pCat === 'slippers' || pCat === 'chappal')) return true;
  return false;
}

export function calculateCategoryCounts(categories: Category[], products: Product[]): Category[] {
  const activeCats = (categories || []).filter(c => !isCategoryDeactivated(c) && c.active !== false);
  return activeCats.map(cat => {
    const matchingProducts = (products || []).filter(p => isProductMatchingCategory(p, cat));
    const totalStock = matchingProducts.reduce((sum, p) => sum + (Number(p.stockQuantity) || 0), 0);

    return {
      ...cat,
      productCount: matchingProducts.length,
      itemCount: matchingProducts.length,
      stockCount: totalStock
    };
  });
}
