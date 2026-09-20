// ============================================
// MIDC Transport Calculator — Formatting
// ============================================

/**
 * Format a number as Indian Rupees currency.
 * @param {number} amount
 * @returns {string} e.g., "₹1,250"
 */
export function formatCurrency(amount) {
  if (amount == null || isNaN(amount)) return '₹0';
  return '₹' + amount.toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
}

/**
 * Format weight with kg suffix.
 * @param {number} weight - Weight in kg
 * @returns {string} e.g., "700 kg"
 */
export function formatWeight(weight) {
  if (weight == null || isNaN(weight)) return '0 kg';
  return weight.toLocaleString('en-IN') + ' kg';
}

/**
 * Format a route for display.
 * @param {{ source: string, destination: string }} route
 * @returns {string} e.g., "Ambad → Satpur"
 */
export function formatRoute(route) {
  if (!route) return '';
  return `${route.source} → ${route.destination}`;
}
