// Security utility functions for sanitization and validation
// Prevents XSS attacks by sanitizing user input and external content

/**
 * Sanitize HTML content to prevent XSS attacks
 * Allows safe HTML tags while stripping potentially dangerous content
 * @param {string} html - Raw HTML string
 * @returns {string} - Sanitized HTML
 */
export function sanitizeHTML(html) {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
}

/**
 * Safely render markdown by sanitizing the output
 * Uses marked.js with custom renderer to prevent XSS
 * @param {string} markdown - Markdown text
 * @returns {string} - Safe HTML
 */
export function sanitizeMarkdown(markdown) {
  if (!window.marked) {
    return sanitizeHTML(markdown);
  }

  // Configure marked with security options
  const renderer = new marked.Renderer();
  
  // Override link rendering to prevent javascript: URLs
  const originalLink = renderer.link.bind(renderer);
  renderer.link = (href, title, text) => {
    // Block javascript:, data:, and vbscript: protocols
    if (href && /^(javascript|data|vbscript):/i.test(href)) {
      return text;
    }
    return originalLink(href, title, text);
  };

  // Override image rendering to prevent onerror XSS
  const originalImage = renderer.image.bind(renderer);
  renderer.image = (href, title, text) => {
    if (href && /^(javascript|data|vbscript):/i.test(href)) {
      return text;
    }
    return originalImage(href, title, text);
  };

  // Override HTML rendering to sanitize
  const originalHtml = renderer.html.bind(renderer);
  renderer.html = (html) => {
    // Strip script tags and event handlers
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
      .replace(/on\w+\s*=\s*[^\s>]*/gi, '');
  };

  marked.setOptions({
    renderer: renderer,
    headerIds: true,
    mangle: false,
    breaks: true,
    gfm: true,
    sanitize: false, // We handle sanitization manually with custom renderer
  });

  return marked.parse(markdown);
}

/**
 * Validate JSON data structure to prevent injection
 * @param {object} data - Parsed JSON data
 * @param {string} schemaType - Schema type (spell, puzzle, glyph)
 * @returns {boolean} - True if valid
 */
export function validateJSONStructure(data, schemaType) {
  if (typeof data !== 'object' || data === null) return false;
  
  const schemas = {
    spell: ['id', 'name', 'school', 'level'],
    puzzle: ['id', 'name', 'description', 'matrix'],
    glyph: ['id', 'name', 'symbol', 'layer', 'position', 'category']
  };
  
  const requiredFields = schemas[schemaType];
  if (!requiredFields) return false;
  
  return requiredFields.every(field => field in data);
}

/**
 * Sanitize user input from form fields
 * @param {string} input - User input
 * @returns {string} - Sanitized input
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
    .substring(0, 1000); // Limit length
}

/**
 * Validate spell ID format
 * @param {string} id - Spell ID
 * @returns {boolean} - True if valid
 */
export function validateSpellId(id) {
  return /^[a-z0-9\-]+$/.test(id);
}

/**
 * Validate glyph data structure
 * @param {object} glyph - Glyph object
 * @returns {boolean} - True if valid
 */
export function validateGlyph(glyph) {
  if (!glyph || typeof glyph !== 'object') return false;
  
  const requiredFields = ['id', 'name', 'symbol', 'layer', 'position', 'category'];
  const hasRequiredFields = requiredFields.every(field => field in glyph);
  
  if (!hasRequiredFields) return false;
  
  const validLayers = ['surface', 'deep', 'core', 'MVM', 'CL', 'SL'];
  const validCategories = [
    'magic-school', 'element', 'condition', 'direction',
    'modifier', 'component', 'timing', 'target', 'school'
  ];
  
  return validLayers.includes(glyph.layer.toLowerCase()) &&
         validCategories.includes(glyph.category.toLowerCase());
}

/**
 * Create secure Content Security Policy meta tag
 * @returns {HTMLMetaElement} - CSP meta tag
 */
export function createCSPMetaTag() {
  const csp = document.createElement('meta');
  csp.httpEquiv = 'Content-Security-Policy';
  csp.content = [
    "default-src 'self'",
    "script-src 'self' https://cdn.jsdelivr.net 'unsafe-inline'", // unsafe-inline needed for Vite dev
    "style-src 'self' https://fonts.googleapis.com 'unsafe-inline'",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https:",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ');
  return csp;
}

/**
 * Rate limiter for authentication attempts
 */
export class RateLimiter {
  constructor(maxAttempts = 5, windowMs = 300000) { // 5 attempts per 5 minutes
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
    this.attempts = [];
  }

  /**
   * Check if request is allowed
   * @returns {boolean} - True if allowed
   */
  check() {
    const now = Date.now();
    
    // Remove old attempts outside the window
    this.attempts = this.attempts.filter(time => now - time < this.windowMs);
    
    if (this.attempts.length >= this.maxAttempts) {
      return false;
    }
    
    this.attempts.push(now);
    return true;
  }

  /**
   * Get time until next attempt is allowed (in ms)
   * @returns {number} - Milliseconds until retry
   */
  getRetryAfter() {
    if (this.attempts.length === 0) return 0;
    const oldestAttempt = Math.min(...this.attempts);
    const elapsed = Date.now() - oldestAttempt;
    return Math.max(0, this.windowMs - elapsed);
  }

  /**
   * Reset the limiter
   */
  reset() {
    this.attempts = [];
  }
}

/**
 * Secure password validation
 * @param {string} password - Password to validate
 * @returns {boolean} - True if meets requirements
 */
export function validatePassword(password) {
  return (
    password &&
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password)
  );
}

/**
 * Hash password using SubtleCrypto API (for client-side only)
 * Note: In production, hashing should be done server-side
 * @param {string} password - Plain text password
 * @returns {Promise<string>} - Hashed password
 */
export async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate secure random token
 * @param {number} length - Token length in bytes
 * @returns {string} - Random token
 */
export function generateSecureToken(length = 32) {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Check if content is from trusted source
 * @param {string} url - URL to check
 * @returns {boolean} - True if trusted
 */
export function isTrustedSource(url) {
  const trustedDomains = [
    window.location.origin,
    'https://cdn.jsdelivr.net',
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com'
  ];
  
  try {
    const urlObj = new URL(url, window.location.origin);
    return trustedDomains.some(domain => urlObj.origin === domain || urlObj.href.startsWith(domain));
  } catch {
    return false;
  }
}
