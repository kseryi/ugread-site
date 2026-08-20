/* =============================================================================
   LIST OF AVAILABLE INTERFACE LANGUAGES
   Add a new language by:
     1) creating lang/<code>.js that fills window.APP_I18N.<code> = {...}
     2) registering it in the array below
     3) adding a <script src="lang/<code>.js"> tag in index.html (before app.js)
   ============================================================================= */

// Global dictionary namespace — each lang/<code>.js file adds its own key.
window.APP_I18N = window.APP_I18N || {};

// Ordered list of languages shown in the language switcher.
window.APP_LANGUAGES = [
  { code: 'uk', label: 'Українська', short: 'UA' },
  { code: 'en', label: 'English',   short: 'EN' },
];

// Language used if the saved/browser language isn't available.
window.APP_DEFAULT_LANGUAGE = 'uk';
