import { Category, Product } from '../models/product.model';

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'cat_chappals',
    name: 'Slippers',
    slug: 'chappals',
    description: 'Authentic South Indian leather sandals, orthopaedic slippers, and daily slide comforts.',
    image: 'https://images.unsplash.com/photo-1603487742131-4160ec999306?auto=format&fit=crop&w=600&q=80',
    itemCount: 4
  },
  {
    id: 'cat_men',
    name: "Men's Footwear",
    slug: 'men',
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80',
    description: 'Elevate your stride with athletic runners, formal oxfords, and versatile loafers.',
    itemCount: 2
  },
  {
    id: 'cat_women',
    name: "Women's Footwear",
    slug: 'women',
    image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=600&q=80',
    description: 'Graceful heels, cushioned flats, running trainers, and everyday comfort.',
    itemCount: 2
  },
  {
    id: 'cat_sports',
    name: 'Sports & Athletics',
    slug: 'sports',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
    description: 'High-performance marathons, gym trainers, cricket spikes, and court shoes.',
    itemCount: 2
  },
  {
    id: 'cat_formal',
    name: 'Formal Elegance',
    slug: 'formal',
    image: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=600&q=80',
    description: 'Handcrafted genuine leather oxfords, derbies, and executive slip-ons.',
    itemCount: 2
  },
  {
    id: 'cat_casual',
    name: 'Casual & Lifestyle',
    slug: 'casual',
    image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=600&q=80',
    description: 'Trendsetting street sneakers, boat shoes, canvas, and relaxed loafers.',
    itemCount: 2
  },
  {
    id: 'cat_kids',
    name: "Kids' Collection",
    slug: 'kids',
    image: 'https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=600&q=80',
    description: 'Playproof sneakers, school shoes, and soft flexible sandals for little explorers.',
    itemCount: 1
  }
];

const COOKIE_NAME = 'palani_custom_categories';
const STORAGE_KEY = 'palani_custom_categories';
const DEACTIVATED_COOKIE = 'stepstyle_deactivated_categories';
const DEACTIVATED_KEY = 'stepstyle_deactivated_categories';

function parseCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
  return match ? decodeURIComponent(match[3]) : null;
}

export function getDeactivatedCategoriesForStore(): Set<string> {
  let list: string[] = [];
  try {
    const cookie = parseCookie(DEACTIVATED_COOKIE);
    if (cookie) list = JSON.parse(cookie);
  } catch {}
  if ((!list || list.length === 0) && typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem(DEACTIVATED_KEY);
      if (raw) list = JSON.parse(raw);
    } catch {}
  }
  return new Set(Array.isArray(list) ? list.map(s => String(s).toLowerCase().trim()) : []);
}

export function getCustomCategoriesForStore(): Category[] {
  let rawJson: string | null = null;

  try {
    rawJson = parseCookie(COOKIE_NAME);
  } catch (e) {
    // Ignore in SSR
  }

  if (!rawJson && typeof localStorage !== 'undefined') {
    try {
      rawJson = localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      // Ignore
    }
  }

  if (rawJson) {
    try {
      const parsed = JSON.parse(rawJson);
      if (Array.isArray(parsed)) {
        return parsed.map((c: any) => ({
          id: `cat_${c.slug}`,
          name: c.name,
          slug: c.slug,
          image: c.imageUrl || 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80',
          description: c.description || 'Footwear collection',
          itemCount: c.productCount ?? 0
        }));
      }
    } catch (e) {
      // Ignore
    }
  }

  return [];
}

export function getMergedStoreCategories(): Category[] {
  const custom = getCustomCategoriesForStore();
  const merged: Category[] = [...DEFAULT_CATEGORIES];

  for (const c of custom) {
    const idx = merged.findIndex(m => m.slug.toLowerCase() === c.slug.toLowerCase());
    if (idx >= 0) {
      merged[idx] = { ...merged[idx], ...c };
    } else {
      merged.push(c);
    }
  }

  const deactivated = getDeactivatedCategoriesForStore();
  return merged.filter(c => {
    const id = String(c.id).toLowerCase().trim();
    const slug = (c.slug || '').toLowerCase().trim();
    const name = (c.name || '').toLowerCase().trim();
    return !deactivated.has(id) && !deactivated.has(slug) && !deactivated.has(name);
  });
}
