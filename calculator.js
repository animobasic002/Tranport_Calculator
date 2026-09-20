// ============================================
// MIDC Transport Calculator — Calculation Engine
// Pure pricing logic, zero UI dependencies
// ============================================

import { getRatesForRoute } from './store.js';

/**
 * Calculate the transport amount for a given part, weight, and route.
 *
 * Lookup strategy:
 * 1. Find exact rate entry for (routeId, weight)
 * 2. If no exact match, use linear interpolation/extrapolation:
 *    - Find the two nearest configured slabs
 *    - Interpolate if weight is between them
 *    - Extrapolate if weight is beyond the highest configured slab
 * 3. If no rate data exists at all for the route, return null
 *
 * Architecture supports future extension to include partId in pricing.
 *
 * @param {{ partId: string, weight: number, routeId: string }} params
 * @returns {{ amount: number|null, method: string, error?: string }}
 */
export function calculateTransportAmount({ partId, weight, routeId }) {
  // Get rate table for this route
  const rateTable = getRatesForRoute(routeId);
  const slabs = Object.keys(rateTable)
    .map(Number)
    .filter(w => !isNaN(w) && w > 0)
    .sort((a, b) => a - b);

  // No rates configured for this route
  if (slabs.length === 0) {
    return {
      amount: null,
      method: 'none',
      error: 'No rates configured for this route. Please configure rates in Settings.'
    };
  }

  // Exact match
  if (rateTable[weight] !== undefined) {
    return {
      amount: rateTable[weight],
      method: 'exact'
    };
  }

  // Weight is below the lowest configured slab
  if (weight < slabs[0]) {
    // Use the per-100kg rate from the lowest slab and calculate proportionally
    const lowestRate = rateTable[slabs[0]];
    const perHundred = lowestRate / (slabs[0] / 100);
    const amount = Math.round(perHundred * (weight / 100));
    return {
      amount,
      method: 'extrapolated-below'
    };
  }

  // Weight is above the highest configured slab — extrapolate
  if (weight > slabs[slabs.length - 1]) {
    return extrapolateAbove(rateTable, slabs, weight);
  }

  // Weight falls into a configured step slab
  return stepCalculate(rateTable, slabs, weight);
}

/**
 * Extrapolate for weights above the highest configured slab.
 * Uses the rate-per-100kg from the highest slab interval.
 */
function extrapolateAbove(rateTable, slabs, weight) {
  const highestSlab = slabs[slabs.length - 1];
  const highestRate = rateTable[highestSlab];

  if (slabs.length >= 2) {
    // Use the incremental rate between the last two slabs
    const secondHighest = slabs[slabs.length - 2];
    const secondHighestRate = rateTable[secondHighest];
    const incrementalPer100 = (highestRate - secondHighestRate) / ((highestSlab - secondHighest) / 100);
    const extraWeight = weight - highestSlab;
    const amount = Math.round(highestRate + incrementalPer100 * (extraWeight / 100));
    return {
      amount,
      method: 'extrapolated-above'
    };
  } else {
    // Only one slab configured — use simple ratio
    const perHundred = highestRate / (highestSlab / 100);
    const amount = Math.round(perHundred * (weight / 100));
    return {
      amount,
      method: 'extrapolated-above'
    };
  }
}

/**
 * Calculate rate based on step slabs.
 * Finds the first slab that is >= weight.
 */
function stepCalculate(rateTable, slabs, weight) {
  for (let i = 0; i < slabs.length; i++) {
    if (weight <= slabs[i]) {
      return {
        amount: rateTable[slabs[i]],
        method: 'step'
      };
    }
  }
  
  // Should never reach here due to extrapolateAbove check
  return { amount: 0, method: 'error' };
}

/**
 * Calculate the grand total for an array of calculation items.
 * @param {Array<{ amount: number }>} items
 * @returns {number}
 */
export function calculateGrandTotal(items) {
  return items.reduce((sum, item) => sum + (item.amount || 0), 0);
}
