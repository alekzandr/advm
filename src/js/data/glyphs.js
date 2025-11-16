// Glyph data loader
export async function loadGlyphs() {
    try {
        const response = await fetch('/glyphs.json');
        if (!response.ok) throw new Error('Failed to load glyphs');
        const data = await response.json();
        return data.glyphs || [];
    } catch (error) {
        console.error('Error loading glyphs:', error);
        return [];
    }
}
