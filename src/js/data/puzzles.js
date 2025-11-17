// Puzzle data loader
export async function loadPuzzles() {
    try {
        const response = await fetch('/puzzles.json');
        if (!response.ok) throw new Error('Failed to load puzzles');
        const data = await response.json();
        return data;
    } catch (error) {
        if (process.env.NODE_ENV !== 'test') {
            console.error('Error loading puzzles:', error);
        }
        return { apprentice: [], journeyman: [], archmage: [] };
    }
}
