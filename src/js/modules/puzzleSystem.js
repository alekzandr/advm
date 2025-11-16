export class PuzzleSystem {
    constructor({ panelEl, descriptionEl, objectivesEl, hintsEl, logEl }) {
        this.panelEl = panelEl;
        this.descriptionEl = descriptionEl;
        this.objectivesEl = objectivesEl;
        this.hintsEl = hintsEl;
        this.logEl = logEl;
        this.puzzles = { apprentice: [], journeyman: [], archmage: [] };
        this.history = [];
    }

    loadPuzzles(data) {
        this.puzzles = data;
    }

    generate(difficulty = 'apprentice') {
        const bank = this.puzzles[difficulty] || [];
        if (!bank.length) {
            this.renderFallback('No puzzles defined for this tier.');
            return null;
        }
        const puzzle = bank[Math.floor(Math.random() * bank.length)];
        this.renderPuzzle(puzzle, difficulty);
        this.appendLog(`Loaded ${puzzle.title} (${difficulty})`);
        return puzzle;
    }

    renderPuzzle(puzzle, difficulty) {
        if (!puzzle) return;
        if (this.panelEl) {
            this.panelEl.querySelector('h3').textContent = puzzle.title;
        }
        if (this.descriptionEl) {
            this.descriptionEl.textContent = puzzle.description;
        }
        if (this.objectivesEl) {
            this.objectivesEl.innerHTML = puzzle.objectives
                .map(obj => `<li>${obj}</li>`)
                .join('');
        }
        if (this.hintsEl) {
            this.hintsEl.innerHTML = `
                <details>
                    <summary>Hints (${difficulty})</summary>
                    <ul>${puzzle.hints.map(hint => `<li>${hint}</li>`).join('')}</ul>
                </details>
            `;
        }
    }

    renderFallback(message) {
        this.descriptionEl.textContent = message;
        this.objectivesEl.innerHTML = '';
        this.hintsEl.innerHTML = '';
    }

    appendLog(entry) {
        const timestamp = new Date().toLocaleTimeString();
        const item = document.createElement('li');
        item.textContent = `[${timestamp}] ${entry}`;
        this.logEl.prepend(item);
        this.history.unshift(item.textContent);
        this.history = this.history.slice(0, 12);
    }

    exportHistory() {
        return this.history.join('\n');
    }
}
