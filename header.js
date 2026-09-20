// ============================================
// MIDC Transport Calculator — Header Component
// ============================================

import { getRoutes } from './store.js';
import { formatRoute } from './format.js';

/**
 * Render the app header.
 * @param {{ onSettingsClick: Function, onBackClick?: Function, currentView: string }} props
 * @returns {HTMLElement}
 */
export function renderHeader({ onSettingsClick, onBackClick, currentView }) {
  const header = document.createElement('header');
  header.className = 'app-header';
  header.id = 'app-header';

  if (currentView === 'settings') {
    header.innerHTML = `
      <div class="settings-header">
        <button class="btn btn-ghost btn-icon" id="btn-back" title="Back to Calculator">
          ←
        </button>
        <h2>Settings</h2>
      </div>
    `;
    header.querySelector('#btn-back').addEventListener('click', onBackClick);
  } else {
    const routes = getRoutes();
    const routeTexts = routes.map(r => formatRoute(r));

    header.innerHTML = `
      <h1>Transport Calculator</h1>
      <div class="subtitle">
        ${routeTexts.map((t, i) => 
          `<span>${t}</span>${i < routeTexts.length - 1 ? '<span class="route-dot"></span>' : ''}`
        ).join('')}
      </div>
      <div class="header-actions">
        <button class="btn btn-ghost btn-sm" id="btn-settings" title="Settings">
          ⚙ Settings
        </button>
      </div>
    `;
    header.querySelector('#btn-settings').addEventListener('click', onSettingsClick);
  }

  return header;
}
