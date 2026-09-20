// ============================================
// MIDC Transport Calculator — UID Generator
// ============================================

/**
 * Generates a unique ID string.
 * Uses crypto.randomUUID when available, falls back to timestamp + random.
 * @param {string} [prefix] - Optional prefix (e.g., 'part', 'route')
 * @returns {string}
 */
export function generateId(prefix = '') {
  let id;
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    id = crypto.randomUUID();
  } else {
    id = Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 10);
  }
  return prefix ? `${prefix}-${id}` : id;
}
