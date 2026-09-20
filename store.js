// ============================================
// MIDC Transport Calculator — Data Store
// localStorage CRUD with event dispatching
// ============================================

import { DEFAULT_PARTS, DEFAULT_ROUTES, DEFAULT_RATES } from './defaults.js';

const KEYS = {
  PARTS: 'midc_parts',
  ROUTES: 'midc_routes',
  RATES: 'midc_rates',
  CALC_ITEMS: 'midc_calc_items',
  INITIALIZED: 'midc_initialized',
};

// ── Internal helpers ──

function getJSON(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
  dispatchChange(key);
}

// ── Event system for reactive updates ──

const listeners = new Map();

function dispatchChange(key) {
  const cbs = listeners.get(key) || [];
  cbs.forEach(cb => cb());
  // Also fire a global change event
  const global = listeners.get('*') || [];
  global.forEach(cb => cb(key));
}

/**
 * Subscribe to changes on a specific store key or '*' for all changes.
 * @param {string} key - One of KEYS values or '*'
 * @param {Function} callback
 * @returns {Function} unsubscribe function
 */
export function subscribe(key, callback) {
  if (!listeners.has(key)) listeners.set(key, []);
  listeners.get(key).push(callback);
  return () => {
    const arr = listeners.get(key);
    const idx = arr.indexOf(callback);
    if (idx > -1) arr.splice(idx, 1);
  };
}

// ── Initialization ──

/**
 * Initialize the store with default data if first launch.
 */
export function initStore() {
  if (!getJSON(KEYS.INITIALIZED)) {
    setJSON(KEYS.PARTS, DEFAULT_PARTS);
    setJSON(KEYS.ROUTES, DEFAULT_ROUTES);
    setJSON(KEYS.RATES, DEFAULT_RATES);
    setJSON(KEYS.CALC_ITEMS, []);
    localStorage.setItem(KEYS.INITIALIZED, 'true');
  } else {
    // Migration: Sync any missing default parts (so new additions flow through without wiping custom parts)
    const currentParts = getJSON(KEYS.PARTS, []);
    let partsUpdated = false;
    
    // Clean up old dummy 'part-a' if it exists
    const cleanedParts = currentParts.filter(p => p.id !== 'part-a' && p.id !== 'part-b' && p.id !== 'part-c');
    if (cleanedParts.length !== currentParts.length) partsUpdated = true;

    for (const defPart of DEFAULT_PARTS) {
      if (!cleanedParts.some(p => p.id === defPart.id)) {
        cleanedParts.push(defPart);
        partsUpdated = true;
      }
    }
    
    if (partsUpdated) {
      setJSON(KEYS.PARTS, cleanedParts);
    }
    
    // Migration: Update to new rates if old dummy rates are present
    const currentRates = getJSON(KEYS.RATES, {});
    const satpurRates = currentRates['route-ambad-satpur'] || {};
    if (satpurRates['100'] === 500) {
      setJSON(KEYS.RATES, DEFAULT_RATES);
    }
  }
}

// ── Parts CRUD ──

export function getParts() {
  return getJSON(KEYS.PARTS, []);
}

export function getActiveParts() {
  return getParts().filter(p => p.active);
}

export function getPartById(id) {
  return getParts().find(p => p.id === id) || null;
}

export function addPart(part) {
  const parts = getParts();
  parts.push(part);
  setJSON(KEYS.PARTS, parts);
}

export function updatePart(id, updates) {
  const parts = getParts().map(p => p.id === id ? { ...p, ...updates } : p);
  setJSON(KEYS.PARTS, parts);
}

export function deletePart(id) {
  const parts = getParts().filter(p => p.id !== id);
  setJSON(KEYS.PARTS, parts);
}

// ── Routes CRUD ──

export function getRoutes() {
  return getJSON(KEYS.ROUTES, []);
}

export function getRouteById(id) {
  return getRoutes().find(r => r.id === id) || null;
}

export function addRoute(route) {
  const routes = getRoutes();
  routes.push(route);
  setJSON(KEYS.ROUTES, routes);
}

export function updateRoute(id, updates) {
  const routes = getRoutes().map(r => r.id === id ? { ...r, ...updates } : r);
  setJSON(KEYS.ROUTES, routes);
}

export function deleteRoute(id) {
  const routes = getRoutes().filter(r => r.id !== id);
  setJSON(KEYS.ROUTES, routes);
  // Also clean up rates for this route
  const rates = getRates();
  delete rates[id];
  setJSON(KEYS.RATES, rates);
}

// ── Rates CRUD ──

export function getRates() {
  return getJSON(KEYS.RATES, {});
}

export function getRatesForRoute(routeId) {
  const rates = getRates();
  return rates[routeId] || {};
}

export function setRateForRoute(routeId, weight, amount) {
  const rates = getRates();
  if (!rates[routeId]) rates[routeId] = {};
  rates[routeId][weight] = amount;
  setJSON(KEYS.RATES, rates);
}

export function deleteRateForRoute(routeId, weight) {
  const rates = getRates();
  if (rates[routeId]) {
    delete rates[routeId][weight];
    setJSON(KEYS.RATES, rates);
  }
}

export function setAllRatesForRoute(routeId, rateMap) {
  const rates = getRates();
  rates[routeId] = rateMap;
  setJSON(KEYS.RATES, rates);
}

// ── Calculation Items CRUD ──

export function getCalcItems() {
  return getJSON(KEYS.CALC_ITEMS, []);
}

export function addCalcItem(item) {
  const items = getCalcItems();
  items.push(item);
  setJSON(KEYS.CALC_ITEMS, items);
}

export function updateCalcItem(id, updates) {
  const items = getCalcItems().map(i => i.id === id ? { ...i, ...updates } : i);
  setJSON(KEYS.CALC_ITEMS, items);
}

export function deleteCalcItem(id) {
  const items = getCalcItems().filter(i => i.id !== id);
  setJSON(KEYS.CALC_ITEMS, items);
}

export function clearCalcItems() {
  setJSON(KEYS.CALC_ITEMS, []);
}

// ── Reset ──

/**
 * Reset all data to defaults (useful for testing/dev).
 */
export function resetToDefaults() {
  localStorage.removeItem(KEYS.INITIALIZED);
  initStore();
}

export { KEYS };
