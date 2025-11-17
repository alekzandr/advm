// Build configuration and file structure tests
// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

describe('Build Configuration', () => {
  describe('index.html paths', () => {
    it('should have correct CSS paths without ../ prefix', () => {
      const indexPath = resolve(process.cwd(), 'index.html');
      const content = readFileSync(indexPath, 'utf-8');
      
      expect(content).toContain('href="/src/css/main.css"');
      expect(content).toContain('href="/src/css/cube3d.css"');
      expect(content).toContain('href="/src/css/responsive.css"');
      
      // Should NOT have relative paths
      expect(content).not.toContain('href="../src/css');
    });

    it('should have correct JS path without ../ prefix', () => {
      const indexPath = resolve(process.cwd(), 'index.html');
      const content = readFileSync(indexPath, 'utf-8');
      
      expect(content).toContain('src="/src/js/main.js"');
      expect(content).not.toContain('src="../src/js');
    });
  });

  describe('Required files exist', () => {
    it('should have index.html at root', () => {
      expect(existsSync('index.html')).toBe(true);
    });

    it('should have vite.config.js', () => {
      expect(existsSync('vite.config.js')).toBe(true);
    });

    it('should have all CSS files', () => {
      expect(existsSync('src/css/main.css')).toBe(true);
      expect(existsSync('src/css/cube3d.css')).toBe(true);
      expect(existsSync('src/css/responsive.css')).toBe(true);
    });

    it('should have all data JSON files in public', () => {
      expect(existsSync('public/glyphs.json')).toBe(true);
      expect(existsSync('public/spells.json')).toBe(true);
      expect(existsSync('public/puzzles.json')).toBe(true);
    });

    it('should have treatise in public/docs', () => {
      expect(existsSync('public/docs/A Treatise on Arcane Matrices.md')).toBe(true);
    });
  });

  describe('Vite configuration', () => {
    it('should have correct base path', () => {
      const viteConfig = readFileSync('vite.config.js', 'utf-8');
      expect(viteConfig).toContain("base: '/advm/'");
    });

    it('should not have root set to public', () => {
      const viteConfig = readFileSync('vite.config.js', 'utf-8');
      expect(viteConfig).not.toContain("root: 'public'");
    });
  });

  describe('Data loader paths', () => {
    it('should use absolute paths for JSON files', () => {
      const spellLibrary = readFileSync('src/js/data/spellLibrary.js', 'utf-8');
      const glyphs = readFileSync('src/js/data/glyphs.js', 'utf-8');
      const puzzles = readFileSync('src/js/data/puzzles.js', 'utf-8');

      expect(spellLibrary).toContain("fetch('/spells.json')");
      expect(glyphs).toContain("fetch('/glyphs.json')");
      expect(puzzles).toContain("fetch('/puzzles.json')");
    });

    it('should use absolute paths for markdown files', () => {
      const mainJs = readFileSync('src/js/main.js', 'utf-8');
      expect(mainJs).toContain("/docs/A Treatise on Arcane Matrices.md");
    });
  });
});
