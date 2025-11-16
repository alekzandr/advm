/**
 * RevealManager
 * Handles progressive node revelation and discovery mechanics
 */

import { viewManager } from './viewManager.js';

export class RevealManager {
  constructor() {
    this.revealModes = {
      single: 'Reveal one node',
      layer: 'Reveal entire layer',
      flow: 'Reveal flow path',
      progressive: 'Reveal as players trace'
    };
    
    this.currentMode = 'single';
    this.activeMatrix = null;
    this.flowPaths = new Map(); // Store flow paths for matrices
    this.listeners = new Set();
  }

  /**
   * Set the active matrix for revelation
   * @param {string} matrixId - Matrix identifier
   */
  setActiveMatrix(matrixId) {
    this.activeMatrix = matrixId;
  }

  /**
   * Get current reveal mode
   * @returns {string}
   */
  getMode() {
    return this.currentMode;
  }

  /**
   * Set reveal mode
   * @param {string} mode - One of: single, layer, flow, progressive
   */
  setMode(mode) {
    if (!this.revealModes[mode]) {
      throw new Error(`Invalid mode: ${mode}`);
    }
    this.currentMode = mode;
  }

  /**
   * Reveal a node with visual effect
   * @param {string} matrixId - Matrix identifier
   * @param {string} layer - Layer name
   * @param {string} position - Node position (e.g., "1-1")
   * @param {string} effect - Visual effect: glow, pulse, fade
   */
  revealNode(matrixId, layer, position, effect = 'glow') {
    // Update view manager
    viewManager.revealNode(matrixId, layer, position);
    
    // Find DOM element
    const nodeElement = this.findNodeElement(matrixId, layer, position);
    if (nodeElement) {
      this.applyRevealEffect(nodeElement, effect);
    }
    
    // Notify listeners
    this.notifyListeners('reveal', { matrixId, layer, position, effect });
    
    // Announce discovery
    this.announceDiscovery(matrixId, layer, position);
  }

  /**
   * Find node DOM element
   * @private
   */
  findNodeElement(matrixId, layer, position) {
    const selector = `[data-matrix="${matrixId}"][data-layer="${layer}"][data-position="${position}"]`;
    return document.querySelector(selector);
  }

  /**
   * Apply visual reveal effect
   * @private
   */
  applyRevealEffect(element, effect) {
    // Remove any existing effect classes
    element.classList.remove('reveal-glow', 'reveal-pulse', 'reveal-fade');
    
    // Add new effect class
    element.classList.add(`reveal-${effect}`, 'revealed');
    
    // Remove effect class after animation
    setTimeout(() => {
      element.classList.remove(`reveal-${effect}`);
    }, 2000);
  }

  /**
   * Announce node discovery
   * @private
   */
  announceDiscovery(matrixId, layer, position) {
    const notification = document.createElement('div');
    notification.className = 'discovery-notification';
    notification.innerHTML = `
      <div class="discovery-icon">✨</div>
      <div class="discovery-text">
        <strong>Glyph Discovered!</strong>
        <span>${layer} • Position ${position}</span>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Remove after delay
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  /**
   * Reveal entire layer
   * @param {string} matrixId - Matrix identifier
   * @param {string} layer - Layer name
   * @param {string} effect - Visual effect
   */
  revealLayer(matrixId, layer, effect = 'pulse') {
    viewManager.revealLayer(matrixId, layer);
    
    // Apply effects to all nodes with staggered timing
    let delay = 0;
    for (let row = 1; row <= 3; row++) {
      for (let col = 1; col <= 3; col++) {
        const position = `${row}-${col}`;
        setTimeout(() => {
          const nodeElement = this.findNodeElement(matrixId, layer, position);
          if (nodeElement) {
            this.applyRevealEffect(nodeElement, effect);
          }
        }, delay);
        delay += 150; // Stagger by 150ms
      }
    }
    
    this.notifyListeners('revealLayer', { matrixId, layer });
  }

  /**
   * Set flow path for progressive revelation
   * @param {string} matrixId - Matrix identifier
   * @param {Array} path - Array of {layer, position} objects
   */
  setFlowPath(matrixId, path) {
    this.flowPaths.set(matrixId, path);
  }

  /**
   * Get flow path for matrix
   * @param {string} matrixId - Matrix identifier
   * @returns {Array}
   */
  getFlowPath(matrixId) {
    return this.flowPaths.get(matrixId) || [];
  }

  /**
   * Reveal nodes along flow path
   * @param {string} matrixId - Matrix identifier
   * @param {string} effect - Visual effect
   */
  revealFlowPath(matrixId, effect = 'glow') {
    const path = this.getFlowPath(matrixId);
    if (!path.length) {
      console.warn('No flow path set for matrix:', matrixId);
      return;
    }
    
    // Reveal each node in sequence
    path.forEach((node, index) => {
      setTimeout(() => {
        this.revealNode(matrixId, node.layer, node.position, effect);
      }, index * 500); // 500ms between reveals
    });
    
    this.notifyListeners('revealFlow', { matrixId, pathLength: path.length });
  }

  /**
   * Setup progressive revelation based on player tracing
   * @param {string} matrixId - Matrix identifier
   * @param {Array} correctPath - Correct flow path
   * @param {Array} playerPath - Player's traced path
   */
  checkProgressiveReveal(matrixId, correctPath, playerPath) {
    let revealed = 0;
    
    for (let i = 0; i < Math.min(correctPath.length, playerPath.length); i++) {
      const correct = correctPath[i];
      const player = playerPath[i];
      
      // Check if player traced correctly
      if (correct.layer === player.layer && correct.position === player.position) {
        // Reveal this node
        if (!viewManager.isNodeRevealed(matrixId, correct.layer, correct.position)) {
          this.revealNode(matrixId, correct.layer, correct.position, 'pulse');
          revealed++;
        }
      } else {
        // Stop at first incorrect node
        break;
      }
    }
    
    return {
      revealed,
      correct: revealed === correctPath.length,
      progress: revealed / correctPath.length
    };
  }

  /**
   * Create DM reveal control panel
   * @returns {HTMLElement}
   */
  createRevealPanel() {
    const panel = document.createElement('div');
    panel.className = 'reveal-panel';
    panel.innerHTML = `
      <div class="reveal-header">
        <h3>🔓 Reveal Controls</h3>
        <button class="reveal-close" title="Close">×</button>
      </div>
      
      <div class="reveal-mode">
        <label>Reveal Mode:</label>
        <select class="reveal-mode-select">
          <option value="single">Single Node</option>
          <option value="layer">Entire Layer</option>
          <option value="flow">Flow Path</option>
          <option value="progressive">Progressive (Player Trace)</option>
        </select>
      </div>
      
      <div class="reveal-layers">
        <label>Select Layer:</label>
        <div class="layer-buttons">
          <button class="layer-btn" data-layer="MVM">MVM</button>
          <button class="layer-btn" data-layer="CL">CL</button>
          <button class="layer-btn" data-layer="SL">SL</button>
        </div>
      </div>
      
      <div class="reveal-grid">
        <label>Select Node:</label>
        <div class="reveal-grid-buttons">
          ${this.generateGridButtons()}
        </div>
      </div>
      
      <div class="reveal-actions">
        <button class="reveal-btn reveal-selected">Reveal Selected</button>
        <button class="reveal-btn reveal-all-layer">Reveal Layer</button>
        <button class="reveal-btn reveal-flow">Reveal Flow Path</button>
        <button class="reveal-btn clear-all">Clear All</button>
      </div>
      
      <div class="reveal-stats">
        <small>Revealed: <span class="reveal-count">0</span> nodes</small>
      </div>
    `;
    
    this.attachPanelListeners(panel);
    return panel;
  }

  /**
   * Generate 3x3 grid buttons
   * @private
   */
  generateGridButtons() {
    let html = '';
    for (let row = 1; row <= 3; row++) {
      for (let col = 1; col <= 3; col++) {
        html += `<button class="grid-btn" data-position="${row}-${col}">${row},${col}</button>`;
      }
    }
    return html;
  }

  /**
   * Attach event listeners to reveal panel
   * @private
   */
  attachPanelListeners(panel) {
    const modeSelect = panel.querySelector('.reveal-mode-select');
    const layerBtns = panel.querySelectorAll('.layer-btn');
    const gridBtns = panel.querySelectorAll('.grid-btn');
    const revealSelected = panel.querySelector('.reveal-selected');
    const revealAllLayer = panel.querySelector('.reveal-all-layer');
    const revealFlow = panel.querySelector('.reveal-flow');
    const clearAll = panel.querySelector('.clear-all');
    const closeBtn = panel.querySelector('.reveal-close');
    
    let selectedLayer = null;
    let selectedPosition = null;
    
    // Mode selection
    modeSelect.addEventListener('change', (e) => {
      this.setMode(e.target.value);
    });
    
    // Layer selection
    layerBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        layerBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedLayer = btn.dataset.layer;
      });
    });
    
    // Grid position selection
    gridBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        gridBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedPosition = btn.dataset.position;
      });
    });
    
    // Reveal selected node
    revealSelected.addEventListener('click', () => {
      if (!selectedLayer || !selectedPosition) {
        alert('Please select a layer and position');
        return;
      }
      if (!this.activeMatrix) {
        alert('No active matrix');
        return;
      }
      this.revealNode(this.activeMatrix, selectedLayer, selectedPosition);
      this.updateRevealCount(panel);
    });
    
    // Reveal entire layer
    revealAllLayer.addEventListener('click', () => {
      if (!selectedLayer) {
        alert('Please select a layer');
        return;
      }
      if (!this.activeMatrix) {
        alert('No active matrix');
        return;
      }
      this.revealLayer(this.activeMatrix, selectedLayer);
      this.updateRevealCount(panel);
    });
    
    // Reveal flow path
    revealFlow.addEventListener('click', () => {
      if (!this.activeMatrix) {
        alert('No active matrix');
        return;
      }
      this.revealFlowPath(this.activeMatrix);
      this.updateRevealCount(panel);
    });
    
    // Clear all revealed nodes
    clearAll.addEventListener('click', () => {
      if (!this.activeMatrix) {
        alert('No active matrix');
        return;
      }
      if (confirm('Clear all revealed nodes for this matrix?')) {
        viewManager.clearRevealedNodes(this.activeMatrix);
        this.updateRevealCount(panel);
      }
    });
    
    // Close panel
    closeBtn.addEventListener('click', () => {
      panel.remove();
    });
  }

  /**
   * Update reveal count in panel
   * @private
   */
  updateRevealCount(panel) {
    const countSpan = panel.querySelector('.reveal-count');
    if (countSpan && this.activeMatrix) {
      let count = 0;
      viewManager.revealedNodes.forEach(nodeKey => {
        if (nodeKey.startsWith(`${this.activeMatrix}-`)) {
          count++;
        }
      });
      countSpan.textContent = count;
    }
  }

  /**
   * Add event listener
   * @param {Function} callback
   */
  addListener(callback) {
    this.listeners.add(callback);
  }

  /**
   * Remove event listener
   * @param {Function} callback
   */
  removeListener(callback) {
    this.listeners.delete(callback);
  }

  /**
   * Notify listeners
   * @private
   */
  notifyListeners(event, data) {
    this.listeners.forEach(callback => {
      try {
        callback(event, data);
      } catch (error) {
        console.error('Error in reveal listener:', error);
      }
    });
  }
}

// Create singleton instance
export const revealManager = new RevealManager();
