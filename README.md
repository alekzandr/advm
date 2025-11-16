# ADVM Console

**Arcane Dimensional Vector Matrix Console** - An interactive web-based interface for managing and visualizing spell matrices using the post-divine arcane geometry system.

[![Deploy to GitHub Pages](https://github.com/yourusername/advm/actions/workflows/deploy.yml/badge.svg)](https://github.com/yourusername/advm/actions/workflows/deploy.yml)

🔮 **[Live Demo](https://yourusername.github.io/advm/)** | 📖 **[Documentation](./docs/)** | 🎮 **[Treatise](./docs/A-Treatise-on-Arcane-Matrices.md)**

## Overview

The ADVM Console is a specialized tool for Dungeon Masters and players to construct, analyze, and disrupt magical spell matrices based on the Dimensional Vector Matrix (DVM) system developed by Archmage Veylarin Thest. This system codifies post-divine arcane geometry into three layered matrices:

- **MVM (Mechanical Vector Matrix)** - The spell's geometric skeleton
- **CL (Component Layer)** - Verbal, somatic, and material requirements
- **SL (Specialist Layer)** - Exceptions, mutations, and divine residue

## Features

### 🎭 Dual Mode System
- **Player Mode**: Hidden information, puzzle-based spell discovery
- **DM Mode**: Full control, spell construction, and matrix editing

### 🔷 3D Matrix Visualization
- Interactive 3D cube with three rotatable layers
- Click nodes to assign glyphs
- Visual flow tracing through spell structure
- Touch-enabled for mobile devices

### 📚 Glyph Bank
- 150+ categorized glyphs
- Filterable by category, layer, and search
- Detailed glyph inspector with notes
- Export findings as Markdown

### 🧩 Puzzle System
- Three difficulty levels (Apprentice, Journeyman, Archmage)
- Guided spell reconstruction challenges
- Session history and diagnostics

### 📜 Integrated Treatise
- Full access to Archmage Thest's treatise
- In-app reference documentation
- Context-sensitive help

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Modern web browser (Chrome, Firefox, Edge, Safari)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/advm-console.git
cd advm-console

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will open at `http://localhost:3000`

### Building for Production

```bash
# Create optimized build
npm run build

# Preview production build
npm run preview
```

## Development

### Project Structure

```
advm-console/
├── .github/workflows/    # GitHub Actions CI/CD
├── src/
│   ├── js/
│   │   ├── core/        # Core modules (Matrix3D, rendering)
│   │   ├── modules/     # Feature modules (GlyphBank, puzzles)
│   │   └── main.js      # Application entry point
│   ├── css/             # Stylesheets
│   └── data/            # JSON data files (glyphs, spells)
├── public/              # Static assets
│   └── index.html       # Main HTML file
├── docs/                # Documentation and treatise
├── tests/
│   ├── unit/           # Unit tests
│   └── integration/    # Integration tests
├── package.json
├── vite.config.js      # Build configuration
└── vitest.config.js    # Test configuration
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

### Code Quality

```bash
# Lint JavaScript
npm run lint

# Fix linting issues
npm run lint -- --fix
```

## Usage Guide

### Player Mode

1. **Load a Puzzle**: Click "Generate Puzzle" to receive a spell reconstruction challenge
2. **Explore Glyphs**: Browse the Glyph Bank to learn about available sigils
3. **Solve the Puzzle**: Follow clues to reconstruct the spell matrix
4. **Track Progress**: View diagnostics and session log

### DM Mode

1. **Switch Mode**: Click the "Current Mode" button to toggle to DM mode
2. **Construct Spells**: Click any node in the 3D matrix to assign glyphs
3. **Create Puzzles**: Generate puzzles for your players
4. **Load Spells**: Import pre-built spell configurations
5. **Export Notes**: Save your work as Markdown

### 3D Matrix Controls

- **Rotate**: Click and drag on empty space
- **Select Node**: Click directly on a node (DM mode only)
- **Layer Tabs**: Switch between MVM, CL, and SL layers
- **Touch**: Fully supports touch gestures on mobile

## Deployment

### GitHub Pages

1. **Create Repository**: Create a new GitHub repository named `advm-console`

2. **Update Configuration**: Edit `vite.config.js` and `package.json`:
   ```javascript
   // vite.config.js
   base: '/advm-console/'  // Match your repo name
   ```

3. **Push Code**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/advm-console.git
   git push -u origin main
   ```

4. **Enable GitHub Pages**:
   - Go to repository Settings → Pages
   - Source: "GitHub Actions"
   - The workflow will automatically build and deploy on every push to `main`

5. **Access Site**: Visit `https://yourusername.github.io/advm-console/`

### Manual Deployment

```bash
# Build and deploy to GitHub Pages
npm run deploy
```

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Android 90+)

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure:
- All tests pass (`npm test`)
- Code follows existing style
- New features include tests

## Lore & Context

The ADVM system exists in a post-divine fantasy setting where the gods have died or vanished, causing magic to become unstable. The Dimensional Vector Matrix was created by High Magus Eltorin FitzEmperor and codified by Archmage Veylarin Thest as a way to impose mortal structure on fading divine arcana.

For full lore, see the [Treatise on Arcane Matrices](./docs/A-Treatise-on-Arcane-Matrices.md).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Credits

- **System Design**: Gravemind
- **Arcane Theory**: Archmage Veylarin Thest (in-universe)
- **Built With**: [Vite](https://vitejs.dev/), [Vitest](https://vitest.dev/), vanilla JavaScript

## Changelog

### Version 1.0.0 (2025-11-15)
- Initial release
- 3D matrix visualization with pointer event handling
- Dual mode system (Player/DM)
- 150+ glyphs with filtering and search
- Puzzle generation system
- Integrated treatise viewer
- GitHub Pages deployment pipeline

---

*"If we do not understand magic before it fades entirely, the world will follow."*  
— Archmage Veylarin Thest, Seventh Chair of Casterly Rock
