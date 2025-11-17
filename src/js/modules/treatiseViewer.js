/**
 * TreatiseViewer
 * Modal viewer for the ADVM treatise document
 */

import { sanitizeMarkdown } from '../utils/security.js';

export class TreatiseViewer {
  constructor() {
    this.modal = null;
    this.currentSection = null;
    this.searchIndex = null;
    this.bookmarks = this.loadBookmarks();
  }

  /**
   * Open treatise viewer
   */
  async open() {
    if (this.modal) {
      this.modal.remove();
    }
    
    this.modal = this.createModal();
    document.body.appendChild(this.modal);
    
    // Load treatise content
    await this.loadTreatise();
    
    // Animate in
    setTimeout(() => this.modal.classList.add('show'), 10);
  }

  /**
   * Close treatise viewer
   */
  close() {
    if (this.modal) {
      this.modal.classList.remove('show');
      setTimeout(() => {
        if (this.modal) {
          this.modal.remove();
          this.modal = null;
        }
      }, 300);
    }
  }

  /**
   * Create modal DOM structure
   */
  createModal() {
    const modal = document.createElement('div');
    modal.className = 'treatise-modal';
    modal.innerHTML = `
      <div class="treatise-overlay"></div>
      <div class="treatise-container">
        <div class="treatise-header">
          <h2>📖 A Treatise on Arcane Matrices</h2>
          <div class="treatise-controls">
            <input type="search" class="treatise-search" placeholder="Search treatise..." />
            <button class="treatise-bookmark-toggle" title="Toggle bookmarks">🔖</button>
            <button class="treatise-close" title="Close">×</button>
          </div>
        </div>
        
        <div class="treatise-body">
          <aside class="treatise-sidebar">
            <h3>Contents</h3>
            <nav class="treatise-toc">
              <div class="toc-loading">Loading...</div>
            </nav>
            
            <div class="treatise-bookmarks" style="display: none;">
              <h3>Bookmarks</h3>
              <div class="bookmarks-list">
                <p class="bookmarks-empty">No bookmarks yet</p>
              </div>
            </div>
          </aside>
          
          <main class="treatise-content">
            <div class="content-loading">
              <div class="loading-spinner"></div>
              <p>Loading treatise...</p>
            </div>
          </main>
        </div>
      </div>
    `;
    
    this.attachModalListeners(modal);
    return modal;
  }

  /**
   * Attach event listeners to modal
   */
  attachModalListeners(modal) {
    const overlay = modal.querySelector('.treatise-overlay');
    const closeBtn = modal.querySelector('.treatise-close');
    const searchInput = modal.querySelector('.treatise-search');
    const bookmarkToggle = modal.querySelector('.treatise-bookmark-toggle');
    
    // Close handlers
    overlay.addEventListener('click', () => this.close());
    closeBtn.addEventListener('click', () => this.close());
    
    // Search
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        this.search(e.target.value);
      }, 300);
    });
    
    // Bookmark toggle
    bookmarkToggle.addEventListener('click', () => {
      this.toggleBookmarksPanel();
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (!this.modal || !this.modal.classList.contains('show')) return;
      
      if (e.key === 'Escape') {
        this.close();
      } else if (e.key === 'f' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        searchInput.focus();
      }
    });
  }

  /**
   * Load treatise content
   */
  async loadTreatise() {
    try {
      const response = await fetch('/docs/A Treatise on Arcane Matrices.md');
      if (!response.ok) {
        throw new Error('Failed to load treatise');
      }
      
      const markdown = await response.text();
      this.renderTreatise(markdown);
    } catch (error) {
      console.error('Error loading treatise:', error);
      this.showError('Failed to load treatise. Please ensure the file exists.');
    }
  }

  /**
   * Render treatise content
   */
  renderTreatise(markdown) {
    const contentContainer = this.modal.querySelector('.treatise-content');
    const tocContainer = this.modal.querySelector('.treatise-toc');
    
    // Parse markdown (basic parsing - you may want to use a library like marked.js)
    const html = sanitizeMarkdown(markdown);
    
    // Extract table of contents
    const toc = this.extractTOC(html);
    
    // Render content
    contentContainer.innerHTML = html;
    
    // Render TOC
    tocContainer.innerHTML = toc;
    
    // Add bookmark buttons to headings
    this.addBookmarkButtons();
    
    // Attach TOC click handlers
    this.attachTOCListeners();
    
    // Build search index
    this.buildSearchIndex(markdown);
  }

  /**
   * Basic markdown to HTML parser
   * Note: For production, use a library like marked.js
   */
  parseMarkdown(markdown) {
    let html = markdown;
    
    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3 id="$1">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 id="$1">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 id="$1">$1</h1>');
    
    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Italic
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Code blocks
    html = html.replace(/```(.*?)```/gs, '<pre><code>$1</code></pre>');
    
    // Inline code
    html = html.replace(/`(.*?)`/g, '<code>$1</code>');
    
    // Lists
    html = html.replace(/^\* (.*$)/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
    
    // Paragraphs
    html = html.split('\n\n').map(para => {
      if (!para.startsWith('<')) {
        return `<p>${para}</p>`;
      }
      return para;
    }).join('\n');
    
    return html;
  }

  /**
   * Extract table of contents from HTML
   */
  extractTOC(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const headings = doc.querySelectorAll('h1, h2, h3');
    
    if (headings.length === 0) {
      return '<p class="toc-empty">No sections found</p>';
    }
    
    let toc = '<ul class="toc-list">';
    headings.forEach((heading, index) => {
      const level = heading.tagName.toLowerCase();
      const text = heading.textContent;
      const id = this.slugify(text);
      heading.id = id; // Set ID for scrolling
      
      toc += `
        <li class="toc-item toc-${level}">
          <a href="#${id}" data-section="${id}">${text}</a>
        </li>
      `;
    });
    toc += '</ul>';
    
    return toc;
  }

  /**
   * Slugify text for IDs
   */
  slugify(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  /**
   * Add bookmark buttons to headings
   */
  addBookmarkButtons() {
    const content = this.modal.querySelector('.treatise-content');
    const headings = content.querySelectorAll('h1, h2, h3');
    
    headings.forEach(heading => {
      const bookmark = document.createElement('button');
      bookmark.className = 'bookmark-btn';
      bookmark.innerHTML = '🔖';
      bookmark.title = 'Bookmark this section';
      
      if (this.bookmarks.includes(heading.id)) {
        bookmark.classList.add('active');
      }
      
      bookmark.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleBookmark(heading.id, heading.textContent);
        bookmark.classList.toggle('active');
      });
      
      heading.appendChild(bookmark);
    });
  }

  /**
   * Attach TOC click listeners
   */
  attachTOCListeners() {
    const links = this.modal.querySelectorAll('.treatise-toc a');
    links.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const section = link.dataset.section;
        this.scrollToSection(section);
        
        // Update active state
        links.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      });
    });
  }

  /**
   * Scroll to section
   */
  scrollToSection(sectionId) {
    const content = this.modal.querySelector('.treatise-content');
    const section = content.querySelector(`#${sectionId}`);
    
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      this.currentSection = sectionId;
    }
  }

  /**
   * Toggle bookmark
   */
  toggleBookmark(id, title) {
    const index = this.bookmarks.findIndex(b => b.id === id);
    
    if (index >= 0) {
      this.bookmarks.splice(index, 1);
    } else {
      this.bookmarks.push({ id, title });
    }
    
    this.saveBookmarks();
    this.updateBookmarksList();
  }

  /**
   * Toggle bookmarks panel
   */
  toggleBookmarksPanel() {
    const sidebar = this.modal.querySelector('.treatise-sidebar');
    const toc = this.modal.querySelector('.treatise-toc');
    const bookmarks = this.modal.querySelector('.treatise-bookmarks');
    
    const isShowingBookmarks = bookmarks.style.display !== 'none';
    
    if (isShowingBookmarks) {
      toc.style.display = 'block';
      bookmarks.style.display = 'none';
    } else {
      toc.style.display = 'none';
      bookmarks.style.display = 'block';
      this.updateBookmarksList();
    }
  }

  /**
   * Update bookmarks list
   */
  updateBookmarksList() {
    const list = this.modal.querySelector('.bookmarks-list');
    
    if (this.bookmarks.length === 0) {
      list.innerHTML = '<p class="bookmarks-empty">No bookmarks yet</p>';
      return;
    }
    
    let html = '<ul class="bookmarks-items">';
    this.bookmarks.forEach(bookmark => {
      html += `
        <li>
          <a href="#${bookmark.id}" data-section="${bookmark.id}">
            ${bookmark.title}
          </a>
          <button class="bookmark-remove" data-id="${bookmark.id}" title="Remove">×</button>
        </li>
      `;
    });
    html += '</ul>';
    
    list.innerHTML = html;
    
    // Attach listeners
    list.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        this.scrollToSection(link.dataset.section);
        this.toggleBookmarksPanel(); // Return to TOC
      });
    });
    
    list.querySelectorAll('.bookmark-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const bookmark = this.bookmarks.find(b => b.id === id);
        if (bookmark) {
          this.toggleBookmark(bookmark.id, bookmark.title);
        }
      });
    });
  }

  /**
   * Build search index
   */
  buildSearchIndex(text) {
    // Simple search index - split into words
    this.searchIndex = text.toLowerCase().split(/\s+/);
  }

  /**
   * Search treatise
   */
  search(query) {
    if (!query || query.length < 2) {
      this.clearSearch();
      return;
    }
    
    const content = this.modal.querySelector('.treatise-content');
    const text = content.textContent.toLowerCase();
    const queryLower = query.toLowerCase();
    
    // Find all matches
    const matches = [];
    let index = text.indexOf(queryLower);
    while (index >= 0) {
      matches.push(index);
      index = text.indexOf(queryLower, index + 1);
    }
    
    // Highlight matches
    this.highlightMatches(query, matches);
    
    // Show results count
    this.showSearchResults(matches.length);
  }

  /**
   * Highlight search matches
   */
  highlightMatches(query, matches) {
    const content = this.modal.querySelector('.treatise-content');
    const html = content.innerHTML;
    
    // Remove existing highlights
    const cleaned = html.replace(/<mark class="search-highlight">|<\/mark>/g, '');
    
    if (matches.length === 0) {
      content.innerHTML = cleaned;
      return;
    }
    
    // Add new highlights
    const regex = new RegExp(`(${query})`, 'gi');
    const highlighted = cleaned.replace(regex, '<mark class="search-highlight">$1</mark>');
    content.innerHTML = highlighted;
    
    // Scroll to first match
    const firstMatch = content.querySelector('.search-highlight');
    if (firstMatch) {
      firstMatch.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  /**
   * Show search results count
   */
  showSearchResults(count) {
    let indicator = this.modal.querySelector('.search-results-indicator');
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.className = 'search-results-indicator';
      this.modal.querySelector('.treatise-header').appendChild(indicator);
    }
    
    if (count > 0) {
      indicator.textContent = `${count} result${count !== 1 ? 's' : ''}`;
      indicator.style.display = 'block';
    } else {
      indicator.textContent = 'No results found';
      indicator.style.display = 'block';
    }
  }

  /**
   * Clear search
   */
  clearSearch() {
    const content = this.modal.querySelector('.treatise-content');
    const html = content.innerHTML;
    content.innerHTML = html.replace(/<mark class="search-highlight">|<\/mark>/g, '');
    
    const indicator = this.modal.querySelector('.search-results-indicator');
    if (indicator) {
      indicator.style.display = 'none';
    }
  }

  /**
   * Show error message
   */
  showError(message) {
    const content = this.modal.querySelector('.treatise-content');
    content.innerHTML = `
      <div class="error-message">
        <p>⚠️ ${message}</p>
      </div>
    `;
  }

  /**
   * Save bookmarks to localStorage
   */
  saveBookmarks() {
    localStorage.setItem('advmBookmarks', JSON.stringify(this.bookmarks));
  }

  /**
   * Load bookmarks from localStorage
   */
  loadBookmarks() {
    try {
      const saved = localStorage.getItem('advmBookmarks');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      return [];
    }
  }
}
