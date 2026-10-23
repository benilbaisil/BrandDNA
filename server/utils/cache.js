/**
 * High-performance In-Memory TTL Cache for BrandDNA AI
 * Eliminates cloud database round-trip delays across all pages.
 */
class MemoryCache {
  constructor() {
    this.store = new Map();
  }

  get(key) {
    const item = this.store.get(key);
    if (!item) return null;
    if (Date.now() > item.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return item.data;
  }

  set(key, data, ttlSeconds = 30) {
    this.store.set(key, {
      data,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  del(key) {
    this.store.delete(key);
  }

  invalidatePrefix(prefix) {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
      }
    }
  }

  flush() {
    this.store.clear();
  }

  flushAll() {
    this.store.clear();
  }
}

export const cache = new MemoryCache();
