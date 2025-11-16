const STATUS = {
    pass: { label: 'PASS', color: 'var(--success)' },
    warn: { label: 'WARN', color: 'var(--warn)' },
    fail: { label: 'FAIL', color: 'var(--danger)' }
};

export class RulesEngine {
    evaluate({ spell, flow = [], mode = 'construct', depthRequirement = 2 }) {
        if (!spell) {
            return this.wrapResult({
                identity: { status: 'fail', detail: 'No spell loaded.' },
                proportion: { status: 'warn', detail: 'Load a spell to establish depth.' },
                compatibility: { status: 'warn', detail: 'Unknown discipline.' },
                bounds: { status: 'warn', detail: 'Range unknown.' },
                conduits: { status: 'warn', detail: 'Components unknown.' }
            });
        }

        const identity = flow[0] === 'mvm-0'
            ? { status: 'pass', detail: 'Discipline anchor engaged.' }
            : { status: 'warn', detail: 'Source vector not engaged first.' };

        const proportion = flow.length >= depthRequirement
            ? { status: 'pass', detail: 'Flow meets depth requirement.' }
            : { status: 'warn', detail: `Need ${depthRequirement - flow.length} more nodes.` };

        const compatibility = spell.discipline && flow.includes('mvm-3')
            ? { status: 'pass', detail: `${spell.discipline} action stabilized.` }
            : { status: 'warn', detail: 'Action vector not confirmed.' };

        const bounds = spell.mvm?.projection?.range
            ? { status: 'pass', detail: spell.mvm.projection.range }
            : { status: 'warn', detail: 'Range unspecified.' };

        const conduits = spell.cl?.row1?.utterance && spell.cl?.row1?.gesture
            ? { status: 'pass', detail: 'Component layer complete.' }
            : { status: 'warn', detail: 'Component layer incomplete.' };

        if (mode === 'disrupt' && flow.length >= 2) {
            bounds.detail = 'Disruption timing achieved';
        }

        return this.wrapResult({ identity, proportion, compatibility, bounds, conduits });
    }

    wrapResult(result) {
        Object.entries(result).forEach(([key, value]) => {
            const meta = STATUS[value.status] ?? STATUS.warn;
            value.label = meta.label;
            value.color = meta.color;
        });
        return result;
    }
}
