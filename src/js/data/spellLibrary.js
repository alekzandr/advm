// Spell data loader
export async function loadSpells() {
    try {
        const response = await fetch('/spells.json');
        if (!response.ok) throw new Error('Failed to load spells');
        const data = await response.json();
        return data.spells || [];
    } catch (error) {
        if (process.env.NODE_ENV !== 'test') {
            console.error('Error loading spells:', error);
        }
        return [];
    }
}

export function findSpell(spells, id) {
    return spells.find(spell => spell.id === id);
}
