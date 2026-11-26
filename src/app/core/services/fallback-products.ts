import { Product } from '../models/product.model';

export const FALLBACK_PRODUCTS: Product[] = [];

const LOCAL_PRODUCTS_KEY = 'palani_local_products_catalog';
const DELETED_PRODUCTS_KEY = 'stepstyle_deleted_product_ids';

// Always clear legacy local product cache so Admin Portal reflects Supabase directly
if (typeof localStorage !== 'undefined') {
  try {
    localStorage.removeItem(LOCAL_PRODUCTS_KEY);
  } catch {
    // Ignore
  }
}

export function getDeletedProductIds(): Set<string> {
  if (typeof localStorage === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(DELETED_PRODUCTS_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr.map(String) : []);
  } catch {
    return new Set();
  }
}

export function markProductAsDeleted(id: string | number): void {
  if (typeof localStorage === 'undefined') return;
  try {
    const set = getDeletedProductIds();
    set.add(String(id));
    localStorage.setItem(DELETED_PRODUCTS_KEY, JSON.stringify(Array.from(set)));
  } catch (e) {
    console.error('Failed to save deleted product ID:', e);
  }
}

export function isProductDeleted(id: string | number | undefined | null): boolean {
  if (!id) return false;
  return getDeletedProductIds().has(String(id));
}

export function isJunkProduct(p: any): boolean {
  if (!p) return true;
  if (p.id && isProductDeleted(p.id)) return true;
  const name = String(p.name || '').toLowerCase().trim();
  const desc = String(p.description || '').toLowerCase().trim();
  const brand = String(p.brand || '').toLowerCase().trim();
  const junkPatterns = ['xncmzm', 'nlxcvnc', 'dfkdslkff', 'z xc,mx', 'z,mc,zlxk', 's,mdflkjs', 'sndflkj'];
  for (const pattern of junkPatterns) {
    if (name.includes(pattern) || desc.includes(pattern) || brand.includes(pattern)) {
      return true;
    }
  }
  return false;
}

export function getStoredProducts(): Product[] {
  return [];
}

export function saveStoredProducts(_products: Product[]): void {
  clearStoredProducts();
}

export function clearStoredProducts(): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.removeItem(LOCAL_PRODUCTS_KEY);
  } catch {
    // Ignore
  }
}
