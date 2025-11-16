/**
 * NodeGlyphSelector - Modal for selecting glyphs to assign to matrix nodes
 */

export class NodeGlyphSelector {
    constructor(glyphs = []) {
        this.glyphs = glyphs;
        this.currentNode = null;
        this.onGlyphSelected = null;
        
        // Cache elements
        this.modal = document.getElementById('nodeGlyphSelector');
        this.selectedNodeInfo = document.getElementById('selectedNodeInfo');
        this.selectorSearch = document.getElementById('selectorSearch');
        this.selectorCategory = document.getElementById('selectorCategory');
        this.selectorGlyphList = document.getElementById('selectorGlyphList');
        this.closeBtn = document.getElementById('closeNodeSelector');
        this.clearBtn = document.getElementById('clearNodeGlyph');
        this.cancelBtn = document.getElementById('cancelNodeSelector');
        
        this.bindEvents();
    }
    
    bindEvents() {
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.close());
        }
        
        if (this.cancelBtn) {
            this.cancelBtn.addEventListener('click', () => this.close());
        }
        
        if (this.clearBtn) {
            this.clearBtn.addEventListener('click', () => {
                if (this.onGlyphSelected && this.currentNode) {
                    this.onGlyphSelected(this.currentNode, null); // Clear the glyph
                }
                this.close();
            });
        }
        
        if (this.selectorSearch) {
            this.selectorSearch.addEventListener('input', () => this.renderGlyphs());
        }
        
        if (this.selectorCategory) {
            this.selectorCategory.addEventListener('change', () => this.renderGlyphs());
        }
        
        // Close on backdrop click
        if (this.modal) {
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) {
                    this.close();
                }
            });
        }
    }
    
    open(nodeId, layer, index, onGlyphSelected) {
        this.currentNode = { nodeId, layer, index };
        this.onGlyphSelected = onGlyphSelected;
        
        // Update header info
        if (this.selectedNodeInfo) {
            const layerNames = {
                'mvm': 'MVM',
                'cl': 'CL',
                'sl': 'SL'
            };
            this.selectedNodeInfo.textContent = `Node: ${layerNames[layer] || layer.toUpperCase()} - Position ${index + 1}`;
        }
        
        // Reset filters
        if (this.selectorSearch) this.selectorSearch.value = '';
        if (this.selectorCategory) this.selectorCategory.value = 'all';
        
        // Render glyphs filtered by layer
        this.renderGlyphs();
        
        // Show modal
        if (this.modal && typeof this.modal.showModal === 'function') {
            this.modal.showModal();
        }
    }
    
    close() {
        if (this.modal && typeof this.modal.close === 'function') {
            this.modal.close();
        }
    }
    
    renderGlyphs() {
        if (!this.selectorGlyphList) return;
        
        const query = (this.selectorSearch?.value || '').toLowerCase();
        const category = this.selectorCategory?.value || 'all';
        const currentLayer = this.currentNode?.layer || '';
        
        // Filter glyphs
        let filteredGlyphs = this.glyphs.filter(glyph => {
            // Filter by current layer
            if (currentLayer && glyph.layer !== currentLayer.toUpperCase()) {
                return false;
            }
            
            // Search filter
            if (query) {
                const haystack = `${glyph.symbol} ${glyph.name} ${glyph.meaning}`.toLowerCase();
                if (!haystack.includes(query)) return false;
            }
            
            // Category filter
            if (category !== 'all') {
                const tags = glyph.tags || [];
                if (!tags.includes(category)) return false;
            }
            
            return true;
        });
        
        // Render
        if (filteredGlyphs.length === 0) {
            this.selectorGlyphList.innerHTML = '<p class="empty-state">No glyphs match your filters.</p>';
            return;
        }
        
        this.selectorGlyphList.innerHTML = filteredGlyphs.map(glyph => `
            <div class="selector-glyph-item" data-glyph-id="${glyph.id}">
                <div class="selector-glyph-symbol">${glyph.symbol}</div>
                <div class="selector-glyph-info">
                    <h4>${glyph.name}</h4>
                    <p>${glyph.meaning}</p>
                </div>
            </div>
        `).join('');
        
        // Add click handlers
        this.selectorGlyphList.querySelectorAll('.selector-glyph-item').forEach(item => {
            item.addEventListener('click', () => {
                const glyphId = item.dataset.glyphId;
                const glyph = this.glyphs.find(g => g.id === glyphId);
                if (glyph && this.onGlyphSelected && this.currentNode) {
                    this.onGlyphSelected(this.currentNode, glyph);
                }
                this.close();
            });
        });
    }
}
