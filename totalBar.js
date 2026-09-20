// ============================================
// MIDC Transport Calculator — Total Bar
// Sticky bottom total display
// ============================================

import { getCalcItems, clearCalcItems } from './store.js';
import { calculateGrandTotal } from './calculator.js';
import { formatCurrency } from './format.js';
import { showToast } from './toast.js';

/**
 * Render the sticky total bar.
 * @param {{ onCleared: Function }} props
 * @returns {HTMLElement}
 */
export function renderTotalBar({ onCleared }) {
  const bar = document.createElement('div');
  bar.className = 'total-bar';
  bar.id = 'total-bar';

  const items = getCalcItems();
  const total = calculateGrandTotal(items);

  if (items.length === 0) {
    bar.classList.add('hidden');
  }

  bar.innerHTML = `
    <div class="total-bar-inner">
      <div class="total-info">
        <span class="total-label">Total · ${items.length} item${items.length !== 1 ? 's' : ''}</span>
        <span class="total-amount ${total > 0 ? 'amount-pop' : ''}">${formatCurrency(total)}</span>
      </div>
      <div class="total-actions">
        <button class="btn btn-danger btn-sm" id="btn-clear-all" title="Clear All" ${items.length === 0 ? 'disabled' : ''}>
          Clear All
        </button>
      </div>
    </div>
  `;

  bar.querySelector('#btn-clear-all').addEventListener('click', () => {
    if (confirm('Clear all items?')) {
      clearCalcItems();
      showToast('All items cleared', 'info');
      onCleared();
    }
  });

  return bar;
}

/**
 * Update the existing total bar in place (avoids full re-render flicker).
 */
export function updateTotalBar() {
  const bar = document.getElementById('total-bar');
  if (!bar) return;

  const items = getCalcItems();
  const total = calculateGrandTotal(items);

  const label = bar.querySelector('.total-label');
  const amount = bar.querySelector('.total-amount');

  if (label) label.textContent = `Total · ${items.length} item${items.length !== 1 ? 's' : ''}`;
  if (amount) {
    amount.textContent = formatCurrency(total);
    amount.classList.remove('amount-pop');
    void amount.offsetWidth; // trigger reflow for re-animation
    amount.classList.add('amount-pop');
  }

  if (items.length === 0) {
    bar.classList.add('hidden');
  } else {
    bar.classList.remove('hidden');
  }
}
