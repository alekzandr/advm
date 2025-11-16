/**
 * TouchHandler
 * Touch interactions for mobile and tablet devices
 */

export class TouchHandler {
  constructor(element) {
    this.element = element;
    this.touchStartTime = 0;
    this.touchStartPos = { x: 0, y: 0 };
    this.longPressTimer = null;
    this.longPressThreshold = 500; // ms
    this.swipeThreshold = 50; // px
    this.pinchStartDistance = 0;
    this.currentScale = 1;
    this.listeners = {
      longPress: [],
      swipe: [],
      pinch: [],
      tap: [],
      doubleTap: []
    };
    
    this.lastTapTime = 0;
    this.doubleTapThreshold = 300; // ms
    
    this.init();
  }

  /**
   * Initialize touch handlers
   */
  init() {
    if (!this.element) return;
    
    this.element.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
    this.element.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    this.element.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
    this.element.addEventListener('touchcancel', this.handleTouchCancel.bind(this));
  }

  /**
   * Handle touch start
   */
  handleTouchStart(e) {
    this.touchStartTime = Date.now();
    
    if (e.touches.length === 1) {
      // Single touch
      const touch = e.touches[0];
      this.touchStartPos = {
        x: touch.clientX,
        y: touch.clientY
      };
      
      // Start long press timer
      this.longPressTimer = setTimeout(() => {
        this.triggerLongPress(e);
      }, this.longPressThreshold);
      
    } else if (e.touches.length === 2) {
      // Two finger touch - prepare for pinch
      this.cancelLongPress();
      this.pinchStartDistance = this.getDistance(e.touches[0], e.touches[1]);
    }
  }

  /**
   * Handle touch move
   */
  handleTouchMove(e) {
    if (e.touches.length === 1) {
      // Check if moved significantly (cancel long press)
      const touch = e.touches[0];
      const deltaX = Math.abs(touch.clientX - this.touchStartPos.x);
      const deltaY = Math.abs(touch.clientY - this.touchStartPos.y);
      
      if (deltaX > 10 || deltaY > 10) {
        this.cancelLongPress();
      }
      
    } else if (e.touches.length === 2) {
      // Pinch gesture
      e.preventDefault();
      const currentDistance = this.getDistance(e.touches[0], e.touches[1]);
      const scale = currentDistance / this.pinchStartDistance;
      this.triggerPinch(scale, e);
    }
  }

  /**
   * Handle touch end
   */
  handleTouchEnd(e) {
    this.cancelLongPress();
    
    if (e.changedTouches.length === 1) {
      const touch = e.changedTouches[0];
      const touchDuration = Date.now() - this.touchStartTime;
      
      // Check for swipe
      const deltaX = touch.clientX - this.touchStartPos.x;
      const deltaY = touch.clientY - this.touchStartPos.y;
      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);
      
      if (absDeltaX > this.swipeThreshold || absDeltaY > this.swipeThreshold) {
        // Swipe detected
        let direction;
        if (absDeltaX > absDeltaY) {
          direction = deltaX > 0 ? 'right' : 'left';
        } else {
          direction = deltaY > 0 ? 'down' : 'up';
        }
        this.triggerSwipe(direction, { deltaX, deltaY }, e);
      } else if (touchDuration < 200) {
        // Quick tap
        const now = Date.now();
        if (now - this.lastTapTime < this.doubleTapThreshold) {
          // Double tap
          this.triggerDoubleTap(e);
          this.lastTapTime = 0; // Reset to prevent triple tap
        } else {
          // Single tap
          this.triggerTap(e);
          this.lastTapTime = now;
        }
      }
    }
    
    // Reset pinch
    if (e.touches.length < 2) {
      this.pinchStartDistance = 0;
    }
  }

  /**
   * Handle touch cancel
   */
  handleTouchCancel(e) {
    this.cancelLongPress();
  }

  /**
   * Get distance between two touch points
   */
  getDistance(touch1, touch2) {
    const dx = touch2.clientX - touch1.clientX;
    const dy = touch2.clientY - touch1.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Cancel long press timer
   */
  cancelLongPress() {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
  }

  /**
   * Trigger long press event
   */
  triggerLongPress(e) {
    const touch = e.touches[0];
    this.emit('longPress', {
      x: touch.clientX,
      y: touch.clientY,
      target: e.target,
      originalEvent: e
    });
  }

  /**
   * Trigger swipe event
   */
  triggerSwipe(direction, delta, e) {
    this.emit('swipe', {
      direction,
      deltaX: delta.deltaX,
      deltaY: delta.deltaY,
      target: e.target,
      originalEvent: e
    });
  }

  /**
   * Trigger pinch event
   */
  triggerPinch(scale, e) {
    this.emit('pinch', {
      scale,
      target: e.target,
      originalEvent: e
    });
  }

  /**
   * Trigger tap event
   */
  triggerTap(e) {
    const touch = e.changedTouches[0];
    this.emit('tap', {
      x: touch.clientX,
      y: touch.clientY,
      target: e.target,
      originalEvent: e
    });
  }

  /**
   * Trigger double tap event
   */
  triggerDoubleTap(e) {
    const touch = e.changedTouches[0];
    this.emit('doubleTap', {
      x: touch.clientX,
      y: touch.clientY,
      target: e.target,
      originalEvent: e
    });
  }

  /**
   * Register event listener
   */
  on(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event].push(callback);
    }
  }

  /**
   * Unregister event listener
   */
  off(event, callback) {
    if (this.listeners[event]) {
      const index = this.listeners[event].indexOf(callback);
      if (index >= 0) {
        this.listeners[event].splice(index, 1);
      }
    }
  }

  /**
   * Emit event to listeners
   */
  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in touch listener:', error);
        }
      });
    }
  }

  /**
   * Destroy handler and clean up
   */
  destroy() {
    this.cancelLongPress();
    // Remove event listeners
    this.element.removeEventListener('touchstart', this.handleTouchStart);
    this.element.removeEventListener('touchmove', this.handleTouchMove);
    this.element.removeEventListener('touchend', this.handleTouchEnd);
    this.element.removeEventListener('touchcancel', this.handleTouchCancel);
  }
}

/**
 * MatrixTouchHandler
 * Specialized touch handler for matrix grids
 */
export class MatrixTouchHandler extends TouchHandler {
  constructor(matrixElement) {
    super(matrixElement);
    this.selectedCell = null;
    this.dragPath = [];
    this.setupMatrixHandlers();
  }

  /**
   * Setup matrix-specific handlers
   */
  setupMatrixHandlers() {
    // Long press to reveal cell info
    this.on('longPress', (data) => {
      const cell = this.findCellElement(data.target);
      if (cell) {
        this.showCellInfo(cell);
      }
    });

    // Swipe to navigate layers
    this.on('swipe', (data) => {
      if (data.direction === 'left') {
        this.nextLayer();
      } else if (data.direction === 'right') {
        this.previousLayer();
      }
    });

    // Pinch to zoom matrix
    this.on('pinch', (data) => {
      this.zoomMatrix(data.scale);
    });

    // Tap to select cell
    this.on('tap', (data) => {
      const cell = this.findCellElement(data.target);
      if (cell) {
        this.selectCell(cell);
      }
    });

    // Double tap to lock/unlock cell
    this.on('doubleTap', (data) => {
      const cell = this.findCellElement(data.target);
      if (cell) {
        this.toggleCellLock(cell);
      }
    });
  }

  /**
   * Find cell element from touch target
   */
  findCellElement(target) {
    // Walk up DOM tree to find cell
    let element = target;
    while (element && !element.classList.contains('matrix-cell')) {
      element = element.parentElement;
    }
    return element;
  }

  /**
   * Show cell information overlay
   */
  showCellInfo(cell) {
    const info = this.extractCellInfo(cell);
    
    const overlay = document.createElement('div');
    overlay.className = 'cell-info-overlay';
    overlay.innerHTML = `
      <div class="cell-info-content">
        <h3>${info.name || 'Empty Cell'}</h3>
        <p><strong>Layer:</strong> ${info.layer}</p>
        <p><strong>Position:</strong> ${info.position}</p>
        ${info.meaning ? `<p><strong>Meaning:</strong> ${info.meaning}</p>` : ''}
        ${info.protocol ? `<p><strong>Protocol:</strong> ${info.protocol}</p>` : ''}
        <button class="close-overlay">Close</button>
      </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Add haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
    
    overlay.querySelector('.close-overlay').addEventListener('click', () => {
      overlay.remove();
    });
    
    setTimeout(() => overlay.classList.add('show'), 10);
  }

  /**
   * Extract cell information
   */
  extractCellInfo(cell) {
    return {
      layer: cell.dataset.layer,
      position: cell.dataset.position,
      name: cell.dataset.glyphName,
      meaning: cell.dataset.glyphMeaning,
      protocol: cell.dataset.glyphProtocol
    };
  }

  /**
   * Select a cell
   */
  selectCell(cell) {
    // Remove previous selection
    const previouslySelected = this.element.querySelector('.matrix-cell.selected');
    if (previouslySelected) {
      previouslySelected.classList.remove('selected');
    }
    
    // Add selection
    cell.classList.add('selected');
    this.selectedCell = cell;
    
    // Emit custom event
    this.element.dispatchEvent(new CustomEvent('cellSelected', {
      detail: this.extractCellInfo(cell)
    }));
    
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(30);
    }
  }

  /**
   * Toggle cell lock state
   */
  toggleCellLock(cell) {
    cell.classList.toggle('locked');
    
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate([30, 20, 30]);
    }
    
    // Emit event
    this.element.dispatchEvent(new CustomEvent('cellLockToggled', {
      detail: {
        ...this.extractCellInfo(cell),
        locked: cell.classList.contains('locked')
      }
    }));
  }

  /**
   * Navigate to next layer
   */
  nextLayer() {
    this.element.dispatchEvent(new CustomEvent('layerNavigate', {
      detail: { direction: 'next' }
    }));
  }

  /**
   * Navigate to previous layer
   */
  previousLayer() {
    this.element.dispatchEvent(new CustomEvent('layerNavigate', {
      detail: { direction: 'previous' }
    }));
  }

  /**
   * Zoom matrix
   */
  zoomMatrix(scale) {
    this.currentScale = Math.max(0.5, Math.min(2, scale));
    this.element.style.transform = `scale(${this.currentScale})`;
    
    // Emit zoom event
    this.element.dispatchEvent(new CustomEvent('matrixZoom', {
      detail: { scale: this.currentScale }
    }));
  }
}

/**
 * GlyphBankTouchHandler
 * Specialized handler for glyph bank drawer
 */
export class GlyphBankTouchHandler {
  constructor(drawerElement) {
    this.drawer = drawerElement;
    this.handle = drawerElement.querySelector('.glyph-bank-handle');
    this.isCollapsed = false;
    this.startY = 0;
    this.currentY = 0;
    this.isDragging = false;
    
    this.init();
  }

  /**
   * Initialize drawer handlers
   */
  init() {
    if (!this.handle) return;
    
    this.handle.addEventListener('touchstart', this.handleDragStart.bind(this), { passive: false });
    document.addEventListener('touchmove', this.handleDragMove.bind(this), { passive: false });
    document.addEventListener('touchend', this.handleDragEnd.bind(this));
  }

  /**
   * Handle drag start
   */
  handleDragStart(e) {
    this.isDragging = true;
    this.startY = e.touches[0].clientY;
    this.drawer.style.transition = 'none';
  }

  /**
   * Handle drag move
   */
  handleDragMove(e) {
    if (!this.isDragging) return;
    
    e.preventDefault();
    this.currentY = e.touches[0].clientY;
    const deltaY = this.currentY - this.startY;
    
    // Only allow dragging down when expanded, up when collapsed
    if ((deltaY > 0 && !this.isCollapsed) || (deltaY < 0 && this.isCollapsed)) {
      const transform = this.isCollapsed ? Math.min(0, deltaY) : Math.max(0, deltaY);
      this.drawer.style.transform = `translateY(${transform}px)`;
    }
  }

  /**
   * Handle drag end
   */
  handleDragEnd(e) {
    if (!this.isDragging) return;
    
    this.isDragging = false;
    this.drawer.style.transition = '';
    
    const deltaY = this.currentY - this.startY;
    const threshold = 50;
    
    // Determine if should toggle
    if (Math.abs(deltaY) > threshold) {
      if (deltaY > 0 && !this.isCollapsed) {
        this.collapse();
      } else if (deltaY < 0 && this.isCollapsed) {
        this.expand();
      }
    }
    
    // Reset transform
    this.drawer.style.transform = '';
  }

  /**
   * Collapse drawer
   */
  collapse() {
    this.isCollapsed = true;
    this.drawer.classList.add('collapsed');
  }

  /**
   * Expand drawer
   */
  expand() {
    this.isCollapsed = false;
    this.drawer.classList.remove('collapsed');
  }
}
