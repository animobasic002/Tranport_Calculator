// ============================================
// MIDC Transport Calculator — Calculator Card
// Main calculation form
// ============================================

import { renderPartSelector } from './partSelector.js';
import { renderRouteSelector } from './routeSelector.js';
import { calculateTransportAmount } from './calculator.js';
import { addCalcItem, updateCalcItem, getPartById, getRouteById } from './store.js';
import { validateWeight } from './validation.js';
import { formatCurrency } from './format.js';
import { generateId } from './uid.js';
import { showToast } from './toast.js';

/**
 * Render the main calculator card.
 * @param {{ onItemAdded: Function, editingItem?: object|null, onEditComplete?: Function }} props
 * @returns {HTMLElement}
 */
export function renderCalculatorCard({ onItemAdded, editingItem, onEditComplete }) {
  const card = document.createElement('div');
  card.className = 'glass-card calculator-card';
  card.id = 'calculator-card';

  // State
  let state = {
    partId: editingItem?.partId || null,
    quantity: editingItem?.quantity || '',
    weight: editingItem?.weight || '',
    routeId: editingItem?.routeId || null,
    amount: null,
    errors: {},
    calcResult: null,
  };

  function recalculate() {
    const weightNum = parseFloat(state.weight);
    const weightValid = validateWeight(state.weight);

    if (state.partId && weightValid.valid && state.routeId) {
      const result = calculateTransportAmount({
        partId: state.partId,
        weight: weightNum,
        routeId: state.routeId,
      });
      state.calcResult = result;
      state.amount = result.amount;
    } else {
      state.calcResult = null;
      state.amount = null;
    }
  }

  function render() {
    card.innerHTML = '';
    recalculate();

    // Fields container
    const fields = document.createElement('div');
    fields.className = 'calculator-fields';

    // Part selector
    const partSelector = renderPartSelector({
      selectedId: state.partId,
      onSelect: (id) => {
        state.partId = id;
        state.errors.partId = '';
        
        // Auto-calculate weight if part has it and quantity is set
        const part = getPartById(id);
        if (part && part.weight && state.quantity) {
          state.weight = (parseFloat(state.quantity) * part.weight).toFixed(2);
        } else if (part && part.weight && !state.quantity) {
          state.quantity = 1;
          state.weight = part.weight.toFixed(2);
        }
        
        render();
      },
      error: state.errors.partId || '',
    });
    fields.appendChild(partSelector);

    // Quantity input
    const quantityGroup = document.createElement('div');
    quantityGroup.className = 'form-group';
    quantityGroup.innerHTML = `
      <label class="form-label">Quantity</label>
      <input 
        type="number" 
        class="form-input ${state.errors.quantity ? 'error' : ''}" 
        id="quantity-input"
        placeholder="Number of parts"
        value="${state.quantity}"
        min="1"
        inputmode="numeric"
        autocomplete="off"
      />
      <div class="form-error" id="quantity-error">${state.errors.quantity || ''}</div>
    `;

    const quantityInput = quantityGroup.querySelector('#quantity-input');
    quantityInput.addEventListener('input', (e) => {
      state.quantity = e.target.value;
      
      // Auto-calculate weight
      const part = getPartById(state.partId);
      if (part && part.weight && state.quantity) {
        state.weight = (parseFloat(state.quantity) * part.weight).toFixed(2);
        // Trigger weight input validation
        const result = validateWeight(state.weight);
        state.errors.weight = state.weight !== '' && !result.valid ? result.error : '';
      }
      
      updateAmountDisplay();
      updateErrorDisplay('quantity');
      updateErrorDisplay('weight');
      updateAddButton();
      
      // Update weight input visually
      const wInput = card.querySelector('#weight-input');
      if (wInput) wInput.value = state.weight;
    });

    fields.appendChild(quantityGroup);

    // Weight input
    const part = getPartById(state.partId);
    const weightIsCalculated = part && part.weight != null;
    
    const weightGroup = document.createElement('div');
    weightGroup.className = 'form-group';
    weightGroup.innerHTML = `
      <label class="form-label">Total Weight</label>
      <div class="form-input-group">
        <input 
          type="number" 
          class="form-input ${state.errors.weight ? 'error' : ''}" 
          id="weight-input"
          placeholder="Calculated weight"
          value="${state.weight}"
          min="0.1"
          step="0.1"
          inputmode="numeric"
          autocomplete="off"
          ${weightIsCalculated ? 'readonly' : ''}
        />
        <span class="form-input-suffix">kg</span>
      </div>
      <div class="form-error" id="weight-error">${state.errors.weight || ''}</div>
    `;

    const weightInput = weightGroup.querySelector('#weight-input');
    weightInput.addEventListener('input', (e) => {
      state.weight = e.target.value;
      // Live validation
      const result = validateWeight(state.weight);
      state.errors.weight = state.weight !== '' && !result.valid ? result.error : '';
      updateAmountDisplay();
      updateErrorDisplay('weight');
      updateAddButton();
    });

    weightInput.addEventListener('blur', () => {
      if (state.weight !== '') {
        const result = validateWeight(state.weight);
        state.errors.weight = result.valid ? '' : result.error;
        updateErrorDisplay('weight');
      }
    });

    fields.appendChild(weightGroup);

    // Route selector
    const routeSelector = renderRouteSelector({
      selectedId: state.routeId,
      onSelect: (id) => {
        state.routeId = id;
        state.errors.routeId = '';
        render();
      },
      error: state.errors.routeId || '',
    });
    fields.appendChild(routeSelector);

    card.appendChild(fields);

    // Amount display
    const amountSection = document.createElement('div');
    amountSection.className = 'amount-display';
    amountSection.id = 'amount-display';

    if (state.calcResult && state.calcResult.error) {
      amountSection.innerHTML = `
        <span class="amount-label">Amount</span>
        <span class="amount-value error-msg">${state.calcResult.error}</span>
      `;
    } else if (state.amount != null) {
      amountSection.innerHTML = `
        <span class="amount-label">Calculated Amount</span>
        <span class="amount-value amount-pop">${formatCurrency(state.amount)}</span>
      `;
      if (state.calcResult && state.calcResult.method !== 'exact') {
        amountSection.innerHTML += `
          <span class="text-xs text-tertiary" style="margin-top: 2px;">Estimated (${state.calcResult.method})</span>
        `;
      }
    } else {
      amountSection.innerHTML = `
        <span class="amount-label">Amount</span>
        <span class="amount-value zero">—</span>
      `;
    }
    card.appendChild(amountSection);

    // Action buttons
    const actions = document.createElement('div');
    actions.className = 'calculator-actions';

    const isValid = state.partId && validateWeight(state.weight).valid && state.routeId && state.amount != null;

    if (editingItem) {
      actions.innerHTML = `
        <button class="btn btn-secondary btn-lg" id="btn-cancel-edit">Cancel</button>
        <button class="btn btn-primary btn-lg" id="btn-update" ${!isValid ? 'disabled' : ''}>
          Update
        </button>
      `;
    } else {
      actions.innerHTML = `
        <button class="btn btn-primary btn-lg btn-full" id="btn-add" ${!isValid ? 'disabled' : ''}>
          + Add Part
        </button>
      `;
    }
    card.appendChild(actions);

    // Wire up action buttons
    const addBtn = card.querySelector('#btn-add');
    const updateBtn = card.querySelector('#btn-update');
    const cancelBtn = card.querySelector('#btn-cancel-edit');

    if (addBtn) {
      addBtn.addEventListener('click', handleAdd);
    }
    if (updateBtn) {
      updateBtn.addEventListener('click', handleUpdate);
    }
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        if (onEditComplete) onEditComplete();
      });
    }
  }

  function updateAmountDisplay() {
    recalculate();
    const display = card.querySelector('#amount-display');
    if (!display) return;

    if (state.calcResult && state.calcResult.error) {
      display.innerHTML = `
        <span class="amount-label">Amount</span>
        <span class="amount-value error-msg">${state.calcResult.error}</span>
      `;
    } else if (state.amount != null) {
      display.innerHTML = `
        <span class="amount-label">Calculated Amount</span>
        <span class="amount-value amount-pop">${formatCurrency(state.amount)}</span>
      `;
      if (state.calcResult && state.calcResult.method !== 'exact') {
        display.innerHTML += `
          <span class="text-xs text-tertiary" style="margin-top: 2px;">Estimated (${state.calcResult.method})</span>
        `;
      }
    } else {
      display.innerHTML = `
        <span class="amount-label">Amount</span>
        <span class="amount-value zero">—</span>
      `;
    }
  }

  function updateErrorDisplay(field) {
    const el = card.querySelector(`#${field}-error`);
    if (el) el.textContent = state.errors[field] || '';
    const input = card.querySelector(`#${field}-input`);
    if (input) {
      input.classList.toggle('error', !!state.errors[field]);
    }
  }

  function updateAddButton() {
    recalculate();
    const isValid = state.partId && validateWeight(state.weight).valid && state.routeId && state.amount != null;
    const btn = card.querySelector('#btn-add') || card.querySelector('#btn-update');
    if (btn) btn.disabled = !isValid;
  }

  function handleAdd() {
    if (!validateAll()) return;

    const part = getPartById(state.partId);
    const route = getRouteById(state.routeId);

    const item = {
      id: generateId('calc'),
      partId: state.partId,
      partName: part?.name || 'Unknown',
      quantity: state.quantity ? parseInt(state.quantity) : null,
      weight: parseFloat(state.weight),
      routeId: state.routeId,
      routeName: route ? `${route.source} → ${route.destination}` : 'Unknown',
      amount: state.amount,
    };

    addCalcItem(item);
    showToast(`Added ${item.partName} · ${item.weight} kg`, 'success');

    // Reset form
    state.partId = null;
    state.quantity = '';
    state.weight = '';
    state.routeId = null;
    state.amount = null;
    state.errors = {};
    state.calcResult = null;
    render();

    if (onItemAdded) onItemAdded();
  }

  function handleUpdate() {
    if (!validateAll()) return;

    const part = getPartById(state.partId);
    const route = getRouteById(state.routeId);

    updateCalcItem(editingItem.id, {
      partId: state.partId,
      partName: part?.name || 'Unknown',
      quantity: state.quantity ? parseInt(state.quantity) : null,
      weight: parseFloat(state.weight),
      routeId: state.routeId,
      routeName: route ? `${route.source} → ${route.destination}` : 'Unknown',
      amount: state.amount,
    });

    showToast('Item updated', 'success');
    if (onEditComplete) onEditComplete();
  }

  function validateAll() {
    let valid = true;
    state.errors = {};

    if (!state.partId) {
      state.errors.partId = 'Select a part';
      valid = false;
    }

    const wResult = validateWeight(state.weight);
    if (!wResult.valid) {
      state.errors.weight = wResult.error;
      valid = false;
    }

    if (!state.routeId) {
      state.errors.routeId = 'Select a route';
      valid = false;
    }

    if (state.amount == null && valid) {
      showToast('Unable to calculate amount. Check rate configuration.', 'warning');
      valid = false;
    }

    if (!valid) render();
    return valid;
  }

  render();
  return card;
}
