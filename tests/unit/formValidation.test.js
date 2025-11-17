// Form controls and validation tests
import { describe, it, expect, beforeEach } from 'vitest';

describe('Form Controls', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <select id="disciplineSelect">
        <option value="">Select discipline</option>
      </select>
      <select id="levelSelect">
        <option value="">Select level</option>
      </select>
      <select id="modeSelect">
        <option value="construct">Construct</option>
        <option value="disrupt">Disrupt</option>
        <option value="analyze">Analyze</option>
      </select>
      <select id="puzzleDifficulty">
        <option value="apprentice">Apprentice</option>
        <option value="journeyman">Journeyman</option>
        <option value="archmage">Archmage</option>
      </select>
      <select id="filterCategory">
        <option value="all">All Categories</option>
        <option value="school">Schools</option>
        <option value="action">Actions</option>
      </select>
      <select id="filterLayer">
        <option value="all">All Layers</option>
        <option value="MVM">MVM</option>
        <option value="CL">CL</option>
        <option value="SL">SL</option>
      </select>
      <input type="search" id="glyphSearch" />
      <textarea id="glyphNotes"></textarea>
      <button id="saveNotesBtn">Save</button>
      <button id="clearFilters">Clear</button>
    `;
  });

  describe('Select Elements Exist', () => {
    it('should have discipline select', () => {
      expect(document.getElementById('disciplineSelect')).toBeTruthy();
    });

    it('should have level select', () => {
      expect(document.getElementById('levelSelect')).toBeTruthy();
    });

    it('should have mode select', () => {
      expect(document.getElementById('modeSelect')).toBeTruthy();
    });

    it('should have puzzle difficulty select', () => {
      expect(document.getElementById('puzzleDifficulty')).toBeTruthy();
    });

    it('should have filter category select', () => {
      expect(document.getElementById('filterCategory')).toBeTruthy();
    });

    it('should have filter layer select', () => {
      expect(document.getElementById('filterLayer')).toBeTruthy();
    });
  });

  describe('Mode Select Options', () => {
    it('should have construct mode', () => {
      const select = document.getElementById('modeSelect');
      const option = Array.from(select.options).find(o => o.value === 'construct');
      expect(option).toBeTruthy();
    });

    it('should have disrupt mode', () => {
      const select = document.getElementById('modeSelect');
      const option = Array.from(select.options).find(o => o.value === 'disrupt');
      expect(option).toBeTruthy();
    });

    it('should have analyze mode', () => {
      const select = document.getElementById('modeSelect');
      const option = Array.from(select.options).find(o => o.value === 'analyze');
      expect(option).toBeTruthy();
    });
  });

  describe('Puzzle Difficulty Options', () => {
    it('should have all three difficulty levels', () => {
      const select = document.getElementById('puzzleDifficulty');
      const values = Array.from(select.options).map(o => o.value);
      
      expect(values).toContain('apprentice');
      expect(values).toContain('journeyman');
      expect(values).toContain('archmage');
    });
  });

  describe('Filter Controls', () => {
    it('should have category filter with all option', () => {
      const select = document.getElementById('filterCategory');
      const allOption = Array.from(select.options).find(o => o.value === 'all');
      expect(allOption).toBeTruthy();
    });

    it('should have layer filter with all layers', () => {
      const select = document.getElementById('filterLayer');
      const values = Array.from(select.options).map(o => o.value);
      
      expect(values).toContain('all');
      expect(values).toContain('MVM');
      expect(values).toContain('CL');
      expect(values).toContain('SL');
    });

    it('should have search input', () => {
      const input = document.getElementById('glyphSearch');
      expect(input).toBeTruthy();
      expect(input.type).toBe('search');
    });

    it('should have clear filters button', () => {
      const btn = document.getElementById('clearFilters');
      expect(btn).toBeTruthy();
    });
  });

  describe('Notes Section', () => {
    it('should have notes textarea', () => {
      const textarea = document.getElementById('glyphNotes');
      expect(textarea).toBeTruthy();
      expect(textarea.tagName).toBe('TEXTAREA');
    });

    it('should have save notes button', () => {
      const btn = document.getElementById('saveNotesBtn');
      expect(btn).toBeTruthy();
    });

    it('should allow text input in notes', () => {
      const textarea = document.getElementById('glyphNotes');
      textarea.value = 'Test note';
      expect(textarea.value).toBe('Test note');
    });
  });
});
