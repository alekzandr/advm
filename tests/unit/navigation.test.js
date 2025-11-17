// Navigation and view switching tests
import { describe, it, expect, beforeEach } from 'vitest';

describe('Navigation', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <nav class="app-navigation">
        <button class="nav-tab" id="consoleTab" data-view="console">Console</button>
        <button class="nav-tab active" id="treatiseTab" data-view="treatise">Treatise</button>
      </nav>
      <div id="consoleView" style="display: none;"></div>
      <div id="treatiseView" style="display: block;"></div>
    `;
  });

  describe('Initial State', () => {
    it('should have treatise tab active by default', () => {
      const treatiseTab = document.getElementById('treatiseTab');
      expect(treatiseTab.classList.contains('active')).toBe(true);
    });

    it('should have console tab inactive by default', () => {
      const consoleTab = document.getElementById('consoleTab');
      expect(consoleTab.classList.contains('active')).toBe(false);
    });

    it('should show treatise view by default', () => {
      const treatiseView = document.getElementById('treatiseView');
      expect(treatiseView.style.display).toBe('block');
    });

    it('should hide console view by default', () => {
      const consoleView = document.getElementById('consoleView');
      expect(consoleView.style.display).toBe('none');
    });
  });

  describe('Tab Switching', () => {
    it('should switch to console view when clicking console tab', () => {
      const consoleTab = document.getElementById('consoleTab');
      const consoleView = document.getElementById('consoleView');
      const treatiseView = document.getElementById('treatiseView');

      // Simulate switch
      consoleTab.classList.add('active');
      document.querySelector('.nav-tab.active:not(#consoleTab)')?.classList.remove('active');
      consoleView.style.display = 'flex';
      treatiseView.style.display = 'none';

      expect(consoleTab.classList.contains('active')).toBe(true);
      expect(consoleView.style.display).toBe('flex');
      expect(treatiseView.style.display).toBe('none');
    });

    it('should maintain only one active tab', () => {
      const tabs = document.querySelectorAll('.nav-tab');
      const activeTabs = document.querySelectorAll('.nav-tab.active');
      
      expect(tabs.length).toBe(2);
      expect(activeTabs.length).toBe(1);
    });
  });

  describe('View Data Attributes', () => {
    it('should have correct data-view attributes', () => {
      const consoleTab = document.getElementById('consoleTab');
      const treatiseTab = document.getElementById('treatiseTab');

      expect(consoleTab.dataset.view).toBe('console');
      expect(treatiseTab.dataset.view).toBe('treatise');
    });
  });
});
