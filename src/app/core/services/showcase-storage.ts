export interface ShowcaseConfig {
  featuredIds: string[];
  bestSellerIds: string[];
}

const STORAGE_KEY = 'palani_showcase_config';
const COOKIE_NAME = 'palani_showcase_config';

function parseCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
  return match ? decodeURIComponent(match[3]) : null;
}

function writeCookie(name: string, value: string): void {
  if (typeof document === 'undefined') return;
  // Set cookie for 1 year with path=/ so all localhost ports (4200, 4201, 8080) share it
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=31536000; SameSite=Lax`;
}

export function getShowcaseConfig(): ShowcaseConfig {
  let rawJson: string | null = null;

  // 1. Try reading from shared document.cookie first (shared across all localhost ports)
  try {
    rawJson = parseCookie(COOKIE_NAME);
  } catch (e) {
    // Ignore in SSR
  }

  // 2. Fall back to localStorage if cookie not found
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
      return {
        featuredIds: Array.isArray(parsed?.featuredIds) ? parsed.featuredIds.map(String) : [],
        bestSellerIds: Array.isArray(parsed?.bestSellerIds) ? parsed.bestSellerIds.map(String) : []
      };
    } catch (e) {
      // Invalid JSON
    }
  }

  // Initial state: EMPTY. No products are automatically selected.
  // Selection MUST be performed manually by the admin.
  return {
    featuredIds: [],
    bestSellerIds: []
  };
}

export function saveShowcaseConfig(config: ShowcaseConfig): void {
  const normalized: ShowcaseConfig = {
    featuredIds: Array.from(new Set(config.featuredIds.map(String))),
    bestSellerIds: Array.from(new Set(config.bestSellerIds.map(String)))
  };
  const json = JSON.stringify(normalized);

  // Write to cookie (shared across localhost:4200 and localhost:4201)
  try {
    writeCookie(COOKIE_NAME, json);
  } catch (e) {
    // Ignore in SSR
  }

  // Write to localStorage
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, json);
    } catch (e) {
      // Ignore
    }
  }
}

export function isProductFeatured(id: string | number): boolean {
  const config = getShowcaseConfig();
  return config.featuredIds.includes(String(id));
}

export function isProductBestSeller(id: string | number): boolean {
  const config = getShowcaseConfig();
  return config.bestSellerIds.includes(String(id));
}

export function toggleProductFeatured(id: string | number, forceValue?: boolean): boolean {
  const idStr = String(id);
  const config = getShowcaseConfig();
  const exists = config.featuredIds.includes(idStr);
  const shouldBe = forceValue !== undefined ? forceValue : !exists;

  if (shouldBe && !exists) {
    config.featuredIds.push(idStr);
  } else if (!shouldBe && exists) {
    config.featuredIds = config.featuredIds.filter(item => item !== idStr);
  }

  saveShowcaseConfig(config);
  return shouldBe;
}

export function toggleProductBestSeller(id: string | number, forceValue?: boolean): boolean {
  const idStr = String(id);
  const config = getShowcaseConfig();
  const exists = config.bestSellerIds.includes(idStr);
  const shouldBe = forceValue !== undefined ? forceValue : !exists;

  if (shouldBe && !exists) {
    config.bestSellerIds.push(idStr);
  } else if (!shouldBe && exists) {
    config.bestSellerIds = config.bestSellerIds.filter(item => item !== idStr);
  }

  saveShowcaseConfig(config);
  return shouldBe;
}
