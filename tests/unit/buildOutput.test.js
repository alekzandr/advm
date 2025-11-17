// Production build output tests
// @vitest-environment node
import { describe, it, expect, beforeAll } from 'vitest';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { execSync } from 'child_process';

describe('Production Build Output', () => {
  beforeAll(() => {
    // Only run build if dist doesn't exist or is outdated
    if (!existsSync('dist/index.html')) {
      console.log('Building project for tests...');
      execSync('npm run build', { stdio: 'inherit' });
    }
  });

  describe('Static Assets in dist/', () => {
    it('should have index.html at root', () => {
      expect(existsSync('dist/index.html')).toBe(true);
    });

    it('should have glyphs.json', () => {
      expect(existsSync('dist/glyphs.json')).toBe(true);
    });

    it('should have spells.json', () => {
      expect(existsSync('dist/spells.json')).toBe(true);
    });

    it('should have puzzles.json', () => {
      expect(existsSync('dist/puzzles.json')).toBe(true);
    });

    it('should have treatise in docs folder', () => {
      expect(existsSync('dist/docs/A Treatise on Arcane Matrices.md')).toBe(true);
    });
  });

  describe('Built index.html', () => {
    let htmlContent;

    beforeAll(() => {
      if (existsSync('dist/index.html')) {
        htmlContent = readFileSync('dist/index.html', 'utf-8');
      }
    });

    it('should have base path /advm/', () => {
      expect(htmlContent).toContain('/advm/');
    });

    it('should reference built JS files', () => {
      // Vite generates hashed filenames
      expect(htmlContent).toMatch(/\/advm\/assets\/.*\.js/);
    });

    it('should reference built CSS files', () => {
      expect(htmlContent).toMatch(/\/advm\/assets\/.*\.css/);
    });
  });

  describe('JSON Data Files', () => {
    it('glyphs.json should be valid JSON', () => {
      if (existsSync('dist/glyphs.json')) {
        const content = readFileSync('dist/glyphs.json', 'utf-8');
        expect(() => JSON.parse(content)).not.toThrow();
      }
    });

    it('spells.json should be valid JSON', () => {
      if (existsSync('dist/spells.json')) {
        const content = readFileSync('dist/spells.json', 'utf-8');
        expect(() => JSON.parse(content)).not.toThrow();
      }
    });

    it('puzzles.json should be valid JSON', () => {
      if (existsSync('dist/puzzles.json')) {
        const content = readFileSync('dist/puzzles.json', 'utf-8');
        expect(() => JSON.parse(content)).not.toThrow();
      }
    });
  });

  describe('Asset Directory Structure', () => {
    it('should have assets directory', () => {
      expect(existsSync('dist/assets')).toBe(true);
    });

    it('should have docs directory', () => {
      expect(existsSync('dist/docs')).toBe(true);
    });
  });
});
