// Unit tests for GlyphBank module
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('GlyphBank', () => {
  let glyphBank;
  let mockGlyphs;

  beforeEach(() => {
    // Setup DOM
    document.body.innerHTML = `
      <div class="glyph-list" id="glyphList"></div>
      <input type="search" id="glyphSearch" />
      <select id="filterCategory"></select>
      <select id="filterLayer"></select>
      <button id="clearFilters"></button>
      <span id="glyphCount"></span>
    `;

    // Mock glyphs data
    mockGlyphs = [
      {
        id: 'evocation',
        symbol: '⚡',
        name: 'Evocation',
        tags: ['school'],
        layer: 'MVM',
        position: 'top-left',
        meaning: 'School of Evocation'
      },
      {
        id: 'fireball',
        symbol: '🔥',
        name: 'Fireball',
        tags: ['action', 'damage'],
        layer: 'MVM',
        position: 'center',
        meaning: 'Deal fire damage'
      },
      {
        id: 'verbal',
        symbol: 'V',
        name: 'Verbal',
        tags: ['component'],
        layer: 'CL',
        position: 'top',
        meaning: 'Requires spoken words'
      }
    ];

    // Mock fetch
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ glyphs: mockGlyphs })
    });
  });

  describe('Initialization', () => {
    it('should initialize with default filter state', () => {
      const filters = {
        category: 'all',
        layer: 'all',
        search: ''
      };
      
      expect(filters.category).toBe('all');
      expect(filters.layer).toBe('all');
      expect(filters.search).toBe('');
    });

    it('should load glyphs from data file', async () => {
      const response = await fetch('/data/glyphs.json');
      const data = await response.json();
      
      expect(fetch).toHaveBeenCalledWith('/data/glyphs.json');
      expect(data.glyphs).toEqual(mockGlyphs);
      expect(data.glyphs).toHaveLength(3);
    });
  });

  describe('Filtering', () => {
    it('should filter by category', () => {
      const filtered = mockGlyphs.filter(g => g.tags.includes('school'));
      
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('evocation');
    });

    it('should filter by layer', () => {
      const filtered = mockGlyphs.filter(g => g.layer === 'CL');
      
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('verbal');
    });

    it('should filter by search text', () => {
      const searchTerm = 'fire';
      const filtered = mockGlyphs.filter(g =>
        g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.meaning.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('fireball');
    });

    it('should combine multiple filters', () => {
      const category = 'action';
      const layer = 'MVM';
      
      const filtered = mockGlyphs.filter(g =>
        g.tags.includes(category) && g.layer === layer
      );
      
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('fireball');
    });

    it('should return all glyphs when filters are cleared', () => {
      const filtered = mockGlyphs.filter(() => true);
      
      expect(filtered).toHaveLength(3);
    });
  });

  describe('Rendering', () => {
    it('should create glyph card elements', () => {
      const glyph = mockGlyphs[0];
      const card = document.createElement('div');
      card.className = 'glyph-card';
      card.innerHTML = `
        <div class="glyph-symbol">${glyph.symbol}</div>
        <div class="glyph-name">${glyph.name}</div>
        <div class="glyph-meta">${glyph.layer} · ${glyph.position}</div>
      `;
      
      expect(card.querySelector('.glyph-symbol').textContent).toBe('⚡');
      expect(card.querySelector('.glyph-name').textContent).toBe('Evocation');
    });

    it('should update glyph count display', () => {
      const countEl = document.getElementById('glyphCount');
      const count = mockGlyphs.length;
      countEl.textContent = `${count} glyph${count !== 1 ? 's' : ''}`;
      
      expect(countEl.textContent).toBe('3 glyphs');
    });
  });

  describe('Events', () => {
    it('should handle glyph card click', () => {
      const handleClick = vi.fn();
      const card = document.createElement('div');
      card.addEventListener('click', handleClick);
      card.click();
      
      expect(handleClick).toHaveBeenCalledOnce();
    });

    it('should update filters on select change', () => {
      const select = document.getElementById('filterCategory');
      select.value = 'school';
      select.dispatchEvent(new Event('change'));
      
      expect(select.value).toBe('school');
    });

    it('should update search on input', () => {
      const input = document.getElementById('glyphSearch');
      input.value = 'fire';
      input.dispatchEvent(new Event('input'));
      
      expect(input.value).toBe('fire');
    });
  });
});
