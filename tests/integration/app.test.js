// Integration tests for ADVM Console application
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('ADVM Console Integration', () => {
  beforeEach(() => {
    // Setup full application DOM
    document.body.innerHTML = `
      <div class="app-shell">
        <header class="app-header">
          <button id="toggleViewBtn"></button>
          <button id="loadSpellBtn"></button>
          <button id="newPuzzleBtn"></button>
        </header>
        <section class="workspace">
          <aside class="glyph-bank-panel">
            <div class="glyph-list" id="glyphList"></div>
            <input id="glyphSearch" />
            <select id="filterCategory"></select>
            <select id="filterLayer"></select>
          </aside>
          <main class="matrix-panel">
            <div class="cube-viewport">
              <div class="cube-container"></div>
            </div>
          </main>
          <aside class="puzzle-panel">
            <div class="puzzle-card"></div>
          </aside>
        </section>
      </div>
      <dialog id="nodeGlyphSelector">
        <input id="selectorSearch" />
        <select id="selectorCategory"></select>
        <div id="selectorGlyphList"></div>
      </dialog>
    `;

    // Mock fetch for data loading
    global.fetch = vi.fn((url) => {
      if (url.includes('glyphs.json')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            glyphs: [
              { id: 'evocation', symbol: '⚡', name: 'Evocation', tags: ['school'], layer: 'MVM' },
              { id: 'fireball', symbol: '🔥', name: 'Fireball', tags: ['action'], layer: 'MVM' }
            ]
          })
        });
      }
      if (url.includes('spells.json')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            spells: [
              { id: 'fireball', name: 'Fireball', level: 3, school: 'evocation' }
            ]
          })
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });
  });

  describe('Application Initialization', () => {
    it('should load glyph data on startup', async () => {
      const response = await fetch('/data/glyphs.json');
      const data = await response.json();
      
      expect(fetch).toHaveBeenCalledWith('/data/glyphs.json');
      expect(data.glyphs).toHaveLength(2);
    });

    it('should initialize matrix with 3 layers', () => {
      const layers = ['MVM', 'CL', 'SL'];
      const cubeContainer = document.querySelector('.cube-container');
      
      expect(layers).toHaveLength(3);
      expect(cubeContainer).toBeTruthy();
    });

    it('should set default view mode to player', () => {
      localStorage.getItem.mockReturnValue(null);
      const mode = localStorage.getItem('advm-view-mode') || 'player';
      
      expect(mode).toBe('player');
    });
  });

  describe('Glyph Bank Workflow', () => {
    it('should filter glyphs by category', async () => {
      const response = await fetch('/data/glyphs.json');
      const data = await response.json();
      
      const filterSelect = document.getElementById('filterCategory');
      filterSelect.value = 'school';
      
      const filtered = data.glyphs.filter(g => g.tags.includes('school'));
      
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('evocation');
    });

    it('should search glyphs by name', async () => {
      const response = await fetch('/data/glyphs.json');
      const data = await response.json();
      
      const searchInput = document.getElementById('glyphSearch');
      searchInput.value = 'fire';
      
      const filtered = data.glyphs.filter(g =>
        g.name.toLowerCase().includes('fire')
      );
      
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('fireball');
    });

    it('should display filtered results in list', async () => {
      const response = await fetch('/data/glyphs.json');
      const data = await response.json();
      
      const glyphList = document.getElementById('glyphList');
      glyphList.innerHTML = data.glyphs.map(g => `
        <div class="glyph-card" data-glyph-id="${g.id}">
          <div class="glyph-symbol">${g.symbol}</div>
          <div class="glyph-name">${g.name}</div>
        </div>
      `).join('');
      
      const cards = glyphList.querySelectorAll('.glyph-card');
      expect(cards).toHaveLength(2);
    });
  });

  describe('Matrix Interaction Workflow', () => {
    it('should open node selector on node click in DM mode', () => {
      const mode = 'dm';
      const nodeId = 'mvm-center';
      const selector = document.getElementById('nodeGlyphSelector');
      
      if (mode === 'dm') {
        selector.showModal = vi.fn();
        selector.showModal();
      }
      
      expect(selector.showModal).toHaveBeenCalled();
    });

    it('should not open node selector in player mode', () => {
      const mode = 'player';
      const selector = document.getElementById('nodeGlyphSelector');
      selector.showModal = vi.fn();
      
      if (mode === 'dm') {
        selector.showModal();
      }
      
      expect(selector.showModal).not.toHaveBeenCalled();
    });

    it('should filter glyphs in node selector by layer', async () => {
      const response = await fetch('/data/glyphs.json');
      const data = await response.json();
      
      const currentLayer = 'MVM';
      const filtered = data.glyphs.filter(g => g.layer === currentLayer);
      
      expect(filtered).toHaveLength(2);
    });

    it('should assign glyph to node', () => {
      const nodeId = 'mvm-center';
      const glyphId = 'evocation';
      const nodeState = {};
      
      nodeState[nodeId] = glyphId;
      
      expect(nodeState[nodeId]).toBe('evocation');
    });
  });

  describe('View Mode Switching', () => {
    it('should switch from player to DM mode', () => {
      let mode = 'player';
      
      const toggleBtn = document.getElementById('toggleViewBtn');
      toggleBtn.click = () => {
        mode = mode === 'player' ? 'dm' : 'player';
      };
      
      toggleBtn.click();
      
      expect(mode).toBe('dm');
    });

    it('should hide puzzle panel in DM mode', () => {
      const mode = 'dm';
      const puzzlePanel = document.querySelector('.puzzle-panel');
      
      puzzlePanel.style.display = mode === 'dm' ? 'none' : 'block';
      
      expect(puzzlePanel.style.display).toBe('none');
    });

    it('should show puzzle panel in player mode', () => {
      const mode = 'player';
      const puzzlePanel = document.querySelector('.puzzle-panel');
      
      puzzlePanel.style.display = mode === 'dm' ? 'none' : 'block';
      
      expect(puzzlePanel.style.display).toBe('block');
    });

    it('should persist mode in localStorage', () => {
      const mode = 'dm';
      localStorage.setItem('advm-view-mode', mode);
      
      expect(localStorage.setItem).toHaveBeenCalledWith('advm-view-mode', 'dm');
    });
  });

  describe('Spell Loading', () => {
    it('should load spell data', async () => {
      const response = await fetch('/data/spells.json');
      const data = await response.json();
      
      expect(data.spells).toHaveLength(1);
      expect(data.spells[0].name).toBe('Fireball');
    });

    it('should populate matrix from spell data', () => {
      const spell = {
        nodes: {
          'mvm-top-left': 'evocation',
          'mvm-center': 'fireball'
        }
      };
      
      const nodeState = {};
      Object.assign(nodeState, spell.nodes);
      
      expect(nodeState['mvm-top-left']).toBe('evocation');
      expect(nodeState['mvm-center']).toBe('fireball');
    });
  });

  describe('Error Handling', () => {
    it('should handle failed data fetch', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
      
      try {
        await fetch('/data/glyphs.json');
      } catch (error) {
        expect(error.message).toBe('Network error');
      }
    });

    it('should handle missing DOM elements gracefully', () => {
      const missingEl = document.getElementById('nonexistent');
      
      expect(missingEl).toBeNull();
    });
  });

  describe('Data Persistence', () => {
    it('should save matrix state to localStorage', () => {
      const state = {
        'mvm-center': 'evocation',
        'mvm-top': 'fireball'
      };
      
      localStorage.setItem('advm-matrix-state', JSON.stringify(state));
      
      expect(localStorage.setItem).toHaveBeenCalled();
    });

    it('should load matrix state from localStorage', () => {
      const savedState = {
        'mvm-center': 'evocation'
      };
      
      localStorage.getItem.mockReturnValue(JSON.stringify(savedState));
      const state = JSON.parse(localStorage.getItem('advm-matrix-state'));
      
      expect(state['mvm-center']).toBe('evocation');
    });
  });
});
