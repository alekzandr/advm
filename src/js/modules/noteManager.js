const NOTE_KEY = 'advm_field_notes';
const SESSION_KEY = 'advm_session_log';

export class NoteManager {
    constructor({ notesField, sessionList }) {
        this.notesField = notesField;
        this.sessionList = sessionList;
        this.sessionEntries = this.loadList();
        this.renderLogs();
        this.loadNotes();
    }

    loadNotes() {
        if (!this.notesField) return;
        const stored = localStorage.getItem(NOTE_KEY);
        if (stored) {
            this.notesField.value = stored;
        }
    }

    saveNotes(text) {
        const sanitized = this.sanitize(text);
        localStorage.setItem(NOTE_KEY, sanitized);
        if (this.notesField) {
            this.notesField.value = sanitized;
        }
        return sanitized;
    }

    sanitize(text = '') {
        return text.replace(/[\p{Extended_Pictographic}\p{Emoji_Component}]/gu, '').trim();
    }

    appendSessionEntry(entry) {
        const timestamp = new Date().toLocaleTimeString();
        const line = `[${timestamp}] ${entry}`;
        this.sessionEntries.unshift(line);
        this.sessionEntries = this.sessionEntries.slice(0, 20);
        localStorage.setItem(SESSION_KEY, JSON.stringify(this.sessionEntries));
        this.renderLogs();
    }

    loadList() {
        try {
            return JSON.parse(localStorage.getItem(SESSION_KEY)) || [];
        } catch (error) {
            return [];
        }
    }

    renderLogs() {
        if (!this.sessionList) return;
        this.sessionList.innerHTML = '';
        this.sessionEntries.forEach(line => {
            const li = document.createElement('li');
            li.textContent = line;
            this.sessionList.appendChild(li);
        });
    }

    export(notesExtra = '') {
        const blobContent = `# ADVM Field Notes\n\n${localStorage.getItem(NOTE_KEY) || ''}\n\n## Glyph Notes\n${notesExtra}\n\n## Session Log\n${this.sessionEntries.join('\n')}`;
        const file = new Blob([blobContent], { type: 'text/markdown' });
        const url = URL.createObjectURL(file);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = 'advm-notes.md';
        anchor.click();
        URL.revokeObjectURL(url);
    }
}
