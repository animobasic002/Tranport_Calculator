// ============================================
// MIDC Transport Calculator — Route Selector
// ============================================

import { getRoutes } from './store.js';
import { formatRoute } from './format.js';

/**
 * Create a route selector dropdown.
 * @param {{ selectedId: string|null, onSelect: (routeId: string) => void, error?: string }} props
 * @returns {HTMLElement}
 */
export function renderRouteSelector({ selectedId, onSelect, error }) {
  const wrapper = document.createElement('div');
  wrapper.className = 'form-group';
  wrapper.id = 'route-selector-wrapper';

  const routes = getRoutes();
  const selectedRoute = routes.find(r => r.id === selectedId);

  wrapper.innerHTML = `
    <label class="form-label">Route</label>
    <div class="custom-select" id="route-select">
      <button type="button" class="custom-select-trigger" id="route-select-trigger" aria-haspopup="listbox" aria-expanded="false">
        <span class="${selectedRoute ? '' : 'placeholder'}">
          ${selectedRoute ? formatRoute(selectedRoute) : 'Select Route'}
        </span>
        <span class="chevron">▼</span>
      </button>
    </div>
    <div class="form-error" id="route-error">${error || ''}</div>
  `;

  const selectEl = wrapper.querySelector('#route-select');
  const trigger = wrapper.querySelector('#route-select-trigger');
  let dropdown = null;
  let isOpen = false;

  function openDropdown() {
    if (isOpen) return;
    isOpen = true;
    trigger.classList.add('active');
    trigger.setAttribute('aria-expanded', 'true');

    dropdown = document.createElement('div');
    dropdown.className = 'custom-select-dropdown';
    dropdown.setAttribute('role', 'listbox');
    dropdown.id = 'route-dropdown';

    if (routes.length === 0) {
      dropdown.innerHTML = `<div class="custom-select-empty">No routes configured</div>`;
    } else {
      dropdown.innerHTML = routes.map(r => `
        <div class="custom-select-option ${r.id === selectedId ? 'selected' : ''}" 
             data-id="${r.id}" role="option" aria-selected="${r.id === selectedId}">
          <span>${formatRoute(r)}</span>
          ${r.id === selectedId ? '<span style="color: var(--accent)">✓</span>' : ''}
        </div>
      `).join('');

      dropdown.querySelectorAll('.custom-select-option').forEach(opt => {
        opt.addEventListener('click', () => {
          onSelect(opt.dataset.id);
          closeDropdown();
        });
      });
    }

    selectEl.appendChild(dropdown);

    setTimeout(() => {
      document.addEventListener('click', handleOutsideClick);
    }, 0);
  }

  function closeDropdown() {
    if (!isOpen) return;
    isOpen = false;
    trigger.classList.remove('active');
    trigger.setAttribute('aria-expanded', 'false');
    if (dropdown) {
      dropdown.remove();
      dropdown = null;
    }
    document.removeEventListener('click', handleOutsideClick);
  }

  function handleOutsideClick(e) {
    if (!selectEl.contains(e.target)) {
      closeDropdown();
    }
  }

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    isOpen ? closeDropdown() : openDropdown();
  });

  trigger.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      isOpen ? closeDropdown() : openDropdown();
    }
    if (e.key === 'Escape') {
      closeDropdown();
    }
  });

  return wrapper;
}
