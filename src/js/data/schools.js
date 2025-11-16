// School/discipline data
export const SCHOOL_PROFILES = {
    abjuration: { name: 'Abjuration', color: '#4A90E2' },
    conjuration: { name: 'Conjuration', color: '#7B68EE' },
    divination: { name: 'Divination', color: '#9370DB' },
    enchantment: { name: 'Enchantment', color: '#FF69B4' },
    evocation: { name: 'Evocation', color: '#FF4500' },
    illusion: { name: 'Illusion', color: '#BA55D3' },
    necromancy: { name: 'Necromancy', color: '#2F4F4F' },
    transmutation: { name: 'Transmutation', color: '#32CD32' }
};

export function listDisciplines() {
    return Object.keys(SCHOOL_PROFILES);
}

export function getDisciplineInfo(discipline) {
    return SCHOOL_PROFILES[discipline] || null;
}
