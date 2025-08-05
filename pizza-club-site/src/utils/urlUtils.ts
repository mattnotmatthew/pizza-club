/**
 * URL Utility Functions
 * 
 * Handles slug generation for member URLs
 */

/**
 * Convert a member name to a URL-friendly slug
 * 
 * @param name - The member's display name
 * @returns URL-safe slug
 * 
 * @example
 * nameToSlug("John Doe") // "john-doe"
 * nameToSlug("José García") // "jose-garcia"
 * nameToSlug("Mary O'Brien") // "mary-obrien"
 */
export function nameToSlug(name: string): string {
  return name
    .toLowerCase()
    // Remove accents and diacriticals
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Replace spaces with hyphens
    .replace(/\s+/g, '-')
    // Remove all non-alphanumeric characters except hyphens
    .replace(/[^a-z0-9-]/g, '')
    // Remove multiple consecutive hyphens
    .replace(/-+/g, '-')
    // Remove hyphens from start and end
    .replace(/^-+|-+$/g, '');
}

/**
 * Generate a unique slug, adding numeric suffix if needed
 * 
 * @param name - The member's display name
 * @param existingSlugs - Array of existing slugs to check against
 * @returns Unique URL-safe slug
 * 
 * @example
 * generateUniqueSlug("John Doe", ["john-doe"]) // "john-doe-2"
 * generateUniqueSlug("John Doe", ["john-doe", "john-doe-2"]) // "john-doe-3"
 */
export function generateUniqueSlug(name: string, existingSlugs: string[]): string {
  const baseSlug = nameToSlug(name);
  
  // If base slug doesn't exist, use it
  if (!existingSlugs.includes(baseSlug)) {
    return baseSlug;
  }
  
  // Find the next available number
  let counter = 2;
  let candidateSlug = `${baseSlug}-${counter}`;
  
  while (existingSlugs.includes(candidateSlug)) {
    counter++;
    candidateSlug = `${baseSlug}-${counter}`;
  }
  
  return candidateSlug;
}

/**
 * Convert a slug back to a searchable name (for fallback lookup)
 * This is a best-effort conversion and may not perfectly match the original name
 * 
 * @param slug - The URL slug
 * @returns Name suitable for searching
 * 
 * @example
 * slugToName("john-doe") // "john doe"
 * slugToName("mary-obrien-2") // "mary obrien 2"
 */
export function slugToName(slug: string): string {
  return slug
    // Replace hyphens with spaces
    .replace(/-/g, ' ')
    // Remove numeric suffix if present (e.g., "-2" at the end)
    .replace(/\s+\d+$/, '')
    .trim();
}