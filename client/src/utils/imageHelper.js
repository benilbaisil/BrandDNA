/**
 * Image helper utility for BrandDNA
 * Safely resolves relative and server URLs for uploaded return evidence photos and products
 */
export const getFullImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('data:') || path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  // If running in development with Vite proxying /uploads or in production
  if (path.startsWith('/')) {
    return path;
  }
  return `/${path}`;
};
