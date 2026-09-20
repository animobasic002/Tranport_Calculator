// ============================================
// MIDC Transport Calculator — Routes Manager
// Settings panel for managing routes
// ============================================

import { getRoutes, addRoute, updateRoute, deleteRoute } from './store.js';
import { formatRoute } from './format.js';
import { generateId } from './uid.js';
import { showToast } from './toast.js';

/**
 * Render the routes management section.
 * @param {{ onChanged: Function }} props
 * @returns {HTMLElement}
 */
export function renderRoutesManager({ onChanged }) {
  const section = document.createElement('div');
  section.className = 'settings-section';
  section.id = 'routes-manager';

  let isAdding = false;
  let editingId = null;

  function render() {
    const routes = getRoutes();

    section.innerHTML = `
      <div class="settings-section-header">
        <h3>Routes</h3>
        <button class="btn btn-primary btn-sm" id="btn-add-route">+ Add Route</button>
      </div>
    `;

    // Add/Edit form
    if (isAdding || editingId) {
      const editRoute = editingId ? routes.find(r => r.id === editingId) : null;
      const form = document.createElement('div');
      form.className = 'settings-form';
      form.innerHTML = `
        <div class="settings-form-row">
          <div class="form-group">
            <label class="form-label">Source</label>
            <input type="text" class="form-input" id="route-source-input" 
                   placeholder="e.g., Ambad" value="${editRoute?.source || ''}" autocomplete="off" />
          </div>
          <div class="form-group">
            <label class="form-label">Destination</label>
            <input type="text" class="form-input" id="route-dest-input" 
                   placeholder="e.g., Satpur" value="${editRoute?.destination || ''}" autocomplete="off" />
          </div>
        </div>
        <div class="settings-form-actions">
          <button class="btn btn-secondary btn-sm" id="btn-cancel-route">Cancel</button>
          <button class="btn btn-primary btn-sm" id="btn-save-route">${editingId ? 'Update' : 'Add'}</button>
        </div>
      `;
      section.appendChild(form);

      form.querySelector('#btn-cancel-route').addEventListener('click', () => {
        isAdding = false;
        editingId = null;
        render();
      });

      form.querySelector('#btn-save-route').addEventListener('click', () => {
        const source = form.querySelector('#route-source-input').value.trim();
        const destination = form.querySelector('#route-dest-input').value.trim();

        if (!source || !destination) {
          showToast('Both source and destination are required', 'error');
          return;
        }

        const name = `${source} → ${destination}`;

        if (editingId) {
          updateRoute(editingId, { name, source, destination });
          showToast('Route updated', 'success');
        } else {
          addRoute({ id: generateId('route'), name, source, destination });
          showToast('Route added', 'success');
        }

        isAdding = false;
        editingId = null;
        render();
        onChanged();
      });
    }

    // Routes list
    if (routes.length === 0) {
      section.innerHTML += `<div class="settings-empty">No routes configured. Add one to get started.</div>`;
    } else {
      const list = document.createElement('div');
      list.className = 'settings-list';

      routes.forEach(route => {
        const item = document.createElement('div');
        item.className = 'settings-list-item';
        item.innerHTML = `
          <div class="item-info">
            <span class="item-name">${formatRoute(route)}</span>
            <span class="item-sub">${route.id}</span>
          </div>
          <div class="item-actions">
            <button class="btn btn-ghost btn-icon btn-sm" data-action="edit" data-id="${route.id}" title="Edit">✎</button>
            <button class="btn btn-ghost btn-icon btn-sm" data-action="delete" data-id="${route.id}" title="Delete" style="color: var(--accent-red)">✕</button>
          </div>
        `;
        list.appendChild(item);
      });

      section.appendChild(list);

      list.querySelectorAll('[data-action="edit"]').forEach(btn => {
        btn.addEventListener('click', () => {
          editingId = btn.dataset.id;
          isAdding = false;
          render();
        });
      });

      list.querySelectorAll('[data-action="delete"]').forEach(btn => {
        btn.addEventListener('click', () => {
          if (confirm('Delete this route? This will also remove its rate configuration.')) {
            deleteRoute(btn.dataset.id);
            showToast('Route deleted', 'info');
            render();
            onChanged();
          }
        });
      });
    }

    section.querySelector('#btn-add-route').addEventListener('click', () => {
      isAdding = true;
      editingId = null;
      render();
    });
  }

  render();
  return section;
}
