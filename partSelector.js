// ============================================
// MIDC Transport Calculator — Part Selector
// Searchable dropdown for parts
// ============================================

import { getActiveParts } from './store.js';

/**
 * Create a searchable part selector.
 * @param {{ selectedId: string|null, onSelect: (partId: string) => void, error?: string }} props
 * @returns {HTMLElement}
 */
export function renderPartSelector({ selectedId, onSelect, error }) {
  const wrapper = document.createElement('div');
  wrapper.className = 'form-group';
  wrapper.id = 'part-selector-wrapper';

  const parts = getActiveParts();
  const selectedPart = parts.find(p => p.id === selectedId);

  wrapper.innerHTML = `
    <label class="form-label">Part</label>
    <div class="custom-select" id="part-select">
      <button type="button" class="custom-select-trigger" id="part-select-trigger" aria-haspopup="listbox" aria-expanded="false">
        <span class="${selectedPart ? '' : 'placeholder'}">
          ${selectedPart ? `${selectedPart.name}${selectedPart.code ? ` (${selectedPart.code})` : ''}` : 'Select Part'}
        </span>
        <span class="chevron">▼</span>
      </button>
    </div>
    <div class="form-error" id="part-error">${error || ''}</div>
  `;

  const selectEl = wrapper.querySelector('#part-select');
  const trigger = wrapper.querySelector('#part-select-trigger');
  let dropdown = null;
  let isOpen = false;
  let focusedIndex = -1;

  function openDropdown() {
    if (isOpen) return;
    isOpen = true;
    trigger.classList.add('active');
    trigger.setAttribute('aria-expanded', 'true');

    dropdown = document.createElement('div');
    dropdown.className = 'custom-select-dropdown';
    dropdown.setAttribute('role', 'listbox');
    dropdown.id = 'part-dropdown';

    const currentParts = getActiveParts();

    // Search box
    const searchBox = document.createElement('div');
    searchBox.className = 'custom-select-search';
    searchBox.innerHTML = `<input type="text" placeholder="Search parts..." id="part-search-input" autocomplete="off" />`;
    dropdown.appendChild(searchBox);

    // Options container
    const optionsContainer = document.createElement('div');
    optionsContainer.id = 'part-options';
    dropdown.appendChild(optionsContainer);

    function renderOptions(filter = '') {
      const filtered = currentParts.filter(p =>
        p.name.toLowerCase().includes(filter.toLowerCase()) ||
        (p.code && p.code.toLowerCase().includes(filter.toLowerCase()))
      );

      if (filtered.length === 0) {
        optionsContainer.innerHTML = `<div class="custom-select-empty">No parts found</div>`;
        return;
      }

      optionsContainer.innerHTML = filtered.map(p => `
        <div class="custom-select-option ${p.id === selectedId ? 'selected' : ''}" 
             data-id="${p.id}" role="option" aria-selected="${p.id === selectedId}">
          <span>${p.name}${p.code ? ` <span class="option-sub">${p.code}</span>` : ''}</span>
          ${p.id === selectedId ? '<span style="color: var(--accent)">✓</span>' : ''}
        </div>
      `).join('');

      optionsContainer.querySelectorAll('.custom-select-option').forEach(opt => {
        opt.addEventListener('click', () => {
          onSelect(opt.dataset.id);
          closeDropdown();
        });
      });
    }

    renderOptions();

    const searchInput = searchBox.querySelector('#part-search-input');
    searchInput.addEventListener('input', (e) => {
      renderOptions(e.target.value);
      focusedIndex = -1;
    });

    selectEl.appendChild(dropdown);

    // Focus search
    requestAnimationFrame(() => searchInput.focus());

    // Close on outside click
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

  // Keyboard navigation
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
