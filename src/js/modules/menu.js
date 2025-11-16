/**
 * MenuSystem
 * Navigation menu for ADVM application
 */

import { viewManager } from './viewManager.js';
import { revealManager } from './revealManager.js';
import { TreatiseViewer } from './treatiseViewer.js';

export class MenuSystem {
  constructor() {
    this.isOpen = false;
    this.treatiseViewer = new TreatiseViewer();
    this.menuElement = null;
  }

  /**
   * Initialize menu system
   */
  init() {
    this.createMenu();
    this.attachListeners();
  }

  /**
   * Create menu DOM structure
   */
  createMenu() {
    const menu = document.createElement('nav');
    menu.className = 'app-menu';
    menu.innerHTML = `
      <button class="menu-toggle" aria-label="Open menu">
        <span class="menu-icon">☰</span>
      </button>
      
      <div class="menu-content">
        <div class="menu-header">
          <h2>ADVM Console</h2>
          <button class="menu-close" aria-label="Close menu">×</button>
        </div>
        
        <section class="menu-section menu-primary">
          <h3>Matrix</h3>
          <button class="menu-btn" data-action="new-matrix">
            <span class="menu-icon">➕</span>
            New Matrix
          </button>
          <button class="menu-btn" data-action="load-spell">
            <span class="menu-icon">📂</span>
            Load Spell
          </button>
          <button class="menu-btn" data-action="save-matrix">
            <span class="menu-icon">💾</span>
            Save Matrix
          </button>
        </section>
        
        <section class="menu-section menu-reference">
          <h3>Reference</h3>
          <button class="menu-btn" data-action="view-treatise">
            <span class="menu-icon">📖</span>
            Treatise
          </button>
          <button class="menu-btn" data-action="glyph-reference">
            <span class="menu-icon">🔣</span>
            Glyph Bank
          </button>
          <button class="menu-btn" data-action="flow-patterns">
            <span class="menu-icon">🌀</span>
            Flow Patterns
          </button>
        </section>
        
        <section class="menu-section menu-tools">
          <h3>Tools</h3>
          <button class="menu-btn" data-action="toggle-view">
            <span class="menu-icon">👁</span>
            <span class="view-mode-text">Switch to DM View</span>
          </button>
          <button class="menu-btn" data-action="reveal-manager">
            <span class="menu-icon">🔓</span>
            Reveal Nodes
          </button>
          <button class="menu-btn" data-action="export-notes">
            <span class="menu-icon">📋</span>
            Export Notes
          </button>
        </section>
        
        <section class="menu-section menu-settings">
          <h3>Settings</h3>
          <button class="menu-btn" data-action="preferences">
            <span class="menu-icon">⚙️</span>
            Preferences
          </button>
          <button class="menu-btn" data-action="about">
            <span class="menu-icon">ℹ️</span>
            About
          </button>
        </section>
      </div>
      
      <div class="menu-overlay"></div>
    `;
    
    document.body.appendChild(menu);
    this.menuElement = menu;
    
    // Update view mode text
    this.updateViewModeText();
  }

  /**
   * Attach event listeners
   */
  attachListeners() {
    const toggle = this.menuElement.querySelector('.menu-toggle');
    const close = this.menuElement.querySelector('.menu-close');
    const overlay = this.menuElement.querySelector('.menu-overlay');
    const buttons = this.menuElement.querySelectorAll('.menu-btn');
    
    // Toggle menu
    toggle.addEventListener('click', () => this.open());
    close.addEventListener('click', () => this.close());
    overlay.addEventListener('click', () => this.close());
    
    // Menu actions
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        this.handleAction(action);
        this.close();
      });
    });
    
    // Listen for view changes
    viewManager.addListener(() => this.updateViewModeText());
    
    // Keyboard shortcut (Escape to close)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });
  }

  /**
   * Handle menu action
   */
  async handleAction(action) {
    switch (action) {
      case 'new-matrix':
        this.newMatrix();
        break;
      case 'load-spell':
        this.loadSpell();
        break;
      case 'save-matrix':
        this.saveMatrix();
        break;
      case 'view-treatise':
        this.treatiseViewer.open();
        break;
      case 'glyph-reference':
        this.showGlyphReference();
        break;
      case 'flow-patterns':
        this.showFlowPatterns();
        break;
      case 'toggle-view':
        await this.toggleView();
        break;
      case 'reveal-manager':
        this.openRevealManager();
        break;
      case 'export-notes':
        this.exportNotes();
        break;
      case 'preferences':
        this.showPreferences();
        break;
      case 'about':
        this.showAbout();
        break;
      default:
        console.warn('Unknown action:', action);
    }
  }

  /**
   * Open menu
   */
  open() {
    this.isOpen = true;
    this.menuElement.classList.add('open');
  }

  /**
   * Close menu
   */
  close() {
    this.isOpen = false;
    this.menuElement.classList.remove('open');
  }

  /**
   * Toggle view mode
   */
  async toggleView() {
    const success = await viewManager.toggleView();
    if (success) {
      this.updateViewModeText();
    }
  }

  /**
   * Update view mode button text
   */
  updateViewModeText() {
    const text = this.menuElement.querySelector('.view-mode-text');
    if (text) {
      const currentView = viewManager.getCurrentView();
      text.textContent = currentView === 'player' 
        ? 'Switch to DM View' 
        : 'Switch to Player View';
    }
  }

  /**
   * Create new matrix
   */
  newMatrix() {
    if (confirm('Create a new matrix? Unsaved changes will be lost.')) {
      // Dispatch event for main app
      document.dispatchEvent(new CustomEvent('advm:new-matrix'));
    }
  }

  /**
   * Load spell from library
   */
  loadSpell() {
    document.dispatchEvent(new CustomEvent('advm:load-spell'));
  }

  /**
   * Save current matrix
   */
  saveMatrix() {
    document.dispatchEvent(new CustomEvent('advm:save-matrix'));
  }

  /**
   * Show glyph reference
   */
  showGlyphReference() {
    document.dispatchEvent(new CustomEvent('advm:show-glyphs'));
  }

  /**
   * Show flow patterns guide
   */
  showFlowPatterns() {
    document.dispatchEvent(new CustomEvent('advm:show-flows'));
  }

  /**
   * Open reveal manager panel
   */
  openRevealManager() {
    if (viewManager.getCurrentView() !== 'dm') {
      alert('Reveal controls are only available in DM View');
      return;
    }
    
    const existingPanel = document.querySelector('.reveal-panel');
    if (existingPanel) {
      existingPanel.remove();
    }
    
    const panel = revealManager.createRevealPanel();
    document.body.appendChild(panel);
  }

  /**
   * Export notes and matrices
   */
  exportNotes() {
    const data = {
      timestamp: new Date().toISOString(),
      viewState: viewManager.exportState(),
      // Additional data would come from main app
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `advm-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Show preferences dialog
   */
  showPreferences() {
    const dialog = document.createElement('div');
    dialog.className = 'preferences-dialog modal';
    dialog.innerHTML = `
      <div class="modal-overlay"></div>
      <div class="modal-content">
        <h2>⚙️ Preferences</h2>
        
        <div class="pref-section">
          <h3>View Settings</h3>
          <label>
            <input type="checkbox" id="pref-animations" checked />
            Enable animations
          </label>
          <label>
            <input type="checkbox" id="pref-sounds" />
            Enable sound effects
          </label>
        </div>
        
        <div class="pref-section">
          <h3>DM Settings</h3>
          <label>
            Change DM Password:
            <input type="password" id="pref-dm-password" placeholder="New password" />
          </label>
          <button id="pref-save-password" class="btn-secondary">Update Password</button>
        </div>
        
        <div class="modal-actions">
          <button class="btn-primary pref-close">Close</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(dialog);
    
    // Attach listeners
    dialog.querySelector('.modal-overlay').addEventListener('click', () => dialog.remove());
    dialog.querySelector('.pref-close').addEventListener('click', () => dialog.remove());
    
    dialog.querySelector('#pref-save-password').addEventListener('click', () => {
      const passwordInput = dialog.querySelector('#pref-dm-password');
      const newPassword = passwordInput.value.trim();
      if (newPassword) {
        try {
          viewManager.setDMPassword(newPassword);
          alert('DM password updated successfully');
          passwordInput.value = '';
        } catch (error) {
          alert(error.message);
        }
      }
    });
  }

  /**
   * Show about dialog
   */
  showAbout() {
    const dialog = document.createElement('div');
    dialog.className = 'about-dialog modal';
    dialog.innerHTML = `
      <div class="modal-overlay"></div>
      <div class="modal-content">
        <h2>ℹ️ About ADVM Console</h2>
        
        <p><strong>Arcane Device Visual Matrix</strong></p>
        <p>A Treatise on Arcane Matrices - Interactive Console</p>
        
        <div class="about-info">
          <p>This console provides an interactive interface for encoding and analyzing spells using the ADVM system described in the treatise.</p>
          
          <h3>Features</h3>
          <ul>
            <li>Visual 3x3 matrix grid system</li>
            <li>Three-layer spell encoding (MVM, CL, SL)</li>
            <li>DM and Player view modes</li>
            <li>Progressive node revelation</li>
            <li>Comprehensive glyph library</li>
            <li>Responsive design for all devices</li>
          </ul>
          
          <h3>Keyboard Shortcuts</h3>
          <ul>
            <li><kbd>Esc</kbd> - Close menu/dialogs</li>
            <li><kbd>Ctrl+M</kbd> - Toggle menu</li>
            <li><kbd>Ctrl+T</kbd> - Open treatise</li>
            <li><kbd>Ctrl+D</kbd> - Toggle DM view</li>
          </ul>
        </div>
        
        <div class="modal-actions">
          <button class="btn-primary about-close">Close</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(dialog);
    
    dialog.querySelector('.modal-overlay').addEventListener('click', () => dialog.remove());
    dialog.querySelector('.about-close').addEventListener('click', () => dialog.remove());
  }
}

// Initialize menu when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const menu = new MenuSystem();
    menu.init();
  });
} else {
  const menu = new MenuSystem();
  menu.init();
}

export const menuSystem = new MenuSystem();
