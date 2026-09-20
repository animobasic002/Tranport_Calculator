// ============================================
// MIDC Transport Calculator — App
// Initialization, view routing, composition
// ============================================

import { initStore } from './store.js';
import { renderHeader } from './header.js';
import { renderCalculatorCard } from './calculatorCard.js';
import { renderItemList } from './itemList.js';
import { renderTotalBar, updateTotalBar } from './totalBar.js';
import { renderSettingsPanel } from './settingsPanel.js';

class App {
  constructor() {
    this.currentView = 'calculator'; // 'calculator' | 'settings'
    this.editingItem = null;
    this.appEl = document.getElementById('app');
  }

  init() {
    // Initialize the data store (seeds defaults on first launch)
    initStore();
    // Render the app
    this.render();
  }

  render() {
    this.appEl.innerHTML = '';

    // Header
    const header = renderHeader({
      currentView: this.currentView,
      onSettingsClick: () => this.switchView('settings'),
      onBackClick: () => this.switchView('calculator'),
    });
    this.appEl.appendChild(header);

    // Main content container
    const container = document.createElement('main');
    container.className = 'app-container';
    container.id = 'main-content';

    if (this.currentView === 'calculator') {
      this.renderCalculatorView(container);
    } else {
      this.renderSettingsView(container);
    }

    // Footer
    const footer = document.createElement('footer');
    footer.style.textAlign = 'center';
    footer.style.marginTop = '2rem';
    footer.style.color = 'var(--text-tertiary)';
    footer.style.fontSize = 'var(--font-size-sm)';
    footer.style.fontWeight = '500';
    footer.textContent = 'Created by - Er.Harshad Gaikwad';
    container.appendChild(footer);

    this.appEl.appendChild(container);

    // Total bar (only in calculator view)
    if (this.currentView === 'calculator') {
      const existingBar = document.getElementById('total-bar');
      if (existingBar) existingBar.remove();

      const totalBar = renderTotalBar({
        onCleared: () => this.refreshCalculatorView(),
      });
      document.body.appendChild(totalBar);
    } else {
      const existingBar = document.getElementById('total-bar');
      if (existingBar) existingBar.remove();
    }
  }

  renderCalculatorView(container) {
    // Calculator card
    const calcCard = renderCalculatorCard({
      editingItem: this.editingItem,
      onItemAdded: () => this.refreshCalculatorView(),
      onEditComplete: () => {
        this.editingItem = null;
        this.refreshCalculatorView();
      },
    });
    container.appendChild(calcCard);

    // Item list
    const itemList = renderItemList({
      onEdit: (item) => {
        this.editingItem = item;
        this.refreshCalculatorView();
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      onChanged: () => this.refreshCalculatorView(),
    });
    container.appendChild(itemList);
  }

  renderSettingsView(container) {
    const settings = renderSettingsPanel({
      onChanged: () => {
        // Settings changed — will be reflected next time calculator renders
      },
    });
    container.appendChild(settings);
  }

  refreshCalculatorView() {
    const container = document.getElementById('main-content');
    if (!container || this.currentView !== 'calculator') return;

    container.innerHTML = '';
    this.renderCalculatorView(container);
    updateTotalBar();
  }

  switchView(view) {
    this.currentView = view;
    this.editingItem = null;
    this.render();
  }
}

// ── Bootstrap ──
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
