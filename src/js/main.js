import { MatrixRenderer } from './core/matrixRenderer.js';
import { Matrix3D } from './core/matrix3D.js';
import { FlowPathTracer } from './core/flowPathTracer.js';
import { RulesEngine } from './core/rulesEngine.js';
import { GlyphBank } from './modules/glyphBank.js';
import { PuzzleSystem } from './modules/puzzleSystem.js';
import { NoteManager } from './modules/noteManager.js';
import { ViewManager } from './modules/viewManager.js';
import { RevealManager } from './modules/revealManager.js';
import { NodeGlyphSelector } from './modules/nodeGlyphSelector.js';
import { loadSpells, findSpell } from './data/spellLibrary.js';
import { loadGlyphs } from './data/glyphs.js';
import { loadPuzzles } from './data/puzzles.js';
import { SCHOOL_PROFILES, listDisciplines } from './data/schools.js';

const state = {
    spells: [],
    glyphs: [],
    puzzles: {},
    currentSpell: null,
    mode: 'construct',
    discipline: null,
    level: null
};

const elements = {};
let matrixRenderer;
let matrix3D;
let flowTracer;
let rulesEngine;
let glyphBank;
let nodeGlyphSelector;
let puzzleSystem;
let noteManager;
let viewManager;
let revealManager;
let referenceLoaded = false;

document.addEventListener('DOMContentLoaded', initialize);

async function initialize() {
    cacheElements();
    try {
        const [spells, glyphs, puzzles] = await Promise.all([
            loadSpells(),
            loadGlyphs(),
            loadPuzzles()
        ]);
        state.spells = spells;
        state.glyphs = glyphs;
        state.puzzles = puzzles;
        setupUI();
    } catch (error) {
        console.error(error);
        alert('Unable to initialize ADVM console. See console for details.');
    }
}

function cacheElements() {
    // Navigation
    elements.consoleTab = document.getElementById('consoleTab');
    elements.treatiseTab = document.getElementById('treatiseTab');
    elements.consoleView = document.getElementById('consoleView');
    elements.treatiseView = document.getElementById('treatiseView');
    elements.treatiseContent = document.getElementById('treatiseContent');
    elements.treatiseTOC = document.getElementById('treatiseTOC');
    
    // View controls
    elements.toggleViewBtn = document.getElementById('toggleViewBtn');
    elements.disciplineSelect = document.getElementById('disciplineSelect');
    elements.levelSelect = document.getElementById('levelSelect');
    elements.modeSelect = document.getElementById('modeSelect');
    elements.layerTabs = document.querySelectorAll('.layer-tab');
    elements.matrixStage = document.getElementById('matrixStage');
    elements.flowDisplay = document.getElementById('flowPathDisplay');
    elements.diagnosticsPanel = document.getElementById('diagnosticsPanel');
    elements.undoBtn = document.getElementById('undoStepBtn');
    elements.resetBtn = document.getElementById('resetFlowBtn');
    elements.commitBtn = document.getElementById('commitFlowBtn');
    elements.loadSpellBtn = document.getElementById('loadSpellBtn');
    elements.newPuzzleBtn = document.getElementById('newPuzzleBtn');
    elements.puzzleDifficulty = document.getElementById('puzzleDifficulty');
    elements.exportBtn = document.getElementById('exportNotesBtn');
    elements.referenceBtn = document.getElementById('openReferenceBtn');
    elements.referenceModal = document.getElementById('referenceModal');
    elements.referenceContent = document.getElementById('referenceContent');
    elements.closeReferenceBtn = document.getElementById('closeReferenceBtn');
    elements.glyphNotes = document.getElementById('glyphNotes');
    elements.saveNotesBtn = document.getElementById('saveNotesBtn');
    elements.glyphList = document.getElementById('glyphList');
    elements.glyphSearch = document.getElementById('glyphSearch');
    elements.manageGlyphsBtn = document.getElementById('manageGlyphsBtn');
    elements.glyphManagerModal = document.getElementById('glyphManagerModal');
    elements.glyphManagerContent = document.getElementById('glyphManagerContent');
    elements.closeGlyphManager = document.getElementById('closeGlyphManager');
    elements.puzzleDescription = document.querySelector('.puzzle-description');
    elements.puzzleObjectives = document.querySelector('.puzzle-objectives');
    elements.puzzleHints = document.querySelector('.puzzle-hints');
    elements.sessionLog = document.getElementById('sessionLog');
}

function setupUI() {
    // Setup navigation
    setupNavigation();
    
    // Load treatise on startup since it's the default view
    loadTreatise();
    
    populateDisciplineSelect();
    populateLevelSelect();

    // Initialize 3D Matrix
    matrix3D = new Matrix3D(elements.matrixStage, {
        onNodeClick: handleNodeSelection
    });

    // Old 2D renderer disabled in favor of 3D matrix
    // matrixRenderer = new MatrixRenderer(elements.matrixStage, {
    //     onNodeSelect: handleNodeSelection
    // });

    flowTracer = new FlowPathTracer({
        onUpdate: updateFlowDisplay
    });

    rulesEngine = new RulesEngine();

    glyphBank = new GlyphBank({
        listEl: elements.glyphList,
        searchEl: elements.glyphSearch,
        notesField: elements.glyphNotes,
        saveBtn: elements.saveNotesBtn,
        managerModal: elements.glyphManagerModal,
        managerContent: elements.glyphManagerContent,
        manageButton: elements.manageGlyphsBtn
    }, state.glyphs);

    puzzleSystem = new PuzzleSystem({
        panelEl: document.getElementById('activePuzzle'),
        descriptionEl: elements.puzzleDescription,
        objectivesEl: elements.puzzleObjectives,
        hintsEl: elements.puzzleHints,
        logEl: elements.sessionLog
    });
    puzzleSystem.loadPuzzles(state.puzzles);

    noteManager = new NoteManager({
        notesField: document.getElementById('glyphNotes'),
        sessionList: elements.sessionLog
    });

    // Initialize ViewManager and RevealManager
    viewManager = new ViewManager();
    revealManager = new RevealManager(viewManager);
    
    // Initialize NodeGlyphSelector
    nodeGlyphSelector = new NodeGlyphSelector(state.glyphs);

    // Set up view toggle button
    updateViewButton();
    updateGlyphBankVisibility();
    elements.toggleViewBtn.addEventListener('click', handleViewToggle);

    // Listen for view changes
    viewManager.on('viewChanged', (view) => {
        updateViewButton();
        updateMatrixVisibility();
        updateGlyphBankVisibility();
        noteManager.appendSessionEntry(`Switched to ${view} mode`);
    });

    elements.saveNotesBtn.addEventListener('click', () => {
        const sanitized = noteManager.saveNotes(elements.glyphNotes.value);
        elements.glyphNotes.value = sanitized;
        noteManager.appendSessionEntry('Field notes saved');
    });

    elements.layerTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            elements.layerTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            // Layer switching integrated into 3D cube controls
            if (matrix3D) {
                matrix3D.showLayer(tab.dataset.layer);
            }
        });
    });

    elements.modeSelect.addEventListener('change', () => {
        state.mode = elements.modeSelect.value;
        flowTracer.setMode(state.mode);
        noteManager.appendSessionEntry(`Mode set to ${state.mode}`);
    });

    elements.disciplineSelect.addEventListener('change', () => {
        state.discipline = elements.disciplineSelect.value;
        applySchoolProfile();
    });

    elements.levelSelect.addEventListener('change', () => {
        const parsed = parseInt(elements.levelSelect.value, 10);
        state.level = Number.isNaN(parsed) ? null : parsed;
        flowTracer.setDepthRequirement(parsed || 1);
    });

    elements.undoBtn.addEventListener('click', () => flowTracer.undo());
    elements.resetBtn.addEventListener('click', () => flowTracer.reset());
    elements.commitBtn.addEventListener('click', commitFlow);
    elements.loadSpellBtn.addEventListener('click', loadSpell);
    elements.newPuzzleBtn.addEventListener('click', () => {
        const difficulty = elements.puzzleDifficulty.value;
        const puzzle = puzzleSystem.generate(difficulty);
        if (puzzle) {
            noteManager.appendSessionEntry(`Puzzle loaded: ${puzzle.title}`);
        }
    });

    elements.exportBtn.addEventListener('click', () => {
        noteManager.export(glyphBank.exportNotes());
    });

    if (elements.referenceBtn) {
        elements.referenceBtn.addEventListener('click', () => openReference());
    }
    if (elements.closeReferenceBtn) {
        elements.closeReferenceBtn.addEventListener('click', () => elements.referenceModal.close());
    }
    if (elements.referenceModal) {
        elements.referenceModal.addEventListener('click', (event) => {
            if (event.target === elements.referenceModal) {
                elements.referenceModal.close();
            }
        });
    }

    if (elements.closeGlyphManager) {
        elements.closeGlyphManager.addEventListener('click', () => elements.glyphManagerModal.close());
    }

    state.discipline = elements.disciplineSelect.value;
    applySchoolProfile();
}

function populateDisciplineSelect() {
    const disciplines = listDisciplines();
    elements.disciplineSelect.innerHTML = disciplines
        .map(name => `<option value="${name}">${name}</option>`)
        .join('');
    state.discipline = disciplines[0];
}

function populateLevelSelect() {
    const options = ['<option value="">Any Level</option>'];
    for (let i = 0; i <= 9; i += 1) {
        options.push(`<option value="${i}">${i === 0 ? 'Cantrip' : `Level ${i}`}</option>`);
    }
    elements.levelSelect.innerHTML = options.join('');
}

function applySchoolProfile() {
    const profile = SCHOOL_PROFILES[state.discipline];
    if (!profile) return;
    flowTracer.setPattern(profile.flow);
    elements.matrixStage.style.setProperty('--school-color', profile.color);
    noteManager.appendSessionEntry(`Discipline set to ${profile.title}`);
}

function loadSpell() {
    const level = state.level;
    const discipline = state.discipline;
    let spell = findSpell(state.spells, { discipline, level });
    if (!spell) {
        const fallbackPool = state.spells.filter(s => s.discipline === discipline);
        spell = fallbackPool[Math.floor(Math.random() * fallbackPool.length)];
    }
    if (!spell) {
        alert('No spells available for this selection.');
        return;
    }
    state.currentSpell = spell;
    // Update 3D matrix with spell data
    if (matrix3D) {
        matrix3D.loadSpell(spell);
    }
    flowTracer.setDepthRequirement(spell.level || 1);
    flowTracer.reset();
    noteManager.appendSessionEntry(`Loaded ${spell.name}`);
}

function handleNodeSelection({ nodeId }) {
    const currentView = viewManager.getCurrentView();
    
    // In DM mode, open glyph selector
    if (currentView === 'dm') {
        const [layer, index] = nodeId.split('-');
        nodeGlyphSelector.open(nodeId, layer, parseInt(index), handleGlyphAssignment);
        return;
    }
    
    // In player mode, continue with normal flow tracing
    if (state.mode === 'analyze') {
        noteManager.appendSessionEntry(`Inspected ${nodeId}`);
        return;
    }
    const result = flowTracer.addStep(nodeId);
    if (result.status === 'warn') {
        noteManager.appendSessionEntry(result.message);
    }
}

function handleGlyphAssignment(node, glyph) {
    if (!matrix3D) return;
    
    const { nodeId, layer, index } = node;
    
    if (glyph) {
        // Assign glyph to node
        matrix3D.setNodeData(layer, index, glyph.symbol, true);
        noteManager.appendSessionEntry(`Assigned ${glyph.name} to ${nodeId}`);
        
        // Reveal the node
        matrix3D.revealNode(nodeId);
        viewManager.revealNode(nodeId);
    } else {
        // Clear glyph from node
        matrix3D.setNodeData(layer, index, '', false);
        noteManager.appendSessionEntry(`Cleared ${nodeId}`);
    }
}

function updateFlowDisplay(flow = []) {
    // Highlight path in 3D matrix if available
    if (matrix3D && matrix3D.highlightPath) {
        matrix3D.highlightPath(flow);
    }
    if (!flow.length) {
        elements.flowDisplay.innerHTML = '<li>Awaiting selection…</li>';
        return;
    }
    elements.flowDisplay.innerHTML = flow
        .map((nodeId, index) => `<li>${index + 1}. ${nodeId}</li>`)
        .join('');
}

function commitFlow() {
    const result = rulesEngine.evaluate({
        spell: state.currentSpell,
        flow: flowTracer.flow,
        mode: state.mode,
        depthRequirement: flowTracer.depthRequirement
    });
    updateDiagnostics(result);
    noteManager.appendSessionEntry('Diagnostics run');
}

function updateDiagnostics(result) {
    Object.entries(result).forEach(([key, value]) => {
        const span = elements.diagnosticsPanel.querySelector(`[data-diagnostic="${key}"]`);
        if (span) {
            span.textContent = `${value.label}: ${value.detail}`;
            span.style.color = value.color;
        }
    });
}

async function openReference() {
    if (!referenceLoaded) {
        try {
            const response = await fetch('/docs/dm-reference.md');
            const markdown = await response.text();
            if (window.marked) {
                elements.referenceContent.innerHTML = marked.parse(markdown);
            } else {
                elements.referenceContent.textContent = markdown;
            }
            referenceLoaded = true;
        } catch (error) {
            elements.referenceContent.textContent = 'Unable to load reference document.';
        }
    }
    elements.referenceModal.showModal();
}

// View management functions
function handleViewToggle() {
    console.log('[Main] View toggle clicked');
    const currentView = viewManager.getCurrentView();
    console.log('[Main] Current view:', currentView);
    
    if (currentView === 'player') {
        // Switching to DM requires authentication
        console.log('[Main] Attempting to switch to DM mode...');
        viewManager.authenticateDM().then((success) => {
            console.log('[Main] Authentication result:', success);
            if (success) {
                viewManager.setView('dm');
                console.log('[Main] Switched to DM view');
            } else {
                console.log('[Main] Authentication failed, staying in player mode');
                noteManager.appendSessionEntry('DM authentication failed');
            }
        }).catch((error) => {
            console.error('[Main] Authentication error:', error);
            noteManager.appendSessionEntry('DM authentication cancelled');
        });
    } else {
        // Switching back to player mode doesn't require auth
        console.log('[Main] Switching back to player mode');
        viewManager.setView('player');
    }
}

function updateViewButton() {
    const currentView = viewManager.getCurrentView();
    const label = elements.toggleViewBtn.querySelector('.view-label');
    const icon = elements.toggleViewBtn.querySelector('.view-icon');
    
    if (currentView === 'dm') {
        label.textContent = 'Current Mode: DM';
        icon.textContent = '👁️';
        elements.toggleViewBtn.classList.add('dm-active');
        elements.toggleViewBtn.title = 'Click to switch to Player mode';
    } else {
        label.textContent = 'Current Mode: Player';
        icon.textContent = '🎭';
        elements.toggleViewBtn.classList.remove('dm-active');
        elements.toggleViewBtn.title = 'Click to switch to DM mode';
    }
}

function updateMatrixVisibility() {
    const currentView = viewManager.getCurrentView();
    
    if (currentView === 'player') {
        // In player mode, hide non-revealed nodes
        matrix3D.setViewMode('player');
        if (matrixRenderer && matrixRenderer.setPlayerMode) {
            matrixRenderer.setPlayerMode(true, (nodeId) => {
                return viewManager.isNodeRevealed(nodeId);
            });
        }
    } else {
        // In DM mode, show everything
        matrix3D.setViewMode('dm');
        if (matrixRenderer && matrixRenderer.setPlayerMode) {
            matrixRenderer.setPlayerMode(false);
        }
    }
}

function updateGlyphBankVisibility() {
    const currentView = viewManager.getCurrentView();
    
    if (currentView === 'player') {
        // In player mode, only show revealed glyphs
        glyphBank.setFilter((glyph) => {
            // Check if this glyph has been revealed
            return viewManager.isNodeRevealed(`glyph-${glyph.id}`);
        });
    } else {
        // In DM mode, show all glyphs
        glyphBank.clearFilter();
    }
}

// Navigation between Console and Treatise
function setupNavigation() {
    elements.consoleTab.addEventListener('click', () => switchToView('console'));
    elements.treatiseTab.addEventListener('click', () => switchToView('treatise'));
}

function switchToView(view) {
    console.log('[Main] Switching to view:', view);
    
    // Update tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.view === view);
    });
    
    // Show/hide views
    if (view === 'console') {
        elements.consoleView.style.display = 'flex';
        elements.treatiseView.style.display = 'none';
    } else {
        elements.consoleView.style.display = 'none';
        elements.treatiseView.style.display = 'block';
        loadTreatise();
    }
}

let treatiseLoaded = false;

async function loadTreatise() {
    // Always reload to get the latest changes
    try {
        console.log('[Main] Loading treatise...');
        const response = await fetch('/docs/A Treatise on Arcane Matrices.md?' + Date.now());
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const markdown = await response.text();
        const html = marked.parse(markdown);
        
        elements.treatiseContent.innerHTML = html;
        generateTOC(html);
        treatiseLoaded = true;
        
        console.log('[Main] Treatise loaded successfully');
    } catch (error) {
        console.error('[Main] Failed to load treatise:', error);
        elements.treatiseContent.innerHTML = `
            <div class="error-message">
                <h2>⚠️ Unable to Load Treatise</h2>
                <p>The treatise document could not be found.</p>
                <p><small>Looking for: A Treatise on Arcane Matrices.md</small></p>
            </div>
        `;
    }
}

function generateTOC(html) {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    
    const headings = temp.querySelectorAll('h2, h3');
    const tocHTML = Array.from(headings).map((heading, index) => {
        const id = `heading-${index}`;
        heading.id = id;
        
        const level = heading.tagName === 'H2' ? 'toc-h2' : 'toc-h3';
        return `<li class="${level}"><a href="#${id}">${heading.textContent}</a></li>`;
    }).join('');
    
    elements.treatiseTOC.innerHTML = `
        <h2>Table of Contents</h2>
        <ul>${tocHTML}</ul>
    `;
    
    // Update content with IDs
    elements.treatiseContent.innerHTML = temp.innerHTML;
    
    // Add smooth scrolling
    elements.treatiseTOC.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const target = document.getElementById(targetId);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}
