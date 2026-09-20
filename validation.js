// ============================================
// MIDC Transport Calculator — Validation
// ============================================

/**
 * Validate that a weight is a positive multiple of 100.
 * @param {number|string} weight
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateWeight(weight) {
  const num = typeof weight === 'string' ? parseFloat(weight) : weight;

  if (weight === '' || weight == null) {
    return { valid: false, error: 'Weight is required' };
  }

  if (isNaN(num)) {
    return { valid: false, error: 'Enter a valid number' };
  }

  if (num <= 0) {
    return { valid: false, error: 'Weight must be greater than 0' };
  }

  return { valid: true };
}

/**
 * Validate that a required selection has been made.
 * @param {*} value
 * @param {string} fieldName
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateRequired(value, fieldName) {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return { valid: false, error: `${fieldName} is required` };
  }
  return { valid: true };
}

/**
 * Validate all calculator fields at once.
 * @param {{ partId: string, weight: number|string, routeId: string }} fields
 * @returns {{ valid: boolean, errors: Record<string, string> }}
 */
export function validateCalculatorFields({ partId, weight, routeId }) {
  const errors = {};

  const partResult = validateRequired(partId, 'Part');
  if (!partResult.valid) errors.partId = partResult.error;

  const weightResult = validateWeight(weight);
  if (!weightResult.valid) errors.weight = weightResult.error;

  const routeResult = validateRequired(routeId, 'Route');
  if (!routeResult.valid) errors.routeId = routeResult.error;

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}
