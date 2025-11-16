/**
 * Matrix3D - 3D Cube visualization for ADVM layers
 * Renders MVM, CL, and SL as stacked layers in a 3D space
 */

export class Matrix3D {
    constructor(container, options = {}) {
        this.container = container;
        this.rotationX = -20;
        this.rotationY = 30;
        this.currentLayer = 'all'; // 'all', 'mvm', 'cl', 'sl'
        
        // New state machine for interaction
        this.interactionState = 'idle'; // 'idle', 'potential-click', 'dragging'
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.dragStartTime = 0;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        
        // Thresholds for drag detection
        this.DRAG_THRESHOLD = 10; // pixels - must move this much to be considered a drag
        this.DRAG_TIME_THRESHOLD = 50; // ms - minimum time before drag can start
        
        this.onNodeClick = options.onNodeClick || (() => {});
        this.controlsSetup = false; // Track if controls have been set up
        
        // View mode support
        this.viewMode = 'player'; // 'player' or 'dm'
        this.revealedNodes = new Set(); // Track revealed nodes for player mode
        
        this.nodeData = {
            mvm: this.createEmptyLayer(),
            cl: this.createEmptyLayer(),
            sl: this.createEmptyLayer()
        };
        
        this.nodePurposes = this.getNodePurposes();
        
        this.init();
    }
    
    createEmptyLayer() {
        return Array(9).fill(null).map(() => ({ glyph: '', purpose: '', revealed: false }));
    }
    
    getNodePurposes() {
        return {
            mvm: [
                'School Anchor',
                'Potency Tier',
                'Interval',
                'Action',
                'Influence',
                'Modifier',
                'Shape',
                'Range',
                'Duration'
            ],
            cl: [
                'Verbal',
                'Somatic',
                'Material',
                'Catalyst',
                'Substitution',
                'Stability',
                'Will',
                'Resistance',
                'Alignment'
            ],
            sl: [
                'Initiation',
                'Branch',
                'Divergence',
                'Recursive',
                'Exception',
                'Alternative',
                'Collapse',
                'Stabilizer',
                'Terminus'
            ]
        };
    }
    
    init() {
        this.render();
        this.setupControls();
    }
    
    render() {
        this.container.innerHTML = `
            <div class="cube-viewport">
                <div class="cube-controls">
                    <button class="cube-btn" data-action="rotate-left" title="Rotate Left (←)">↶</button>
                    <button class="cube-btn" data-action="rotate-right" title="Rotate Right (→)">↷</button>
                    <button class="cube-btn" data-action="rotate-up" title="Rotate Up (↑)">⬆</button>
                    <button class="cube-btn" data-action="rotate-down" title="Rotate Down (↓)">⬇</button>
                    <button class="cube-btn" data-action="reset" title="Reset View (R)">⟲</button>
                </div>
                <div class="layer-selector">
                    <button class="layer-btn active" data-layer="all">All Layers</button>
                    <button class="layer-btn" data-layer="mvm">MVM</button>
                    <button class="layer-btn" data-layer="cl">CL</button>
                    <button class="layer-btn" data-layer="sl">SL</button>
                </div>
                <div class="cube-container">
                    <div class="cube" style="transform: rotateX(${this.rotationX}deg) rotateY(${this.rotationY}deg)">
                        ${this.renderLayer('mvm', 'MVM - Metamagical Vector Matrix', 200)}
                        ${this.renderLayer('cl', 'CL - Constraint Lattice', 0)}
                        ${this.renderLayer('sl', 'SL - Specialist Layer', -200)}
                    </div>
                </div>
                <div class="cube-hint">
                    <kbd>Drag</kbd> to rotate • <kbd>1</kbd><kbd>2</kbd><kbd>3</kbd> for layers • <kbd>0</kbd> for all
                </div>
            </div>
        `;
    }
    
    renderLayer(layerId, title, zOffset) {
        const opacity = this.currentLayer === 'all' ? 1 : (this.currentLayer === layerId ? 1 : 0.15);
        const pointerEvents = this.currentLayer === 'all' || this.currentLayer === layerId ? 'auto' : 'none';
        
        return `
            <div class="matrix-layer ${layerId}-layer" 
                 data-layer="${layerId}" 
                 style="transform: translateZ(${zOffset}px); opacity: ${opacity}; pointer-events: ${pointerEvents}">
                <div class="layer-title">${title}</div>
                <div class="layer-grid">
                    ${this.nodeData[layerId].map((node, index) => this.renderNode(layerId, index, node)).join('')}
                </div>
            </div>
        `;
    }
    
    renderNode(layerId, index, nodeData) {
        const nodeId = `${layerId}-${index}`;
        const purpose = this.nodePurposes[layerId][index];
        const isEmpty = !nodeData.glyph;
        
        // In player mode, check if node is revealed
        const isRevealed = this.revealedNodes.has(nodeId) || nodeData.revealed;
        const isDMMode = this.viewMode === 'dm';
        
        // Determine what to show
        let displayGlyph = '◯'; // Default empty
        let nodeClasses = ['matrix-node-3d'];
        
        if (isDMMode || isRevealed) {
            // DM mode or revealed: show actual glyph
            displayGlyph = nodeData.glyph || '◯';
            if (isEmpty) nodeClasses.push('empty');
        } else {
            // Player mode, not revealed: show blank
            nodeClasses.push('hidden-node');
        }
        
        return `
            <div class="${nodeClasses.join(' ')}" 
                 data-node="${nodeId}"
                 data-node-id="${nodeId}"
                 data-layer="${layerId}"
                 data-index="${index}"
                 data-revealed="${isRevealed}"
                 title="${isDMMode ? purpose : (isRevealed ? purpose : 'Unknown Node')}">
                <div class="node-glyph" style="transform: rotateY(${-this.rotationY}deg) rotateX(${-this.rotationX}deg)">
                    ${displayGlyph}
                </div>
                ${isDMMode ? `<div class="node-purpose">${purpose}</div>` : ''}
            </div>
        `;
    }
    
    setupControls() {
        // Set up global controls only once
        if (this.controlsSetup) return;
        this.controlsSetup = true;
        
        // Use the entire container for event delegation
        const viewport = this.container.querySelector('.cube-viewport');
        const cubeContainer = this.container.querySelector('.cube-container');
        
        // Use pointer events for unified mouse/touch handling
        // Listen on viewport to catch all events
        viewport.addEventListener('pointerdown', (e) => {
            // Check multiple ways to find the node
            let node = e.target.closest('.matrix-node-3d');
            
            // If clicking on layer-grid (empty space between nodes), check what's actually under cursor
            if (!node && (e.target.classList.contains('layer-grid') || e.target.classList.contains('cube-face'))) {
                // Use elementFromPoint to find all elements at this position
                const elements = document.elementsFromPoint(e.clientX, e.clientY);
                console.log('Elements at point:', elements.map(el => el.className).join(' > '));
                
                // Find the first node in the stack
                for (const el of elements) {
                    if (el.classList && el.classList.contains('matrix-node-3d')) {
                        node = el;
                        console.log('Found node via elementsFromPoint:', node.dataset.nodeId);
                        break;
                    }
                }
            }
            
            // If target is inside a node (like the glyph span), go up to find the node
            if (!node && e.target.classList) {
                if (e.target.classList.contains('node-glyph') || 
                    e.target.classList.contains('node-purpose')) {
                    node = e.target.parentElement;
                    if (node && !node.classList.contains('matrix-node-3d')) {
                        node = node.closest('.matrix-node-3d');
                    }
                }
            }
            
            console.log('Pointer down - target:', e.target.className, 'node found:', node?.dataset?.nodeId);
            
            if (node && node.dataset.nodeId) {
                // Clicking on a node - prioritize click over drag
                this.interactionState = 'potential-click';
                this.clickTarget = node;
                // Store initial position for movement detection
                this.dragStartX = e.clientX;
                this.dragStartY = e.clientY;
                e.stopPropagation();
                e.preventDefault(); // Prevent any default behavior
                console.log('→ Node click detected:', node.dataset.nodeId);
            } else if (e.target.closest('.cube-container')) {
                // Clicking on cube area (not controls) - prepare for potential drag
                this.interactionState = 'potential-drag';
                this.dragStartX = e.clientX;
                this.dragStartY = e.clientY;
                this.dragStartTime = Date.now();
                this.lastMouseX = e.clientX;
                this.lastMouseY = e.clientY;
                cubeContainer.style.cursor = 'grabbing';
                console.log('→ Background drag initiated');
            }
        });
        
        document.addEventListener('pointermove', (e) => {
            if (this.interactionState === 'potential-drag') {
                const deltaX = Math.abs(e.clientX - this.dragStartX);
                const deltaY = Math.abs(e.clientY - this.dragStartY);
                const deltaTime = Date.now() - this.dragStartTime;
                
                // Check if movement exceeds threshold
                if (deltaX > this.DRAG_THRESHOLD || deltaY > this.DRAG_THRESHOLD) {
                    if (deltaTime > this.DRAG_TIME_THRESHOLD) {
                        this.interactionState = 'dragging';
                        console.log('State changed to DRAGGING');
                    }
                }
            }
            
            if (this.interactionState === 'dragging') {
                this.handleDrag(e);
            }
            
            // If we're in potential-click and mouse moves too much, cancel the click
            if (this.interactionState === 'potential-click') {
                const deltaX = Math.abs(e.clientX - this.dragStartX);
                const deltaY = Math.abs(e.clientY - this.dragStartY);
                if (deltaX > 5 || deltaY > 5) {
                    console.log('Click cancelled - too much movement');
                    this.interactionState = 'idle';
                    this.clickTarget = null;
                }
            }
        });
        
        document.addEventListener('pointerup', (e) => {
            console.log('Pointer up - state:', this.interactionState, 'clickTarget:', this.clickTarget?.dataset?.nodeId);
            
            if (this.interactionState === 'potential-click' && this.clickTarget) {
                // This was a clean click on a node - trigger it
                const nodeId = this.clickTarget.dataset.nodeId;
                console.log('✓ Clean click on node:', nodeId);
                if (nodeId && this.onNodeClick) {
                    this.onNodeClick({ nodeId });
                }
            } else if (this.interactionState === 'potential-drag') {
                // User clicked background but didn't drag - just ignore it
                console.log('Background click without drag - ignored');
            } else if (this.interactionState === 'dragging') {
                console.log('Drag ended');
            }
            
            // Reset state
            this.interactionState = 'idle';
            this.clickTarget = null;
            const container = this.container.querySelector('.cube-container');
            if (container) {
                container.style.cursor = 'grab';
            }
        });
        
        // Touch events fallback for older browsers
        cubeContainer.addEventListener('touchstart', (e) => {
            if (e.target.closest('.matrix-node-3d')) {
                return; // Let pointer events handle it
            }
            this.startTouch(e);
        });
        document.addEventListener('touchmove', (e) => this.touchMove(e));
        document.addEventListener('touchend', () => {
            this.interactionState = 'idle';
            cubeContainer.style.cursor = 'grab';
        });
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // Prevent default touch behavior that might interfere
        cubeContainer.style.touchAction = 'none';
        cubeContainer.style.userSelect = 'none';
        cubeContainer.style.webkitUserSelect = 'none';
        
        // Re-attach button controls after each render (buttons get recreated)
        this.container.querySelectorAll('.cube-btn').forEach(btn => {
            // Remove old listener if exists, then add new one
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            newBtn.addEventListener('click', () => this.handleAction(newBtn.dataset.action));
        });
        
        // Layer selector buttons
        this.container.querySelectorAll('.layer-btn').forEach(btn => {
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            newBtn.addEventListener('click', () => this.showLayer(newBtn.dataset.layer));
        });
        
        console.log('Controls setup complete');
    }
    
    handleAction(action) {
        switch(action) {
            case 'rotate-left': this.rotate(0, -15); break;
            case 'rotate-right': this.rotate(0, 15); break;
            case 'rotate-up': this.rotate(-15, 0); break;
            case 'rotate-down': this.rotate(15, 0); break;
            case 'reset': this.resetView(); break;
        }
    }
    
    rotate(deltaX, deltaY) {
        this.rotationX += deltaX;
        this.rotationY += deltaY;
        this.updateCubeTransform();
    }
    
    updateCubeTransform() {
        const cube = this.container.querySelector('.cube');
        if (cube) {
            cube.style.transform = `rotateX(${this.rotationX}deg) rotateY(${this.rotationY}deg)`;
            
            // Keep glyphs facing forward
            this.container.querySelectorAll('.node-glyph').forEach(glyph => {
                glyph.style.transform = `rotateY(${-this.rotationY}deg) rotateX(${-this.rotationX}deg)`;
            });
        }
    }
    
    resetView() {
        this.rotationX = -20;
        this.rotationY = 30;
        this.updateCubeTransform();
    }
    
    showLayer(layer) {
        this.currentLayer = layer;
        
        // Update buttons
        this.container.querySelectorAll('.layer-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.layer === layer);
        });
        
        // Update layer visibility
        this.container.querySelectorAll('.matrix-layer').forEach(layerEl => {
            const layerId = layerEl.dataset.layer;
            const opacity = layer === 'all' ? 1 : (layerId === layer ? 1 : 0.15);
            const pointerEvents = layer === 'all' || layerId === layer ? 'auto' : 'none';
            
            layerEl.style.opacity = opacity;
            layerEl.style.pointerEvents = pointerEvents;
        });
    }
    
    handleDrag(e) {
        const deltaX = e.clientX - this.lastMouseX;
        const deltaY = e.clientY - this.lastMouseY;
        
        this.rotationY += deltaX * 0.5;
        this.rotationX -= deltaY * 0.5;
        
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
        
        this.updateCubeTransform();
    }
    
    // Legacy drag methods kept for touch support
    startDrag(e) {
        this.interactionState = 'dragging';
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
        this.container.querySelector('.cube-container').style.cursor = 'grabbing';
    }
    
    drag(e) {
        if (this.interactionState !== 'dragging') return;
        this.handleDrag(e);
    }
    
    endDrag() {
        this.interactionState = 'idle';
        const container = this.container.querySelector('.cube-container');
        if (container) {
            container.style.cursor = 'grab';
        }
    }
    
    startTouch(e) {
        if (e.touches.length === 1) {
            this.isDragging = true;
            this.hasDragged = false; // Reset drag tracking for touch
            this.lastMouseX = e.touches[0].clientX;
            this.lastMouseY = e.touches[0].clientY;
        }
    }
    
    touchMove(e) {
        if (!this.isDragging || e.touches.length !== 1) return;
        
        const deltaX = e.touches[0].clientX - this.lastMouseX;
        const deltaY = e.touches[0].clientY - this.lastMouseY;
        
        // If there's any movement, mark as dragged
        if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
            this.hasDragged = true;
        }
        
        this.rotationY += deltaX * 0.5;
        this.rotationX -= deltaY * 0.5;
        
        this.lastMouseX = e.touches[0].clientX;
        this.lastMouseY = e.touches[0].clientY;
        
        this.updateCubeTransform();
    }
    
    handleKeyboard(e) {
        switch(e.key) {
            case 'ArrowLeft': this.rotate(0, -15); break;
            case 'ArrowRight': this.rotate(0, 15); break;
            case 'ArrowUp': this.rotate(-15, 0); break;
            case 'ArrowDown': this.rotate(15, 0); break;
            case 'r': case 'R': this.resetView(); break;
            case '0': this.showLayer('all'); break;
            case '1': this.showLayer('mvm'); break;
            case '2': this.showLayer('cl'); break;
            case '3': this.showLayer('sl'); break;
        }
    }
    
    setNodeData(layer, index, glyph, revealed = true) {
        this.nodeData[layer][index] = { glyph, revealed };
        this.render();
        this.setupControls();
    }
    
    // Load spell data into the matrix
    loadSpell(spell) {
        if (!spell || !spell.matrix) return;
        
        // Load each layer from spell data
        ['mvm', 'cl', 'sl'].forEach(layerId => {
            if (spell.matrix[layerId]) {
                spell.matrix[layerId].forEach((glyph, index) => {
                    this.nodeData[layerId][index] = { 
                        glyph: glyph || '', 
                        purpose: this.nodePurposes[layerId][index],
                        revealed: true 
                    };
                });
            }
        });
        
        this.render();
        this.setupControls();
    }
    
    // Highlight a flow path
    highlightPath(flow = []) {
        // Remove existing highlights
        this.container.querySelectorAll('.matrix-node-3d').forEach(node => {
            node.classList.remove('highlighted', 'flow-active');
        });
        
        // Add highlights to nodes in the flow
        flow.forEach((nodeId, index) => {
            const node = this.container.querySelector(`[data-node-id="${nodeId}"]`);
            if (node) {
                node.classList.add('highlighted');
                if (index === flow.length - 1) {
                    node.classList.add('flow-active');
                }
            }
        });
    }
    
    // Set view mode (player or dm)
    setViewMode(mode) {
        this.viewMode = mode;
        this.render();
        this.setupControls();
    }
    
    // Reveal a node for player view
    revealNode(nodeId) {
        this.revealedNodes.add(nodeId);
        this.render();
        this.setupControls();
    }
    
    // Reveal all nodes
    revealAllNodes() {
        ['mvm', 'cl', 'sl'].forEach(layerId => {
            for (let i = 0; i < 9; i++) {
                this.revealedNodes.add(`${layerId}-${i}`);
            }
        });
        this.render();
        this.setupControls();
    }
    
    setPlayerMode(isPlayerMode) {
        this.viewMode = isPlayerMode ? 'player' : 'dm';
        this.render();
        this.setupControls();
    }
    
    setDMMode(isDMMode) {
        this.viewMode = isDMMode ? 'dm' : 'player';
        this.render();
        this.setupControls();
    }
}
