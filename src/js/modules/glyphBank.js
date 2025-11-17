import { sanitizeHTML } from '../utils/security.js';

const STORAGE_KEY = 'advm_glyph_notes';

export class GlyphBank {
    constructor({ listEl, searchEl, notesField, saveBtn, managerModal, managerContent, manageButton }, glyphs = []) {
        this.listEl = listEl;
        this.searchEl = searchEl;
        this.notesField = notesField;
        this.saveBtn = saveBtn;
        this.managerModal = managerModal;
        this.managerContent = managerContent;
        this.manageButton = manageButton;
        this.glyphs = glyphs;
        this.notes = this.loadNotes();
        this.activeGlyphId = null;
        this.revealedGlyphs = new Set();
        this.filterFn = null;
        
        // Filter state
        this.filters = {
            category: 'all',
            layer: 'all'
        };
        
        // Cache filter elements
        this.filterCategory = document.getElementById('filterCategory');
        this.filterLayer = document.getElementById('filterLayer');
        this.clearFiltersBtn = document.getElementById('clearFilters');
        this.glyphCount = document.getElementById('glyphCount');
        
        this.bindEvents();
        this.renderList();
    }

    bindEvents() {
        if (this.searchEl) {
            this.searchEl.addEventListener('input', () => this.renderList());
        }
        
        // Filter events
        if (this.filterCategory) {
            this.filterCategory.addEventListener('change', (e) => {
                this.filters.category = e.target.value;
                this.renderList();
            });
        }
        
        if (this.filterLayer) {
            this.filterLayer.addEventListener('change', (e) => {
                this.filters.layer = e.target.value;
                this.renderList();
            });
        }
        
        if (this.clearFiltersBtn) {
            this.clearFiltersBtn.addEventListener('click', () => {
                this.filters.category = 'all';
                this.filters.layer = 'all';
                if (this.filterCategory) this.filterCategory.value = 'all';
                if (this.filterLayer) this.filterLayer.value = 'all';
                if (this.searchEl) this.searchEl.value = '';
                this.renderList();
            });
        }

        if (this.manageButton && typeof this.managerModal?.showModal === 'function') {
            this.manageButton.addEventListener('click', () => {
                this.renderManager();
                this.managerModal.showModal();
            });
        }

        if (this.managerModal) {
            this.managerModal.addEventListener('click', (event) => {
                if (event.target.dataset.close === 'glyph-manager') {
                    this.managerModal.close();
                }
            });
        }
    }

    renderList() {
        if (!this.listEl) return;
        const query = (this.searchEl?.value || '').toLowerCase();

        this.listEl.innerHTML = '';
        
        // Check if filters are in default state (no filters applied)
        const hasFilters = query || this.filters.category !== 'all' || this.filters.layer !== 'all';
        
        // If no filters are applied, show empty state
        if (!hasFilters) {
            if (this.glyphCount) {
                this.glyphCount.textContent = `${this.glyphs.length} glyphs available`;
            }
            this.listEl.innerHTML = '<p class="empty-state">Select a category or layer to browse glyphs, or use the search box.</p>';
            return;
        }
        
        let filteredGlyphs = this.glyphs.filter(glyph => {
            // Search filter
            const haystack = `${glyph.symbol} ${glyph.name} ${glyph.layer} ${glyph.meaning}`.toLowerCase();
            if (!haystack.includes(query)) return false;
            
            // Category filter
            if (this.filters.category !== 'all') {
                const tags = glyph.tags || [];
                if (!tags.includes(this.filters.category)) return false;
            }
            
            // Layer filter
            if (this.filters.layer !== 'all') {
                if (glyph.layer !== this.filters.layer) return false;
            }
            
            return true;
        });

        // Apply custom filter (for player mode visibility)
        if (this.filterFn) {
            filteredGlyphs = filteredGlyphs.filter(this.filterFn);
        }
        
        // Update count
        if (this.glyphCount) {
            const total = this.glyphs.length;
            const showing = filteredGlyphs.length;
            this.glyphCount.textContent = showing === total 
                ? `${total} glyphs` 
                : `Showing ${showing} of ${total} glyphs`;
        }

        if (filteredGlyphs.length === 0) {
            this.listEl.innerHTML = '<p class="empty-state">No glyphs match your filters.</p>';
            return;
        }

        filteredGlyphs.forEach(glyph => {
                const card = document.createElement('article');
                card.className = 'glyph-card';
                
                // Sanitize user-facing data
                const name = sanitizeHTML(glyph.name);
                const layer = sanitizeHTML(glyph.layer);
                const position = sanitizeHTML(glyph.position);
                const symbol = sanitizeHTML(glyph.symbol);
                const id = sanitizeHTML(glyph.id);
                
                card.innerHTML = `
                    <div>
                        <div class="symbol">${symbol}</div>
                        <div class="meta">
                            <strong>${name}</strong>
                            <p>${layer} · ${position}</p>
                        </div>
                    </div>
                    <button class="btn ghost" data-glyph="${id}">Inspect</button>
                `;
                card.querySelector('button').addEventListener('click', () => this.openGlyph(glyph.id));
                this.listEl.appendChild(card);
            });
    }

    openGlyph(glyphId) {
        this.activeGlyphId = glyphId;
        if (!this.managerModal) return;
        
        const glyph = this.glyphs.find(g => g.id === glyphId);
        if (!glyph) return;
        
        // Populate inspector with glyph data
        const symbolEl = document.getElementById('inspectorSymbol');
        const nameEl = document.getElementById('inspectorName');
        const layerEl = document.getElementById('inspectorLayer');
        const positionEl = document.getElementById('inspectorPosition');
        const meaningEl = document.getElementById('inspectorMeaning');
        const notesEl = document.getElementById('inspectorNotes');
        
        if (symbolEl) symbolEl.textContent = glyph.symbol;
        if (nameEl) nameEl.textContent = glyph.name;
        if (layerEl) layerEl.textContent = glyph.layer;
        if (positionEl) positionEl.textContent = glyph.position;
        if (meaningEl) meaningEl.textContent = glyph.meaning;
        if (notesEl) notesEl.value = this.notes[glyphId] || '';
        
        // Set up save button
        const saveBtn = document.getElementById('saveInspectorNotes');
        const exportBtn = document.getElementById('exportGlyphNote');
        
        if (saveBtn) {
            // Remove old listeners
            const newSaveBtn = saveBtn.cloneNode(true);
            saveBtn.replaceWith(newSaveBtn);
            
            newSaveBtn.addEventListener('click', () => {
                const sanitized = this.sanitize(notesEl.value);
                notesEl.value = sanitized;
                this.notes[glyphId] = sanitized;
                this.persistNotes();
                
                // Show feedback
                newSaveBtn.textContent = 'Saved!';
                setTimeout(() => {
                    newSaveBtn.textContent = 'Save Notes';
                }, 1500);
            });
        }
        
        if (exportBtn) {
            // Remove old listeners
            const newExportBtn = exportBtn.cloneNode(true);
            exportBtn.replaceWith(newExportBtn);
            
            newExportBtn.addEventListener('click', () => {
                const markdown = this.exportSingleGlyph(glyph);
                const blob = new Blob([markdown], { type: 'text/markdown' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `glyph-${glyph.name.replace(/\s+/g, '-').toLowerCase()}.md`;
                a.click();
                URL.revokeObjectURL(url);
            });
        }
        
        this.managerModal.showModal();
    }
    
    exportSingleGlyph(glyph) {
        const note = this.notes[glyph.id] || 'No notes recorded.';
        return `# ${glyph.symbol} ${glyph.name}\n\n**Layer:** ${glyph.layer}\n**Position:** ${glyph.position}\n**Meaning:** ${glyph.meaning}\n\n## Notes\n\n${note}\n`;
    }

    renderManager() {
        // This method is no longer used with the new inspector
        // Kept for backward compatibility
        if (!this.managerContent) return;
        this.managerContent.innerHTML = '<p>Use the Inspect button on individual glyphs to view details.</p>';
    }

    setFilter(filterFn) {
        this.filterFn = filterFn;
        this.renderList();
    }

    clearFilter() {
        this.filterFn = null;
        this.renderList();
    }

    revealGlyph(glyphId) {
        this.revealedGlyphs.add(glyphId);
        this.renderList();
    }

    revealAllGlyphs() {
        this.glyphs.forEach(glyph => this.revealedGlyphs.add(glyph.id));
        this.renderList();
    }

    clearRevealed() {
        this.revealedGlyphs.clear();
        this.renderList();
    }

    sanitize(text) {
        // Remove emoji and enforce professional tone.
        return text.replace(/[\p{Extended_Pictographic}\p{Emoji_Component}]/gu, '').trim();
    }

    loadNotes() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
        } catch (error) {
            console.warn('Unable to load glyph notes', error);
            return {};
        }
    }

    persistNotes() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.notes));
    }

    exportNotes() {
        const entries = Object.entries(this.notes)
            .filter(([key]) => key !== 'general' && this.notes[key])
            .map(([id, text]) => `### ${id}\n${text}`)
            .join('\n\n');
        return entries || 'No glyph-specific notes recorded.';
    }
}
