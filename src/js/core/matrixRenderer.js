const NODE_TEMPLATES = {
    mvm: {
        title: 'Mechanical Vector Matrix',
        nodes: [
            { id: 'mvm-0', label: 'Discipline', path: ['mvm', 'source', 'discipline'], tooltip: 'School of Method anchor' },
            { id: 'mvm-1', label: 'Potency', path: ['mvm', 'source', 'potency'], tooltip: 'Spell level declaration' },
            { id: 'mvm-2', label: 'Interval', path: ['mvm', 'source', 'interval'], tooltip: 'Casting time' },
            { id: 'mvm-3', label: 'Action', path: ['mvm', 'transformation', 'action'], tooltip: 'Spell intent' },
            { id: 'mvm-4', label: 'Influence', path: ['mvm', 'transformation', 'influence'], tooltip: 'Energy typing' },
            { id: 'mvm-5', label: 'Force', path: ['mvm', 'transformation', 'force'], tooltip: 'Intensity modifiers' },
            { id: 'mvm-6', label: 'Shape', path: ['mvm', 'projection', 'shape'], tooltip: 'Area template' },
            { id: 'mvm-7', label: 'Range', path: ['mvm', 'projection', 'range'], tooltip: 'Range or size' },
            { id: 'mvm-8', label: 'Duration', path: ['mvm', 'projection', 'duration'], tooltip: 'Duration / concentration' }
        ]
    },
    cl: {
        title: 'Component Layer',
        nodes: [
            { id: 'cl-0', label: 'Utterance', path: ['cl', 'row1', 'utterance'], tooltip: 'Verbal component' },
            { id: 'cl-1', label: 'Gesture', path: ['cl', 'row1', 'gesture'], tooltip: 'Somatic component' },
            { id: 'cl-2', label: 'Material', path: ['cl', 'row1', 'material'], tooltip: 'Material component' },
            { id: 'cl-3', label: 'Catalyst', path: ['cl', 'row2', 'catalyst'], tooltip: 'Consumed materials' },
            { id: 'cl-4', label: 'Substitution', path: ['cl', 'row2', 'substitution'], tooltip: 'Focus substitution' },
            { id: 'cl-5', label: 'Stability', path: ['cl', 'row2', 'stability'], tooltip: 'Environmental notes' },
            { id: 'cl-6', label: 'Will', path: ['cl', 'row3', 'will'], tooltip: 'Concentration requirement' },
            { id: 'cl-7', label: 'Resistance', path: ['cl', 'row3', 'resistance'], tooltip: 'Saving throw ability' },
            { id: 'cl-8', label: 'Alignment', path: ['cl', 'row3', 'alignment'], tooltip: 'Attack roll vs save DC' }
        ]
    },
    sl: {
        title: 'Specialist Layer',
        nodes: [
            { id: 'sl-0', label: 'Guaranteed', path: ['sl', 'guaranteed'], tooltip: 'Automatic condition' },
            { id: 'sl-1', label: 'Conditional', path: ['sl', 'conditional'], tooltip: 'Condition on save' },
            { id: 'sl-2', label: 'Complex', path: ['sl', 'complex'], tooltip: 'Multi-stage effect' },
            { id: 'sl-3', label: 'Branching', path: ['sl', 'branching'], tooltip: 'Divergent outcomes' },
            { id: 'sl-4', label: 'Recursive', path: ['sl', 'recursive'], tooltip: 'Repeating effect' },
            { id: 'sl-5', label: 'Planar', path: ['sl', 'planar'], tooltip: 'Planar or reality impact' },
            { id: 'sl-6', label: 'Contradiction', path: ['sl', 'contradiction'], tooltip: 'Counterspell immunity' },
            { id: 'sl-7', label: 'Paradox', path: ['sl', 'paradox'], tooltip: 'Identity alteration' },
            { id: 'sl-8', label: 'Reserved', path: ['sl', 'reserved'], tooltip: 'Custom DM note' }
        ]
    }
};

export class MatrixRenderer {
    constructor(stageElement, { onNodeSelect } = {}) {
        this.stageElement = stageElement;
        this.onNodeSelect = onNodeSelect;
        this.activeLayer = 'mvm';
        this.currentSpell = null;
        this.renderBase();
    }

    renderBase() {
        const markup = Object.entries(NODE_TEMPLATES)
            .map(([layerKey, layer]) => {
                const nodes = layer.nodes
                    .map(node => `
                        <button class="matrix-node" data-layer="${layerKey}" data-node-id="${node.id}" title="${node.tooltip}">
                            <span class="node-label">${node.label}</span>
                            <span class="node-value" data-value-target="${node.id}">—</span>
                        </button>
                    `)
                    .join('');
                return `
                    <div class="matrix-grid" data-layer="${layerKey}" aria-live="polite">
                        <h3>${layer.title}</h3>
                        <div class="grid-body">${nodes}</div>
                    </div>
                `;
            })
            .join('');

        this.stageElement.innerHTML = markup;
        this.stageElement.addEventListener('click', (event) => {
            const nodeButton = event.target.closest('.matrix-node');
            if (!nodeButton) return;
            if (this.onNodeSelect) {
                const nodeId = nodeButton.dataset.nodeId;
                const layer = nodeButton.dataset.layer;
                const template = this.findTemplate(nodeId);
                const value = nodeButton.querySelector('.node-value')?.textContent?.trim();
                this.onNodeSelect({ nodeId, layer, template, value });
            }
        });

        this.updateLayerVisibility();
    }

    findTemplate(nodeId) {
        return Object.values(NODE_TEMPLATES)
            .flatMap(layer => layer.nodes)
            .find(node => node.id === nodeId);
    }

    updateSpell(spell) {
        this.currentSpell = spell;
        Object.values(NODE_TEMPLATES).forEach(layer => {
            layer.nodes.forEach(node => {
                const value = this.resolvePath(spell, node.path) ?? '—';
                const el = this.stageElement.querySelector(`[data-value-target="${node.id}"]`);
                if (el) {
                    el.textContent = value;
                }
            });
        });
    }

    resolvePath(obj, path = []) {
        return path.reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : null), obj);
    }

    setActiveLayer(layer) {
        this.activeLayer = layer;
        this.updateLayerVisibility();
    }

    updateLayerVisibility() {
        this.stageElement.querySelectorAll('.matrix-grid').forEach(grid => {
            const isActive = grid.dataset.layer === this.activeLayer;
            grid.classList.toggle('active', isActive);
            grid.classList.toggle('muted', !isActive);
        });
    }

    highlightPath(nodeIds = []) {
        this.stageElement.querySelectorAll('.matrix-node').forEach(node => {
            node.classList.remove('active');
        });
        nodeIds.forEach(id => {
            const node = this.stageElement.querySelector(`[data-node-id="${id}"]`);
            if (node) {
                node.classList.add('active');
            }
        });
    }

    setPlayerMode(isPlayerMode, revealCheckFn = null) {
        this.playerMode = isPlayerMode;
        this.revealCheckFn = revealCheckFn;
        
        this.stageElement.querySelectorAll('.matrix-node').forEach(node => {
            const nodeId = node.dataset.nodeId;
            
            if (isPlayerMode) {
                // In player mode, hide non-revealed nodes
                const isRevealed = revealCheckFn ? revealCheckFn(nodeId) : false;
                if (isRevealed) {
                    node.classList.remove('hidden-node');
                } else {
                    node.classList.add('hidden-node');
                }
            } else {
                // In DM mode, show everything
                node.classList.remove('hidden-node');
            }
        });
    }

    getNodeMap() {
        return NODE_TEMPLATES;
    }
}
