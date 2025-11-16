export class FlowPathTracer {
    constructor({ onUpdate } = {}) {
        this.onUpdate = onUpdate;
        this.pattern = [];
        this.mode = 'construct';
        this.depthRequirement = 2;
        this.flow = [];
    }

    setPattern(pattern = []) {
        this.pattern = pattern;
        this.reset();
    }

    setMode(mode) {
        this.mode = mode;
        this.reset();
    }

    setDepthRequirement(spellLevel = 1) {
        this.depthRequirement = Math.max(2, spellLevel * 2);
    }

    addStep(nodeId) {
        if (!this.pattern.length) {
            return { status: 'error', message: 'No flow pattern loaded.' };
        }

        const expectedIndex = this.mode === 'disrupt'
            ? this.pattern.length - 1 - this.flow.length
            : this.flow.length;
        const expectedNode = this.pattern[expectedIndex];

        if (expectedNode && nodeId !== expectedNode) {
            return { status: 'warn', message: 'Node is out of sequence for this discipline.' };
        }

        this.flow.push(nodeId);
        this.dispatchUpdate();

        const satisfied = this.flow.length >= this.depthRequirement;
        return {
            status: 'ok',
            satisfied,
            remaining: Math.max(0, this.depthRequirement - this.flow.length)
        };
    }

    undo() {
        this.flow.pop();
        this.dispatchUpdate();
    }

    reset() {
        this.flow = [];
        this.dispatchUpdate();
    }

    dispatchUpdate() {
        if (typeof this.onUpdate === 'function') {
            this.onUpdate([...this.flow]);
        }
    }
}
