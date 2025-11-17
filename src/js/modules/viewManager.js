/**
 * ViewManager
 * Handles DM/Player view switching and authentication
 */

import { RateLimiter, hashPassword } from '../utils/security.js';

export class ViewManager {
  constructor() {
    this.currentView = this.loadSavedView() || 'player';
    this.revealedNodes = new Set(this.loadRevealedNodes());
    this.dmAuthenticated = false;
    this.listeners = new Set();
    this.authLimiter = new RateLimiter(5, 300000); // 5 attempts per 5 minutes
    this.sessionTimeout = null;
    
    // Check if DM was previously authenticated (session-based)
    if (sessionStorage.getItem('dmAuthenticated') === 'true') {
      this.dmAuthenticated = true;
      this.startSessionTimeout();
      if (this.currentView === 'dm') {
        this.currentView = 'dm'; // Restore DM view
      }
    }
  }

  /**
   * Get current view mode
   * @returns {'player'|'dm'} Current view
   */
  getCurrentView() {
    return this.currentView;
  }

  /**
   * Check if user is in DM view
   * @returns {boolean}
   */
  isDMView() {
    return this.currentView === 'dm';
  }

  /**
   * Toggle between player and DM views
   * @returns {boolean} Success status
   */
  async toggleView() {
    const targetView = this.currentView === 'player' ? 'dm' : 'player';
    return this.setView(targetView);
  }

  /**
   * Set specific view mode
   * @param {'player'|'dm'} view - Target view
   * @returns {boolean} Success status
   */
  async setView(view) {
    if (view === 'dm' && !this.dmAuthenticated) {
      const authenticated = await this.authenticateDM();
      if (!authenticated) {
        return false;
      }
    }

    this.currentView = view;
    this.saveView();
    this.notifyListeners();
    return true;
  }

  /**
   * Authenticate as DM
   * @returns {Promise<boolean>} Authentication success
   */
  async authenticateDM() {
    console.log('[ViewManager] Starting DM authentication...');
    
    // Check rate limiting
    if (!this.authLimiter.check()) {
      const retryAfter = Math.ceil(this.authLimiter.getRetryAfter() / 1000);
      alert(`⏱️ Too many authentication attempts. Please try again in ${retryAfter} seconds.`);
      return false;
    }
    
    // Use simple prompt for immediate functionality
    const storedKeyHash = sessionStorage.getItem('dmKeyHash');
    const password = prompt('🔐 Enter DM password to access full matrix view:\n\n(Default: arcane2024)');
    
    if (password === null) {
      console.log('[ViewManager] Authentication cancelled');
      return false;
    }
    
    // Validate password complexity
    if (password.length < 8) {
      alert('❌ Password must be at least 8 characters.');
      return false;
    }
    
    // Hash the entered password
    const passwordHash = await hashPassword(password);
    
    // First time or compare with stored hash
    const defaultHash = await hashPassword('arcane2024');
    const isValid = storedKeyHash ? passwordHash === storedKeyHash : passwordHash === defaultHash;
    
    if (isValid) {
      console.log('[ViewManager] Authentication successful');
      this.dmAuthenticated = true;
      sessionStorage.setItem('dmAuthenticated', 'true');
      sessionStorage.setItem('dmKeyHash', passwordHash);
      this.startSessionTimeout();
      return true;
    } else {
      console.log('[ViewManager] Authentication failed - incorrect password');
      alert('❌ Incorrect password. Please try again.');
      return false;
    }
  }
  
  /**
   * Start session timeout (30 minutes)
   * @private
   */
  startSessionTimeout() {
    // Clear existing timeout
    if (this.sessionTimeout) {
      clearTimeout(this.sessionTimeout);
    }
    
    // Set 30 minute timeout
    this.sessionTimeout = setTimeout(() => {
      console.log('[ViewManager] Session expired');
      this.logoutDM();
      alert('🕐 Your DM session has expired. Please authenticate again.');
    }, 30 * 60 * 1000); // 30 minutes
  }

  /**
   * Create authentication modal
   * @private
   */
  createAuthModal() {
    const modal = document.createElement('div');
    modal.className = 'view-auth-modal';
    modal.innerHTML = `
      <div class="auth-overlay"></div>
      <div class="auth-dialog">
        <h2>🔐 DM Authentication</h2>
        <p>Enter the DM password to access full matrix view</p>
        <input type="password" placeholder="Enter DM password" />
        <div class="auth-buttons">
          <button class="auth-cancel">Cancel</button>
          <button class="auth-submit">Authenticate</button>
        </div>
        <small class="auth-hint">Default: arcane2024</small>
      </div>
    `;
    return modal;
  }

  /**
   * Logout from DM view
   */
  logoutDM() {
    this.dmAuthenticated = false;
    sessionStorage.removeItem('dmAuthenticated');
    sessionStorage.removeItem('dmKeyHash');
    
    // Clear session timeout
    if (this.sessionTimeout) {
      clearTimeout(this.sessionTimeout);
      this.sessionTimeout = null;
    }
    
    if (this.currentView === 'dm') {
      this.setView('player');
    }
  }

  /**
   * Set custom DM password
   * @param {string} password - New DM password
   */
  async setDMPassword(password) {
    if (!password || password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }
    
    // Hash and store the password
    const passwordHash = await hashPassword(password);
    sessionStorage.setItem('dmKeyHash', passwordHash);
  }

  /**
   * Check if a node has been revealed
   * @param {string} matrixId - Matrix identifier OR full nodeKey
   * @param {string} layer - Layer name (optional if matrixId is full key)
   * @param {string} position - Node position (optional if matrixId is full key)
   * @returns {boolean}
   */
  isNodeRevealed(matrixId, layer, position) {
    let nodeKey;
    if (arguments.length === 1) {
      // Single parameter - treat as full node key
      nodeKey = matrixId;
    } else {
      // Three parameters - build the key
      nodeKey = `${matrixId}-${layer}-${position}`;
    }
    return this.revealedNodes.has(nodeKey);
  }

  /**
   * Reveal a specific node
   * @param {string} matrixId - Matrix identifier OR full nodeKey
   * @param {string} layer - Layer name (optional if matrixId is full key)
   * @param {string} position - Node position (optional if matrixId is full key)
   */
  revealNode(matrixId, layer, position) {
    let nodeKey;
    if (arguments.length === 1) {
      // Single parameter - treat as full node key
      nodeKey = matrixId;
    } else {
      // Three parameters - build the key
      nodeKey = `${matrixId}-${layer}-${position}`;
    }
    this.revealedNodes.add(nodeKey);
    this.saveRevealedNodes();
    this.notifyListeners();
  }

  /**
   * Hide a previously revealed node
   * @param {string} matrixId - Matrix identifier
   * @param {string} layer - Layer name
   * @param {string} position - Node position
   */
  hideNode(matrixId, layer, position) {
    const nodeKey = `${matrixId}-${layer}-${position}`;
    this.revealedNodes.delete(nodeKey);
    this.saveRevealedNodes();
    this.notifyListeners();
  }

  /**
   * Reveal all nodes in a layer
   * @param {string} matrixId - Matrix identifier
   * @param {string} layer - Layer name
   */
  revealLayer(matrixId, layer) {
    // Add all 9 positions in the 3x3 grid
    for (let row = 1; row <= 3; row++) {
      for (let col = 1; col <= 3; col++) {
        this.revealNode(matrixId, layer, `${row}-${col}`);
      }
    }
  }

  /**
   * Clear all revealed nodes for a matrix
   * @param {string} matrixId - Matrix identifier
   */
  clearRevealedNodes(matrixId) {
    const nodesToRemove = [];
    for (const nodeKey of this.revealedNodes) {
      if (nodeKey.startsWith(`${matrixId}-`)) {
        nodesToRemove.push(nodeKey);
      }
    }
    nodesToRemove.forEach(key => this.revealedNodes.delete(key));
    this.saveRevealedNodes();
    this.notifyListeners();
  }

  /**
   * Register a listener for view changes
   * @param {Function} callback - Called when view changes
   */
  addListener(callback) {
    this.listeners.add(callback);
  }

  /**
   * Register a listener for view changes (alias for addListener)
   * @param {string} event - Event name (currently only 'viewChanged' is supported)
   * @param {Function} callback - Called when view changes
   */
  on(event, callback) {
    if (event === 'viewChanged') {
      this.addListener(callback);
    }
  }

  /**
   * Remove a view change listener
   * @param {Function} callback - Listener to remove
   */
  removeListener(callback) {
    this.listeners.delete(callback);
  }

  /**
   * Notify all listeners of view change
   * @private
   */
  notifyListeners() {
    this.listeners.forEach(callback => {
      try {
        callback(this.currentView, this.revealedNodes);
      } catch (error) {
        console.error('Error in view listener:', error);
      }
    });
  }

  /**
   * Save current view to localStorage
   * @private
   */
  saveView() {
    localStorage.setItem('advmView', this.currentView);
  }

  /**
   * Load saved view from localStorage
   * @private
   */
  loadSavedView() {
    return localStorage.getItem('advmView');
  }

  /**
   * Save revealed nodes to localStorage
   * @private
   */
  saveRevealedNodes() {
    const nodes = Array.from(this.revealedNodes);
    localStorage.setItem('advmRevealedNodes', JSON.stringify(nodes));
  }

  /**
   * Load revealed nodes from localStorage
   * @private
   */
  loadRevealedNodes() {
    try {
      const saved = localStorage.getItem('advmRevealedNodes');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading revealed nodes:', error);
      return [];
    }
  }

  /**
   * Export view state for backup
   * @returns {Object} View state
   */
  exportState() {
    return {
      currentView: this.currentView,
      dmAuthenticated: this.dmAuthenticated,
      revealedNodes: Array.from(this.revealedNodes)
    };
  }

  /**
   * Import view state from backup
   * @param {Object} state - View state to restore
   */
  importState(state) {
    if (state.currentView) {
      this.currentView = state.currentView;
    }
    if (state.dmAuthenticated) {
      this.dmAuthenticated = state.dmAuthenticated;
      localStorage.setItem('dmAuthenticated', 'true');
    }
    if (Array.isArray(state.revealedNodes)) {
      this.revealedNodes = new Set(state.revealedNodes);
    }
    this.saveView();
    this.saveRevealedNodes();
    this.notifyListeners();
  }
}

// Create singleton instance
export const viewManager = new ViewManager();
