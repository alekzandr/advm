// Data loading functionality tests
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { loadSpells, findSpell } from '../../src/js/data/spellLibrary.js';
import { loadGlyphs } from '../../src/js/data/glyphs.js';
import { loadPuzzles } from '../../src/js/data/puzzles.js';

describe('Data Loading', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  describe('Spell Library', () => {
    it('should load spells from JSON', async () => {
      const mockSpells = [
        { id: 'fireball', name: 'Fireball', level: 3 },
        { id: 'magic-missile', name: 'Magic Missile', level: 1 }
      ];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ spells: mockSpells })
      });

      const spells = await loadSpells();
      expect(spells).toEqual(mockSpells);
      expect(global.fetch).toHaveBeenCalledWith('/spells.json');
    });

    it('should return empty array on fetch error', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));
      const spells = await loadSpells();
      expect(spells).toEqual([]);
    });

    it('should find spell by id', () => {
      const spells = [
        { id: 'fireball', name: 'Fireball' },
        { id: 'shield', name: 'Shield' }
      ];
      
      const found = findSpell(spells, 'fireball');
      expect(found).toEqual({ id: 'fireball', name: 'Fireball' });
    });

    it('should return undefined for non-existent spell', () => {
      const spells = [{ id: 'fireball', name: 'Fireball' }];
      const found = findSpell(spells, 'nonexistent');
      expect(found).toBeUndefined();
    });
  });

  describe('Glyph Loading', () => {
    it('should load glyphs from JSON', async () => {
      const mockGlyphs = [
        { id: 'evocation', symbol: '⚡', name: 'Evocation' }
      ];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ glyphs: mockGlyphs })
      });

      const glyphs = await loadGlyphs();
      expect(glyphs).toEqual(mockGlyphs);
      expect(global.fetch).toHaveBeenCalledWith('/glyphs.json');
    });

    it('should return empty array on error', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Failed'));
      const glyphs = await loadGlyphs();
      expect(glyphs).toEqual([]);
    });
  });

  describe('Puzzle Loading', () => {
    it('should load puzzles from JSON', async () => {
      const mockPuzzles = {
        apprentice: [{ id: 'p1', difficulty: 'apprentice' }],
        journeyman: [],
        archmage: []
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPuzzles
      });

      const puzzles = await loadPuzzles();
      expect(puzzles).toEqual(mockPuzzles);
      expect(global.fetch).toHaveBeenCalledWith('/puzzles.json');
    });

    it('should return default structure on error', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Failed'));
      const puzzles = await loadPuzzles();
      expect(puzzles).toEqual({
        apprentice: [],
        journeyman: [],
        archmage: []
      });
    });
  });
});
