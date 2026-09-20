// ============================================
// MIDC Transport Calculator — Rates Manager
// Settings panel for configuring rates
// ============================================

import { getRoutes, getRatesForRoute, setRateForRoute, deleteRateForRoute, setAllRatesForRoute } from './store.js';
import { formatRoute, formatCurrency, formatWeight } from './format.js';
import { showToast } from './toast.js';

/**
 * Render the rates management section.
 * @param {{ onChanged: Function }} props
 * @returns {HTMLElement}
 */
export function renderRatesManager({ onChanged }) {
  const section = document.createElement('div');
  section.className = 'settings-section';
  section.id = 'rates-manager';

  const routes = getRoutes();
  let selectedRouteId = routes.length > 0 ? routes[0].id : null;

  function render() {
    section.innerHTML = `
      <div class="settings-section-header">
        <h3>Rates</h3>
      </div>
    `;

    if (routes.length === 0) {
      section.innerHTML += `<div class="settings-empty">Add routes first to configure rates.</div>`;
      return;
    }

    // Route selector
    const routeSelect = document.createElement('div');
    routeSelect.className = 'rate-route-select';
    routeSelect.innerHTML = `
      <div class="form-group">
        <label class="form-label">Select Route</label>
        <select class="form-input" id="rate-route-select">
          ${routes.map(r => `
            <option value="${r.id}" ${r.id === selectedRouteId ? 'selected' : ''}>
              ${formatRoute(r)}
            </option>
          `).join('')}
        </select>
      </div>
    `;
    section.appendChild(routeSelect);

    routeSelect.querySelector('#rate-route-select').addEventListener('change', (e) => {
      selectedRouteId = e.target.value;
      renderRateGrid();
    });

    // Rate grid container
    const gridContainer = document.createElement('div');
    gridContainer.id = 'rate-grid-container';
    section.appendChild(gridContainer);

    renderRateGrid();
  }

  function renderRateGrid() {
    const container = section.querySelector('#rate-grid-container');
    if (!container) return;
    container.innerHTML = '';

    const rates = getRatesForRoute(selectedRouteId);
    const weights = Object.keys(rates).map(Number).sort((a, b) => a - b);

    const grid = document.createElement('div');
    grid.className = 'rate-grid';

    // Header row
    const headerRow = document.createElement('div');
    headerRow.className = 'rate-row';
    headerRow.style.cssText = 'font-weight: 600; font-size: var(--font-size-sm); color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid var(--divider); padding-bottom: var(--space-sm);';
    headerRow.innerHTML = `
      <span class="rate-weight">Weight</span>
      <span class="rate-amount-input" style="flex:1">Amount (₹)</span>
      <span style="width: 36px;"></span>
    `;
    grid.appendChild(headerRow);

    // Rate rows
    weights.forEach(weight => {
      const row = document.createElement('div');
      row.className = 'rate-row';
      row.innerHTML = `
        <span class="rate-weight">${formatWeight(weight)}</span>
        <div class="rate-amount-input">
          <input type="number" class="form-input" value="${rates[weight]}" 
                 data-weight="${weight}" min="0" step="1" autocomplete="off" />
        </div>
        <button class="btn btn-ghost btn-icon btn-sm rate-delete-btn" data-weight="${weight}" title="Remove rate" style="color: var(--accent-red)">✕</button>
      `;
      grid.appendChild(row);
    });

    container.appendChild(grid);

    // Add new rate row
    const addRow = document.createElement('div');
    addRow.className = 'rate-add-row';
    addRow.style.marginTop = 'var(--space-md)';
    addRow.innerHTML = `
      <div class="form-input-group" style="flex: 1;">
        <input type="number" class="form-input" id="new-rate-weight" placeholder="Weight" min="100" step="100" autocomplete="off" />
        <span class="form-input-suffix">kg</span>
      </div>
      <div class="form-input-group" style="flex: 1;">
        <input type="number" class="form-input" id="new-rate-amount" placeholder="Amount" min="0" step="1" autocomplete="off" />
        <span class="form-input-suffix">₹</span>
      </div>
      <button class="btn btn-primary btn-sm" id="btn-add-rate">Add</button>
    `;
    container.appendChild(addRow);

    // Auto-fill suggestion
    if (weights.length > 0) {
      const nextWeight = weights[weights.length - 1] + 100;
      const suggestion = document.createElement('div');
      suggestion.className = 'text-xs text-tertiary';
      suggestion.style.marginTop = 'var(--space-xs)';
      suggestion.textContent = `Tip: Next weight would be ${formatWeight(nextWeight)}`;
      container.appendChild(suggestion);
    }

    // Wire up inline editing of existing rates
    grid.querySelectorAll('input[data-weight]').forEach(input => {
      let debounceTimer;
      input.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          const weight = parseInt(e.target.dataset.weight);
          const amount = parseFloat(e.target.value);
          if (!isNaN(amount) && amount >= 0) {
            setRateForRoute(selectedRouteId, weight, amount);
            onChanged();
          }
        }, 500);
      });
    });

    // Wire up delete buttons
    grid.querySelectorAll('.rate-delete-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const weight = parseInt(btn.dataset.weight);
        deleteRateForRoute(selectedRouteId, weight);
        showToast(`Rate for ${formatWeight(weight)} removed`, 'info');
        renderRateGrid();
        onChanged();
      });
    });

    // Wire up add new rate
    const addBtn = container.querySelector('#btn-add-rate');
    addBtn.addEventListener('click', () => {
      const weightInput = container.querySelector('#new-rate-weight');
      const amountInput = container.querySelector('#new-rate-amount');
      const weight = parseInt(weightInput.value);
      const amount = parseFloat(amountInput.value);

      if (isNaN(weight) || weight <= 0 || weight % 100 !== 0) {
        showToast('Weight must be a positive multiple of 100', 'error');
        return;
      }

      if (isNaN(amount) || amount < 0) {
        showToast('Amount must be a valid number', 'error');
        return;
      }

      if (rates[weight] !== undefined) {
        showToast(`Rate for ${formatWeight(weight)} already exists. Edit it inline.`, 'warning');
        return;
      }

      setRateForRoute(selectedRouteId, weight, amount);
      showToast(`Rate added: ${formatWeight(weight)} = ${formatCurrency(amount)}`, 'success');
      renderRateGrid();
      onChanged();
    });
  }

  render();
  return section;
}
