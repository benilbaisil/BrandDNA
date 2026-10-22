/**
 * Instant Client-Side SWR Storage Cache
 * Eliminates all data loading delays across pages by restoring cached data on millisecond 0.
 */
export const storageCache = {
  get: (key, defaultValue = null) => {
    try {
      const item = sessionStorage.getItem(`bdna_cache_${key}`) || localStorage.getItem(`bdna_cache_${key}`);
      if (!item) return defaultValue;
      const parsed = JSON.parse(item);
      return parsed?.data !== undefined ? parsed.data : defaultValue;
    } catch (e) {
      return defaultValue;
    }
  },
  set: (key, data) => {
    try {
      const val = JSON.stringify({ data, timestamp: Date.now() });
      sessionStorage.setItem(`bdna_cache_${key}`, val);
      localStorage.setItem(`bdna_cache_${key}`, val);
    } catch (e) {}
  },
  del: (key) => {
    try {
      sessionStorage.removeItem(`bdna_cache_${key}`);
      localStorage.removeItem(`bdna_cache_${key}`);
    } catch (e) {}
  },
};
