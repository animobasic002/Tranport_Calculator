// ============================================
// MIDC Transport Calculator — Item List
// Displays added calculation items
// ============================================

import { getCalcItems, deleteCalcItem } from './store.js';
import { formatCurrency, formatWeight } from './format.js';
import { showToast } from './toast.js';

/**
 * Render the list of calculation items.
 * @param {{ onEdit: (item: object) => void, onChanged: Function }} props
 * @returns {HTMLElement}
 */
export function renderItemList({ onEdit, onChanged }) {
  const section = document.createElement('section');
  section.className = 'items-section';
  section.id = 'items-section';

  const items = getCalcItems();

  if (items.length === 0) {
    section.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📦</div>
        <p class="empty-state-text">No items added yet. Use the calculator above to add parts.</p>
      </div>
    `;
    return section;
  }

  // Header
  section.innerHTML = `
    <div class="items-header">
      <h3>Added Items</h3>
      <span class="items-count">${items.length}</span>
    </div>
  `;

  // Items list
  const list = document.createElement('div');
  list.className = 'items-list';
  list.id = 'items-list';

  items.forEach(item => {
    const el = createItemElement(item, onEdit, onChanged);
    list.appendChild(el);
  });

  section.appendChild(list);
  return section;
}

/**
 * Create a single item card element.
 */
function createItemElement(item, onEdit, onChanged) {
  const el = document.createElement('div');
  el.className = 'calc-item';
  el.id = `calc-item-${item.id}`;
  el.dataset.itemId = item.id;

  el.innerHTML = `
    <div class="calc-item-info">
      <span class="calc-item-part">${item.quantity ? item.quantity + 'x ' : ''}${item.partName || 'Unknown Part'}</span>
      <div class="calc-item-details">
        <span>${formatWeight(item.weight)}</span>
        <span class="detail-dot"></span>
        <span>${item.routeName || 'Unknown Route'}</span>
      </div>
    </div>
    <div class="calc-item-right">
      <span class="calc-item-amount">${formatCurrency(item.amount)}</span>
      <div class="calc-item-actions">
        <button class="btn btn-ghost btn-icon btn-sm" title="Edit" data-action="edit">✎</button>
        <button class="btn btn-ghost btn-icon btn-sm" title="Remove" data-action="remove" style="color: var(--accent-red)">✕</button>
      </div>
    </div>
  `;

  // Edit button
  el.querySelector('[data-action="edit"]').addEventListener('click', (e) => {
    e.stopPropagation();
    onEdit(item);
  });

  // Remove button
  el.querySelector('[data-action="remove"]').addEventListener('click', (e) => {
    e.stopPropagation();
    el.classList.add('removing');
    setTimeout(() => {
      deleteCalcItem(item.id);
      showToast('Item removed', 'info');
      onChanged();
    }, 250);
  });

  return el;
}
