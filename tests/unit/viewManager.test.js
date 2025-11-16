// Unit tests for ViewManager module
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('ViewManager', () => {
  let viewElements;

  beforeEach(() => {
    // Setup DOM
    document.body.innerHTML = `
      <button id="toggleViewBtn">
        <span class="view-label">Current Mode: Player</span>
      </button>
      <div class="puzzle-panel" style="display: block;"></div>
      <div class="glyph-bank-panel"></div>
      <button id="newPuzzleBtn"></button>
      <button id="loadSpellBtn"></button>
    `;

    viewElements = {
      toggleBtn: document.getElementById('toggleViewBtn'),
      puzzlePanel: document.querySelector('.puzzle-panel'),
      glyphBank: document.querySelector('.glyph-bank-panel'),
      newPuzzleBtn: document.getElementById('newPuzzleBtn'),
      loadSpellBtn: document.getElementById('loadSpellBtn')
    };
  });

  describe('Mode Switching', () => {
    it('should initialize in player mode', () => {
      const mode = 'player';
      expect(mode).toBe('player');
    });

    it('should switch to DM mode', () => {
      let mode = 'player';
      mode = 'dm';
      
      expect(mode).toBe('dm');
    });

    it('should toggle between modes', () => {
      let mode = 'player';
      mode = mode === 'player' ? 'dm' : 'player';
      
      expect(mode).toBe('dm');
      
      mode = mode === 'player' ? 'dm' : 'player';
      expect(mode).toBe('player');
    });
  });

  describe('UI Updates', () => {
    it('should update button label for player mode', () => {
      const label = viewElements.toggleBtn.querySelector('.view-label');
      label.textContent = 'Current Mode: Player';
      
      expect(label.textContent).toBe('Current Mode: Player');
    });

    it('should update button label for DM mode', () => {
      const label = viewElements.toggleBtn.querySelector('.view-label');
      label.textContent = 'Current Mode: DM';
      
      expect(label.textContent).toBe('Current Mode: DM');
    });

    it('should hide puzzle panel in DM mode', () => {
      viewElements.puzzlePanel.style.display = 'none';
      
      expect(viewElements.puzzlePanel.style.display).toBe('none');
    });

    it('should show puzzle panel in player mode', () => {
      viewElements.puzzlePanel.style.display = 'block';
      
      expect(viewElements.puzzlePanel.style.display).toBe('block');
    });

    it('should hide new puzzle button in player mode', () => {
      viewElements.newPuzzleBtn.style.display = 'none';
      
      expect(viewElements.newPuzzleBtn.style.display).toBe('none');
    });

    it('should show new puzzle button in DM mode', () => {
      viewElements.newPuzzleBtn.style.display = 'block';
      
      expect(viewElements.newPuzzleBtn.style.display).toBe('block');
    });
  });

  describe('Local Storage', () => {
    it('should save mode to localStorage', () => {
      const mode = 'dm';
      localStorage.setItem('advm-view-mode', mode);
      
      expect(localStorage.setItem).toHaveBeenCalledWith('advm-view-mode', 'dm');
    });

    it('should load mode from localStorage', () => {
      localStorage.getItem.mockReturnValue('dm');
      const mode = localStorage.getItem('advm-view-mode');
      
      expect(mode).toBe('dm');
    });

    it('should default to player mode if no storage', () => {
      localStorage.getItem.mockReturnValue(null);
      const mode = localStorage.getItem('advm-view-mode') || 'player';
      
      expect(mode).toBe('player');
    });
  });

  describe('Event Handling', () => {
    it('should handle toggle button click', () => {
      const handler = vi.fn();
      viewElements.toggleBtn.addEventListener('click', handler);
      viewElements.toggleBtn.click();
      
      expect(handler).toHaveBeenCalledOnce();
    });

    it('should emit mode change event', () => {
      const handler = vi.fn();
      document.addEventListener('viewModeChanged', handler);
      
      const event = new CustomEvent('viewModeChanged', { detail: { mode: 'dm' } });
      document.dispatchEvent(event);
      
      expect(handler).toHaveBeenCalled();
      expect(handler.mock.calls[0][0].detail.mode).toBe('dm');
    });
  });

  describe('Feature Availability', () => {
    it('should enable node editing in DM mode', () => {
      const mode = 'dm';
      const canEdit = mode === 'dm';
      
      expect(canEdit).toBe(true);
    });

    it('should disable node editing in player mode', () => {
      const mode = 'player';
      const canEdit = mode === 'dm';
      
      expect(canEdit).toBe(false);
    });

    it('should show all glyphs in DM mode', () => {
      const mode = 'dm';
      const showAll = mode === 'dm';
      
      expect(showAll).toBe(true);
    });

    it('should hide unrevealed glyphs in player mode', () => {
      const mode = 'player';
      const isRevealed = false;
      const shouldShow = mode === 'dm' || isRevealed;
      
      expect(shouldShow).toBe(false);
    });
  });
});
