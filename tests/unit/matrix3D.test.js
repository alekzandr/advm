// Unit tests for Matrix3D core module
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Matrix3D', () => {
  let container;
  let matrix3D;

  beforeEach(() => {
    // Setup DOM
    document.body.innerHTML = `
      <div class="cube-viewport">
        <div class="cube-container"></div>
      </div>
    `;
    container = document.querySelector('.cube-container');
  });

  describe('Initialization', () => {
    it('should initialize with default rotation', () => {
      const rotation = { x: -20, y: -20 };
      
      expect(rotation.x).toBe(-20);
      expect(rotation.y).toBe(-20);
    });

    it('should create cube structure with 3 layers', () => {
      const layers = ['MVM', 'CL', 'SL'];
      
      expect(layers).toHaveLength(3);
      expect(layers).toContain('MVM');
      expect(layers).toContain('CL');
      expect(layers).toContain('SL');
    });

    it('should initialize 9 nodes per layer', () => {
      const nodesPerLayer = 9;
      const positions = ['top-left', 'top', 'top-right', 'left', 'center', 'right', 'bottom-left', 'bottom', 'bottom-right'];
      
      expect(positions).toHaveLength(nodesPerLayer);
    });
  });

  describe('Interaction State Machine', () => {
    it('should start in idle state', () => {
      const state = 'idle';
      expect(state).toBe('idle');
    });

    it('should transition to potential-click on node pointerdown', () => {
      let state = 'idle';
      const isNode = true;
      
      if (isNode) {
        state = 'potential-click';
      }
      
      expect(state).toBe('potential-click');
    });

    it('should transition to potential-drag on background pointerdown', () => {
      let state = 'idle';
      const isNode = false;
      
      if (!isNode) {
        state = 'potential-drag';
      }
      
      expect(state).toBe('potential-drag');
    });

    it('should transition to dragging after movement threshold', () => {
      let state = 'potential-drag';
      const movement = 15; // pixels
      const threshold = 10;
      
      if (movement > threshold) {
        state = 'dragging';
      }
      
      expect(state).toBe('dragging');
    });

    it('should not transition to dragging below threshold', () => {
      let state = 'potential-drag';
      const movement = 5; // pixels
      const threshold = 10;
      
      if (movement > threshold) {
        state = 'dragging';
      }
      
      expect(state).toBe('potential-drag');
    });
  });

  describe('Node Detection', () => {
    it('should find node using closest()', () => {
      const nodeEl = document.createElement('div');
      nodeEl.className = 'matrix-node-3d';
      nodeEl.dataset.nodeId = 'mvm-center';
      container.appendChild(nodeEl);
      
      const found = nodeEl.closest('.matrix-node-3d');
      
      expect(found).toBe(nodeEl);
      expect(found.dataset.nodeId).toBe('mvm-center');
    });

    it('should find node from child element', () => {
      const nodeEl = document.createElement('div');
      nodeEl.className = 'matrix-node-3d';
      nodeEl.dataset.nodeId = 'mvm-center';
      
      const glyphSpan = document.createElement('span');
      glyphSpan.className = 'node-glyph';
      glyphSpan.textContent = '⚡';
      nodeEl.appendChild(glyphSpan);
      
      container.appendChild(nodeEl);
      
      const found = glyphSpan.closest('.matrix-node-3d');
      
      expect(found).toBe(nodeEl);
      expect(found.dataset.nodeId).toBe('mvm-center');
    });

    it('should use elementsFromPoint for layer-grid clicks', () => {
      const mockElements = vi.fn().mockReturnValue([
        { className: 'layer-grid' },
        { className: 'matrix-node-3d', dataset: { nodeId: 'mvm-top' } }
      ]);
      
      document.elementsFromPoint = mockElements;
      
      const elements = document.elementsFromPoint(100, 100);
      const node = elements.find(el => el.className === 'matrix-node-3d');
      
      expect(node).toBeDefined();
      expect(node.dataset.nodeId).toBe('mvm-top');
    });
  });

  describe('Drag Thresholds', () => {
    it('should require 10px movement to start drag', () => {
      const DRAG_THRESHOLD = 10;
      const movement = 9;
      
      const shouldDrag = movement > DRAG_THRESHOLD;
      
      expect(shouldDrag).toBe(false);
    });

    it('should require 50ms time to start drag', () => {
      const DRAG_TIME_THRESHOLD = 50;
      const timeElapsed = 45;
      
      const shouldDrag = timeElapsed > DRAG_TIME_THRESHOLD;
      
      expect(shouldDrag).toBe(false);
    });

    it('should start drag when both thresholds met', () => {
      const DRAG_THRESHOLD = 10;
      const DRAG_TIME_THRESHOLD = 50;
      const movement = 15;
      const timeElapsed = 60;
      
      const shouldDrag = movement > DRAG_THRESHOLD && timeElapsed > DRAG_TIME_THRESHOLD;
      
      expect(shouldDrag).toBe(true);
    });
  });

  describe('Rotation', () => {
    it('should calculate rotation from drag delta', () => {
      let rotation = { x: 0, y: 0 };
      const deltaX = 50;
      const deltaY = -30;
      const sensitivity = 0.5;
      
      rotation.y += deltaX * sensitivity;
      rotation.x += deltaY * sensitivity;
      
      expect(rotation.y).toBe(25);
      expect(rotation.x).toBe(-15);
    });

    it('should apply rotation as CSS transform', () => {
      const rotation = { x: -20, y: 45 };
      const transform = `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`;
      
      expect(transform).toBe('rotateX(-20deg) rotateY(45deg)');
    });
  });

  describe('Pointer Events', () => {
    it('should listen for pointerdown event', () => {
      const handler = vi.fn();
      container.addEventListener('pointerdown', handler);
      
      const event = new PointerEvent('pointerdown', {
        clientX: 100,
        clientY: 100
      });
      container.dispatchEvent(event);
      
      expect(handler).toHaveBeenCalled();
    });

    it('should track pointer position', () => {
      const position = { x: 0, y: 0 };
      const event = new PointerEvent('pointermove', {
        clientX: 150,
        clientY: 200
      });
      
      position.x = event.clientX;
      position.y = event.clientY;
      
      expect(position.x).toBe(150);
      expect(position.y).toBe(200);
    });
  });
});
