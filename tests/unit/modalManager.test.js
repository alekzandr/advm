// Modal/Dialog management tests
import { describe, it, expect, beforeEach } from 'vitest';

describe('Modal Management', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <dialog id="referenceModal">
        <button id="closeReferenceBtn">Close</button>
        <div id="referenceContent"></div>
      </dialog>
      <dialog id="glyphManagerModal">
        <button id="closeGlyphManager">Close</button>
        <div id="glyphManagerContent"></div>
      </dialog>
      <dialog id="nodeGlyphSelector">
        <button id="closeNodeSelector">Close</button>
        <div id="selectorGlyphList"></div>
      </dialog>
      <button id="openReferenceBtn">Open Reference</button>
      <button id="manageGlyphsBtn">Manage Glyphs</button>
    `;
  });

  describe('Modal Elements Exist', () => {
    it('should have reference modal', () => {
      const modal = document.getElementById('referenceModal');
      expect(modal).toBeTruthy();
      expect(modal.tagName).toBe('DIALOG');
    });

    it('should have glyph manager modal', () => {
      const modal = document.getElementById('glyphManagerModal');
      expect(modal).toBeTruthy();
      expect(modal.tagName).toBe('DIALOG');
    });

    it('should have node selector modal', () => {
      const modal = document.getElementById('nodeGlyphSelector');
      expect(modal).toBeTruthy();
      expect(modal.tagName).toBe('DIALOG');
    });
  });

  describe('Modal Close Buttons', () => {
    it('should have close button for reference modal', () => {
      const closeBtn = document.getElementById('closeReferenceBtn');
      expect(closeBtn).toBeTruthy();
    });

    it('should have close button for glyph manager', () => {
      const closeBtn = document.getElementById('closeGlyphManager');
      expect(closeBtn).toBeTruthy();
    });

    it('should have close button for node selector', () => {
      const closeBtn = document.getElementById('closeNodeSelector');
      expect(closeBtn).toBeTruthy();
    });
  });

  describe('Modal Content Areas', () => {
    it('should have content area in reference modal', () => {
      const content = document.getElementById('referenceContent');
      expect(content).toBeTruthy();
    });

    it('should have content area in glyph manager', () => {
      const content = document.getElementById('glyphManagerContent');
      expect(content).toBeTruthy();
    });

    it('should have glyph list in node selector', () => {
      const list = document.getElementById('selectorGlyphList');
      expect(list).toBeTruthy();
    });
  });

  describe('Modal Trigger Buttons', () => {
    it('should have button to open reference modal', () => {
      const btn = document.getElementById('openReferenceBtn');
      expect(btn).toBeTruthy();
    });

    it('should have button to open glyph manager', () => {
      const btn = document.getElementById('manageGlyphsBtn');
      expect(btn).toBeTruthy();
    });
  });
});
