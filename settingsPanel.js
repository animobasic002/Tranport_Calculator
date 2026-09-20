// ============================================
// MIDC Transport Calculator — Settings Panel
// Container with tabs for Parts, Routes, Rates
// ============================================

import { renderPartsManager } from './partsManager.js';
import { renderRoutesManager } from './routesManager.js';
import { renderRatesManager } from './ratesManager.js';

/**
 * Render the settings panel with tabbed navigation.
 * @param {{ onChanged: Function }} props
 * @returns {HTMLElement}
 */
export function renderSettingsPanel({ onChanged }) {
  const panel = document.createElement('div');
  panel.className = 'settings-view view-enter';
  panel.id = 'settings-panel';

  let activeTab = 'parts';

  function render() {
    panel.innerHTML = '';

    // Tabs
    const tabs = document.createElement('div');
    tabs.className = 'tabs';
    tabs.innerHTML = `
      <button class="tab ${activeTab === 'parts' ? 'active' : ''}" data-tab="parts">Parts</button>
      <button class="tab ${activeTab === 'routes' ? 'active' : ''}" data-tab="routes">Routes</button>
      <button class="tab ${activeTab === 'rates' ? 'active' : ''}" data-tab="rates">Rates</button>
    `;
    panel.appendChild(tabs);

    tabs.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => {
        activeTab = tab.dataset.tab;
        render();
      });
    });

    // Tab content
    const content = document.createElement('div');
    content.className = 'view-enter';

    switch (activeTab) {
      case 'parts':
        content.appendChild(renderPartsManager({ onChanged }));
        break;
      case 'routes':
        content.appendChild(renderRoutesManager({ onChanged }));
        break;
      case 'rates':
        content.appendChild(renderRatesManager({ onChanged }));
        break;
    }

    panel.appendChild(content);
  }

  render();
  return panel;
}
