// ============================================
// MIDC Transport Calculator — Parts Manager
// Settings panel for managing parts
// ============================================

import { getParts, addPart, updatePart, deletePart } from './store.js';
import { generateId } from './uid.js';
import { showToast } from './toast.js';

/**
 * Render the parts management section.
 * @param {{ onChanged: Function }} props
 * @returns {HTMLElement}
 */
export function renderPartsManager({ onChanged }) {
  const section = document.createElement('div');
  section.className = 'settings-section';
  section.id = 'parts-manager';

  let isAdding = false;
  let editingId = null;

  function render() {
    const parts = getParts();

    section.innerHTML = `
      <div class="settings-section-header">
        <h3>Parts</h3>
        <button class="btn btn-primary btn-sm" id="btn-add-part">+ Add Part</button>
      </div>
    `;

    // Add/Edit form
    if (isAdding || editingId) {
      const editPart = editingId ? parts.find(p => p.id === editingId) : null;
      const form = document.createElement('div');
      form.className = 'settings-form';
      form.innerHTML = `
        <div class="settings-form-row">
          <div class="form-group">
            <label class="form-label">Part Name</label>
            <input type="text" class="form-input" id="part-name-input" 
                   placeholder="e.g., Cylinder Head" value="${editPart?.name || ''}" autocomplete="off" />
          </div>
          <div class="form-group">
            <label class="form-label">Code (Optional)</label>
            <input type="text" class="form-input" id="part-code-input" 
                   placeholder="e.g., CH" value="${editPart?.code || ''}" autocomplete="off" />
          </div>
        </div>
        <div class="settings-form-row">
          <div class="form-group">
            <label class="form-label">System Weight (kg, Optional)</label>
            <input type="number" step="0.01" min="0" class="form-input" id="part-weight-input" 
                   placeholder="e.g., 1.5" value="${editPart?.weight || ''}" autocomplete="off" />
          </div>
        </div>
        <div class="settings-form-actions">
          <button class="btn btn-secondary btn-sm" id="btn-cancel-part">Cancel</button>
          <button class="btn btn-primary btn-sm" id="btn-save-part">${editingId ? 'Update' : 'Add'}</button>
        </div>
      `;
      section.appendChild(form);

      form.querySelector('#btn-cancel-part').addEventListener('click', () => {
        isAdding = false;
        editingId = null;
        render();
      });

      form.querySelector('#btn-save-part').addEventListener('click', () => {
        const name = form.querySelector('#part-name-input').value.trim();
        const code = form.querySelector('#part-code-input').value.trim();
        const weightVal = form.querySelector('#part-weight-input').value.trim();
        const weight = weightVal ? parseFloat(weightVal) : null;

        if (!name) {
          showToast('Part name is required', 'error');
          return;
        }

        if (editingId) {
          updatePart(editingId, { name, code, weight });
          showToast('Part updated', 'success');
        } else {
          addPart({ id: generateId('part'), name, code, weight, active: true });
          showToast('Part added', 'success');
        }

        isAdding = false;
        editingId = null;
        render();
        onChanged();
      });
    }

    // Parts list
    if (parts.length === 0) {
      section.innerHTML += `<div class="settings-empty">No parts configured. Add one to get started.</div>`;
    } else {
      const list = document.createElement('div');
      list.className = 'settings-list';

      parts.forEach(part => {
        const item = document.createElement('div');
        item.className = 'settings-list-item';
        item.innerHTML = `
          <div class="item-info">
            <span class="item-name">${part.name}</span>
            <span class="item-sub">${part.code || '—'}${part.weight ? ` • ${part.weight} kg` : ''}</span>
          </div>
          <div class="item-actions">
            <span class="badge ${part.active ? 'badge-active' : 'badge-inactive'}">
              ${part.active ? 'Active' : 'Inactive'}
            </span>
            <input type="checkbox" class="toggle" data-id="${part.id}" ${part.active ? 'checked' : ''} title="Toggle active" />
            <button class="btn btn-ghost btn-icon btn-sm" data-action="edit" data-id="${part.id}" title="Edit">✎</button>
            <button class="btn btn-ghost btn-icon btn-sm" data-action="delete" data-id="${part.id}" title="Delete" style="color: var(--accent-red)">✕</button>
          </div>
        `;
        list.appendChild(item);
      });

      section.appendChild(list);

      // Wire up events
      list.querySelectorAll('.toggle').forEach(toggle => {
        toggle.addEventListener('change', (e) => {
          updatePart(e.target.dataset.id, { active: e.target.checked });
          render();
          onChanged();
        });
      });

      list.querySelectorAll('[data-action="edit"]').forEach(btn => {
        btn.addEventListener('click', () => {
          editingId = btn.dataset.id;
          isAdding = false;
          render();
        });
      });

      list.querySelectorAll('[data-action="delete"]').forEach(btn => {
        btn.addEventListener('click', () => {
          if (confirm('Delete this part?')) {
            deletePart(btn.dataset.id);
            showToast('Part deleted', 'info');
            render();
            onChanged();
          }
        });
      });
    }

    // Wire add button
    section.querySelector('#btn-add-part').addEventListener('click', () => {
      isAdding = true;
      editingId = null;
      render();
    });
  }

  render();
  return section;
}
